export type Language = 'zh' | 'en';

export interface Translations {
  [key: string]: string | Translations;
}

const zh: Translations = {
  app: {
    title: 'Crypto量化回测系统',
  },
  header: {
    pyodideReady: '✓ Pyodide就绪',
    pyodideLoading: '⏳ 加载中...',
  },
  config: {
    title: '回测配置',
    symbol: '交易对',
    interval: 'K线周期',
    startTime: '开始时间',
    endTime: '结束时间',
    initialBalance: '初始资金',
    feeRate: '手续费率',
    startBacktest: '开始回测',
    stopBacktest: '停止回测',
    loading: '加载中...',
  },
  result: {
    title: '回测结果',
    profitRate: '收益率',
    maxDrawdown: '最大回撤',
    winRate: '胜率',
    totalTrades: '交易次数',
    initialBalance: '初始资金',
    finalBalance: '最终价值',
    profit: '盈亏',
    position: '持仓',
    emptyText: '点击"开始回测"查看结果',
  },
  editor: {
    title: '策略代码',
    loadTemplate: '加载模板',
    strategyManual: '策略手册',
    placeholder: '在这里编写你的Python策略代码...',
  },
  chart: {
    klineChart: 'K线图表',
    equityCurve: '权益曲线',
    tradeRecords: '成交记录',
  },
  trades: {
    time: '时间',
    type: '类型',
    price: '价格',
    amount: '数量',
    balance: '余额',
    fee: '手续费',
    position: '持仓',
    positionValue: '持仓市值',
    totalValue: '总市值',
    buy: '买入',
    sell: '卖出',
    noTrades: '暂无交易记录',
  },
  docs: {
    title: '策略编写手册',
    backToBacktest: '返回回测',
    quickStart: '快速开始',
    apiReference: 'API参考',
    examples: '示例策略',
    context: 'BacktestContext - 回测上下文',
    cache: 'KlineCache - K线缓存',
    indicators: '技术指标函数',
    kline: 'Kline - K线数据',
  },
  theme: {
    light: '☀️',
    dark: '🌙',
  },
  language: {
    zh: '中文',
    en: 'English',
  },
};

const en: Translations = {
  app: {
    title: 'Crypto Quantitative Backtest System',
  },
  header: {
    pyodideReady: '✓ Pyodide Ready',
    pyodideLoading: '⏳ Loading...',
  },
  config: {
    title: 'Backtest Config',
    symbol: 'Symbol',
    interval: 'Interval',
    startTime: 'Start Time',
    endTime: 'End Time',
    initialBalance: 'Initial Balance',
    feeRate: 'Fee Rate',
    startBacktest: 'Start Backtest',
    stopBacktest: 'Stop Backtest',
    loading: 'Loading...',
  },
  result: {
    title: 'Backtest Result',
    profitRate: 'Profit Rate',
    maxDrawdown: 'Max Drawdown',
    winRate: 'Win Rate',
    totalTrades: 'Total Trades',
    initialBalance: 'Initial Balance',
    finalBalance: 'Final Value',
    profit: 'Profit/Loss',
    position: 'Position',
    emptyText: 'Click "Start Backtest" to see results',
  },
  editor: {
    title: 'Strategy Code',
    loadTemplate: 'Load Template',
    strategyManual: 'Strategy Manual',
    placeholder: 'Write your Python strategy code here...',
  },
  chart: {
    klineChart: 'K-line Chart',
    equityCurve: 'Equity Curve',
    tradeRecords: 'Trade Records',
  },
  trades: {
    time: 'Time',
    type: 'Type',
    price: 'Price',
    amount: 'Amount',
    balance: 'Balance',
    fee: 'Fee',
    position: 'Position',
    positionValue: 'Position Value',
    totalValue: 'Total Value',
    buy: 'Buy',
    sell: 'Sell',
    noTrades: 'No trade records',
  },
  docs: {
    title: 'Strategy Manual',
    backToBacktest: 'Back to Backtest',
    quickStart: 'Quick Start',
    apiReference: 'API Reference',
    examples: 'Example Strategies',
    context: 'BacktestContext - Backtest Context',
    cache: 'KlineCache - K-line Cache',
    indicators: 'Technical Indicators',
    kline: 'Kline - K-line Data',
  },
  theme: {
    light: '☀️',
    dark: '🌙',
  },
  language: {
    zh: '中文',
    en: 'English',
  },
};

