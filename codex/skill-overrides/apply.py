#!/usr/bin/env python3
"""Check, apply, or verify version-pinned Codex skill customizations."""
import argparse
from datetime import datetime, timezone
import hashlib
import json
import os
from pathlib import Path
import shutil
import stat
import tempfile


def digest(data):
    return hashlib.sha256(data).hexdigest()


def contained(root, relative):
    candidate = Path(relative)
    if candidate.is_absolute() or '..' in candidate.parts:
        raise ValueError(f'Unsafe relative path: {relative}')
    result = root / candidate
    if not result.resolve().is_relative_to(root.resolve()):
        raise ValueError(f'Path escapes root: {relative}')
    return result


def plan(manifest_path, codex_home):
    package = manifest_path.parent.resolve()
    root = codex_home.resolve()
    manifest = json.loads(manifest_path.read_text())
    if manifest.get('version') != 1 or not isinstance(manifest.get('files'), list):
        raise ValueError('Unsupported manifest format')
    jobs, errors, seen = [], [], set()
    for directory, expected in manifest.get('plugin_versions', {}).items():
        parent = contained(root, directory)
        actual = sorted(p.name for p in parent.iterdir() if p.is_dir() and p.name[:1].isdigit()) if parent.is_dir() else []
        if actual != sorted(expected):
            errors.append(f'{directory}: cached versions changed from {expected} to {actual}; verify the active skill catalog and rebase before applying')
    for entry in manifest['files']:
        try:
            target = contained(root, entry['target'])
            source = contained(package, entry['source'])
            anchor = contained(root, entry['installation_root'])
            if entry['target'] in seen:
                raise ValueError('Duplicate target')
            seen.add(entry['target'])
            if not anchor.is_dir() or (entry.get('requires_skill', True) and not (anchor / 'SKILL.md').is_file()):
                raise ValueError('Installation is absent; install the named version before applying overrides')
            if target.is_symlink() or (target.exists() and not target.is_file()):
                raise ValueError('Target must be a regular file, not a symlink or directory')
            desired = source.read_bytes()
            if digest(desired) != entry['applied_sha256']:
                raise ValueError('Payload hash differs from manifest; review and update it before applying')
            old = target.read_bytes() if target.exists() else None
            current_hash = digest(old) if old is not None else None
            if current_hash == entry['applied_sha256']:
                status = 'applied'
            elif current_hash == entry['base_sha256'] or (current_hash is not None and current_hash in entry.get('previous_applied_sha256', [])):
                status = 'ready'
            else:
                raise ValueError('Installed content changed; rebase the customization instead of overwriting it')
            jobs.append(dict(entry=entry, target=target, desired=desired, old=old, status=status,
                             mode=stat.S_IMODE(target.stat().st_mode) if old is not None else entry.get('mode', 0o644)))
        except (KeyError, OSError, ValueError) as exc:
            errors.append(f"{entry.get('target', '?')}: {exc}")
    if errors:
        raise ValueError('Preflight failed; nothing written:\n' + '\n'.join(errors))
    return jobs


def atomic_write(target, data, mode):
    target.parent.mkdir(parents=True, exist_ok=True)
    fd, temporary = tempfile.mkstemp(prefix='.skill-override-', dir=target.parent)
    try:
        with os.fdopen(fd, 'wb') as handle:
            handle.write(data)
            handle.flush()
            os.fsync(handle.fileno())
            os.fchmod(handle.fileno(), mode)
        os.replace(temporary, target)
    finally:
        if os.path.exists(temporary):
            os.unlink(temporary)


def apply(jobs, codex_home):
    pending = [job for job in jobs if job['status'] == 'ready']
    if not pending:
        return None
    # Recheck the entire batch immediately before any backup or target mutation.
    for job in jobs:
        target = job['target']
        current = target.read_bytes() if target.exists() else None
        if target.is_symlink() or current != job['old']:
            raise ValueError(f"Changed since preflight: {target}; nothing written")
    stamp = datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%S.%fZ')
    backup = codex_home / 'skill-override-backups' / stamp
    backup.mkdir(parents=True, exist_ok=False)
    (backup / 'manifest.json').write_text(json.dumps({'new_files': [j['entry']['target'] for j in pending if j['old'] is None]}, indent=2)+'\n')
    for job in pending:
        if job['old'] is not None:
            destination = backup / job['entry']['target']
            destination.parent.mkdir(parents=True, exist_ok=True)
            destination.write_bytes(job['old'])
            destination.chmod(job['mode'])
    completed = []
    try:
        for job in pending:
            atomic_write(job['target'], job['desired'], job['mode'])
            completed.append(job)
            if job['target'].read_bytes() != job['desired']:
                raise OSError(f"Verification failed: {job['target']}")
    except Exception:
        for job in reversed(completed):
            if job['old'] is None:
                job['target'].unlink()
            else:
                atomic_write(job['target'], job['old'], job['mode'])
        raise
    return backup


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('operation', choices=['check', 'apply', 'verify'])
    parser.add_argument('--manifest', type=Path, default=Path(__file__).with_name('manifest.json'))
    parser.add_argument('--codex-home', type=Path, default=Path(os.environ.get('CODEX_HOME', Path.home()/'.codex')))
    args = parser.parse_args()
    try:
        jobs = plan(args.manifest, args.codex_home)
        retirement = None
        retirement_path = args.manifest.with_name('retired.json')
        if retirement_path.exists():
            import retire
            retirement = retire.plan(retirement_path, args.codex_home)
        ready = sum(job['status'] == 'ready' for job in jobs)
        if args.operation == 'verify' and ready:
            raise ValueError(f'{ready} files are not applied')
        if args.operation == 'verify' and retirement and retire.pending(retirement):
            raise ValueError('Skill retirements or disabled-skill settings are not applied')
        backup = apply(jobs, args.codex_home) if args.operation == 'apply' else None
        retired_archive = retire.apply(retirement) if args.operation == 'apply' and retirement else None
        applied_count = len(jobs) if args.operation == 'apply' else len(jobs)-ready
        print(f'{len(jobs)} files checked; {applied_count} applied; {0 if args.operation == "apply" else ready} ready.')
        if backup:
            print(f'Previous content backed up to {backup}')
        if retirement:
            print(f"Skill retirement directories: {len(retirement['jobs'])}; settings {'applied' if args.operation == 'apply' or not retire.pending(retirement) else 'ready'}.")
        if retired_archive:
            print(f'Removed skill directories archived at {retired_archive}')
        return 0
    except (ValueError, OSError, json.JSONDecodeError) as exc:
        print(str(exc))
        return 1


if __name__ == '__main__':
    raise SystemExit(main())
