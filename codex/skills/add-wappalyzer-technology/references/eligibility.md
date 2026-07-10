# Eligibility

Apply this gate before deep research.

## Acceptable candidates

- A maintained technology with meaningful independent public adoption and a website-facing implementation that can be identified reliably.
- A substantial single-purpose product such as a CDN, chat platform, scheduling product, payment method, hosted status page, or embedded service. Single-purpose alone is not a rejection reason.
- A server-side concept that fits the taxonomy and can be implied safely by an existing detectable technology, even when direct browser detection is unrealistic.

## Reject or stop early

- Tiny utility libraries, UI components, niche one-off plugins, abandoned/dead products, or candidates without a meaningful independent footprint.
- Agencies, consultancies, bespoke company-built solutions, and other entries that are not independently identifiable software products.
- Purely internal, desktop-only, on-premises, or server-only products with no public website integration and no safe implication path.
- A request that fails the extension scoped first-party/third-party detection boundary.
- Candidates whose identity or implementation cannot be distinguished reliably after reasonable browser research.

## Classification questions

1. Is the host page built with this technology or directly integrating this product?
2. Does the candidate create useful independent detection value at Wappalyzer’s scale?
3. Is there a plausible browser signal, or a safe existing `implies` path?
4. Can the required positive/control evidence be gathered without matching unrelated sites?

If any required answer remains no, explain the decision instead of forcing a definition.
