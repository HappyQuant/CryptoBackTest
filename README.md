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

# Start the server
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

## Usage

### Writing a Strategy

```python
class Strategy(IStrategy):
    def run(self, context: BacktestContext, kline: Kline, params: dict):
        closes = self.kline_cache.get_closes()

        if len(closes) < params.get('ma_period', 20):
            return

        ma = calculate_sma(closes, params.get('ma_period', 20))

        # Golden cross - buy
        if closes[-1] > ma and closes[-2] <= ma:
            context.buy(kline.close, params.get('buy_amount', 0.1), kline.open_time)

        # Death cross - sell
        if closes[-1] < ma and closes[-2] >= ma:
            context.sell_all(kline.close, kline.open_time)
```

### Available Functions

- `calculate_sma(closes, period)` - Simple Moving Average
- `calculate_ema(closes, period)` - Exponential Moving Average
- `calculate_rsi(closes, period)` - Relative Strength Index

### BacktestContext Methods

- `buy(price, amount, timestamp)` - Buy at specified price
- `sell(price, amount, timestamp)` - Sell at specified price
- `sell_all(price, timestamp)` - Sell all positions

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