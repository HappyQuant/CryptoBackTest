# 加密货币量化回测系统

一个基于 React 前端和 FastAPI 后端的加密货币量化回测系统。

## 功能特性

- **自定义 Python 策略**：使用 Python 编写自己的交易策略
- **实时回测**：使用历史 K 线数据执行策略
- **交互式图表**：TradingView 风格的 K 线图表，带有买卖标记
- **绩效指标**：全面的回测结果，包括收益率、最大回撤、胜率等
- **多交易对支持**：BTCUSDT、ETHUSDT、BNBUSDT 等
- **多时间周期**：1m、5m、15m、30m、1h、2h、4h、6h、12h、1d、1w

## 系统架构

```
┌─────────────────────────────────────────────────────────────────┐
│                        前端 (React)                              │
├─────────────────────────────────────────────────────────────────┤
│  BacktestPanel (回测主面板)                                      │
│  ├── BacktestConfig (交易对、周期、时间范围等配置)                 │
│  ├── StrategyEditor (Python 代码编辑器)                          │
│  ├── TradingViewChart (K线图表 + 权益曲线)                       │
│  └── BacktestResult (绩效指标)                                   │
├─────────────────────────────────────────────────────────────────┤
│                      Pyodide 引擎                                │
│  - 在浏览器中执行 Python 策略                                    │
│  - 内置工具：IStrategy、Kline、BacktestContext                   │
├─────────────────────────────────────────────────────────────────┤
│                      KlineCache (K线缓存)                        │
│  - 分页缓存（每页 1000 根 K 线）                                  │
│  - 缓存不足时自动获取下一页                                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     后端 (FastAPI)                               │
│  GET /api/v1/kline/{symbol}/{interval}?start_time=&limit=       │
│  GET /api/v1/kline/symbols                                      │
│  GET /api/v1/kline/intervals                                    │
└─────────────────────────────────────────────────────────────────┘
```

## 技术栈

### 前端
- React 18 + TypeScript
- lightweight-charts (TradingView 轻量版图表)
- Pyodide (浏览器中的 Python 运行时)
- Axios

### 后端
- FastAPI
- SQLAlchemy (异步)
- PostgreSQL
- Redis (限流)

## 快速开始

### 环境要求

- Node.js 18+
- Python 3.11+
- PostgreSQL
- Redis (可选)

### 后端启动

```bash
cd backend

# 安装依赖
pip install pipenv
pipenv install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，填入数据库连接信息

# 启动服务
pipenv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 前端启动

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 数据库配置

确保 PostgreSQL 数据库中有 K 线数据表，表结构如下：

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

## 使用说明

### 编写策略

```python
class Strategy(IStrategy):
    def run(self, context: BacktestContext, kline: Kline, params: dict):
        closes = self.kline_cache.get_closes()

        if len(closes) < params.get('ma_period', 20):
            return

        ma = calculate_sma(closes, params.get('ma_period', 20))

        # 金叉买入
        if closes[-1] > ma and closes[-2] <= ma:
            context.buy(kline.close, params.get('buy_amount', 0.1), kline.open_time)

        # 死叉卖出
        if closes[-1] < ma and closes[-2] >= ma:
            context.sell_all(kline.close, kline.open_time)
```

### 可用函数

- `calculate_sma(closes, period)` - 简单移动平均
- `calculate_ema(closes, period)` - 指数移动平均
- `calculate_rsi(closes, period)` - 相对强弱指标

### BacktestContext 方法

- `buy(price, amount, timestamp)` - 以指定价格买入
- `sell(price, amount, timestamp)` - 以指定价格卖出
- `sell_all(price, timestamp)` - 卖出全部持仓

## API 接口

### 获取 K 线数据

```
GET /api/v1/kline/{symbol}/{interval}
```

参数：
- `symbol`: 交易对（如 BTCUSDT）
- `interval`: 时间周期（如 1h）
- `start_time`: 开始时间（ISO 格式）
- `end_time`: 结束时间（ISO 格式）
- `limit`: K 线数量（最大 1000）

### 获取可用交易对

```
GET /api/v1/kline/symbols
```

### 获取可用时间周期

```
GET /api/v1/kline/intervals
```

## 项目结构

```
CryptoBackTest/
├── backend/
│   ├── app/
│   │   ├── api/v1/endpoints/    # API 端点
│   │   ├── core/                # 配置、限流器
│   │   ├── db/                  # 数据库会话
│   │   ├── models/              # SQLAlchemy 模型
│   │   ├── schemas/             # Pydantic 模式
│   │   └── main.py              # FastAPI 应用
│   └── Pipfile
├── frontend/
│   ├── src/
│   │   ├── backtest/            # 回测组件
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

## 许可证

MIT License