# 前端量化回测系统 - UI设计规范

## 1. 布局设计

### 1.1 整体布局结构 (Desktop)

```
┌────────────────────────────────────────────────────────────────────────────────┐
│  HEADER: Logo + 项目名称                                    [主题切换] [帮助] │
├────────────────┬───────────────────────────────────────────────────────────────┤
│                │                                                               │
│   配置面板      │                    TradingView 图表区域                        │
│   ─────────    │                    ─────────────────────                    │
│   交易对       │                    ┌─────────────────────────────────────┐   │
│   K线周期      │                    │                                     │   │
│   时间范围     │                    │         K线 + 买卖标记               │   │
│   初始金额     │                    │                                     │   │
│   手续费率     │                    │                                     │   │
│                │                    └─────────────────────────────────────┘   │
│  ───────────   │                    ┌─────────────────────────────────────┐   │
│   策略编辑器    │                    │         权益曲线 / 回撤图表           │   │
│   ───────────  │                    └─────────────────────────────────────┘   │
│   [代码编辑]   │                                                               │
│                │                                                               │
│  ───────────   │  ─────────────────────────────────────────────────────────   │
│   [开始回测]   │                     回测结果面板                               │
│   [停止回测]   │  ┌──────────┬──────────┬──────────┬──────────┬──────────┐     │
│                │  │ 收益率   │ 最大回撤 │  胜率    │ 交易次数 │ 持仓状态 │     │
│                │  └──────────┴──────────┴──────────┴──────────┴──────────┘     │
│                │  ─────────────────────────────────────────────────────────   │
│                │  交易记录列表                                               │
│                │  时间        类型    价格      数量      手续费    状态        │
│                │  ─────────────────────────────────────────────────────────   │
└────────────────┴───────────────────────────────────────────────────────────────┘
```

### 1.2 面板尺寸
- 左侧配置面板: 320px 固定宽度
- 右侧主内容区: 自适应剩余宽度
- 图表区域: 60% 高度
- 结果面板: 40% 高度

### 1.3 响应式断点
- Desktop (≥1280px): 三栏布局
- Tablet (768-1279px): 配置面板折叠为顶部栏
- Mobile (<768px): 单栏垂直布局

## 2. 主题设计

### 2.1 配色方案 (Dark Mode - 金融风格)

```css
:root {
  /* 背景色 - 深灰渐变 */
  --bg-primary: #0a0a0f;
  --bg-secondary: #12121a;
  --bg-tertiary: #1a1a24;
  --bg-card: #1e1e28;

  /* 边框色 */
  --border-subtle: rgba(255, 255, 255, 0.06);
  --border-default: rgba(255, 255, 255, 0.1);
  --border-strong: rgba(255, 255, 255, 0.15);

  /* 文字色 */
  --text-primary: #f4f4f5;
  --text-secondary: #a1a1aa;
  --text-muted: #71717a;

  /* 主题色 - 科技蓝 */
  --primary: #3b82f6;
  --primary-hover: #2563eb;
  --primary-muted: rgba(59, 130, 246, 0.15);

  /* 成功/买入 - 翠绿 */
  --success: #10b981;
  --success-muted: rgba(16, 185, 129, 0.15);

  /* 危险/卖出 - 玫红 */
  --danger: #f43f5e;
  --danger-muted: rgba(244, 63, 94, 0.15);

  /* 警告 - 琥珀 */
  --warning: #f59e0b;
  --warning-muted: rgba(245, 158, 11, 0.15);

  /* 图表色 */
  --chart-1: #3b82f6;
  --chart-2: #10b981;
  --chart-3: #f59e0b;
  --chart-4: #8b5cf6;
  --chart-5: #ec4899;

  /* 阴影 */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.5);

  /* 间距 */
  --spacing-xs: 0.25rem;   /* 4px */
  --spacing-sm: 0.5rem;    /* 8px */
  --spacing-md: 1rem;       /* 16px */
  --spacing-lg: 1.5rem;    /* 24px */
  --spacing-xl: 2rem;      /* 32px */

  /* 圆角 */
  --radius-sm: 0.375rem;  /* 6px */
  --radius-md: 0.5rem;    /* 8px */
  --radius-lg: 0.75rem;   /* 12px */
  --radius-xl: 1rem;      /* 16px */

  /* 字体 */
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', 'SF Mono', monospace;
}
```

### 2.2 组件样式