export const translations: Record<Language, Translations> = { zh, en };

export function t(lang: Language, key: string): string {
  const keys = key.split('.');
  let value: Translations | string = translations[lang];
  
  for (const k of keys) {
    if (typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      return key;
    }
  }
  
  return typeof value === 'string' ? value : key;
}

export const strategyTemplates: Record<Language, string> = {
  zh: `class Strategy(IStrategy):
    def run(self, context: BacktestContext, kline: Kline, params: dict):
        # 获取历史收盘价列表
        closes = self.kline_cache.get_closes()

        # 确保有足够的数据计算均线
        if len(closes) < params.get('ma_period', 20):
            return

        # 计算移动平均线
        ma = calculate_sma(closes, params.get('ma_period', 20))

        # 价格上穿均线，且当前无持仓时买入
        if closes[-1] > ma and closes[-2] <= ma:
            if context.position == 0:
                context.buy(kline.close, params.get('buy_amount', 0.1), kline.open_time)

        # 价格下穿均线，且当前有持仓时卖出
        if closes[-1] < ma and closes[-2] >= ma:
            if context.position > 0:
                context.sell_all(kline.close, kline.open_time)
`,
  en: `class Strategy(IStrategy):
    def run(self, context: BacktestContext, kline: Kline, params: dict):
        # Get historical closing prices
        closes = self.kline_cache.get_closes()

        # Ensure enough data for moving average calculation
        if len(closes) < params.get('ma_period', 20):
            return

        # Calculate moving average
        ma = calculate_sma(closes, params.get('ma_period', 20))

        # Price crosses above MA, buy when no position
        if closes[-1] > ma and closes[-2] <= ma:
            if context.position == 0:
                context.buy(kline.close, params.get('buy_amount', 0.1), kline.open_time)

        # Price crosses below MA, sell when holding position
        if closes[-1] < ma and closes[-2] >= ma:
            if context.position > 0:
                context.sell_all(kline.close, kline.open_time)
`,
};

