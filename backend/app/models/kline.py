from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base
from datetime import datetime


class KlineBase(Base):
    """K线数据基础模型"""
    __abstract__ = True
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    open_time: Mapped[datetime] = mapped_column(DateTime, index=True, nullable=False)
    open: Mapped[float] = mapped_column(Float, nullable=False)
    high: Mapped[float] = mapped_column(Float, nullable=False)
    low: Mapped[float] = mapped_column(Float, nullable=False)
    close: Mapped[float] = mapped_column(Float, nullable=False)
    volume: Mapped[float] = mapped_column(Float, nullable=False)
    close_time: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    quote_asset_volume: Mapped[float] = mapped_column(Float, nullable=False, default=0)
    number_of_trades: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    taker_buy_base_asset_volume: Mapped[float] = mapped_column(Float, nullable=False, default=0)
    taker_buy_quote_asset_volume: Mapped[float] = mapped_column(Float, nullable=False, default=0)
    
    def __repr__(self):
        return f"<Kline(open_time={self.open_time}, close={self.close})>"


def get_kline_model(symbol: str, interval: str):
    """
    动态创建Kline模型类
    表名格式: t_kline_{symbol}_{interval}
    例如: t_kline_BTCUSDT_1h
    """
    # 清理symbol和interval，确保表名合法
    clean_symbol = symbol.replace("-", "_").replace("/", "_")
    clean_interval = interval.replace("-", "_").replace("/", "_")
    
    table_name = f"t_kline_{clean_symbol}_{clean_interval}"
    class_name = f"Kline_{clean_symbol}_{clean_interval}"
    
    # 动态创建类
    DynamicKline = type(
        class_name,
        (KlineBase,),
        {
            "__tablename__": table_name,
            "__table_args__": {"extend_existing": True}
        }
    )
    
    return DynamicKline


# 为了兼容性，保留Kline别名
Kline = KlineBase
