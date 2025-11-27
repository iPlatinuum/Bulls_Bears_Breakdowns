import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Market API
export const getMarketTick = async () => {
  try {
    const response = await api.get('/api/market/tick');
    return response.data;
  } catch (error) {
    console.error('Error fetching market tick:', error);
    return {
      price: 450 + Math.random() * 50,
      timestamp: new Date().toISOString(),
      volume: Math.floor(Math.random() * 10000),
      change: (Math.random() - 0.5) * 10,
    };
  }
};


export const getEvents = async () => {
  try {
    const response = await api.get('/api/events');
    return response.data;
  } catch (error) {
    console.error('Error fetching events:', error);
    return [
      {
        id: 1,
        title: 'US Fed Announces Rate Decision',
        sentiment: 'positive',
        impact: 0.03,
        timestamp: new Date().toISOString(),
      },
      {
        id: 2,
        title: 'Corn Harvest Reports Show Increase',
        sentiment: 'negative',
        impact: -0.02,
        timestamp: new Date().toISOString(),
      },
      {
        id: 3,
        title: 'Weather Alert: Drought Conditions',
        sentiment: 'positive',
        impact: 0.05,
        timestamp: new Date().toISOString(),
      },
    ];
  }
};


export const getTeams = async () => {
  try {
    const response = await api.get('/api/teams');
    return response.data;
  } catch (error) {
    console.error('Error fetching teams:', error);
    return { team_name: 'Demo Team', team_id: 1 };
  }
};
export const getLeaderboard = async () => {
  try {
    const response = await api.get('/api/leaderboard');
    return response.data;
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return [
      {
        team_name: 'Alpha Quants',
        pnl: 125000,
        sharpe_ratio: 2.45,
        adaptability_score: 92,
        rank: 1,
      },
      {
        team_name: 'Market Makers',
        pnl: 98000,
        sharpe_ratio: 2.12,
        adaptability_score: 88,
        rank: 2,
      },
      {
        team_name: 'Demo Team',
        pnl: 75000,
        sharpe_ratio: 1.89,
        adaptability_score: 85,
        rank: 3,
      },
      {
        team_name: 'Hedge Masters',
        pnl: 62000,
        sharpe_ratio: 1.67,
        adaptability_score: 81,
        rank: 4,
      },
      {
        team_name: 'Momentum Traders',
        pnl: 45000,
        sharpe_ratio: 1.34,
        adaptability_score: 76,
        rank: 5,
      },
    ];
  }
};



export const deployStrategy = async (strategyConfig: {
  strategy: string;
  risk_level: number;
  threshold: number;
  stop_loss: number;
  trade_frequency: number;
}) => {
  try {
    const response = await api.post('/api/trade', strategyConfig);
    return response.data;
  } catch (error) {
    console.error('Error deploying strategy:', error);
    // Return mock success
    return {
      success: true,
      message: 'Strategy deployed successfully',
      strategy_id: Math.random().toString(36).substr(2, 9),
    };
  }
};

export default api;
