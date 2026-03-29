import { useState } from 'react';
import { useI18n, strategyDocs } from '../i18n';
import './StrategyDocs.css';

type DocSection = 'quickStart' | 'context' | 'cache' | 'kline' | 'indicators' | 'examples';

export function StrategyDocs() {
  const { t, language } = useI18n();
  const [activeSection, setActiveSection] = useState<DocSection>('quickStart');

  const docsContent = strategyDocs[language];

  return (
    <div className="strategy-docs-page">
      <header className="docs-header">
        <h1>📖 {t('docs.title')}</h1>
        <p>{language === 'zh' ? '完整的策略开发文档，帮助您快速上手量化交易' : 'Complete strategy development documentation to help you get started with quantitative trading'}</p>
      </header>

      <div className="docs-container">
        <nav className="docs-nav">
          {Object.entries(docsContent).map(([key, value]) => (
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
              __html: docsContent[activeSection].content
                .replace(/^# .+$/gm, (match) => `<h1>${match.slice(2)}</h1>`)
                .replace(/^## .+$/gm, (match) => `<h2>${match.slice(3)}</h2>`)
                .replace(/^### .+$/gm, (match) => `<h3>${match.slice(4)}</h3>`)
                .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                .replace(/`([^`]+)`/g, '<code>$1</code>')
                .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
                .replace(/\n\n/g, '</p><p>')
                .replace(/^(?!<[hpu])/gm, '<p>')
                .replace(/- `([^`]+)`: /g, '<li><code>$1</code>: ')
                .replace(/^- /gm, '<li>')
            }}
          />
        </main>
      </div>
    </div>
  );
}
