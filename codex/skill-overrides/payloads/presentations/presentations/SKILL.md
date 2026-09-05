---
name: Presentations
description: Read, create or edit PowerPoint or Google Slides decks. Use for presentation, slide deck, PowerPoint, PPT, PPTX, or Google Slides requests.
---

# Presentations

Read the guidance relevant to each part of the request; a user may ask you to explain, edit and create in the same task. If they only ask questions about a deck, inspect it without making changes. Before editing an existing deck or following a template, read [template following](references/template_following.md). When creating or changing slide layouts, read [visual design guidance](style_guidelines.md). For Google Slides, read [Google Slides routing](routing/google_slides.md) first.

Proceed when the request is clear. Ask only when missing information would change what you make or how you make it.

## Artifact Template Selection

Open the template selection picker for creating new presentations when the user has not provided a template, reference, or visual direction. Also open the picker when the user asks to browse or upload templates. Do not open it if the user declines templates, requests a connected-source design search, or if `list_artifact_templates` is unavailable this turn. Subject matter, audience, tone, company names, and source files do not by themselves specify a template or visual direction.

Call `list_artifact_templates({artifactKind, request})` with `artifactKind: "presentation"`, or `"google-slides"` for Google Slides requests. Include compatible Office and Google templates without changing the requested output format.

Rank templates by relevance, breaking ties in favor of personal or shared templates. Include a mix of styles. Pass their `skillName` values unchanged to `choose_artifact_template({artifactKind, request, templates})` and call it once. Set `includeAllTemplates: true` only when the user requests the full catalog. The picker displays at most ten templates.

Follow the selected template or uploaded reference. Save an uploaded reference only when `saveForFutureUse` is true. Use Template Creator with the returned `displayName`. Continue without a template if the picker is declined, cancelled, unavailable, or fails. Do not replace the picker with `request_user_input` or a chat list. Browsing templates does not authorize artifact creation.

## Writing quality

Use clear, direct prose, supported claims and meaningful titles. Preserve user-provided voice and templates. Read [writing examples](references/writing-style-examples.md) only when revising substantial wording or resolving a style problem.

## Important instructions

