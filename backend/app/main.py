from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.api.v1.api import api_router
from app.db.session import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理"""
    # 启动时执行
    try:
        await init_db()
        print("数据库表创建完成！")
    except Exception as e:
        print(f"数据库初始化失败（非致命错误）: {e}")
        print("应用将继续运行，但数据库功能可能不可用")
    
    yield
    
    # 关闭时执行
    print("应用关闭")


def create_application() -> FastAPI:
    """创建FastAPI应用"""
    application = FastAPI(
        title="Crypto Backtest API",
        description="加密货币回测系统API",
        version="1.0.0",
        lifespan=lifespan
    )
    
    # 配置CORS
    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # 注册API路由
    application.include_router(api_router, prefix="/api/v1")
    
    return application


app = create_application()


@app.get("/")
async def root():
    """根路径"""
    return {"message": "Crypto Backtest API is running!"}


@app.get("/health")
async def health_check():
    """健康检查"""
    return {"status": "healthy"}
