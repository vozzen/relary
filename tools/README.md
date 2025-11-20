# EVDS Series Data Fetcher

A standalone tool to fetch economic time series data from the Turkish Central Bank's EVDS (Electronic Data Distribution System) API and save it as JSON files.

## Overview

This tool fetches configured time series data from EVDS with monthly aggregation, updates the current month with today's value, and saves the data in two formats:
1. Individual files for each series (e.g., `TP.DK.USD.A.json`)
2. A combined file containing all series (`series.json`)

## Features

- ✅ Fetches monthly time series data with averaging aggregation
- ✅ Updates current month's value with today's latest data
- ✅ Saves data as formatted JSON files
- ✅ Configurable via environment variables
- ✅ Generates both individual and combined series files
- ✅ Automatic date formatting to first day of each month

## Prerequisites

1. **EVDS API Key**: Get your API key from [EVDS](https://evds2.tcmb.gov.tr/)
   - Create an account and log in
   - Go to Profile → API Anahtarı

2. **Node.js**: Version 18 or higher (for ES modules and top-level await)

## Installation

```bash
# Install dependencies
npm install
```

## Configuration

Configure the tool using environment variables:

### Required Variables

- **`EVDS_API_KEY`**: Your EVDS API key
- **`EVDS_SERIES_CODES`**: Comma-separated list of series codes to fetch
- **`EVDS_START_DATE`**: Start date for data fetching (format: YYYY-MM-DD)

### Optional Variables

- **`EVDS_OUTPUT_DIR`**: Output directory for JSON files (default: `./data`)

## Usage

### Basic Usage

```bash
# Set environment variables
export EVDS_API_KEY="your-api-key-here"
export EVDS_SERIES_CODES="TP.DK.USD.A,TP.DK.EUR.A,TP.DK.GBP.A"
export EVDS_START_DATE="2020-01-01"

# Run the fetcher
npm run fetch-series
```

### Using .env File

Create a `.env` file in the project root:

```env
EVDS_API_KEY=your-api-key-here
EVDS_SERIES_CODES=TP.DK.USD.A,TP.DK.EUR.A,TP.DK.GBP.A
EVDS_START_DATE=2020-01-01
EVDS_OUTPUT_DIR=./public/data
```

Then run with your preferred tool to load environment variables:

```bash
# Using dotenv-cli
npx dotenv -e .env npm run fetch-series

# Or load manually
source .env && npm run fetch-series
```

### Direct Execution

```bash
EVDS_API_KEY="your-api-key" \
EVDS_SERIES_CODES="TP.DK.USD.A,TP.DK.EUR.A" \
EVDS_START_DATE="2020-01-01" \
npm run fetch-series
```

## Output Format

### Individual Series Files

Each series is saved as `<series-code>.json`:

```json
{
  "name": "TP.DK.USD.A",
  "items": [
    {
      "date": "2020.01.01",
      "value": "5.9402"
    },
    {
      "date": "2020.02.01",
      "value": "6.0520"
    }
  ]
}
```

### Combined Series File

All series are combined in `series.json`:

```json
{
  "series": [
    {
      "name": "TP.DK.USD.A",
      "items": [
        {
          "date": "2020.01.01",
          "value": "5.9402"
        }
      ]
    },
    {
      "name": "TP.DK.EUR.A",
      "items": [
        {
          "date": "2020.01.01",
          "value": "6.6112"
        }
      ]
    }
  ]
}
```

## How It Works

1. **Monthly Data Fetch**: Fetches time series data from the start date to today with monthly frequency and averaging aggregation
2. **Today's Value Fetch**: Fetches the latest (today's) value for each series
3. **Update Current Month**: Overwrites the current month's value with today's value (or adds it if missing)
4. **Date Formatting**: All dates are formatted to the first day of the month (YYYY.MM.01)
5. **Save Files**: Saves individual JSON files and a combined file

## Common Series Codes

Here are some commonly used EVDS series codes:

### Exchange Rates (Döviz Kurları)
- `TP.DK.USD.A` - USD (US Dollar) - Buy
- `TP.DK.USD.S` - USD (US Dollar) - Sell
- `TP.DK.EUR.A` - EUR (Euro) - Buy
- `TP.DK.EUR.S` - EUR (Euro) - Sell
- `TP.DK.GBP.A` - GBP (British Pound) - Buy
- `TP.DK.JPY.A` - JPY (Japanese Yen) - Buy

### Consumer Price Index (TÜFE)
- `TP.FG.J0` - Consumer Price Index (2003=100)

### Interest Rates
- `TP.TCMB.CEVR01.D01` - TCMB Average Interest Rate

To find more series codes, visit [EVDS](https://evds2.tcmb.gov.tr/) and browse the data categories.

## Error Handling

The tool provides clear error messages for common issues:

- Missing or invalid API key
- Missing series codes configuration
- Invalid date format
- Network errors
- Individual series fetch failures (continues with remaining series)

## Rate Limiting

The tool includes a 500ms delay between series requests to avoid overwhelming the EVDS API. Adjust this in the code if needed.

## Troubleshooting

### "EVDS API authentication failed"
- Check that your API key is correct
- Ensure the API key is active on your EVDS profile

### "Invalid EVDS_START_DATE format"
- Use the format YYYY-MM-DD (e.g., 2020-01-01)

### Empty data returned
- Verify the series code exists on EVDS
- Check that data is available for your specified date range

## Development

Build the tool:

```bash
npm run build
```

The tool is written in TypeScript and uses the EVDS client library located in `src/shared/evds/`.

## License

This tool is part of the Relary project.
