import { useState } from 'react';
import { BacktestPanel } from './backtest/BacktestPanel';
import { StrategyDocs } from './backtest/StrategyDocs';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState<'backtest' | 'docs'>('backtest');

  if (currentPage === 'docs') {
    return (
      <div>
        <button 
          className="back-button" 
          onClick={() => setCurrentPage('backtest')}
        >
          ← 返回回测系统
        </button>
        <StrategyDocs />
      </div>
    );
  }

  return (
    <BacktestPanel 
      onOpenDocs={() => setCurrentPage('docs')} 
    />
  );
}

export default App;
