#!/usr/bin/env python3
"""Validate skill metadata; --strict adds portable conventions, --links checks entrypoint links."""
import argparse
import json
import re
import shutil
import subprocess
from pathlib import Path
from urllib.parse import unquote, urlsplit


def load_frontmatter(text):
    try:
        import yaml
    except ImportError:
        ruby = shutil.which('ruby')
        if not ruby:
            raise ValueError('YAML parsing needs PyYAML or Ruby with Psych; neither is available. Use a configured runtime with one of them.')
        script = 'require "date"; require "psych"; require "json"; print JSON.generate(Psych.safe_load(STDIN.read, permitted_classes: [Date], aliases: true))'
        result = subprocess.run([ruby, '-e', script], input=text, text=True, capture_output=True, timeout=15)
        if result.returncode:
            raise ValueError('Invalid YAML: ' + result.stderr.strip())
        return json.loads(result.stdout)
    try:
        return yaml.safe_load(text)
    except yaml.YAMLError as exc:
        raise ValueError('Invalid YAML: ' + str(exc)) from exc


def prose_lines(text):
    marker, length = None, 0
    for number, line in enumerate(text.splitlines(), 1):
        fence = re.match(r'^[ \t]*(?:(?:[-+*]|\d+[.)])[ \t]+)?(`{3,}|~{3,})(.*)$', line)
        if fence:
            fence_text = fence.group(1)
            if marker is None:
                marker, length = fence_text[0], len(fence_text)
            elif fence_text[0] == marker and len(fence_text) >= length and not fence.group(2).strip():
                marker, length = None, 0
            continue
        if marker is None:
            yield number, line


def missing_links(skill_md, content):
    missing = []
    for number, line in prose_lines(content):
        for match in re.finditer(r'!?\[[^\]\n]*\]\((<[^>]+>|[^\s)]+)(?:\s+"[^"]*")?\)', line):
            target = match.group(1).strip('<>')
            url = urlsplit(target)
            if url.scheme or url.netloc or target.startswith(('#', '/')):
                continue
            path = unquote(url.path)
            if path and not (skill_md.parent / path).exists():
                missing.append(f'{number}: {target}')
    return missing


def validate_skill(skill_path, strict=False, check_links=False):
    skill_md = Path(skill_path) / 'SKILL.md'
    if not skill_md.is_file():
        return False, 'SKILL.md not found'
    try:
        content = skill_md.read_text(encoding='utf-8')
    except (OSError, UnicodeError) as exc:
        return False, f'Cannot read SKILL.md: {exc}'
    match = re.match(r'^---\r?\n(.*?)\r?\n---(?:\r?\n|$)', content, re.S)
    if not match:
        return False, 'Invalid or missing YAML frontmatter'
    try:
        data = load_frontmatter(match.group(1))
    except (ValueError, OSError, subprocess.TimeoutExpired) as exc:
        return False, str(exc)
    if not isinstance(data, dict):
        return False, 'Frontmatter must be a YAML dictionary'
    if any(not isinstance(key, str) for key in data):
        return False, 'Frontmatter keys must be strings'
    for field in ('name', 'description'):
        if not isinstance(data.get(field), str) or not data[field].strip():
            return False, f'{field} must be a non-empty string'
    name, description = data['name'], data['description']
    if name != name.strip() or len(name) > 64 or not re.fullmatch(r'[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*', name):
        return False, 'Name must be 1–64 letters/digits with optional single internal hyphens'
    if len(description.strip()) > 1024 or '<' in description or '>' in description:
        return False, 'Description must be at most 1024 characters and contain no angle brackets'
    if description.strip().startswith('[TODO:'):
        return False, 'Description contains an unfinished TODO placeholder'
    for key in ('disable-model-invocation', 'user-invokable'):
        if key in data and not isinstance(data[key], bool):
            return False, f'{key} must be a boolean'
    if 'metadata' in data and not isinstance(data['metadata'], dict):
        return False, 'metadata must be a mapping'
    if 'argument-hint' in data and not isinstance(data['argument-hint'], str):
        return False, 'argument-hint must be a string'
    portable = {'name', 'description', 'license', 'allowed-tools', 'metadata'}
    host = {'argument-hint', 'user-invokable', 'disable-model-invocation'}
    unknown = set(data) - portable - host
    warnings = []
    if name != name.lower():
        warnings.append('name uses host-compatible case; portable convention is lowercase')
    if unknown:
        warnings.append('unrecognized host metadata: ' + ', '.join(sorted(unknown)))
    if strict and (name != name.lower() or set(data) - portable):
        return False, 'Strict portable mode requires lowercase names and portable frontmatter fields'
    for _, line in prose_lines(content[match.end():]):
        if re.fullmatch(r'[ ]{0,3}\[TODO:[^\n]*\][ \t]*', line):
            return False, 'Skill instructions contain an unfinished TODO placeholder'
    if check_links:
        missing = missing_links(skill_md, content)
        if missing:
            return False, 'Missing local Markdown links: ' + '; '.join(missing)
    suffix = (' Warnings: ' + '; '.join(warnings)) if warnings else ''
    return True, 'Skill is valid.' + suffix


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('skill_directory')
    parser.add_argument('--strict', action='store_true', help='Enforce portable metadata/naming conventions')
    parser.add_argument('--links', action='store_true', help='Check relative Markdown links outside code fences')
    args = parser.parse_args()
    valid, message = validate_skill(args.skill_directory, args.strict, args.links)
    print(message)
    raise SystemExit(0 if valid else 1)
