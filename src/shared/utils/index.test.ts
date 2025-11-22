import { describe, it, expect } from 'vitest'
import {
  isValidTimeseriesDate,
  parseTimeseriesInput,
  normalizeTimeseriesDate,
  interpolateMonthlyTimeseries,
  buildTimeseriesChartData,
  calculateChartDateRange,
  getSeriesFriendlyName,
  generateDerivedSeries,
  generateInflationSeries,
  generatePurchasingPowerSeries,
} from './index'

describe('isValidTimeseriesDate', () => {
  it('should validate DD.MM.YYYY format', () => {
    expect(isValidTimeseriesDate('01.01.2024')).toBe(true)
    expect(isValidTimeseriesDate('31.12.2024')).toBe(true)
    expect(isValidTimeseriesDate('15.06.2024')).toBe(true)
  })

  it('should validate D.M.YYYY format (F0603)', () => {
    expect(isValidTimeseriesDate('1.1.2024')).toBe(true)
    expect(isValidTimeseriesDate('9.3.2024')).toBe(true)
    expect(isValidTimeseriesDate('31.12.2024')).toBe(true)
    expect(isValidTimeseriesDate('5.12.2024')).toBe(true)
  })

  it('should validate MM.YYYY format', () => {
    expect(isValidTimeseriesDate('01.2024')).toBe(true)
    expect(isValidTimeseriesDate('12.2024')).toBe(true)
  })

  it('should validate M.YYYY format (F0603)', () => {
    expect(isValidTimeseriesDate('1.2024')).toBe(true)
    expect(isValidTimeseriesDate('9.2024')).toBe(true)
  })

  it('should validate MM-YYYY format', () => {
    expect(isValidTimeseriesDate('01-2024')).toBe(true)
    expect(isValidTimeseriesDate('12-2024')).toBe(true)
  })

  it('should validate M-YYYY format (F0603)', () => {
    expect(isValidTimeseriesDate('1-2024')).toBe(true)
    expect(isValidTimeseriesDate('9-2024')).toBe(true)
  })

  it('should validate D-M-YYYY format (F0603)', () => {
    expect(isValidTimeseriesDate('1-1-2024')).toBe(true)
    expect(isValidTimeseriesDate('9-3-2024')).toBe(true)
    expect(isValidTimeseriesDate('31-12-2024')).toBe(true)
    expect(isValidTimeseriesDate('5-12-2024')).toBe(true)
  })

  it('should reject invalid formats', () => {
    expect(isValidTimeseriesDate('2024-01-01')).toBe(false)
    expect(isValidTimeseriesDate('01/01/2024')).toBe(false)
    expect(isValidTimeseriesDate('invalid')).toBe(false)
    expect(isValidTimeseriesDate('32.01.2024')).toBe(false)
    expect(isValidTimeseriesDate('01.13.2024')).toBe(false)
    expect(isValidTimeseriesDate('0.1.2024')).toBe(false) // Day cannot be 0
    expect(isValidTimeseriesDate('1.0.2024')).toBe(false) // Month cannot be 0
  })
})

describe('parseTimeseriesInput', () => {
  it('should parse valid multiline input', () => {
    const input = '01.2024 100\n02.2024 200\n03.2024 300'
    const result = parseTimeseriesInput(input)
    
    expect(result.valid).toBe(true)
    expect(result.points).toHaveLength(3)
    expect(result.points[0]).toEqual({ date: '01.2024', value: 100 })
    expect(result.points[2]).toEqual({ date: '03.2024', value: 300 })
  })

  it('should handle empty lines', () => {
    const input = '01.2024 100\n\n02.2024 200'
    const result = parseTimeseriesInput(input)
    
    expect(result.valid).toBe(true)
    expect(result.points).toHaveLength(2)
  })

  it('should reject invalid dates', () => {
    const input = '01.2024 100\ninvalid 200'
    const result = parseTimeseriesInput(input)
    
    expect(result.valid).toBe(false)
  })

  it('should reject invalid values', () => {
    const input = '01.2024 100\n02.2024 notanumber'
    const result = parseTimeseriesInput(input)
    
    expect(result.valid).toBe(false)
  })

  it('should handle empty input', () => {
    const result = parseTimeseriesInput('')
    
    expect(result.valid).toBe(false)
    expect(result.points).toHaveLength(0)
  })
})

