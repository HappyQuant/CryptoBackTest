from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, text
from typing import Optional
from datetime import datetime, timezone

from app.core.config import settings
from app.core.rate_limiter import limiter
from app.db.session import get_async_db, async_engine
from app.models.kline import get_kline_model
from app.schemas.kline import KlineListResponse, KlineSingleResponse, KlineBatchResponse

router = APIRouter()


async def check_table_exists(symbol: str, interval: str) -> bool:
    clean_symbol = symbol.replace("-", "_").replace("/", "_").lower()
    clean_interval = interval.replace("-", "_").replace("/", "_").lower()
    table_name = f"t_kline_{clean_symbol}_{clean_interval}"

    async with async_engine.connect() as conn:
        result = await conn.execute(
            text("""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables
                    WHERE table_schema = 'public'
                    AND table_name = :table_name
                )
            """),
            {"table_name": table_name}
        )
        exists = result.scalar()
        return exists


@router.get("/symbols")
async def get_symbols():
    return {"symbols": settings.CONFIG_SYMBOLS}


@router.get("/intervals")
async def get_intervals():
    return {"intervals": settings.CONFIG_INTERVALS}


@router.get("/{symbol}/{interval}", response_model=KlineListResponse)
@limiter.limit(f"{settings.RATE_LIMIT_PER_SECOND}/second,{settings.RATE_LIMIT_PER_MINUTE}/minute")
async def get_klines(
    request: Request,
    symbol: str,
    interval: str,
    start_time: Optional[datetime] = None,
    end_time: Optional[datetime] = None,
    limit: int = Query(100, ge=1, le=1000),
    db: AsyncSession = Depends(get_async_db)
):
    if symbol not in settings.CONFIG_SYMBOLS:
        raise HTTPException(status_code=400, detail=f"Invalid symbol. Valid symbols: {settings.CONFIG_SYMBOLS}")
    if interval not in settings.CONFIG_INTERVALS:
        raise HTTPException(status_code=400, detail=f"Invalid interval. Valid intervals: {settings.CONFIG_INTERVALS}")

    if not await check_table_exists(symbol, interval):
        return {
            "symbol": symbol,
            "interval": interval,
            "count": 0,
            "data": []
        }

    KlineModel = get_kline_model(symbol, interval)

    query = select(KlineModel)

    if start_time:
        query = query.where(KlineModel.open_time > start_time)
    if end_time:
        query = query.where(KlineModel.open_time <= end_time)

    query = query.order_by(KlineModel.open_time.asc()).limit(limit)

    result = await db.execute(query)
    klines = result.scalars().all()

    return {
        "symbol": symbol,
        "interval": interval,
        "count": len(klines),
        "data": [
            {
                "open_time": kline.open_time.isoformat(),
                "open": kline.open,
                "high": kline.high,
                "low": kline.low,
                "close": kline.close,
                "volume": kline.volume,
                "close_time": kline.close_time.isoformat(),
                "quote_asset_volume": kline.quote_asset_volume,
                "number_of_trades": kline.number_of_trades,
                "taker_buy_base_asset_volume": kline.taker_buy_base_asset_volume,
                "taker_buy_quote_asset_volume": kline.taker_buy_quote_asset_volume,
            }
            for kline in klines
        ]
    }


@router.get("/{symbol}/{interval}/previous", response_model=KlineSingleResponse)
@limiter.limit(f"{settings.RATE_LIMIT_PER_SECOND}/second,{settings.RATE_LIMIT_PER_MINUTE}/minute")
async def get_previous_kline(
    request: Request,
    symbol: str,
    interval: str,
    current_time: Optional[datetime] = None,
    db: AsyncSession = Depends(get_async_db)
):
    if symbol not in settings.CONFIG_SYMBOLS:
        raise HTTPException(status_code=400, detail=f"Invalid symbol. Valid symbols: {settings.CONFIG_SYMBOLS}")
    if interval not in settings.CONFIG_INTERVALS:
        raise HTTPException(status_code=400, detail=f"Invalid interval. Valid intervals: {settings.CONFIG_INTERVALS}")

    if not await check_table_exists(symbol, interval):
        return {
            "symbol": symbol,
            "interval": interval,
            "data": None
        }

    KlineModel = get_kline_model(symbol, interval)

    if not current_time:
        current_time = datetime.now(timezone.utc)

    query = select(KlineModel).where(
        KlineModel.open_time < current_time
    ).order_by(KlineModel.open_time.desc()).limit(1)

    result = await db.execute(query)
    kline = result.scalar_one_or_none()

    if not kline:
        return {
            "symbol": symbol,
            "interval": interval,
            "data": None
        }

    return {
        "symbol": symbol,
        "interval": interval,
        "data": {
            "open_time": kline.open_time.isoformat(),
            "open": kline.open,
            "high": kline.high,
            "low": kline.low,
            "close": kline.close,
            "volume": kline.volume,
            "close_time": kline.close_time.isoformat()
        }
    }


