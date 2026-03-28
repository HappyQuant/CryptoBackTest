import { useState } from 'react';
import './StrategyDocs.css';

const DOCS_CONTENT = {
  overview: {
    title: '概述',
    content: `
# 策略编写指南

本系统支持使用 Python 编写量化交易策略。策略代码会在浏览器中的 Pyodide 环境中运行，无需后端服务器支持。

## 基本结构

每个策略必须包含一个继承自 \`IStrategy\` 的 \`Strategy\` 类：

\`\`\`python
class Strategy(IStrategy):
    def run(self, context: BacktestContext, kline: Kline, params: dict):
        # 策略逻辑
        pass
\`\`\`

## 执行流程

1. 系统按时间顺序遍历每根K线
2. 对于每根K线，调用 \`run\` 方法
3. \`run\` 方法中可以访问历史数据、执行交易
4. 回测结束后生成结果报告
    `,
  },
  kline: {
    title: 'Kline - K线数据',
    content: `
# Kline 类

每根K线数据对象，包含以下属性：

## 属性

| 属性名 | 类型 | 说明 |
|--------|------|------|
| \`open_time\` | string | K线开盘时间 (ISO格式) |
| \`close_time\` | string | K线收盘时间 (ISO格式) |
| \`open\` | float | 开盘价 |
| \`high\` | float | 最高价 |
| \`low\` | float | 最低价 |
| \`close\` | float | 收盘价 |
| \`volume\` | float | 成交量 |

## 使用示例

\`\`\`python
def run(self, context, kline, params):
    # 获取当前K线的收盘价
    current_price = kline.close
    
    # 获取最高价和最低价
    high = kline.high
    low = kline.low
    
    # 获取开盘时间
    time = kline.open_time
\`\`\`
    `,
  },
  context: {
    title: 'BacktestContext - 回测上下文',
    content: `
# BacktestContext 类

回测上下文对象，管理账户状态和交易操作。

## 属性

| 属性名 | 类型 | 说明 |
|--------|------|------|
| \`balance\` | Decimal | 当前持币余额 (USDT) |
| \`position\` | Decimal | 当前持仓数量 (币) |
| \`initial_balance\` | Decimal | 初始资金 |
| \`fee_rate\` | Decimal | 手续费率 |
| \`trades\` | list | 交易记录列表 |

## 交易方法

### buy(price, amount, timestamp)

买入操作。

**参数：**
- \`price\` (float): 买入价格
- \`amount\` (float): 买入数量
- \`timestamp\` (str): 时间戳

**返回：**
- \`bool\`: 是否成功买入

**示例：**
\`\`\`python
# 以当前价格买入 0.1 个币
success = context.buy(kline.close, 0.1, kline.open_time)
if success:
    print("买入成功")
\`\`\`

### sell(price, amount, timestamp)

卖出操作。

**参数：**
- \`price\` (float): 卖出价格
- \`amount\` (float): 卖出数量
- \`timestamp\` (str): 时间戳

**返回：**
- \`bool\`: 是否成功卖出

**示例：**
\`\`\`python
# 以当前价格卖出 0.1 个币
success = context.sell(kline.close, 0.1, kline.open_time)
\`\`\`

### sell_all(price, timestamp)

卖出全部持仓。

**参数：**
- \`price\` (float): 卖出价格
- \`timestamp\` (str): 时间戳

**返回：**
- \`bool\`: 是否成功卖出

**示例：**
\`\`\`python
# 卖出全部持仓
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

**示例：**
\`\`\`python
klines = self.kline_cache.get_klines()
for k in klines[-5:]:  # 遍历最近5根K线
    print(k.open_time, k.close)
\`\`\`
    `,
  },
  indicators: {
    title: '技术指标函数',
    content: `
# 内置技术指标函数

框架提供以下技术指标计算函数：

## calculate_sma(data, period)

简单移动平均线 (Simple Moving Average)

**参数：**
- \`data\` (list): 价格数据列表
- \`period\` (int): 周期

**返回：**
- \`float\`: SMA值

**示例：**
\`\`\`python
closes = self.kline_cache.get_closes()
ma20 = calculate_sma(closes, 20)  # 20周期MA
ma50 = calculate_sma(closes, 50)  # 50周期MA
\`\`\`

## calculate_ema(data, period)

指数移动平均线 (Exponential Moving Average)

**参数：**
- \`data\` (list): 价格数据列表
- \`period\` (int): 周期

**返回：**
- \`float\`: EMA值

**示例：**
\`\`\`python
closes = self.kline_cache.get_closes()
ema12 = calculate_ema(closes, 12)
ema26 = calculate_ema(closes, 26)
\`\`\`

## calculate_rsi(data, period)

相对强弱指标 (Relative Strength Index)

**参数：**
- \`data\` (list): 价格数据列表
- \`period\` (int): 周期 (默认14)

**返回：**
- \`float\`: RSI值 (0-100)

**示例：**
\`\`\`python
closes = self.kline_cache.get_closes()
rsi = calculate_rsi(closes, 14)

# RSI超买超卖信号
if rsi > 70:
    print("超买区域")
elif rsi < 30:
    print("超卖区域")
\`\`\`

## calculate_macd(data, fast, slow, signal)

MACD指标 (Moving Average Convergence Divergence)

**参数：**
- \`data\` (list): 价格数据列表
- \`fast\` (int): 快线周期 (默认12)
- \`slow\` (int): 慢线周期 (默认26)
- \`signal\` (int): 信号线周期 (默认9)

**返回：**
- \`tuple\`: (MACD线, 信号线, 柱状图)

**示例：**
\`\`\`python
closes = self.kline_cache.get_closes()
macd_line, signal_line, histogram = calculate_macd(closes)

# MACD金叉死叉
if macd_line > signal_line:
    print("金叉")
else:
    print("死叉")
\`\`\`
    `,
  },
  examples: {
    title: '策略示例',
    content: `
# 策略示例

## 1. 双均线策略

\`\`\`python
class Strategy(IStrategy):
    """
    双均线交叉策略
    - 快线上穿慢线时买入
    - 快线下穿慢线时卖出
    """
    def run(self, context, kline, params):
        closes = self.kline_cache.get_closes()
        
        fast_period = params.get('fast_period', 10)
        slow_period = params.get('slow_period', 30)
        
        if len(closes) < slow_period:
            return
        
        fast_ma = calculate_sma(closes, fast_period)
        slow_ma = calculate_sma(closes, slow_period)
        prev_fast = calculate_sma(closes[:-1], fast_period)
        prev_slow = calculate_sma(closes[:-1], slow_period)
        
        # 金叉买入
        if prev_fast <= prev_slow and fast_ma > slow_ma:
            context.buy(kline.close, 0.1, kline.open_time)
        
        # 死叉卖出
        if prev_fast >= prev_slow and fast_ma < slow_ma:
            context.sell_all(kline.close, kline.open_time)
\`\`\`

## 2. RSI策略

\`\`\`python
class Strategy(IStrategy):
    """
    RSI超买超卖策略
    - RSI低于30时买入
    - RSI高于70时卖出
    """
    def run(self, context, kline, params):
        closes = self.kline_cache.get_closes()
        
        if len(closes) < 14:
            return
        
        rsi = calculate_rsi(closes, 14)
        
        # 超卖买入
        if rsi < 30:
            context.buy(kline.close, 0.1, kline.open_time)
        
        # 超买卖出
        if rsi > 70:
            context.sell_all(kline.close, kline.open_time)
\`\`\`

## 3. 布林带策略

\`\`\`python
class Strategy(IStrategy):
    """
    布林带策略
    - 价格触及下轨买入
    - 价格触及上轨卖出
    """
    def run(self, context, kline, params):
        closes = self.kline_cache.get_closes()
        period = params.get('period', 20)
        
        if len(closes) < period:
            return
        
        import numpy as np
        
        recent = closes[-period:]
        ma = np.mean(recent)
        std = np.std(recent)
        
        upper = ma + 2 * std
        lower = ma - 2 * std
        
        # 触及下轨买入
        if kline.close <= lower:
            context.buy(kline.close, 0.1, kline.open_time)
        
        # 触及上轨卖出
        if kline.close >= upper:
            context.sell_all(kline.close, kline.open_time)
\`\`\`

## 4. 网格交易策略

\`\`\`python
class Strategy(IStrategy):
    """
    网格交易策略
    - 在价格区间内设置网格
    - 每跌一个网格买入，每涨一个网格卖出
    """
    def initialize(self, window_size):
        super().initialize(window_size)
        self.grid_size = 100  # 网格大小 (USDT)
        self.last_grid = None
    
    def run(self, context, kline, params):
        price = kline.close
        
        if self.last_grid is None:
            self.last_grid = price // self.grid_size
            return
        
        current_grid = price // self.grid_size
        
        # 价格下跌一个网格，买入
        if current_grid < self.last_grid:
            context.buy(price, 0.05, kline.open_time)
            self.last_grid = current_grid
        
        # 价格上涨一个网格，卖出
        if current_grid > self.last_grid and context.position > 0:
            context.sell(price, 0.05, kline.open_time)
            self.last_grid = current_grid
\`\`\`
    `,
  },
};

