/**
 * EVDS API Type Definitions
 * Based on EVDS Web Service Usage Guide (EVDS_Web_Servis_Kullanim_Kilavuzu.txt)
 */

/**
 * Aggregation methods for data observation
 */
export const AggregationType = {
  /** Ortalama */
  AVERAGE: 'avg',
  /** En düşük */
  MINIMUM: 'min',
  /** En yüksek */
  MAXIMUM: 'max',
  /** Başlangıç */
  FIRST: 'first',
  /** Bitiş */
  LAST: 'last',
  /** Kümülatif */
  SUM: 'sum',
} as const;

export type AggregationType = typeof AggregationType[keyof typeof AggregationType];

/**
 * Formula types for data transformation
 */
export const FormulaType = {
  /** Düzey */
  LEVEL: '0',
  /** Yüzde Değişim */
  PERCENTAGE_CHANGE: '1',
  /** Fark */
  DIFFERENCE: '2',
  /** Yıllık Yüzde Değişim */
  ANNUAL_PERCENTAGE_CHANGE: '3',
  /** Yıllık Fark */
  ANNUAL_DIFFERENCE: '4',
  /** Bir Önceki Yılın Sonuna Göre Yüzde Değişim */
  PERCENTAGE_CHANGE_FROM_END_OF_PREVIOUS_YEAR: '5',
  /** Bir Önceki Yılın Sonuna Göre Fark */
  DIFFERENCE_FROM_END_OF_PREVIOUS_YEAR: '6',
  /** Hareketli Ortalama */
  MOVING_AVERAGE: '7',
  /** Hareketli Toplam */
  MOVING_SUM: '8',
} as const;

export type FormulaType = typeof FormulaType[keyof typeof FormulaType];

/**
 * Data frequency types
 */
export const FrequencyType = {
  /** Günlük */
  DAILY: '1',
  /** İşgünü */
  BUSINESS_DAY: '2',
  /** Haftalık */
  WEEKLY: '3',
  /** Ayda 2 Kez */
  TWICE_A_MONTH: '4',
  /** Aylık */
  MONTHLY: '5',
  /** 3 Aylık */
  QUARTERLY: '6',
  /** 6 Aylık */
  SEMI_ANNUAL: '7',
  /** Yıllık */
  ANNUAL: '8',
} as const;

export type FrequencyType = typeof FrequencyType[keyof typeof FrequencyType];

/**
 * Response format types
 */
export const ResponseType = {
  CSV: 'csv',
  XML: 'xml',
  JSON: 'json',
} as const;

export type ResponseType = typeof ResponseType[keyof typeof ResponseType];

/**
 * Decimal separator options
 */
export const DecimalSeparator = {
  DOT: '.',
  COMMA: ',',
} as const;

export type DecimalSeparator = typeof DecimalSeparator[keyof typeof DecimalSeparator];

/**
 * Request parameters for fetching series data
 */
export interface SeriesRequest {
  /** Series codes separated by '-' for multiple series */
  series: string | string[];
  /** Start date in DD-MM-YYYY format or Date object */
  startDate: Date | string;
  /** End date in DD-MM-YYYY format or Date object */
  endDate: Date | string;
  /** Response format (default: json) */
  type?: ResponseType;
  /** Decimal separator (default: dot) */
  decimalSeparator?: DecimalSeparator;
  /** Aggregation types (one per series, separated by '-') */
  aggregationTypes?: AggregationType | AggregationType[];
  /** Formula types (one per series, separated by '-') */
  formulas?: FormulaType | FormulaType[];
  /** Frequency type */
  frequency?: FrequencyType;
}

/**
 * Single data point in a series
 */
export interface SeriesDataPoint {
  /** Date in YYYY-MM-DD format */
  Tarih: string;
  /** Series code as key with value */
  [seriesCode: string]: string;
}

/**
 * Response structure for series data
 */
export interface SeriesResponse {
  items: SeriesDataPoint[];
}

/**
 * Request parameters for fetching data group data
 */
export interface DataGroupRequest {
  /** Data group code */
  datagroup: string;
  /** Start date in DD-MM-YYYY format or Date object */
  startDate: Date | string;
  /** End date in DD-MM-YYYY format or Date object */
  endDate: Date | string;
  /** Response format (default: json) */
  type?: ResponseType;
}

/**
 * Category metadata
 */
export interface Category {
  /** Konu Başlığı Kodu */
  CATEGORY_ID: string;
  /** Konu Başlığı Adı */
  TOPIC_TITLE_TR: string;
  /** Konu Başlığı Adı (İngilizce) */
  TOPIC_TITLE_ENG: string;
}

