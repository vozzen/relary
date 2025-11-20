/**
 * EVDS Client Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EVDSClient } from './client';
import { AggregationType, FormulaType, FrequencyType, DataGroupMode } from './types';

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

      await client.getSeries({
        series: 'TEST',
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-12-31'),
      });

      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('startDate=15-01-2024'),
        expect.any(Object)
      );
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('endDate=31-12-2024'),
        expect.any(Object)
      );
    });

    it('should accept string dates as-is', async () => {
      const mockResponse = { items: [] };
      (globalThis.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await client.getSeries({
        series: 'TEST',
        startDate: '01-01-2024',
        endDate: '31-12-2024',
      });

      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('startDate=01-01-2024'),
        expect.any(Object)
      );
    });
  });

  describe('getSeries', () => {
    it('should fetch series data with basic parameters', async () => {
      const mockResponse = {
        items: [
          { Tarih: '2024-01-01', 'TP.DK.USD.A': '30.1234' }
        ]
      };

      (globalThis.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await client.getSeries({
        series: 'TP.DK.USD.A',
        startDate: '01-01-2024',
        endDate: '31-12-2024',
      });

      expect(result).toEqual(mockResponse);
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

      await client.getSeries({
        series: ['TP.DK.USD.A', 'TP.DK.EUR.A'],
        startDate: '01-01-2024',
        endDate: '31-12-2024',
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

      await client.getSeries({
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
        client.getSeries({
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
        client.getSeries({
          series: 'TEST',
          startDate: '01-01-2024',
          endDate: '31-12-2024',
        })
      ).rejects.toThrow('EVDS API request failed: 500 Internal Server Error');
    });
  });

  describe('getDataGroupData', () => {
    it('should fetch data group data', async () => {
      const mockResponse = { items: [] };
      (globalThis.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await client.getDataGroupData({
        datagroup: 'bie_yssk',
        startDate: '01-01-2024',
        endDate: '31-12-2024',
      });

      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('datagroup=bie_yssk'),
        expect.any(Object)
      );
    });
  });

  describe('getCategories', () => {
    it('should fetch all categories', async () => {
      const mockResponse = [
        { CATEGORY_ID: '1', TOPIC_TITLE_TR: 'Kurlar', TOPIC_TITLE_ENG: 'Exchange Rates' }
      ];
      (globalThis.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await client.getCategories();

      expect(result).toEqual(mockResponse);
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('categories'),
        expect.any(Object)
      );
    });
  });

  describe('getDataGroups', () => {
    it('should fetch all data groups', async () => {
      const mockResponse: any[] = [];
      (globalThis.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await client.getDataGroups({
        mode: DataGroupMode.ALL,
      });

      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('mode=0'),
        expect.any(Object)
      );
    });

    it('should fetch data groups by category', async () => {
      const mockResponse: any[] = [];
      (globalThis.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await client.getDataGroups({
        mode: DataGroupMode.BY_CATEGORY,
        code: '2',
      });

      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('mode=2'),
        expect.any(Object)
      );
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('code=2'),
        expect.any(Object)
      );
    });

    it('should fetch specific data group', async () => {
      const mockResponse: any[] = [];
      (globalThis.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await client.getDataGroups({
        mode: DataGroupMode.BY_DATAGROUP,
        code: 'bie_yssk',
      });

      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('mode=1'),
        expect.any(Object)
      );
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('code=bie_yssk'),
        expect.any(Object)
      );
    });
  });

  describe('getSeriesList', () => {
    it('should fetch series list by data group code', async () => {
      const mockResponse: any[] = [];
      (globalThis.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await client.getSeriesList({
        code: 'bie_yssk',
      });

      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('code=bie_yssk'),
        expect.any(Object)
      );
    });

    it('should fetch series info by series code', async () => {
      const mockResponse: any[] = [];
      (globalThis.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await client.getSeriesList({
        code: 'TP.DK.USD.A',
      });

      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('code=TP.DK.USD.A'),
        expect.any(Object)
      );
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

      await customClient.getSeries({
        series: 'TEST',
        startDate: '01-01-2024',
        endDate: '31-12-2024',
      });

      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('https://custom.api.com'),
        expect.any(Object)
      );
    });
  });
});
