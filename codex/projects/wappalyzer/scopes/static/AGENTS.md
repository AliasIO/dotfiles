# Static Crawler Instructions

- `static/` is canonical for the browserless single-URL crawler.
- `static/wappalyzer` is an extension consumer. Never patch it directly; use the dependency propagation workflow.
- Keep browserless behavior isolated from the browser-backed CLI unless an explicitly shared contract requires aligned changes and validation in both repositories.
