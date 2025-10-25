from fastapi import APIRouter, HTTPException
from simulation import simulator
import numpy as np

router = APIRouter()


@router.get("/")
async def get_leaderboard():
    """Get current leaderboard"""
    if not simulator:
        raise HTTPException(status_code=503, detail="Simulator not initialized")

    entries = []

    for team in simulator.teams.values():
        position_value = sum(
            pos.quantity * simulator.market_state.price
            for pos in team.positions
        )
        total_value = team.balance + position_value
        total_pnl = total_value - 100000.0

        sharpe_ratio = 0.0
        if len(team.pnl_history) > 1:
            returns = np.diff(team.pnl_history)
            if np.std(returns) > 0:
                sharpe_ratio = np.mean(returns) / np.std(returns) * np.sqrt(252)

        win_rate = 0.0
        if len(team.pnl_history) > 1:
            positive_returns = sum(1 for r in np.diff(team.pnl_history) if r > 0)
            win_rate = (positive_returns / len(np.diff(team.pnl_history))) * 100

        entries.append({
            "team_id": team.id,
            "team_name": team.name,
            "balance": team.balance,
            "total_value": total_value,
            "total_pnl": total_pnl,
            "sharpe_ratio": sharpe_ratio,
            "trades_count": team.trades_count,
            "win_rate": win_rate,
            "strategy": team.strategy.value
        })

    entries.sort(key=lambda x: x["total_value"], reverse=True)

    for i, entry in enumerate(entries):
        entry["rank"] = i + 1

    return {
        "leaderboard": entries,
        "total_teams": len(entries),
        "current_tick": simulator.market_state.tick
    }


@router.get("/stats")
async def get_market_stats():
    """Get overall market statistics"""
    if not simulator:
        raise HTTPException(status_code=503, detail="Simulator not initialized")

    total_volume = sum(
        sum(pos.quantity for pos in team.positions)
        for team in simulator.teams.values()
    )

    total_trades = sum(team.trades_count for team in simulator.teams.values())

    avg_pnl = 0
    if simulator.teams:
        total_values = [
            team.balance + sum(pos.quantity * simulator.market_state.price for pos in team.positions)
            for team in simulator.teams.values()
        ]
        avg_pnl = np.mean([v - 100000 for v in total_values])

    return {
        "total_teams": len(simulator.teams),
        "total_volume": total_volume,
        "total_trades": total_trades,
        "average_pnl": avg_pnl,
        "current_price": simulator.market_state.price,
        "market_tick": simulator.market_state.tick
    }
