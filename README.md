# Crypto Backtest System

A cryptocurrency quantitative backtesting system with a React frontend and FastAPI backend.

## Features

- **Custom Python Strategies**: Write your own trading strategies in Python
- **Real-time Backtesting**: Execute strategies with historical K-line data
- **Interactive Charts**: TradingView-style candlestick charts with buy/sell markers
- **Performance Metrics**: Comprehensive backtest results including profit rate, max drawdown, win rate
- **Multi-symbol Support**: BTCUSDT, ETHUSDT, BNBUSDT, and more
- **Multiple Timeframes**: 1m, 5m, 15m, 30m, 1h, 2h, 4h, 6h, 12h, 1d, 1w

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React)                          │
├─────────────────────────────────────────────────────────────────┤
│  BacktestPanel                                                   │
│  ├── BacktestConfig (Symbol, Interval, Time Range, etc.)        │
│  ├── StrategyEditor (Python Code Editor)                        │
│  ├── TradingViewChart (K-line Chart + Equity Curve)             │
│  └── BacktestResult (Performance Metrics)                       │
├─────────────────────────────────────────────────────────────────┤
│                      Pyodide Engine                              │
│  - Executes Python strategies in browser                        │
│  - Built-in tools: IStrategy, Kline, BacktestContext            │
├─────────────────────────────────────────────────────────────────┤
│                      KlineCache                                  │
│  - Paginated caching (1000 K-lines per page)                    │
│  - Auto-fetch when buffer is low                                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Backend (FastAPI)                            │
│  GET /api/v1/kline/{symbol}/{interval}?start_time=&limit=       │
│  GET /api/v1/kline/symbols                                      │
│  GET /api/v1/kline/intervals                                    │
└─────────────────────────────────────────────────────────────────┘
```

## Tech Stack

### Frontend
- React 18 + TypeScript
- lightweight-charts (TradingView)
- Pyodide (Python in browser)
- Axios

### Backend
- FastAPI
- SQLAlchemy (async)
- PostgreSQL
- Redis (rate limiting)

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.11+
- PostgreSQL
- Redis (optional)

### Backend Setup

```bash
cd backend

# Install dependencies
pip install pipenv
pipenv install

# Configure environment
cp .env.example .env
# Edit .env with your database credentials
```

Create a `.env` file in the backend directory with the following variables:

```env
# Required: Database connection URL
DATABASE_URL=postgresql+asyncpg://user:password@host:port/database

# Optional: Redis connection URL (default: redis://localhost:6379/0)
REDIS_URL=redis://localhost:6379/0

# Optional: Enable debug mode (default: false)
DEBUG=false

# Optional: Rate limiting settings
RATE_LIMIT_PER_SECOND=30
RATE_LIMIT_PER_MINUTE=1000
```

Then start the server:

```bash
pipenv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Database Setup

Ensure your PostgreSQL database has K-line data tables with the following structure:

```sql
CREATE TABLE t_kline_btcusdt_1h (
    open_time BIGINT PRIMARY KEY,
    open_price NUMERIC(20, 8),
    high_price NUMERIC(20, 8),
    low_price NUMERIC(20, 8),
    close_price NUMERIC(20, 8),
    base_volume NUMERIC(20, 8),
    close_time BIGINT,
    quote_volume NUMERIC(20, 8),
    trades_count INTEGER,
    taker_buy_base_volume NUMERIC(20, 8),
    taker_buy_quote_volume NUMERIC(20, 8)
);
```

## Strategy Development Guide

### Strategy Basic Structure

All strategies must inherit from `IStrategy` and implement the `run` method:

```python
class Strategy(IStrategy):
    def run(self, context: BacktestContext, kline: Kline, params: dict):
        # Your strategy logic here
        pass
```

---

## Built-in Enums

### OrderType

Order type enumeration.

| Value | Description |
|-------|-------------|
| `OrderType.BUY` | Buy order |
| `OrderType.SELL` | Sell order |

