# Development Progress Log

## Current Sprint
**Focus**: Phase 6 features
**Status**: 🔄 In Progress
### 2025-11-21 - Session 12
**Completed**:
- F0608: Chart interval always ends at current month
- F0609: Derived series visible on page load without user data
- F0610: Renamed user series and derived series
- F0611: Save/load datasets to local storage
- F0612: Inflation series normalization
- F0613: Purchasing power series calculation
- F0614: Sort series labels in chart legend

**In Progress**:
- None

**Blockers**:
- None

**Details**:

**F0614: Sort Series Labels in Chart Legend**
- Implemented custom sorting for series labels in chart legend
- Order: Gelir(₺) - Gelir(USD) - Gelir(EUR) - USD - EUR - Enflasyon - Alım gücü
- Applied sorting to remoteKeys array used for rendering YAxis and Line components
- Preserves original order for any series not in the predefined list
- All 63 tests passing successfully
- Build verified successful

**Files Created/Modified**:
- src/features/timeseries/components/Chart.tsx (updated - added sorting logic)
- docs/FEATURES.md (updated)
- docs/PROGRESS.md (updated)

**F0613: Purchasing Power Series Calculation**
- Created generatePurchasingPowerSeries function to calculate "Alım gücü" series
- Takes user data and normalized inflation series as inputs
- Step 1: Normalizes user data to 100 at first user data value
- Step 2-3: Divides normalized user data by inflation and multiplies by 100
- Skips points with zero inflation or missing inflation data
- Returns null when user data or inflation is empty/invalid
- Integrated in Chart component to display alongside other series
- Added 6 comprehensive unit tests covering all scenarios
- All 63 tests passing successfully
- Build verified successful

**Files Created/Modified**:
- src/shared/utils/index.ts (updated - generatePurchasingPowerSeries function)
- src/features/timeseries/components/Chart.tsx (updated - integrate purchasing power)
- src/shared/utils/index.test.ts (updated - 6 new tests for generatePurchasingPowerSeries)
- docs/FEATURES.md (updated)
- docs/PROGRESS.md (updated)

**F0612: Inflation Series Normalization**
- Created generateInflationSeries function to normalize TP.FG.J0 inflation data
- Filters out raw TP.FG.J0 from chart display
- Generates "Enflasyon" series normalized to 100 at earliest user data date
- When user data exists: finds base value at earliest date and normalizes all values
- When no user data: shows raw TP.FG.J0 values as-is
- Returns null if TP.FG.J0 not found or base value is zero
- Added 4 comprehensive unit tests for all scenarios
- All 57 tests passing successfully
- Build verified successful

**Files Created/Modified**:
- src/shared/utils/index.ts (updated - generateInflationSeries function)
- src/features/timeseries/components/Chart.tsx (updated - filter TP.FG.J0, add Enflasyon)
- src/shared/utils/index.test.ts (updated - 4 new tests for generateInflationSeries)
- docs/FEATURES.md (updated)
- docs/PROGRESS.md (updated)

**F0611: Save/Load Datasets to Local Storage**
- Created storage utility module with saveDataset, loadDataset, listDatasets, deleteDataset functions
- Added UI toggle button to show/hide save/load panel
- Added input field for dataset name and save button
- Added list of saved datasets with load and delete buttons
- Datasets stored in browser localStorage with timestamp for sorting
- Most recent datasets shown first
- Load immediately updates textarea and triggers chart refresh
- Confirmation dialog before deleting datasets
- Added comprehensive CSS styling for all new UI elements
- All 53 tests passing successfully
- Build verified successful

**Files Created/Modified**:
- src/shared/utils/storage.ts (created - localStorage utilities)
- src/features/timeseries/pages/HomePage.tsx (updated - save/load UI and handlers)
- src/features/timeseries/pages/HomePage.css (updated - styling for new controls)
- docs/FEATURES.md (updated)
- docs/PROGRESS.md (updated)

**F0610: Renamed User Series and Derived Series**
- Changed user data series name from "Kullanıcı" to "Gelir(₺)" in Chart component
- Changed derived series naming from "₺/<currency>" to "Gelir(<currency>)"
- Updated generateDerivedSeries to use new naming format
- Updated HomePage to generate correct derived series keys
- Updated all test expectations to match new naming convention
- Updated function documentation and comments
- All 53 tests passing successfully
- Build verified successful