describe('normalizeTimeseriesDate', () => {
  it('should normalize DD.MM.YYYY to timestamp', () => {
    const ts = normalizeTimeseriesDate('15.06.2024')
    const date = new Date(ts)
    
    expect(date.getUTCFullYear()).toBe(2024)
    expect(date.getUTCMonth()).toBe(5) // June is month 5 (0-indexed)
    expect(date.getUTCDate()).toBe(1) // Always normalized to 1st of month
  })

  it('should normalize MM.YYYY to first day of month', () => {
    const ts = normalizeTimeseriesDate('06.2024')
    const date = new Date(ts)
    
    expect(date.getUTCFullYear()).toBe(2024)
    expect(date.getUTCMonth()).toBe(5)
    expect(date.getUTCDate()).toBe(1)
  })

  it('should normalize MM-YYYY to first day of month', () => {
    const ts = normalizeTimeseriesDate('06-2024')
    const date = new Date(ts)
    
    expect(date.getUTCFullYear()).toBe(2024)
    expect(date.getUTCMonth()).toBe(5)
    expect(date.getUTCDate()).toBe(1)
  })

  it('should normalize D.M.YYYY to timestamp (F0603)', () => {
    const ts = normalizeTimeseriesDate('5.3.2024')
    const date = new Date(ts)
    
    expect(date.getUTCFullYear()).toBe(2024)
    expect(date.getUTCMonth()).toBe(2) // March is month 2 (0-indexed)
    expect(date.getUTCDate()).toBe(1) // Always normalized to 1st of month
  })

  it('should normalize D-M-YYYY to timestamp (F0603)', () => {
    const ts = normalizeTimeseriesDate('9-11-2024')
    const date = new Date(ts)
    
    expect(date.getUTCFullYear()).toBe(2024)
    expect(date.getUTCMonth()).toBe(10) // November is month 10 (0-indexed)
    expect(date.getUTCDate()).toBe(1) // Always normalized to 1st of month
  })

  it('should normalize M.YYYY to first day of month (F0603)', () => {
    const ts = normalizeTimeseriesDate('3.2024')
    const date = new Date(ts)
    
    expect(date.getUTCFullYear()).toBe(2024)
    expect(date.getUTCMonth()).toBe(2)
    expect(date.getUTCDate()).toBe(1)
  })

  it('should normalize M-YYYY to first day of month (F0603)', () => {
    const ts = normalizeTimeseriesDate('7-2024')
    const date = new Date(ts)
    
    expect(date.getUTCFullYear()).toBe(2024)
    expect(date.getUTCMonth()).toBe(6)
    expect(date.getUTCDate()).toBe(1)
  })

  it('should return NaN for invalid dates', () => {
    expect(Number.isNaN(normalizeTimeseriesDate('invalid'))).toBe(true)
  })
})

describe('interpolateMonthlyTimeseries', () => {
  it('should fill monthly gaps and extend to current month', () => {
    const points = [
      { date: '01.2024', value: 100 },
      { date: '04.2024', value: 123 },
    ]
    
    const result = interpolateMonthlyTimeseries(points)
    
    // Should have filled gaps between points and extended to current month
    expect(result.length).toBeGreaterThanOrEqual(4)
    expect(result[0]).toEqual({ date: '01.2024', value: 100 })
    expect(result[1]).toEqual({ date: '02.2024', value: 100 })
    expect(result[2]).toEqual({ date: '03.2024', value: 100 })
    expect(result[3]).toEqual({ date: '04.2024', value: 123 })
    
    // Last point should be current month with last value
    const now = new Date()
    const expectedLastMonth = String(now.getMonth() + 1).padStart(2, '0')
    const expectedLastYear = now.getFullYear()
    expect(result.at(-1)?.date).toBe(`${expectedLastMonth}.${expectedLastYear}`)
    expect(result.at(-1)?.value).toBe(123)
  })

  it('should extend single point to current month', () => {
    const points = [{ date: '01.2024', value: 100 }]
    const result = interpolateMonthlyTimeseries(points)
    
    // Should have extended from 01.2024 to current month
    expect(result.length).toBeGreaterThanOrEqual(1)
    expect(result[0]).toEqual({ date: '01.2024', value: 100 })
    
    // Last point should be current month with same value
    const now = new Date()
    const expectedLastMonth = String(now.getMonth() + 1).padStart(2, '0')
    const expectedLastYear = now.getFullYear()
    expect(result.at(-1)?.date).toBe(`${expectedLastMonth}.${expectedLastYear}`)
    expect(result.at(-1)?.value).toBe(100)
  })

  it('should handle empty input', () => {
    const result = interpolateMonthlyTimeseries([])
    expect(result).toHaveLength(0)
  })

  it('should sort points before interpolation and extend', () => {
    const points = [
      { date: '04.2024', value: 123 },
      { date: '01.2024', value: 100 },
    ]
    
    const result = interpolateMonthlyTimeseries(points)
    
    expect(result[0].date).toBe('01.2024')
    // Last point should be current month
    const now = new Date()
    const expectedLastMonth = String(now.getMonth() + 1).padStart(2, '0')
    const expectedLastYear = now.getFullYear()
    expect(result.at(-1)?.date).toBe(`${expectedLastMonth}.${expectedLastYear}`)
  })

  it('should handle consecutive months and extend', () => {
    const points = [
      { date: '01.2024', value: 100 },
      { date: '02.2024', value: 200 },
    ]
    
    const result = interpolateMonthlyTimeseries(points)
    
    // Should have at least the two original points plus extension
    expect(result.length).toBeGreaterThanOrEqual(2)
    expect(result[0]).toEqual({ date: '01.2024', value: 100 })
    expect(result[1]).toEqual({ date: '02.2024', value: 200 })
    
    // Last point should be current month with last value (200)
    expect(result.at(-1)?.value).toBe(200)
  })
})

