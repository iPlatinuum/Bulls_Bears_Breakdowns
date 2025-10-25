from fastapi import APIRouter, HTTPException
from models import Team, StrategyType, StrategyParams
from simulation import simulator
from typing import List

router = APIRouter()


@router.post("/create")
async def create_team(team: Team):
    """Create a new team"""
    if not simulator:
        raise HTTPException(status_code=503, detail="Simulator not initialized")

    if team.id in simulator.teams:
        raise HTTPException(status_code=400, detail="Team ID already exists")

    simulator.teams[team.id] = team
    return {"message": "Team created successfully", "team": team}


@router.get("/{team_id}")
async def get_team(team_id: str):
    """Get team information"""
    if not simulator:
        raise HTTPException(status_code=503, detail="Simulator not initialized")

    if team_id not in simulator.teams:
        raise HTTPException(status_code=404, detail="Team not found")

    return simulator.teams[team_id]


@router.get("/")
async def get_all_teams():
    """Get all teams"""
    if not simulator:
        raise HTTPException(status_code=503, detail="Simulator not initialized")

    return list(simulator.teams.values())


@router.put("/{team_id}/strategy")
async def update_strategy(team_id: str, strategy: StrategyType, parameters: StrategyParams):
    """Update team's trading strategy"""
    if not simulator:
        raise HTTPException(status_code=503, detail="Simulator not initialized")

    if team_id not in simulator.teams:
        raise HTTPException(status_code=404, detail="Team not found")

    team = simulator.teams[team_id]
    team.strategy = strategy
    team.parameters = parameters

    return {"message": "Strategy updated", "team": team}


@router.delete("/{team_id}")
async def delete_team(team_id: str):
    """Delete a team"""
    if not simulator:
        raise HTTPException(status_code=503, detail="Simulator not initialized")

    if team_id not in simulator.teams:
        raise HTTPException(status_code=404, detail="Team not found")

    del simulator.teams[team_id]
    return {"message": "Team deleted successfully"}
