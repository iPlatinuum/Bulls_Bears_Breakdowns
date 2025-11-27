import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

export const api = {
  // Market
  getTick: () => axios.get(`${API_URL}/market/tick`),
  getHistory: () => axios.get(`${API_URL}/market/history?limit=50`),
  
  // Teams
  createTeam: (name) => {
    // Generating a random ID for the hackathon simplicity
    const id = `team_${Math.floor(Math.random() * 10000)}`;
    return axios.post(`${API_URL}/teams/create`, {
      id: id,
      name: name,
      balance: 100000.0,
      positions: [],
      strategy: "momentum",
      parameters: {
        risk_level: 1.0,
        entry_threshold: 2.0,
        stop_loss: 5.0,
        take_profit: 10.0
      }
    });
  },
  
  getTeam: (id) => axios.get(`${API_URL}/teams/${id}`),
  
  updateStrategy: (id, strategy, params) => 
    axios.put(`${API_URL}/teams/${id}/strategy?strategy=${strategy}`, params),
};