**Example:**

```python
if condition:
    order = Order(timestamp, OrderType.BUY, price, amount)
```

### OrderSide

Order direction enumeration.

| Value | Description |
|-------|-------------|
| `OrderSide.LONG` | Long position |
| `OrderSide.SHORT` | Short position |

### PositionSide

Position direction enumeration.

| Value | Description |
|-------|-------------|
| `PositionSide.LONG` | Long position |
| `PositionSide.SHORT` | Short position |
| `PositionSide.BOTH` | Both directions |

---

## Built-in Classes

### Kline

K-line data structure, representing a single candlestick.

**Properties:**

| Property | Type | Description |
|----------|------|-------------|
| `open_time` | str | Opening time |
| `open` | float | Opening price |
| `high` | float | Highest price |
| `low` | float | Lowest price |
| `close` | float | Closing price |
| `volume` | float | Trading volume |
| `close_time` | str | Closing time |

**Example:**

```python
def run(self, context: BacktestContext, kline: Kline, params: dict):
    current_price = kline.close
    current_high = kline.high
    current_low = kline.low
    current_volume = kline.volume
```

### KlineCache

K-line history data cache for storing and accessing historical K-lines.

**Initialization:**

```python
cache = KlineCache(kline_wnd_size=50)  # Default window size is 50
```

**Methods:**

| Method | Return Type | Description |
|--------|-------------|-------------|
| `append(kline: Kline)` | None | Add a K-line to cache |
| `get_klines()` | list[Kline] | Get all K-lines |
| `get_closes()` | list[float] | Get all closing prices |
| `get_highs()` | list[float] | Get all highest prices |
| `get_lows()` | list[float] | Get all lowest prices |
| `get_volumes()` | list[float] | Get all volumes |
| `get_opens()` | list[float] | Get all opening prices |
| `is_full()` | bool | Check if cache is full |
| `__len__()` | int | Get cache size |

**Example:**

```python
def run(self, context: BacktestContext, kline: Kline, params: dict):
    closes = self.kline_cache.get_closes()
    highs = self.kline_cache.get_highs()
    lows = self.kline_cache.get_lows()
    
    if len(closes) < 20:
        return
    
    # Calculate indicators using historical data
    ma20 = calculate_sma(closes, 20)
    highest_20 = max(highs[-20:])
    lowest_20 = min(lows[-20:])
```

### Order

Order data structure.

**Constructor:**

```python
Order(timestamp: str, order_type: OrderType, price: float, amount: float, fee: float = 0, order_side: OrderSide = None)
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `timestamp` | str | Order timestamp |
| `order_type` | OrderType | Order type (BUY/SELL) |
| `price` | float | Order price |
| `amount` | float | Order amount |
| `fee` | float | Transaction fee (default: 0) |
| `order_side` | OrderSide | Order direction (optional) |

**Properties:**

| Property | Type | Description |
|----------|------|-------------|
| `timestamp` | str | Order timestamp |
| `type` | OrderType | Order type |
| `price` | float | Order price |
| `amount` | float | Order amount |
| `fee` | float | Transaction fee |
| `order_side` | OrderSide | Order direction |

### BacktestContext

Backtest context class, manages account balance, positions, orders, and fee calculations.

**Properties:**

| Property | Type | Description |
|----------|------|-------------|
| `balance` | Decimal | Available balance (quote asset) |
| `position` | Decimal | Current position (base asset) |
| `initial_balance` | Decimal | Initial balance |
| `fee_rate` | Decimal | Fee rate |
| `trades` | list | Trade history |
| `orders` | list[Order] | Order history |
| `equity_curve` | list | Equity curve data |
| `max_drawdown` | Decimal | Maximum drawdown |

**Methods:**

#### buy(price, amount, timestamp)

Execute a buy order.

```python
def buy(self, price: float, amount: float, timestamp: str) -> bool
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `price` | float | Buy price |
| `amount` | float | Buy amount (base asset quantity) |
| `timestamp` | str | Order timestamp |

