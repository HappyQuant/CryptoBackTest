import { useState, useEffect, useCallback } from 'react';
import { BacktestConfig } from './BacktestConfig';
import { StrategyEditor } from './StrategyEditor';
import { TradingViewChart } from './TradingViewChart';
import { BacktestResultDisplay } from './BacktestResult';
import { ErrorBoundary } from '../components/ErrorBoundary';
import type { BacktestConfig as Config, BacktestResult, Kline, Trade } from './types';
import { getSymbols, getIntervals } from './KlineService';
import { KlineCache } from './KlineCache';
import { initializePyodide, loadBacktestTools, runBacktestWithProgress, BacktestProgress } from './PyodideEngine';
import './BacktestPanel.css';

interface BacktestPanelProps {
  onOpenDocs: () => void;
}

const DEFAULT_STRATEGY = `# 策略类必须继承自 IStrategy
class Strategy(IStrategy):
    """
    简单移动平均线交叉策略示例
    
    策略逻辑：
    1. 计算收盘价的移动平均线(MA)
    2. 当价格从下方突破MA时，买入
    3. 当价格从上方跌破MA时，卖出全部持仓
    """
    
    def run(self, context: BacktestContext, kline: Kline, params: dict):
        """
        策略主函数，每根K线都会调用一次
        
        参数说明：
        - context: 回测上下文，包含账户信息和交易方法
        - kline: 当前K线数据对象
        - params: 策略参数字典
        """
        
        # 从缓存中获取所有历史收盘价
        # self.kline_cache 是框架自动维护的K线缓存
        closes = self.kline_cache.get_closes()
        
        # 获取MA周期参数，默认20
        ma_period = params.get('ma_period', 20)
        
        # 如果数据不足，直接返回
        if len(closes) < ma_period:
            return
        
        # 计算简单移动平均线
        # calculate_sma 是框架提供的内置函数
        ma = calculate_sma(closes, ma_period)
        
        # 获取买入数量参数，默认0.1个币
        buy_amount = params.get('buy_amount', 0.1)
        
        # 买入信号：价格从下方突破MA
        # closes[-1] 是最新收盘价，closes[-2] 是上一根收盘价
        if closes[-1] > ma and closes[-2] <= ma:
            # context.buy(价格, 数量, 时间戳) 执行买入
            # 买入前会自动检查余额是否充足
            context.buy(kline.close, buy_amount, kline.open_time)
        
        # 卖出信号：价格从上方跌破MA
        if closes[-1] < ma and closes[-2] >= ma:
            # context.sell_all(价格, 时间戳) 卖出全部持仓
            context.sell_all(kline.close, kline.open_time)
`;

