export function highlightPython(code: string): string {
  const keywords = [
    'and', 'as', 'assert', 'async', 'await', 'break', 'class', 'continue',
    'def', 'del', 'elif', 'else', 'except', 'finally', 'for', 'from',
    'global', 'if', 'import', 'in', 'is', 'lambda', 'None', 'nonlocal',
    'not', 'or', 'pass', 'raise', 'return', 'try', 'while', 'with',
    'yield', 'True', 'False', 'self'
  ];

  const builtins = [
    'print', 'len', 'range', 'str', 'int', 'float', 'list', 'dict',
    'set', 'tuple', 'bool', 'type', 'sorted', 'reversed', 'enumerate',
    'zip', 'map', 'filter', 'sum', 'min', 'max', 'abs', 'round',
    'open', 'super', 'property', 'staticmethod', 'classmethod'
  ];

  const frameworkFunctions = [
    'get_closes', 'get_highs', 'get_lows', 'get_opens', 'get_volumes',
    'buy', 'sell', 'sell_all', 'get_position', 'get_balance',
    'calculate_sma', 'calculate_ema', 'calculate_rsi', 'calculate_macd'
  ];

  const frameworkClasses = [
    'IStrategy', 'Kline', 'BacktestContext', 'KlineCache', 'Order', 'OrderType'
  ];

  let result = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  const tokens: { start: number; end: number; html: string }[] = [];

  function addToken(start: number, end: number, html: string) {
    if (start < end && !tokens.some(t => (start >= t.start && start < t.end) || (end > t.start && end <= t.end))) {
      tokens.push({ start, end, html });
    }
  }

  const docstringPattern = /("""[\s\S]*?"""|'''[\s\S]*?''')/g;
  let match: RegExpExecArray | null;
  while ((match = docstringPattern.exec(result)) !== null) {
    addToken(match.index, match.index + match[0].length, `<span class="py-docstring">${match[0]}</span>`);
  }

  const stringPattern = /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g;
  while ((match = stringPattern.exec(result)) !== null) {
    if (!tokens.some(t => match!.index >= t.start && match!.index < t.end)) {
      addToken(match.index, match.index + match[0].length, `<span class="py-string">${match[0]}</span>`);
    }
  }

  const commentPattern = /(#.*)$/gm;
  while ((match = commentPattern.exec(result)) !== null) {
    if (!tokens.some(t => match!.index >= t.start && match!.index < t.end)) {
      addToken(match.index, match.index + match[0].length, `<span class="py-comment">${match[0]}</span>`);
    }
  }

  const numberPattern = /\b(\d+\.?\d*)\b/g;
  while ((match = numberPattern.exec(result)) !== null) {
    if (!tokens.some(t => match!.index >= t.start && match!.index < t.end)) {
      addToken(match.index, match.index + match[0].length, `<span class="py-number">${match[0]}</span>`);
    }
  }

  for (const cls of frameworkClasses) {
    const pattern = new RegExp(`\\b(${cls})\\b`, 'g');
    while ((match = pattern.exec(result)) !== null) {
      if (!tokens.some(t => match!.index >= t.start && match!.index < t.end)) {
        addToken(match.index, match.index + match[0].length, `<span class="py-framework-class">${match[0]}</span>`);
      }
    }
  }

  const keywordPattern = new RegExp(`\\b(${keywords.join('|')})\\b`, 'g');
  while ((match = keywordPattern.exec(result)) !== null) {
    if (!tokens.some(t => match!.index >= t.start && match!.index < t.end)) {
      addToken(match.index, match.index + match[0].length, `<span class="py-keyword">${match[0]}</span>`);
    }
  }

  const builtinPattern = new RegExp(`\\b(${builtins.join('|')})(?=\\()`, 'g');
  while ((match = builtinPattern.exec(result)) !== null) {
    if (!tokens.some(t => match!.index >= t.start && match!.index < t.end)) {
      addToken(match.index, match.index + match[0].length, `<span class="py-builtin">${match[0]}</span>`);
    }
  }

  const frameworkPattern = new RegExp(`\\b(${frameworkFunctions.join('|')})(?=\\()`, 'g');
  while ((match = frameworkPattern.exec(result)) !== null) {
    if (!tokens.some(t => match!.index >= t.start && match!.index < t.end)) {
      addToken(match.index, match.index + match[0].length, `<span class="py-framework-func">${match[0]}</span>`);
    }
  }

  const selfPattern = /self\.(\w+)/g;
  while ((match = selfPattern.exec(result)) !== null) {
    const propStart = match.index + 5;
    const propEnd = match.index + match[0].length;
    if (!tokens.some(t => propStart >= t.start && propStart < t.end)) {
      addToken(propStart, propEnd, `<span class="py-property">${match[1]}</span>`);
    }
  }

  tokens.sort((a, b) => b.start - a.start);

  for (const token of tokens) {
    result = result.slice(0, token.start) + token.html + result.slice(token.end);
  }

  return result;
}