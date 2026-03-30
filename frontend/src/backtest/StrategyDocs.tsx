import { useState, useEffect } from 'react';
import { useI18n, strategyDocs } from '../i18n';
import './StrategyDocs.css';

type DocSection = 'quickStart' | 'context' | 'cache' | 'kline' | 'indicators' | 'examples';

interface Token {
  type: string;
  value: string;
}

const highlightPython = (code: string): string => {
  const keywords = new Set(['class', 'def', 'if', 'elif', 'else', 'return', 'for', 'while', 'in', 'not', 'and', 'or', 'is', 'None', 'True', 'False', 'import', 'from', 'as', 'with', 'try', 'except', 'finally', 'raise', 'pass', 'break', 'continue', 'lambda', 'yield', 'global', 'nonlocal', 'assert', 'async', 'await']);
  const builtins = new Set(['print', 'len', 'range', 'enumerate', 'zip', 'map', 'filter', 'sorted', 'reversed', 'sum', 'min', 'max', 'abs', 'round', 'int', 'float', 'str', 'list', 'dict', 'set', 'tuple', 'bool', 'type', 'isinstance']);
  const specialVars = new Set(['self', 'context', 'kline', 'params']);
  
  const tokens: Token[] = [];
  let i = 0;
  const len = code.length;
  
  while (i < len) {
    if (code[i] === '#') {
      let end = i + 1;
      while (end < len && code[end] !== '\n') end++;
      tokens.push({ type: 'comment', value: code.slice(i, end) });
      i = end;
      continue;
    }
    
    if (code[i] === '"' || code[i] === "'") {
      const quote = code[i];
      const triple = code.slice(i, i + 3) === quote.repeat(3);
      let end = i + (triple ? 3 : 1);
      
      if (triple) {
        while (end < len - 2 && code.slice(end, end + 3) !== quote.repeat(3)) end++;
        end += 3;
      } else {
        while (end < len && code[end] !== quote && code[end] !== '\n') {
          if (code[end] === '\\') end++;
          end++;
        }
        end++;
      }
      tokens.push({ type: 'string', value: code.slice(i, end) });
      i = end;
      continue;
    }
    
    if (/\d/.test(code[i]) || (code[i] === '.' && i + 1 < len && /\d/.test(code[i + 1]))) {
      let end = i;
      while (end < len && /\d/.test(code[end])) end++;
      if (end < len && code[end] === '.') {
        end++;
        while (end < len && /\d/.test(code[end])) end++;
      }
      tokens.push({ type: 'number', value: code.slice(i, end) });
      i = end;
      continue;
    }
    
    if (/[a-zA-Z_]/.test(code[i])) {
      let end = i;
      while (end < len && /[a-zA-Z0-9_]/.test(code[end])) end++;
      const word = code.slice(i, end);
      
      let type = 'text';
      if (keywords.has(word)) type = 'keyword';
      else if (builtins.has(word)) type = 'built_in';
      else if (specialVars.has(word)) type = 'variable';
      else if (/^[A-Z]/.test(word)) type = 'class';
      else if (code[end] === '(') type = 'function';
      
      tokens.push({ type, value: word });
      i = end;
      continue;
    }
    
    tokens.push({ type: 'text', value: code[i] });
    i++;
  }
  
  let result = '';
  for (const token of tokens) {
    const escaped = token.value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    
    if (token.type === 'text') {
      result += escaped;
    } else {
      result += `<span class="hljs-${token.type}">${escaped}</span>`;
    }
  }
  
  return result;
};

export function StrategyDocs() {
  const { t, language } = useI18n();
  const [activeSection, setActiveSection] = useState<DocSection>('quickStart');

  const docsContent = strategyDocs[language];

  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'hljs-custom-theme';
    style.textContent = `
      .hljs-comment { color: #6c7086; font-style: italic; }
      .hljs-keyword { color: #cba6f7; font-weight: 500; }
      .hljs-string { color: #a6e3a1; }
      .hljs-number { color: #fab387; }
      .hljs-built_in { color: #89b4fa; }
      .hljs-variable { color: #f9e2af; }
      .hljs-class { color: #f9e2af; font-weight: 500; }
      .hljs-function { color: #89dceb; }
    `;
    
    if (!document.getElementById('hljs-custom-theme')) {
      document.head.appendChild(style);
    }
    
    return () => {
      const existingStyle = document.getElementById('hljs-custom-theme');
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, []);

  const renderContent = (content: string): string => {
    const codeBlocks: string[] = [];
    
    let result = content;
    
    result = result.replace(/```python\n([\s\S]*?)```/g, (_, code) => {
      const highlighted = highlightPython(code.trim());
      const placeholder = `__CODE_BLOCK_${codeBlocks.length}__`;
      codeBlocks.push(`<pre><code class="language-python">${highlighted}</code></pre>`);
      return placeholder;
    });
    
    result = result.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
      const placeholder = `__CODE_BLOCK_${codeBlocks.length}__`;
      codeBlocks.push(`<pre><code class="language-${lang || 'text'}">${code.trim()}</code></pre>`);
      return placeholder;
    });
    
    result = result.replace(/^# .+$/gm, (match) => `<h1>${match.slice(2)}</h1>`);
    result = result.replace(/^## .+$/gm, (match) => `<h2>${match.slice(3)}</h2>`);
    result = result.replace(/^### .+$/gm, (match) => `<h3>${match.slice(4)}</h3>`);
    result = result.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    result = result.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    result = result.replace(/\n\n/g, '</p><p>');
    result = result.replace(/^(?!<[hpu]|__CODE)/gm, '<p>');
    result = result.replace(/- `([^`]+)`: /g, '<li><code>$1</code>: ');
    result = result.replace(/^- /gm, '<li>');
    
    codeBlocks.forEach((block, index) => {
      result = result.replace(`__CODE_BLOCK_${index}__`, block);
    });
    
    return result;
  };

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
              __html: renderContent(docsContent[activeSection].content)
            }}
          />
        </main>
      </div>
    </div>
  );
}
