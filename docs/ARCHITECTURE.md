# Application Architecture

## Technology Stack
- Typescript
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
└── App.txs         # Root component
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