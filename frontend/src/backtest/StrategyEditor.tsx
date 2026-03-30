import { useState, useEffect, useRef } from 'react';
import { useI18n, strategyTemplates } from '../i18n';
import { highlightPython } from './pythonHighlighter';
import './StrategyEditor.css';

interface StrategyEditorProps {
  code: string;
  onChange: (code: string) => void;
  isRunning: boolean;
  onOpenDocs?: () => void;
}

const MIN_FONT_SIZE = 10;
const MAX_FONT_SIZE = 24;
const DEFAULT_FONT_SIZE = 13;

export function StrategyEditor({ code, onChange, isRunning, onOpenDocs }: StrategyEditorProps) {
  const { t, language } = useI18n();
  const [lineCount, setLineCount] = useState(1);
  const [highlightedCode, setHighlightedCode] = useState('');
  const [isUserModified, setIsUserModified] = useState(false);
  const [fontSize, setFontSize] = useState(() => {
    const saved = localStorage.getItem('strategy-font-size');
    return saved ? parseInt(saved, 10) : DEFAULT_FONT_SIZE;
  });
  const prevLanguageRef = useRef(language);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const codeRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    setHighlightedCode(highlightPython(code));
    setLineCount(code.split('\n').length);
  }, [code]);

  useEffect(() => {
    if (prevLanguageRef.current !== language && !isUserModified) {
      onChange(strategyTemplates[language]);
    }
    prevLanguageRef.current = language;
  }, [language, isUserModified, onChange]);

  useEffect(() => {
    localStorage.setItem('strategy-font-size', fontSize.toString());
  }, [fontSize]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const isTemplate = value === strategyTemplates['zh'] || value === strategyTemplates['en'];
    setIsUserModified(!isTemplate);
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
    setIsUserModified(false);
    onChange(strategyTemplates[language]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newCode = code.substring(0, start) + '    ' + code.substring(end);
      onChange(newCode);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 4;
      }, 0);
    }
  };

  const handleZoomIn = () => {
    setFontSize(prev => Math.min(prev + 1, MAX_FONT_SIZE));
  };

  const handleZoomOut = () => {
    setFontSize(prev => Math.max(prev - 1, MIN_FONT_SIZE));
  };

  const handleResetFontSize = () => {
    setFontSize(DEFAULT_FONT_SIZE);
  };

  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  return (
    <div className="strategy-editor">
      <div className="editor-header">
        <span className="editor-title">{t('editor.title')}</span>
        <div className="editor-actions">
          <button className="btn btn-ghost btn-small" onClick={handleLoadTemplate} disabled={isRunning}>
            {t('editor.loadTemplate')}
          </button>
          {onOpenDocs && (
            <button className="btn btn-ghost btn-small" onClick={onOpenDocs} disabled={isRunning}>
              📖 {t('editor.strategyManual')}
            </button>
          )}
        </div>
      </div>
      <div className="editor-container">
        <div className="line-numbers" ref={lineNumbersRef} style={{ fontSize: `${fontSize}px` }}>
          {lineNumbers.map((num) => (
            <span key={num} className="line-number">
              {num}
            </span>
          ))}
        </div>
        <div className="code-container">
          <pre 
            className="code-highlight" 
            ref={codeRef} 
            dangerouslySetInnerHTML={{ __html: highlightedCode + '\n' }}
            style={{ fontSize: `${fontSize}px` }}
          />
          <textarea
            className="code-textarea"
            value={code}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onScroll={handleScroll}
            disabled={isRunning}
            spellCheck={false}
            placeholder={t('editor.placeholder')}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            style={{ fontSize: `${fontSize}px` }}
          />
        </div>
        <div className="font-size-controls">
          <button 
            className="font-size-btn" 
            onClick={handleZoomOut} 
            disabled={fontSize <= MIN_FONT_SIZE}
            title={t('editor.zoomOut') || '缩小'}
          >
            −
          </button>
          <span className="font-size-display" onClick={handleResetFontSize} title={t('editor.resetFontSize') || '重置'}>
            {fontSize}
          </span>
          <button 
            className="font-size-btn" 
            onClick={handleZoomIn} 
            disabled={fontSize >= MAX_FONT_SIZE}
            title={t('editor.zoomIn') || '放大'}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
