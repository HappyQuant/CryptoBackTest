import { useEffect, useRef } from 'react';
import { useI18n } from '../i18n';
import './TerminalOutput.css';

export interface TerminalLine {
  type: 'stdout' | 'stderr' | 'info' | 'error';
  content: string;
  timestamp: number;
}

interface TerminalOutputProps {
  lines: TerminalLine[];
  onClear?: () => void;
}

export function TerminalOutput({ lines, onClear }: TerminalOutputProps) {
  const { t } = useI18n();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [lines]);

  const formatTimestamp = (ts: number) => {
    const date = new Date(ts);
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="terminal-output">
      <div className="terminal-header">
        <span className="terminal-title">{t('terminal.title')}</span>
        <div className="terminal-actions">
          {onClear && (
            <button className="btn btn-ghost btn-small" onClick={onClear}>
              {t('terminal.clear')}
            </button>
          )}
        </div>
      </div>
      <div className="terminal-container" ref={containerRef}>
        {lines.length === 0 ? (
          <div className="terminal-empty">
            <span className="terminal-empty-text">{t('terminal.emptyText')}</span>
          </div>
        ) : (
          lines.map((line, index) => (
            <div key={index} className={`terminal-line terminal-${line.type}`}>
              <span className="terminal-timestamp">[{formatTimestamp(line.timestamp)}]</span>
              <span className="terminal-prefix">
                {line.type === 'stdout' && '>'}
                {line.type === 'stderr' && '!'}
                {line.type === 'info' && 'i'}
                {line.type === 'error' && '✗'}
              </span>
              <span className="terminal-content">{line.content}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