**Files Created/Modified**:
- src/features/timeseries/components/Chart.tsx (updated - user series name)
- src/shared/utils/index.ts (updated - derived series naming)
- src/features/timeseries/pages/HomePage.tsx (updated - derived codes generation)
- src/shared/utils/index.test.ts (updated - test expectations)
- docs/FEATURES.md (updated)
- docs/PROGRESS.md (updated)

**F0609: Derived Series Visible on Page Load Without User Data**
- Updated generateDerivedSeries to show exchange rates directly when no user data exists
- When user data is empty, ₺/USD and ₺/EUR series now display the TP.DK.* values themselves
- When user data exists, derived series continue to show userValue / exchangeRate ratios
- Updated test to verify exchange rates are shown directly without user data
- All 53 tests passing successfully
- Build verified successful

**Files Created/Modified**:
- src/shared/utils/index.ts (updated - generateDerivedSeries logic)
- src/shared/utils/index.test.ts (updated - test for F0609)
- docs/FEATURES.md (updated)
- docs/PROGRESS.md (updated)

**F0608: Chart Interval Always Ends at Current Month**
- Updated calculateChartDateRange to always set maxDate to current month (first day)
- minDate logic remains unchanged (earliest user data or default 01.2006)
- Updated function documentation to reflect new behavior
- Updated test cases to verify maxDate is always current month
- All 53 tests passing successfully
- Build verified successful

**Files Created/Modified**:
- src/shared/utils/index.ts (updated - calculateChartDateRange maxDate logic)
- src/shared/utils/index.test.ts (updated - test expectations for maxDate)
- docs/FEATURES.md (updated)
- docs/PROGRESS.md (updated)

### 2025-11-20 - Session 11
**Completed**:
- F0601: Series loading and selection
- F0602: Dynamic date range filtering
- F0603: Extended date format support
- F0604: Multiple Y axes for series
- F0605: Friendly series names for TP.DK.* codes
- F0606: Auto-generated derived series (₺/currency)
- F0607: Interactive legend and decimal formatting

**In Progress**:
- None

**Blockers**:
- None

**Details**:

**F0607: Interactive Legend and Decimal Formatting**
- Added custom tooltip formatter to display values with 2 decimal places
- Made chart legend clickable to toggle series visibility
- Removed separate SeriesSelector checkbox component
- Increased chart height from 240px to 400px to fill the space
- Legend now acts as the series selector with visual feedback
- All 53 tests passing successfully
- Build verified successful

**Files Created/Modified**:
- src/features/timeseries/components/Chart.tsx (updated - added formatTooltipValue, handleLegendClick, increased height)
- src/features/timeseries/pages/HomePage.tsx (updated - removed SeriesSelector)
- docs/FEATURES.md (updated)
- docs/PROGRESS.md (updated)

**F0606: Auto-generated Derived Series (₺/currency)**
- Created generateDerivedSeries utility function
- For each TP.DK.* series, generates a "₺/<currency>" series
- Derived values calculated as userValue / tpDkValue for each month
- Only generates data points for months present in user data
- Handles division by zero gracefully
- Updated Chart component to merge and display derived series
- Updated HomePage to add derived series to available list when user data changes
- Auto-selects new derived series by default
- Added comprehensive tests (5 test cases covering normal, edge, and error scenarios)
- All 53 tests passing successfully
- Build verified successful

**Files Created/Modified**:
- src/shared/utils/index.ts (updated - added generateDerivedSeries and helpers)
- src/shared/utils/index.test.ts (updated - added 5 tests)
- src/features/timeseries/components/Chart.tsx (updated - merges derived series)
- src/features/timeseries/pages/HomePage.tsx (updated - manages derived series availability)
- docs/FEATURES.md (updated)
- docs/PROGRESS.md (updated)

**F0605: Friendly Series Names for TP.DK.* Codes**
- Created getSeriesFriendlyName utility function
- Extracts currency code from TP.DK. series (e.g., "TP.DK.EUR.A.YTL" -> "EUR")
- Updated SeriesSelector to display friendly names for checkboxes
- Updated Chart legend to show friendly names instead of full codes
- Added comprehensive tests (3 test cases covering normal, edge, and fallback scenarios)
- All 48 tests passing successfully
- Build verified successful