**Returns:** `bool` - Whether the order was successful

**Example:**

```python
# Buy 0.1 BTC at current price
context.buy(kline.close, 0.1, kline.open_time)
```

#### sell(price, amount, timestamp)

Execute a sell order.

```python
def sell(self, price: float, amount: float, timestamp: str) -> bool
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `price` | float | Sell price |
| `amount` | float | Sell amount (base asset quantity) |
| `timestamp` | str | Order timestamp |

**Returns:** `bool` - Whether the order was successful

**Example:**

```python
# Sell 0.05 BTC at current price
context.sell(kline.close, 0.05, kline.open_time)
```

#### sell_all(price, timestamp)

Sell all positions.

```python
def sell_all(self, price: float, timestamp: str) -> bool
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `price` | float | Sell price |
| `timestamp` | str | Order timestamp |

**Returns:** `bool` - Whether the order was successful

**Example:**

```python
# Sell all positions
context.sell_all(kline.close, kline.open_time)
```

#### get_position_value(price)

Get current position value.

```python
def get_position_value(self, price: float) -> Decimal
```

**Returns:** Position value in quote asset

#### get_equity(price)

Get total account equity (balance + position value).

```python
def get_equity(self, price: float) -> Decimal
```

**Returns:** Total equity

**Example:**

```python
total_equity = context.get_equity(kline.close)
```

#### get_avg_position_price()

Get average position price.

```python
def get_avg_position_price(self) -> float
```

**Returns:** Average buy price of current position

**Example:**

```python
avg_price = context.get_avg_position_price()
if kline.close > avg_price * 1.05:  # 5% profit
    context.sell_all(kline.close, kline.open_time)
```

#### get_drawdown(current_price)

Calculate current drawdown.

```python
def get_drawdown(self, current_price: float) -> Decimal
```

**Returns:** Current drawdown ratio (0-1)

### IStrategy

Strategy base class. All user strategies must inherit from this class.

**Properties:**

| Property | Type | Description |
|----------|------|-------------|
| `kline_cache` | KlineCache | K-line cache instance |
| `name` | str | Strategy name (class name) |

**Methods:**

#### initialize(kline_wnd_size)

Initialize K-line cache. Called automatically by the backtest engine.

```python
def initialize(self, kline_wnd_size: int = 50) -> None
```

#### run(context, kline, params) [Must Implement]

Strategy execution method. Called for each K-line.

```python
def run(self, context: BacktestContext, kline: Kline, params: dict) -> None
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `context` | BacktestContext | Backtest context |
| `kline` | Kline | Current K-line data |
| `params` | dict | Strategy parameters |

#### on_trade(trade) [Optional]

Trade callback. Called after each trade.

```python
def on_trade(self, trade: dict) -> None
```

#### on_day_end(date, context) [Optional]

Day end callback. Called at the end of each trading day.

```python
def on_day_end(self, date: str, context: BacktestContext) -> None
```

---

## Built-in Functions

### calculate_sma(data, period)

Calculate Simple Moving Average.

```python
def calculate_sma(data: list, period: int) -> float
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `data` | list[float] | Price data list |
| `period` | int | Moving average period |

**Returns:** `float` - SMA value, or `None` if insufficient data

**Example:**

```python
closes = self.kline_cache.get_closes()
if len(closes) >= 20:
    sma20 = calculate_sma(closes, 20)
    sma50 = calculate_sma(closes, 50)
```

### calculate_ema(data, period)

Calculate Exponential Moving Average.

```python
def calculate_ema(data: list, period: int) -> float
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `data` | list[float] | Price data list |
| `period` | int | Moving average period |

**Returns:** `float` - EMA value, or `None` if insufficient data

**Example:**

```python
closes = self.kline_cache.get_closes()
ema12 = calculate_ema(closes, 12)
ema26 = calculate_ema(closes, 26)
```

### calculate_rsi(data, period)

Calculate Relative Strength Index.

```python
def calculate_rsi(data: list, period: int = 14) -> float
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `data` | list[float] | Price data list |
| `period` | int | RSI period (default: 14) |

