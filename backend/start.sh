#!/bin/bash

echo "=========================================="
echo "  Crypto Backtest API Backend"
echo "=========================================="
echo ""

# 检查是否安装了pipenv
if ! command -v pipenv &> /dev/null; then
    echo "[错误] 未找到 pipenv，请先安装 pipenv"
    echo "安装命令: pip install pipenv"
    exit 1
fi

echo "[信息] 正在启动后端服务..."
echo "[信息] 服务地址: http://0.0.0.0:8000"
echo "[信息] API文档: http://0.0.0.0:8000/docs"
echo "[信息] 按 Ctrl+C 停止服务"
echo ""

pipenv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload --log-level info

if [ $? -ne 0 ]; then
    echo ""
    echo "[错误] 服务启动失败"
    exit 1
fi
