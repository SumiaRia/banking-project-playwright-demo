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
| 3 | Page Object Model | Encapsulation, locator reuse, why raw specs rot | `pages/` layer | 🔄 In progress — `LoginPage` done and `tests/login.spec.js` refactored; manager screens next |
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
- Once the Add Customer form is open, **two buttons read "Add Customer"** — the tab and the form's submit. The names are identical, so `exact: true` does not help. Scope the submit to the form (`page.locator('form').getByRole('button', …)`) and the tab to the tab bar.

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

The positive assertion is also what absorbs a slow app. Under parallel load this demo site has taken **over five seconds** to route after a click; a checkpoint asserting something that was already true on the previous screen waits for nothing and the next line fails. Assert on an element that exists *only* on the destination.

### Page Object Model conventions

- **One class per screen the user perceives, not per URL.** All three manager tabs live at `#/manager` but are separate screens, so they get separate classes (`ManagerPage` for the tab bar, then `AddCustomerPage`, `OpenAccountPage`, `CustomersPage`).
- File `pages/<screen>.page.js`, class `<Screen>Page`. Plain JS with JSDoc type hints.
- **Build locators in the constructor, never inside methods.** A `Locator` is a lazy description, not a DOM lookup, so it is safe to create one for an element that does not exist yet. Never `await` in a constructor.
- **No assertions in page objects.** They expose locators; specs assert on them. Page objects may return data (e.g. alert text) for a spec to assert on.
- Methods are named in the user's language (`loginAsCustomer(name)`, `addCustomer(customer)`), not the DOM's.
- **Prefer scoping over `.first()`.** Build locators from other locators (`this.form.getByPlaceholder('First Name')`) so they describe structure rather than position. Reach for `.first()` only when names are genuinely identical and no container distinguishes them.
- App-specific locator traps (`exact: true` on "Login", the "Add Customer" collision below) belong **inside** the page object, so no future spec can get them wrong.
- Page objects should not attach page-wide event listeners (`page.on('dialog', ...)`). Dialog handling stays in specs until Module 4 gives it a fixture.

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

Git repository since 2026-08-07. Remote `origin` is GitHub over **SSH**:

```
git@github.com:SumiaRia/banking-project-playwright-demo.git
```

Two branches, both with upstreams configured:

| Branch | Role |
|---|---|
| `main` | Known-good code. Only ever receives merges from `dev` — do not commit to it directly. |
| `dev` | Where module work lands. This is the default working branch. |

At the end of each finished module, promote `dev` to `main`:

```bash
git switch main
git merge dev
git push
git switch dev
```

Because the remote is SSH, use `git@github.com:` URLs, not `https://`. `gh` is configured with `git_protocol ssh`.

`.gitignore` covers `node_modules/`, Playwright output dirs, `.DS_Store`, `CLAUDE.local.md` and `.claude/settings.local.json`. `.claude/skills/` and `CLAUDE.md` itself are committed deliberately — they are project tooling.