describe('buildTimeseriesChartData', () => {
  it('should build unified chart data', () => {
    const user = [
      { date: '01.2024', value: 100 },
      { date: '02.2024', value: 200 },
    ]
    const remote = {
      series1: [
        { date: '01.2024', value: 50 },
        { date: '02.2024', value: 60 },
      ],
    }
    
    const result = buildTimeseriesChartData(user, remote)
    
    expect(result).toHaveLength(2)
    expect(result[0]).toMatchObject({ user: 100, series1: 50 })
    expect(result[1]).toMatchObject({ user: 200, series1: 60 })
  })

  it('should handle empty series', () => {
    const result = buildTimeseriesChartData([], {})
    expect(result).toHaveLength(0)
  })

  it('should merge dates from different series', () => {
    const user = [{ date: '01.2024', value: 100 }]
    const remote = {
      series1: [{ date: '02.2024', value: 50 }],
    }
    
    const result = buildTimeseriesChartData(user, remote)
    
    expect(result).toHaveLength(2)
    expect(result[0]).toMatchObject({ user: 100 })
    expect(result[1]).toMatchObject({ series1: 50 })
  })
})

describe('calculateChartDateRange', () => {
  it('should return user data range when user has valid data (F0608)', () => {
    const userSeries = [
      { date: '01.2024', value: 100 },
      { date: '06.2024', value: 200 },
    ]
    
    const { minDate, maxDate } = calculateChartDateRange(userSeries)
    
    // minDate comes from user data, maxDate is always current month (F0608)
    expect(minDate).toBe(Date.UTC(2024, 0, 1))
    const now = new Date()
    const expectedMaxDate = Date.UTC(now.getFullYear(), now.getMonth(), 1)
    expect(maxDate).toBe(expectedMaxDate)
  })

  it('should return default range (01.2006 to today) when no user data', () => {
    const { minDate, maxDate } = calculateChartDateRange([])
    
    expect(minDate).toBe(Date.UTC(2006, 0, 1))
    expect(maxDate).toBeLessThanOrEqual(Date.now())
    expect(maxDate).toBeGreaterThan(Date.UTC(2025, 0, 1))
  })

  it('should handle single data point (F0608)', () => {
    const userSeries = [{ date: '03.2024', value: 150 }]
    
    const { minDate, maxDate } = calculateChartDateRange(userSeries)
    
    // minDate from user data, maxDate is always current month (F0608)
    expect(minDate).toBe(Date.UTC(2024, 2, 1))
    const now = new Date()
    const expectedMaxDate = Date.UTC(now.getFullYear(), now.getMonth(), 1)
    expect(maxDate).toBe(expectedMaxDate)
  })

  it('should fallback to default when user data has invalid dates', () => {
    const userSeries = [
      { date: 'invalid', value: 100 },
    ]
    
    const { minDate, maxDate } = calculateChartDateRange(userSeries)
    
    expect(minDate).toBe(Date.UTC(2006, 0, 1))
    expect(maxDate).toBeLessThanOrEqual(Date.now())
  })
})

