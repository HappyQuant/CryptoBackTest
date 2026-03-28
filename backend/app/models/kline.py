from sqlalchemy import Column, Integer, String, Float, DateTime, Index, Numeric, TypeDecorator, BigInteger
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql.expression import func
from app.db.base import Base
from datetime import datetime, timezone


class MillisecondTimestamp(TypeDecorator):
    impl = BigInteger
    cache_ok = True

    def process_result_value(self, value, dialect):
        if value is None:
            return None
        return datetime.fromtimestamp(value / 1000, tz=timezone.utc)

    def process_bind_param(self, value, dialect):
        if value is None:
            return None
        if isinstance(value, datetime):
            return int(value.timestamp() * 1000)
        return value


class KlineBase(Base):
    __abstract__ = True

    open_time: Mapped[datetime] = mapped_column(MillisecondTimestamp, primary_key=True, index=True, nullable=False)
    open_price: Mapped[float] = mapped_column(Numeric(20, 8), nullable=False)
    high_price: Mapped[float] = mapped_column(Numeric(20, 8), nullable=False)
    low_price: Mapped[float] = mapped_column(Numeric(20, 8), nullable=False)
    close_price: Mapped[float] = mapped_column(Numeric(20, 8), nullable=False)
    base_volume: Mapped[float] = mapped_column(Numeric(20, 8), nullable=False)
    close_time: Mapped[datetime] = mapped_column(MillisecondTimestamp, nullable=False)
    quote_volume: Mapped[float] = mapped_column(Numeric(20, 8), nullable=True, default=0)
    trades_count: Mapped[int] = mapped_column(Integer, nullable=True, default=0)
    taker_buy_base_volume: Mapped[float] = mapped_column(Numeric(20, 8), nullable=True, default=0)
    taker_buy_quote_volume: Mapped[float] = mapped_column(Numeric(20, 8), nullable=True, default=0)
    reserved: Mapped[str] = mapped_column(String, nullable=True, default='')

    @property
    def open(self) -> float:
        return float(self.open_price)

    @property
    def high(self) -> float:
        return float(self.high_price)

    @property
    def low(self) -> float:
        return float(self.low_price)

    @property
    def close(self) -> float:
        return float(self.close_price)

    @property
    def volume(self) -> float:
        return float(self.base_volume)

    @property
    def quote_asset_volume(self) -> float:
        return float(self.quote_volume)

    @property
    def number_of_trades(self) -> int:
        return int(self.trades_count)

    @property
    def taker_buy_base_asset_volume(self) -> float:
        return float(self.taker_buy_base_volume)

    @property
    def taker_buy_quote_asset_volume(self) -> float:
        return float(self.taker_buy_quote_volume)

    def __repr__(self):
        return f"<Kline(open_time={self.open_time}, close={self.close})>"


_kline_model_cache = {}


def get_kline_model(symbol: str, interval: str):
    clean_symbol = symbol.replace("-", "_").replace("/", "_").lower()
    clean_interval = interval.replace("-", "_").replace("/", "_").lower()
    cache_key = f"{clean_symbol}_{clean_interval}"

    if cache_key in _kline_model_cache:
        return _kline_model_cache[cache_key]

    table_name = f"t_kline_{clean_symbol}_{clean_interval}"
    class_name = f"Kline_{clean_symbol}_{clean_interval}"

    DynamicKline = type(
        class_name,
        (KlineBase,),
        {
            "__tablename__": table_name,
            "__table_args__": (
                Index(f"idx_{cache_key}_open_time", "open_time"),
                Index(f"idx_{cache_key}_close_time", "close_time"),
            )
        }
    )

    _kline_model_cache[cache_key] = DynamicKline
    return DynamicKline