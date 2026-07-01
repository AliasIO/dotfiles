# Project Instructions

- Always work on the `master` branch for this project.
- After making code changes, commit them to Git and push the commit.
- After making changes, rebuild the app and install the rebuilt app into the simulator so the changes are visible for manual testing. If no simulator is already booted, boot the standard `iPhone 17` simulator and install there. Do not test in the simulator automatically. Keep the simulator window open. Do not close, move, or mirror the simulator window unless explicitly asked.
- Avoid commands such as simulator test runners that create a second or cloned simulator window. Prefer compile-only builds plus installing the built app into the active simulator unless the user explicitly asks to run simulator tests.
- For minor UI-only or low-risk edits, do not run the full simulator test suite by default. Use a compile-only build plus install unless the user asks for tests or the change touches shared logic, persistence, import/export behavior, reminders, search/filtering, or other higher-risk paths.
