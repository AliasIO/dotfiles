# Codex skill customizations

Reviewed against the 94 skills available on 2026-09-05. The installed catalog now has 93 skills: `hatch-pet` was removed from discovery and moved to macOS Trash. The review improvements change 73 remaining skills. Twenty were preserved without changes; two of the original Keep entries received only shared-context or discovery-description cleanup.

`payloads/` contains the reviewed replacement files for directly installed personal skills, system skills, and pinned plugin versions. `manifest.json` records each destination, original upstream fingerprint, replacement fingerprint, any known prior customization fingerprints, installation prerequisite, and observed plugin versions. These are local customizations; they are not changes to the plugins' upstream repositories.

The two existing canonical Wappalyzer skills are maintained directly in `../skills/deploy-wappalyzer/` and `../skills/handle-wappalyzer-detection-issues/`. Their existing discovery symlinks continue to resolve to those sources. The shared marketing context is installed as `skills/_shared/marketing-context.md`; it has no skill entrypoint.

## Check, apply, verify

Run with Python 3.9 or newer from any directory:

```sh
python3 "$HOME/Projects/dotfiles/codex/skill-overrides/apply.py" check
python3 "$HOME/Projects/dotfiles/codex/skill-overrides/apply.py" apply
python3 "$HOME/Projects/dotfiles/codex/skill-overrides/apply.py" verify
```

The default destination is `$CODEX_HOME`, or `$HOME/.codex` when unset. Pass `--codex-home /path/to/codex` for another installation. This command does not install plugins or recreate missing skills. `check` reports ready/already-applied files; `verify` requires every payload to be applied. It does not claim that a currently running task has refreshed its startup skill catalog.

All files are checked before writes. Unknown content, changed plugin cache versions, missing installations, target symlinks, and payload fingerprint mismatches stop the batch. Reapplying unchanged files is a no-op. Writes use atomic replacement, preserve file permissions, and roll back earlier writes if a later write fails. Previous content is backed up outside skill discovery under `$CODEX_HOME/skill-override-backups/<timestamp>/`; its manifest lists newly created files. Empty directories may remain after a failed write. Do not run the apply command concurrently with plugin updates.

## After a plugin or system update

Updates can replace installed customizations or activate a new version. Run `check`, inspect the newly active skill paths from Codex, and compare the new vendor files against the intended changes. Never just accept a new hash to bypass a conflict. Rebase the payloads, update the destination/version and baseline fingerprints, run validation, then apply and verify. Version-directory checks deliberately fail when another cached version appears; inspect which version is actually active before updating the manifest. A removed or disabled plugin is not automatically reinstalled.

For an intentional revision of these customizations on the same pinned vendor version, retain the vendor `base_sha256`, add the old reviewed `applied_sha256` to `previous_applied_sha256`, and update the payload and its new fingerprint. This allows known local revisions without accepting unrelated edits.

## Validate

```sh
PYTHONDONTWRITEBYTECODE=1 python3 -m unittest discover \
  -s "$HOME/Projects/dotfiles/codex/skill-overrides/tests" -v
python3 "$HOME/.codex/skills/.system/skill-creator/scripts/quick_validate.py" \
  "$HOME/.codex/skills/ads" --links
```

The skill validator uses PyYAML or Ruby/Psych. It rejects empty required fields, malformed YAML, invalid metadata types, and unfinished scaffold placeholders. Default mode accepts host metadata and existing title-case skill names; `--strict` checks portable conventions. `--links` checks relative Markdown resources outside fenced examples, not remote URLs, generated example paths, or section-anchor correctness.

Validation is structural and does not replace workflow evaluation. The scenario matrix below records the behavior to check after future changes. It is a manual review contract, not a claim that live provider operations were executed.

| Scenario | Expected behavior |
| --- | --- |
| Existing ISO100 marketing document | Reuse the project-declared document; no new context-file prerequisite. |
| Small marketing copy edit | Focused edit; optional expert panel; public-copy humanizer only. |
| Direct metric diagnostic | Bound sources, verify denominators and driver evidence, answer inline if sufficient. |
| Explicit analytical report | Complete and render-check the requested artifact. |
| No native chart protocol exposed | Use an available renderer or inspected static chart; no guessed widget directive. |
| Analytics task in Work Mode | Mode alone does not publish or expand reader access. |
| Missing OpenAI credentials | Continue offline code and mocked tests; gate dependent live requests. |
| Existing authorized OpenAI key | Reuse without exposing values or repeating an answered question. |
| Swift app bug unrelated to Figma | Do not activate Figma translation. |
| One Figma component edit | Scoped inspection, edit, and QA; no full-library approval ritual. |
| Small Android regression test | Reuse current DI and test runner; no automatic framework migration. |
| Perfetto trace inspection | Use known executable/task cache; no repository-root wrapper or `.gitignore` edit. |
| Wappalyzer detection implementation | Validate, commit/push and propagate within the documented mode; no incidental issue/PR mutation. |
| Authorized Wappalyzer rollout | Wait for a terminal result and smoke-check; recurring monitoring remains separately scoped. |
| Crisp inspection, Pente AI, gear artwork | Preserve read-only/privacy, game/deadline evidence, and model-specific visual QA controls. |

Hatch-pet removal does not delete generated pets or other pet assets. The initial removed skill remains recoverable from Trash unless Trash is subsequently emptied. This apply command does not restore it.
