# GitHub Copilot Instructions

## Workflow Rules

### 1. Feature-Driven Development
- Always check `docs/PROGRESS.md` first
- Implement ONE feature at a time
- Update tracking files after each feature

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
2. Implement the feature completely
3. Ensure it builds successfully
4. Test the feature works
5. Update FEATURES.md: Change status to 🟢
6. Update PROGRESS.md: Add completion entry
7. Commit with proper format
8. Move to next feature
```

### 4. Commit Format
Use semantic commit messages:
```
feat(F001): initialize project structure
fix(F003): resolve state management import error
docs(F002): update routing documentation
```

### 5. Code Standards
- Use functional components with hooks
- Implement error boundaries
- Add PropTypes or TypeScript types
- Include JSDoc comments for complex functions
- Follow ESLint rules

### 6. Testing
- Write tests for each feature when applicable
- Ensure existing tests pass before moving on

### 7. Self-Check Questions
Before marking a feature complete:
- [ ] Does it work as intended?
- [ ] Are there any console errors?
- [ ] Is it responsive?
- [ ] Are edge cases handled?
- [ ] Is it documented?

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
