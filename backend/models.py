from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from enum import Enum

class StrategyType(str, Enum):
    MOMENTUM = "momentum"
    MEAN_REVERSION = "mean_reversion"
    NEWS_FOLLOWER = "news_follower"
    HEDGER = "hedger"

class Position(BaseModel):
    asset: str = "CORN_FUTURE"
    quantity: float = 0.0
    entry_price: float = 0.0
    position_type: str = "long"

class StrategyParams(BaseModel):
    risk_level: float = Field(1.0, ge=0.1, le=5.0)
    entry_threshold: float = Field(2.0, ge=0.5, le=10.0)
    stop_loss: float = Field(5.0, ge=1.0, le=20.0)
    take_profit: float = Field(10.0, ge=2.0, le=50.0)

class Team(BaseModel):
    id: str
    name: str
    balance: float = 100000.0
    positions: List[Position] = []
    strategy: StrategyType = StrategyType.MOMENTUM
    parameters: StrategyParams = StrategyParams()
    pnl_history: List[float] = []
    trades_count: int = 0

class MarketEvent(BaseModel):
    type: str
    description: str
    effect: Dict[str, float]
    duration: int
    remaining: int

class MarketState(BaseModel):
    price: float
    volatility: float
    sentiment: float
    active_event: Optional[MarketEvent] = None
    tick: int = 0
    timestamp: float = 0.0

class TradeRequest(BaseModel):
    team_id: str
    action: str  # buy, sell, close
    quantity: float = 1.0
