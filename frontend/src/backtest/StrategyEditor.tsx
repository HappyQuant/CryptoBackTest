import { useState, useEffect, useRef } from 'react';
import { highlightPython } from './pythonHighlighter';
import './StrategyEditor.css';

interface StrategyEditorProps {
  code: string;
  onChange: (code: string) => void;
  isRunning: boolean;
  onOpenDocs?: () => void;
}

const DEFAULT_STRATEGY = `from IStrategy import IStrategy
from Kline import Kline
from BacktestContext import BacktestContext
from calculate_sma import calculate_sma

class Strategy(IStrategy):
    def run(self, context: BacktestContext, kline: Kline, params: dict):
        closes = self.kline_cache.get_closes()

        if len(closes) < params.get('ma_period', 20):
            return

        ma = calculate_sma(closes, params.get('ma_period', 20))

        if closes[-1] > ma and closes[-2] <= ma:
            if context.position == 0:
                context.buy(kline.close, params.get('buy_amount', 0.1), kline.open_time)

        if closes[-1] < ma and closes[-2] >= ma:
            if context.position > 0:
                context.sell_all(kline.close, kline.open_time)
`;

export function StrategyEditor({ code, onChange, isRunning, onOpenDocs }: StrategyEditorProps) {
  const [lineCount, setLineCount] = useState(1);
  const [highlightedCode, setHighlightedCode] = useState('');
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const codeRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    setHighlightedCode(highlightPython(code));
    setLineCount(code.split('\n').length);
  }, [code]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    onChange(value);
  };

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = e.currentTarget.scrollTop;
    }
    if (codeRef.current) {
      codeRef.current.scrollTop = e.currentTarget.scrollTop;
      codeRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  };

  const handleLoadTemplate = () => {
    onChange(DEFAULT_STRATEGY);
  };

  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  return (
    <div className="strategy-editor">
      <div className="editor-header">
        <span className="editor-title">策略代码</span>
        <div className="editor-actions">
          <button className="btn btn-ghost btn-small" onClick={handleLoadTemplate} disabled={isRunning}>
            加载模板
          </button>
          {onOpenDocs && (
            <button className="btn btn-ghost btn-small" onClick={onOpenDocs} disabled={isRunning}>
              📖 策略手册
            </button>
          )}
        </div>
      </div>
      <div className="editor-container">
        <div className="line-numbers" ref={lineNumbersRef}>
          {lineNumbers.map((num) => (
            <span key={num} className="line-number">
              {num}
            </span>
          ))}
        </div>
        <div className="code-container">
          <pre className="code-highlight" ref={codeRef} dangerouslySetInnerHTML={{ __html: highlightedCode + '\n' }} />
          <textarea
            className="code-textarea"
            value={code}
            onChange={handleChange}
            onScroll={handleScroll}
            disabled={isRunning}
            spellCheck={false}
            placeholder="在这里编写你的Python策略代码..."
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
          />
        </div>
      </div>
      <div className="editor-footer">
        <span className="editor-info">
          Python | 行 {lineCount}
        </span>
      </div>
    </div>
  );
}