**Returns:** `float` - RSI value (0-100), or `None` if insufficient data

**Example:**

```python
closes = self.kline_cache.get_closes()
rsi = calculate_rsi(closes, 14)

if rsi is not None:
    if rsi < 30:
        # Oversold - potential buy signal
        context.buy(kline.close, 0.1, kline.open_time)
    elif rsi > 70:
        # Overbought - potential sell signal
        context.sell_all(kline.close, kline.open_time)
```

### calculate_macd(data, fast, slow, signal)

Calculate MACD indicator.

```python
def calculate_macd(data: list, fast: int = 12, slow: int = 26, signal: int = 9) -> tuple
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `data` | list[float] | Price data list |
| `fast` | int | Fast EMA period (default: 12) |
| `slow` | int | Slow EMA period (default: 26) |
| `signal` | int | Signal line period (default: 9) |

**Returns:** `tuple[float, float, float]` - (MACD line, Signal line, Histogram), or `(None, None, None)` if insufficient data

**Example:**

```python
closes = self.kline_cache.get_closes()
macd_line, signal_line, histogram = calculate_macd(closes)

if macd_line is not None:
    # MACD golden cross
    if macd_line > signal_line and prev_macd <= prev_signal:
        context.buy(kline.close, 0.1, kline.open_time)
    
    # MACD death cross
    if macd_line < signal_line and prev_macd >= prev_signal:
        context.sell_all(kline.close, kline.open_time)
```

---

## Available Built-in Functions

The following Python built-in functions are available in strategy code:

| Category | Functions |
|----------|-----------|
| Math | `abs`, `max`, `min`, `pow`, `round`, `sum` |
| Type Conversion | `bool`, `float`, `int`, `str`, `list`, `dict`, `set`, `tuple`, `frozenset` |
| Sequence | `len`, `range`, `enumerate`, `zip`, `map`, `filter`, `sorted`, `reversed`, `slice` |
| Logic | `all`, `any`, `isinstance` |
| Constants | `True`, `False`, `None` |
| Exceptions | `Exception`, `ValueError`, `TypeError`, `KeyError`, `IndexError`, `RuntimeError`, `StopIteration`, `NotImplementedError` |

---

## Available Imports

The following modules can be used in strategy code:

```python
from collections import deque
from decimal import Decimal
from datetime import datetime
```

**Example:**

```python
from datetime import datetime

class Strategy(IStrategy):
    def run(self, context: BacktestContext, kline: Kline, params: dict):
        # Parse timestamp
        dt = datetime.fromisoformat(kline.open_time.replace('Z', '+00:00'))
        
        # Trading only during specific hours
        if 9 <= dt.hour < 16:
            # Your strategy logic
            pass
```

---

## Complete Strategy Example

### Example 1: Simple Moving Average Crossover Strategy

```python
class Strategy(IStrategy):
    def run(self, context: BacktestContext, kline: Kline, params: dict):
        closes = self.kline_cache.get_closes()
        
        fast_period = params.get('fast_period', 10)
        slow_period = params.get('slow_period', 30)
        
        if len(closes) < slow_period:
            return
        
        fast_ma = calculate_sma(closes, fast_period)
        slow_ma = calculate_sma(closes, slow_period)
        
        prev_fast = calculate_sma(closes[:-1], fast_period)
        prev_slow = calculate_sma(closes[:-1], slow_period)
        
        # Golden cross - buy signal
        if fast_ma > slow_ma and prev_fast <= prev_slow:
            if context.position == 0:
                buy_amount = float(context.balance / kline.close) * 0.95
                context.buy(kline.close, buy_amount, kline.open_time)
        
        # Death cross - sell signal
        elif fast_ma < slow_ma and prev_fast >= prev_slow:
            if context.position > 0:
                context.sell_all(kline.close, kline.open_time)
