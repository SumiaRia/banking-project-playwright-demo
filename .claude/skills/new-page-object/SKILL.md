---
name: new-page-object
description: Scaffold a Page Object Model class (and optionally its spec) for a screen of the XYZ Bank app, following this project's conventions. Use when the user types /new-page-object or asks for a page object for a new screen.
disable-model-invocation: true
---

# Scaffold a page object

Create a Page Object Model class for the screen named in `$ARGUMENTS` (e.g. `/new-page-object deposit`). If no argument is given, ask which screen it is for.

## Before writing anything

1. Read an existing file in `pages/` to match the established style. **The existing code wins over the template below** — this project's conventions evolve, and consistency matters more than this file.
2. If `pages/` does not exist yet, the user has not reached Module 3. Say so and ask whether they want to jump ahead or continue the curriculum in order.
3. Open the relevant screen's markup to confirm real locators. Do not guess selectors — either ask the user to run `npx playwright codegen` and paste what it produces, or inspect the live app.

## Conventions

- One class per screen, file named `<screen>.page.js` in `pages/`, class named `<Screen>Page`.
- Constructor takes `page` and assigns locators as instance properties — **build locators in the constructor, never inside methods**, so they are declared once and reused.
- Locators are `Locator` objects, never resolved strings. Never `await` in the constructor.
- Methods are actions phrased in the user's language (`login(name)`, `deposit(amount)`), each returning a promise.
- **Assertions do not belong in page objects** — they belong in specs. A page object may expose a locator or a getter for the spec to assert on.
- Prefer `getByRole` / `getByLabel` / `getByPlaceholder`; fall back to a stable `#id` where the app provides one. Avoid Bootstrap CSS classes.
- Plain JavaScript with JSDoc type hints where useful. **Never TypeScript.**

## Template

```js
// @ts-check

export class ExamplePage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
    this.someField = page.getByLabel('Some Label');
    this.submitButton = page.getByRole('button', { name: 'Submit' });
  }

  async goto() {
    await this.page.goto('#/example');
  }

  /** @param {string} value */
  async submit(value) {
    await this.someField.fill(value);
    await this.submitButton.click();
  }
}
```

## After creating the class

Ask whether they want a matching spec in `tests/`. If yes, write one real test that exercises the happy path — not a placeholder — and remind them to run it:

```bash
npx playwright test tests/<name>.spec.js --project=chromium
```

Respect the project rule that **the user runs terminal commands themselves**; give the command, do not execute it.
