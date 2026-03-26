import { useState, useEffect, useRef, useCallback } from 'react';
import { loadPyodide, PyodideInterface } from 'pyodide';
import './PythonEditor.css';

const PythonEditor = () => {
  const [code, setCode] = useState<string>(`# 欢迎使用 Python 在线编辑器！
# 在这里编写你的 Python 代码

print("Hello, World!")

# 试试简单的计算
a = 10
b = 20
print(f"{a} + {b} = {a + b}")

# 定义一个函数
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

print(f"斐波那契数列第10项: {fibonacci(10)}")
`);
  const [output, setOutput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const pyodideRef = useRef<PyodideInterface | null>(null);
  const outputBufferRef = useRef<string[]>([]);

  // 初始化 Pyodide
  useEffect(() => {
    const initPyodide = async () => {
      try {
        setIsLoading(true);
        const pyodide = await loadPyodide({
          indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.29.3/full/',
        });
        pyodideRef.current = pyodide;
        setOutput('Python 环境加载完成！\n');
      } catch (err) {
        setError('加载 Python 环境失败: ' + (err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    initPyodide();
  }, []);

  // 运行 Python 代码
  const runCode = useCallback(async () => {
    if (!pyodideRef.current) {
      setError('Python 环境尚未加载完成');
      return;
    }

    setIsRunning(true);
    setError('');
    outputBufferRef.current = [];
    setOutput('');

    try {
      const pyodide = pyodideRef.current;
      
      // 重定向 stdout
      pyodide.setStdout({
        batched: (text: string) => {
          outputBufferRef.current.push(text);
          setOutput(outputBufferRef.current.join(''));
        }
      });

      // 重定向 stderr
      pyodide.setStderr({
        batched: (text: string) => {
          outputBufferRef.current.push('[错误] ' + text);
          setOutput(outputBufferRef.current.join(''));
        }
      });

      // 执行代码
      await pyodide.runPythonAsync(code);
      
    } catch (err) {
      setError((err as Error).message);
      outputBufferRef.current.push('\n[执行错误] ' + (err as Error).message);
      setOutput(outputBufferRef.current.join(''));
    } finally {
      setIsRunning(false);
    }
  }, [code]);

  // 清空代码
  const clearCode = () => {
    setCode('');
    setOutput('');
    setError('');
  };

  // 清空输出
  const clearOutput = () => {
    setOutput('');
    setError('');
  };

  // 加载示例代码
  const loadExample = (type: string) => {
    const examples: Record<string, string> = {
      basic: `# 基础示例
name = "Python"
version = 3.11
print(f"欢迎使用 {name} {version}!")

# 列表操作
fruits = ["苹果", "香蕉", "橙子"]
for i, fruit in enumerate(fruits, 1):
    print(f"{i}. {fruit}")
`,
      math: `# 数学计算示例
import math

# 计算圆的面积
def circle_area(radius):
    return math.pi * radius ** 2

r = 5
print(f"半径为 {r} 的圆面积: {circle_area(r):.2f}")

# 三角函数
angle = math.pi / 4  # 45度
print(f"sin(45°) = {math.sin(angle):.4f}")
print(f"cos(45°) = {math.cos(angle):.4f}")

# 随机数
import random
print(f"随机数: {random.randint(1, 100)}")
`,
      data: `# 数据处理示例
# 创建数据
scores = [85, 92, 78, 90, 88, 95, 82, 79]

# 计算统计信息
total = sum(scores)
count = len(scores)
average = total / count
max_score = max(scores)
min_score = min(scores)

print(f"分数列表: {scores}")
print(f"总分: {total}")
print(f"平均分: {average:.2f}")
print(f"最高分: {max_score}")
print(f"最低分: {min_score}")

# 排序
sorted_scores = sorted(scores, reverse=True)
print(f"排序后: {sorted_scores}")
`,
      algorithm: `# 算法示例 - 冒泡排序
def bubble_sort(arr):
    n = len(arr)
    arr = arr.copy()
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr

# 测试
test_array = [64, 34, 25, 12, 22, 11, 90]
print(f"原始数组: {test_array}")
print(f"排序后: {bubble_sort(test_array)}")

# 二分查找
def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1

sorted_arr = sorted(test_array)
target = 22
result = binary_search(sorted_arr, target)
print(f"在 {sorted_arr} 中查找 {target}: 索引 {result}")
`
    };

    setCode(examples[type] || examples.basic);
    setOutput('');
    setError('');
  };

  return (
    <div className="python-editor">
      <div className="editor-header">
        <h1>🐍 Python 在线编程环境</h1>
        <div className="header-actions">
          <select 
            onChange={(e) => loadExample(e.target.value)}
            disabled={isLoading}
            className="example-select"
          >
            <option value="">加载示例代码...</option>
            <option value="basic">基础示例</option>
            <option value="math">数学计算</option>
            <option value="data">数据处理</option>
            <option value="algorithm">算法示例</option>
          </select>
          <button 
            onClick={clearCode} 
            disabled={isLoading}
            className="btn btn-secondary"
          >
            清空代码
          </button>
          <button 
            onClick={runCode} 
            disabled={isLoading || isRunning}
            className="btn btn-primary"
          >
            {isRunning ? '运行中...' : '▶ 运行代码'}
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>正在加载 Python 环境...</p>
        </div>
      )}

      <div className="editor-container">
        <div className="code-section">
          <div className="section-header">
            <span className="section-title">📝 代码编辑器</span>
            <span className="language-badge">Python</span>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            disabled={isLoading || isRunning}
            className="code-textarea"
            spellCheck={false}
            placeholder="在这里输入 Python 代码..."
          />
        </div>

        <div className="output-section">
          <div className="section-header">
            <span className="section-title">📤 运行结果</span>
            <button 
              onClick={clearOutput}
              className="btn btn-small btn-secondary"
            >
              清空
            </button>
          </div>
          <pre className="output-content">
            {output || '点击"运行代码"查看输出结果...'}
          </pre>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <strong>错误:</strong> {error}
        </div>
      )}

      <div className="editor-footer">
        <p>Powered by Pyodide | 在浏览器中运行 Python 代码</p>
      </div>
    </div>
  );
};

export default PythonEditor;
