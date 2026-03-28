from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional


class KlineBase(BaseModel):
    open_time: datetime
    open: float
    high: float
    low: float
    close: float
    volume: float
    close_time: datetime
    quote_asset_volume: float = 0
    number_of_trades: int = 0
    taker_buy_base_asset_volume: float = 0
    taker_buy_quote_asset_volume: float = 0


class KlineCreate(KlineBase):
    symbol: str
    interval: str


class KlineResponse(KlineBase):
    id: int
    symbol: str
    interval: str
    
    class Config:
        from_attributes = True


class KlineListResponse(BaseModel):
    symbol: str
    interval: str
    count: int
    data: List[KlineResponse]


class KlineSingleResponse(BaseModel):
    symbol: str
    interval: str
    data: Optional[dict]


class KlineBatchResponse(BaseModel):
    symbol: str
    interval: str
    start_time: str
    end_time: str
    count: int
    data: List[dict]
