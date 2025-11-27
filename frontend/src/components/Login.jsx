import React, { useState } from 'react';
import { Terminal } from 'lucide-react';

const Login = ({ onLogin }) => {
  const [teamName, setTeamName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!teamName) return;
    setLoading(true);
    try {
      await onLogin(teamName);
    } catch (err) {
      alert("Failed to join market: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 font-mono">
      <div className="bg-gray-900 border border-gray-700 p-8 rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center gap-3 mb-6 text-green-400">
          <Terminal size={32} />
          <h1 className="text-2xl font-bold tracking-wider">VITALYZE.AI // TRADER</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-400 text-sm mb-2">IDENTIFIER</label>
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Enter Team Name"
              className="w-full bg-gray-950 border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-green-500 transition-colors"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50"
          >
            {loading ? 'INITIALIZING...' : 'CONNECT TO MAINFRAME'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;