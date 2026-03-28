import type { BacktestConfig } from './types';
import './BacktestConfig.css';

interface BacktestConfigProps {
  config: BacktestConfig;
  symbols: string[];
  intervals: string[];
  onChange: (config: BacktestConfig) => void;
  onStart: () => void;
  onStop: () => void;
  isRunning: boolean;
  isLoading: boolean;
}

export function BacktestConfig({
  config,
  symbols,
  intervals,
  onChange,
  onStart,
  onStop,
  isRunning,
  isLoading,
}: BacktestConfigProps) {
  const handleChange = (field: keyof BacktestConfig, value: string | number) => {
    onChange({ ...config, [field]: value });
  };

  return (
    <div className="backtest-config">
      <div className="config-header">
        <h2 className="config-title">回测配置</h2>
      </div>

      <div className="config-form">
        <div className="form-group">
          <label className="form-label">交易对</label>
          <select
            className="select"
            value={config.symbol}
            onChange={(e) => handleChange('symbol', e.target.value)}
            disabled={isRunning}
          >
            {symbols.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">K线周期</label>
          <select
            className="select"
            value={config.interval}
            onChange={(e) => handleChange('interval', e.target.value)}
            disabled={isRunning}
          >
            {intervals.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">开始时间</label>
          <input
            type="date"
            className="input"
            value={config.startTime.slice(0, 10)}
            onChange={(e) => handleChange('startTime', e.target.value)}
            disabled={isRunning}
          />
        </div>

        <div className="form-group">
          <label className="form-label">结束时间</label>
          <input
            type="date"
            className="input"
            value={config.endTime.slice(0, 10)}
            onChange={(e) => handleChange('endTime', e.target.value)}
            disabled={isRunning}
          />
        </div>

        <div className="form-group">
          <label className="form-label">初始金额 (USD)</label>
          <input
            type="number"
            className="input"
            value={config.initialBalance}
            onChange={(e) => handleChange('initialBalance', parseFloat(e.target.value) || 0)}
            min={0}
            step={100}
            disabled={isRunning}
          />
        </div>

        <div className="form-group">
          <label className="form-label">手续费率 (%)</label>
          <input
            type="number"
            className="input"
            value={(config.feeRate * 100).toFixed(2)}
            onChange={(e) => handleChange('feeRate', (parseFloat(e.target.value) || 0) / 100)}
            min={0}
            max={100}
            step={0.01}
            disabled={isRunning}
          />
        </div>
      </div>

      <div className="config-actions">
        <button
          className="btn btn-primary btn-full"
          onClick={onStart}
          disabled={isRunning || isLoading}
        >
          {isLoading ? (
            <>
              <span className="spinner"></span>
              加载中...
            </>
          ) : (
            '▶ 开始回测'
          )}
        </button>
        {isRunning && (
          <button className="btn btn-danger btn-full" onClick={onStop}>
            ⏹ 停止回测
          </button>
        )}
      </div>
    </div>
  );
}
