# Application Architecture

## Technology Stack
- TypeScript 5.9 (strict mode)
- React 18 with `createRoot` and StrictMode
- React Router v6 (BrowserRouter)
- Context API + `useReducer` (for state — no Redux)
- Native `fetch` API (no Axios)
- Recharts v2 (charting library)
- Plain CSS with dark theme (no CSS Modules, no Tailwind)
- Vite 7 (build tool, dev server, plugins)
- Vitest 4 + React Testing Library (unit/component tests, jsdom environment)
- Playwright (E2E tests against production build)
- semantic-release (automated versioning via GitHub Actions)

## Application Domain
- Turkish-language salary purchasing power calculator
- Fetches economic data from TCMB EVDS (Turkish Central Bank) API
- All user-facing text is in Turkish
- Deployed to GitHub Pages at `relary.sen.kim`

## Project Structure
```
src/
  app/                     # Application-level setup
    routes/                # Route definitions (HomePage, NotFound)
    providers/             # ErrorBoundary, AppStoreProvider, BrowserRouter
    store/                 # Context + useReducer global state
    config/                # API client (fetch wrapper), constants

  features/                # Feature-based modules grouped by domain
    timeseries/            # Main (and currently only) feature
      components/          # Chart (Recharts), SeriesSelector
      pages/               # HomePage
      api/                 # seriesLoader (remote JSON), service
      index.ts             # Public exports

  shared/                  # Reusable cross-feature utilities and components
    components/            # Header, Footer, ErrorMessage, NotFound, Placeholder
    evds/                  # TCMB EVDS v3 API client library + types
    hooks/                 # Reusable hooks
    utils/                 # Timeseries parsing, interpolation, chart data building, storage
    types/                 # Global types (AppState, TimeseriesPoint, etc.)

  assets/                  # Static assets
  test/                    # Vitest setup (setup.ts)

tools/                     # Standalone Node.js scripts (run via tsx)
  fetch-series.ts          # Fetches EVDS data → data/series.json
  prerender.ts             # Playwright-based build-time prerendering

data/
  series.json              # Cached EVDS series data (fetched by tools/fetch-series.ts)

e2e/                       # Playwright E2E tests (run against production build)

public/                    # Static public assets (manifest.json, sitemap.xml, robots.txt)
```

## Design Patterns
- Single Page Application with build-time prerendering for SEO
- Context + `useReducer` with split `StateContext` / `DispatchContext`
- Action helpers exported as `actions.*` for ergonomic dispatch
- Custom hooks: `useAppState()`, `useAppDispatch()` for store access
- Service layer: `seriesLoader.ts` fetches remote JSON, `evds/client.ts` wraps TCMB API
- Derived series: inflation normalization and purchasing power computed from user input + EVDS data
- Feature comments reference feature IDs (e.g., `// F0615: ...`)

## State Shape
```typescript
AppState {
  timeseries: {
    userSeries: TimeseriesPoint[]
    remoteSeries: Record<string, TimeseriesPoint[]>
    availableSeries: string[]
    selectedSeries: Record<string, boolean>
    status: 'idle' | 'loading' | 'error'
    error: string | null
  }
}
```

## Data Flow
1. On load: `seriesLoader` fetches `series.json` from GitHub Pages (fallback: local file)
2. EVDS series stored in `remoteSeries` (codes: `TP.DK.USD.A.YTL`, `TP.DK.EUR.A.YTL`, `TP.FG.J0`)
3. User enters salary data as date-value pairs (multiline text)
4. Derived series auto-generated: `Gelir(USD)`, `Gelir(EUR)`, `Enflasyon`, `Alım gücü`
5. All dates normalized to 1st of month; gaps filled via monthly interpolation
6. Chart renders all series with independent Y axes via Recharts

## Date Formats
- User input accepts: `DD.MM.YYYY`, `MM.YYYY`, `MM-YYYY`, `D.M.YYYY`, `D-M-YYYY`
- Internal: UTC timestamps (1st of month)
- EVDS API: `DD-MM-YYYY`
- series.json storage: `YYYY.MM.DD`
- Chart display: `MM.YYYY`

## Naming Conventions
- Components: PascalCase (e.g., `HomePage.tsx`, `Chart.tsx`)
- Hooks: camelCase with 'use' prefix (e.g., `useAppState.ts`)
- Utils: camelCase (e.g., `interpolateMonthlyTimeseries()`)
- Types/Interfaces: PascalCase (e.g., `TimeseriesPoint`, `AppState`)
- Constants: UPPER_SNAKE_CASE (e.g., `APP_NAME`, `API_BASE_URL`)

## Key Build Commands
- `npm run dev` — Vite dev server
- `npm run build` — TypeScript check + Vite production build
- `npm run build:prerender` — Build + Playwright prerendering
- `npm test` — Vitest unit tests (78 tests)
- `npm run test:e2e` — Playwright E2E tests (22 tests)
- `npm run fetch-series` — Fetch EVDS data into data/series.json
- `npm run lint` — ESLint (flat config)