type DocSection = keyof typeof DOCS_CONTENT;

export function StrategyDocs() {
  const [activeSection, setActiveSection] = useState<DocSection>('overview');

  return (
    <div className="strategy-docs-page">
      <header className="docs-header">
        <h1>📖 策略编写手册</h1>
        <p>完整的策略开发文档，帮助您快速上手量化交易</p>
      </header>

      <div className="docs-container">
        <nav className="docs-nav">
          {Object.entries(DOCS_CONTENT).map(([key, value]) => (
            <button
              key={key}
              className={`nav-item ${activeSection === key ? 'active' : ''}`}
              onClick={() => setActiveSection(key as DocSection)}
            >
              {value.title}
            </button>
          ))}
        </nav>

        <main className="docs-content">
          <div
            className="markdown-content"
            dangerouslySetInnerHTML={{
              __html: DOCS_CONTENT[activeSection].content
                .replace(/^# .+$/gm, '<h1>$&</h1>'.replace('$&', (match) => match.slice(2)))
                .replace(/^## .+$/gm, '<h2>$&</h2>'.replace('$&', (match) => match.slice(3)))
                .replace(/^### .+$/gm, '<h3>$&</h3>'.replace('$&', (match) => match.slice(4)))
                .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                .replace(/`([^`]+)`/g, '<code>$1</code>')
                .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
                .replace(/\n\n/g, '</p><p>')
                .replace(/^(?!<[hpu])/gm, '<p>')
                .replace(/- \`([^`]+)\`: /g, '<li><code>$1</code>: ')
                .replace(/^- /gm, '<li>')
            }}
          />
        </main>
      </div>
    </div>
  );
}