/**
 * Data group metadata
 */
export interface DataGroup {
  /** Veri Grubu Kodu */
  DATAGROUP_CODE: string;
  /** Veri Grubu Adı */
  DATAGROUP_NAME: string;
  /** Veri Grubu Adı (İngilizce) */
  DATAGROUP_NAME_ENG: string;
  /** Veri Başlangıç Tarihi */
  START_DATE: string;
  /** Veri Bitiş Tarihi */
  END_DATE: string;
  /** Orjinal Frekans Kodu */
  FREQUENCY: string;
  /** Orjinal Frekans Açıklaması */
  FREQUENCY_STR: string;
  /** Veri Kaynağı */
  DATASOURCE: string;
  /** Veri Kaynağı (İngilizce) */
  DATASOURCE_ENG: string;
  /** Metadata Linki */
  METADATA_LINK: string;
  /** Metadata Linki (İngilizce) */
  METADATA_LINK_ENG: string;
  /** Revizyon Politikası Linki */
  REV_POL_LINK: string;
  /** Revizyon Politikası Linki (İngilizce) */
  REV_POL_LINK_ENG: string;
  /** UYG. DEĞ. LİNK */
  APP_CHA_LINK: string;
  /** UYG. DEĞ. LİNK. İNG. */
  APP_CHA_LINK_ENG: string;
  /** Bilgi Notu */
  NOTE: string;
  /** Bilgi Notu (İngilizce) */
  NOTE_ENG: string;
}

/**
 * Series metadata
 */
export interface SeriesMetadata {
  /** Seri Kodu */
  SERIE_CODE: string;
  /** Veri Grubu Kodu */
  DATAGROUP_CODE: string;
  /** Seri Adı */
  SERIE_NAME: string;
  /** Seri Adı (İngilizce) */
  SERIE_NAME_ENG: string;
  /** Orjinal Frekans Açıklaması */
  FREQUENCY_STR: string;
  /** Varsayılan Dönüşüm Yöntemi Açıklaması */
  DEFAULT_AGG_METHOD_STR: string;
  /** Varsayılan Dönüşüm Yöntemi */
  DEFAULT_AGG_METHOD: string;
  /** Etiketler */
  TAG: string;
  /** Etiketler (İngilizce) */
  TAG_ENG: string;
  /** Veri Kaynağı */
  DATASOURCE: string;
  /** Veri Kaynağı (İngilizce) */
  DATASOURCE_ENG: string;
  /** Metadata Linki */
  METADATA_LINK: string;
  /** Metadata Linki (İngilizce) */
  METADATA_LINK_ENG: string;
  /** Revizyon Politikası Linki */
  REV_POL_LINK: string;
  /** Revizyon Politikası Linki (İngilizce) */
  REV_POL_LINK_ENG: string;
  /** UYG. DEĞ. LİNK */
  APP_CHA_LINK: string;
  /** UYG. DEĞ. LİNK. İNG. */
  APP_CHA_LINK_ENG: string;
  /** Veri Başlangıç Tarihi */
  START_DATE: string;
  /** Veri Bitiş Tarihi */
  END_DATE: string;
}

/**
 * Mode for data group listing
 */
export const DataGroupMode = {
  /** Tüm konu başlıkları altındaki tüm veri gruplarını getirir */
  ALL: '0',
  /** Bir veri grubu seçimine göre ilgili veri grubu bilgilerini getirir */
  BY_DATAGROUP: '1',
  /** Bir konu başlığı seçimine göre ilgili konu başlığına ait tüm veri grubu bilgilerini getirir */
  BY_CATEGORY: '2',
} as const;

export type DataGroupMode = typeof DataGroupMode[keyof typeof DataGroupMode];

/**
 * Request parameters for data groups
 */
export interface DataGroupsRequest {
  /** Mode for listing */
  mode: DataGroupMode;
  /** Code (data group code for mode=1, category code for mode=2) */
  code?: string;
  /** Response format (default: json) */
  type?: ResponseType;
}

/**
 * Request parameters for series list
 */
export interface SeriesListRequest {
  /** Data group code or series code */
  code: string;
  /** Response format (default: json) */
  type?: ResponseType;
}

export interface SeriesItem {
  date: Date;
  value: number;
}

export interface SeriesData {
  code: string;
  items: SeriesItem[];
}
export interface MultiSeriesData {
  seriesList: SeriesData[];
}