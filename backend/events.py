import random
from models import MarketEvent


class EventGenerator:
    def __init__(self):
        self.events = [
            {
                "type": "drought",
                "description": "🌵 Severe drought hits Midwest corn belt",
                "effect": {"drift": 15.0, "volatility_change": 0.01, "sentiment": -0.8},
                "duration": 30
            },
            {
                "type": "policy",
                "description": "🏛️ Government announces new agriculture subsidies",
                "effect": {"drift": 8.0, "volatility_change": 0.005, "sentiment": 0.6},
                "duration": 25
            },
            {
                "type": "tech",
                "description": "🤖 AI predicts record harvest yields",
                "effect": {"drift": -10.0, "volatility_change": 0.008, "sentiment": 0.5},
                "duration": 20
            },
            {
                "type": "trade_war",
                "description": "⚠️ Trade tensions escalate with major importer",
                "effect": {"drift": -12.0, "volatility_change": 0.015, "sentiment": -0.9},
                "duration": 35
            },
            {
                "type": "weather",
                "description": "⛈️ Perfect growing conditions reported",
                "effect": {"drift": -5.0, "volatility_change": -0.005, "sentiment": 0.3},
                "duration": 15
            },
            {
                "type": "speculation",
                "description": "💰 Hedge funds increase corn futures positions",
                "effect": {"drift": 10.0, "volatility_change": 0.012, "sentiment": 0.7},
                "duration": 20
            },
            {
                "type": "disease",
                "description": "🦠 Crop disease spreads in major production areas",
                "effect": {"drift": 18.0, "volatility_change": 0.018, "sentiment": -0.85},
                "duration": 40
            },
            {
                "type": "export",
                "description": "📦 Major export deal signed with Asia",
                "effect": {"drift": 12.0, "volatility_change": 0.008, "sentiment": 0.75},
                "duration": 25
            },
            {
                "type": "energy",
                "description": "⚡ Energy prices surge, affecting production costs",
                "effect": {"drift": 7.0, "volatility_change": 0.01, "sentiment": -0.4},
                "duration": 30
            },
            {
                "type": "inventory",
                "description": "📊 Inventory reports show lower than expected stocks",
                "effect": {"drift": 9.0, "volatility_change": 0.007, "sentiment": 0.5},
                "duration": 18
            }
        ]

    def generate_event(self) -> MarketEvent:
        event_data = random.choice(self.events)
        return MarketEvent(
            type=event_data["type"],
            description=event_data["description"],
            effect=event_data["effect"],
            duration=event_data["duration"],
            remaining=event_data["duration"]
        )