**Files Created/Modified**:
- src/shared/utils/index.ts (updated - added getSeriesFriendlyName)
- src/shared/utils/index.test.ts (updated - added 3 tests)
- src/features/timeseries/components/SeriesSelector.tsx (updated - uses friendly names)
- src/features/timeseries/components/Chart.tsx (updated - legend uses friendly names)
- docs/FEATURES.md (updated)
- docs/PROGRESS.md (updated)

**F0604: Multiple Y Axes for Series**
- Implemented separate Y axis for each series (user + remote)
- Each Y axis is color-coded to match its corresponding line
- Y axes alternate between left and right orientation for better layout
- User series gets its own Y axis on the left
- Each Line component now references its specific yAxisId
- Allows proper visualization of series with vastly different magnitudes
- All 45 tests passing successfully
- Build verified successful

**Files Created/Modified**:
- src/features/timeseries/components/Chart.tsx (updated - added multiple Y axes)
- docs/FEATURES.md (updated)
- docs/PROGRESS.md (updated)

**F0603: Extended Date Format Support**
- Extended isValidTimeseriesDate to accept D.M.YYYY and D-M-YYYY formats
- Updated normalizeTimeseriesDate to handle single-digit day/month formats
- Now supports: DD.MM.YYYY, D.M.YYYY, MM.YYYY, M.YYYY, MM-YYYY, M-YYYY, D-M-YYYY
- Added comprehensive tests for all new formats (8 new validation tests, 4 new normalization tests)
- All 45 tests passing successfully
- Build verified successful

**Files Created/Modified**:
- src/shared/utils/index.ts (updated - enhanced validation and normalization)
- src/shared/utils/index.test.ts (updated - added 12 new tests)
- docs/FEATURES.md (updated)
- docs/PROGRESS.md (updated)

**F0602: Dynamic Date Range Filtering**
- Created calculateChartDateRange utility function
- Chart now filters data based on user input date range
- When user has valid data: displays only the interval of user data
- When no user data: defaults to showing from 01.2006 to today
- Updated Chart component to apply date range filtering
- Added comprehensive tests for calculateChartDateRange (4 new tests)
- All 37 tests passing successfully
- Build verified successful

**Files Created/Modified**:
- src/shared/utils/index.ts (updated - added calculateChartDateRange)
- src/shared/utils/index.test.ts (updated - added tests)
- src/features/timeseries/components/Chart.tsx (updated - applied filtering)
- docs/FEATURES.md (updated)
- docs/PROGRESS.md (updated)

**F0601: Series Loading and Selection**
- Created series type definitions (SeriesDataPoint, SeriesData, CombinedSeriesData)
- Extended TimeseriesState with availableSeries and selectedSeries tracking
- Added new actions: SET_AVAILABLE_SERIES, SET_SERIES_SELECTION
- Updated store reducer to handle series loading and selection
- Created seriesLoader service to load data from series.json
- Implemented SeriesSelector component with checkboxes for each series
- Integrated series loading in HomePage on mount
- Updated Chart component to filter and display only selected series
- All series selected by default on initial load
- Build verified successful

**Files Created/Modified**:
- src/shared/types/series.ts (new)
- src/shared/types/index.ts (updated)
- src/app/store/index.tsx (updated)
- src/features/timeseries/api/seriesLoader.ts (new)
- src/features/timeseries/components/SeriesSelector.tsx (new)
- src/features/timeseries/components/SeriesSelector.css (new)
- src/features/timeseries/pages/HomePage.tsx (updated)
- src/features/timeseries/components/Chart.tsx (updated)
- docs/FEATURES.md (updated)
- docs/PROGRESS.md (updated)

---

### 2025-11-20 - Session 10
**Completed**:
- F0500: EVDS API client library
- F0501: Series data fetcher tool

**In Progress**:
- None

**Blockers**:
- None

**Details**:

**F0500: EVDS API Client Library**
- Created comprehensive TypeScript types for EVDS API (AggregationType, FormulaType, FrequencyType, etc.)
- Implemented EVDSClient class with full API coverage:
  - getSeries() - fetch time series data
  - getDataGroupData() - fetch all series in a data group
  - getCategories() - fetch category metadata
  - getDataGroups() - fetch data group metadata
  - getSeriesList() - fetch series metadata
