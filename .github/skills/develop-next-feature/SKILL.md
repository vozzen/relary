---
name: develop-next-feature
description: "Find and implement the next feature from FEATURES.md. Use when: developing features, building next feature, auto-progress mode, continuing development, feature implementation workflow."
argument-hint: "Optionally provide a feature ID (e.g. F0810) to implement a specific feature"
---

# Develop Next Feature

ACTIVELY MAKE CHANGES — don't just explain. Follow the feature-driven workflow in `copilot-instructions.md` (Sections 1–5, 7).

## Procedure

### 1. Identify the Next Feature
1. Read `docs/PROGRESS.md` → understand current sprint status.
2. Read `docs/FEATURES.md` → find the first feature with 🔴 (Not Started) status.
3. If the user provided a feature ID, use that instead.
4. Read `docs/ARCHITECTURE.md` for structural context.
5. If no 🔴 features remain, report that all features are complete and stop.

### 2. Set Up
1. Create branch: `feature/<FXXX>-<short-description>` from current HEAD.
2. Update `docs/FEATURES.md`: change the target feature's status from 🔴 to 🟡.

### 3. Implement
1. Read the feature description carefully — implement exactly what is specified.
2. Follow code standards from `copilot-instructions.md` Section 5:
   - Functional components with hooks
   - TypeScript types/interfaces
   - Plain CSS (no Modules or Tailwind)
   - All user-facing text in Turkish
   - Reference feature ID in code comments (e.g., `// F0810: ...`)
   - Native `fetch` for HTTP, Context + `useReducer` for state
3. Use context7 MCP for library documentation when needed.

### 4. Test
1. Add unit tests (Vitest, colocated with source) and/or E2E tests (Playwright, in `e2e/`) if applicable.
2. Run `npm test` — all unit tests must pass.
3. Run `npm run build` — must succeed.
4. Run `npm run test:e2e` — all E2E tests must pass.

### 5. Self-Check
Before marking complete, verify:
- [ ] Feature works as described in FEATURES.md
- [ ] No console errors
- [ ] Responsive design maintained
- [ ] Edge cases handled
- [ ] Existing tests still pass

### 6. Update Tracking
1. `docs/FEATURES.md`: change feature status from 🟡 to 🟢.
2. `docs/PROGRESS.md`: add a completion entry for the feature under the current session.

### 7. Commit & Merge
1. Commit: `feat(<FXXX>): <description>`.
2. Prompt user to merge to main and push.
3. On confirm: update main from origin, squash-merge, push, delete branch.

## Handling Blockers
If the feature cannot be completed:
1. Update `docs/FEATURES.md`: change status to ⚪ (Blocked).
2. Add blocker description to `docs/PROGRESS.md`.
3. Move to the next 🔴 feature.
