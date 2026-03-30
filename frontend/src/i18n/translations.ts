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
  terminal: {
    title: '终端',
    clear: '清空',
    emptyText: '暂无输出。运行策略后在此显示结果。',
  },
  loading: {
    title: '正在初始化运行环境',
    pyodide: '加载 Python 运行时 (Pyodide)...',
    tools: '加载回测工具...',
    ready: '准备就绪',
    hint: '首次加载可能需要 10-30 秒，请耐心等待',
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
  terminal: {
    title: 'Terminal',
    clear: 'Clear',
    emptyText: 'No output yet. Run your strategy to see results.',
  },
  loading: {
    title: 'Initializing Runtime Environment',
    pyodide: 'Loading Python Runtime (Pyodide)...',
    tools: 'Loading Backtest Tools...',
    ready: 'Ready',
    hint: 'First load may take 10-30 seconds, please wait',
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

## 策略参数说明

| 参数 | 类型 | 说明 |
|------|------|------|
| \`context\` | BacktestContext | 回测上下文，管理账户资金和持仓 |
| \`kline\` | Kline | 当前K线数据 |
| \`params\` | dict | 用户自定义参数字典 |

## 基本交易操作

\`\`\`python
# 买入指定数量
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

# 获取最高价列表
highs = self.kline_cache.get_highs()

# 获取最低价列表
lows = self.kline_cache.get_lows()
\`\`\`

## 完整策略示例

\`\`\`python
class Strategy(IStrategy):
    def run(self, context: BacktestContext, kline: Kline, params: dict):
        # 获取历史收盘价
        closes = self.kline_cache.get_closes()
        
        # 确保有足够数据
        if len(closes) < 20:
            return
        
        # 计算均线
        ma = calculate_sma(closes, 20)
        
        # 金叉买入
        if closes[-1] > ma and closes[-2] <= ma:
            if context.position == 0:
                buy_amount = float(context.balance / kline.close) * 0.95
                context.buy(kline.close, buy_amount, kline.open_time)
        
        # 死叉卖出
        if closes[-1] < ma and closes[-2] >= ma:
            if context.position > 0:
                context.sell_all(kline.close, kline.open_time)
\`\`\`
`,
    },
    context: {
      title: 'BacktestContext - 回测上下文',
      content: `
# BacktestContext 类

回测上下文对象，管理账户资金、持仓和交易记录。

## 属性列表

| 属性 | 类型 | 说明 |
|------|------|------|
| \`balance\` | Decimal | 可用余额（计价货币，如USDT） |
| \`position\` | Decimal | 当前持仓数量（交易货币，如BTC） |
| \`initial_balance\` | Decimal | 初始资金 |
| \`fee_rate\` | Decimal | 手续费率 |
| \`trades\` | list | 交易记录列表 |
| \`orders\` | list[Order] | 订单记录列表 |
| \`equity_curve\` | list | 权益曲线数据 |
| \`max_drawdown\` | Decimal | 最大回撤 |

## 交易方法

### buy(price, amount, timestamp)

执行买入操作。

**参数：**
- \`price\` (float): 买入价格
- \`amount\` (float): 买入数量（交易货币数量）
- \`timestamp\` (str): 订单时间戳

**返回：** \`bool\` - 订单是否成功

**示例：**

\`\`\`python
# 买入 0.1 BTC
success = context.buy(kline.close, 0.1, kline.open_time)

# 使用95%的余额买入
buy_amount = float(context.balance / kline.close) * 0.95
context.buy(kline.close, buy_amount, kline.open_time)
\`\`\`

### sell(price, amount, timestamp)

执行卖出操作。

**参数：**
- \`price\` (float): 卖出价格
- \`amount\` (float): 卖出数量（交易货币数量）
- \`timestamp\` (str): 订单时间戳

**返回：** \`bool\` - 订单是否成功

**示例：**

\`\`\`python
# 卖出 0.05 BTC
context.sell(kline.close, 0.05, kline.open_time)

# 卖出一半持仓
sell_amount = float(context.position) / 2
context.sell(kline.close, sell_amount, kline.open_time)
\`\`\`

### sell_all(price, timestamp)

卖出全部持仓。

**参数：**
- \`price\` (float): 卖出价格
- \`timestamp\` (str): 订单时间戳

**返回：** \`bool\` - 订单是否成功

**示例：**

\`\`\`python
# 卖出全部持仓
if context.position > 0:
    context.sell_all(kline.close, kline.open_time)
\`\`\`

## 查询方法

### get_position_value(price)

计算当前持仓价值。

**参数：**
- \`price\` (float): 当前价格

**返回：** \`Decimal\` - 持仓价值（计价货币）

**示例：**

\`\`\`python
position_value = context.get_position_value(kline.close)
print(f"持仓价值: {position_value} USDT")
\`\`\`

### get_equity(price)

计算账户总权益（余额 + 持仓价值）。

**参数：**
- \`price\` (float): 当前价格

**返回：** \`Decimal\` - 总权益

**示例：**

\`\`\`python
total_equity = context.get_equity(kline.close)
print(f"总权益: {total_equity} USDT")
\`\`\`

### get_avg_position_price()

获取平均持仓成本价格。

**返回：** \`float\` - 平均持仓价格

**示例：**

\`\`\`python
avg_price = context.get_avg_position_price()

# 盈利5%时卖出
if kline.close > avg_price * 1.05:
    context.sell_all(kline.close, kline.open_time)

# 亏损3%时止损
if kline.close < avg_price * 0.97:
    context.sell_all(kline.close, kline.open_time)
\`\`\`

### get_drawdown(current_price)

计算当前回撤比例。

**参数：**
- \`current_price\` (float): 当前价格

**返回：** \`Decimal\` - 回撤比例（0-1）

**示例：**

\`\`\`python
drawdown = context.get_drawdown(kline.close)
if drawdown > 0.1:  # 回撤超过10%
    context.sell_all(kline.close, kline.open_time)
\`\`\`
`,
    },
    cache: {
      title: 'KlineCache - K线缓存',
      content: `
# KlineCache 类

K线缓存对象，由框架自动维护，存储历史K线数据。在策略中通过 \`self.kline_cache\` 访问。

## 方法列表

| 方法 | 返回类型 | 说明 |
|------|----------|------|
| \`get_closes()\` | list[float] | 获取所有收盘价 |
| \`get_highs()\` | list[float] | 获取所有最高价 |
| \`get_lows()\` | list[float] | 获取所有最低价 |
| \`get_opens()\` | list[float] | 获取所有开盘价 |
| \`get_volumes()\` | list[float] | 获取所有成交量 |
| \`get_klines()\` | list[Kline] | 获取所有K线对象 |
| \`is_full()\` | bool | 检查缓存是否已填满 |
| \`__len__()\` | int | 获取缓存大小 |

## 方法详解

### get_closes()

获取所有历史收盘价列表。

**返回：** \`list[float]\` - 收盘价列表

**示例：**

\`\`\`python
closes = self.kline_cache.get_closes()

# 最新收盘价
latest_close = closes[-1]

# 上一根K线收盘价
prev_close = closes[-2]

# 最近20根K线收盘价
recent_20_closes = closes[-20:]
\`\`\`

### get_highs()

获取所有历史最高价列表。

**返回：** \`list[float]\` - 最高价列表

**示例：**

\`\`\`python
highs = self.kline_cache.get_highs()

# 最近20根K线最高价
highest_20 = max(highs[-20:])

# 突破前高
if kline.close > max(highs[-20:]):
    context.buy(kline.close, 0.1, kline.open_time)
\`\`\`

### get_lows()

获取所有历史最低价列表。

**返回：** \`list[float]\` - 最低价列表

**示例：**

\`\`\`python
lows = self.kline_cache.get_lows()

# 最近20根K线最低价
lowest_20 = min(lows[-20:])

# 跌破前低
if kline.close < min(lows[-20:]):
    context.sell_all(kline.close, kline.open_time)
\`\`\`

### get_volumes()

获取所有历史成交量列表。

**返回：** \`list[float]\` - 成交量列表

**示例：**

\`\`\`python
volumes = self.kline_cache.get_volumes()

# 平均成交量
avg_volume = sum(volumes[-20:]) / 20

# 放量突破
if kline.volume > avg_volume * 2:
    context.buy(kline.close, 0.1, kline.open_time)
\`\`\`

### get_klines()

获取所有K线对象列表。

**返回：** \`list[Kline]\` - K线对象列表

**示例：**

\`\`\`python
klines = self.kline_cache.get_klines()

# 访问上一根K线
prev_kline = klines[-1]
print(f"前一根K线收盘价: {prev_kline.close}")
\`\`\`

### is_full()

检查缓存是否已填满。

**返回：** \`bool\` - 是否已填满

**示例：**

\`\`\`python
if not self.kline_cache.is_full():
    return  # 等待缓存填满
\`\`\`

## 使用技巧

### 检查数据长度

\`\`\`python
def run(self, context: BacktestContext, kline: Kline, params: dict):
    closes = self.kline_cache.get_closes()
    
    # 确保有足够数据计算指标
    if len(closes) < 50:
        return
    
    # 计算指标...
\`\`\`

### 计算价格区间

\`\`\`python
highs = self.kline_cache.get_highs()
lows = self.kline_cache.get_lows()

# 最近N根K线的价格区间
period = 20
price_range_high = max(highs[-period:])
price_range_low = min(lows[-period:])

# 突破上轨买入
if kline.close > price_range_high:
    context.buy(kline.close, 0.1, kline.open_time)

# 跌破下轨卖出
if kline.close < price_range_low:
    context.sell_all(kline.close, kline.open_time)
\`\`\`
`,
    },
    kline: {
      title: 'Kline - K线数据',
      content: `
# Kline 类

K线数据结构，包含单根K线的所有信息。

## 属性列表

| 属性 | 类型 | 说明 |
|------|------|------|
| \`open_time\` | str | 开盘时间（ISO格式字符串） |
| \`open\` | float | 开盘价 |
| \`high\` | float | 最高价 |
| \`low\` | float | 最低价 |
| \`close\` | float | 收盘价 |
| \`volume\` | float | 成交量 |
| \`close_time\` | str | 收盘时间（ISO格式字符串） |

## 使用示例

### 获取当前价格信息

\`\`\`python
def run(self, context: BacktestContext, kline: Kline, params: dict):
    # 当前收盘价
    current_price = kline.close
    
    # 当前K线最高价和最低价
    high = kline.high
    low = kline.low
    
    # 当前K线振幅
    amplitude = (high - low) / low * 100
    
    # 当前成交量
    volume = kline.volume
\`\`\`

### 获取时间信息

\`\`\`python
def run(self, context: BacktestContext, kline: Kline, params: dict):
    # 开盘时间
    timestamp = kline.open_time
    
    # 收盘时间
    close_time = kline.close_time
\`\`\`

### 计算K线形态

\`\`\`python
def run(self, context: BacktestContext, kline: Kline, params: dict):
    # 判断阳线/阴线
    is_bullish = kline.close > kline.open
    is_bearish = kline.close < kline.open
    
    # 计算实体大小
    body_size = abs(kline.close - kline.open)
    
    # 计算上下影线
    upper_shadow = kline.high - max(kline.open, kline.close)
    lower_shadow = min(kline.open, kline.close) - kline.low
    
    # 十字星形态
    is_doji = body_size < (kline.high - kline.low) * 0.1
    
    # 长下影线（锤子线）
    is_hammer = lower_shadow > body_size * 2 and upper_shadow < body_size * 0.5
\`\`\`

### 结合历史数据使用

\`\`\`python
def run(self, context: BacktestContext, kline: Kline, params: dict):
    closes = self.kline_cache.get_closes()
    
    if len(closes) < 2:
        return
    
    # 当前收盘价 vs 上一根收盘价
    prev_close = closes[-1]
    price_change = (kline.close - prev_close) / prev_close * 100
    
    # 涨幅超过3%
    if price_change > 3:
        context.buy(kline.close, 0.1, kline.open_time)
    
    # 跌幅超过3%
    if price_change < -3:
        context.sell_all(kline.close, kline.open_time)
\`\`\`
`,
    },
    indicators: {
      title: '技术指标函数',
      content: `
# 技术指标函数

框架内置了常用的技术指标计算函数。

## calculate_sma(data, period)

计算简单移动平均线（SMA）。

**参数：**
- \`data\` (list[float]): 价格数据列表
- \`period\` (int): 移动平均周期

**返回：** \`float | None\` - SMA值，数据不足时返回 \`None\`

**示例：**

\`\`\`python
closes = self.kline_cache.get_closes()

# 20周期SMA
ma20 = calculate_sma(closes, 20)

# 50周期SMA
ma50 = calculate_sma(closes, 50)

# 双均线策略
if ma20 > ma50:
    print("短期均线在长期均线之上")
\`\`\`

## calculate_ema(data, period)

计算指数移动平均线（EMA）。

**参数：**
- \`data\` (list[float]): 价格数据列表
- \`period\` (int): 移动平均周期

**返回：** \`float | None\` - EMA值，数据不足时返回 \`None\`

**示例：**

\`\`\`python
closes = self.kline_cache.get_closes()

# 12周期EMA（快线）
ema12 = calculate_ema(closes, 12)

# 26周期EMA（慢线）
ema26 = calculate_ema(closes, 26)

# EMA交叉策略
if ema12 > ema26:
    print("快线在慢线之上")
\`\`\`

## calculate_rsi(data, period=14)

计算相对强弱指标（RSI）。

**参数：**
- \`data\` (list[float]): 价格数据列表
- \`period\` (int): RSI周期，默认14

**返回：** \`float | None\` - RSI值（0-100），数据不足时返回 \`None\`

**示例：**

\`\`\`python
closes = self.kline_cache.get_closes()
rsi = calculate_rsi(closes, 14)

if rsi is not None:
    # RSI超卖区域（< 30）
    if rsi < 30:
        print("超卖区域，可能反弹")
        context.buy(kline.close, 0.1, kline.open_time)
    
    # RSI超买区域（> 70）
    elif rsi > 70:
        print("超买区域，可能回调")
        context.sell_all(kline.close, kline.open_time)
\`\`\`

## calculate_macd(data, fast=12, slow=26, signal=9)

计算MACD指标。

**参数：**
- \`data\` (list[float]): 价格数据列表
- \`fast\` (int): 快线EMA周期，默认12
- \`slow\` (int): 慢线EMA周期，默认26
- \`signal\` (int): 信号线周期，默认9

**返回：** \`tuple[float, float, float] | tuple[None, None, None]\`
- MACD线 = 快线EMA - 慢线EMA
- 信号线 = MACD线的EMA
- 柱状图 = MACD线 - 信号线

**示例：**

\`\`\`python
closes = self.kline_cache.get_closes()
macd_line, signal_line, histogram = calculate_macd(closes)

if macd_line is not None:
    # MACD金叉（MACD线上穿信号线）
    if macd_line > signal_line and histogram > 0:
        print("MACD金叉")
        context.buy(kline.close, 0.1, kline.open_time)
    
    # MACD死叉（MACD线下穿信号线）
    if macd_line < signal_line and histogram < 0:
        print("MACD死叉")
        context.sell_all(kline.close, kline.open_time)
\`\`\`

## 组合使用示例

\`\`\`python
class Strategy(IStrategy):
    def __init__(self):
        super().__init__()
        self.prev_macd = None
        self.prev_signal = None
    
    def run(self, context: BacktestContext, kline: Kline, params: dict):
        closes = self.kline_cache.get_closes()
        
        if len(closes) < 35:
            return
        
        # 计算多个指标
        rsi = calculate_rsi(closes, 14)
        macd_line, signal_line, histogram = calculate_macd(closes)
        
        if rsi is None or macd_line is None:
            return
        
        # 组合条件：RSI超卖 + MACD金叉
        if context.position == 0:
            if rsi < 35 and histogram > 0:
                if self.prev_macd is not None:
                    if self.prev_macd <= self.prev_signal:
                        buy_amount = float(context.balance / kline.close) * 0.95
                        context.buy(kline.close, buy_amount, kline.open_time)
        
        # 组合条件：RSI超买 + MACD死叉
        elif context.position > 0:
            if rsi > 65 and histogram < 0:
                if self.prev_macd is not None:
                    if self.prev_macd >= self.prev_signal:
                        context.sell_all(kline.close, kline.open_time)
        
        self.prev_macd = macd_line
        self.prev_signal = signal_line
\`\`\`
`,
    },
    examples: {
      title: '示例策略',
      content: `
# 示例策略

## 1. 双均线交叉策略

当短期均线上穿长期均线时买入，下穿时卖出。

\`\`\`python
class Strategy(IStrategy):
    def run(self, context: BacktestContext, kline: Kline, params: dict):
        closes = self.kline_cache.get_closes()
        
        # 获取参数
        fast_period = params.get('fast_period', 10)
        slow_period = params.get('slow_period', 30)
        
        if len(closes) < slow_period:
            return
        
        # 计算双均线
        ma_fast = calculate_sma(closes, fast_period)
        ma_slow = calculate_sma(closes, slow_period)
        
        # 计算上一根K线的均线（用于判断交叉）
        prev_fast = calculate_sma(closes[:-1], fast_period)
        prev_slow = calculate_sma(closes[:-1], slow_period)
        
        # 金叉买入
        if ma_fast > ma_slow and prev_fast <= prev_slow:
            if context.position == 0:
                buy_amount = float(context.balance / kline.close) * 0.95
                context.buy(kline.close, buy_amount, kline.open_time)
        
        # 死叉卖出
        elif ma_fast < ma_slow and prev_fast >= prev_slow:
            if context.position > 0:
                context.sell_all(kline.close, kline.open_time)
\`\`\`

## 2. RSI超买超卖策略

RSI低于30时买入，高于70时卖出。

\`\`\`python
class Strategy(IStrategy):
    def run(self, context: BacktestContext, kline: Kline, params: dict):
        closes = self.kline_cache.get_closes()
        
        if len(closes) < 15:
            return
        
        rsi = calculate_rsi(closes, 14)
        
        if rsi is None:
            return
        
        # RSI超卖，买入
        if rsi < 30 and context.position == 0:
            buy_amount = float(context.balance / kline.close) * 0.95
            context.buy(kline.close, buy_amount, kline.open_time)
        
        # RSI超买，卖出
        if rsi > 70 and context.position > 0:
            context.sell_all(kline.close, kline.open_time)
\`\`\`

## 3. MACD金叉死叉策略

\`\`\`python
class Strategy(IStrategy):
    def __init__(self):
        super().__init__()
        self.prev_histogram = None
    
    def run(self, context: BacktestContext, kline: Kline, params: dict):
        closes = self.kline_cache.get_closes()
        
        if len(closes) < 35:
            return
        
        macd_line, signal_line, histogram = calculate_macd(closes)
        
        if macd_line is None:
            return
        
        # MACD金叉买入
        if context.position == 0:
            if histogram > 0 and self.prev_histogram is not None:
                if self.prev_histogram <= 0:
                    buy_amount = float(context.balance / kline.close) * 0.95
                    context.buy(kline.close, buy_amount, kline.open_time)
        
        # MACD死叉卖出
        elif context.position > 0:
            if histogram < 0 and self.prev_histogram is not None:
                if self.prev_histogram >= 0:
                    context.sell_all(kline.close, kline.open_time)
        
        self.prev_histogram = histogram
\`\`\`

## 4. 突破策略（含止损止盈）

\`\`\`python
class Strategy(IStrategy):
    def run(self, context: BacktestContext, kline: Kline, params: dict):
        closes = self.kline_cache.get_closes()
        highs = self.kline_cache.get_highs()
        lows = self.kline_cache.get_lows()
        
        # 参数设置
        lookback = params.get('lookback', 20)
        stop_loss = params.get('stop_loss', 0.03)      # 3%止损
        take_profit = params.get('take_profit', 0.06)  # 6%止盈
        
        if len(closes) < lookback:
            return
        
        # 计算价格区间
        highest = max(highs[-lookback:])
        lowest = min(lows[-lookback:])
        
        # 入场：突破阻力位
        if context.position == 0:
            if kline.close > highest:
                buy_amount = float(context.balance / kline.close) * 0.95
                context.buy(kline.close, buy_amount, kline.open_time)
        
        # 出场：止损或止盈
        elif context.position > 0:
            avg_price = context.get_avg_position_price()
            
            # 止损
            if kline.close < avg_price * (1 - stop_loss):
                context.sell_all(kline.close, kline.open_time)
            
            # 止盈
            elif kline.close > avg_price * (1 + take_profit):
                context.sell_all(kline.close, kline.open_time)
            
            # 跌破支撑位
            elif kline.close < lowest:
                context.sell_all(kline.close, kline.open_time)
\`\`\`

## 5. 布林带策略

\`\`\`python
class Strategy(IStrategy):
    def run(self, context: BacktestContext, kline: Kline, params: dict):
        closes = self.kline_cache.get_closes()
        
        period = params.get('period', 20)
        std_dev = params.get('std_dev', 2)
        
        if len(closes) < period:
            return
        
        # 计算布林带
        middle = calculate_sma(closes, period)
        
        # 计算标准差
        recent_closes = closes[-period:]
        variance = sum((x - middle) ** 2 for x in recent_closes) / period
        std = variance ** 0.5
        
        upper = middle + std_dev * std
        lower = middle - std_dev * std
        
        # 下轨买入
        if kline.close < lower and context.position == 0:
            buy_amount = float(context.balance / kline.close) * 0.95
            context.buy(kline.close, buy_amount, kline.open_time)
        
        # 上轨卖出
        if kline.close > upper and context.position > 0:
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

| Parameter | Type | Description |
|-----------|------|-------------|
| \`context\` | BacktestContext | Backtest context, manages account balance and positions |
| \`kline\` | Kline | Current K-line data |
| \`params\` | dict | User-defined parameters dictionary |

## Basic Trading Operations

\`\`\`python
# Buy specific amount
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

# Get high prices list
highs = self.kline_cache.get_highs()

# Get low prices list
lows = self.kline_cache.get_lows()
\`\`\`

## Complete Strategy Example

\`\`\`python
class Strategy(IStrategy):
    def run(self, context: BacktestContext, kline: Kline, params: dict):
        # Get historical closing prices
        closes = self.kline_cache.get_closes()
        
        # Ensure enough data
        if len(closes) < 20:
            return
        
        # Calculate moving average
        ma = calculate_sma(closes, 20)
        
        # Golden cross - buy
        if closes[-1] > ma and closes[-2] <= ma:
            if context.position == 0:
                buy_amount = float(context.balance / kline.close) * 0.95
                context.buy(kline.close, buy_amount, kline.open_time)
        
        # Death cross - sell
        if closes[-1] < ma and closes[-2] >= ma:
            if context.position > 0:
                context.sell_all(kline.close, kline.open_time)
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
| \`balance\` | Decimal | Available balance (quote asset, e.g., USDT) |
| \`position\` | Decimal | Current position amount (base asset, e.g., BTC) |
| \`initial_balance\` | Decimal | Initial capital |
| \`fee_rate\` | Decimal | Fee rate |
| \`trades\` | list | Trade records list |
| \`orders\` | list[Order] | Order records list |
| \`equity_curve\` | list | Equity curve data |
| \`max_drawdown\` | Decimal | Maximum drawdown |

## Trading Methods

### buy(price, amount, timestamp)

Execute buy operation.

**Parameters:**
- \`price\` (float): Buy price
- \`amount\` (float): Buy amount (base asset quantity)
- \`timestamp\` (str): Order timestamp

**Returns:** \`bool\` - Whether the order was successful

**Example:**

\`\`\`python
# Buy 0.1 BTC
success = context.buy(kline.close, 0.1, kline.open_time)

# Buy using 95% of balance
buy_amount = float(context.balance / kline.close) * 0.95
context.buy(kline.close, buy_amount, kline.open_time)
\`\`\`

### sell(price, amount, timestamp)

Execute sell operation.

**Parameters:**
- \`price\` (float): Sell price
- \`amount\` (float): Sell amount (base asset quantity)
- \`timestamp\` (str): Order timestamp

**Returns:** \`bool\` - Whether the order was successful

**Example:**

\`\`\`python
# Sell 0.05 BTC
context.sell(kline.close, 0.05, kline.open_time)

# Sell half of position
sell_amount = float(context.position) / 2
context.sell(kline.close, sell_amount, kline.open_time)
\`\`\`

### sell_all(price, timestamp)

Sell all positions.

**Parameters:**
- \`price\` (float): Sell price
- \`timestamp\` (str): Order timestamp

**Returns:** \`bool\` - Whether the order was successful

**Example:**

\`\`\`python
# Sell all positions
if context.position > 0:
    context.sell_all(kline.close, kline.open_time)
\`\`\`

## Query Methods

### get_position_value(price)

Calculate current position value.

**Parameters:**
- \`price\` (float): Current price

**Returns:** \`Decimal\` - Position value (quote asset)

**Example:**

\`\`\`python
position_value = context.get_position_value(kline.close)
print(f"Position value: {position_value} USDT")
\`\`\`

### get_equity(price)

Calculate total account equity (balance + position value).

**Parameters:**
- \`price\` (float): Current price

**Returns:** \`Decimal\` - Total equity

**Example:**

\`\`\`python
total_equity = context.get_equity(kline.close)
print(f"Total equity: {total_equity} USDT")
\`\`\`

### get_avg_position_price()

Get average position cost price.

**Returns:** \`float\` - Average position price

**Example:**

\`\`\`python
avg_price = context.get_avg_position_price()

# Sell at 5% profit
if kline.close > avg_price * 1.05:
    context.sell_all(kline.close, kline.open_time)

# Stop loss at 3% loss
if kline.close < avg_price * 0.97:
    context.sell_all(kline.close, kline.open_time)
\`\`\`

### get_drawdown(current_price)

Calculate current drawdown ratio.

**Parameters:**
- \`current_price\` (float): Current price

**Returns:** \`Decimal\` - Drawdown ratio (0-1)

**Example:**

\`\`\`python
drawdown = context.get_drawdown(kline.close)
if drawdown > 0.1:  # Drawdown exceeds 10%
    context.sell_all(kline.close, kline.open_time)
\`\`\`
`,
    },
    cache: {
      title: 'KlineCache - K-line Cache',
      content: `
# KlineCache Class

K-line cache object, automatically maintained by the framework, stores historical K-line data. Access via \`self.kline_cache\` in your strategy.

## Methods

| Method | Return Type | Description |
|--------|-------------|-------------|
| \`get_closes()\` | list[float] | Get all closing prices |
| \`get_highs()\` | list[float] | Get all high prices |
| \`get_lows()\` | list[float] | Get all low prices |
| \`get_opens()\` | list[float] | Get all open prices |
| \`get_volumes()\` | list[float] | Get all volumes |
| \`get_klines()\` | list[Kline] | Get all K-line objects |
| \`is_full()\` | bool | Check if cache is full |
| \`__len__()\` | int | Get cache size |

## Method Details

### get_closes()

Get all historical closing prices.

**Returns:** \`list[float]\` - Closing prices list

**Example:**

\`\`\`python
closes = self.kline_cache.get_closes()

# Latest closing price
latest_close = closes[-1]

# Previous closing price
prev_close = closes[-2]

# Recent 20 closing prices
recent_20_closes = closes[-20:]
\`\`\`

### get_highs()

Get all historical high prices.

**Returns:** \`list[float]\` - High prices list

**Example:**

\`\`\`python
highs = self.kline_cache.get_highs()

# Highest price in recent 20 K-lines
highest_20 = max(highs[-20:])

# Break above previous high
if kline.close > max(highs[-20:]):
    context.buy(kline.close, 0.1, kline.open_time)
\`\`\`

### get_lows()

Get all historical low prices.

**Returns:** \`list[float]\` - Low prices list

**Example:**

\`\`\`python
lows = self.kline_cache.get_lows()

# Lowest price in recent 20 K-lines
lowest_20 = min(lows[-20:])

# Break below previous low
if kline.close < min(lows[-20:]):
    context.sell_all(kline.close, kline.open_time)
\`\`\`

### get_volumes()

Get all historical volumes.

**Returns:** \`list[float]\` - Volumes list

**Example:**

\`\`\`python
volumes = self.kline_cache.get_volumes()

# Average volume
avg_volume = sum(volumes[-20:]) / 20

# High volume breakout
if kline.volume > avg_volume * 2:
    context.buy(kline.close, 0.1, kline.open_time)
\`\`\`

### get_klines()

Get all K-line objects.

**Returns:** \`list[Kline]\` - K-line objects list

**Example:**

\`\`\`python
klines = self.kline_cache.get_klines()

# Access previous K-line
prev_kline = klines[-1]
print(f"Previous K-line close: {prev_kline.close}")
\`\`\`

### is_full()

Check if cache is full.

**Returns:** \`bool\` - Whether cache is full

**Example:**

\`\`\`python
if not self.kline_cache.is_full():
    return  # Wait for cache to fill
\`\`\`

## Usage Tips

### Check Data Length

\`\`\`python
def run(self, context: BacktestContext, kline: Kline, params: dict):
    closes = self.kline_cache.get_closes()
    
    # Ensure enough data for indicator calculation
    if len(closes) < 50:
        return
    
    # Calculate indicators...
\`\`\`

### Calculate Price Range

\`\`\`python
highs = self.kline_cache.get_highs()
lows = self.kline_cache.get_lows()

# Price range for recent N K-lines
period = 20
price_range_high = max(highs[-period:])
price_range_low = min(lows[-period:])

# Break above upper band - buy
if kline.close > price_range_high:
    context.buy(kline.close, 0.1, kline.open_time)

# Break below lower band - sell
if kline.close < price_range_low:
    context.sell_all(kline.close, kline.open_time)
\`\`\`
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
| \`open_time\` | str | Open time (ISO format string) |
| \`open\` | float | Open price |
| \`high\` | float | High price |
| \`low\` | float | Low price |
| \`close\` | float | Close price |
| \`volume\` | float | Volume |
| \`close_time\` | str | Close time (ISO format string) |

## Usage Examples

### Get Current Price Information

\`\`\`python
def run(self, context: BacktestContext, kline: Kline, params: dict):
    # Current closing price
    current_price = kline.close
    
    # Current K-line high and low prices
    high = kline.high
    low = kline.low
    
    # Current K-line amplitude
    amplitude = (high - low) / low * 100
    
    # Current volume
    volume = kline.volume
\`\`\`

### Get Time Information

\`\`\`python
def run(self, context: BacktestContext, kline: Kline, params: dict):
    # Open time
    timestamp = kline.open_time
    
    # Close time
    close_time = kline.close_time
\`\`\`

### Calculate K-line Patterns

\`\`\`python
def run(self, context: BacktestContext, kline: Kline, params: dict):
    # Determine bullish/bearish candle
    is_bullish = kline.close > kline.open
    is_bearish = kline.close < kline.open
    
    # Calculate body size
    body_size = abs(kline.close - kline.open)
    
    # Calculate upper and lower shadows
    upper_shadow = kline.high - max(kline.open, kline.close)
    lower_shadow = min(kline.open, kline.close) - kline.low
    
    # Doji pattern
    is_doji = body_size < (kline.high - kline.low) * 0.1
    
    # Long lower shadow (hammer)
    is_hammer = lower_shadow > body_size * 2 and upper_shadow < body_size * 0.5
\`\`\`

### Use with Historical Data

\`\`\`python
def run(self, context: BacktestContext, kline: Kline, params: dict):
    closes = self.kline_cache.get_closes()
    
    if len(closes) < 2:
        return
    
    # Current close vs previous close
    prev_close = closes[-1]
    price_change = (kline.close - prev_close) / prev_close * 100
    
    # Price increase over 3%
    if price_change > 3:
        context.buy(kline.close, 0.1, kline.open_time)
    
    # Price decrease over 3%
    if price_change < -3:
        context.sell_all(kline.close, kline.open_time)
\`\`\`
`,
    },
    indicators: {
      title: 'Technical Indicators',
      content: `
# Technical Indicator Functions

The framework includes commonly used technical indicator calculation functions.

## calculate_sma(data, period)

Calculate Simple Moving Average (SMA).

**Parameters:**
- \`data\` (list[float]): Price data list
- \`period\` (int): Moving average period

**Returns:** \`float | None\` - SMA value, returns \`None\` if insufficient data

**Example:**

\`\`\`python
closes = self.kline_cache.get_closes()

# 20-period SMA
ma20 = calculate_sma(closes, 20)

# 50-period SMA
ma50 = calculate_sma(closes, 50)

# Dual moving average strategy
if ma20 > ma50:
    print("Short-term MA above long-term MA")
\`\`\`

## calculate_ema(data, period)

Calculate Exponential Moving Average (EMA).

**Parameters:**
- \`data\` (list[float]): Price data list
- \`period\` (int): Moving average period

**Returns:** \`float | None\` - EMA value, returns \`None\` if insufficient data

**Example:**

\`\`\`python
closes = self.kline_cache.get_closes()

# 12-period EMA (fast line)
ema12 = calculate_ema(closes, 12)

# 26-period EMA (slow line)
ema26 = calculate_ema(closes, 26)

# EMA crossover strategy
if ema12 > ema26:
    print("Fast line above slow line")
\`\`\`

## calculate_rsi(data, period=14)

Calculate Relative Strength Index (RSI).

**Parameters:**
- \`data\` (list[float]): Price data list
- \`period\` (int): RSI period, default 14

**Returns:** \`float | None\` - RSI value (0-100), returns \`None\` if insufficient data

**Example:**

\`\`\`python
closes = self.kline_cache.get_closes()
rsi = calculate_rsi(closes, 14)

if rsi is not None:
    # RSI oversold region (< 30)
    if rsi < 30:
        print("Oversold region, potential bounce")
        context.buy(kline.close, 0.1, kline.open_time)
    
    # RSI overbought region (> 70)
    elif rsi > 70:
        print("Overbought region, potential pullback")
        context.sell_all(kline.close, kline.open_time)
\`\`\`

## calculate_macd(data, fast=12, slow=26, signal=9)

Calculate MACD indicator.

**Parameters:**
- \`data\` (list[float]): Price data list
- \`fast\` (int): Fast EMA period, default 12
- \`slow\` (int): Slow EMA period, default 26
- \`signal\` (int): Signal line period, default 9

**Returns:** \`tuple[float, float, float] | tuple[None, None, None]\`
- MACD line = Fast EMA - Slow EMA
- Signal line = EMA of MACD line
- Histogram = MACD line - Signal line

**Example:**

\`\`\`python
closes = self.kline_cache.get_closes()
macd_line, signal_line, histogram = calculate_macd(closes)

if macd_line is not None:
    # MACD golden cross (MACD line crosses above signal line)
    if macd_line > signal_line and histogram > 0:
        print("MACD golden cross")
        context.buy(kline.close, 0.1, kline.open_time)
    
    # MACD death cross (MACD line crosses below signal line)
    if macd_line < signal_line and histogram < 0:
        print("MACD death cross")
        context.sell_all(kline.close, kline.open_time)
\`\`\`

## Combined Usage Example

\`\`\`python
class Strategy(IStrategy):
    def __init__(self):
        super().__init__()
        self.prev_macd = None
        self.prev_signal = None
    
    def run(self, context: BacktestContext, kline: Kline, params: dict):
        closes = self.kline_cache.get_closes()
        
        if len(closes) < 35:
            return
        
        # Calculate multiple indicators
        rsi = calculate_rsi(closes, 14)
        macd_line, signal_line, histogram = calculate_macd(closes)
        
        if rsi is None or macd_line is None:
            return
        
        # Combined condition: RSI oversold + MACD golden cross
        if context.position == 0:
            if rsi < 35 and histogram > 0:
                if self.prev_macd is not None:
                    if self.prev_macd <= self.prev_signal:
                        buy_amount = float(context.balance / kline.close) * 0.95
                        context.buy(kline.close, buy_amount, kline.open_time)
        
        # Combined condition: RSI overbought + MACD death cross
        elif context.position > 0:
            if rsi > 65 and histogram < 0:
                if self.prev_macd is not None:
                    if self.prev_macd >= self.prev_signal:
                        context.sell_all(kline.close, kline.open_time)
        
        self.prev_macd = macd_line
        self.prev_signal = signal_line
\`\`\`
`,
    },
    examples: {
      title: 'Example Strategies',
      content: `
# Example Strategies

## 1. Dual Moving Average Crossover Strategy

Buy when short-term MA crosses above long-term MA, sell when it crosses below.

\`\`\`python
class Strategy(IStrategy):
    def run(self, context: BacktestContext, kline: Kline, params: dict):
        closes = self.kline_cache.get_closes()
        
        # Get parameters
        fast_period = params.get('fast_period', 10)
        slow_period = params.get('slow_period', 30)
        
        if len(closes) < slow_period:
            return
        
        # Calculate dual moving averages
        ma_fast = calculate_sma(closes, fast_period)
        ma_slow = calculate_sma(closes, slow_period)
        
        # Calculate previous K-line MAs (for crossover detection)
        prev_fast = calculate_sma(closes[:-1], fast_period)
        prev_slow = calculate_sma(closes[:-1], slow_period)
        
        # Golden cross - buy
        if ma_fast > ma_slow and prev_fast <= prev_slow:
            if context.position == 0:
                buy_amount = float(context.balance / kline.close) * 0.95
                context.buy(kline.close, buy_amount, kline.open_time)
        
        # Death cross - sell
        elif ma_fast < ma_slow and prev_fast >= prev_slow:
            if context.position > 0:
                context.sell_all(kline.close, kline.open_time)
\`\`\`

## 2. RSI Overbought/Oversold Strategy

Buy when RSI is below 30, sell when above 70.

\`\`\`python
class Strategy(IStrategy):
    def run(self, context: BacktestContext, kline: Kline, params: dict):
        closes = self.kline_cache.get_closes()
        
        if len(closes) < 15:
            return
        
        rsi = calculate_rsi(closes, 14)
        
        if rsi is None:
            return
        
        # RSI oversold - buy
        if rsi < 30 and context.position == 0:
            buy_amount = float(context.balance / kline.close) * 0.95
            context.buy(kline.close, buy_amount, kline.open_time)
        
        # RSI overbought - sell
        if rsi > 70 and context.position > 0:
            context.sell_all(kline.close, kline.open_time)
\`\`\`

## 3. MACD Golden/Death Cross Strategy

\`\`\`python
class Strategy(IStrategy):
    def __init__(self):
        super().__init__()
        self.prev_histogram = None
    
    def run(self, context: BacktestContext, kline: Kline, params: dict):
        closes = self.kline_cache.get_closes()
        
        if len(closes) < 35:
            return
        
        macd_line, signal_line, histogram = calculate_macd(closes)
        
        if macd_line is None:
            return
        
        # MACD golden cross - buy
        if context.position == 0:
            if histogram > 0 and self.prev_histogram is not None:
                if self.prev_histogram <= 0:
                    buy_amount = float(context.balance / kline.close) * 0.95
                    context.buy(kline.close, buy_amount, kline.open_time)
        
        # MACD death cross - sell
        elif context.position > 0:
            if histogram < 0 and self.prev_histogram is not None:
                if self.prev_histogram >= 0:
                    context.sell_all(kline.close, kline.open_time)
        
        self.prev_histogram = histogram
\`\`\`

## 4. Breakout Strategy (with Stop Loss/Take Profit)

\`\`\`python
class Strategy(IStrategy):
    def run(self, context: BacktestContext, kline: Kline, params: dict):
        closes = self.kline_cache.get_closes()
        highs = self.kline_cache.get_highs()
        lows = self.kline_cache.get_lows()
        
        # Parameter settings
        lookback = params.get('lookback', 20)
        stop_loss = params.get('stop_loss', 0.03)      # 3% stop loss
        take_profit = params.get('take_profit', 0.06)  # 6% take profit
        
        if len(closes) < lookback:
            return
        
        # Calculate price range
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
            if kline.close < avg_price * (1 - stop_loss):
                context.sell_all(kline.close, kline.open_time)
            
            # Take profit
            elif kline.close > avg_price * (1 + take_profit):
                context.sell_all(kline.close, kline.open_time)
            
            # Break below support
            elif kline.close < lowest:
                context.sell_all(kline.close, kline.open_time)
\`\`\`

## 5. Bollinger Bands Strategy

\`\`\`python
class Strategy(IStrategy):
    def run(self, context: BacktestContext, kline: Kline, params: dict):
        closes = self.kline_cache.get_closes()
        
        period = params.get('period', 20)
        std_dev = params.get('std_dev', 2)
        
        if len(closes) < period:
            return
        
        # Calculate Bollinger Bands
        middle = calculate_sma(closes, period)
        
        # Calculate standard deviation
        recent_closes = closes[-period:]
        variance = sum((x - middle) ** 2 for x in recent_closes) / period
        std = variance ** 0.5
        
        upper = middle + std_dev * std
        lower = middle - std_dev * std
        
        # Buy at lower band
        if kline.close < lower and context.position == 0:
            buy_amount = float(context.balance / kline.close) * 0.95
            context.buy(kline.close, buy_amount, kline.open_time)
        
        # Sell at upper band
        if kline.close > upper and context.position > 0:
            context.sell_all(kline.close, kline.open_time)
\`\`\`
`,
    },
  },
};
