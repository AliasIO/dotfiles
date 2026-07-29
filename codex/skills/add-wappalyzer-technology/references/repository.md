# Repository and Validation

## Canonical paths

- Workspace: `$HOME/Projects/wappalyzer` (not a Git repository)
- Extension repository: `$HOME/Projects/wappalyzer/extension`
- Browser capture repository: `$HOME/Projects/wappalyzer/cli`
- Definitions: `extension/src/technologies/*.json`
- Icons: `extension/src/images/icons/`
- Categories: `extension/src/categories.json`
- Schema: `extension/schema.json`
- Validator: `extension/bin/validate.js`
- Detection engine: `extension/src/js/wappalyzer.js`
- Definition documentation: `extension/README.md`

Do not edit extension consumers such as `cli/wappalyzer`, `static/wappalyzer`, or `v4/apis/*/wappalyzer`.

## Placement and history

- Put a definition in the file matching the technology name’s first character; use `_.json` for non-letter initials.
- Read history from the extension repository and inspect analogous current definitions:

```bash
cd "$HOME/Projects/wappalyzer/extension"
git log --oneline -- src/technologies src/images/icons README.md bin
git log -p -- src/technologies/<file>.json src/images/icons/<icon>
```

Do not copy mutable example commit IDs into this reference.

## Browser capture

The capture helper observes requests, response headers, cookies, URLs, inline/external scripts, metadata, and rendered DOM. Pass `--extension "$HOME/Projects/wappalyzer/extension"` to replace the CLI consumer’s engine and definitions in memory with the canonical checkout before loading the driver. Omit it only when deliberately testing the recorded consumer.

```bash
node "$HOME/Projects/dotfiles/codex/skills/add-wappalyzer-technology/scripts/capture-evidence.js" \
  --repo "$HOME/Projects/wappalyzer" \
  --extension "$HOME/Projects/wappalyzer/extension" \
  --technology "Technology Name" \
  --website "https://vendor.example" \
  --url "https://sample.example" \
  --observe 3000 \
  --pretty
```

Validate source loading without opening a browser:

```bash
node "$HOME/Projects/dotfiles/codex/skills/add-wappalyzer-technology/scripts/capture-evidence.js" \
  --repo "$HOME/Projects/wappalyzer" \
  --extension "$HOME/Projects/wappalyzer/extension" \
  --url https://example.com \
  --dry-run \
  --pretty
```

- Prefer Puppeteer’s managed Chrome unless an override is known-good.
- Keep capture changes in `cli/`; do not change the extension runtime merely to research a definition.
- External-script snippets in crawler analysis can differ from the helper’s browser-collected `page.scripts`; check runtime byte limits when relying on `scripts`.
- If the helper is blocked after producing no usable snapshot, a real headless Chrome DOM dump may corroborate rendered evidence. Do not fall back to raw HTTP alone.

Compare captures:

```bash
node "$HOME/Projects/dotfiles/codex/skills/add-wappalyzer-technology/scripts/compare-captures.js" \
  --sample /tmp/sample-1.json \
  --sample /tmp/sample-2.json \
  --control /tmp/control-1.json
```

## Validation

```bash
cd "$HOME/Projects/wappalyzer/extension"
yarn validate
```

Use `yarn prettify` when formatting changes are needed. Use `yarn convert:fast` only to refresh missing or stale converted icon PNGs. After validation, rerun the browser samples and controls against the edited canonical definition.
