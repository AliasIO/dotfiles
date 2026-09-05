---
name: openai-platform-api-key
description: "Configure or securely provision OpenAI API credentials when live access, a new key or a secret destination needs attention. Preserve prior authorization and never expose plaintext. Offline coding and mocked tests do not require a credential decision."
---

# OpenAI API Key

Use this skill only in Codex local/app sessions. Create keys through the secure OpenAI Platform connector, keep plaintext out of normal tool output, and write secrets only to a confirmed local destination.

## When To Use

Use this skill as the credential gate for API-backed work, not as the app, docs, or frontend implementation skill.

Use it when credential handling is needed for one of these requests:

- The user asks for an OpenAI API key, `OPENAI_API_KEY`, or an `sk-proj` key.
- Codex will build, implement, run, test, debug, or configure an app, script, CLI, generator, UI, or tool that calls the OpenAI API, when live API access or credential configuration needs attention.
- The user asks Codex to build, implement, run, or configure an app, script, CLI, generator, or tool that uses AI to produce outputs from user input.
- The user asks for an AI-powered app or UI that generates output from one or more input fields, forms, prompts, files, or other user-provided values.
- The user says "using AI" in an app/script/build request and does not name a different provider.

Do not use it when:

- The user only wants documentation, citations, model or API guidance, conceptual explanation, or code examples without asking Codex to build, run, configure, or debug an API-backed artifact.
- The user asks for a static frontend, visual mockup, design concept, or placeholder UI with no API-backed behavior.
- The user only asks Codex to write a one-off output directly and no app, script, generator, or API-backed tool is being built or run.
- The user names a different AI provider for the artifact.

If API access is needed and no usable key is found, offer secure key provisioning instead of leaving only placeholder docs or manual setup steps.

## Coordination With Implementation Skills

Credential setup supports implementation; it does not block work that does not use credentials. Continue repository inspection, design, offline coding and mocked/local tests while a credential decision is unresolved. Resolve credentials before a live request that needs them, or before creating a key or writing a secret. Honor reuse and destination authorization already provided in the conversation.

## Safety Rules

- Never request, print, summarize, quote, or paste a plaintext API key.
- Never inspect credentials with commands that can print secret values, such as `cat .env*`, `grep OPENAI_API_KEY .env*`, or `rg OPENAI_API_KEY .env*`. Use silent exit-status checks or redacted summaries only.
- Use the Platform connector `open_codex_api_key_setup` tool when it is available. Do not send local workspace paths, env-file paths, or target arrays to the picker.
- Do not use the ChatGPT-only browser/widget `_start_api_key_setup` flow from Codex.
- Only pass public JWK material (`kty`, `n`, `e`) to the connector.
- Before creating a key or writing any secret, obtain explicit confirmation. Prefer the hosted Platform picker plus local destination confirmation when it is available; if it is unavailable, fall back to a typed local destination question, then wait.
- Prefer ignored or untracked env files. In git repos, avoid tracked targets unless the user explicitly confirms that choice.
- The local helper may handle plaintext in memory and write it to the confirmed file. Its stdout/stderr must not include the key.
- When decrypting in a repo, pass the repo root as `--workspace`; the helper refuses symlink targets and targets outside that workspace.
- Keep progress concise and relevant to the authorized work, including independent implementation. Describe credential handling without exposing secret values.
- Do not narrate deterministic mechanics such as helper discovery, encryption, decryption, RSA, JWKs, ciphertext, temporary files, cleanup, permissions checks, or redacted verification unless an error requires user action.
- Report only safe metadata: path, env var name, key name, org/project names, and whether an existing env var was updated.

## Credential decision boundary

Check credential presence without exposing values when API access is needed. Reuse a suitable existing credential when the task or prior conversation authorizes that use. Ask only when key creation, destination, account identity or live-use authority is genuinely unresolved. Finding a credential alone does not authorize unrelated calls or spending.

Offline implementation and mocked tests do not require a credential decision. If a question is needed, keep it pending while continuing independent work. Creating a key or writing a secret requires a confirmed scope/destination; do not repeat a decision the user has already made.

## Workflow

