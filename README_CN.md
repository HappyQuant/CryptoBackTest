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
```

在 backend 目录下创建 `.env` 文件，配置以下环境变量：

```env
# 必填：数据库连接 URL
DATABASE_URL=postgresql+asyncpg://用户名:密码@主机:端口/数据库名

# 可选：Redis 连接 URL（默认：redis://localhost:6379/0）
REDIS_URL=redis://localhost:6379/0

# 可选：开启调试模式（默认：false）
DEBUG=false

# 可选：限流设置
RATE_LIMIT_PER_SECOND=30
RATE_LIMIT_PER_MINUTE=1000
```

然后启动服务：

```bash
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

## 策略开发手册

### 策略基本结构

所有策略必须继承 `IStrategy` 类并实现 `run` 方法：

```python
class Strategy(IStrategy):
    def run(self, context: BacktestContext, kline: Kline, params: dict):
        # 在这里编写你的策略逻辑
        pass
```

---

## 内置枚举

### OrderType

订单类型枚举。

| 值 | 说明 |
|----|------|
| `OrderType.BUY` | 买入订单 |
| `OrderType.SELL` | 卖出订单 |

**示例：**

```python
if condition:
    order = Order(timestamp, OrderType.BUY, price, amount)
```

### OrderSide

订单方向枚举。

| 值 | 说明 |
|----|------|
| `OrderSide.LONG` | 做多方向 |
| `OrderSide.SHORT` | 做空方向 |

### PositionSide

持仓方向枚举。

| 值 | 说明 |
|----|------|
| `PositionSide.LONG` | 多头持仓 |
| `PositionSide.SHORT` | 空头持仓 |
| `PositionSide.BOTH` | 双向持仓 |

---

## 内置类

### Kline

K线数据结构，表示单根K线。

**属性：**

| 属性 | 类型 | 说明 |
|------|------|------|
| `open_time` | str | 开盘时间 |
| `open` | float | 开盘价 |
| `high` | float | 最高价 |
| `low` | float | 最低价 |
| `close` | float | 收盘价 |
| `volume` | float | 成交量 |
| `close_time` | str | 收盘时间 |

**示例：**

```python
def run(self, context: BacktestContext, kline: Kline, params: dict):
    current_price = kline.close      # 当前收盘价
    current_high = kline.high        # 当前最高价
    current_low = kline.low          # 当前最低价
    current_volume = kline.volume    # 当前成交量
```

### KlineCache

K线历史数据缓存，用于存储和访问历史K线数据。

**初始化：**

```python
cache = KlineCache(kline_wnd_size=50)  # 默认窗口大小为50
```

**方法：**

| 方法 | 返回类型 | 说明 |
|------|----------|------|
| `append(kline: Kline)` | None | 添加一根K线到缓存 |
| `get_klines()` | list[Kline] | 获取所有K线 |
| `get_closes()` | list[float] | 获取所有收盘价 |
| `get_highs()` | list[float] | 获取所有最高价 |
| `get_lows()` | list[float] | 获取所有最低价 |
| `get_volumes()` | list[float] | 获取所有成交量 |
| `get_opens()` | list[float] | 获取所有开盘价 |
| `is_full()` | bool | 检查缓存是否已填满 |
| `__len__()` | int | 获取缓存大小 |

**示例：**

```python
def run(self, context: BacktestContext, kline: Kline, params: dict):
    closes = self.kline_cache.get_closes()  # 获取收盘价列表
    highs = self.kline_cache.get_highs()    # 获取最高价列表
    lows = self.kline_cache.get_lows()      # 获取最低价列表
    
    if len(closes) < 20:
        return
    
    # 使用历史数据计算指标
    ma20 = calculate_sma(closes, 20)
    highest_20 = max(highs[-20:])  # 最近20根K线最高价
    lowest_20 = min(lows[-20:])    # 最近20根K线最低价
```

### Order

