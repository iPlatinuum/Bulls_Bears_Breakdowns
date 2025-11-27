import asyncio
import numpy as np
import time
from models import MarketState, MarketEvent, Team, Position
from events import EventGenerator
from typing import Dict


class MarketSimulator:
    def __init__(self):
        self.market_state = MarketState(
            price=500.0,
            volatility=0.02,
            sentiment=0.0,
            tick=0,
            timestamp=time.time()
        )
        self.teams: Dict[str, Team] = {}
        self.event_generator = EventGenerator()
        self.price_history = [500.0]
        self.tick_interval = 2.0

        # Ornstein-Uhlenbeck parameters
        self.theta = 0.15
        self.mu = 500.0
        self.sigma = 10.0

    async def run(self):
        """Main simulation loop"""
        while True:
            await asyncio.sleep(self.tick_interval)
            self.update_market()
            self.process_strategies()
            self.check_events()

    def update_market(self):
        """Update market price using Ornstein-Uhlenbeck process"""
        dt = 1.0
        drift = self.theta * (self.mu - self.market_state.price) * dt

        # Apply event effects
        if self.market_state.active_event:
            drift += self.market_state.active_event.effect.get("drift", 0.0)
            self.market_state.volatility = max(0.01,
                                               self.market_state.volatility +
                                               self.market_state.active_event.effect.get("volatility_change", 0.0))

        diffusion = self.sigma * np.sqrt(dt) * np.random.randn()

        new_price = self.market_state.price + drift + diffusion
        self.market_state.price = max(100.0, new_price)
        self.price_history.append(self.market_state.price)

        if len(self.price_history) > 1000:
            self.price_history.pop(0)

        self.market_state.tick += 1
        self.market_state.timestamp = time.time()

    def process_strategies(self):
        """Execute trades based on team strategies"""
        for team in self.teams.values():
            if team.strategy.value == "momentum":
                self.execute_momentum_strategy(team)
            elif team.strategy.value == "mean_reversion":
                self.execute_mean_reversion_strategy(team)
            elif team.strategy.value == "news_follower":
                self.execute_news_strategy(team)
            elif team.strategy.value == "hedger":
                self.execute_hedger_strategy(team)

            self.update_team_pnl(team)

    def execute_momentum_strategy(self, team: Team):
        """Buy on upward momentum, sell on downward"""
        if len(self.price_history) < 5:
            return

        recent_prices = self.price_history[-5:]
        price_change = (recent_prices[-1] - recent_prices[0]) / recent_prices[0] * 100

        threshold = team.parameters.entry_threshold

        if price_change > threshold and len(team.positions) == 0:
            quantity = (team.balance * team.parameters.risk_level * 0.1) / self.market_state.price
            if quantity > 0 and team.balance > quantity * self.market_state.price:
                team.positions.append(Position(
                    quantity=quantity,
                    entry_price=self.market_state.price,
                    position_type="long"
                ))
                team.balance -= quantity * self.market_state.price
                team.trades_count += 1

        elif price_change < -threshold and len(team.positions) > 0:
            for pos in team.positions:
                team.balance += pos.quantity * self.market_state.price
            team.positions.clear()

    def execute_mean_reversion_strategy(self, team: Team):
        """Buy when price is below mean, sell when above"""
        if len(self.price_history) < 20:
            return

        mean_price = np.mean(self.price_history[-20:])
        deviation = (self.market_state.price - mean_price) / mean_price * 100

        threshold = team.parameters.entry_threshold

        if deviation < -threshold and len(team.positions) == 0:
            quantity = (team.balance * team.parameters.risk_level * 0.1) / self.market_state.price
            if quantity > 0 and team.balance > quantity * self.market_state.price:
                team.positions.append(Position(
                    quantity=quantity,
                    entry_price=self.market_state.price,
                    position_type="long"
                ))
                team.balance -= quantity * self.market_state.price
                team.trades_count += 1

        elif deviation > threshold and len(team.positions) > 0:
            for pos in team.positions:
                team.balance += pos.quantity * self.market_state.price
            team.positions.clear()

    def execute_news_strategy(self, team: Team):
        """Trade based on sentiment from events"""
        if not self.market_state.active_event:
            return

        sentiment_effect = self.market_state.active_event.effect.get("sentiment", 0.0)

        if sentiment_effect > 0.5 and len(team.positions) == 0:
            quantity = (team.balance * team.parameters.risk_level * 0.15) / self.market_state.price
            if quantity > 0 and team.balance > quantity * self.market_state.price:
                team.positions.append(Position(
                    quantity=quantity,
                    entry_price=self.market_state.price,
                    position_type="long"
                ))
                team.balance -= quantity * self.market_state.price
                team.trades_count += 1

        elif sentiment_effect < -0.5 and len(team.positions) > 0:
            for pos in team.positions:
                team.balance += pos.quantity * self.market_state.price
            team.positions.clear()

    def execute_hedger_strategy(self, team: Team):
        """Conservative strategy with stop-loss"""
        # 1. Start with an empty list for positions we want to KEEP
        kept_positions = []
        
        # 2. Iterate through current positions
        for pos in team.positions:
            pnl_pct = (self.market_state.price - pos.entry_price) / pos.entry_price * 100

            # Check if we should CLOSE the trade
            if pnl_pct < -team.parameters.stop_loss or pnl_pct > team.parameters.take_profit:
                # Sell and add cash to balance immediately
                team.balance += pos.quantity * self.market_state.price
            else:
                # Keep the position
                kept_positions.append(pos)
        
        # 3. Update the team's positions list in one go
        team.positions = kept_positions

        # 4. Open new positions if we have no active trades (existing logic)
        if len(team.positions) == 0:
            if np.random.random() < 0.05:
                quantity = (team.balance * 0.05) / self.market_state.price
                if quantity > 0 and team.balance > quantity * self.market_state.price:
                    team.positions.append(Position(
                        quantity=quantity,
                        entry_price=self.market_state.price,
                        position_type="long"
                    ))
                    team.balance -= quantity * self.market_state.price
                    team.trades_count += 1

    def update_team_pnl(self, team: Team):
        """Calculate and record team P&L"""
        position_value = sum(pos.quantity * self.market_state.price for pos in team.positions)
        total_value = team.balance + position_value
        pnl = total_value - 100000.0
        team.pnl_history.append(pnl)

        if len(team.pnl_history) > 500:
            team.pnl_history.pop(0)

    def check_events(self):
        """Manage event lifecycle"""
        if self.market_state.active_event:
            self.market_state.active_event.remaining -= 1
            if self.market_state.active_event.remaining <= 0:
                self.market_state.active_event = None
                self.market_state.volatility = 0.02

        if not self.market_state.active_event and np.random.random() < 0.05:
            self.market_state.active_event = self.event_generator.generate_event()


# Global simulator instance
simulator = MarketSimulator()
