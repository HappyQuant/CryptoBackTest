import { loadPyodide, PyodideInterface } from 'pyodide';
import type { Kline, BacktestResult, Trade, EquityPoint, DrawdownPoint } from './types';

let pyodideInstance: PyodideInterface | null = null;
let backtestToolsLoaded = false;

export interface BacktestProgress {
  processedKlines: number;
  totalKlines: number;
  trades: Trade[];
  equityCurve: EquityPoint[];
  currentEquity: number;
}

export async function initializePyodide(): Promise<void> {
  if (pyodideInstance) {
    return;
  }

  pyodideInstance = await loadPyodide({
    indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.29.3/full/',
  });

  await pyodideInstance.loadPackage(['numpy']);
}

export async function loadBacktestTools(): Promise<void> {
  if (!pyodideInstance) {
    await initializePyodide();
  }

  if (backtestToolsLoaded) {
    return;
  }

  const backtestCode = `
from decimal import Decimal
from collections import deque
from datetime import datetime
from enum import Enum

class OrderType(Enum):
    BUY = "buy"
    SELL = "sell"

class OrderSide(Enum):
    LONG = "long"
    SHORT = "short"

class PositionSide(Enum):
    LONG = "long"
    SHORT = "short"
    BOTH = "both"

class Kline:
    def __init__(self, data: dict):
        self.open_time = data.get('open_time', '')
        self.open = float(data.get('open', 0))
        self.high = float(data.get('high', 0))
        self.low = float(data.get('low', 0))
        self.close = float(data.get('close', 0))
        self.volume = float(data.get('volume', 0))
        self.close_time = data.get('close_time', '')

    def __repr__(self):
        return f"<Kline(open_time={self.open_time}, close={self.close})>"

class KlineCache:
    def __init__(self, kline_wnd_size: int = 50):
        self.kline_wnd_size = kline_wnd_size
        self.klines = deque(maxlen=kline_wnd_size)

    def append(self, kline: Kline):
        self.klines.append(kline)

    def get_klines(self) -> list:
        return list(self.klines)

    def get_closes(self) -> list:
        return [k.close for k in self.klines]

    def get_highs(self) -> list:
        return [k.high for k in self.klines]

    def get_lows(self) -> list:
        return [k.low for k in self.klines]

    def get_volumes(self) -> list:
        return [k.volume for k in self.klines]

    def get_opens(self) -> list:
        return [k.open for k in self.klines]

    def is_full(self) -> bool:
        return len(self.klines) >= self.kline_wnd_size

    def __len__(self):
        return len(self.klines)

class Order:
    def __init__(self, timestamp: str, order_type: OrderType, price: float, amount: float, fee: float = 0, order_side: OrderSide = None):
        self.timestamp = timestamp
        self.type = order_type
        self.price = float(price)
        self.amount = float(amount)
        self.fee = float(fee)
        self.order_side = order_side

    def __repr__(self):
        return f"<Order(type={self.type.value}, price={self.price}, amount={self.amount})>"

class BacktestContext:
    def __init__(self, initial_balance: float, fee_rate: float = 0.001):
        self.initial_balance = Decimal(str(initial_balance))
        self.balance = Decimal(str(initial_balance))
        self.position = Decimal('0')
        self.fee_rate = Decimal(str(fee_rate))
        self.base_fee = Decimal('0')
        self.quote_fee = Decimal('0')
        self.buy_cost = Decimal('0')
        self.trades = []
        self.orders = []
        self.equity_curve = []
        self.max_drawdown = Decimal('0')
        self.highest_balance = self.initial_balance
        self.balance_history = []
        self.position_history = []
        self._trade_buffer = []

    def buy(self, price: float, amount: float, timestamp: str) -> bool:
        price = Decimal(str(price))
        amount = Decimal(str(amount))
        total_cost = price * amount
        fee = total_cost * self.fee_rate

        if self.balance >= total_cost + fee and amount > 0:
            self.balance -= total_cost + fee
            self.position += amount
            self.quote_fee += fee

            order = Order(timestamp, OrderType.BUY, price, amount, fee)
            self.orders.append(order)

            position_value = self.position * price
            total_value = self.balance + position_value

            trade = {
                'timestamp': timestamp,
                'type': 'buy',
                'price': float(price),
                'amount': float(amount),
                'balance': float(self.balance),
                'fee': float(fee),
                'position': float(self.position),
                'baseAsset': float(self.position),
                'totalValue': float(total_value)
            }
            self.trades.append(trade)
            self._trade_buffer.append(trade)

            self.buy_cost += total_cost
            self.update_equity_curve(timestamp, price)
            self.record_history()

            return True
        return False

    def sell(self, price: float, amount: float, timestamp: str) -> bool:
        price = Decimal(str(price))
        amount = Decimal(str(amount))

        if self.position >= amount and amount > 0:
            total_revenue = price * amount
            fee = total_revenue * self.fee_rate

            self.balance += total_revenue - fee
            self.position -= amount
            self.quote_fee += fee

            order = Order(timestamp, OrderType.SELL, price, amount, fee)
            self.orders.append(order)

            position_value = self.position * price
            total_value = self.balance + position_value

            trade = {
                'timestamp': timestamp,
                'type': 'sell',
                'price': float(price),
                'amount': float(amount),
                'balance': float(self.balance),
                'fee': float(fee),
                'position': float(self.position),
                'baseAsset': float(self.position),
                'totalValue': float(total_value)
            }
            self.trades.append(trade)
            self._trade_buffer.append(trade)

            self.update_equity_curve(timestamp, price)
            self.record_history()

            return True
        return False

    def sell_all(self, price: float, timestamp: str) -> bool:
        if self.position > 0:
            return self.sell(price, float(self.position), timestamp)
        return False

    def get_position_value(self, price: float) -> Decimal:
        return self.position * Decimal(str(price))

    def get_equity(self, price: float) -> Decimal:
        return self.balance + self.get_position_value(price)

    def get_avg_position_price(self) -> float:
        if self.position > 0:
            return float(self.buy_cost / self.position)
        return 0.0

    def get_drawdown(self, current_price: float) -> Decimal:
        current_price = Decimal(str(current_price))
        equity = self.get_equity(current_price)
        if self.highest_balance > 0:
            return (self.highest_balance - equity) / self.highest_balance
        return Decimal('0')

    def update_equity_curve(self, timestamp: str, current_price: float):
        current_price = Decimal(str(current_price))
        equity = self.get_equity(current_price)

        self.equity_curve.append({
            'timestamp': timestamp,
            'equity': float(equity),
            'balance': float(self.balance),
            'position': float(self.position),
            'positionValue': float(self.position * current_price)
        })

        if equity > self.highest_balance:
            self.highest_balance = equity

        drawdown = (self.highest_balance - equity) / self.highest_balance
        if drawdown > self.max_drawdown:
            self.max_drawdown = drawdown

    def record_history(self):
        self.balance_history.append(float(self.balance))
        self.position_history.append(float(self.position))

    def get_new_trades(self) -> list:
        trades = self._trade_buffer.copy()
        self._trade_buffer.clear()
        return trades

    def get_result(self, final_price: float) -> dict:
        final_price = Decimal(str(final_price))
        final_equity = self.get_equity(final_price)
        profit = final_equity - self.initial_balance
        profit_rate = profit / self.initial_balance if self.initial_balance > 0 else Decimal('0')

        win_trades = 0
        total_sell_trades = 0
        last_buy_price = None

        for trade in self.trades:
            if trade['type'] == 'buy':
                last_buy_price = trade['price']
            elif trade['type'] == 'sell' and last_buy_price is not None:
                total_sell_trades += 1
                if trade['price'] > last_buy_price:
                    win_trades += 1

        win_rate = win_trades / total_sell_trades if total_sell_trades > 0 else 0

        return {
            'initialBalance': float(self.initial_balance),
            'finalBalance': float(final_equity),
            'profit': float(profit),
            'profitRate': float(profit_rate),
            'maxDrawdown': float(self.max_drawdown),
            'maxDrawdownRate': float(self.max_drawdown),
            'totalTrades': len(self.trades),
            'winRate': win_rate,
            'baseAsset': float(self.position),
            'quoteAsset': float(self.balance),
            'baseFee': float(self.base_fee),
            'quoteFee': float(self.quote_fee),
            'trades': self.trades,
            'equityCurve': self.equity_curve
        }

    def __repr__(self):
        return f"<BacktestContext(balance={self.balance}, position={self.position})>"

class IStrategy:
    def __init__(self):
        self.kline_cache = None
        self.name = self.__class__.__name__

    def initialize(self, kline_wnd_size: int = 50):
        self.kline_cache = KlineCache(kline_wnd_size)

    def run(self, context: BacktestContext, kline: Kline, params: dict):
        raise NotImplementedError("子类必须实现run方法")

    def on_trade(self, trade: dict):
        pass

    def on_day_end(self, date: str, context: BacktestContext):
        pass

def calculate_sma(data: list, period: int) -> float:
    if len(data) < period:
        return None
    return sum(data[-period:]) / period

def calculate_ema(data: list, period: int) -> float:
    if len(data) < period:
        return None

    multiplier = 2 / (period + 1)
    ema = sum(data[:period]) / period

    for price in data[period:]:
        ema = (price - ema) * multiplier + ema

    return ema

def calculate_rsi(data: list, period: int = 14) -> float:
    if len(data) < period + 1:
        return None

    gains = []
    losses = []

    for i in range(1, period + 1):
        change = data[-i] - data[-i-1]
        if change > 0:
            gains.append(change)
            losses.append(0)
        else:
            gains.append(0)
            losses.append(abs(change))

    avg_gain = sum(gains) / len(gains)
    avg_loss = sum(losses) / len(losses)

    if avg_loss == 0:
        return 100

    rs = avg_gain / avg_loss
    return 100 - (100 / (1 + rs))

def calculate_macd(data: list, fast: int = 12, slow: int = 26, signal: int = 9) -> tuple:
    if len(data) < slow:
        return None, None, None

    ema_fast = calculate_ema(data, fast)
    ema_slow = calculate_ema(data, slow)

    if ema_fast is None or ema_slow is None:
        return None, None, None

    macd_line = ema_fast - ema_slow
    signal_line = macd_line * 0.9
    histogram = macd_line - signal_line

    return macd_line, signal_line, histogram
`;

  pyodideInstance!.runPython(backtestCode);
  backtestToolsLoaded = true;
}