订单数据结构。

**构造函数：**

```python
Order(timestamp: str, order_type: OrderType, price: float, amount: float, fee: float = 0, order_side: OrderSide = None)
```

**参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| `timestamp` | str | 订单时间戳 |
| `order_type` | OrderType | 订单类型（买入/卖出） |
| `price` | float | 订单价格 |
| `amount` | float | 订单数量 |
| `fee` | float | 手续费（默认：0） |
| `order_side` | OrderSide | 订单方向（可选） |

**属性：**

| 属性 | 类型 | 说明 |
|------|------|------|
| `timestamp` | str | 订单时间戳 |
| `type` | OrderType | 订单类型 |
| `price` | float | 订单价格 |
| `amount` | float | 订单数量 |
| `fee` | float | 手续费 |
| `order_side` | OrderSide | 订单方向 |

### BacktestContext

回测上下文类，管理账户余额、持仓、订单记录和手续费计算。

**属性：**

| 属性 | 类型 | 说明 |
|------|------|------|
| `balance` | Decimal | 可用余额（计价货币） |
| `position` | Decimal | 当前持仓（交易货币） |
| `initial_balance` | Decimal | 初始余额 |
| `fee_rate` | Decimal | 手续费率 |
| `trades` | list | 交易记录 |
| `orders` | list[Order] | 订单记录 |
| `equity_curve` | list | 权益曲线数据 |
| `max_drawdown` | Decimal | 最大回撤 |

**方法：**

#### buy(price, amount, timestamp)

执行买入订单。

```python
def buy(self, price: float, amount: float, timestamp: str) -> bool
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `price` | float | 买入价格 |
| `amount` | float | 买入数量（交易货币数量） |
| `timestamp` | str | 订单时间戳 |

**返回值：** `bool` - 订单是否成功

**示例：**

```python
# 以当前价格买入 0.1 BTC
context.buy(kline.close, 0.1, kline.open_time)
```

#### sell(price, amount, timestamp)

执行卖出订单。

```python
def sell(self, price: float, amount: float, timestamp: str) -> bool
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `price` | float | 卖出价格 |
| `amount` | float | 卖出数量（交易货币数量） |
| `timestamp` | str | 订单时间戳 |

**返回值：** `bool` - 订单是否成功

**示例：**

```python
# 以当前价格卖出 0.05 BTC
context.sell(kline.close, 0.05, kline.open_time)
```

#### sell_all(price, timestamp)

卖出全部持仓。

```python
def sell_all(self, price: float, timestamp: str) -> bool
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `price` | float | 卖出价格 |
| `timestamp` | str | 订单时间戳 |

**返回值：** `bool` - 订单是否成功

**示例：**

```python
# 卖出全部持仓
context.sell_all(kline.close, kline.open_time)
```

#### get_position_value(price)

获取当前持仓价值。

```python
def get_position_value(self, price: float) -> Decimal
```

**返回值：** 持仓价值（计价货币）

#### get_equity(price)

获取账户总权益（余额 + 持仓价值）。

```python
def get_equity(self, price: float) -> Decimal
```

**返回值：** 总权益

**示例：**

```python
total_equity = context.get_equity(kline.close)
```

#### get_avg_position_price()

获取平均持仓价格。

```python
def get_avg_position_price(self) -> float
```

**返回值：** 当前持仓的平均买入价格

**示例：**

```python
avg_price = context.get_avg_position_price()
if kline.close > avg_price * 1.05:  # 盈利 5%
    context.sell_all(kline.close, kline.open_time)