- Visual assets: DO NOT use Python to draw any images; DO NOT use programmatic vector shapes for visuals; DO NOT use programmatic drawings of any sort. Use image search or imagegen instead! By default, DO NOT reuse the same image more than once (unless it's a background). Not only do you need to prepare visuals for the main concept, you also need to get decorative visuals. Before sourcing or generating visuals, be mindful of the desired aspect ratio, placement, and cropping options on the slide. For example, if you intend to place text to the left of the image containing a person, you should ask imagegen to put the person on the right side of the image.
- Default styling: use one composition instead of a collection of UI panels. UI-like styling typically includes card grids, pills, badges, button-like text boxes, tab or navigation patterns, repeated modular panels, dense dashboard-style layouts, and other component-library aesthetics that imply interactivity. Use stylized text boxes less, favoring a flat structure on the canvas.
- Font size: When a template is provided, match its font sizes. Avoid overly small text. When no template or style guidance is given, a good rule of thumb is at least 42pt for deck titles, 32pt for slide titles, and 17pt for body text. If you see overflow/overlap, try cutting content before shrinking text further to improve text layout.
- Title slide: Keep the title slide minimal and simple. Avoid cramming in too much information.

### Scope clarification for editable evidence

The prohibition on programmatic drawings applies to illustrative and decorative visual assets. Keep required tables, data charts and explicitly requested editable diagrams as native slide objects. Do not use this exception to construct decorative graphics or UI-style panels.

## Requirements

**Follow the requested design.** Use the user's template, reference, branding and layout instructions before any defaults in this skill. Follow a supplied deck’s design when the user asks you to match or use it as a template. If the user supplies a deck only as a source of text, data or images, do not assume they want you to copy its design. Preserve the requested slide count; an N-slide request means N slides in total, including any cover, unless the user says otherwise. Do not add a cover to a one-slide deliverable by default.

**Write for the audience.** Keep commentary about creating or checking the deck out of slides, speaker notes and requested explanations. Keep validation records private unless requested.

**Keep facts accurate.** Base factual claims on supplied materials or sources gathered for the task. Do not invent facts, numbers or citations. Clearly identify assumptions and hypotheses. Keep caveats that affect the conclusion, and point out disagreements between sources when they affect the answer. When summarizing or calculating, preserve the units, comparison being made and meaning.

**Keep content editable and complete.** Keep required tables, charts and diagrams editable. Retain requested rows, columns, labels and source images; do not replace evidence with decorative graphics. Use original files for logos and artwork that must remain unchanged; preserve their proportions and required placement. Cite external facts and images in the relevant slide's speaker notes. Keep citations and disclosures on the slide when they must be visible to the audience.

## Titles

**Name the subject directly.** For process, overview, definition, and setup slides, prefer a concise noun phrase that identifies the actual subject. Make plain topic titles the default for these slides. A clear topic label can be more useful than a full sentence, question, or takeaway. Choose the form that best describes what the slide actually shows. Avoid turning setup or background slides into claims, slogans, or announcements about the presentation.

For each title, consider whether a short noun phrase, an explanatory title, or a supported factual takeaway would serve the reader best. A noun phrase is an option to use - we don't always need to use noun phrases over sentences. Keep a good existing title when it already does the job.

Name the actual subject or distinction in plain language. Remove presenter narration such as "Start simple" and replace vague announcements such as "Two different questions" with the subjects being discussed. Do not force a title to sound like an insight. A setup slide can simply identify the information or assumptions it establishes.

Reconsider the title's framing before polishing its wording. Avoid generic narrative frames such as "From X to Y," "Two questions about...," or "Start with..." when a direct subject label is clearer. Replacing words within the same frame may leave the underlying problem intact.

| Don't write | You should instead write like this | Why it fits the slide |
| --- | --- | --- |
| "Start simple: a withdrawal reflex" | "The withdrawal reflex" | Names the mechanism explained by the diagram and removes the presenter's instruction. |
| "Two different questions about one behavior" | "Mechanism and evolution of behavior" | Names the two explanations that the slide compares. |
| "Same paycheck. Different purchasing power." or "The same take-home pay buys different amounts" | "Income and household assumptions" | Names the income and household setup used for the comparison. This slide establishes the baseline; it does not yet show a purchasing-power comparison. |
| "From first signal to verified recovery" or "From detection to post-incident review" | "Major incident response process" | Names the process being explained. The numbered steps already communicate the progression. |

Use a takeaway title when the slide establishes a specific finding. Use a range or progression when that progression itself is the subject. Do not force either form onto a slide that simply explains a topic.

Apply the writing quality instructions above and the punctuation rules below to whichever form you choose.

**Periods in titles and headings:** Remove trailing periods from short slide titles and section headings. Keep a terminal period only when the title or heading is a longer, complete sentence. A short complete sentence does not need a trailing period. Do not lengthen or otherwise rewrite a good title just to retain a period. Use normal punctuation in body text and preserve periods within abbreviations and numbers.

## Create or edit the deck

1. Read `references/implementation.md` and the [API quick start](artifact_tool_docs/API_QUICK_START.md) before coding. Use JavaScript ES modules with `@oai/artifact-tool`; do not use `python-pptx` or the obsolete Python API.
2. Follow the user’s requested order; otherwise, choose an order that covers the request without repetition. Give each slide a clear purpose. A factual summary, comparison or explanation is enough when the evidence does not support a recommendation.
3. Read additional guidance only when needed: [cover design](references/cover_art_direction.md) for a new cover; [editable tables and charts](references/native_evidence.md); [bullet formatting](references/native_bullets.md) for new lists; [finance](domain_guidance/finance.md) for financial presentations. Use the [API reference map](artifact_tool_docs/api/API_DOCS.md#reference-map) for other objects.
4. Export a draft PPTX in the private build directory, then follow [validation and delivery](references/finalization.md). Inspect the rendered slides and fix problems. Do not change the user's design just to satisfy an automated style suggestion.

## Review and handoff

Check content coverage, slide count, factual accuracy, template match, text fit and editability. Read titles and body text together: remove unsupported conclusions, repeated points, filler subtitles and comments about creating the deck. Inspect the slides to decide whether style warnings need a fix. Passing automated checks does not prove the writing or design is good.

Return the deck and any explanation the user requested. Do not add a recap of your edits or successful validation checks unless asked. Mention problems or limitations that affect use of the deck. Do not rate your own work or list every instruction you followed. Do not deliver temporary files unless requested. For read-only questions, answer directly and cite the source you inspected.

If you need to use LibreOffice, use the absolute path to bundled LibreOffice resolved through `load_workspace_dependencies`, never use the user's installed desktop LibreOffice even if the bundled version fails. Include this instruction and the bundled path in every subagent handoff.

If the app supports it, link the final deck once with `:codex-file-citation{path="/abs/path/deck.pptx" purpose="output"}`. Otherwise use the app's normal file link. Say you checked the deck in PowerPoint only if you opened and inspected it there.
