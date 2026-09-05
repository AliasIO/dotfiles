---
name: cro
description: "Diagnose or improve conversion across marketing pages, forms, registration and post-signup activation. Select the relevant funnel stage; ordinary UI bugs, loading screens and internal tools do not activate this skill without a conversion or activation goal."
metadata:
  version: 2.0.0
---

# Conversion and activation

Read [shared marketing context](../_shared/marketing-context.md), then identify the requested stage, intended user action, relevant audience, and business constraints. Use existing evidence and ask only about material gaps.

## Select one stage

- **Marketing page or lead/contact form:** inspect message match, value clarity, trustworthy proof, action hierarchy and friction. Use [page and form review](references/page-review.md); load [form details](references/form.md) only for a form-specific issue.
- **Registration or trial signup:** use [registration](references/registration.md) for field requirements, validation, authentication, mobile input and recovery. Preserve account-security and abuse-prevention requirements.
- **Post-signup activation:** use [activation](references/activation.md) for first value, setup dependencies, stalled users and retention evidence. An ordinary empty state or loading bug does not by itself require an activation redesign.

A narrow request should stay within its stage. Trace adjacent stages only when evidence suggests the problem crosses the boundary. Use `copywriting` for substantive copy work and `analytics` when instrumentation itself needs implementation or correction.

## Measurement and action

Define who enters the funnel, what counts as success, the denominator, time window and downstream quality measure. Distinguish observed failure, supported interpretation and an experiment hypothesis. A lower field count, extra testimonial or new headline does not guarantee a conversion lift.

Prioritize concrete defects and evidence-backed opportunities by likely effect, confidence, effort and reversibility. Choose experiments the traffic and budget can support; retain guardrails for retention, qualified leads, fraud, revenue or support burden as relevant. Do not assume an unavailable experiment skill or analytics connector exists.

For implementation, make the requested change, test meaningful success/error/recovery paths, inspect the affected viewport, and follow project delivery rules. Report what changed, the evidence, and material limitations. A review can end with a concise prioritized recommendation; it does not require a full funnel report or several creative alternatives.

Sending lifecycle messages, publishing content or changing spend needs matching authorization. Do not turn an activation recommendation into automatic outreach or a new recurring monitor.
