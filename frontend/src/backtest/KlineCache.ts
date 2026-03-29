import type { Kline } from './types';
import { getKlines } from './KlineService';

const PAGE_SIZE = 1000;

export class KlineCache {
  private symbol: string;
  private interval: string;
  private klines: Kline[] = [];
  private index: number = 0;
  private startTime: string;
  private endTime: string;
  private isLoading: boolean = false;
  private hasMore: boolean = true;
  private totalConsumed: number = 0;
  private lastFetchCount: number = 0;

  constructor(symbol: string, interval: string, startTime: string, endTime: string) {
    this.symbol = symbol;
    this.interval = interval;
    this.startTime = startTime;
    this.endTime = endTime;
  }

  async fetchNextBatch(): Promise<void> {
    if (this.isLoading || !this.hasMore) {
      return;
    }

    this.isLoading = true;

    try {
      const response = await getKlines(this.symbol, this.interval, {
        limit: PAGE_SIZE,
        start_time: this.startTime,
        end_time: this.endTime,
      });

      if (response.data && response.data.length > 0) {
        const existingTimes = new Set(this.klines.map(k => k.open_time));
        const newKlines = response.data.filter(k => !existingTimes.has(k.open_time));
        
        if (newKlines.length > 0) {
          this.klines = [...this.klines, ...newKlines];
          this.klines.sort((a, b) => new Date(a.open_time).getTime() - new Date(b.open_time).getTime());
        }
        this.lastFetchCount = response.data.length;

        if (newKlines.length !== response.data.length) {
          console.warn(`Filtered ${response.data.length - newKlines.length} duplicate klines`);
        }

        const lastKline = response.data[response.data.length - 1];
        const firstKline = response.data[0];
        console.log(`Fetched ${response.data.length} klines: ${firstKline.open_time} to ${lastKline.open_time}`);
        
        this.startTime = lastKline.open_time;

        if (response.data.length < PAGE_SIZE) {
          this.hasMore = false;
        }
      } else {
        this.hasMore = false;
      }
    } catch (error) {
      console.error('Failed to fetch klines:', error);
      this.hasMore = false;
    } finally {
      this.isLoading = false;
    }
  }

  next(): Kline | null {
    if (this.index < this.klines.length) {
      this.totalConsumed++;
      return this.klines[this.index++];
    }
    return null;
  }

  hasLowBuffer(): boolean {
    return this.klines.length - this.index < 100;
  }

  isDone(): boolean {
    return this.index >= this.klines.length && !this.hasMore;
  }

  isLoadingData(): boolean {
    return this.isLoading;
  }

  hasMoreData(): boolean {
    return this.hasMore;
  }

  getRemainingCount(): number {
    return this.klines.length - this.index;
  }

  getTotalConsumed(): number {
    return this.totalConsumed;
  }

  getLastFetchCount(): number {
    return this.lastFetchCount;
  }

  reset(): void {
    this.klines = [];
    this.index = 0;
    this.hasMore = true;
    this.isLoading = false;
    this.totalConsumed = 0;
    this.lastFetchCount = 0;
  }
}