from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # 数据库配置（使用异步驱动）
    DATABASE_URL: str = "postgresql+asyncpg://postgres:password@localhost:5432/cryptobacktest"
    
    # Redis缓存配置
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # CORS配置
    CORS_ORIGINS: List[str] = ["*"]
    
    # 交易对配置
    CONFIG_SYMBOLS: List[str] = [
        "BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT", "XRPUSDT",
        "ADAUSDT", "DOGEUSDT", "AVAXUSDT", "DOTUSDT", "MATICUSDT",
    ]
    
    # 时间周期配置
    CONFIG_INTERVALS: List[str] = ["1m", "3m", "5m", "15m", "30m", "1h", "2h", "4h", "6h", "8h", "12h", "1d", "3d", "1w", "1M"]
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
