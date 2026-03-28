export interface Kline {
  open_time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  close_time: string;
}

export interface BacktestConfig {
  symbol: string;
  interval: string;
  startTime: string;
  endTime: string;
  initialBalance: number;
  feeRate: number;
}

export interface Trade {
  timestamp: string;
  type: 'buy' | 'sell';
  price: number;
  amount: number;
  balance: number;
  fee: number;
  position: number;
  baseAsset: number;
  totalValue: number;
}

export interface EquityPoint {
  timestamp: string;
  equity: number;
  balance: number;
  position: number;
  positionValue: number;
}

export interface DrawdownPoint {
  timestamp: string;
  drawdown: number;
  drawdownRate: number;
  highWaterMark: number;
}

export interface BacktestResult {
  initialBalance: number;
  finalBalance: number;
  profit: number;
  profitRate: number;
  maxDrawdown: number;
  maxDrawdownRate: number;
  totalTrades: number;
  winRate: number;
  trades: Trade[];
  equityCurve: EquityPoint[];
  drawdownCurve: DrawdownPoint[];
  finalPosition: number;
  finalPrice: number;
}

export interface KlineListResponse {
  symbol: string;
  interval: string;
  count: number;
  data: Kline[];
}

export interface TradeMarker {
  time: string;
  position: 'aboveBar' | 'belowBar';
  color: string;
  shape: 'arrowUp' | 'arrowDown';
  text: string;
}

export interface StrategyParams {
  ma_period?: number;
  buy_amount?: number;
  [key: string]: number | undefined;
}