1. Inspect before acting:
   - look for a usable key without printing secret values in the current environment and likely local env files such as `.env.local`, `.env`, and ignored framework-specific env files
   - inspect env files only with no-output checks that reveal presence/absence, never with commands that echo matching lines or whole files
   - check README/setup docs, `OPENAI_BASE_URL`, and framework env docs for repo conventions separately from secret-bearing env files
   - prefer ignored or untracked env files; avoid tracked targets unless the user explicitly confirms that choice
   - default to `.env.local` and `OPENAI_API_KEY` when no stronger convention exists
2. Reuse an existing suitable key within the user’s authorized task. If API access is needed but no suitable key exists, offer secure provisioning and continue offline work. Ask only about unresolved account, live-use or credential-creation decisions. Confirm a destination before a new secret write unless it was already confirmed.
3. When creation is the chosen path, resolve the destination file/env var before writing. Reuse explicit destination and key-creation approval already given; ask only for missing decisions.
   - Prefer the hosted Platform picker:
     - use `tool_search` to load `open_codex_api_key_setup`
     - call `open_codex_api_key_setup` directly with no arguments (`{}`). Do not send a key name, local paths, workspace arguments, or target arrays. The picker collects the key name, automatically loads organization/project choices, and sends a later widget-authored follow-up with the confirmed key name plus selected opaque ids
     - after `open_codex_api_key_setup` returns without an error, end the current turn immediately and wait for the widget-generated follow-up prompt. Do not inspect or interpret the launch payload, search for connector contract details, run local-save steps, make another tool call, or send any non-empty user-facing message, including a picker-open confirmation, in that turn
   - After the widget follow-up, or if the picker tool is unavailable or fails before the widget opens, choose the best local env-file target from repo conventions, defaulting to `.env.local` and `OPENAI_API_KEY`.
   - If the destination has already been explicitly approved for this key write, use it. Otherwise use the host’s available tool discovery to load the OpenAI Developers MCP `confirm_openai_api_key_local_destination` tool. If available, call it with the absolute workspace root, the recommended env-file target, and `OPENAI_API_KEY`. The form shows the recommended location and lets the user replace it before continuing.
   - If the local destination tool returns `approved`, use its returned `targetPath` exactly and do not ask a second destination question. If it is declined or canceled, stop.
   - If the destination remains unresolved and the local destination tool is unavailable, ask one short question: `Save the new key to <path>? Reply yes to continue, another workspace-relative env-file path to change it, or decline.` If the user declines, stop; otherwise use the confirmed path.
   - Silently check whether the selected target is tracked. If it is tracked, stop and obtain explicit confirmation that a secret will be written there. In this local fallback, do not claim the user selected an explicit organization/project target.
4. After confirmation, run the app tool preflight:
   - use `tool_search` to load `create_encrypted_openai_api_key`
   - if missing and `tool_suggest` is available, suggest installing connector `connector_2de447f3f15448ebab48783d7e4f5d81`
   - if unavailable or auth fails, ask the user to connect OpenAI Platform from `/apps` or the `$` app picker, then retry `tool_search` after they finish
5. Run `prepare`, keep `private_key_path`, and send only `recipient_public_key_jwk` to the connector.
6. Call `create_encrypted_openai_api_key` with the confirmed key name plus the picker-confirmed `organization_id` and `project_id` when the picker path was used. In the text-only fallback, omit those fields so the connector preserves its default organization/project behavior.
7. Run `decrypt` with the encrypted ciphertext, confirmed target path, env var name, and repo root as `--workspace`.
8. Verify by running the relevant project command when practical. Do not reveal or inspect the secret value directly.

## Helper

Use the helper by absolute path. `prepare` creates the temporary private key file plus a request JSON containing only the public JWK and requested key name:

```bash
node "<plugin root>/scripts/openai-platform-api-key.mjs" prepare --name "Codex"
```

After the connector returns `encrypted_api_key.ciphertext`, decrypt and write the key locally:

```bash
node "<plugin root>/scripts/openai-platform-api-key.mjs" decrypt \
  --private-key "<private key path from prepare>" \
  --ciphertext "<encrypted_api_key.ciphertext from connector result>" \
  --target "<confirmed env file path>" \
  --workspace "<repo root>" \
  --env-name OPENAI_API_KEY
```

The decrypt command updates or appends the env var, prints only safe write metadata, and refuses symlink or out-of-workspace targets.

## References

- `references/evals.md`: trigger and routing eval cases for this skill.