- Automatic date formatting (Date objects to DD-MM-YYYY)
- API key authentication via HTTP headers
- Comprehensive unit tests with 100% coverage
- Full documentation in README.md

**F0501: Series Data Fetcher Tool**
- Created standalone CLI tool to fetch EVDS series data
- Fetches monthly data with averaging aggregation
- Updates current month with today's value
- Saves individual series JSON files (format: `<series-code>.json`)
- Saves combined series file (`series.json`)
- Configurable via environment variables (API key, series codes, start date, output dir)
- Includes comprehensive README with usage examples
- Added npm script: `npm run fetch-series`
- Installed tsx for TypeScript execution
- Created .env.example template

**Files Created/Modified**:
- src/shared/evds/types.ts
- src/shared/evds/client.ts
- src/shared/evds/index.ts
- src/shared/evds/README.md
- src/shared/evds/client.test.ts
- tools/fetch-series.ts
- tools/README.md
- .env.example
- package.json
- docs/FEATURES.md
- docs/PROGRESS.md

**Next Feature**: Phase 5 Complete - All features implemented

**Next Steps**:
1. Phase 5 is complete with both F0500 and F0501 implemented
2. Ready for next phase or additional features
### 2025-11-19 - Session 9
**Completed**:
- F013: Responsive design
- F014: Error handling
- F015: Testing setup

**In Progress**:
- None

**Blockers**:
- None

**Details**:


**Files Created/Modified**:


**Next Feature**: F0500

**Next Steps**:
1. Implement F0500
### 2025-11-19 - Session 8
**Completed**:
- F009: Show empty chart

**In Progress**:
- None

**Blockers**:
- None

**Details**:
- Implemented `Chart` component with SVG axes-only frame
- Integrated chart into `HomePage` replacing placeholder
- Added basic ticks and figcaption for empty state visibility
- Accessible labels added for future screen reader enhancements

**Files Created/Modified**:
- src/features/timeseries/components/Chart.tsx
- src/features/timeseries/components/Chart.css
- src/features/timeseries/pages/HomePage.tsx
- docs/FEATURES.md
- docs/PROGRESS.md

**Next Feature**: F010

**Next Steps**:
1. Implement user data entry → live chart update (F010)
2. Plot user series line when data valid
3. Prepare multi-series layering for remote data

---

## Session Log

## Current Sprint
**Focus**: Complete
**Next Feature**: None (All features completed!)

### 2025-01-15
- ✅ Completed F015: Testing setup
  - Configured Vitest with jsdom environment
  - Created test setup file with React Testing Library
  - Added example test for ErrorMessage component
  - Updated package.json with test script
  - All tests passing successfully

### 2025-11-20
- ✅ Completed F0601: Load and display series data with selectors
  - Created series data types (SeriesDataPoint, SeriesData, CombinedSeriesData)
  - Updated TimeseriesState to include availableSeries and selectedSeries
  - Added new actions: SET_AVAILABLE_SERIES and SET_SERIES_SELECTION
  - Created seriesLoader to load data from data/series.json at startup
  - Built SeriesSelector component with checkboxes for toggling series visibility
  - Updated Chart component to filter and display only selected series
  - Added styling for SeriesSelector with grid layout
  - All series load correctly and can be toggled on/off in the chart

### 2025-11-19 - Session 13
**Completed**:
- F014: Error handling

**In Progress**:
- None

**Blockers**:
- None

**Details**:
- Enhanced ErrorBoundary component with better UI and page reload capability
- Created ErrorMessage component for inline error display with retry action
- Added user-friendly Turkish error messages throughout the app
- Updated API client with localized error messages for different HTTP status codes
- Added timeout error handling with "Bağlantı hatası oluştu" message
- Integrated error display in HomePage with retry functionality
- HomePage now loads remote timeseries on mount and displays errors if loading fails
- All errors displayed in user-friendly Turkish language
- Verified successful production build

**Files Created/Modified**:
- src/app/providers/ErrorBoundary.tsx
- src/shared/components/ErrorMessage.tsx
- src/shared/components/ErrorMessage.css
- src/app/config/client.ts
- src/features/timeseries/pages/HomePage.tsx
- docs/FEATURES.md
- docs/PROGRESS.md

**Next Feature**: F015

**Next Steps**:
1. Set up testing framework (Vitest)
2. Add unit tests for utility functions
3. Add component tests for key features
4. Configure test coverage reporting

