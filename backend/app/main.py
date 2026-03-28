from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.core.config import settings
from app.core.rate_limiter import limiter
from app.api.v1.api import api_router
from app.db.session import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        await init_db()
        print("数据库表创建完成！")
    except Exception as e:
        print(f"数据库初始化失败（非致命错误）: {e}")
        print("应用将继续运行，但数据库功能可能不可用")

    yield

    from app.core.redis import close_redis
    await close_redis()
    print("Redis连接已关闭")


def create_application() -> FastAPI:
    application = FastAPI(
        title="Crypto Backtest API",
        description="加密货币回测系统API",
        version="1.0.0",
        lifespan=lifespan
    )

    application.state.limiter = limiter
    application.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    application.include_router(api_router, prefix="/api/v1")

    return application


app = create_application()


@app.get("/")
async def root():
    return {"message": "Crypto Backtest API is running!"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
