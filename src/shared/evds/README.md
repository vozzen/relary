# EVDS API Client

TypeScript client library for the Turkish Central Bank's Electronic Data Distribution System (EVDS) Web Services.

## Overview

This module provides a typed wrapper around the TCMB EVDS Web Services API, making it easy to fetch economic time series data from the Turkish Central Bank.

## Features

- ✅ Full TypeScript support with comprehensive type definitions
- ✅ Automatic date formatting (converts Date objects to DD-MM-YYYY format)
- ✅ Support for all EVDS API endpoints
- ✅ Automatic API key authentication via HTTP headers
- ✅ Support for multiple series, aggregation types, and formulas
- ✅ Metadata endpoints (categories, data groups, series lists)

## Getting an API Key

1. Visit [EVDS](https://evds2.tcmb.gov.tr/)
2. Create an account and log in
3. Click on your username and select "Profil"
4. Click "API Anahtarı" to get your API key

## Usage

### Basic Example

```typescript
import { createEVDSClient } from '@/shared/evds';

const client = createEVDSClient({ 
  apiKey: 'your-api-key' 
});

// Fetch USD and EUR exchange rates
const data = await client.getSeries({
  series: ['TP.DK.USD.A', 'TP.DK.EUR.A'],
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-12-31')
});

console.log(data.items);
```

### Fetching with Aggregation and Frequency

```typescript
import { 
  createEVDSClient, 
  FrequencyType, 
  AggregationType,
  FormulaType 
} from '@/shared/evds';

const client = createEVDSClient({ apiKey: 'your-api-key' });

// Fetch monthly average USD exchange rate with percentage change
const data = await client.getSeries({
  series: 'TP.DK.USD.A',
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-12-31'),
  frequency: FrequencyType.MONTHLY,
  aggregationTypes: AggregationType.AVERAGE,
  formulas: FormulaType.PERCENTAGE_CHANGE
});
```

### Fetching Multiple Series with Different Parameters

```typescript
// When fetching multiple series, you can specify different aggregation
// types and formulas for each series
const data = await client.getSeries({
  series: ['TP.DK.USD.A', 'TP.DK.EUR.A', 'TP.DK.GBP.A'],
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-12-31'),
  frequency: FrequencyType.MONTHLY,
  aggregationTypes: [
    AggregationType.AVERAGE, 
    AggregationType.MAXIMUM, 
    AggregationType.MINIMUM
  ],
  formulas: [
    FormulaType.LEVEL,
    FormulaType.PERCENTAGE_CHANGE,
    FormulaType.DIFFERENCE
  ]
});
```

### Fetching Data Group

```typescript
// Fetch all series in a data group
const data = await client.getDataGroupData({
  datagroup: 'bie_yssk',
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-12-31')
});
```

### Metadata Endpoints

```typescript
import { DataGroupMode } from '@/shared/evds';

// Get all categories
const categories = await client.getCategories();

// Get all data groups
const allGroups = await client.getDataGroups({ 
  mode: DataGroupMode.ALL 
});

// Get data groups for a specific category
const categoryGroups = await client.getDataGroups({
  mode: DataGroupMode.BY_CATEGORY,
  code: '2'
});

// Get specific data group information
const dataGroup = await client.getDataGroups({
  mode: DataGroupMode.BY_DATAGROUP,
  code: 'bie_yssk'
});

// Get series list for a data group
const seriesList = await client.getSeriesList({ 
  code: 'bie_yssk' 
});

// Get information about a specific series
const seriesInfo = await client.getSeriesList({ 
  code: 'TP.DK.USD.A' 
});
```

## API Reference

### AggregationType

- `AVERAGE` - Ortalama (avg)
- `MINIMUM` - En düşük (min)
- `MAXIMUM` - En yüksek (max)
- `FIRST` - Başlangıç (first)
- `LAST` - Bitiş (last)
- `SUM` - Kümülatif (sum)

### FormulaType

- `LEVEL` - Düzey (0)
- `PERCENTAGE_CHANGE` - Yüzde Değişim (1)
- `DIFFERENCE` - Fark (2)
- `ANNUAL_PERCENTAGE_CHANGE` - Yıllık Yüzde Değişim (3)
- `ANNUAL_DIFFERENCE` - Yıllık Fark (4)
- `PERCENTAGE_CHANGE_FROM_END_OF_PREVIOUS_YEAR` - Bir Önceki Yılın Sonuna Göre Yüzde Değişim (5)
- `DIFFERENCE_FROM_END_OF_PREVIOUS_YEAR` - Bir Önceki Yılın Sonuna Göre Fark (6)
- `MOVING_AVERAGE` - Hareketli Ortalama (7)
- `MOVING_SUM` - Hareketli Toplam (8)

### FrequencyType

- `DAILY` - Günlük (1)
- `BUSINESS_DAY` - İşgünü (2)
- `WEEKLY` - Haftalık (3)
- `TWICE_A_MONTH` - Ayda 2 Kez (4)
- `MONTHLY` - Aylık (5)
- `QUARTERLY` - 3 Aylık (6)
- `SEMI_ANNUAL` - 6 Aylık (7)
- `ANNUAL` - Yıllık (8)

## Response Format

The API returns data in the following format:

```typescript
{
  items: [
    {
      Tarih: "2024-01-01",
      "TP.DK.USD.A": "30.1234",
      "TP.DK.EUR.A": "33.5678"
    },
    // ... more data points
  ]
}
```

## Best Practices

1. **Daily Data Fetching**: EVDS data is updated at most daily. Fetch data once per day for optimal performance.

2. **Batch Series Requests**: Request multiple series from the same data group in a single API call by joining series codes with '-'.

3. **Date Formatting**: Always specify the first day of the desired frequency period to ensure complete data:
   - For yearly frequency: use `01-01-YYYY`
   - For monthly frequency: use `01-MM-YYYY`
   - For daily frequency: use `DD-MM-YYYY`

4. **Error Handling**: Always handle API errors, especially 403 Forbidden errors which indicate authentication issues.

## References

- [EVDS Web Service Documentation](https://evds2.tcmb.gov.tr/)
- Based on: `EVDS_Web_Servis_Kullanim_Kilavuzu.txt`
