# Application Architecture

## Technology Stack
- Typescript
- React 18+
- React Router (for routing)
- Context API / Redux (for state)
- Axios (for API calls)
- CSS Modules / Tailwind (for styling)
- Use Jest and React Testing Library for unit and component testing

## Project Structure
```
src/
  app/                     # Application-level setup (global providers, router, store)
    routes/                # Route definitions and route configuration
    providers/             # React Router, Redux/Context, and other app-wide providers
    store/                 # Global state (Redux slices or Context providers)
    config/                # App configuration (env vars, axios config, constants)

  features/                # Feature-based modules grouped by domain
    <feature-name>/        # Each feature contains its own logic
      components/          # Feature-specific UI components
      pages/               # Route-level screens for the feature
      hooks/               # Feature-specific React hooks
      api/                 # Axios calls and API helpers for that feature
      types/               # TypeScript types/interfaces for the feature
      index.ts             # Public exports of the feature

  shared/                  # Reusable cross-feature utilities and components
    components/            # Common UI elements (buttons, modals, inputs)
    hooks/                 # Reusable non-feature-specific hooks
    utils/                 # Pure utility functions
    types/                 # Global TypeScript types
    layouts/               # Layout components shared across pages

  styles/                  # Global CSS and Tailwind setup
    globals.css            # Global styles and CSS reset
    tailwind.css           # Tailwind base and configuration

  assets/                  # Static assets (images, icons, fonts)

  lib/                     # Technical libraries and wrappers
    axios/                 # Axios base client, interceptors, request helpers
    router/                # Router creation helpers or wrappers

  tests/                   # Testing infrastructure
    setupTests.ts          # Jest + RTL setup file
    __mocks__/             # Jest mocks (files, styles)
    utils/                 # Test utilities (e.g., renderWithProviders)
```

## Design Patterns
- Single Page Application
- Custom hooks for logic encapsulation and shared logic
- Context for global state
- Service layer for API abstraction

## Naming Conventions
- Components: PascalCase (e.g., UserProfile.js)
- Hooks: camelCase with 'use' prefix (e.g., useAuth.ts)
- Utils: camelCase (e.g., formatDate.ts)
- Constants: UPPER_SNAKE_CASE