import importlib.util
import json
from pathlib import Path
import tempfile
import tomllib
import unittest
from unittest import mock

ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('retire',ROOT/'retire.py')
retire=importlib.util.module_from_spec(spec);spec.loader.exec_module(retire)

class RetirementTests(unittest.TestCase):
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory();self.addCleanup(self.temp.cleanup)
        self.root=Path(self.temp.name).resolve();self.home=self.root/'codex';self.home.mkdir()
        self.old=self.home/'skills/old';self.new=self.home/'skills/combined'
        for p in [self.old,self.new]:
            p.mkdir(parents=True);(p/'SKILL.md').write_text('# Skill\n')
        self.config=self.home/'config.toml'
        self.initial=b'model = "keep-model"\n\n[plugins."stripe@example"]\nenabled = true\n\n[skills]\nmax_context_tokens = 5000\n'
        self.config.write_bytes(self.initial);self.config.chmod(0o600)
        self.manifest=self.root/'retired.json'
        self.data={'version':1,'skills':[{'name':'old','path':'skills/old','pattern':'skills/old','replacement':'combined'}]}
        self.save()
    def save(self):self.manifest.write_text(json.dumps(self.data))
    def plan(self):return retire.plan(self.manifest,self.home)

    def test_archive_disable_and_preserve_other_settings(self):
        archive=retire.apply(self.plan())
        self.assertFalse(self.old.exists());self.assertTrue(self.new.exists())
        self.assertEqual((archive/'skills/old/SKILL.md').read_text(),'# Skill\n')
        current=tomllib.loads(self.config.read_text())
        self.assertEqual(current['model'],'keep-model')
        self.assertTrue(current['plugins']['stripe@example']['enabled'])
        self.assertEqual(current['skills']['max_context_tokens'],5000)
        self.assertEqual(current['skills']['config'],[{'path':str(self.old/'SKILL.md'),'enabled':False}])
        self.assertEqual((archive/'config.toml.before').read_bytes(),self.initial)
        self.assertEqual(self.config.stat().st_mode & 0o777,0o600)
        self.assertEqual((archive/'config.toml.before').stat().st_mode & 0o777,0o600)

    def test_idempotent(self):
        retire.apply(self.plan());before=self.config.read_bytes()
        self.assertFalse(retire.pending(self.plan()))
        self.assertIsNone(retire.apply(self.plan()))
        self.assertEqual(self.config.read_bytes(),before)

    def test_missing_replacement_blocks_before_mutation(self):
        (self.new/'SKILL.md').unlink()
        with self.assertRaises(ValueError):self.plan()
        self.assertTrue(self.old.exists());self.assertEqual(self.config.read_bytes(),self.initial)

    def test_settings_race_does_not_move_skills(self):
        prepared=self.plan();self.config.write_bytes(self.initial+b'\n# changed\n')
        with self.assertRaises(ValueError):retire.apply(prepared)
        self.assertTrue(self.old.exists())

    def test_skill_race_is_preserved(self):
        prepared=self.plan();(self.old/'new-file.md').write_text('new work')
        with self.assertRaises(ValueError):retire.apply(prepared)
        self.assertEqual((self.old/'new-file.md').read_text(),'new work')

    def test_config_write_failure_restores_moved_directories(self):
        real=retire.atomic_write
        def fail(target,data,mode=0o600):
            if target==self.config:raise OSError('simulated config failure')
            return real(target,data,mode)
        with mock.patch.object(retire,'atomic_write',side_effect=fail):
            with self.assertRaises(OSError):retire.apply(self.plan())
        self.assertTrue(self.old.exists());self.assertEqual(self.config.read_bytes(),self.initial)

    def test_unsafe_paths_and_symlinks_are_rejected(self):
        self.data['skills'][0]['path']='../outside';self.save()
        with self.assertRaises(ValueError):self.plan()
        self.data['skills'][0]['path']='skills/old';self.save()
        (self.old/'SKILL.md').unlink();self.old.rmdir();self.old.symlink_to(self.new)
        with self.assertRaises(ValueError):self.plan()
        self.assertTrue((self.new/'SKILL.md').exists())

    def test_malformed_managed_block_is_preserved(self):
        bad=self.initial+b'\n'+retire.START.encode()+b'\n'
        self.config.write_bytes(bad)
        with self.assertRaises(ValueError):self.plan()
        self.assertEqual(self.config.read_bytes(),bad)

    def test_explicit_conflicting_enablement_requires_review(self):
        self.config.write_bytes(self.initial+('\n[[skills.config]]\npath = '+json.dumps(str(self.old/'SKILL.md'))+'\nenabled = true\n').encode())
        with self.assertRaises(ValueError):self.plan()
        self.assertTrue(self.old.exists())

    def test_aliased_conflicting_enablement_is_rejected(self):
        alias=self.root/'alias';alias.symlink_to(self.home,target_is_directory=True)
        self.config.write_bytes(self.initial+('\n[[skills.config]]\npath = '+json.dumps(str(alias/'skills/old/SKILL.md'))+'\nenabled = true\n').encode())
        with self.assertRaises(ValueError):self.plan()
        self.assertTrue(self.old.exists())

    def test_aliased_disabled_setting_is_not_duplicated(self):
        alias=self.root/'alias';alias.symlink_to(self.home,target_is_directory=True)
        entry={'path':str(alias/'skills/old/SKILL.md'),'enabled':False}
        self.config.write_bytes(self.initial+('\n[[skills.config]]\npath = '+json.dumps(entry['path'])+'\nenabled = false\n').encode())
        retire.apply(self.plan())
        self.assertEqual(tomllib.loads(self.config.read_text())['skills']['config'],[entry])

    def test_new_version_is_archived_without_touching_connector(self):
        base=self.home/'plugins/cache/vendor/plugin'
        for version in ['1.0','2.0']:
            for name in ['old','combined']:
                p=base/version/'skills'/name;p.mkdir(parents=True);(p/'SKILL.md').write_text('# Skill')
            (base/version/'.mcp.json').write_text('{"connector":"keep"}')
        self.data['skills']=[{'name':'old','path':'plugins/cache/vendor/plugin/1.0/skills/old','pattern':'plugins/cache/vendor/plugin/*/skills/old','replacement':'combined'}];self.save()
        prepared=self.plan();self.assertEqual(len(prepared['jobs']),2)
        retire.apply(prepared)
        for version in ['1.0','2.0']:
            self.assertFalse((base/version/'skills/old').exists())
            self.assertTrue((base/version/'skills/combined/SKILL.md').exists())
            self.assertEqual((base/version/'.mcp.json').read_text(),'{"connector":"keep"}')

    def test_unrelated_skill_overrides_survive(self):
        self.config.write_bytes(self.initial+b'\n[[skills.config]]\npath = "/other/skill/SKILL.md"\nenabled = false\n')
        retire.apply(self.plan());current=tomllib.loads(self.config.read_text())
        self.assertEqual(current['skills']['config'][0],{'path':'/other/skill/SKILL.md','enabled':False})

if __name__=='__main__':unittest.main()