```

#### get_drawdown(current_price)

计算当前回撤。

```python
def get_drawdown(self, current_price: float) -> Decimal
```

**返回值：** 当前回撤比例（0-1）

### IStrategy

策略基类，所有用户策略必须继承此类。

**属性：**

| 属性 | 类型 | 说明 |
|------|------|------|
| `kline_cache` | KlineCache | K线缓存实例 |
| `name` | str | 策略名称（类名） |

**方法：**

#### initialize(kline_wnd_size)

初始化K线缓存，由回测引擎自动调用。

```python
def initialize(self, kline_wnd_size: int = 50) -> None
```

#### run(context, kline, params) 【必须实现】

策略执行方法，每根K线调用一次。

```python
def run(self, context: BacktestContext, kline: Kline, params: dict) -> None
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `context` | BacktestContext | 回测上下文 |
| `kline` | Kline | 当前K线数据 |
| `params` | dict | 策略参数 |

#### on_trade(trade) 【可选】

交易回调，每次交易后触发。

```python
def on_trade(self, trade: dict) -> None
```

#### on_day_end(date, context) 【可选】

每日结束回调，每个交易日结束时触发。

```python
def on_day_end(self, date: str, context: BacktestContext) -> None
```

---

## 内置函数

### calculate_sma(data, period)

计算简单移动平均线。

```python
def calculate_sma(data: list, period: int) -> float
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `data` | list[float] | 价格数据列表 |
| `period` | int | 移动平均周期 |

**返回值：** `float` - SMA值，数据不足时返回 `None`

**示例：**

```python
closes = self.kline_cache.get_closes()
if len(closes) >= 20:
    sma20 = calculate_sma(closes, 20)  # 20周期SMA
    sma50 = calculate_sma(closes, 50)  # 50周期SMA
```

### calculate_ema(data, period)

计算指数移动平均线。

```python
def calculate_ema(data: list, period: int) -> float
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `data` | list[float] | 价格数据列表 |
| `period` | int | 移动平均周期 |

**返回值：** `float` - EMA值，数据不足时返回 `None`

**示例：**

```python
closes = self.kline_cache.get_closes()
ema12 = calculate_ema(closes, 12)  # 12周期EMA
ema26 = calculate_ema(closes, 26)  # 26周期EMA
```

### calculate_rsi(data, period)

计算相对强弱指标。

```python
def calculate_rsi(data: list, period: int = 14) -> float
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `data` | list[float] | 价格数据列表 |
| `period` | int | RSI周期（默认：14） |

**返回值：** `float` - RSI值（0-100），数据不足时返回 `None`

**示例：**

```python
closes = self.kline_cache.get_closes()
rsi = calculate_rsi(closes, 14)

if rsi is not None:
    if rsi < 30:
        # 超卖区域 - 潜在买入信号
        context.buy(kline.close, 0.1, kline.open_time)
    elif rsi > 70:
        # 超买区域 - 潜在卖出信号
        context.sell_all(kline.close, kline.open_time)
```

### calculate_macd(data, fast, slow, signal)

计算MACD指标。

```python
def calculate_macd(data: list, fast: int = 12, slow: int = 26, signal: int = 9) -> tuple
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `data` | list[float] | 价格数据列表 |
| `fast` | int | 快线EMA周期（默认：12） |
| `slow` | int | 慢线EMA周期（默认：26） |
| `signal` | int | 信号线周期（默认：9） |

**返回值：** `tuple[float, float, float]` - (MACD线, 信号线, 柱状图)，数据不足时返回 `(None, None, None)`

**示例：**

```python
closes = self.kline_cache.get_closes()
macd_line, signal_line, histogram = calculate_macd(closes)

if macd_line is not None:
    # MACD金叉
    if macd_line > signal_line and prev_macd <= prev_signal:
        context.buy(kline.close, 0.1, kline.open_time)
    
    # MACD死叉
    if macd_line < signal_line and prev_macd >= prev_signal:
        context.sell_all(kline.close, kline.open_time)
```

---

## 可用的Python内置函数

以下Python内置函数可在策略代码中使用：

