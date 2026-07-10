---
name: inspect-crisp-conversation
description: Inspect Wappalyzer customer-support conversations from Crisp inbox session URLs through the local Crisp desktop session in strictly read-only mode. Use when the user shares an app.crisp.chat conversation link, asks whether a Crisp thread is readable, or requests a private summary or investigation without replying, drafting a reply, or changing the ticket.
---

# Inspect Crisp Conversation

Keep Crisp read-only for the entire task. Use the bundled fetch script; never recreate authentication or call a Crisp mutation endpoint.

## Workflow

1. Fetch the conversation.
   - Prefer a full Crisp inbox URL:

     ```bash
     node "$HOME/Sites/dotfiles/codex/skills/inspect-crisp-conversation/scripts/fetch-crisp-conversation.js" \
       '<crisp-url>' --limit 50
     ```

   - The helper defaults to the last 50 messages and redacts structured email/phone fields. Choose a smaller `--limit <n>` when enough; use `--limit all` or `--include-contact` only when the request genuinely requires it.
   - Use `<website_id> <session_id>` only when the user supplies both values.
2. Identify the customer problem, current status, operator work already performed, and only the identifiers necessary for the requested investigation.
3. Investigate outside Crisp only within the user's requested scope.
   - For analysis-only requests, stop after read-only inspection and findings.
   - Change Wappalyzer code or external state only when separately authorized.
4. Report a minimal summary, evidence checked, conclusion, and remaining follow-up. Do not draft or send a Crisp reply.

## Private Data

Treat all conversation content, contact details, account identifiers, and credentials as private.

- Do not paste customer data into web searches, unrelated tools, repositories, commits, or durable notes.
- Quote only the minimum needed to support the answer; prefer paraphrase and redaction.
- Never print or expose the local Crisp session credentials.
- Keep fetched data in memory or stdout by default.

If raw JSON is necessary, use a private temporary file and remove it in the same turn, including on failure:

```bash
tmp=$(mktemp "${TMPDIR:-/tmp}/crisp-conversation.XXXXXX")
chmod 600 "$tmp"
trap 'rm -f "$tmp"' EXIT HUP INT TERM
node "$HOME/Sites/dotfiles/codex/skills/inspect-crisp-conversation/scripts/fetch-crisp-conversation.js" \
  '<crisp-url>' --json --limit 50 > "$tmp"
# Inspect the file locally, then delete it before reporting.
rm -f "$tmp"
trap - EXIT HUP INT TERM
```

Never leave Crisp exports in the workspace, shell history, or `/tmp` after the task.

## Read-Only Guardrails

Never post messages, draft replies, add notes, change state or status, assign operators, mark read or unread, edit metadata, or otherwise mutate Crisp. Stop and report the blocker if the desktop session is absent or expired. Call out an unexpected Crisp website before continuing.
