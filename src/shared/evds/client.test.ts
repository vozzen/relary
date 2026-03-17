/**
 * EVDS Client Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EVDSClient } from './client';
import { AggregationType, FormulaType, FrequencyType } from './types';

// Mock fetch globally
globalThis.fetch = vi.fn() as any;

describe('EVDSClient', () => {
  let client: EVDSClient;
  const mockApiKey = 'test-api-key';

  beforeEach(() => {
    client = new EVDSClient({ apiKey: mockApiKey });
    vi.clearAllMocks();
  });

  describe('formatDate', () => {
    it('should format Date object to DD-MM-YYYY', async () => {
      const mockResponse = { items: [] };
      (globalThis.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await client.getMultiSeries({
        series: 'TEST',
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-04-30'),
      });

      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('startDate=15-01-2024'),
        expect.any(Object)
      );
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('endDate=30-04-2024'),
        expect.any(Object)
      );
    });

    it('should accept string dates as-is', async () => {
      const mockResponse = { items: [] };
      (globalThis.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await client.getMultiSeries({
        series: 'TEST',
        startDate: '01-01-2024',
        endDate: '01-03-2024',
      });

      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('startDate=01-01-2024'),
        expect.any(Object)
      );
    });
  });

  describe('getMultiSeries', () => {
    it('should fetch series data with basic parameters', async () => {
      const mockResponse = {
        items: [
          { Tarih: '2024-01-01', TP_DK_USD_A: '30.1234' }
        ]
      };

      (globalThis.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await client.getMultiSeries({
        series: 'TP.DK.USD.A',
        startDate: '01-01-2024',
        endDate: '01-03-2024',
      });

      expect(result.seriesList).toBeDefined();
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('series=TP.DK.USD.A'),
        expect.objectContaining({
          headers: { key: mockApiKey }
        })
      );
    });

    it('should join multiple series with "-"', async () => {
      const mockResponse = { items: [] };
      (globalThis.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await client.getMultiSeries({
        series: ['TP.DK.USD.A', 'TP.DK.EUR.A'],
        startDate: '01-01-2024',
        endDate: '01-03-2024',
      });

      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('series=TP.DK.USD.A-TP.DK.EUR.A'),
        expect.any(Object)
      );
    });

    it('should include optional parameters', async () => {
      const mockResponse = { items: [] };
      (globalThis.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await client.getMultiSeries({
        series: ['TP.DK.USD.A', 'TP.DK.EUR.A'],
        startDate: '01-01-2024',
        endDate: '31-12-2024',
        frequency: FrequencyType.MONTHLY,
        aggregationTypes: [AggregationType.AVERAGE, AggregationType.MAXIMUM],
        formulas: [FormulaType.LEVEL, FormulaType.PERCENTAGE_CHANGE],
      });

      const callUrl = (globalThis.fetch as any).mock.calls[0][0];
      expect(callUrl).toContain('frequency=5');
      expect(callUrl).toContain('aggregationTypes=avg-max');
      expect(callUrl).toContain('formulas=0-1');
    });

    it('should throw error on 403 response', async () => {
      (globalThis.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
      });

      await expect(
        client.getMultiSeries({
          series: 'TEST',
          startDate: '01-01-2024',
          endDate: '31-12-2024',
        })
      ).rejects.toThrow('EVDS API authentication failed');
    });

    it('should throw error on non-200 response', async () => {
      (globalThis.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expect(
        client.getMultiSeries({
          series: 'TEST',
          startDate: '01-01-2024',
          endDate: '31-12-2024',
        })
      ).rejects.toThrow('EVDS API request failed: 500 Internal Server Error');
    });
  });

  describe('custom baseUrl', () => {
    it('should use custom base URL', async () => {
      const customClient = new EVDSClient({
        apiKey: mockApiKey,
        baseUrl: 'https://custom.api.com',
      });

      const mockResponse = { items: [] };
      (globalThis.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await customClient.getMultiSeries({
        series: 'TEST',
        startDate: '01-01-2024',
        endDate: '01-03-2024',
      });

      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('https://custom.api.com'),
        expect.any(Object)
      );
    });
  });

  describe('chunked fetching (150-observation limit)', () => {
    it('should make a single request when observations <= 150', async () => {
      const mockResponse = { items: [{ Tarih: '2024-01-01', TEST: '1' }] };
      (globalThis.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await client.getMultiSeries({
        series: 'TEST',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        frequency: FrequencyType.MONTHLY,
      });

      expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    });

    it('should split into multiple requests when monthly observations > 150', async () => {
      // 2003-01-01 to 2026-03-01 = 279 months → needs 2 chunks
      const chunk1Response = {
        items: [
          { Tarih: '2003-01-01', TEST: '10' },
          { Tarih: '2003-02-01', TEST: '11' },
        ]
      };
      const chunk2Response = {
        items: [
          { Tarih: '2015-07-01', TEST: '20' },
          { Tarih: '2015-08-01', TEST: '21' },
        ]
      };

      (globalThis.fetch as any)
        .mockResolvedValueOnce({ ok: true, json: async () => chunk1Response })
        .mockResolvedValueOnce({ ok: true, json: async () => chunk2Response });

      const result = await client.getMultiSeries({
        series: 'TEST',
        startDate: new Date('2003-01-01'),
        endDate: new Date('2026-03-01'),
        frequency: FrequencyType.MONTHLY,
      });

      expect(globalThis.fetch).toHaveBeenCalledTimes(2);
      // Results from both chunks should be merged
      expect(result.seriesList[0].items).toHaveLength(4);
    });

    it('should use non-overlapping date ranges for chunks', async () => {
      const emptyResponse = { items: [] };
      (globalThis.fetch as any)
        .mockResolvedValue({ ok: true, json: async () => emptyResponse });

      await client.getMultiSeries({
        series: 'TEST',
        startDate: new Date('2003-01-01'),
        endDate: new Date('2026-03-01'),
        frequency: FrequencyType.MONTHLY,
      });

      const calls = (globalThis.fetch as any).mock.calls;
      expect(calls.length).toBe(2);

      // First chunk should start at original start date
      const url1 = calls[0][0] as string;
      expect(url1).toContain('startDate=01-01-2003');

      // Second chunk should start after first chunk ends
      const url2 = calls[1][0] as string;
      expect(url2).toContain('endDate=01-03-2026');
    });

    it('should handle exactly 150 monthly observations without chunking', async () => {
      // 150 months from Jan 2012: Jan 2012 to Jun 2024
      const mockResponse = { items: [] };
      (globalThis.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await client.getMultiSeries({
        series: 'TEST',
        startDate: new Date('2012-01-01'),
        endDate: new Date('2024-06-01'),
        frequency: FrequencyType.MONTHLY,
      });

      expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    });

    it('should chunk daily requests for ranges > 150 days', async () => {
      const emptyResponse = { items: [] };
      (globalThis.fetch as any)
        .mockResolvedValue({ ok: true, json: async () => emptyResponse });

      // 365 days without frequency → defaults to daily → needs 3 chunks
      await client.getMultiSeries({
        series: 'TEST',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
      });

      expect((globalThis.fetch as any).mock.calls.length).toBeGreaterThan(1);
    });

    it('should propagate errors from chunked requests', async () => {
      // First chunk succeeds, second fails
      const chunk1Response = { items: [{ Tarih: '2003-01-01', TEST: '10' }] };
      (globalThis.fetch as any)
        .mockResolvedValueOnce({ ok: true, json: async () => chunk1Response })
        .mockResolvedValueOnce({ ok: false, status: 500, statusText: 'Internal Server Error' });

      await expect(
        client.getMultiSeries({
          series: 'TEST',
          startDate: new Date('2003-01-01'),
          endDate: new Date('2026-03-01'),
          frequency: FrequencyType.MONTHLY,
        })
      ).rejects.toThrow('EVDS API request failed: 500 Internal Server Error');
    });
  });
});
