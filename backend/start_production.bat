@echo off
chcp 65001 >nul
echo ==========================================
echo   Crypto Backtest API Backend (Production)
echo ==========================================
echo.

REM 检查是否安装了pipenv
pipenv --version >nul 2>&1
if errorlevel 1 (
    echo [错误] 未找到 pipenv，请先安装 pipenv
    echo 安装命令: pip install pipenv
    pause
    exit /b 1
)

echo [信息] 正在启动后端服务（生产模式）...
echo [信息] 服务地址: http://0.0.0.0:8000
echo [信息] API文档: http://0.0.0.0:8000/docs
echo [信息] 按 Ctrl+C 停止服务
echo.

REM 生产模式：多worker，关闭reload
pipenv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4 --log-level info

if errorlevel 1 (
    echo.
    echo [错误] 服务启动失败
    pause
)
