from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, text
from typing import Optional
from datetime import datetime

from app.core.config import settings
from app.db.session import get_async_db, async_engine
from app.models.kline import get_kline_model, KlineBase
from app.schemas.kline import KlineListResponse, KlineSingleResponse, KlineBatchResponse

router = APIRouter()


async def check_table_exists(symbol: str, interval: str) -> bool:
    """检查表是否存在"""
    clean_symbol = symbol.replace("-", "_").replace("/", "_")
    clean_interval = interval.replace("-", "_").replace("/", "_")
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
    """获取所有支持的交易对"""
    return {"symbols": settings.CONFIG_SYMBOLS}


@router.get("/intervals")
async def get_intervals():
    """获取所有支持的时间周期"""
    return {"intervals": settings.CONFIG_INTERVALS}


@router.get("/{symbol}/{interval}", response_model=KlineListResponse)
async def get_klines(
    symbol: str,
    interval: str,
    start_time: Optional[datetime] = None,
    end_time: Optional[datetime] = None,
    limit: int = Query(100, ge=1, le=1000),
    db: AsyncSession = Depends(get_async_db)
):
    """获取K线数据列表"""
    # 验证参数
    if symbol not in settings.CONFIG_SYMBOLS:
        raise HTTPException(status_code=400, detail=f"Invalid symbol. Valid symbols: {settings.CONFIG_SYMBOLS}")
    if interval not in settings.CONFIG_INTERVALS:
        raise HTTPException(status_code=400, detail=f"Invalid interval. Valid intervals: {settings.CONFIG_INTERVALS}")
    
    # 检查表是否存在
    if not await check_table_exists(symbol, interval):
        return {
            "symbol": symbol,
            "interval": interval,
            "count": 0,
            "data": []
        }
    
    # 获取动态模型
    KlineModel = get_kline_model(symbol, interval)
    
    # 构建查询
    query = select(KlineModel)
    
    if start_time:
        query = query.where(KlineModel.open_time >= start_time)
    if end_time:
        query = query.where(KlineModel.open_time <= end_time)
    
    query = query.order_by(KlineModel.open_time.desc()).limit(limit)
    
    # 执行查询
    result = await db.execute(query)
    klines = result.scalars().all()
    
    return {
        "symbol": symbol,
        "interval": interval,
        "count": len(klines),
        "data": klines
    }


@router.get("/{symbol}/{interval}/previous", response_model=KlineSingleResponse)
async def get_previous_kline(
    symbol: str,
    interval: str,
    current_time: Optional[datetime] = None,
    db: AsyncSession = Depends(get_async_db)
):
    """获取前一根K线数据"""
    # 验证参数
    if symbol not in settings.CONFIG_SYMBOLS:
        raise HTTPException(status_code=400, detail=f"Invalid symbol. Valid symbols: {settings.CONFIG_SYMBOLS}")
    if interval not in settings.CONFIG_INTERVALS:
        raise HTTPException(status_code=400, detail=f"Invalid interval. Valid intervals: {settings.CONFIG_INTERVALS}")
    
    # 检查表是否存在
    if not await check_table_exists(symbol, interval):
        return {
            "symbol": symbol,
            "interval": interval,
            "data": None
        }
    
    # 获取动态模型
    KlineModel = get_kline_model(symbol, interval)
    
    # 如果没有提供当前时间，使用当前时间
    if not current_time:
        current_time = datetime.utcnow()
    
    # 查询前一根K线
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
async def get_next_kline(
    symbol: str,
    interval: str,
    current_time: Optional[datetime] = None,
    db: AsyncSession = Depends(get_async_db)
):
    """获取下一根K线数据"""
    # 验证参数
    if symbol not in settings.CONFIG_SYMBOLS:
        raise HTTPException(status_code=400, detail=f"Invalid symbol. Valid symbols: {settings.CONFIG_SYMBOLS}")
    if interval not in settings.CONFIG_INTERVALS:
        raise HTTPException(status_code=400, detail=f"Invalid interval. Valid intervals: {settings.CONFIG_INTERVALS}")
    
    # 检查表是否存在
    if not await check_table_exists(symbol, interval):
        return {
            "symbol": symbol,
            "interval": interval,
            "data": None
        }
    
    # 获取动态模型
    KlineModel = get_kline_model(symbol, interval)
    
    # 如果没有提供当前时间，使用当前时间
    if not current_time:
        current_time = datetime.utcnow()
    
    # 查询下一根K线
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
async def get_klines_batch(
    symbol: str,
    interval: str,
    start_time: datetime,
    end_time: datetime,
    db: AsyncSession = Depends(get_async_db)
):
    """批量获取K线数据（用于回测）"""
    # 验证参数
    if symbol not in settings.CONFIG_SYMBOLS:
        raise HTTPException(status_code=400, detail=f"Invalid symbol. Valid symbols: {settings.CONFIG_SYMBOLS}")
    if interval not in settings.CONFIG_INTERVALS:
        raise HTTPException(status_code=400, detail=f"Invalid interval. Valid intervals: {settings.CONFIG_INTERVALS}")
    
    # 检查表是否存在
    if not await check_table_exists(symbol, interval):
        return {
            "symbol": symbol,
            "interval": interval,
            "start_time": start_time.isoformat(),
            "end_time": end_time.isoformat(),
            "count": 0,
            "data": []
        }
    
    # 获取动态模型
    KlineModel = get_kline_model(symbol, interval)
    
    # 构建查询
    query = select(KlineModel).where(
        and_(
            KlineModel.open_time >= start_time,
            KlineModel.open_time <= end_time
        )
    ).order_by(KlineModel.open_time.asc())
    
    # 执行查询
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
