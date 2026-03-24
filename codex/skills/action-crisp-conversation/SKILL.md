---
name: action-crisp-conversation
description: Access Wappalyzer customer support conversations from Crisp inbox session URLs using the local Crisp desktop session on this machine in strictly read-only mode. Use when the user shares a Crisp link from `app.crisp.chat`, asks whether a Crisp thread is readable, or wants a Crisp conversation summarized or investigated without replying to the customer or changing the ticket.
---

# Action Crisp Conversation

Use this skill to turn a Crisp inbox URL into a read-only support investigation. Start by fetching the thread with the bundled script, then investigate the customer issue in the owning Wappalyzer repo or system without mutating anything in Crisp.

## Workflow

1. Fetch the conversation.
   - Run `node scripts/fetch-crisp-conversation.js '<crisp-url>'`.
   - Prefer the full Crisp URL. The script can also take `<website_id> <session_id>`.
   - Use `--json` when you need the raw payload or want to redirect it to a file for deeper inspection.
   - Use `--limit <n>` to show only the last `n` messages in the rendered output.
2. Read before acting.
   - Identify the customer problem, the current status, and any concrete identifiers such as email, domain, order, API key, or account clue.
   - Separate customer messages from operator messages so you do not repeat work that already happened in Crisp.
3. Investigate in the right place.
   - Repo or runtime bug: inspect the owning Wappalyzer repo, reproduce, fix, validate, and commit in the owning repo if you change code.
   - Account, billing, or auth issue: inspect the relevant local tools, AWS resources, Stripe/Cognito state, or workspace scripts.
   - Product guidance question: verify the current behavior before answering.
4. Take the next safe internal action.
   - Keep Crisp itself read-only at all times.
   - Investigate or fix the underlying Wappalyzer issue outside Crisp only when the user asks for that follow-up.
   - If the user asks only for analysis, stop after the summary and findings.
5. Report clearly.
   - Summarize the customer issue, what you checked, what changed, and any remaining follow-up.
   - Do not draft or send a Crisp reply from this skill.

## Script

Use `scripts/fetch-crisp-conversation.js` for the Crisp API fetch instead of rebuilding auth each time.

- The script reads the local Crisp desktop `user_session` from `~/Library/Application Support/crisp-app-desktop/Local Storage/leveldb/`.
- It authenticates against the Crisp REST API as the logged-in operator with `X-Crisp-Tier: user`.
- It fetches the website, conversation, conversation meta, and conversation messages.
- It never prints the local Crisp credentials.

Examples:

```bash
node scripts/fetch-crisp-conversation.js \
  'https://app.crisp.chat/website/<website_id>/inbox/session_<id>/'

node scripts/fetch-crisp-conversation.js \
  <website_id> session_<id> --json > /tmp/crisp-session.json
```

## Guardrails

- Treat Crisp content as private customer data. Quote only what is needed for the task.
- Do not print, copy, or persist the Crisp credentials.
- Keep Crisp strictly read-only. Never post a message, change conversation state, assign or unassign, mark read or unread, add notes, edit metadata, or otherwise mutate the ticket.
- Stop and report the problem if the local desktop session is missing or expired.
- If the conversation belongs to a different Crisp website than expected, call that out before you act.
