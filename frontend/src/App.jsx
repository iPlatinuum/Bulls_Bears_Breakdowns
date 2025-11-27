import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { AlertTriangle, TrendingUp, Activity, DollarSign, Settings, Zap } from 'lucide-react';
import { api } from './services/api';
import Login from './components/Login';

const App = () => {
  // --- STATE ---
  const [team, setTeam] = useState(null);
  const [marketData, setMarketData] = useState([]);
  const [currentTick, setCurrentTick] = useState(null);
  const [activeEvent, setActiveEvent] = useState(null);
  
  // Strategy Form State
  const [strategyType, setStrategyType] = useState('momentum');
  const [params, setParams] = useState({
    risk_level: 1.0,
    entry_threshold: 2.0,
    stop_loss: 5.0,
    take_profit: 10.0
  });

  // Notification State
  const [lastTradeCount, setLastTradeCount] = useState(0);
  const [notification, setNotification] = useState(null);

  // --- EFFECTS ---

  // 1. Check LocalStorage on Load
  useEffect(() => {
    const savedTeamId = localStorage.getItem('vitalyze_team_id');
    if (savedTeamId) {
      fetchTeamData(savedTeamId);
    }
  }, []);

  // 2. Polling Loop (The Heartbeat)
  useEffect(() => {
    if (!team) return;

    const interval = setInterval(async () => {
      try {
        // Parallel fetching for speed
        const [tickRes, teamRes] = await Promise.all([
          api.getTick(),
          api.getTeam(team.id)
        ]);

        // Update Market State
        const tick = tickRes.data;
        setCurrentTick(tick);
        setActiveEvent(tick.active_event);
        
        // Update Chart History (Keep last 50 points)
        setMarketData(prev => {
          const newData = [...prev, { tick: tick.tick, price: tick.price }];
          return newData.slice(-50); 
        });

        // Update Team State
        const updatedTeam = teamRes.data;
        
        // Check for new trades for notifications
        if (updatedTeam.trades_count > lastTradeCount) {
          showNotification("TRADE EXECUTED");
          setLastTradeCount(updatedTeam.trades_count);
        }
        
        setTeam(updatedTeam);

      } catch (error) {
        console.error("Polling error", error);
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(interval);
  }, [team, lastTradeCount]);

  // --- HELPERS ---

  const handleLogin = async (name) => {
    const res = await api.createTeam(name);
    localStorage.setItem('vitalyze_team_id', res.data.team.id);
    setTeam(res.data.team);
  };

  const fetchTeamData = async (id) => {
    try {
      const res = await api.getTeam(id);
      setTeam(res.data);
      setLastTradeCount(res.data.trades_count);
    } catch (e) {
      localStorage.removeItem('vitalyze_team_id'); // Invalid ID
    }
  };

  const handleUpdateStrategy = async () => {
    try {
      await api.updateStrategy(team.id, strategyType, params);
      showNotification("STRATEGY UPDATED SUCCESSFULLY");
    } catch (e) {
      showNotification("ERROR UPDATING STRATEGY");
    }
  };

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // --- RENDER ---

  if (!team) return <Login onLogin={handleLogin} />;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 font-sans pb-20">
      
      {/* HEADER / EVENT BANNER */}
      <div className="sticky top-0 z-50">
        <div className="bg-gray-900 border-b border-gray-800 p-4 flex justify-between items-center shadow-lg">
          <div className="flex items-center gap-2 text-green-500 font-bold text-xl">
            <Zap /> VITALYZE.AI <span className="text-gray-500 text-sm font-normal">| {team.name}</span>
          </div>
          <div className="flex gap-6 text-sm">
            <div className="flex flex-col items-end">
              <span className="text-gray-500">BALANCE</span>
              <span className="text-xl font-mono text-white">${team.balance.toFixed(2)}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-gray-500">P&L</span>
              <span className={`text-xl font-mono ${team.balance + (team.positions.reduce((a, b) => a + (b.quantity * (currentTick?.price || 0)), 0)) - 100000 >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                ${(team.balance + (team.positions.reduce((a, b) => a + (b.quantity * (currentTick?.price || 0)), 0)) - 100000).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* ACTIVE EVENT NOTICE */}
        {activeEvent ? (
          <div className="bg-red-900/90 text-white px-4 py-2 flex items-center justify-center gap-2 animate-pulse font-bold border-b border-red-500">
            <AlertTriangle size={18} />
            MARKET EVENT: {activeEvent.description} (Duration: {activeEvent.remaining} ticks)
          </div>
        ) : (
          <div className="bg-green-900/30 text-green-400 px-4 py-1 text-center text-xs border-b border-green-900/50">
            MARKET STABLE - NORMAL TRADING CONDITIONS
          </div>
        )}
      </div>

      {/* NOTIFICATION TOAST */}
      {notification && (
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-xl z-50 flex items-center gap-2 animate-bounce">
          <Activity size={20} />
          {notification}
        </div>
      )}

      <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COL: CHART & MARKET INFO */}
        <div className="lg:col-span-2 space-y-6">
          {/* CHART */}
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 shadow-xl">
            <div className="flex justify-between mb-4">
              <h2 className="text-lg font-bold flex items-center gap-2"><TrendingUp size={20}/> CORN FUTURES</h2>
              <div className="text-right">
                <div className="text-2xl font-mono text-white">${currentTick?.price?.toFixed(2)}</div>
                <div className="text-xs text-gray-500">VOLATILITY: {(currentTick?.volatility * 100).toFixed(2)}%</div>
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={marketData}>
                  <XAxis dataKey="tick" hide />
                  <YAxis domain={['auto', 'auto']} stroke="#4b5563" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151' }}
                    itemStyle={{ color: '#10b981' }}
                  />
                  <ReferenceLine y={currentTick?.price} stroke="green" strokeDasharray="3 3" />
                  <Line type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={2} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* POSITIONS TABLE */}
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <h3 className="text-gray-400 text-sm font-bold mb-4 uppercase tracking-wider">Active Positions</h3>
            {team.positions.length === 0 ? (
              <div className="text-center py-8 text-gray-600 italic">No active positions</div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-gray-500 border-b border-gray-800">
                    <th className="pb-2">ASSET</th>
                    <th className="pb-2">TYPE</th>
                    <th className="pb-2">ENTRY</th>
                    <th className="pb-2">QTY</th>
                    <th className="pb-2">UNREALIZED P&L</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {team.positions.map((pos, i) => {
                     const pnl = (currentTick?.price - pos.entry_price) * pos.quantity;
                     return (
                      <tr key={i} className="hover:bg-gray-800/50">
                        <td className="py-3 font-mono">{pos.asset}</td>
                        <td className="py-3 text-green-400 uppercase">{pos.position_type}</td>
                        <td className="py-3 text-gray-400">${pos.entry_price.toFixed(2)}</td>
                        <td className="py-3">{pos.quantity.toFixed(4)}</td>
                        <td className={`py-3 font-bold ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          ${pnl.toFixed(2)}
                        </td>
                      </tr>
                     )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* RIGHT COL: STRATEGY BUILDER */}
        <div className="space-y-6">
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 sticky top-24">
            <div className="flex items-center gap-2 mb-6 text-blue-400">
              <Settings size={20} />
              <h2 className="font-bold">STRATEGY CONTROL</h2>
            </div>

            <div className="space-y-5">
              {/* Strategy Selector */}
              <div>
                <label className="block text-xs text-gray-500 mb-1 uppercase">Algorithm</label>
                <select 
                  value={strategyType}
                  onChange={(e) => setStrategyType(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-700 rounded p-2 text-white focus:border-blue-500 outline-none"
                >
                  <option value="momentum">MOMENTUM</option>
                  <option value="mean_reversion">MEAN REVERSION</option>
                  <option value="news_follower">NEWS FOLLOWER</option>
                  <option value="hedger">HEDGER (SAFE)</option>
                </select>
              </div>

              {/* Sliders */}
              <div>
                <label className="flex justify-between text-xs text-gray-500 mb-1 uppercase">
                  <span>Risk Multiplier</span>
                  <span className="text-white">{params.risk_level}x</span>
                </label>
                <input 
                  type="range" min="0.1" max="5.0" step="0.1"
                  value={params.risk_level}
                  onChange={(e) => setParams({...params, risk_level: parseFloat(e.target.value)})}
                  className="w-full accent-blue-500 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <label className="flex justify-between text-xs text-gray-500 mb-1 uppercase">
                  <span>Entry Threshold</span>
                  <span className="text-white">{params.entry_threshold}%</span>
                </label>
                <input 
                  type="range" min="0.5" max="10.0" step="0.5"
                  value={params.entry_threshold}
                  onChange={(e) => setParams({...params, entry_threshold: parseFloat(e.target.value)})}
                  className="w-full accent-blue-500 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1 uppercase">Stop Loss %</label>
                  <input 
                    type="number" 
                    value={params.stop_loss}
                    onChange={(e) => setParams({...params, stop_loss: parseFloat(e.target.value)})}
                    className="w-full bg-gray-950 border border-gray-700 rounded p-2 text-white text-right"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1 uppercase">Take Profit %</label>
                  <input 
                    type="number" 
                    value={params.take_profit}
                    onChange={(e) => setParams({...params, take_profit: parseFloat(e.target.value)})}
                    className="w-full bg-gray-950 border border-gray-700 rounded p-2 text-white text-right"
                  />
                </div>
              </div>

              <button 
                onClick={handleUpdateStrategy}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-lg transition-all mt-4 flex justify-center items-center gap-2"
              >
                <Zap size={18} /> DEPLOY STRATEGY
              </button>
            </div>
          </div>
          
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
             <h3 className="text-gray-500 text-xs font-bold uppercase mb-2">System Status</h3>
             <div className="flex justify-between text-sm py-1 border-b border-gray-800">
               <span>Server Tick</span>
               <span className="font-mono text-green-400">{currentTick?.tick || 0}</span>
             </div>
             <div className="flex justify-between text-sm py-1 border-b border-gray-800">
               <span>API Latency</span>
               <span className="font-mono text-green-400">12ms</span>
             </div>
             <div className="flex justify-between text-sm py-1 pt-2">
               <span>Total Trades</span>
               <span className="font-mono text-white">{team.trades_count}</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;