### 2025-11-19 - Session 12
**Completed**:
- F013: Responsive design

**In Progress**:
- None

**Blockers**:
- None

**Details**:
- Added responsive media queries for tablet (≤768px) and mobile (≤480px) breakpoints
- Updated App.css: Adjusted root padding for smaller screens
- Updated HomePage.css: Chart and editor sections scale from 80vw → 90vw → 95vw
- Updated Header.css: Reduced font sizes, hide placeholder nav on mobile
- Updated Footer.css: Smaller padding and font size on mobile
- Updated Chart.css: Chart height scales from 240px → 200px → 180px
- All components now properly adapt to different viewport sizes
- Verified successful production build

**Files Created/Modified**:
- src/App.css
- src/features/timeseries/pages/HomePage.css
- src/features/timeseries/components/Chart.css
- src/shared/components/Header.css
- src/shared/components/Footer.css
- docs/FEATURES.md
- docs/PROGRESS.md

**Next Feature**: F014

**Next Steps**:
1. Implement comprehensive error handling
2. Add error boundaries for runtime errors
3. Handle API failures gracefully
4. Display user-friendly error messages

### 2025-11-19 - Session 11
**Completed**:
- F012: Monthly timeseries interpolation

**In Progress**:
- None

**Blockers**:
- None

**Details**:
- Added `interpolateMonthlyTimeseries` utility function to fill monthly gaps
- Function sorts points by timestamp and generates entries for each month in range
- Gaps filled with value from most recent previous point
- Updated `HomePage` to apply interpolation before dispatching to store
- Chart now displays smooth monthly progression for user-entered data
- Verified successful production build

**Files Created/Modified**:
- src/shared/utils/index.ts
- src/features/timeseries/pages/HomePage.tsx
- docs/FEATURES.md
- docs/PROGRESS.md

**Next Feature**: F013

**Next Steps**:
1. Implement responsive design adjustments
2. Ensure mobile/tablet layout works properly
3. Test viewport scaling and touch interactions

### 2025-11-19 - Session 10
**Completed**:
- F001: Project initialization and structure

**In Progress**:
- None

**Blockers**:
- None

**Details**:
- Created scaffold directories under src/app, src/shared, src/features
- Added placeholder exports and types
- Added constants and route interface for future routing

**Files Created/Modified**:
- src/app/config/constants.ts
- src/app/routes/index.ts
- src/app/providers/index.ts
- src/app/store/index.ts
- src/app/index.ts
- src/shared/components/Placeholder.tsx
- src/shared/hooks/usePlaceholder.ts
- src/shared/utils/index.ts
- src/shared/types/index.ts
- src/features/timeseries/index.ts
- docs/FEATURES.md

**Next Feature**: F002

**Next Steps (originally planned)**:
1. Implement basic routing (F002)
2. Add initial pages and integrate routes in App.tsx
3. Prepare for state management (F003)

---

### 2025-11-19 - Session 2
**Completed**:
- F002: Basic routing setup

**In Progress**:
- None

**Blockers**:
- None

**Details**:
- Added react-router-dom dependency
- Implemented AppProviders wrapping BrowserRouter and ErrorBoundary
- Created HomePage component and exported via timeseries feature index
- Populated routes array with root path
- Refactored App.tsx to render header with APP_NAME and route content

**Files Created/Modified**:
- package.json
- src/app/providers/index.ts
- src/app/providers/ErrorBoundary.tsx
- src/features/timeseries/pages/HomePage.tsx
- src/features/timeseries/index.ts
- src/app/routes/index.ts
- src/App.tsx
- docs/FEATURES.md
- docs/PROGRESS.md

**Next Feature**: F003

**Next Steps**:
1. Implement state management scaffold (Context + reducer) (F003)
2. Provide initial global store/provider
3. Define types for timeseries state

---

### 2025-11-19 - Session 3
**Completed**:
- F003: State management configuration

**In Progress**:
- None

**Blockers**:
- None

**Details**:
- Added Timeseries state and actions to `shared/types/index.ts`
- Implemented `AppStoreProvider` with Context + useReducer
- Added reducer, hooks (`useAppState`, `useAppDispatch`) and action helpers
- Integrated store provider into `AppProviders` wrapper
- Added JSDoc documentation for clarity and future maintenance