```

### Example 2: RSI + MACD Combined Strategy

```python
class Strategy(IStrategy):
    def __init__(self):
        super().__init__()
        self.prev_macd = None
        self.prev_signal = None
    
    def run(self, context: BacktestContext, kline: Kline, params: dict):
        closes = self.kline_cache.get_closes()
        
        if len(closes) < 35:
            return
        
        rsi = calculate_rsi(closes, 14)
        macd_line, signal_line, histogram = calculate_macd(closes)
        
        if rsi is None or macd_line is None:
            return
        
        # Buy condition: RSI oversold + MACD golden cross
        if context.position == 0:
            if rsi < 35 and histogram > 0:
                if self.prev_macd is not None and self.prev_macd <= self.prev_signal:
                    buy_amount = float(context.balance / kline.close) * 0.95
                    context.buy(kline.close, buy_amount, kline.open_time)
        
        # Sell condition: RSI overbought + MACD death cross
        elif context.position > 0:
            if rsi > 65 and histogram < 0:
                if self.prev_macd is not None and self.prev_macd >= self.prev_signal:
                    context.sell_all(kline.close, kline.open_time)
        
        self.prev_macd = macd_line
        self.prev_signal = signal_line
```

### Example 3: Breakout Strategy with Stop Loss

```python
class Strategy(IStrategy):
    def run(self, context: BacktestContext, kline: Kline, params: dict):
        closes = self.kline_cache.get_closes()
        highs = self.kline_cache.get_highs()
        lows = self.kline_cache.get_lows()
        
        lookback = params.get('lookback', 20)
        stop_loss_pct = params.get('stop_loss', 0.03)
        take_profit_pct = params.get('take_profit', 0.06)
        
        if len(closes) < lookback:
            return
        
        highest = max(highs[-lookback:])
        lowest = min(lows[-lookback:])
        
        # Entry: Break above resistance
        if context.position == 0:
            if kline.close > highest:
                buy_amount = float(context.balance / kline.close) * 0.95
                context.buy(kline.close, buy_amount, kline.open_time)
        
        # Exit: Stop loss or take profit
        elif context.position > 0:
            avg_price = context.get_avg_position_price()
            
            # Stop loss
            if kline.close < avg_price * (1 - stop_loss_pct):
                context.sell_all(kline.close, kline.open_time)
            
            # Take profit
            elif kline.close > avg_price * (1 + take_profit_pct):
                context.sell_all(kline.close, kline.open_time)
            
            # Break below support
            elif kline.close < lowest:
                context.sell_all(kline.close, kline.open_time)
```

---

## Backtest Configuration Parameters

When running a backtest, the system passes the following configuration parameters:

### Basic Backtest Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `initialBalance` | float | 10000 | Initial capital (USDT) |
| `feeRate` | float | 0.001 | Fee rate (default 0.1%) |

### Strategy Parameters (strategyParams)

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `klineWndSize` | int | 50 | K-line cache window size |

**Example:**

```python
# Backtest configuration parameters (configured in UI)
backtest_params = {
    'initialBalance': 10000,      # Initial capital 10000 USDT
    'feeRate': 0.001,             # Fee rate 0.1%
    'strategyParams': {
        'klineWndSize': 100,      # K-line cache window size
        'fast_period': 10,        # Custom strategy parameters
        'slow_period': 30,
        'stop_loss': 0.03
    }
}
```

### Accessing Parameters in Strategy

```python
class Strategy(IStrategy):
    def run(self, context: BacktestContext, kline: Kline, params: dict):
        # Access strategy parameters (params is strategyParams)
        fast_period = params.get('fast_period', 10)
        slow_period = params.get('slow_period', 30)
        stop_loss = params.get('stop_loss', 0.03)
        
        # K-line window size is set during initialization
        # Access via self.kline_cache
