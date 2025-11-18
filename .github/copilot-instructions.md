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
3. Test the feature works
4. Update FEATURES.md: Change status to 🟢
5. Update PROGRESS.md: Add completion entry
6. Commit with proper format
7. Move to next feature
```

### 4. Commit Format
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
```

## Step 3: Create Architecture Document

### docs/ARCHITECTURE.md
```markdown
# Application Architecture

## Technology Stack
- React 18+
- React Router (for routing)
- Context API / Redux (for state)
- Axios (for API calls)
- CSS Modules / Tailwind (for styling)

## Project Structure
```
src/
├── components/     # Reusable UI components
├── pages/         # Page components
├── services/      # API services
├── context/       # Context providers
├── hooks/         # Custom hooks
├── utils/         # Helper functions
├── styles/        # Global styles
└── App.js         # Root component
```

## Design Patterns
- Container/Presentational component pattern
- Custom hooks for shared logic
- Context for global state
- Service layer for API abstraction

## Naming Conventions
- Components: PascalCase (e.g., UserProfile.js)
- Hooks: camelCase with 'use' prefix (e.g., useAuth.js)
- Utils: camelCase (e.g., formatDate.js)
- Constants: UPPER_SNAKE_CASE
```

## Step 4: Using with GitHub Copilot Agent Mode

### In VS Code:

1. **Open Copilot Chat** (Ctrl/Cmd + I)

2. **Start Agent Mode** with this prompt:
```
@workspace I want you to work autonomously on this React project. 

Please follow these rules:
1. Always read docs/PROGRESS.md first to know what to do next
2. Implement ONE feature at a time from docs/FEATURES.md
3. Update both FEATURES.md and PROGRESS.md after each feature
4. Follow the instructions in .github/copilot-instructions.md
5. Commit after each completed feature using the format: feat(F00X): description

Start with the next incomplete feature and continue autonomously until I stop you.
```

3. **Alternative Continuous Mode**:
```
@workspace Enter autonomous mode:
- Read docs/PROGRESS.md
- Implement next feature
- Update tracking files
- Commit
- Repeat

Begin now and continue until all Phase 1 features are complete.
```

## Step 5: Monitoring Progress

### Check Status Anytime:
```
@workspace Give me a status update:
- What feature are you working on?
- What have you completed?
- What's next?
- Any blockers?
```

### Resume After Break:
```
@workspace Resume autonomous development from where we left off. Check PROGRESS.md and continue with the next feature.
```