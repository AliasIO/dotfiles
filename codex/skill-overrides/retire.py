#!/usr/bin/env python3
"""Retire explicitly selected skills while preserving plugin connectors and other settings."""
from datetime import datetime, timezone
import hashlib
import json
import os
from pathlib import Path
import re
import tempfile
import tomllib

START = '# BEGIN managed Codex skill retirements'
END = '# END managed Codex skill retirements'


def inside(root, relative):
    p = Path(relative)
    if p.is_absolute() or '..' in p.parts:
        raise ValueError(f'Unsafe retirement path: {relative}')
    target = root/p
    if not target.resolve().is_relative_to(root.resolve()):
        raise ValueError(f'Retirement escapes Codex home: {relative}')
    return target


def tree_digest(folder):
    data = []
    for p in sorted(folder.rglob('*')):
        name = str(p.relative_to(folder))
        if p.is_symlink():
            data.append([name, 'symlink', os.readlink(p)])
        elif p.is_file():
            data.append([name, 'file', hashlib.sha256(p.read_bytes()).hexdigest()])
        elif p.is_dir():
            data.append([name, 'directory'])
        else:
            raise ValueError(f'Unsupported special file in skill: {p}')
    return hashlib.sha256(json.dumps(data).encode()).hexdigest()


def without_skill_config(data):
    result = dict(data)
    if 'skills' in result:
        remaining = {k:v for k,v in result['skills'].items() if k != 'config'}
        if remaining: result['skills'] = remaining
        else: result.pop('skills')
    return result


def render_config(original, paths):
    text = original.decode('utf-8')
    before = tomllib.loads(text)
    if text.count(START) != text.count(END) or text.count(START) > 1:
        raise ValueError('Malformed managed skill-retirement block')
    old_paths = []
    if START in text:
        a, b = text.index(START), text.index(END)
        if b < a: raise ValueError('Malformed managed skill-retirement block order')
        block = text[a:b]
        old_paths = [e['path'] for e in tomllib.loads(block).get('skills',{}).get('config',[])]
        text = text[:a] + text[b+len(END):]
    base = tomllib.loads(text)
    entries = base.get('skills',{}).get('config',[])
    if not isinstance(entries,list): raise ValueError('skills.config must be an array')
    # Resolve aliases such as /var and /private/var before comparing paths.
    canonical = lambda path: str(Path(path).expanduser().resolve())
    targets = sorted({canonical(path) for path in [*paths, *old_paths]})
    # Do not alter or silently override unrelated user settings.
    for entry in entries:
        if entry.get('path') and canonical(entry['path']) in targets and entry.get('enabled') is not False:
            raise ValueError(f"Conflicting existing enablement for retired skill: {entry.get('path')}")
    existing_disabled = {canonical(e['path']) for e in entries if e.get('path') and e.get('enabled') is False}
    block = [START]
    for target in targets:
        if target in existing_disabled: continue
        block.extend(['[[skills.config]]', 'path = '+json.dumps(target), 'enabled = false', ''])
    block.append(END)
    rendered = text.rstrip()+'\n\n'+'\n'.join(block)+'\n'
    after = tomllib.loads(rendered)
    if without_skill_config(before) != without_skill_config(after):
        raise ValueError('Retirement would alter unrelated settings')
    if after.get('skills',{}).get('config',[])[:len(entries)] != entries:
        raise ValueError('Retirement would alter existing skill settings')
    return rendered.encode()


def plan(manifest_path, codex_home):
    root = codex_home.resolve()
    data = json.loads(manifest_path.read_text())
    if data.get('version') != 1: raise ValueError('Unsupported retirement manifest')
    jobs, config_paths, seen = [], [], set()
    for item in data['skills']:
        exact = inside(root, item['path'])
        pattern = item['pattern']
        parts = Path(pattern).parts
        if Path(pattern).is_absolute() or '..' in parts or '**' in parts:
            raise ValueError(f'Unsafe retirement pattern: {pattern}')
        if '*' in pattern and (len(parts) != 7 or parts[:2] != ('plugins','cache') or parts[4] != '*' or parts[5] != 'skills' or any('*' in part for i,part in enumerate(parts) if i != 4)):
            raise ValueError(f'Retirement wildcard must select one plugin version: {pattern}')
        config_paths.append(str(exact/'SKILL.md'))
        for target in sorted(set([exact,*root.glob(pattern)])):
            inside(root,str(target.relative_to(root)))
            config_paths.append(str(target/'SKILL.md'))
            if not target.exists() and not target.is_symlink(): continue
            if target.is_symlink() or not target.is_dir() or not (target/'SKILL.md').is_file():
                raise ValueError(f'Retirement requires a regular skill directory: {target}')
            if target in seen: raise ValueError(f'Duplicate retirement: {target}')
            seen.add(target)
            replacement = item.get('replacement')
            if replacement and not (target.parent/replacement/'SKILL.md').is_file():
                raise ValueError(f'Replacement skill is absent: {replacement}')
            jobs.append({'target':target,'relative':str(target.relative_to(root)),'digest':tree_digest(target),'name':item['name']})
    config = root/'config.toml'
    if config.is_symlink() or (config.exists() and not config.is_file()):
        raise ValueError('Codex config must be a regular file for this managed update')
    old = config.read_bytes() if config.exists() else b''
    return {'jobs':jobs,'config':config,'old_config':old,'new_config':render_config(old,config_paths),'root':root}


def atomic_write(target, content, mode=0o600):
    target.parent.mkdir(parents=True,exist_ok=True)
    fd, name = tempfile.mkstemp(prefix='.skill-retirement-',dir=target.parent)
    try:
        with os.fdopen(fd,'wb') as handle:
            handle.write(content);handle.flush();os.fsync(handle.fileno());os.fchmod(handle.fileno(),mode)
        os.replace(name,target)
    finally:
        if os.path.exists(name):os.unlink(name)


def pending(prepared):
    return bool(prepared['jobs'] or prepared['old_config'] != prepared['new_config'])


def apply(prepared):
    if not pending(prepared): return None
    config = prepared['config']
    current = config.read_bytes() if config.exists() else b''
    if current != prepared['old_config'] or config.is_symlink():
        raise ValueError('Codex settings changed since preflight; no skills retired')
    for job in prepared['jobs']:
        if job['target'].is_symlink() or tree_digest(job['target']) != job['digest']:
            raise ValueError(f"Skill changed since preflight: {job['target']}")
    stamp = datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%S.%fZ')
    archive = prepared['root']/'retired-skills'/stamp
    archive.mkdir(parents=True,exist_ok=False)
    atomic_write(archive/'config.toml.before',prepared['old_config'])
    moved = []
    try:
        for job in prepared['jobs']:
            destination = archive/job['relative']
            destination.parent.mkdir(parents=True,exist_ok=True)
            job['target'].rename(destination)
            moved.append((job['target'],destination))
        current = config.read_bytes() if config.exists() else b''
        if current != prepared['old_config'] or config.is_symlink():
            raise ValueError('Codex settings changed during retirement; restoring skill directories')
        atomic_write(config,prepared['new_config'],config.stat().st_mode & 0o777 if config.exists() else 0o600)
    except Exception:
        for target,destination in reversed(moved):
            if target.exists():raise RuntimeError(f'Cannot restore over a new path; archive retained at {archive}')
            destination.rename(target)
        raise
    atomic_write(archive/'manifest.json',json.dumps({'skills':[{'name':j['name'],'path':j['relative'],'digest':j['digest']} for j in prepared['jobs']]},indent=2).encode()+b'\n')
    return archive
