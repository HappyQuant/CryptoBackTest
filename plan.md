# 前端量化回测功能开发计划

## 1. 需求概述

为前端添加加密货币量化回测功能，允许用户：
- 编写自定义Python量化策略
- 从后端获取K线数据进行回测
- 由Pyodide在前端执行策略
- 在TradingView图表上展示K线及买卖点位
- 查看回测结果和绩效指标

## 2. UI设计规范

### 布局结构
详见 [frontend-design.md](./frontend-design.md)

### 设计要点
- **主题**: 深色金融风格
- **配色**: 科技蓝(主)、翠绿(涨)、玫红(跌)
- **字体**: Inter + JetBrains Mono
- **布局**: 左侧配置面板 + 右侧图表/结果

### 关键组件
- ConfigPanel - 配置面板
- StrategyEditor - 策略编辑器
- TradingViewChart - K线图表
- EquityChart - 权益曲线图表
- ResultPanel - 结果展示面板
- MetricCard - 指标卡片

## 3. 核心功能

### 3.1 回测配置
- **交易对选择**: BTCUSDT, ETHUSDT, BNBUSDT 等
- **K线类型选择**: 1m, 5m, 15m, 1h, 4h, 1d 等
- **时间范围**: 开始时间 ~ 结束时间
- **初始金额**: USD单位（如 10000 USD）
- **手续费率**: 买卖手续费（如 0.1%）

### 3.2 策略编辑
- Python代码编辑器
- 内置示例策略（均线交叉策略）
- 用户自定义策略继承IStrategy基类

### 3.3 回测执行
1. 用户点击"回测"按钮
2. 内置回测引擎根据K线回调用户策略
3. 策略触发买卖操作
4. 全局context记录持仓、持币状态
5. 回测过程中实时更新图表标记和权益曲线

### 3.4 图表展示（TradingView）
- 加载K线数据到TradingView图表
- 实时标记买卖点位
- 回测结束后展示所有交易记录
- 权益曲线和回撤曲线

### 3.5 结果展示
- 最终仓位状态
- 盈亏指标（收益率、最大回撤、胜率等）
- 绩效统计

## 3. 技术架构

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React)                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  回测主面板 (BacktestPanel)                               │   │
│  │  ┌────────────────┐  ┌────────────────┐                 │   │
│  │  │  配置面板      │  │  策略编辑器    │                 │   │
│  │  │  - 交易对     │  │  - Python代码  │                 │   │
│  │  │  - K线类型    │  │  - 代码模板    │                 │   │
│  │  │  - 时间范围   │  │               │                 │   │
│  │  │  - 初始金额   │  └────────────────┘                 │   │
│  │  │  - 手续费率  │                                     │   │
│  │  └────────────────┘                                     │   │
│  │  ┌──────────────────────────────────────────────────┐   │   │
│  │  │  TradingView 图表                                 │   │   │
│  │  │  - K线展示                                       │   │   │
│  │  │  - 买卖点位标记 (Buy/Sell markers)               │   │   │
│  │  └──────────────────────────────────────────────────┘   │   │
│  │  ┌──────────────────────────────────────────────────┐   │   │
│  │  │  回测结果                                         │   │   │
│  │  │  - 绩效指标卡片                                   │   │   │
│  │  │  - 交易记录列表                                   │   │   │
│  │  │  - 权益曲线                                       │   │   │
│  │  └──────────────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│                      Pyodide Engine                             │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  backtest_tools.py (IStrategy, Kline, BacktestContext)  │   │
│  │  + 用户策略代码 (继承IStrategy)                          │   │
│  └──────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│                      K线数据管理器                               │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  KlineCache - 分页缓存 (每页1000根)                       │   │
│  │  - 初始加载第一页                                         │   │
│  │  - 策略迭代消费K线                                        │   │
│  │  - 缓存不足时自动加载下一页                               │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Backend (FastAPI)                            │
│  GET /api/v1/kline/{symbol}/{interval}?limit=1000&end_time=xxx │
└─────────────────────────────────────────────────────────────────┘
```

## 4. 文件结构

```
frontend/
├── src/
│   ├── backtest/
│   │   ├── BacktestPanel.tsx      # 回测主面板
│   │   ├── BacktestConfig.tsx     # 回测配置组件
│   │   ├── StrategyEditor.tsx     # 策略编辑器组件
│   │   ├── BacktestResult.tsx     # 结果展示组件
│   │   ├── TradingViewChart.tsx   # TradingView图表组件
│   │   ├── KlineCache.ts          # K线分页缓存（核心）
│   │   ├── KlineService.ts        # K线数据服务
│   │   ├── PyodideEngine.ts       # Pyodide执行引擎
│   │   └── types.ts               # 类型定义
│   ├── components/
│   │   └── PythonEditor.tsx       # 保留（作为备用编辑器）
│   └── App.tsx                    # 修改为使用BacktestPanel
├── package.json                   # 添加lightweight-charts、axios
└── index.html                     # 引入TradingView库
```

## 5. 实现步骤

### 5.1 添加依赖 (package.json)
- 添加 `axios` 用于API请求
- 添加 `lightweight-charts` 用于K线图表（TradingView轻量版）
- 或引入 TradingView 库

### 5.2 创建类型定义 (types.ts)
```typescript
// K线数据
interface Kline {
  open_time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  close_time: string;
}

