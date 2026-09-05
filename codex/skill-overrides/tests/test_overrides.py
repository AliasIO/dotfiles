import importlib.util
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from unittest import mock

ROOT = Path(__file__).resolve().parents[1]


def module(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    result = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(result)
    return result


installer = module('skill_override_apply', ROOT/'apply.py')
validator = module('skill_quick_validate', ROOT/'payloads/system/skill-creator/scripts/quick_validate.py')


class ValidatorTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.folder = Path(self.temp.name)

    def write(self, metadata='name: example\ndescription: Useful test skill', body='# Instructions\nDo the work.'):
        (self.folder/'SKILL.md').write_text('---\n'+metadata+'\n---\n'+body+'\n')

    def test_normal_skill(self):
        self.write()
        self.assertTrue(validator.validate_skill(self.folder)[0])

    def test_empty_fields_rejected(self):
        for metadata in ['name: ""\ndescription: valid', 'name: valid\ndescription: "   "', 'name: valid\ndescription: null']:
            with self.subTest(metadata=metadata):
                self.write(metadata)
                self.assertFalse(validator.validate_skill(self.folder)[0])

    def test_invalid_yaml_and_root_rejected(self):
        for metadata in ['name: [', '- not-a-map', 'name: valid\ndescription: true']:
            with self.subTest(metadata=metadata):
                self.write(metadata)
                self.assertFalse(validator.validate_skill(self.folder)[0])

    def test_host_compatibility_is_separate_from_portability(self):
        self.write('name: Presentations\ndescription: Build a deck\nuser-invokable: true\nargument-hint: filename')
        self.assertTrue(validator.validate_skill(self.folder)[0])
        self.assertFalse(validator.validate_skill(self.folder, strict=True)[0])

    def test_boolean_metadata_type_checked(self):
        self.write('name: valid\ndescription: useful\nuser-invokable: "false"')
        self.assertFalse(validator.validate_skill(self.folder)[0])

    def test_missing_link_and_reference_pass(self):
        self.write(body='Read [guide](references/guide.md).')
        self.assertFalse(validator.validate_skill(self.folder, check_links=True)[0])
        (self.folder/'references').mkdir()
        (self.folder/'references/guide.md').write_text('# Guide')
        self.assertTrue(validator.validate_skill(self.folder, check_links=True)[0])

    def test_code_examples_and_remote_links_are_not_file_dependencies(self):
        self.write(body='```md\n[Example](missing.md)\n[TODO: scaffold example]\n```\n[Web](https://example.org)\n[Anchor](#instructions)')
        self.assertTrue(validator.validate_skill(self.folder, check_links=True)[0])

    def test_real_placeholder_rejected(self):
        self.write(body='[TODO: write instructions]')
        self.assertFalse(validator.validate_skill(self.folder)[0])

    def test_runs_without_site_packages(self):
        self.write()
        result = subprocess.run([sys.executable, '-S', str(ROOT/'payloads/system/skill-creator/scripts/quick_validate.py'), str(self.folder)], capture_output=True, text=True)
        self.assertEqual(result.returncode, 0, result.stdout+result.stderr)


class InstallerTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.home = self.root/'codex'
        self.package = self.root/'package'
        self.package.mkdir()
        (self.home/'skills/example').mkdir(parents=True)
        (self.home/'skills/example/SKILL.md').write_bytes(b'old')
        (self.home/'skills/example/SKILL.md').chmod(0o640)
        self.entries = []
        self.add('SKILL.md', b'old', b'new')
        self.manifest = self.package/'manifest.json'
        self.save()

    def add(self, name, old, new):
        (self.package/name).parent.mkdir(parents=True, exist_ok=True)
        (self.package/name).write_bytes(new)
        self.entries.append({'target':'skills/example/'+name, 'source':name, 'installation_root':'skills/example', 'base_sha256':installer.digest(old) if old is not None else None, 'applied_sha256':installer.digest(new)})

    def save(self):
        self.manifest.write_text(json.dumps({'version':1,'files':self.entries}))

    def test_apply_backup_mode_and_idempotency(self):
        jobs = installer.plan(self.manifest, self.home)
        backup = installer.apply(jobs, self.home)
        target = self.home/'skills/example/SKILL.md'
        self.assertEqual(target.read_bytes(), b'new')
        self.assertEqual(target.stat().st_mode & 0o777, 0o640)
        self.assertEqual((backup/'skills/example/SKILL.md').read_bytes(), b'old')
        self.assertIsNone(installer.apply(installer.plan(self.manifest, self.home), self.home))

    def test_drift_prevents_entire_batch(self):
        self.add('guide.md', b'expected', b'revised')
        (self.home/'skills/example/guide.md').write_bytes(b'user edit')
        self.save()
        with self.assertRaises(ValueError):
            installer.plan(self.manifest, self.home)
        self.assertEqual((self.home/'skills/example/SKILL.md').read_bytes(), b'old')
        self.assertFalse((self.home/'skill-override-backups').exists())

    def test_new_reference_and_collision(self):
        self.add('references/new.md', None, b'reference')
        self.save()
        installer.apply(installer.plan(self.manifest, self.home), self.home)
        target = self.home/'skills/example/references/new.md'
        self.assertEqual(target.read_bytes(), b'reference')
        target.write_bytes(b'other content')
        with self.assertRaises(ValueError):
            installer.plan(self.manifest, self.home)

    def test_missing_plugin_not_recreated(self):
        (self.home/'skills/example/SKILL.md').unlink()
        with self.assertRaises(ValueError):
            installer.plan(self.manifest, self.home)

    def test_payload_tampering_rejected(self):
        (self.package/'SKILL.md').write_bytes(b'unreviewed')
        with self.assertRaises(ValueError):
            installer.plan(self.manifest, self.home)

    def test_path_escape_and_duplicate_rejected(self):
        for update in [{'target':'../outside'}, {'source':'../outside'}]:
            with self.subTest(update=update):
                old = self.entries[0].copy()
                self.entries[0].update(update)
                self.save()
                with self.assertRaises(ValueError): installer.plan(self.manifest, self.home)
                self.entries[0] = old
        self.entries.append(self.entries[0].copy())
        self.save()
        with self.assertRaises(ValueError): installer.plan(self.manifest, self.home)

    def test_symlink_target_rejected(self):
        target = self.home/'skills/example/SKILL.md'
        target.unlink()
        outside = self.root/'outside'
        outside.write_bytes(b'old')
        target.symlink_to(outside)
        with self.assertRaises(ValueError): installer.plan(self.manifest, self.home)
        self.assertEqual(outside.read_bytes(), b'old')

    def test_post_preflight_change_rejected(self):
        jobs = installer.plan(self.manifest, self.home)
        (self.home/'skills/example/SKILL.md').write_bytes(b'concurrent change')
        with self.assertRaises(ValueError): installer.apply(jobs, self.home)
        self.assertEqual((self.home/'skills/example/SKILL.md').read_bytes(), b'concurrent change')

    def test_known_previous_customization_can_upgrade(self):
        target = self.home/'skills/example/SKILL.md'
        target.write_bytes(b'previous customization')
        self.entries[0]['previous_applied_sha256'] = [installer.digest(b'previous customization')]
        self.save()
        installer.apply(installer.plan(self.manifest, self.home), self.home)
        self.assertEqual(target.read_bytes(), b'new')

    def test_new_plugin_cache_version_requires_review(self):
        cache = self.home/'plugins/cache/provider/example'
        (cache/'1.0.0').mkdir(parents=True)
        data = json.loads(self.manifest.read_text())
        data['plugin_versions'] = {'plugins/cache/provider/example': ['1.0.0']}
        self.manifest.write_text(json.dumps(data))
        self.assertEqual(len(installer.plan(self.manifest, self.home)), 1)
        (cache/'2.0.0').mkdir()
        with self.assertRaises(ValueError): installer.plan(self.manifest, self.home)
        self.assertEqual((self.home/'skills/example/SKILL.md').read_bytes(), b'old')

    def test_write_failure_rolls_back_earlier_files(self):
        self.add('second.md', None, b'second')
        self.save()
        real_write = installer.atomic_write
        def fail_second(target, data, mode):
            if target.name == 'second.md': raise OSError('simulated disk error')
            return real_write(target, data, mode)
        with mock.patch.object(installer, 'atomic_write', side_effect=fail_second):
            with self.assertRaises(OSError): installer.apply(installer.plan(self.manifest, self.home), self.home)
        self.assertEqual((self.home/'skills/example/SKILL.md').read_bytes(), b'old')
        self.assertFalse((self.home/'skills/example/second.md').exists())


if __name__ == '__main__':
    unittest.main()