#### 卡片组件
```css
.card {
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  transition: border-color 200ms ease;
}

.card:hover {
  border-color: var(--border-default);
}
```

#### 按钮组件
```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  font-weight: 500;
  font-size: 0.875rem;
  transition: all 150ms ease;
  cursor: pointer;
}

.btn:active {
  transform: scale(0.98);
}

.btn-primary {
  background: var(--primary);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-hover);
}

.btn-success {
  background: var(--success);
  color: white;
}

.btn-danger {
  background: var(--danger);
  color: white;
}

.btn-ghost {
  background: transparent;
  border: 1px solid var(--border-default);
  color: var(--text-secondary);
}

.btn-ghost:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}
```

#### 输入框组件
```css
.input {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--bg-secondary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: 0.875rem;
  transition: all 200ms ease;
}

.input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-muted);
}

.input::placeholder {
  color: var(--text-muted);
}
```

#### 选择器组件
```css
.select {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  padding-right: var(--spacing-xl);
  background: var(--bg-secondary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: 0.875rem;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23a1a1aa' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
}

.select:focus {
  outline: none;
  border-color: var(--primary);
}
```

### 2.3 指标卡片设计

```css
.metric-card {
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.metric-label {
  font-size: 0.75rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.metric-value {
  font-size: 1.5rem;
  font-weight: 600;
  font-family: var(--font-mono);
}

.metric-value.positive {
  color: var(--success);
}

.metric-value.negative {
  color: var(--danger);
}
```

## 3. 动画设计

### 3.1 微交互规范

```
加载状态:      spinner 1s linear infinite rotate
按钮悬停:       200ms ease [Y: 0→-1, shadow↗]
按钮点击:       100ms ease [scale: 1→0.97]
面板展开:       300ms ease-out [height: auto, opacity: 0→1]
卡片进入:       400ms ease-out [Y: 20→0, opacity: 0→1, stagger: 50ms]
数值变化:       200ms ease [color flash]
回测进度:       progress-bar 100ms linear
图表加载:       500ms ease-out [opacity: 0→1]
```

### 3.2 回测进度指示器

```css
.progress-bar {
  height: 4px;
  background: var(--bg-tertiary);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary), var(--success));
  transition: width 100ms linear;
}
```

### 3.3 交易标记动画

```css
.trade-marker {
  animation: markerPop 300ms ease-out;
}

@keyframes markerPop {
  0% {
    transform: scale(0) translateY(10px);
    opacity: 0;
  }
  70% {
    transform: scale(1.2) translateY(0);
  }
  100% {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}
```

## 4. 组件结构

### 4.1 配置面板 (ConfigPanel)

```
┌─────────────────────────────────┐
│  ⚙️ 回测配置                     │
├─────────────────────────────────┤
│                                 │
│  交易对                          │
│  ┌───────────────────────────┐  │
│  │ BTCUSDT               ▼  │  │
│  └───────────────────────────┘  │
│                                 │
│  K线周期                        │
│  ┌───────────────────────────┐  │
│  │ 1h                     ▼  │  │
│  └───────────────────────────┘  │
│                                 │
│  开始时间                        │
│  ┌───────────────────────────┐  │
│  │ 2024-01-01               │  │
│  └───────────────────────────┘  │
│                                 │
│  结束时间                        │
│  ┌───────────────────────────┐  │
│  │ 2024-12-31               │  │
│  └───────────────────────────┘  │
│                                 │
│  初始金额 (USD)                  │
│  ┌───────────────────────────┐  │
│  │ 10000                     │  │
│  └───────────────────────────┘  │
│                                 │
│  手续费率 (%)                    │
│  ┌───────────────────────────┐  │
│  │ 0.1                       │  │
│  └───────────────────────────┘  │
│                                 │
├─────────────────────────────────┤
│  [▶ 开始回测]                   │
│  [⏹ 停止回测]                   │
└─────────────────────────────────┘
```

### 4.2 策略编辑器 (StrategyEditor)

```
┌─────────────────────────────────┐
│  📝 策略代码              [模板▼]│
├─────────────────────────────────┤
│                                 │
│  ┌───────────────────────────┐  │
│  │ from IStrategy import...  │  │
│  │                           │  │
│  │ class MyStrategy(IStrate │  │
│  │     def run(self, ...):   │  │
│  │         closes = self... │  │
│  │         if len(closes) < │  │
│  │             return       │  │
│  │         ma = calculate_  │  │
│  │         if closes[-1] >  │  │
│  │             context.buy  │  │
│  │         if closes[-1] <  │  │
│  │             context.sel │  │
│  │                           │  │
│  └───────────────────────────┘  │
│                                 │
│  行 1-15  列 1-45   Python     │
└─────────────────────────────────┘
```