// 回测配置
interface BacktestConfig {
  symbol: string;
  interval: string;
  startTime: string;
  endTime: string;
  initialBalance: number;
  feeRate: number;
}

// 交易记录
interface Trade {
  timestamp: string;
  type: 'buy' | 'sell';
  price: number;
  amount: number;
  balance: number;
  fee: number;
}

// 回测结果
interface BacktestResult {
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

// 权益曲线数据点
interface EquityPoint {
  timestamp: string;
  equity: number;
  balance: number;
  position: number;
  positionValue: number;
}

// 回撤曲线数据点
interface DrawdownPoint {
  timestamp: string;
  drawdown: number;
  drawdownRate: number;
  highWaterMark: number;
}

// K线API响应
interface KlineListResponse {
  symbol: string;
  interval: string;
  count: number;
  data: Kline[];
}

// 买卖标记
interface TradeMarker {
  time: string;
  position: 'aboveBar' | 'belowBar';
  color: string;
  shape: 'arrowUp' | 'arrowDown';
  text: string;
}
```

### 5.3 创建K线缓存类 (KlineCache.ts) - 核心模块
- 分页缓存管理（每页1000根）
- 迭代器接口 `next()` 每次返回1根K线
- 缓存不足时自动触发下一页加载
- 提供 `getAllKlines()` 获取全部K线用于图表

### 5.4 创建K线服务 (KlineService.ts)
- 从后端API获取K线数据
- 调用后端 `/api/v1/kline/{symbol}/{interval}?limit=1000&end_time=xxx`
- 返回原始K线列表供KlineCache使用

### 5.5 创建Pyodide引擎 (PyodideEngine.ts)
- 加载Pyodide和backtest_tools.py
- 接收KlineCache作为数据源
- 执行用户策略代码
- 每笔交易触发回调返回给前端
- 返回回测结果

### 5.6 创建TradingView图表组件 (TradingViewChart.tsx)
- 使用 lightweight-charts 库
- `setKlineData(klines: Kline[])` 设置K线数据
- `addTradeMarker(marker: TradeMarker)` 添加买卖标记
- `clearMarkers()` 清除所有标记
- 支持实时更新

### 5.7 创建回测配置组件 (BacktestConfig.tsx)
- 交易对选择（下拉框）
- 时间周期选择（下拉框）
- 时间范围选择（日期输入）
- 初始资金输入
- 手续费率设置

### 5.8 创建策略编辑器组件 (StrategyEditor.tsx)
- 代码编辑区（textarea）
- 加载示例策略按钮
- 代码模板（移动平均线交叉策略）

### 5.9 创建结果展示组件 (BacktestResult.tsx)
- 绩效指标卡片（收益率、最大回撤、胜率等）
- 交易记录列表
- 权益曲线

### 5.10 创建回测主面板 (BacktestPanel.tsx)
- 整合所有子组件
- 状态管理（配置、代码、结果、加载状态）
- 协调图表更新和回测执行

### 5.11 修改App.tsx
- 使用BacktestPanel作为主界面

### 5.12 修改index.html
- 引入 lightweight-charts 或 TradingView 库

## 6. 回测执行流程

### 6.1 权益曲线计算
每根K线处理时，根据当前持仓市值计算账户权益：
```typescript
function calculateEquity(context: BacktestContext, currentPrice: number): EquityPoint {
  const positionValue = context.position * currentPrice;
  const equity = context.balance + positionValue;

  return {
    timestamp: kline.open_time,
    equity,                    // 总权益 = 现金 + 持仓市值
    balance: context.balance,   // 现金
    position: context.position, // 持仓数量
    positionValue,              // 持仓市值
  };
}
```

### 6.2 回撤计算
基于权益曲线计算回撤：
```typescript
function calculateDrawdown(equityCurve: EquityPoint[]): DrawdownPoint[] {
  let highWaterMark = 0;
  const drawdownCurve: DrawdownPoint[] = [];

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

  return drawdownCurve;
}
```

### 6.3 回测执行主流程
```typescript
async function runBacktest(
  config: BacktestConfig,
  strategyCode: string,
  onTrade: (trade: Trade) => void,
  onEquityUpdate: (point: EquityPoint) => void
): Promise<BacktestResult> {

  // 1. 初始化图表
  chart.setKlineData([]);

  // 2. 创建K线缓存
  const cache = new KlineCache(config.symbol, config.interval);
  await cache.prefetch();

  // 3. 初始化Pyodide引擎
  const engine = new PyodideEngine();
  await engine.initialize();
  await engine.loadBacktestTools();

  // 4. 执行回测
  const trades: Trade[] = [];
  const equityCurve: EquityPoint[] = [];

  while (true) {
    if (cache.hasLowBuffer()) {
      await cache.prefetch();
    }

    const kline = cache.next();
    if (!kline) break;

    // 执行策略
    const result = await engine.runStrategy(strategyCode, kline, {
      initialBalance: config.initialBalance,
      feeRate: config.feeRate
    });

    // 计算当前权益
    const equityPoint = calculateEquity(result.context, kline.close);
    equityCurve.push(equityPoint);
    onEquityUpdate(equityPoint); // 实时更新权益曲线

    // 处理新交易
    for (const trade of result.newTrades) {
      trades.push(trade);
      onTrade(trade);

      chart.addTradeMarker({
        time: trade.timestamp,
        position: trade.type === 'buy' ? 'belowBar' : 'aboveBar',
        color: trade.type === 'buy' ? '#26a69a' : '#ef5350',
        shape: trade.type === 'buy' ? 'arrowUp' : 'arrowDown',
        text: trade.type === 'buy' ? 'BUY' : 'SELL'
      });
    }
  }

  // 5. 计算回撤曲线
  const drawdownCurve = calculateDrawdown(equityCurve);

  // 6. 计算最大回撤
  const maxDrawdown = Math.max(...drawdownCurve.map(d => d.drawdown));
  const maxDrawdownRate = Math.max(...drawdownCurve.map(d => d.drawdownRate));

  // 7. 返回完整结果
  return {
    trades,
    equityCurve,
    drawdownCurve,
    maxDrawdown,
    maxDrawdownRate,
    // ... 其他指标
  };
}
```

## 7. TradingView图表集成

### 使用 lightweight-charts
```typescript
import { createChart } from 'lightweight-charts';

const chart = createChart(container, {
  width: 800,
  height: 400,
});

const candlestickSeries = chart.addCandlestickSeries();

// 设置K线数据
candlestickSeries.setData(klines.map(k => ({
  time: k.open_time,
  open: k.open,
  high: k.high,
  low: k.low,
  close: k.close,
})));

// 添加买卖标记
const buyMarkers = trades.filter(t => t.type === 'buy').map(t => ({
  time: t.timestamp,
  position: 'belowBar',
  color: '#26a69a',
  shape: 'arrowUp',
  text: 'BUY'
}));

candlestickSeries.setMarkers([...buyMarkers, ...sellMarkers]);
```

### 权益曲线图表
```typescript
// 创建权益曲线图表
const equityChart = createChart(equityContainer, {
  width: 800,
  height: 200,
});

const equitySeries = equityChart.addLineSeries({
  color: '#26a69a',
  lineWidth: 2,
});

// 设置权益数据
equitySeries.setData(equityCurve.map(point => ({
  time: point.timestamp,
  value: point.equity,
})));

// 添加回撤区域（可选）
const drawdownSeries = equityChart.addHistogramSeries({
  color: '#ef5350',
  lineWidth: 1,
});

drawdownSeries.setData(drawdownCurve.map(point => ({
  time: point.timestamp,
  value: -point.drawdownRate * 100, // 转换为百分比
  color: 'rgba(239, 83, 80, 0.3)',
})));
```

## 8. 示例策略模板

```python
from IStrategy import IStrategy
from Kline import Kline
from BacktestContext import BacktestContext
from calculate_sma import calculate_sma

class MyStrategy(IStrategy):
    def run(self, context: BacktestContext, kline: Kline, params: dict):
        # 获取缓存的K线数据
        closes = self.kline_cache.get_closes()