export function BacktestPanel({ onOpenDocs }: BacktestPanelProps) {
  const [symbols, setSymbols] = useState<string[]>([]);
  const [intervals, setIntervals] = useState<string[]>([]);
  const [config, setConfig] = useState<Config>({
    symbol: 'BTCUSDT',
    interval: '1h',
    startTime: '2024-01-01T00:00:00',
    endTime: '2024-12-31T23:59:59',
    initialBalance: 10000,
    feeRate: 0.001,
  });
  const [code, setCode] = useState<string>(DEFAULT_STRATEGY);
  const [isLoading, setIsLoading] = useState(false);
  const [isPyodideReady, setIsPyodideReady] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [klines, setKlines] = useState<Kline[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [progress, setProgress] = useState<string>('');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  useEffect(() => {
    const init = async () => {
      try {
        const [symbolsData, intervalsData] = await Promise.all([
          getSymbols(),
          getIntervals(),
        ]);
        setSymbols(symbolsData);
        setIntervals(intervalsData);
      } catch (error) {
        console.error('Failed to fetch config:', error);
      }
    };

    init();
  }, []);

  useEffect(() => {
    const initPyodide = async () => {
      try {
        setIsLoading(true);
        await initializePyodide();
        await loadBacktestTools();
        setIsPyodideReady(true);
      } catch (error) {
        console.error('Failed to initialize Pyodide:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initPyodide();
  }, []);

  const handleStart = useCallback(async () => {
    if (!isPyodideReady) {
      alert('Pyodide 环境尚未加载完成');
      return;
    }

    setIsRunning(true);
    setKlines([]);
    setTrades([]);
    setResult(null);
    setProgress('正在加载K线数据...');

    try {
      const cache = new KlineCache(
        config.symbol,
        config.interval,
        config.startTime,
        config.endTime
      );

      await cache.fetchNextBatch();

      const allKlines: Kline[] = [];

      while (!cache.isDone()) {
        if (cache.hasLowBuffer() && cache.hasMoreData() && !cache.isLoadingData()) {
          await cache.fetchNextBatch();
        }

        const kline = cache.next();
        if (!kline) {
          if (cache.hasMoreData() && !cache.isLoadingData()) {
            await cache.fetchNextBatch();
            continue;
          }
          break;
        }

        allKlines.push(kline);

        if (allKlines.length % 500 === 0) {
          setKlines([...allKlines]);
          setProgress(`已加载 ${allKlines.length} 根K线...`);
        }
      }

      setKlines(allKlines);
      setProgress(`共加载 ${allKlines.length} 根K线，开始回测...`);

      if (allKlines.length === 0) {
        alert('没有K线数据，请检查后端服务是否正常');
        setIsRunning(false);
        return;
      }

      const backtestResult = await runBacktestWithProgress(
        code,
        allKlines,
        config.initialBalance,
        config.feeRate,
        (progressInfo) => {
          setProgress(`回测进度: ${progressInfo.processedKlines}/${progressInfo.totalKlines} (${Math.round(progressInfo.processedKlines / progressInfo.totalKlines * 100)}%)`);
          setTrades(progressInfo.trades);
          setResult({
            initialBalance: config.initialBalance,
            finalBalance: progressInfo.currentEquity,
            profit: progressInfo.currentEquity - config.initialBalance,
            profitRate: (progressInfo.currentEquity - config.initialBalance) / config.initialBalance,
            maxDrawdown: 0,
            maxDrawdownRate: 0,
            totalTrades: progressInfo.trades.length,
            winRate: 0,
            equityCurve: progressInfo.equityCurve,
            trades: progressInfo.trades,
            drawdownCurve: [],
            finalPosition: 0,
            finalPrice: 0,
          });
        },
        10,
        50
      );

      console.log('Backtest result:', backtestResult);
      console.log('Equity curve length:', backtestResult.equityCurve?.length);
      console.log('Trades count:', backtestResult.trades?.length);
      console.log('Trades data:', backtestResult.trades);

      setResult(backtestResult);
      setTrades(backtestResult.trades || []);
      setProgress('回测完成');
      
      console.log('After setState, trades will be:', backtestResult.trades || []);
    } catch (error) {
      console.error('Backtest failed:', error);
      alert('回测失败: ' + (error as Error).message);
      setProgress('');
    } finally {
      setIsRunning(false);
    }
  }, [config, code, isPyodideReady]);

  const handleStop = useCallback(() => {
    setIsRunning(false);
    setProgress('');
  }, []);

  return (
    <div className="backtest-panel">
      <header className="panel-header">
        <div className="header-left">
          <h1 className="panel-title">Crypto量化回测系统</h1>
          {progress && <span className="progress-text">{progress}</span>}
        </div>
        <div className="header-right">
          <button className="theme-toggle" onClick={toggleTheme} title={`切换到${theme === 'light' ? '暗色' : '亮色'}主题`}>
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <span className={`status-badge ${isPyodideReady ? 'ready' : 'loading'}`}>
            {isPyodideReady ? '✓ Pyodide就绪' : '⏳ 加载中...'}
          </span>
        </div>
      </header>

      <div className="panel-content">
        <div className="main-section">
          <div className="left-panel">
            <div className="config-section">
              <BacktestConfig
                config={config}
                symbols={symbols}
                intervals={intervals}
                onChange={setConfig}
                onStart={handleStart}
                onStop={handleStop}
                isRunning={isRunning}
                isLoading={isLoading}
              />
            </div>
            <div className="result-section">
              <BacktestResultDisplay result={result} />
            </div>
          </div>
          <div className="right-panel">
            <StrategyEditor
              code={code}
              onChange={setCode}
              isRunning={isRunning}
              onOpenDocs={onOpenDocs}
            />
          </div>
        </div>

        <div className="chart-section">
          <ErrorBoundary>
            <TradingViewChart
              klines={klines}
              trades={trades}
              equityCurve={result?.equityCurve}
            />
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
}