```

---

## Backtest Results

After backtesting completes, the system returns the following results:

| Field | Type | Description |
|-------|------|-------------|
| `initialBalance` | float | Initial capital |
| `finalBalance` | float | Final equity (balance + position value) |
| `profit` | float | Total profit/loss (USDT) |
| `profitRate` | float | Return rate (0-1) |
| `maxDrawdown` | float | Maximum drawdown (0-1) |
| `totalTrades` | int | Total number of trades |
| `winRate` | float | Win rate (0-1) |
| `baseAsset` | float | Remaining position (base asset) |
| `quoteAsset` | float | Remaining balance (quote asset) |
| `baseFee` | float | Total base asset fees |
| `quoteFee` | float | Total quote asset fees |
| `trades` | list | Trade history list |
| `equityCurve` | list | Equity curve data |

### trades Structure

Each trade record contains:

| Field | Type | Description |
|-------|------|-------------|
| `timestamp` | str | Trade timestamp |
| `type` | str | Trade type ('buy' / 'sell') |
| `price` | float | Trade price |
| `amount` | float | Trade amount |
| `balance` | float | Balance after trade |
| `fee` | float | Fee |

### equityCurve Structure

Each equity record contains:

| Field | Type | Description |
|-------|------|-------------|
| `timestamp` | str | Timestamp |
| `equity` | float | Total equity |
| `balance` | float | Balance |
| `position` | float | Position amount |

---

## Custom Strategy Parameters

In addition to system parameters, you can configure custom strategy parameters in the UI:

```python
# Strategy parameters (configured in UI)
params = {
    'fast_period': 10,
    'slow_period': 30,
    'rsi_period': 14,
    'stop_loss': 0.03,
    'take_profit': 0.06
}

# Access in strategy
fast_period = params.get('fast_period', 10)  # Default value: 10
```

---

## Security Restrictions

For security reasons, the following operations are **not allowed** in strategy code:

- File operations (`open`, file read/write)
- Code execution (`eval`, `exec`, `compile`)
- System access (`os`, `sys`, `subprocess`)
- Network requests (`requests`, `urllib`, `socket`)
- Module imports (except allowed modules)

---

## Best Practices

1. **Always check data length** before calculating indicators
2. **Use `params.get()` with default values** for configurable parameters
3. **Check `context.position`** before executing trades
4. **Implement proper risk management** with stop loss and take profit
5. **Avoid over-trading** by adding proper entry/exit conditions

## API Reference

### Get K-lines

```
GET /api/v1/kline/{symbol}/{interval}
```

Parameters:
- `symbol`: Trading pair (e.g., BTCUSDT)
- `interval`: Timeframe (e.g., 1h)
- `start_time`: Start time (ISO format)
- `end_time`: End time (ISO format)
- `limit`: Number of K-lines (max 1000)

### Get Available Symbols

```
GET /api/v1/kline/symbols
```

### Get Available Intervals

```
GET /api/v1/kline/intervals
```

## Project Structure

```
CryptoBackTest/
├── backend/
│   ├── app/
│   │   ├── api/v1/endpoints/    # API endpoints
│   │   ├── core/                # Config, rate limiter
│   │   ├── db/                  # Database session
│   │   ├── models/              # SQLAlchemy models
│   │   ├── schemas/             # Pydantic schemas
│   │   └── main.py              # FastAPI app
│   └── Pipfile
├── frontend/
│   ├── src/
│   │   ├── backtest/            # Backtest components
│   │   │   ├── BacktestPanel.tsx
│   │   │   ├── BacktestConfig.tsx
│   │   │   ├── StrategyEditor.tsx
│   │   │   ├── TradingViewChart.tsx
│   │   │   ├── BacktestResult.tsx
│   │   │   ├── KlineCache.ts
│   │   │   ├── KlineService.ts
│   │   │   ├── PyodideEngine.ts
│   │   │   └── types.ts
│   │   └── App.tsx
│   └── package.json
└── plan.md
```

## License

MIT License