| 类别 | 函数 |
|------|------|
| 数学 | `abs`, `max`, `min`, `pow`, `round`, `sum` |
| 类型转换 | `bool`, `float`, `int`, `str`, `list`, `dict`, `set`, `tuple`, `frozenset` |
| 序列操作 | `len`, `range`, `enumerate`, `zip`, `map`, `filter`, `sorted`, `reversed`, `slice` |
| 逻辑判断 | `all`, `any`, `isinstance` |
| 常量 | `True`, `False`, `None` |
| 异常 | `Exception`, `ValueError`, `TypeError`, `KeyError`, `IndexError`, `RuntimeError`, `StopIteration`, `NotImplementedError` |

---

## 可用的导入模块

以下模块可在策略代码中导入使用：

```python
from collections import deque
from decimal import Decimal
from datetime import datetime
```

**示例：**

```python
from datetime import datetime

class Strategy(IStrategy):
    def run(self, context: BacktestContext, kline: Kline, params: dict):
        # 解析时间戳
        dt = datetime.fromisoformat(kline.open_time.replace('Z', '+00:00'))
        
        # 仅在特定时段交易
        if 9 <= dt.hour < 16:
            # 你的策略逻辑
            pass
```

---

## 完整策略示例

### 示例1：简单移动平均交叉策略

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
        
        # 金叉 - 买入信号
        if fast_ma > slow_ma and prev_fast <= prev_slow:
            if context.position == 0:
                buy_amount = float(context.balance / kline.close) * 0.95
                context.buy(kline.close, buy_amount, kline.open_time)
        
        # 死叉 - 卖出信号
        elif fast_ma < slow_ma and prev_fast >= prev_slow:
            if context.position > 0:
                context.sell_all(kline.close, kline.open_time)
```

### 示例2：RSI + MACD 组合策略

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
        
        # 买入条件：RSI超卖 + MACD金叉
        if context.position == 0:
            if rsi < 35 and histogram > 0:
                if self.prev_macd is not None and self.prev_macd <= self.prev_signal:
                    buy_amount = float(context.balance / kline.close) * 0.95
                    context.buy(kline.close, buy_amount, kline.open_time)
        
        # 卖出条件：RSI超买 + MACD死叉
        elif context.position > 0:
            if rsi > 65 and histogram < 0:
                if self.prev_macd is not None and self.prev_macd >= self.prev_signal:
                    context.sell_all(kline.close, kline.open_time)
        
        self.prev_macd = macd_line
        self.prev_signal = signal_line
```

### 示例3：突破策略（含止损止盈）

```python
class Strategy(IStrategy):
    def run(self, context: BacktestContext, kline: Kline, params: dict):
        closes = self.kline_cache.get_closes()
        highs = self.kline_cache.get_highs()
        lows = self.kline_cache.get_lows()
        
        lookback = params.get('lookback', 20)           # 回看周期
        stop_loss_pct = params.get('stop_loss', 0.03)   # 止损比例 3%
        take_profit_pct = params.get('take_profit', 0.06) # 止盈比例 6%
        
        if len(closes) < lookback:
            return
        
        highest = max(highs[-lookback:])  # 最近N根K线最高价
        lowest = min(lows[-lookback:])    # 最近N根K线最低价
        
        # 入场：突破阻力位
        if context.position == 0:
            if kline.close > highest:
                buy_amount = float(context.balance / kline.close) * 0.95
                context.buy(kline.close, buy_amount, kline.open_time)
        
        # 出场：止损或止盈
        elif context.position > 0:
            avg_price = context.get_avg_position_price()
            
            # 止损
            if kline.close < avg_price * (1 - stop_loss_pct):
                context.sell_all(kline.close, kline.open_time)
            
            # 止盈
            elif kline.close > avg_price * (1 + take_profit_pct):
                context.sell_all(kline.close, kline.open_time)
            
            # 跌破支撑位
            elif kline.close < lowest:
                context.sell_all(kline.close, kline.open_time)
```

---

## 回测配置参数