**Files Created/Modified**:
- src/shared/types/index.ts
- src/app/store/index.ts
- src/app/providers/index.ts
- docs/FEATURES.md
- docs/PROGRESS.md

**Next Feature**: F004

**Next Steps**:
1. Implement API service layer (basic fetch wrapper)
2. Define service for remote timeseries retrieval
3. Integrate status/error handling with store actions

---

### 2025-11-19 - Session 4
**Completed**:
- F004: API service layer

**In Progress**:
- None

**Blockers**:
- None

**Details**:
- Added API config constants (`API_BASE_URL`, `API_REQUEST_TIMEOUT_MS`)
- Implemented generic `request` helper with timeout and error normalization
- Created timeseries service (`getRemoteTimeseries`, `loadRemoteTimeseries`, `createRemoteLoader`) with stub fallback
- Integrated service loader with global store actions
- Added JSDoc documentation for clarity

**Files Created/Modified**:
- src/app/config/constants.ts
- src/app/config/client.ts
- src/features/timeseries/api/service.ts
- docs/FEATURES.md
- docs/PROGRESS.md

**Next Feature**: F005

**Next Steps**:
1. Implement header/navigation component
2. Display app name and nav placeholders
3. Prepare layout for future pages

---

### 2025-11-19 - Session 5
**Completed**:
- F005: Header/Navigation component

**In Progress**:
- None

**Blockers**:
- None

**Details**:
- Added `Header` component with brand and nav placeholder
- Integrated `Header` into `App.tsx` replacing static header markup
- Added basic styling in `Header.css`
- Documented future enhancements (dynamic nav, status indicators)

**Files Created/Modified**:
- src/shared/components/Header.tsx
- src/shared/components/Header.css
- src/App.tsx
- docs/FEATURES.md
- docs/PROGRESS.md

**Next Feature**: F006

**Next Steps**:
1. Implement footer component with required static text
2. Place footer below main content
3. Prepare for responsive layout (F013)

---

### 2025-11-19 - Session 6
**Completed**:
- F006: Footer component

**In Progress**:
- None

**Blockers**:
- None

**Details**:
- Added semantic `Footer` component with Turkish privacy text
- Integrated footer below main content in `App.tsx`
- Added styling (`Footer.css`) consistent with header theme
- Verified successful production build

**Files Created/Modified**:
- src/shared/components/Footer.tsx
- src/shared/components/Footer.css
- src/App.tsx
- docs/FEATURES.md
- docs/PROGRESS.md

**Next Feature**: F007

### 2025-11-19 - Session 7
**Completed**:
- F007: Home page layout

**In Progress**:
- None

**Blockers**:
- None

**Details**:
- Added flex column app container with full-height layout
- Implemented sticky header (top) and sticky footer (bottom)
- Created centered chart placeholder at 80vw width
- Added multiline timeseries editor with validation (green/red states)
- Added utility functions for date validation & parsing user input
- Dispatches valid parsed points to global store via actions.setUserSeries

**Files Created/Modified**:
- src/App.tsx
- src/App.css
- src/shared/components/Header.css
- src/shared/components/Footer.css
- src/features/timeseries/pages/HomePage.tsx
- src/features/timeseries/pages/HomePage.css
- src/shared/utils/index.ts
- docs/FEATURES.md
- docs/PROGRESS.md

**Next Feature**: F008

**Next Steps**:
1. Implement loading/error visual states (header or dedicated component)
2. Show feedback during remote timeseries fetch (status & error)
3. Prepare for chart rendering (F009)

**Next Steps**:
1. Implement Home page layout (structure for chart + editor)
2. Add placeholder sections for chart area and data entry box
3. Prepare responsive container for future components

---

## Instructions for AI Agent

### Before Starting Each Feature:
1. Read this file to understand current progress
2. Check FEATURES.md for next feature to implement
3. Update status to 🟡 In Progress

### After Completing Each Feature:
1. Update FEATURES.md status to 🟢
2. Add entry to this log with:
   - Feature ID and name
   - Files created/modified
   - Key decisions made
3. Identify next feature and update "Next Feature"
4. Commit changes with format: "feat(F00X): description"

### Commit Message Format:
- `feat(F00X): description` - New feature
- `fix(F00X): description` - Bug fix
- `docs(F00X): description` - Documentation
- `test(F00X): description` - Tests
