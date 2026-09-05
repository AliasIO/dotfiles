---
name: testing-setup
description: Analyze and create a testing strategy for native Android apps - install
  testing libraries, set up test infrastructure, create harnesses for unit tests,
  UI tests, screenshot tests, and end-to-end tests.
license: Complete terms in LICENSE.txt
metadata:
  author: Google LLC
  last-updated: '2026-06-02'
  keywords:
  - android
  - testing
  - ui tests
  - screenshot tests
  - coverage
---

Use only the steps relevant to the requested testing capability. Existing runners, architecture, and authorized scope control the setup; a focused regression does not require database, navigation, screenshot, and end-to-end suites.

## Step 1: analyze the current testing setup

To understand the testing setup of an existing project, look for these
dependencies in the libs.versions.toml file, or build files:

1. Dependency Injection framework used. Examples: Hilt, Koin, Anvil, vanilla Dagger...
2. Unit (local) testing framework this project uses, Example JUnit4, JUnit5...
3. Mocking framework (if any) used for unit tests, and for Instrumented and UI tests. Examples: Mockito, Mockk...
4. Robolectric. It can be used in 3 ways:
   1. Used in unit tests to have fakes for platform entities
   2. To run behavior UI tests without a device or emulator. For example, used to run Espresso or Compose tests.
   3. To do screenshot testing with Roborazzi
5. Is the app 100% Compose, Views or hybrid?
6. Behavior UI tests:
   1. Compose Tests (`androidx.compose.ui:ui-test-*`)
   2. Espresso Tests for Views. Might use wrappers like Kaspresso. Dependencies: `androidx.test.espresso:espresso-core`, `androidx.test:runner`, `androidx.test:rules`.
7. Screenshot tests can be:
   1. Instrumented (device-based). For example, using Dropshots.
   2. Based on Robolectric, so they run locally. For example, using Roborazzi.
   3. Based on LayoutLib, so they run locally. For example, Paparazzi, or the Compose Preview Screenshot Testing tool.
8. End to end tests (also known as Release Candidate tests) always run on device and use high-level frameworks such as UIAutomator, Appium, or Robotium.
9. Summarize the relevant existing setup; create a durable report only when requested or useful for the scope.

## Step 2: Use the existing dependency boundaries

Reuse the project’s DI framework if present. For a focused test, prefer existing constructors, factories, fakes or test hooks. Do not install Hilt, Koin or another DI framework merely because none is present. Propose an architectural migration only if the requested testing strategy requires it and the tradeoff is material.

If instrumented tests use Hilt, consult the [Hilt testing guide](references/android/training/dependency-injection/hilt-testing.md) and configure only the runner/rules needed by those tests. Consult the applicable framework’s current docs for other stacks.

## Step 3: Add only the required test capability

Respect existing versions and frameworks. A pure logic regression usually needs only the existing unit-test runner. Add Compose Test or Espresso for requested UI behavior, device tests for platform behavior, and screenshot tooling only for visual regression work. Choose one suitable screenshot route rather than installing several by default. Add mocking or coverage dependencies only when they solve a concrete requirement.

Read the [Compose screenshot setup](references/android/studio/preview/compose-screenshot-testing.md) only when that route is selected. Match source sets to the runner actually used; do not move existing instrumented tests to Robolectric automatically.

## Step 4: Refactor and create fakes for testing

### **Refactor for unit tests**

In the next sections you'll be asked to create tests. If you have dependencies
on Android framework classes, or entities that are not part of the codebase:

- First, use a fake. If it doesn't exist, create an interface for the class
  and a "Default" implementation with the existing code. Add the Fake version
  to the test sourceset (test or androidTest).

- If not possible to use a fake (example: no access to the class or
  interface), mock the dependencies.

### **Refactor for UI tests**

If you need to fake components to make testing easier and faster and more
reliable, replace slow and problematic dependencies with fakes. Use the existing dependency boundaries and runtime fakes where needed to:

- **Simulate** different scenarios with the user (wrong credentials, reset password flow...), with a server (no connection, server down, bad JSON from server...) or with a platform component (insufficient permissions, no disk space, no front camera available)
- **Improve** speed and reliability (replacing a database with an in-memory database, replacing a repository with an in-memory fake to avoid hitting the network)

## Step 5: Unit testing

Add or review tests for the requested behavior and relevant regression boundary.
Expand coverage only when a broader testing strategy is requested.
Don't create unit tests for Activities, Compose layouts, or dependency injection
configuration files.

## Step 6: UI testing

Use `test` for the project’s local/Robolectric runner and `androidTest` for its instrumented runner. Preserve the established route unless changing it is part of the task.

## Step 7: Test databases

If the database is using SQLite (using Room, SQLDelight, etc.), create
instrumented tests using an in-memory database to make sure that they work with
the SQLite engine on device.

## Step 8: Screenshot tests

When visual regression testing is in scope, select representative supported layouts and states. The following matrix is an example; do not require every size for every small change:

- Screen-level screenshot tests, where each screen is tested in 9 different sizes, combining compact, medium and expanded widths (400, 610, 900 dp) and heights (400, 500 and 1000 dp).
- Screen-level variations. Add a mobile (400x500) screenshot of:
  - All the alternative themes, if used.
  - Font scale set to 1.5.
- Component-level screenshot tests, where each component is tested in different themes and font scales.

Behavior isn't tested with screenshots, but do test different common scenarios
if their UIs change a lot depending on the state. For example, test loading
screens by injecting a loading state to the UI or simulating it with a fake.

## Step 9: UI Behavior tests

Test the UI logic using behavior tests, which ensures that the UIs react as
expected when different states are passed, and when user actions are performed.

### **Compose UI behavior tests**

- Use the ComposeTestRule with a `ComponentActivity` to access resources such as strings.
- Always try to match with semantic matchers first. If the matcher is too complicated to write (using more than 3 matchers to find a single element), use `testTag`.
- Always verify state restoration

### **Views (XML) UI behavior tests**

Use Espresso to match views and interact with them.

## Step 10: Navigation tests

Create a test suite to verify navigation logic. Include:

- Back handling
- Deeplinks
- Special patterns like "exit through home" with multiple backstacks.

## Step 11: Simulate different window sizes and settings

For Compose layouts, use `DeviceConfigurationOverride` described in "[UI testing
common patterns](references/android/develop/ui/compose/testing/common-patterns.md)" to simulate different window sizes, font scales

## Step 12: End-to-end tests

When end-to-end tests are needed, cover the critical user journeys with a small meaningful set; do not target an arbitrary percentage of all tests. Use Compose Test APIs or Espresso for that. If you have to access
platform features (notifications, system UI...), use UI Automator.

If you need to take screenshots of the app running in a device, use
[Dropshots](https://raw.githubusercontent.com/dropbox/dropshots/refs/heads/main/README.md). You need a device for screenshot tests when verifying
interaction with the system UI (examples: edge-to-edge rendering, notifications,
picture-in-picture)

## Optional device screenshots and coverage

Use the project’s existing device screenshot framework when system UI must be verified. Install a new plugin only when that capability is required and absent. Configure coverage only if the requested work needs coverage reporting; do not add Jacoco to every module by default.

## Final touches

Run the relevant tests and report failures or unverified behavior. Document durable testing commands in the existing project documentation when that is part of the requested strategy work. Respect canonical AGENTS.md sources and do not create or rewrite instruction files for a routine test addition.