### 4.3 结果展示面板 (ResultPanel)

```
┌────────────────────────────────────────────────────────────┐
│  📊 回测结果                                               │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │ 收益率   │ │ 最大回撤 │ │  胜率    │ │ 交易次数 │      │
│  │ +23.45%  │ │ -8.32%   │ │  62.5%   │ │    24    │      │
│  │ ▲        │ │ ▼        │ │          │ │          │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
│                                                            │
│  初始资金: $10,000    最终价值: $12,345    盈亏: +$2,345   │
│                                                            │
├────────────────────────────────────────────────────────────┤
│  交易记录                                                  │
├────────────────────────────────────────────────────────────┤
│  时间                类型      价格         数量     手续费 │
├────────────────────────────────────────────────────────────┤
│  2024-01-15 10:00   BUY      42,500.00    0.10     4.25  │
│  2024-01-20 14:30   SELL     43,200.00    0.10     4.32  │
│  2024-02-01 09:15   BUY      41,800.00    0.15     6.27  │
│  ...                                                    │
└────────────────────────────────────────────────────────────┘
```

## 5. TradingView图表布局

### 5.1 K线图表

```
┌─────────────────────────────────────────────────────────────┐
│  BTCUSDT 1H                      [📊] [⚙️] [全屏] [✕]      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                        ▲ 卖 43,250                         │
│                       ╱                                     │
│            ▲ 43,200 ╱   ●                                  │
│           ╱       ●  ╲                                      │
│  43,150  ●         ╲    ▲ 卖 43,180                       │
│           ╲         ╲  ╱                                    │
│            ╲  ●─────╲                                      │
│           ╱       ╲  ▲ 买 43,100                           │
│  43,050  ●         ╲╱                                      │
│           ╲                                                    │
│            ╲ ▲ 43,000                                        │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  1D   1H   30m   15m   5m   1m            [🔍] [📐] [↗]    │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 权益曲线图表

```
┌─────────────────────────────────────────────────────────────┐
│  权益曲线                                    最终: $12,345   │
├─────────────────────────────────────────────────────────────┤
│  $                                                              │
│  13k ┤                                          ╭────────     │
│      │                                    ╭────╯              │
│  12k ┤                              ╭────╯                   │
│      │                        ╭────╯                          │
│  11k ┤                  ╭────╯                               │
│      │            ╭────╯                                     │
│  10k ┼───────────────────────────────────────────────────    │
│      └──────────────────────────────────────────────────────  │
│           开始                                           结束  │
├─────────────────────────────────────────────────────────────┤
│  最大回撤: -8.32%              回撤期: 2024-02-15 ~ 2024-03  │
└─────────────────────────────────────────────────────────────┘
```

## 6. 字体规范

### 主字体 (Sans-serif)
- **推荐**: Inter, Plus Jakarta Sans, Outfit
- **备选**: system-ui, -apple-system

### 代码字体 (Monospace)
- **推荐**: JetBrains Mono, Fira Code
- **备选**: SF Mono, Consolas

### 字号规范
```css
--text-xs: 0.75rem;    /* 12px - 标签、注释 */
--text-sm: 0.875rem;   /* 14px - 正文、输入框 */
--text-base: 1rem;      /* 16px - 标题 */
--text-lg: 1.125rem;    /* 18px - 大标题 */
--text-xl: 1.25rem;     /* 20px - 区块标题 */
--text-2xl: 1.5rem;     /* 24px - 页面标题 */
--text-3xl: 1.875rem;   /* 30px - Hero标题 */
```

## 7. 间距规范

```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
```

## 8. 验收标准

- [ ] 布局采用经典三栏式（配置-图表-结果）
- [ ] 深色主题，采用金融风格配色
- [ ] 所有交互有明确的hover/active状态
- [ ] 按钮和输入框有适当的focus状态
- [ ] 数值变化有颜色指示（正绿负红）
- [ ] 交易标记有入场动画
- [ ] 图表加载有渐入效果
- [ ] 响应式布局适配不同屏幕尺寸
