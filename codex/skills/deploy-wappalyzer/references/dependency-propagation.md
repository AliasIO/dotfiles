# Dependency Propagation

## Policy

- Canonical repositories win. Declared consumer checkouts, detached revisions, local consumer edits, and uncommitted consumer gitlinks are disposable.
- Destructive authority is bounded by [dependencies.json](dependencies.json). Preserve all canonical-source changes and every ordinary parent path not listed there.
- Publish bottom-up. A consumer can point only to a commit available on the canonical remote branch.
- Updating a dependency is incomplete until all declared direct consumers, recursive nested consumers, and extractor aliases pass `--check`.
- The helper stages only exact declared gitlinks and extractor-alias paths. Review, commit, and push each parent layer under the global delivery rule.

## Inspect

```bash
node "$HOME/Projects/dotfiles/codex/skills/deploy-wappalyzer/scripts/sync-dependencies.mjs" --check
```

`--check` is local and does not fetch. It validates the manifest against each parent `.gitmodules`, compares canonical cached `origin/master`, recorded/index/working gitlinks, checks recursive nested status, and compares extractor aliases.

Parents remain monitored even when they have no active consumers. A stale `.gitmodules` entry without a gitlink in parent `HEAD` is warned about but is not treated as a consumer; if a real gitlink appears, the check fails as unmanifested until it is deliberately added to `dependencies.json`.

## Apply one published layer

Run only after the canonical commit is on `origin/master`:

```bash
node "$HOME/Projects/dotfiles/codex/skills/deploy-wappalyzer/scripts/sync-dependencies.mjs" \
  --apply --canonical extension

node "$HOME/Projects/dotfiles/codex/skills/deploy-wappalyzer/scripts/sync-dependencies.mjs" \
  --apply --canonical cli

node "$HOME/Projects/dotfiles/codex/skills/deploy-wappalyzer/scripts/sync-dependencies.mjs" \
  --apply --canonical apis-shared
```

The apply mode fetches the selected canonical remote, force-replaces only its declared consumers with that published commit, updates nested submodules to recorded commits, repairs declared extractor aliases for `apis-shared`, and stages exact parent paths. It refuses a parent containing changes outside the selected consumer/alias paths or an aliased source that differs from the published commit.

## Required order

1. Commit, validate, and push the canonical `extension` change.
2. Apply `extension`. Review exact staged gitlinks in `cli` and `static`; commit and push them separately.
3. After the `cli` gitlink commit is published, apply `cli`. Review, commit, and push the `v4/apis` parent gitlinks.
4. Commit, validate, and push canonical `v4/apis-shared` changes, then apply `apis-shared`; review and publish the `v4/apis` gitlinks and any staged `extract/` alias paths.
5. Run `--check` again. Resolve every mismatch before deployment.

If an ordinary parent path is dirty, use a clean worktree; do not commit the unrelated change to unblock synchronization. Stage with `git add -- <exact-gitlink>...`, inspect `git diff --cached --submodule=log`, and keep one intentional propagation commit per parent where practical.