export const strategyDocs: Record<Language, Record<string, { title: string; content: string }>> = {
  zh: {
    quickStart: {
      title: '快速开始',
      content: `
# 快速开始

## 编写你的第一个策略

策略是一个继承自 \`IStrategy\` 的Python类，必须实现 \`run\` 方法。

\`\`\`python
class Strategy(IStrategy):
    def run(self, context: BacktestContext, kline: Kline, params: dict):
        # 你的策略逻辑
        pass
\`\`\`

## 策略参数

- \`context\`: 回测上下文，管理账户资金和持仓
- \`kline\`: 当前K线数据
- \`params\`: 用户自定义参数

## 基本交易操作

\`\`\`python
# 买入
context.buy(price, amount, timestamp)

# 卖出指定数量
context.sell(price, amount, timestamp)

# 卖出全部持仓
context.sell_all(price, timestamp)
\`\`\`

## 访问历史数据

\`\`\`python
# 获取收盘价列表
closes = self.kline_cache.get_closes()

# 获取最近一根K线的收盘价
latest_close = closes[-1]
\`\`\`
`,
    },
    context: {
      title: 'BacktestContext - 回测上下文',
      content: `
# BacktestContext 类

回测上下文对象，管理账户资金、持仓和交易记录。

## 属性

| 属性 | 类型 | 说明 |
|------|------|------|
| \`balance\` | Decimal | 账户余额（USDT） |
| \`position\` | Decimal | 持仓数量 |
| \`initial_balance\` | Decimal | 初始资金 |
| \`trades\` | list | 交易记录列表 |
| \`equity_curve\` | list | 权益曲线 |

## 交易方法

### buy(price, amount, timestamp)

买入操作。

**参数：**
- \`price\` (float): 买入价格
- \`amount\` (float): 买入数量
- \`timestamp\` (str): 时间戳

**返回：**
- \`bool\`: 是否成功

**示例：**
\`\`\`python
# 买入0.1个BTC
context.buy(kline.close, 0.1, kline.open_time)
\`\`\`

### sell(price, amount, timestamp)

卖出指定数量。

**参数：**
- \`price\` (float): 卖出价格
- \`amount\` (float): 卖出数量
- \`timestamp\` (str): 时间戳

**返回：**
- \`bool\`: 是否成功

### sell_all(price, timestamp)

卖出全部持仓。

\`\`\`python
context.sell_all(kline.close, kline.open_time)
\`\`\`

## 查询方法

### get_position_value(price)

计算持仓市值。

**参数：**
- \`price\` (float): 当前价格

**返回：**
- \`Decimal\`: 持仓市值

### get_equity(price)

计算总权益 (持币 + 持仓市值)。

**参数：**
- \`price\` (float): 当前价格

**返回：**
- \`Decimal\`: 总权益

### get_avg_position_price()

获取平均持仓成本。

**返回：**
- \`float\`: 平均持仓价格
`,
    },
    cache: {
      title: 'KlineCache - K线缓存',
      content: `
# KlineCache 类

K线缓存对象，由框架自动维护，存储历史K线数据。

## 访问方式

在策略中通过 \`self.kline_cache\` 访问。

## 方法

### get_closes()

获取所有历史收盘价列表。

**返回：**
- \`list[float]\`: 收盘价列表

**示例：**
\`\`\`python
closes = self.kline_cache.get_closes()
latest_close = closes[-1]  # 最新收盘价
prev_close = closes[-2]    # 上一根收盘价
\`\`\`

### get_highs()

获取所有历史最高价列表。

**返回：**
- \`list[float]\`: 最高价列表

### get_lows()

获取所有历史最低价列表。

**返回：**
- \`list[float]\`: 最低价列表

### get_opens()

获取所有历史开盘价列表。

**返回：**
- \`list[float]\`: 开盘价列表

### get_volumes()

获取所有历史成交量列表。

**返回：**
- \`list[float]\`: 成交量列表

### get_klines()

获取所有K线对象列表。

**返回：**
- \`list[Kline]\`: K线对象列表
`,
    },
    kline: {
      title: 'Kline - K线数据',
      content: `
# Kline 类

K线数据结构，包含单根K线的所有信息。

## 属性

| 属性 | 类型 | 说明 |
|------|------|------|
| \`open_time\` | str | 开盘时间 |
| \`open\` | float | 开盘价 |
| \`high\` | float | 最高价 |
| \`low\` | float | 最低价 |
| \`close\` | float | 收盘价 |
| \`volume\` | float | 成交量 |
| \`close_time\` | str | 收盘时间 |

## 使用示例

\`\`\`python
def run(self, context: BacktestContext, kline: Kline, params: dict):
    # 获取当前K线的收盘价
    current_price = kline.close
    
    # 获取当前K线的最高价和最低价
    high = kline.high
    low = kline.low
    
    # 获取开盘时间
    timestamp = kline.open_time
\`\`\`
`,
    },
    indicators: {
      title: '技术指标函数',
      content: `
# 技术指标函数

框架内置了常用的技术指标计算函数。

## calculate_sma(data, period)

计算简单移动平均线。

**参数：**
- \`data\` (list): 价格数据列表
- \`period\` (int): 周期

**返回：**
- \`float\`: SMA值

**示例：**
\`\`\`python
closes = self.kline_cache.get_closes()
ma20 = calculate_sma(closes, 20)
ma50 = calculate_sma(closes, 50)
\`\`\`

## calculate_ema(data, period)

计算指数移动平均线。

**参数：**
- \`data\` (list): 价格数据列表
- \`period\` (int): 周期

**返回：**
- \`float\`: EMA值

**示例：**
\`\`\`python
ema12 = calculate_ema(closes, 12)
ema26 = calculate_ema(closes, 26)
\`\`\`

## calculate_rsi(data, period=14)

计算RSI指标。

**参数：**
- \`data\` (list): 价格数据列表
- \`period\` (int): 周期，默认14

**返回：**
- \`float\`: RSI值 (0-100)

**示例：**
\`\`\`python
rsi = calculate_rsi(closes, 14)
if rsi < 30:
    # 超卖
    pass
elif rsi > 70:
    # 超买
    pass
\`\`\`

## calculate_macd(data, fast=12, slow=26, signal=9)

计算MACD指标。

**参数：**
- \`data\` (list): 价格数据列表
- \`fast\` (int): 快线周期，默认12
- \`slow\` (int): 慢线周期，默认26
- \`signal\` (int): 信号线周期，默认9

**返回：**
- \`tuple\`: (MACD线, 信号线, 柱状图)

**示例：**
\`\`\`python
macd_line, signal_line, histogram = calculate_macd(closes)
if macd_line > signal_line:
    # 金叉
    pass
else:
    # 死叉
    pass
\`\`\`
`,
    },
    examples: {
      title: '示例策略',
      content: `
# 示例策略

## 双均线策略

\`\`\`python
class Strategy(IStrategy):
    def run(self, context: BacktestContext, kline: Kline, params: dict):
        closes = self.kline_cache.get_closes()
        
        if len(closes) < 50:
            return
        
        ma_fast = calculate_sma(closes, 20)
        ma_slow = calculate_sma(closes, 50)
        
        # 快线上穿慢线，买入
        if ma_fast > ma_slow and context.position == 0:
            context.buy(kline.close, 0.1, kline.open_time)
        
        # 快线下穿慢线，卖出
        if ma_fast < ma_slow and context.position > 0:
            context.sell_all(kline.close, kline.open_time)
\`\`\`

## RSI策略

\`\`\`python
class Strategy(IStrategy):
    def run(self, context: BacktestContext, kline: Kline, params: dict):
        closes = self.kline_cache.get_closes()
        
        if len(closes) < 15:
            return
        
        rsi = calculate_rsi(closes, 14)
        
        # RSI超卖，买入
        if rsi < 30 and context.position == 0:
            context.buy(kline.close, 0.1, kline.open_time)
        
        # RSI超买，卖出
        if rsi > 70 and context.position > 0:
            context.sell_all(kline.close, kline.open_time)
\`\`\`

## MACD策略

\`\`\`python
class Strategy(IStrategy):
    def run(self, context: BacktestContext, kline: Kline, params: dict):
        closes = self.kline_cache.get_closes()
        
        if len(closes) < 35:
            return
        
        macd_line, signal_line, histogram = calculate_macd(closes)
        
        # MACD金叉，买入
        if macd_line > signal_line and context.position == 0:
            context.buy(kline.close, 0.1, kline.open_time)
        
        # MACD死叉，卖出
        if macd_line < signal_line and context.position > 0:
            context.sell_all(kline.close, kline.open_time)
\`\`\`
`,
    },
  },
  en: {
    quickStart: {
      title: 'Quick Start',
      content: `
# Quick Start

## Write Your First Strategy

A strategy is a Python class that inherits from \`IStrategy\` and must implement the \`run\` method.

\`\`\`python
class Strategy(IStrategy):
    def run(self, context: BacktestContext, kline: Kline, params: dict):
        # Your strategy logic
        pass
\`\`\`

## Strategy Parameters

- \`context\`: Backtest context, manages account balance and positions
- \`kline\`: Current K-line data
- \`params\`: User-defined parameters

## Basic Trading Operations

\`\`\`python
# Buy
context.buy(price, amount, timestamp)

# Sell specific amount
context.sell(price, amount, timestamp)

# Sell all positions
context.sell_all(price, timestamp)
\`\`\`

## Access Historical Data

\`\`\`python
# Get closing prices list
closes = self.kline_cache.get_closes()

# Get the latest closing price
latest_close = closes[-1]
\`\`\`
`,
    },
    context: {
      title: 'BacktestContext - Backtest Context',
      content: `
# BacktestContext Class

Backtest context object, manages account balance, positions, and trade records.

## Properties

| Property | Type | Description |
|----------|------|-------------|
| \`balance\` | Decimal | Account balance (USDT) |
| \`position\` | Decimal | Position amount |
| \`initial_balance\` | Decimal | Initial balance |
| \`trades\` | list | Trade records list |
| \`equity_curve\` | list | Equity curve |

## Trading Methods

### buy(price, amount, timestamp)

Buy operation.

**Parameters:**
- \`price\` (float): Buy price
- \`amount\` (float): Buy amount
- \`timestamp\` (str): Timestamp

**Returns:**
- \`bool\`: Success or not

**Example:**
\`\`\`python
# Buy 0.1 BTC
context.buy(kline.close, 0.1, kline.open_time)
\`\`\`

### sell(price, amount, timestamp)

Sell specific amount.

**Parameters:**
- \`price\` (float): Sell price
- \`amount\` (float): Sell amount
- \`timestamp\` (str): Timestamp

**Returns:**
- \`bool\`: Success or not

### sell_all(price, timestamp)

Sell all positions.

\`\`\`python
context.sell_all(kline.close, kline.open_time)
\`\`\`

## Query Methods

### get_position_value(price)

Calculate position value.

**Parameters:**
- \`price\` (float): Current price

**Returns:**
- \`Decimal\`: Position value

### get_equity(price)

Calculate total equity (balance + position value).

**Parameters:**
- \`price\` (float): Current price

**Returns:**
- \`Decimal\`: Total equity

### get_avg_position_price()

Get average position cost.

**Returns:**
- \`float\`: Average position price
`,
    },
    cache: {
      title: 'KlineCache - K-line Cache',
      content: `
# KlineCache Class

K-line cache object, automatically maintained by the framework, stores historical K-line data.

## Access

Access via \`self.kline_cache\` in your strategy.

## Methods

### get_closes()

Get all historical closing prices.

**Returns:**
- \`list[float]\`: Closing prices list

**Example:**
\`\`\`python
closes = self.kline_cache.get_closes()
latest_close = closes[-1]  # Latest closing price
prev_close = closes[-2]    # Previous closing price
\`\`\`

### get_highs()

Get all historical high prices.

**Returns:**
- \`list[float]\`: High prices list

### get_lows()

Get all historical low prices.

**Returns:**
- \`list[float]\`: Low prices list

### get_opens()

Get all historical open prices.

**Returns:**
- \`list[float]\`: Open prices list

### get_volumes()

Get all historical volumes.

**Returns:**
- \`list[float]\`: Volumes list

### get_klines()

Get all K-line objects.

**Returns:**
- \`list[Kline]\`: K-line objects list
`,
    },
    kline: {
      title: 'Kline - K-line Data',
      content: `
# Kline Class

K-line data structure, containing all information of a single K-line.

## Properties

| Property | Type | Description |
|----------|------|-------------|
| \`open_time\` | str | Open time |
| \`open\` | float | Open price |
| \`high\` | float | High price |
| \`low\` | float | Low price |
| \`close\` | float | Close price |
| \`volume\` | float | Volume |
| \`close_time\` | str | Close time |

## Usage Example

\`\`\`python
def run(self, context: BacktestContext, kline: Kline, params: dict):
    # Get current K-line closing price
    current_price = kline.close
    
    # Get current K-line high and low prices
    high = kline.high
    low = kline.low
    
    # Get open time
    timestamp = kline.open_time
\`\`\`
`,
    },
    indicators: {
      title: 'Technical Indicators',
      content: `
# Technical Indicator Functions

The framework includes commonly used technical indicator calculation functions.

## calculate_sma(data, period)

Calculate Simple Moving Average.

**Parameters:**
- \`data\` (list): Price data list
- \`period\` (int): Period

**Returns:**
- \`float\`: SMA value

**Example:**
\`\`\`python
closes = self.kline_cache.get_closes()
ma20 = calculate_sma(closes, 20)
ma50 = calculate_sma(closes, 50)
\`\`\`

## calculate_ema(data, period)

Calculate Exponential Moving Average.

**Parameters:**
- \`data\` (list): Price data list
- \`period\` (int): Period

**Returns:**
- \`float\`: EMA value

**Example:**
\`\`\`python
ema12 = calculate_ema(closes, 12)
ema26 = calculate_ema(closes, 26)
\`\`\`

## calculate_rsi(data, period=14)

Calculate RSI indicator.

**Parameters:**
- \`data\` (list): Price data list
- \`period\` (int): Period, default 14

**Returns:**
- \`float\`: RSI value (0-100)

**Example:**
\`\`\`python
rsi = calculate_rsi(closes, 14)
if rsi < 30:
    # Oversold
    pass
elif rsi > 70:
    # Overbought
    pass
\`\`\`

## calculate_macd(data, fast=12, slow=26, signal=9)

Calculate MACD indicator.

**Parameters:**
- \`data\` (list): Price data list
- \`fast\` (int): Fast period, default 12
- \`slow\` (int): Slow period, default 26
- \`signal\` (int): Signal period, default 9

**Returns:**
- \`tuple\`: (MACD line, Signal line, Histogram)

**Example:**
\`\`\`python
macd_line, signal_line, histogram = calculate_macd(closes)
if macd_line > signal_line:
    # Golden cross
    pass
else:
    # Death cross
    pass
\`\`\`
`,
    },
    examples: {
      title: 'Example Strategies',
      content: `
# Example Strategies

## Dual Moving Average Strategy

\`\`\`python
class Strategy(IStrategy):
    def run(self, context: BacktestContext, kline: Kline, params: dict):
        closes = self.kline_cache.get_closes()
        
        if len(closes) < 50:
            return
        
        ma_fast = calculate_sma(closes, 20)
        ma_slow = calculate_sma(closes, 50)
        
        # Fast MA crosses above slow MA, buy
        if ma_fast > ma_slow and context.position == 0:
            context.buy(kline.close, 0.1, kline.open_time)
        
        # Fast MA crosses below slow MA, sell
        if ma_fast < ma_slow and context.position > 0:
            context.sell_all(kline.close, kline.open_time)
\`\`\`

## RSI Strategy

\`\`\`python
class Strategy(IStrategy):
    def run(self, context: BacktestContext, kline: Kline, params: dict):
        closes = self.kline_cache.get_closes()
        
        if len(closes) < 15:
            return
        
        rsi = calculate_rsi(closes, 14)
        
        # RSI oversold, buy
        if rsi < 30 and context.position == 0:
            context.buy(kline.close, 0.1, kline.open_time)
        
        # RSI overbought, sell
        if rsi > 70 and context.position > 0:
            context.sell_all(kline.close, kline.open_time)
\`\`\`

## MACD Strategy

\`\`\`python
class Strategy(IStrategy):
    def run(self, context: BacktestContext, kline: Kline, params: dict):
        closes = self.kline_cache.get_closes()
        
        if len(closes) < 35:
            return
        
        macd_line, signal_line, histogram = calculate_macd(closes)
        
        # MACD golden cross, buy
        if macd_line > signal_line and context.position == 0:
            context.buy(kline.close, 0.1, kline.open_time)
        
        # MACD death cross, sell
        if macd_line < signal_line and context.position > 0:
            context.sell_all(kline.close, kline.open_time)
\`\`\`
`,
    },
  },
};
