import { describe, it, expect } from 'vitest';

/**
 * Test utilities for fetch-series.ts
 * These functions are exported from the main file for testing
 */

/**
 * Converts API value to string, filtering out NaN values
 */
function convertValueToString(value: number | null | undefined): string | null {
  // If value is null or undefined, return null
  if (value === null || value === undefined) {
    return null;
  }
  
  // If value is NaN, return null instead of "NaN"
  if (Number.isNaN(value)) {
    return null;
  }
  
  // Convert valid number to string
  return String(value);
}

describe('fetch-series value conversion', () => {
  describe('convertValueToString', () => {
    it('should convert valid numbers to strings', () => {
      expect(convertValueToString(123.45)).toBe('123.45');
      expect(convertValueToString(0)).toBe('0');
      expect(convertValueToString(-10.5)).toBe('-10.5');
    });

    it('should return null for NaN values instead of "NaN" string', () => {
      expect(convertValueToString(Number.NaN)).toBe(null);
      expect(convertValueToString(Number('invalid'))).toBe(null);
      expect(convertValueToString(Number.parseFloat('not a number'))).toBe(null);
    });

    it('should return null for null and undefined', () => {
      expect(convertValueToString(null)).toBe(null);
      expect(convertValueToString(undefined)).toBe(null);
    });

    it('should handle edge cases', () => {
      expect(convertValueToString(Infinity)).toBe('Infinity');
      expect(convertValueToString(-Infinity)).toBe('-Infinity');
    });
  });
});

/**
 * Filter function to remove items with null values
 */
function filterNullValues(items: Array<{ date: string; value: string | null }>): Array<{ date: string; value: string }> {
  return items.filter((item): item is { date: string; value: string } => item.value !== null);
}

describe('fetch-series null value filtering', () => {
  describe('filterNullValues', () => {
    it('should keep items with valid values', () => {
      const items = [
        { date: '2023.01.01', value: '100' },
        { date: '2023.02.01', value: '200' },
      ];
      expect(filterNullValues(items)).toEqual(items);
    });

    it('should remove items with null values', () => {
      const items = [
        { date: '2023.01.01', value: '100' },
        { date: '2023.02.01', value: null },
        { date: '2023.03.01', value: '300' },
      ];
      expect(filterNullValues(items)).toEqual([
        { date: '2023.01.01', value: '100' },
        { date: '2023.03.01', value: '300' },
      ]);
    });

    it('should return empty array when all values are null', () => {
      const items = [
        { date: '2023.01.01', value: null },
        { date: '2023.02.01', value: null },
      ];
      expect(filterNullValues(items)).toEqual([]);
    });
  });
});
