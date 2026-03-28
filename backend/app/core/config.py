from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    DATABASE_URL: str = ""

    REDIS_URL: str = "redis://localhost:6379/0"

    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"

    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ]

    RATE_LIMIT_PER_SECOND: int = 30
    RATE_LIMIT_PER_MINUTE: int = 1000

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
