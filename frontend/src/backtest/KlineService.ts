import axios from 'axios';
import type { Kline, KlineListResponse } from './types';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

export async function getSymbols(): Promise<string[]> {
  const response = await api.get('/api/v1/kline/symbols');
  return response.data.symbols;
}

export async function getIntervals(): Promise<string[]> {
  const response = await api.get('/api/v1/kline/intervals');
  return response.data.intervals;
}

export async function getKlines(
  symbol: string,
  interval: string,
  options: {
    limit?: number;
    start_time?: string;
    end_time?: string;
  } = {}
): Promise<KlineListResponse> {
  const params: Record<string, string | number> = {};

  if (options.limit) {
    params.limit = options.limit;
  }
  if (options.start_time) {
    params.start_time = options.start_time;
  }
  if (options.end_time) {
    params.end_time = options.end_time;
  }

  const response = await api.get<KlineListResponse>(
    `/api/v1/kline/${symbol}/${interval}`,
    { params }
  );

  return response.data;
}

export async function getKlinesBatch(
  symbol: string,
  interval: string,
  startTime: string,
  endTime: string
): Promise<KlineListResponse> {
  const params = { start_time: startTime, end_time: endTime };

  const response = await api.get<KlineListResponse>(
    `/api/v1/kline/${symbol}/${interval}/batch`,
    { params }
  );

  return response.data;
}

export default api;
