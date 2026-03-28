from functools import wraps
from fastapi import HTTPException, Depends, Request
from app.core.config import settings
from app.core.rate_limiter import limiter


def validate_symbol_interval(func):
    @wraps(func)
    async def wrapper(*args, symbol=None, interval=None, **kwargs):
        if symbol not in settings.CONFIG_SYMBOLS:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid symbol. Valid symbols: {settings.CONFIG_SYMBOLS}"
            )
        if interval not in settings.CONFIG_INTERVALS:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid interval. Valid intervals: {settings.CONFIG_INTERVALS}"
            )
        return await func(*args, symbol=symbol, interval=interval, **kwargs)
    return wrapper