describe('getSeriesFriendlyName', () => {
  it('should extract term after TP.DK. for matching codes (F0605)', () => {
    expect(getSeriesFriendlyName('TP.DK.EUR.A.YTL')).toBe('EUR')
    expect(getSeriesFriendlyName('TP.DK.USD.A.YTL')).toBe('USD')
    expect(getSeriesFriendlyName('TP.DK.GBP.A.YTL')).toBe('GBP')
  })

  it('should return full code for non-TP.DK. codes', () => {
    expect(getSeriesFriendlyName('TP.FG.J0')).toBe('TP.FG.J0')
    expect(getSeriesFriendlyName('SOME.OTHER.CODE')).toBe('SOME.OTHER.CODE')
    expect(getSeriesFriendlyName('SIMPLE')).toBe('SIMPLE')
  })

  it('should handle edge cases', () => {
    expect(getSeriesFriendlyName('TP.DK.')).toBe('TP.DK.')
    expect(getSeriesFriendlyName('TP.DK')).toBe('TP.DK')
    expect(getSeriesFriendlyName('')).toBe('')
  })
})

describe('generateDerivedSeries', () => {
  it('should generate derived series for TP.DK.* codes (F0606)', () => {
    const userSeries = [
      { date: '01.2024', value: 1000 },
      { date: '02.2024', value: 1200 },
    ]
    const remoteSeries = {
      'TP.DK.USD.A.YTL': [
        { date: '01.2024', value: 20 },
        { date: '02.2024', value: 24 },
      ],
      'TP.DK.EUR.A.YTL': [
        { date: '01.2024', value: 25 },
        { date: '02.2024', value: 30 },
      ],
    }
    
    const derived = generateDerivedSeries(userSeries, remoteSeries)
    
    expect(Object.keys(derived)).toEqual(['Gelir(USD)', 'Gelir(EUR)'])
    expect(derived['Gelir(USD)']).toHaveLength(2)
    expect(derived['Gelir(USD)'][0]).toEqual({ date: '01.2024', value: 50 }) // 1000/20
    expect(derived['Gelir(USD)'][1]).toEqual({ date: '02.2024', value: 50 }) // 1200/24
    expect(derived['Gelir(EUR)'][0]).toEqual({ date: '01.2024', value: 40 }) // 1000/25
    expect(derived['Gelir(EUR)'][1]).toEqual({ date: '02.2024', value: 40 }) // 1200/30
  })

  it('should not generate derived series for non-TP.DK. codes', () => {
    const userSeries = [{ date: '01.2024', value: 100 }]
    const remoteSeries = {
      'TP.FG.J0': [{ date: '01.2024', value: 10 }],
      'SOME.OTHER': [{ date: '01.2024', value: 5 }],
    }
    
    const derived = generateDerivedSeries(userSeries, remoteSeries)
    
    expect(Object.keys(derived)).toHaveLength(0)
  })

  it('should create empty derived series when no user data (F0609)', () => {
    const remoteSeries = {
      'TP.DK.USD.A.YTL': [
        { date: '01.2024', value: 20 },
        { date: '02.2024', value: 25 },
      ],
      'TP.DK.EUR.A.YTL': [
        { date: '01.2024', value: 30 },
      ],
    }
    
    const derived = generateDerivedSeries([], remoteSeries)
    
    // Should create empty derived series (visible in legend but no data)
    expect(Object.keys(derived)).toEqual(['Gelir(USD)', 'Gelir(EUR)'])
    expect(derived['Gelir(USD)']).toEqual([])
    expect(derived['Gelir(EUR)']).toEqual([])
  })

  it('should only include dates that exist in user data', () => {
    const userSeries = [
      { date: '01.2024', value: 1000 },
      { date: '03.2024', value: 1500 },
    ]
    const remoteSeries = {
      'TP.DK.USD.A.YTL': [
        { date: '01.2024', value: 20 },
        { date: '02.2024', value: 22 },
        { date: '03.2024', value: 25 },
      ],
    }
    
    const derived = generateDerivedSeries(userSeries, remoteSeries)
    
    expect(derived['Gelir(USD)']).toHaveLength(2)
    expect(derived['Gelir(USD)'][0].date).toBe('01.2024')
    expect(derived['Gelir(USD)'][1].date).toBe('03.2024')
  })

  it('should skip points where remote value is zero', () => {
    const userSeries = [
      { date: '01.2024', value: 1000 },
      { date: '02.2024', value: 1200 },
    ]
    const remoteSeries = {
      'TP.DK.USD.A.YTL': [
        { date: '01.2024', value: 20 },
        { date: '02.2024', value: 0 }, // Division by zero
      ],
    }
    
    const derived = generateDerivedSeries(userSeries, remoteSeries)
    
    expect(derived['Gelir(USD)']).toHaveLength(1)
    expect(derived['Gelir(USD)'][0].date).toBe('01.2024')
  })
})

