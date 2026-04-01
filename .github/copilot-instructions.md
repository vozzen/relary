# GitHub Copilot Instructions

## Workflow Rules

### 1. Feature-Driven Development
- Always check `docs/PROGRESS.md` first
- Implement ONE feature at a time
- Create a branch named `feature/FXXX-description` for each feature
- Commit changes with semantic messages
- Update tracking files after each feature
- Prompt user for merging to main branch
- Use context7 MCP for fetching documentation and sample code regarding libraries and technologies used

### 2. File Reading Protocol
Before implementing any feature:
```
1. Read docs/PROGRESS.md
2. Read docs/FEATURES.md
3. Identify current feature ID
4. Read docs/ARCHITECTURE.md (if exists)
```

### 3. Implementation Steps
For each feature:
```
1. Update FEATURES.md: Change status to 🟡
2. Implement the feature completely.
3. Add new unit and e2e tests if applicable.
4. Ensure it builds successfully
5. Test the feature works as intended.
6. Update FEATURES.md: Change status to 🟢
7. Update PROGRESS.md: Add completion entry
8. Commit with proper format
9. Move to next feature
```

### 4. Commit Format
Use semantic commit messages:
```
feat(F001): initialize project structure
fix(F003): resolve state management import error
docs(F002): update routing documentation
```

### 5. Code Standards
- Use functional components with hooks (class components only for ErrorBoundary)
- Implement error boundaries
- Use TypeScript types/interfaces (not PropTypes)
- Include JSDoc comments for complex functions
- Follow ESLint rules (flat config)
- All user-facing text must be in Turkish
- Use native `fetch` for HTTP calls (not Axios)
- Use Context + `useReducer` for state (not Redux)
- Use plain CSS for styling (not CSS Modules or Tailwind)
- Reference feature IDs in code comments (e.g., `// F0615: ...`)

### 6. Testing
- Use Vitest (not Jest) for unit and component tests
- Use Playwright for E2E tests (run against production build)
- Write tests for each feature when applicable
- Ensure existing tests pass before moving on
- Run `npm test` for unit tests, `npm run test:e2e` for E2E
- Place E2E tests in `e2e/` directory, unit tests colocated with source

### 7. Self-Check Questions
Before marking a feature complete:
- [ ] Does it work as intended?
- [ ] Are there any console errors?
- [ ] Is it responsive?
- [ ] Are edge cases handled?
- [ ] Is it documented?

### 8. Bug Fixing
If user reports a bug:
```
0. Read BUGS.md to get next Bug ID if user didn't provide one
1. Create branch: fix/BUGID-description. 
2. Create a test reproducing the bug and ensure it fails
3. Fix the bug. Consider FEATURES.md if related to a feature.
4. Ensure all tests pass.
5. Commit with format: fix(BUGID): <description>.
6. Update PROGRESS.md with next Bug ID and a description of the bug in relevant sections.
7. Prompt user for merging to main branch and push.
8. When user confirms, ensure main branch is updated with latest changes from origin. Merge branch into main by squashing and push. Then delete the branch.
```

### 9. Date & Data Conventions
- User input dates: `DD.MM.YYYY`, `MM.YYYY`, `MM-YYYY`, `D.M.YYYY`, `D-M-YYYY`
- All dates are normalized to 1st of month internally (UTC timestamps)
- EVDS API dates: `DD-MM-YYYY`
- series.json dates: `YYYY.MM.DD`
- Timeseries gaps are filled via monthly interpolation

### 10. Key Build Commands
- `npm run dev` — Vite dev server
- `npm run build` — TypeScript + Vite production build
- `npm run build:prerender` — Build + Playwright prerendering for SEO
- `npm test` — Vitest unit tests
- `npm run test:e2e` — Playwright E2E tests
- `npm run fetch-series` — Fetch EVDS data into data/series.json
- `npm run lint` — ESLint

## Auto-Progress Mode

To enable fully autonomous development:
1. AI reads PROGRESS.md
2. AI identifies next feature
3. AI implements feature completely
4. AI updates all tracking files
5. AI commits changes
6. AI repeats from step 1

## Error Handling
If blocked:
1. Update FEATURES.md status to ⚪
2. Add blocker description to PROGRESS.md
3. Move to next unblocked feature
4. Return to blocked feature when resolved