        if len(closes) < params.get('ma_period', 20):
            return

        # 计算均线
        ma = calculate_sma(closes, params.get('ma_period', 20))

        # 金叉买入
        if closes[-1] > ma and closes[-2] <= ma:
            context.buy(kline.close, params.get('buy_amount', 100), kline.open_time)

        # 死叉卖出
        if closes[-1] < ma and closes[-2] >= ma:
            context.sell_all(kline.close, kline.open_time)
```

## 9. CSS样式规范

详见 [frontend-design.md](./frontend-design.md)

### 核心变量
```css
:root {
  --bg-primary: #0a0a0f;
  --bg-secondary: #12121a;
  --bg-card: #1e1e28;
  --primary: #3b82f6;
  --success: #10b981;
  --danger: #f43f5e;
  --text-primary: #f4f4f5;
  --text-secondary: #a1a1aa;
  --border-subtle: rgba(255, 255, 255, 0.06);
  --font-sans: 'Inter', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  --radius-lg: 0.75rem;
}
```

## 10. 验收标准

- [ ] 用户可以选择交易对和时间周期
- [ ] 用户可以选择K线类型（1m, 5m, 15m, 1h, 4h, 1d等）
- [ ] 用户可以填写初始金额（USD单位）
- [ ] 用户可以设置买卖手续费率
- [ ] 用户可以编写和编辑Python策略代码
- [ ] 点击回测后，策略被K线数据回调执行
- [ ] K线数据分页加载（每页1000根）
- [ ] 策略迭代消费K线，缓存不足时自动补充
- [ ] TradingView图表展示K线数据
- [ ] 买卖点位实时标记在图表上
- [ ] 回测结束后展示最终仓位和盈亏指标
- [ ] 界面美观、响应流畅