describe('generateInflationSeries', () => {
  it('should normalize inflation to 100 at earliest user data date (F0612)', () => {
    const userSeries = [
      { date: '01.2024', value: 1000 },
      { date: '03.2024', value: 1200 },
    ]
    const remoteSeries = {
      'TP.FG.J0': [
        { date: '01.2024', value: 800 },
        { date: '02.2024', value: 850 },
        { date: '03.2024', value: 880 },
      ],
    }
    
    const inflation = generateInflationSeries(userSeries, remoteSeries)
    
    expect(inflation).not.toBeNull()
    expect(inflation!['Enflasyon']).toBeDefined()
    expect(inflation!['Enflasyon']).toHaveLength(3)
    expect(inflation!['Enflasyon'][0].value).toBe(100) // 800/800 * 100
    expect(inflation!['Enflasyon'][1].value).toBeCloseTo(106.25) // 850/800 * 100
    expect(inflation!['Enflasyon'][2].value).toBeCloseTo(110) // 880/800 * 100
  })

  it('should return raw series when no user data (F0612)', () => {
    const remoteSeries = {
      'TP.FG.J0': [
        { date: '01.2024', value: 800 },
        { date: '02.2024', value: 850 },
      ],
    }
    
    const inflation = generateInflationSeries([], remoteSeries)
    
    expect(inflation).not.toBeNull()
    expect(inflation!['Enflasyon']).toEqual(remoteSeries['TP.FG.J0'])
  })

  it('should return null if TP.FG.J0 not found', () => {
    const userSeries = [{ date: '01.2024', value: 1000 }]
    const remoteSeries = {
      'TP.DK.USD.A.YTL': [{ date: '01.2024', value: 20 }],
    }
    
    const inflation = generateInflationSeries(userSeries, remoteSeries)
    
    expect(inflation).toBeNull()
  })

  it('should return null if base value is zero', () => {
    const userSeries = [{ date: '01.2024', value: 1000 }]
    const remoteSeries = {
      'TP.FG.J0': [{ date: '01.2024', value: 0 }],
    }
    
    const inflation = generateInflationSeries(userSeries, remoteSeries)
    
    expect(inflation).toBeNull()
  })

  it('should handle user data before 2003 with inflation data available after (BUG-002)', () => {
    const userSeries = [
      { date: '01.2001', value: 1000 },
      { date: '01.2010', value: 2000 },
    ]
    const remoteSeries = {
      'TP.FG.J0': [
        { date: '01.2001', value: Number.NaN },
        { date: '02.2001', value: Number.NaN },
        { date: '01.2003', value: 94.77 },
        { date: '02.2003', value: 96.23 },
        { date: '01.2010', value: 146.94 },
      ],
    }
    
    const result = generateInflationSeries(userSeries, remoteSeries)
    
    // Should return inflation series even if first user data is before inflation data
    expect(result).not.toBeNull()
    expect(result!['Enflasyon']).toBeDefined()
    expect(result!['Enflasyon'].length).toBeGreaterThan(0)
    // Should use first valid inflation value (94.77) as base
    const firstValidPoint = result!['Enflasyon'].find(p => !Number.isNaN(p.value) && p.value > 0)
    expect(firstValidPoint).toBeDefined()
    expect(firstValidPoint!.value).toBe(100) // First valid value normalized to 100
  })

  it('should handle user data entirely before inflation data availability (BUG-002)', () => {
    const userSeries = [
      { date: '01.2000', value: 1000 },
      { date: '01.2001', value: 1200 },
    ]
    const remoteSeries = {
      'TP.FG.J0': [
        { date: '01.2000', value: Number.NaN },
        { date: '01.2001', value: Number.NaN },
        { date: '01.2003', value: 94.77 },
        { date: '02.2003', value: 96.23 },
        { date: '01.2010', value: 146.94 },
      ],
    }
    
    const result = generateInflationSeries(userSeries, remoteSeries)
    
    // Should use first available valid inflation data point as base
    expect(result).not.toBeNull()
    expect(result!['Enflasyon']).toBeDefined()
    const firstValidPoint = result!['Enflasyon'].find(p => !Number.isNaN(p.value) && p.value > 0)
    expect(firstValidPoint).toBeDefined()
    expect(firstValidPoint!.date).toBe('01.2003')
    expect(firstValidPoint!.value).toBe(100) // First valid value normalized to 100
  })
})

