import { useState } from 'react';
import { I18nProvider, useI18n } from './i18n';
import { BacktestPanel } from './backtest/BacktestPanel';
import { StrategyDocs } from './backtest/StrategyDocs';
import './App.css';

function BackButton({ onClick }: { onClick: () => void }) {
  const { t, language } = useI18n();
  return (
    <button className="back-button" onClick={onClick}>
      ← {t('docs.backToBacktest')}
    </button>
  );
}

function AppContent() {
  const [currentPage, setCurrentPage] = useState<'backtest' | 'docs'>('backtest');

  if (currentPage === 'docs') {
    return (
      <>
        <BackButton onClick={() => setCurrentPage('backtest')} />
        <StrategyDocs />
      </>
    );
  }

  return (
    <BacktestPanel 
      onOpenDocs={() => setCurrentPage('docs')} 
    />
  );
}

function App() {
  return (
    <I18nProvider>
      <AppContent />
    </I18nProvider>
  );
}

export default App;
