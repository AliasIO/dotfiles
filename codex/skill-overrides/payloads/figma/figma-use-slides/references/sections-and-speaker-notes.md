## Sections

A section is a horizontal row in the slide grid — every row is a section. Names show up in the editor (next to the row) and in Presenter View (so speakers can jump between groups). They're an organizational aid for whoever is editing the deck — the user owns where the breaks fall, not you.

### When asked to organize a deck

"Organize this deck" is ambiguous — grouping, reordering, deduping, or restructuring. Read the deck before reaching for `AskUserQuestion`.

**Default: propose, don't ask.** Most decks have cues — title bookend, numbered use cases, repeated *Before / After* pairs, transition slides ("Then X enters the chat"), a *Thank you*. When cues exist, pick a sectioning and surface it in one confirmation message. Bounded calls inside the proposal (one *Use Cases* row vs. three, where a transition slide lives) are reversible — pick one and move on.

**Fallback: ask when cues are absent.** If slides are in arbitrary order or there's no spine, ask which ranges go together and what to call them. Don't slice by thirds as a substitute for reading.

### Naming + scoping

Names should be short (1–3 words), concrete (*Demo* beats *Show & tell*), and consistent within a deck. Two to five sections is typical; more only for long or repeating decks. Names aren't slide titles — they help find a group, not describe its content.

### Renaming a section

`getSlideGrid()` returns `SlideNode[][]` — the inner arrays are plain JS arrays of slides, NOT `SLIDE_ROW` nodes. Setting `.name` on those arrays silently no-ops. To rename a section, traverse the node tree and set `.name` on the actual `SLIDE_ROW`:

```js
const slideGrid = figma.currentPage.children.find(c => c.type === "SLIDE_GRID");
slideGrid.children[0].name = "Intro";
```

## Speaker Notes

Speaker notes are the presenter's private companion to each slide. They appear in Presenter View (visible only to the speaker, not the audience) and serve as a script, cue sheet, or talking-points reference during a live presentation.

### When to write speaker notes

- **When asked**: If the user asks for speaker notes, presenter notes, talking points, or a script for a deck, write notes for every slide that has substantive content (skip section dividers or purely decorative slides unless there's something to say).
- **Presenter-ready decks**: If the user explicitly asks for a deck that is ready to present live, speaker notes are useful. Add them when they help the presenter understand pacing, transitions, or context that is not visible on the slide.
- **Sparse or visual slides**: If a slide is built around a chart, image, metaphor, or provocative question, notes can help explain what the presenter should say. Use screenshots or `node.screenshot()` for image-heavy, chart-heavy, or visually sparse slides when visual context matters, but don't screenshot every slide by default — images spend context budget.
- **Don't add notes unprompted**: For normal slide edits, layout work, or updates to existing decks, do not populate speaker notes unless the user asks. Adding notes changes the presentation flow and can surprise the deck owner.

### What good speaker notes look like

Speaker notes are for the *presenter*, not the audience. They should feel like a trusted colleague leaning over and whispering "here's what to say." Good notes:

- **Complement the slide, not repeat it.** If the slide says "Revenue grew 40%", the notes shouldn't say "Revenue grew 40%." They should say *why* it grew, what the audience should take away, or what question this usually prompts.
- **Are concise and scannable.** A presenter glancing down mid-sentence needs to find their place instantly. Use short bullet points, not dense paragraphs. Each point should be one idea.
- **Include transitions.** The best notes tell the presenter how to *move* between slides: "After the applause dies down..." or "This builds on the previous point — call back to the 40% figure."
- **Carry context the slide can't.** Data sources ("Source: Q4 FY25 internal metrics, not yet public"), caveats ("Skip this slide if the CFO is in the room"), timing cues ("This is the halfway point — you should be at ~10 minutes"), and anticipated questions ("They'll ask about margins — see appendix slide 14").
- **Match the presentation's register.** Notes for an investor pitch are precise and rehearsed. Notes for a team retro are casual and flexible. Notes for a keynote might include stage directions. Match the tone to the context.

### What to avoid in speaker notes

- **Full scripts**: Wall-of-text notes encourage reading verbatim, which makes for a terrible presentation. If the user explicitly asks for a script, write one, but default to bullet points.
- **Formatting for the audience**: Notes aren't visible to the audience. Don't optimize them for readability by non-presenters.
- **Redundancy with the slide**: If the slide is self-explanatory ("Thank You" with contact info), notes aren't needed. It's fine to leave a slide's notes empty.

### Formatting

`slide.speakerNotes` accepts a markdown string. Prefer bullet lists as the primary structure; bold is useful for emphasis on key phrases the presenter shouldn't skip. See [slide-properties.md](../references/slide-properties.md#supported-formatting) for the full list of supported (lists, bold, italic, strikethrough) and unsupported (headings, code blocks, inline code, links) markdown.
