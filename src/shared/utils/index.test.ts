import { describe, it, expect } from 'vitest'
import {
  isValidTimeseriesDate,
  parseTimeseriesInput,
  normalizeTimeseriesDate,
  interpolateMonthlyTimeseries,
  buildTimeseriesChartData,
  calculateChartDateRange,
} from './index'

describe('isValidTimeseriesDate', () => {
  it('should validate DD.MM.YYYY format', () => {
    expect(isValidTimeseriesDate('01.01.2024')).toBe(true)
    expect(isValidTimeseriesDate('31.12.2024')).toBe(true)
    expect(isValidTimeseriesDate('15.06.2024')).toBe(true)
  })

  it('should validate MM.YYYY format', () => {
    expect(isValidTimeseriesDate('01.2024')).toBe(true)
    expect(isValidTimeseriesDate('12.2024')).toBe(true)
  })

  it('should validate MM-YYYY format', () => {
    expect(isValidTimeseriesDate('01-2024')).toBe(true)
    expect(isValidTimeseriesDate('12-2024')).toBe(true)
  })

  it('should reject invalid formats', () => {
    expect(isValidTimeseriesDate('2024-01-01')).toBe(false)
    expect(isValidTimeseriesDate('01/01/2024')).toBe(false)
    expect(isValidTimeseriesDate('invalid')).toBe(false)
    expect(isValidTimeseriesDate('32.01.2024')).toBe(false)
    expect(isValidTimeseriesDate('01.13.2024')).toBe(false)
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
    expect(date.getUTCDate()).toBe(15)
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

  it('should return NaN for invalid dates', () => {
    expect(Number.isNaN(normalizeTimeseriesDate('invalid'))).toBe(true)
  })
})

describe('interpolateMonthlyTimeseries', () => {
  it('should fill monthly gaps', () => {
    const points = [
      { date: '01.2024', value: 100 },
      { date: '04.2024', value: 123 },
    ]
    
    const result = interpolateMonthlyTimeseries(points)
    
    expect(result).toHaveLength(4)
    expect(result[0]).toEqual({ date: '01.2024', value: 100 })
    expect(result[1]).toEqual({ date: '02.2024', value: 100 })
    expect(result[2]).toEqual({ date: '03.2024', value: 100 })
    expect(result[3]).toEqual({ date: '04.2024', value: 123 })
  })

  it('should handle single point', () => {
    const points = [{ date: '01.2024', value: 100 }]
    const result = interpolateMonthlyTimeseries(points)
    
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({ date: '01.2024', value: 100 })
  })

  it('should handle empty input', () => {
    const result = interpolateMonthlyTimeseries([])
    expect(result).toHaveLength(0)
  })

  it('should sort points before interpolation', () => {
    const points = [
      { date: '04.2024', value: 123 },
      { date: '01.2024', value: 100 },
    ]
    
    const result = interpolateMonthlyTimeseries(points)
    
    expect(result[0].date).toBe('01.2024')
    expect(result.at(-1)?.date).toBe('04.2024')
  })

  it('should handle consecutive months', () => {
    const points = [
      { date: '01.2024', value: 100 },
      { date: '02.2024', value: 200 },
    ]
    
    const result = interpolateMonthlyTimeseries(points)
    
    expect(result).toHaveLength(2)
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
  it('should return user data range when user has valid data', () => {
    const userSeries = [
      { date: '01.2024', value: 100 },
      { date: '06.2024', value: 200 },
    ]
    
    const { minDate, maxDate } = calculateChartDateRange(userSeries)
    
    expect(minDate).toBe(Date.UTC(2024, 0, 1))
    expect(maxDate).toBe(Date.UTC(2024, 5, 1))
  })

  it('should return default range (01.2006 to today) when no user data', () => {
    const { minDate, maxDate } = calculateChartDateRange([])
    
    expect(minDate).toBe(Date.UTC(2006, 0, 1))
    expect(maxDate).toBeLessThanOrEqual(Date.now())
    expect(maxDate).toBeGreaterThan(Date.UTC(2025, 0, 1))
  })

  it('should handle single data point', () => {
    const userSeries = [{ date: '03.2024', value: 150 }]
    
    const { minDate, maxDate } = calculateChartDateRange(userSeries)
    
    expect(minDate).toBe(Date.UTC(2024, 2, 1))
    expect(maxDate).toBe(Date.UTC(2024, 2, 1))
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
