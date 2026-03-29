import { useState, useEffect, useCallback, useRef } from 'react';
import { useI18n, strategyTemplates } from '../i18n';
import { BacktestConfig } from './BacktestConfig';
import { StrategyEditor } from './StrategyEditor';
import { TradingViewChart } from './TradingViewChart';
import { BacktestResultDisplay } from './BacktestResult';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { LanguageSwitch } from '../components/LanguageSwitch';
import type { BacktestConfig as Config, BacktestResult, Kline, Trade } from './types';
import { getSymbols, getIntervals } from './KlineService';
import { KlineCache } from './KlineCache';
import { initializePyodide, loadBacktestTools, runBacktestWithProgress, BacktestProgress } from './PyodideEngine';
import './BacktestPanel.css';

interface BacktestPanelProps {
  onOpenDocs: () => void;
}

export function BacktestPanel({ onOpenDocs }: BacktestPanelProps) {
  const { t, language } = useI18n();
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
  const [code, setCode] = useState<string>(() => strategyTemplates[language]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPyodideReady, setIsPyodideReady] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [klines, setKlines] = useState<Kline[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [progress, setProgress] = useState<string>('');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const abortRef = useRef(false);

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
      alert(language === 'zh' ? 'Pyodide 环境尚未加载完成' : 'Pyodide environment is not ready');
      return;
    }

    abortRef.current = false;
    setIsRunning(true);
    setKlines([]);
    setTrades([]);
    setResult(null);
    setProgress(language === 'zh' ? '正在加载K线数据...' : 'Loading K-line data...');

    try {
      const cache = new KlineCache(
        config.symbol,
        config.interval,
        config.startTime,
        config.endTime
      );

      await cache.fetchNextBatch();

      const allKlines: Kline[] = [];

      while (!cache.isDone() && !abortRef.current) {
        if (cache.hasLowBuffer() && cache.hasMoreData() && !cache.isLoadingData()) {
          await cache.fetchNextBatch();
        }

        if (abortRef.current) break;

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
          setProgress(language === 'zh' ? `已加载 ${allKlines.length} 根K线...` : `Loaded ${allKlines.length} K-lines...`);
        }
      }

      if (abortRef.current) {
        setProgress(language === 'zh' ? '回测已停止' : 'Backtest stopped');
        return;
      }

      setKlines(allKlines);
      setProgress(language === 'zh' ? `共加载 ${allKlines.length} 根K线，开始回测...` : `Loaded ${allKlines.length} K-lines, starting backtest...`);

      if (allKlines.length === 0) {
        alert(language === 'zh' ? '没有K线数据，请检查后端服务是否正常' : 'No K-line data, please check backend service');
        setIsRunning(false);
        return;
      }

      const backtestResult = await runBacktestWithProgress(
        code,
        allKlines,
        config.initialBalance,
        config.feeRate,
        (progressInfo) => {
          if (abortRef.current) return;
          const progressText = language === 'zh' 
            ? `回测进度: ${progressInfo.processedKlines}/${progressInfo.totalKlines} (${Math.round(progressInfo.processedKlines / progressInfo.totalKlines * 100)}%)`
            : `Backtest progress: ${progressInfo.processedKlines}/${progressInfo.totalKlines} (${Math.round(progressInfo.processedKlines / progressInfo.totalKlines * 100)}%)`;
          setProgress(progressText);
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
        50,
        () => abortRef.current
      );

      if (abortRef.current) {
        setProgress(language === 'zh' ? '回测已停止' : 'Backtest stopped');
        return;
      }

      console.log('Backtest result:', backtestResult);
      console.log('Equity curve length:', backtestResult.equityCurve?.length);
      console.log('Trades count:', backtestResult.trades?.length);
      console.log('Trades data:', backtestResult.trades);

      setResult(backtestResult);
      setTrades(backtestResult.trades || []);
      setProgress(language === 'zh' ? '回测完成' : 'Backtest completed');
      
      console.log('After setState, trades will be:', backtestResult.trades || []);
    } catch (error) {
      console.error('Backtest failed:', error);
      alert((language === 'zh' ? '回测失败: ' : 'Backtest failed: ') + (error as Error).message);
      setProgress('');
    } finally {
      setIsRunning(false);
    }
  }, [config, code, isPyodideReady, language]);

  const handleStop = useCallback(() => {
    abortRef.current = true;
    setIsRunning(false);
    setProgress('');
  }, []);

  return (
    <div className="backtest-panel">
      <header className="panel-header">
        <div className="header-left">
          <h1 className="panel-title">{t('app.title')}</h1>
          {progress && <span className="progress-text">{progress}</span>}
        </div>
        <div className="header-right">
          <LanguageSwitch />
          <button className="theme-toggle" onClick={toggleTheme} title={theme === 'light' ? (language === 'zh' ? '切换到暗色主题' : 'Switch to dark theme') : (language === 'zh' ? '切换到亮色主题' : 'Switch to light theme')}>
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <span className={`status-badge ${isPyodideReady ? 'ready' : 'loading'}`}>
            {isPyodideReady ? t('header.pyodideReady') : t('header.pyodideLoading')}
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