export function runBacktest(
  strategyCode: string,
  klineDataList: Kline[],
  initialBalance: number,
  feeRate: number,
  klineWndSize: number = 50
): BacktestResult {
  if (!pyodideInstance) {
    throw new Error('Pyodide not initialized');
  }

  if (!klineDataList || klineDataList.length === 0) {
    return {
      initialBalance,
      finalBalance: initialBalance,
      profit: 0,
      profitRate: 0,
      maxDrawdown: 0,
      maxDrawdownRate: 0,
      totalTrades: 0,
      winRate: 0,
      trades: [],
      equityCurve: [],
      drawdownCurve: [],
      finalPosition: 0,
      finalPrice: 0,
    };
  }

  const globalNs = pyodideInstance!.globals;

  const escapedCode = strategyCode
    .replace(/\\/g, '\\\\')
    .replace(/'''/g, "\\'\\'\\'");

  pyodideInstance!.runPython(`
exec_globals = {
    'IStrategy': IStrategy,
    'KlineCache': KlineCache,
    'Kline': Kline,
    'Order': Order,
    'OrderType': OrderType,
    'BacktestContext': BacktestContext,
    'deque': deque,
    'Decimal': Decimal,
    'datetime': datetime,
    'calculate_sma': calculate_sma,
    'calculate_ema': calculate_ema,
    'calculate_rsi': calculate_rsi,
    'calculate_macd': calculate_macd,
}
exec_locals = {}
strategy_code = '''${escapedCode}'''
try:
    exec(strategy_code, exec_globals, exec_locals)
    Strategy = exec_locals.get('Strategy')
    if Strategy is None:
        raise NameError("Strategy class not found in strategy code")
    strategy = Strategy()
    strategy.initialize(${klineWndSize})
    context = BacktestContext(${initialBalance}, ${feeRate})
except Exception as e:
    import traceback
    traceback.print_exc()
    raise
  `);

  for (const klineData of klineDataList) {
    try {
      pyodideInstance!.runPython(`
kline = Kline({
    'open_time': '${klineData.open_time}',
    'open': ${klineData.open},
    'high': ${klineData.high},
    'low': ${klineData.low},
    'close': ${klineData.close},
    'volume': ${klineData.volume},
    'close_time': '${klineData.close_time}'
})
strategy.kline_cache.append(kline)
strategy.run(context, kline, {})
context.update_equity_curve('${klineData.open_time}', ${klineData.close})
      `);
    } catch (err) {
      console.error('Error processing kline:', klineData, err);
      throw err;
    }
  }

  pyodideInstance!.runPython(`
result = context.get_result(${klineDataList[klineDataList.length - 1].close})
new_trades = context.get_new_trades()
  `);

  const resultStr = pyodideInstance!.runPython('str(result)');
  const result = JSON.parse(resultStr.replace(/'/g, '"'));

  console.log('Python result:', result);

  const equityCurve: EquityPoint[] = [];
  const pyEquityCurve = pyodideInstance!.runPython('context.equity_curve');
  console.log('PyEquityCurve type:', typeof pyEquityCurve, pyEquityCurve);

  const equityCurveJs = pyEquityCurve.toJs();
  console.log('EquityCurveJs:', equityCurveJs);

  for (const point of equityCurveJs) {
    const p = point as unknown as Record<string, unknown>;
    equityCurve.push({
      timestamp: p.timestamp as string,
      equity: p.equity as number,
      balance: p.balance as number,
      position: p.position as number,
      positionValue: p.positionValue as number,
    });
  }

  console.log('Parsed equityCurve:', equityCurve.length, 'points');

  const drawdownCurve: DrawdownPoint[] = [];
  let highWaterMark = 0;
  for (const point of equityCurve) {
    if (point.equity > highWaterMark) {
      highWaterMark = point.equity;
    }
    const drawdown = highWaterMark - point.equity;
    const drawdownRate = highWaterMark > 0 ? drawdown / highWaterMark : 0;
    drawdownCurve.push({
      timestamp: point.timestamp,
      drawdown,
      drawdownRate,
      highWaterMark,
    });
  }

  const trades: Trade[] = [];
  const pyTrades = pyodideInstance!.runPython('context.trades');
  console.log('PyTrades type:', typeof pyTrades, pyTrades);

  const tradesJs = pyTrades.toJs();
  console.log('TradesJs:', tradesJs);

  for (const trade of tradesJs) {
    const t = trade as unknown as Record<string, unknown>;
    trades.push({
      timestamp: t.timestamp as string,
      type: t.type as 'buy' | 'sell',
      price: t.price as number,
      amount: t.amount as number,
      balance: t.balance as number,
      fee: t.fee as number,
      position: (t.position as number) ?? 0,
      baseAsset: (t.baseAsset as number) ?? 0,
      totalValue: (t.totalValue as number) ?? 0,
    });
  }

  console.log('Parsed trades:', trades.length, 'trades');

  const finalPrice = klineDataList[klineDataList.length - 1].close;

  return {
    initialBalance: result.initialBalance,
    finalBalance: result.finalBalance,
    profit: result.profit,
    profitRate: result.profitRate,
    maxDrawdown: result.maxDrawdown,
    maxDrawdownRate: result.maxDrawdownRate,
    totalTrades: result.totalTrades,
    winRate: result.winRate,
    trades,
    equityCurve,
    drawdownCurve,
    finalPosition: result.baseAsset,
    finalPrice,
  };
}

export function resetPyodide(): void {
  pyodideInstance = null;
  backtestToolsLoaded = false;
}

export async function runBacktestWithProgress(
  strategyCode: string,
  klineDataList: Kline[],
  initialBalance: number,
  feeRate: number,
  onProgress: (progress: BacktestProgress) => void,
  batchSize: number = 10,
  delayMs: number = 50
): Promise<BacktestResult> {
  if (!pyodideInstance) {
    throw new Error('Pyodide not initialized');
  }

  if (!klineDataList || klineDataList.length === 0) {
    return {
      initialBalance,
      finalBalance: initialBalance,
      profit: 0,
      profitRate: 0,
      maxDrawdown: 0,
      maxDrawdownRate: 0,
      totalTrades: 0,
      winRate: 0,
      trades: [],
      equityCurve: [],
      drawdownCurve: [],
      finalPosition: 0,
      finalPrice: 0,
    };
  }

  const escapedCode = strategyCode
    .replace(/\\/g, '\\\\')
    .replace(/'''/g, "\\'\\'\\'");

  pyodideInstance!.runPython(`
exec_globals = {
    'IStrategy': IStrategy,
    'KlineCache': KlineCache,
    'Kline': Kline,
    'Order': Order,
    'OrderType': OrderType,
    'BacktestContext': BacktestContext,
    'deque': deque,
    'Decimal': Decimal,
    'datetime': datetime,
    'calculate_sma': calculate_sma,
    'calculate_ema': calculate_ema,
    'calculate_rsi': calculate_rsi,
    'calculate_macd': calculate_macd,
}
exec_locals = {}
strategy_code = '''${escapedCode}'''
try:
    exec(strategy_code, exec_globals, exec_locals)
    Strategy = exec_locals.get('Strategy')
    if Strategy is None:
        raise NameError("Strategy class not found in strategy code")
    strategy = Strategy()
    strategy.initialize(50)
    context = BacktestContext(${initialBalance}, ${feeRate})
except Exception as e:
    import traceback
    traceback.print_exc()
    raise
  `);

  const totalKlines = klineDataList.length;

  for (let i = 0; i < klineDataList.length; i += batchSize) {
    const batch = klineDataList.slice(i, Math.min(i + batchSize, klineDataList.length));

    for (const klineData of batch) {
      try {
        pyodideInstance!.runPython(`
kline = Kline({
    'open_time': '${klineData.open_time}',
    'open': ${klineData.open},
    'high': ${klineData.high},
    'low': ${klineData.low},
    'close': ${klineData.close},
    'volume': ${klineData.volume},
    'close_time': '${klineData.close_time}'
})
strategy.kline_cache.append(kline)
strategy.run(context, kline, {})
context.update_equity_curve('${klineData.open_time}', ${klineData.close})
        `);
      } catch (err) {
        console.error('Error processing kline:', klineData, err);
        throw err;
      }
    }

    const trades: Trade[] = [];
    const pyTrades = pyodideInstance!.runPython('context.trades');
    const tradesJs = pyTrades.toJs();
    for (const trade of tradesJs) {
      const t = trade as unknown as Record<string, unknown>;
      trades.push({
        timestamp: t.timestamp as string,
        type: t.type as 'buy' | 'sell',
        price: t.price as number,
        amount: t.amount as number,
        balance: t.balance as number,
        fee: t.fee as number,
        position: (t.position as number) ?? 0,
        baseAsset: (t.baseAsset as number) ?? 0,
        totalValue: (t.totalValue as number) ?? 0,
      });
    }

    const equityCurve: EquityPoint[] = [];
    const pyEquityCurve = pyodideInstance!.runPython('context.equity_curve');
    const equityCurveJs = pyEquityCurve.toJs();
    for (const point of equityCurveJs) {
      const p = point as unknown as Record<string, unknown>;
      equityCurve.push({
        timestamp: p.timestamp as string,
        equity: p.equity as number,
        balance: p.balance as number,
        position: p.position as number,
        positionValue: p.positionValue as number,
      });
    }

    const currentEquity = equityCurve.length > 0 ? equityCurve[equityCurve.length - 1].equity : initialBalance;

    onProgress({
      processedKlines: Math.min(i + batchSize, totalKlines),
      totalKlines,
      trades,
      equityCurve,
      currentEquity,
    });

    if (delayMs > 0) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  pyodideInstance!.runPython(`
result = {
    'initialBalance': float(context.initial_balance),
    'finalBalance': float(context.get_equity(${klineDataList[klineDataList.length - 1].close})),
    'profit': float(context.get_equity(${klineDataList[klineDataList.length - 1].close}) - context.initial_balance),
    'profitRate': float((context.get_equity(${klineDataList[klineDataList.length - 1].close}) - context.initial_balance) / context.initial_balance),
    'maxDrawdown': float(context.max_drawdown),
    'maxDrawdownRate': float(context.max_drawdown / context.initial_balance) if context.initial_balance > 0 else 0,
    'totalTrades': len(context.trades),
    'winRate': sum(1 for t in context.trades if t['type'] == 'sell' and t['price'] * t['amount'] > 0) / len([t for t in context.trades if t['type'] == 'sell']) if len([t for t in context.trades if t['type'] == 'sell']) > 0 else 0,
    'baseAsset': float(context.position)
}
  `);

  const resultStr = pyodideInstance!.runPython('str(result)');
  const result = JSON.parse(resultStr.replace(/'/g, '"'));

  const trades: Trade[] = [];
  const pyTrades = pyodideInstance!.runPython('context.trades');
  const tradesJs = pyTrades.toJs();
  for (const trade of tradesJs) {
    const t = trade as unknown as Record<string, unknown>;
    trades.push({
      timestamp: t.timestamp as string,
      type: t.type as 'buy' | 'sell',
      price: t.price as number,
      amount: t.amount as number,
      balance: t.balance as number,
      fee: t.fee as number,
      position: (t.position as number) ?? 0,
      baseAsset: (t.baseAsset as number) ?? 0,
      totalValue: (t.totalValue as number) ?? 0,
    });
  }

  const equityCurve: EquityPoint[] = [];
  const pyEquityCurve = pyodideInstance!.runPython('context.equity_curve');
  const equityCurveJs = pyEquityCurve.toJs();
  for (const point of equityCurveJs) {
    const p = point as unknown as Record<string, unknown>;
    equityCurve.push({
      timestamp: p.timestamp as string,
      equity: p.equity as number,
      balance: p.balance as number,
      position: p.position as number,
      positionValue: p.positionValue as number,
    });
  }

  const drawdownCurve: DrawdownPoint[] = [];
  let highWaterMark = 0;
  for (const point of equityCurve) {
    if (point.equity > highWaterMark) {
      highWaterMark = point.equity;
    }
    const drawdown = highWaterMark - point.equity;
    const drawdownRate = highWaterMark > 0 ? drawdown / highWaterMark : 0;
    drawdownCurve.push({
      timestamp: point.timestamp,
      drawdown,
      drawdownRate,
      highWaterMark,
    });
  }

  const finalPrice = klineDataList[klineDataList.length - 1].close;

  return {
    initialBalance: result.initialBalance,
    finalBalance: result.finalBalance,
    profit: result.profit,
    profitRate: result.profitRate,
    maxDrawdown: result.maxDrawdown,
    maxDrawdownRate: result.maxDrawdownRate,
    totalTrades: result.totalTrades,
    winRate: result.winRate,
    trades,
    equityCurve,
    drawdownCurve,
    finalPosition: result.baseAsset,
    finalPrice,
  };
}
