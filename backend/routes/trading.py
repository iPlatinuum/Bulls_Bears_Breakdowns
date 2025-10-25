from fastapi import APIRouter, HTTPException
from models import TradeRequest, Position
from simulation import simulator

router = APIRouter()


@router.post("/execute")
async def execute_trade(trade: TradeRequest):
    """Manually execute a trade"""
    if not simulator:
        raise HTTPException(status_code=503, detail="Simulator not initialized")

    if trade.team_id not in simulator.teams:
        raise HTTPException(status_code=404, detail="Team not found")

    team = simulator.teams[trade.team_id]
    current_price = simulator.market_state.price

    if trade.action == "buy":
        cost = trade.quantity * current_price
        if team.balance < cost:
            raise HTTPException(status_code=400, detail="Insufficient balance")

        team.positions.append(Position(
            quantity=trade.quantity,
            entry_price=current_price,
            position_type="long"
        ))
        team.balance -= cost
        team.trades_count += 1

        return {
            "message": "Buy order executed",
            "quantity": trade.quantity,
            "price": current_price,
            "cost": cost,
            "new_balance": team.balance
        }

    elif trade.action == "sell" or trade.action == "close":
        if not team.positions:
            raise HTTPException(status_code=400, detail="No positions to close")

        total_proceeds = 0
        positions_closed = 0

        for pos in team.positions[:]:
            proceeds = pos.quantity * current_price
            team.balance += proceeds
            total_proceeds += proceeds
            team.positions.remove(pos)
            positions_closed += 1

        return {
            "message": "Positions closed",
            "positions_closed": positions_closed,
            "proceeds": total_proceeds,
            "new_balance": team.balance
        }

    else:
        raise HTTPException(status_code=400, detail="Invalid action")


@router.get("/positions/{team_id}")
async def get_positions(team_id: str):
    """Get team's current positions"""
    if not simulator:
        raise HTTPException(status_code=503, detail="Simulator not initialized")

    if team_id not in simulator.teams:
        raise HTTPException(status_code=404, detail="Team not found")

    team = simulator.teams[team_id]
    current_price = simulator.market_state.price

    positions_with_pnl = []
    for pos in team.positions:
        unrealized_pnl = (current_price - pos.entry_price) * pos.quantity
        pnl_percent = ((current_price - pos.entry_price) / pos.entry_price) * 100

        positions_with_pnl.append({
            "quantity": pos.quantity,
            "entry_price": pos.entry_price,
            "current_price": current_price,
            "unrealized_pnl": unrealized_pnl,
            "pnl_percent": pnl_percent
        })

    return {
        "positions": positions_with_pnl,
        "total_positions": len(team.positions)
    }
