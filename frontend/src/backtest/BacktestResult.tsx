import type { BacktestResult } from './types';
import './BacktestResult.css';

interface BacktestResultProps {
  result: BacktestResult | null;
}

export function BacktestResultDisplay({ result }: BacktestResultProps) {
  if (!result) {
    return (
      <div className="backtest-result result-empty">
        <div className="empty-state">
          <span className="empty-icon">📊</span>
          <p className="empty-text">点击"开始回测"查看结果</p>
        </div>
      </div>
    );
  }

  const profitClass = result.profit >= 0 ? 'positive' : 'negative';

  return (
    <div className="backtest-result">
      <div className="result-header">
        <h3 className="result-title">回测结果</h3>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <span className="metric-label">收益率</span>
          <span className={`metric-value ${profitClass}`}>
            {result.profitRate >= 0 ? '+' : ''}
            {(result.profitRate * 100).toFixed(2)}%
          </span>
        </div>

        <div className="metric-card">
          <span className="metric-label">最大回撤</span>
          <span className="metric-value negative">
            -{result.maxDrawdownRate > 0
              ? (result.maxDrawdownRate * 100).toFixed(2)
              : '0.00'}%
          </span>
        </div>

        <div className="metric-card">
          <span className="metric-label">胜率</span>
          <span className="metric-value">
            {result.winRate > 0 ? (result.winRate * 100).toFixed(1) : '0.0'}%
          </span>
        </div>

        <div className="metric-card">
          <span className="metric-label">交易次数</span>
          <span className="metric-value">{result.totalTrades}</span>
        </div>

        <div className="metric-card">
          <span className="metric-label">初始资金</span>
          <span className="metric-value">${result.initialBalance.toLocaleString()}</span>
        </div>

        <div className="metric-card">
          <span className="metric-label">最终价值</span>
          <span className={`metric-value ${profitClass}`}>
            ${result.finalBalance.toLocaleString()}
          </span>
        </div>

        <div className="metric-card">
          <span className="metric-label">盈亏</span>
          <span className={`metric-value ${profitClass}`}>
            {result.profit >= 0 ? '+' : ''}
            ${result.profit.toLocaleString()}
          </span>
        </div>

        <div className="metric-card">
          <span className="metric-label">持仓</span>
          <span className="metric-value">
            {result.finalPosition > 0 ? result.finalPosition.toFixed(4) : '0'} $
          </span>
        </div>
      </div>
    </div>
  );
}