@router.get("/{symbol}/{interval}/next", response_model=KlineSingleResponse)
@limiter.limit(f"{settings.RATE_LIMIT_PER_SECOND}/second,{settings.RATE_LIMIT_PER_MINUTE}/minute")
async def get_next_kline(
    request: Request,
    symbol: str,
    interval: str,
    current_time: Optional[datetime] = None,
    db: AsyncSession = Depends(get_async_db)
):
    if symbol not in settings.CONFIG_SYMBOLS:
        raise HTTPException(status_code=400, detail=f"Invalid symbol. Valid symbols: {settings.CONFIG_SYMBOLS}")
    if interval not in settings.CONFIG_INTERVALS:
        raise HTTPException(status_code=400, detail=f"Invalid interval. Valid intervals: {settings.CONFIG_INTERVALS}")

    if not await check_table_exists(symbol, interval):
        return {
            "symbol": symbol,
            "interval": interval,
            "data": None
        }

    KlineModel = get_kline_model(symbol, interval)

    if not current_time:
        current_time = datetime.now(timezone.utc)

    query = select(KlineModel).where(
        KlineModel.open_time > current_time
    ).order_by(KlineModel.open_time.asc()).limit(1)

    result = await db.execute(query)
    kline = result.scalar_one_or_none()

    if not kline:
        return {
            "symbol": symbol,
            "interval": interval,
            "data": None
        }

    return {
        "symbol": symbol,
        "interval": interval,
        "data": {
            "open_time": kline.open_time.isoformat(),
            "open": kline.open,
            "high": kline.high,
            "low": kline.low,
            "close": kline.close,
            "volume": kline.volume,
            "close_time": kline.close_time.isoformat()
        }
    }


@router.get("/{symbol}/{interval}/batch", response_model=KlineBatchResponse)
@limiter.limit(f"{settings.RATE_LIMIT_PER_SECOND}/second,{settings.RATE_LIMIT_PER_MINUTE}/minute")
async def get_klines_batch(
    request: Request,
    symbol: str,
    interval: str,
    start_time: datetime,
    end_time: datetime,
    db: AsyncSession = Depends(get_async_db)
):
    if symbol not in settings.CONFIG_SYMBOLS:
        raise HTTPException(status_code=400, detail=f"Invalid symbol. Valid symbols: {settings.CONFIG_SYMBOLS}")
    if interval not in settings.CONFIG_INTERVALS:
        raise HTTPException(status_code=400, detail=f"Invalid interval. Valid intervals: {settings.CONFIG_INTERVALS}")

    if not await check_table_exists(symbol, interval):
        return {
            "symbol": symbol,
            "interval": interval,
            "start_time": start_time.isoformat(),
            "end_time": end_time.isoformat(),
            "count": 0,
            "data": []
        }

    KlineModel = get_kline_model(symbol, interval)

    query = select(KlineModel).where(
        and_(
            KlineModel.open_time >= start_time,
            KlineModel.open_time <= end_time
        )
    ).order_by(KlineModel.open_time.asc())

    result = await db.execute(query)
    klines = result.scalars().all()

    return {
        "symbol": symbol,
        "interval": interval,
        "start_time": start_time.isoformat(),
        "end_time": end_time.isoformat(),
        "count": len(klines),
        "data": [
            {
                "open_time": kline.open_time.isoformat(),
                "open": kline.open,
                "high": kline.high,
                "low": kline.low,
                "close": kline.close,
                "volume": kline.volume,
                "close_time": kline.close_time.isoformat()
            }
            for kline in klines
        ]
    }