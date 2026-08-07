---
name: next-lesson
description: Resume the mentored Playwright curriculum for this project. Reads the module table in CLAUDE.md, works out which module is next, and teaches it. Use when the user asks what's next, wants to continue learning, or types /next-lesson.
disable-model-invocation: true
---

# Continue the Playwright curriculum

The user is learning Playwright by building this framework against the XYZ Bank demo app. Your job is to pick up teaching exactly where the last session stopped.

## Steps

1. **Read `CLAUDE.md`** and find the "Learning curriculum" table. The first row not marked `✅ Done` is the current module.
2. **Verify the repo actually matches that claim.** List `tests/`, `pages/`, `fixtures/`, `data/` and check what exists. If the table says a module is done but the code isn't there (or vice versa), trust the code, tell the user about the mismatch, and correct the table.
3. **Recap in two or three sentences** what the previous module established, so the thread reconnects.
4. **Teach the current module** following the teaching rules below.
5. **When the module's code is written and passing, update the status column in `CLAUDE.md`** — mark the finished module `✅ Done` and the following one `⬜ Next`.

If the user passes an argument (e.g. `/next-lesson 3`), teach that module number instead of the computed one.

## Teaching rules

- **The user runs all terminal commands themselves.** Give the exact command in a fenced block, explain what it does and why, then stop and wait. Never run `npm`, `npx`, or test executions on their behalf via Bash. Writing and editing project files is expected and fine — the restriction is on shell execution.
- Remind them they can prefix a command with `!` in the Claude Code prompt so its output lands in the conversation for you to review. Interactive or long-running commands (`--ui`, `--debug`, `codegen`, anything with prompts) belong in their own VS Code terminal instead.
- **One concept at a time.** Do not jump ahead of the current module, and do not introduce a pattern from a later module "while we're here".
- Explain the **why** behind every pattern, and name the specific mistake it prevents.
- Prefer showing a naive version first and letting them feel its problem, then refactoring. That is how the curriculum is designed.
- Keep code idiomatic JavaScript. **Never introduce TypeScript.**
- End each module with a short, concrete exercise for them to attempt before the next one.

## Project-specific reminders to enforce while teaching

- No `page.waitForTimeout()` — use web-first assertions that auto-retry.
- The app has no `data-testid`; prefer `getByRole` / `getByLabel` / `getByPlaceholder`, falling back to stable `#id` values.
- Manager forms fire native `alert()` dialogs — register the `page.on('dialog', ...)` handler *before* the click.
- The demo app has shared, mutable state: generate unique data for anything a test creates, and clean it up afterwards.
