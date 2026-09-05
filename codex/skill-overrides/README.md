# Codex skill customizations

The 2026-09-05 review started with 94 skills. Hatch-pet was removed in the first pass; a subsequent consolidation retires ten overlapping or unnecessary entrypoints, leaving 83 installed entrypoints in the reviewed catalog. This count describes files on disk; restart Codex to refresh a running app's skill catalog.

| Retired standalone skills | Retained workflow |
| --- | --- |
| `copy-editing`, `humanizer` | `copywriting`: drafting, focused edits, and a brief voice/clarity pass |
| `signup`, `onboarding` | `cro`: page/form, registration, or activation review |
| `ai-seo` | Optional AI-search reference under `seo-audit` |
| `gather-business-context`, `design-kpis`, `kpi-reporting` | `product-business-analysis`: context, decisions, KPI design, or KPI readouts |
| `stripe-projects`, `stripe-directory` | Retired; core Stripe integration skills and connector remain available |

Android, Figma, specialized analytics, and project-specific workflows remain available. The consolidation removes repeated entrypoints while retaining their useful checks as focused references. It does not uninstall plugins or change connector enablement, credentials, permissions, or unrelated settings.

`payloads/` contains reviewed replacement files for directly installed personal skills, system skills, and pinned plugin versions. `manifest.json` records destinations, baseline/replacement fingerprints, reviewed prior fingerprints, installation prerequisites, and observed plugin versions. These are local customizations, not upstream plugin changes. Overrides for retired skills have been removed; Git history and retirement archives retain their previous content.

Existing canonical Wappalyzer skills are maintained directly in `../skills/deploy-wappalyzer/` and `../skills/handle-wappalyzer-detection-issues/`, with their discovery symlinks preserved. Shared marketing context is installed at `skills/_shared/marketing-context.md` without a skill entrypoint. Global writing guidance lives in `../AGENTS.md` and no longer requires a separate humanizer invocation.

## Check, apply, verify

Run with Python 3.11 or newer:

```sh
python3 "$HOME/Projects/dotfiles/codex/skill-overrides/apply.py" check
python3 "$HOME/Projects/dotfiles/codex/skill-overrides/apply.py" apply
python3 "$HOME/Projects/dotfiles/codex/skill-overrides/apply.py" verify
```

The default destination is `$CODEX_HOME`, or `$HOME/.codex` when unset. Pass `--codex-home /path/to/codex` for another installation. The command does not install plugins or recreate missing skills. `check` preflights both payloads and retirements; `verify` requires both to be applied.

Unknown installed content, changed plugin cache versions, missing retained installations, target symlinks, and payload fingerprint mismatches stop preflight. Reapplying unchanged state is a no-op. Payload writes are atomic, preserve file permissions, and restore earlier payload writes if a later payload write fails. Previous files are backed up under `$CODEX_HOME/skill-override-backups/<timestamp>/`; its manifest identifies newly created files. Empty directories may remain after a failed write.

`retired.json` lists the ten explicitly selected skills. `retire.py` first verifies replacement entrypoints and snapshots each source tree. After payload installation, it moves entire retired skill directories to `$CODEX_HOME/retired-skills/<timestamp>/<original path>`, then adds disabled entries for their `SKILL.md` paths in a managed block in `config.toml`. The archive includes directory fingerprints and a mode-600 copy of the prior configuration. All unrelated parsed settings and existing skill overrides are preserved. Conflicting explicit enablement or concurrent source/configuration changes stop retirement. A failed configuration write restores moved directories; successfully installed merged payloads remain installed with their separate backup.

Do not run this command concurrently with Codex settings edits or plugin updates. Archives include the prior private configuration; do not commit or share them. To undo a retirement, restore the intended directories from its archive, update the retirement manifest and managed disabled entries, and restore any desired prior workflow content from the payload backups or Git history. Preserve newer unrelated configuration changes instead of replacing the whole configuration with its backup.

Codex documents per-skill disabling with `[[skills.config]]`, a `SKILL.md` path, and `enabled = false`; it requires a restart after changing this configuration. See [Build skills](https://learn.chatgpt.com/docs/build-skills).

## After a plugin or system update

Updates can replace customizations, restore retired directories, or activate another version. Run `check`, inspect the active skill paths, and compare vendor changes against the intended behavior. Never accept a new hash merely to bypass a conflict. Rebase retained payloads, update destinations/versions and baseline fingerprints, validate, then apply and verify.

Version checks deliberately fail when another cached version appears. After that version has been reviewed, retirement selectors cover only the named skill in each matching version of its plugin. They do not match other plugins, connector files, or arbitrary skill directories. This is a manually run maintenance command, not a background monitor. A removed plugin is not automatically reinstalled.

For a reviewed revision on the same pinned version, retain `base_sha256`, add the previous `applied_sha256` to `previous_applied_sha256`, and update the payload fingerprint. This permits known local revisions without accepting unrelated edits.

## Validate

```sh
PYTHONDONTWRITEBYTECODE=1 python3 -m unittest discover \
  -s "$HOME/Projects/dotfiles/codex/skill-overrides/tests" -v
python3 "$HOME/.codex/skills/.system/skill-creator/scripts/quick_validate.py" \
  "$HOME/.codex/skills/copywriting" --links
```

The validator uses PyYAML or Ruby/Psych. It rejects empty required fields, malformed YAML, invalid metadata types, and unfinished scaffold placeholders. Default mode accepts host metadata and existing title-case names; `--strict` checks portable conventions. `--links` checks relative Markdown resources outside fenced examples, not remote URLs or section anchors.

Structural checks do not replace workflow evaluation. The following are manual review scenarios, not claims that provider operations were executed:

| Scenario | Expected behavior |
| --- | --- |
| Small copy edit | Edit only the requested text; one brief clarity pass, no separate humanizer or approval panel. |
| Existing ISO100 marketing document | Reuse the project-declared document; no new context-file prerequisite. |
| Registration error | Inspect validation/recovery; preserve authentication and abuse controls. |
| Activation opportunity | Verify first-value and cohort evidence; no unsolicited lifecycle messages or monitor. |
| Ordinary loading bug | Do not activate conversion redesign without a conversion/activation goal. |
| AI-search review | Report observed engine/query/date evidence; no guaranteed citation lift or unsupported file requirement. |
| KPI design | Define units, population, period, source, guardrails and target rationale; do not invent benchmarks. |
| KPI readout with zero/negative baseline | Show a meaningful comparison and disclose the baseline; avoid misleading percentage growth. |
| Metric diagnostic | Use source-backed drivers and residuals; do not require context gathering and KPI design first. |
| Explicit report or dashboard | Complete and render-check the artifact; work mode alone does not authorize publishing. |
| Missing OpenAI credentials | Continue independent offline work; gate only dependent live requests. |
| Swift bug unrelated to Figma | Do not activate Figma translation. |
| Small Android test | Reuse project infrastructure; no automatic framework migration. |
| Wappalyzer detection or rollout | Preserve documented validation/delivery modes and terminal deployment verification. |
| Crisp, Pente AI, gear artwork | Preserve privacy, game/deadline evidence and model-specific visual QA. |

Hatch-pet remains outside this retirement mechanism. Its original removal is recoverable from macOS Trash until Trash is emptied; generated pets and other pet assets were not removed.
