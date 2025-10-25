from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import asyncio
from routes import market, teams, trading, leaderboard
from simulation import simulator

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Start the market simulator
    task = asyncio.create_task(simulator.run())
    yield
    # Shutdown: Cancel the simulator task
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        pass

app = FastAPI(title="AI Hedge Fund Challenge API", version="1.0.0", lifespan=lifespan)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(market.router, prefix="/api/market", tags=["market"])
app.include_router(teams.router, prefix="/api/teams", tags=["teams"])
app.include_router(trading.router, prefix="/api/trade", tags=["trading"])
app.include_router(leaderboard.router, prefix="/api/leaderboard", tags=["leaderboard"])

@app.get("/")
async def root():
    return {
        "message": "AI Hedge Fund Challenge API",
        "status": "running",
        "version": "1.0.0"
    }

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "simulator_running": simulator is not None,
        "current_tick": simulator.market_state.tick if simulator else 0,
        "teams_count": len(simulator.teams) if simulator else 0
    }

