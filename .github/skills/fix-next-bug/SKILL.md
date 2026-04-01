---
name: fix-next-bug
description: "Fix the next bug from BUGS.md. Use when: resolving bugs, fixing reported issues, debugging workflow."
argument-hint: "Optionally provide a BUG-ID or description of the bug"
---

# Fix Next Bug

ACTIVELY MAKE CHANGES — don't just explain. Follow the bug-fixing workflow in `copilot-instructions.md` (Section 8).

## Procedure

### 1. Identify the Bug
1. Read `docs/BUGS.md` → find **Next Bug Id**.
2. Use the user-provided description, or ask.
3. Read `docs/FEATURES.md` to check for related features.

### 2. Set Up
1. Create branch: `fix/<BUG-ID>-<short-description>`.
2. Increment **Next Bug Id** in `docs/BUGS.md`.

### 3. Reproduce
1. Write a test (unit or E2E) that reproduces the bug.
2. Run the test and confirm it **fails**.
3. If the bug is not reproducible via automated tests (e.g., visual/layout issues, environment-specific), document manual reproduction steps as a comment in the test file and verify manually instead.

### 4. Fix
1. Implement the fix. Reference the bug ID in comments (e.g., `// BUG-003: ...`).
2. Run all tests (`npm test` and `npm run test:e2e`) — all must pass.
3. Run `npm run build` — must succeed.

### 5. Update Tracking
1. `docs/BUGS.md`: add bug to **Previous Bugs fixed** with description.
2. `docs/PROGRESS.md`: add completion entry.

### 6. Commit & Merge
1. Commit: `fix(<BUG-ID>): <description>`.
2. Prompt user to merge to main and push.
3. On confirm: update main from origin, squash-merge, push, delete branch.