describe('generatePurchasingPowerSeries', () => {
  it('should calculate purchasing power correctly (F0613)', () => {
    const userSeries = [
      { date: '01.2024', value: 1000 },
      { date: '02.2024', value: 1200 },
      { date: '03.2024', value: 1500 },
    ]
    const inflationSeries = [
      { date: '01.2024', value: 100 }, // Base inflation
      { date: '02.2024', value: 110 }, // 10% increase
      { date: '03.2024', value: 120 }, // 20% increase
    ]
    
    const result = generatePurchasingPowerSeries(userSeries, inflationSeries)
    
    expect(result).not.toBeNull()
    expect(result!['Alım gücü']).toBeDefined()
    expect(result!['Alım gücü']).toHaveLength(3)
    
    // First point: (1000/1000)*100 / 100 * 100 = 100
    expect(result!['Alım gücü'][0].value).toBe(100)
    
    // Second point: (1200/1000)*100 / 110 * 100 = 120/110*100 ≈ 109.09
    expect(result!['Alım gücü'][1].value).toBeCloseTo(109.09, 2)
    
    // Third point: (1500/1000)*100 / 120 * 100 = 150/120*100 = 125
    expect(result!['Alım gücü'][2].value).toBe(125)
  })

  it('should return null when no user data (F0613)', () => {
    const inflationSeries = [{ date: '01.2024', value: 100 }]
    
    const result = generatePurchasingPowerSeries([], inflationSeries)
    
    expect(result).toBeNull()
  })

  it('should return null when no inflation data (F0613)', () => {
    const userSeries = [{ date: '01.2024', value: 1000 }]
    
    const result = generatePurchasingPowerSeries(userSeries, null)
    
    expect(result).toBeNull()
  })

  it('should return null when first user value is zero (F0613)', () => {
    const userSeries = [{ date: '01.2024', value: 0 }]
    const inflationSeries = [{ date: '01.2024', value: 100 }]
    
    const result = generatePurchasingPowerSeries(userSeries, inflationSeries)
    
    expect(result).toBeNull()
  })

  it('should skip points where inflation is zero (F0613)', () => {
    const userSeries = [
      { date: '01.2024', value: 1000 },
      { date: '02.2024', value: 1200 },
      { date: '03.2024', value: 1500 },
    ]
    const inflationSeries = [
      { date: '01.2024', value: 100 },
      { date: '02.2024', value: 0 }, // Zero inflation
      { date: '03.2024', value: 120 },
    ]
    
    const result = generatePurchasingPowerSeries(userSeries, inflationSeries)
    
    expect(result).not.toBeNull()
    expect(result!['Alım gücü']).toHaveLength(2) // Only 2 points (skip zero)
    expect(result!['Alım gücü'][0].date).toBe('01.2024')
    expect(result!['Alım gücü'][1].date).toBe('03.2024')
  })

  it('should interpolate inflation for dates without exact match (F0613)', () => {
    const userSeries = [
      { date: '01.2024', value: 1000 },
      { date: '02.2024', value: 1200 },
      { date: '03.2024', value: 1500 },
    ]
    const inflationSeries = [
      { date: '01.2024', value: 100 },
      // Missing 02.2024 - should use 100 (last known value)
      { date: '03.2024', value: 120 },
    ]
    
    const result = generatePurchasingPowerSeries(userSeries, inflationSeries)
    
    expect(result).not.toBeNull()
    expect(result!['Alım gücü']).toHaveLength(3) // All 3 dates should be included
    expect(result!['Alım gücü'][0].date).toBe('01.2024')
    expect(result!['Alım gücü'][1].date).toBe('02.2024')
    expect(result!['Alım gücü'][2].date).toBe('03.2024')
    
    // 02.2024 should use inflation value of 100 (from 01.2024)
    // (1200/1000)*100 / 100 * 100 = 120
    expect(result!['Alım gücü'][1].value).toBe(120)
  })
})

