# Relary - Relative Salary Calculator

A single-page React application for visualizing salary data against economic indicators like exchange rates and inflation.

## Features

- **Interactive Time Series Chart**: Visualize multiple time series data on a single chart with individual Y-axes
- **User Data Entry**: Enter salary data with flexible date formats (DD.MM.YYYY, MM.YYYY, MM-YYYY, etc.)
- **Automatic Interpolation**: Monthly data points are automatically filled between entries
- **Derived Metrics**:
  - Salary in foreign currencies (USD, EUR, GBP)
  - Inflation-adjusted purchasing power
  - Real salary trends
- **Data Persistence**: Save and load datasets using browser local storage
- **Economic Data**: Pre-loaded TCMB exchange rates and inflation data
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Testing

```bash
npm test
```

## Technology Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Recharts** for data visualization
- **React Router** for routing
- **Vitest** for testing

## Project Structure

```
src/
├── app/              # Application configuration, routing, store
├── features/         # Feature-based modules
│   └── timeseries/   # Time series chart and data entry
├── shared/           # Shared utilities, components, hooks
│   ├── components/   # Reusable UI components
│   ├── evds/         # EVDS API client library
│   └── utils/        # Helper functions
├── test/             # Test setup and utilities
data/                 # Pre-loaded economic data
docs/                 # Project documentation
tools/                # Data fetching utilities
```

## Data Sources

Economic data is sourced from the Turkish Central Bank (TCMB) Electronic Data Distribution System (EVDS):
- Exchange rates (USD, EUR, GBP)
- Consumer Price Index (CPI)

## License

MIT

## Privacy

"Hiçbir veri sunuculara gönderilmez" - No data is sent to servers. All processing happens locally in your browser.
