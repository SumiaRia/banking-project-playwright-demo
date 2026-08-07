# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project purpose

A Playwright learning project, built as a portfolio-grade end-to-end test framework. The owner is learning Playwright, so favour patterns a hiring reviewer would recognise (Page Object Model, fixtures, externalised test data) over shortcuts, and explain new concepts the first time they appear.

**Language is JavaScript, not TypeScript** — this was a deliberate choice. Do not introduce `.ts` files or convert the framework.

## Learning curriculum

The project is built module by module. Each module lands working code in the repo, and earlier modules get refactored as new concepts arrive — that is deliberate, so the learner feels the pain a pattern solves before being handed the pattern.

**Update the status column when a module is finished.** `/next-lesson` reads this table to know where to resume.

| # | Module | Concepts | Lands in repo | Status |
|---|---|---|---|---|
| 0 | Setup & scaffolding | Test runner, browser binaries, config anatomy | `playwright.config.js`, green sample run | ✅ Done |
| 1 | First real test | Locators, web-first assertions, auto-waiting, strict mode, codegen, trace viewer | `tests/login.spec.js` | ✅ Done |
| 2 | Real user flows | Forms, `selectOption`, native dialogs, tables, `test.step` | Manager: add customer, open account | ✅ Done |
| 3 | Page Object Model | Encapsulation, locator reuse, why raw specs rot | `pages/` layer | ⬜ Next |
| 4 | Fixtures & test data | Custom fixtures, unique data generators, setup/teardown, test isolation | `fixtures/`, `data/` | ⬜ |
| 5 | Config in depth | Projects, retries, traces, parallelism, `baseURL`, tags, sharding | Hardened `playwright.config.js` | ⬜ |
| 6 | Reporting & CI | HTML/JUnit reporters, GitHub Actions, artifacts, flake triage | Working `.github/workflows/` run | ⬜ |
| 7 | Advanced techniques | API setup via `request`, `storageState`, network mocking, accessibility, visual comparison | `tests/advanced/` | ⬜ |
| 8 | Portfolio polish | README, architecture notes, what to say about it in an interview | `README.md` | ⬜ |

### Teaching approach

- One concept at a time; do not jump ahead of the current module.
- The learner types the terminal commands themselves — give the exact command and explain what it does, then wait. Do not run installs, scaffolding or test runs on their behalf.
- Writing and editing project files is expected and fine; the restriction is on shell execution.
- Explain the *why* behind each pattern, and call out the mistake it prevents.

## Application under test

XYZ Bank, an AngularJS demo app: `https://www.globalsqa.com/angularJs-protractor/BankingProject/`

- Routes are hash-based: `#/login`, `#/customer`, `#/manager`, `#/account`
- `baseURL` is set in `playwright.config.js`, so use `page.goto('#/login')`, not absolute URLs
- **Bank Manager** section: Add Customer, Open Account, Customers (list with search + delete)
- **Customer** section: log in by picking a name from a `<select>`, then Deposit / Withdraw / Transactions
- Seeded customers: Hermoine Granger, Harry Potter, Ron Weasly, Albus Dumbledore, Neville Longbottom

### Gotchas specific to this app

- **No `data-testid` attributes anywhere.** Prefer `getByRole` / `getByLabel` / `getByPlaceholder`. Fall back to `#id` (e.g. `#userSelect`, `#currency`) where the app provides one. Avoid CSS descended from Bootstrap classes — they are not stable identifiers.
- Some controls are hidden until a prior field is filled (e.g. the customer-login **Login** button carries `ng-hide` until a name is selected). Rely on Playwright's auto-waiting rather than adding manual waits.
- Manager forms trigger native `alert()` dialogs on submit. Register `page.on('dialog', ...)` **before** the click that triggers them.
- **There is no server.** All state lives in an in-memory AngularJS service and resets on every page load. See the test data policy below.
- The **Delete** button in the Customers table fires **no dialog** — deletion is immediate. Only Add Customer and Open Account raise `alert()`.

## Test data policy

The app has **no server-side persistence**. State lives in an in-memory AngularJS service and resets on every page load, and each Playwright test gets a fresh browser context — so every test already starts from the five seeded customers. Verified 2026-08-07: a customer added by a passing test was absent from a fresh page load moments later.

Test isolation is therefore free here. Cleanup is not needed to keep runs independent, and a test that fails to clean up pollutes nothing.

The conventions below are still enforced, as deliberate practice for real apps where state *does* persist:

- Generate **unique** data per run (timestamp or random suffix) for anything a test creates — never hardcode a customer name a test will add.
- **Clean up** what a test created (delete the customer via the Customers table) where the flow allows it.
- Read-only tests may use the seeded customers above.

Do not let a test depend on state created by another test — that would be a real failure here, since contexts do not share state at all.

## Conventions

- `tests/` — specs, named `*.spec.js`
- `pages/` — Page Object Model classes, one per screen
- `fixtures/` — custom Playwright fixtures
- `data/` — test data and generators

**Never use `page.waitForTimeout()`.** This AngularJS app constantly tempts you into it. Use web-first assertions (`await expect(locator).toBeVisible()`) which retry automatically. A fixed sleep is either flaky or slow, usually both.

Prefer `await expect(locator)` assertions over `expect(await locator.textContent())` — only the former auto-retries.

`getByRole` name matching is **substring and case-insensitive by default**. This app has "Login", "Customer Login" and "Bank Manager Login" on adjacent screens, so pass `exact: true` when targeting "Login" or you will hit a strict-mode violation.

An assertion that something is **absent** (`toBeHidden`, `toHaveCount(0)`) also passes when the element does not exist — including when the page has not navigated yet. Always precede it with a positive assertion proving you are on the right screen.

## Commands

```bash
npm test              # Chromium only — the default local loop
npm run test:all      # all three browsers
npm run test:ui       # interactive UI mode, best for debugging
npm run test:headed   # watch the browser
npm run test:debug    # step through with the inspector
npm run report        # open the last HTML report
npm run codegen       # record actions against the app to discover locators
npm run format        # Prettier (run manually; there is no format hook)
```

Open the trace from a failed run (the path is printed in the failure output):

```bash
npx playwright show-trace test-results/<test-dir>/trace.zip
```

Run a single test file: `npx playwright test tests/login.spec.js --project=chromium`
Run a single test by name: `npx playwright test -g "customer can log in" --project=chromium`

All three browser projects stay defined in `playwright.config.js`; local speed comes from `--project=chromium` in the `test` script, not from removing projects. CI runs `npx playwright test` and therefore covers all three.

## Repo state

This is **not a git repository yet** — `git init` has not been run, though `.gitignore` and `.github/workflows/playwright.yml` are already in place. Do not assume git commands will work.