运行回测时，系统会传递以下配置参数：

### 回测基础参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `initialBalance` | float | 10000 | 初始资金（USDT） |
| `feeRate` | float | 0.001 | 手续费率（默认0.1%） |

### 策略参数 (strategyParams)

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `klineWndSize` | int | 50 | K线缓存窗口大小 |

**示例：**

```python
# 回测配置参数（在UI界面配置）
backtest_params = {
    'initialBalance': 10000,      # 初始资金 10000 USDT
    'feeRate': 0.001,             # 手续费率 0.1%
    'strategyParams': {
        'klineWndSize': 100,      # K线缓存窗口大小
        'fast_period': 10,        # 自定义策略参数
        'slow_period': 30,
        'stop_loss': 0.03
    }
}
```

### 在策略中访问参数

```python
class Strategy(IStrategy):
    def run(self, context: BacktestContext, kline: Kline, params: dict):
        # 访问策略参数（params 即 strategyParams）
        fast_period = params.get('fast_period', 10)
        slow_period = params.get('slow_period', 30)
        stop_loss = params.get('stop_loss', 0.03)
        
        # K线窗口大小在初始化时已设置
        # 可通过 self.kline_cache 访问
```

---

## 回测结果说明

回测完成后，系统返回以下结果：

| 字段 | 类型 | 说明 |
|------|------|------|
| `initialBalance` | float | 初始资金 |
| `finalBalance` | float | 最终权益（余额 + 持仓价值） |
| `profit` | float | 总盈亏（USDT） |
| `profitRate` | float | 收益率（0-1） |
| `maxDrawdown` | float | 最大回撤（0-1） |
| `totalTrades` | int | 总交易次数 |
| `winRate` | float | 胜率（0-1） |
| `baseAsset` | float | 剩余持仓数量（交易货币） |
| `quoteAsset` | float | 剩余余额（计价货币） |
| `baseFee` | float | 交易货币手续费总计 |
| `quoteFee` | float | 计价货币手续费总计 |
| `trades` | list | 交易记录列表 |
| `equityCurve` | list | 权益曲线数据 |

### trades 交易记录结构

每条交易记录包含：

| 字段 | 类型 | 说明 |
|------|------|------|
| `timestamp` | str | 交易时间 |
| `type` | str | 交易类型（'buy' / 'sell'） |
| `price` | float | 交易价格 |
| `amount` | float | 交易数量 |
| `balance` | float | 交易后余额 |
| `fee` | float | 手续费 |

### equityCurve 权益曲线结构

每条权益记录包含：

| 字段 | 类型 | 说明 |
|------|------|------|
| `timestamp` | str | 时间戳 |
| `equity` | float | 总权益 |
| `balance` | float | 余额 |
| `position` | float | 持仓数量 |

---

## 策略自定义参数

除了系统参数外，你可以在UI界面配置自定义策略参数：

```python
# 策略参数（在UI界面配置）
params = {
    'fast_period': 10,
    'slow_period': 30,
    'rsi_period': 14,
    'stop_loss': 0.03,
    'take_profit': 0.06
}

# 在策略中访问参数
fast_period = params.get('fast_period', 10)  # 默认值：10
```

---

## 安全限制

出于安全考虑，策略代码中**不允许**以下操作：

- 文件操作（`open`、文件读写）
- 代码执行（`eval`、`exec`、`compile`）
- 系统访问（`os`、`sys`、`subprocess`）
- 网络请求（`requests`、`urllib`、`socket`）
- 模块导入（除允许的模块外）

---

## 最佳实践

1. **始终检查数据长度**：在计算指标前确保有足够的历史数据
2. **使用带默认值的参数**：`params.get('key', default_value)` 提供默认值
3. **检查持仓状态**：执行交易前检查 `context.position`
4. **实现风险管理**：设置止损和止盈条件
5. **避免过度交易**：添加适当的入场/出场条件

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