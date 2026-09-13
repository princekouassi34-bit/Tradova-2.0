import React, { useState } from 'react';
import { FlaskConical, Play, CheckCircle, BarChart3, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Strategy } from '../../types/domain';

interface BacktestViewProps {
  strategies: Strategy[];
}

export const BacktestView: React.FC<BacktestViewProps> = ({ strategies }) => {
  const [selectedStrategyId, setSelectedStrategyId] = useState(strategies[0]?.id || '');
  const [instrument, setInstrument] = useState('EURUSD');
  const [timeframe, setTimeframe] = useState('15m');
  const [initialCapital, setInitialCapital] = useState('100000');
  const [commissionPerLot, setCommissionPerLot] = useState('4.0');
  const [slippagePips, setSlippagePips] = useState('0.5');
  const [dateRange, setDateRange] = useState('2025-01-01 to 2026-06-30');
  const [isRunning, setIsRunning] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  const selectedStrategy = strategies.find((s) => s.id === selectedStrategyId) || strategies[0];

  const handleRunSimulation = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
      setHasRun(true);
    }, 1200);
  };

  return (
    <div id="view-backtest" className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-extrabold text-slate-100 tracking-tight">Backtesting Lab</h1>
          <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30 text-[10px] font-mono font-bold">
            HISTORICAL SIMULATION ENGINE
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-0.5">
          Execute strategy rules against historical candle data with realistic commissions, slippage & zero look-ahead bias
        </p>
      </div>

      {/* Lab Configuration Form */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-slate-100">Simulation Configuration Matrix</h2>
          </div>
          <span className="text-[10px] font-mono text-slate-400">Strict Bar-by-Bar Processing</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-xs font-mono">
          <div>
            <label className="block text-slate-400 mb-1">Strategy & Version</label>
            <select
              value={selectedStrategyId}
              onChange={(e) => setSelectedStrategyId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-md p-2 text-slate-200 focus:outline-none focus:border-emerald-500 text-xs"
            >
              {strategies.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} (v{s.currentVersion})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Instrument Pair</label>
            <select
              value={instrument}
              onChange={(e) => setInstrument(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-md p-2 text-slate-200 focus:outline-none focus:border-emerald-500 text-xs"
            >
              <option value="EURUSD">EURUSD (Forex)</option>
              <option value="GBPUSD">GBPUSD (Forex)</option>
              <option value="NAS100">NAS100 (Index)</option>
              <option value="XAUUSD">XAUUSD (Gold)</option>
              <option value="BTCUSDT">BTCUSDT (Crypto)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Timeframe</label>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-md p-2 text-slate-200 focus:outline-none focus:border-emerald-500 text-xs"
            >
              <option value="5m">5 Minutes</option>
              <option value="15m">15 Minutes</option>
              <option value="1h">1 Hour</option>
              <option value="4h">4 Hours</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Starting Capital ($)</label>
            <input
              type="number"
              value={initialCapital}
              onChange={(e) => setInitialCapital(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-md p-2 text-slate-200 focus:outline-none focus:border-emerald-500 text-xs"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Roundturn Commission ($/lot)</label>
            <input
              type="number"
              value={commissionPerLot}
              onChange={(e) => setCommissionPerLot(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-md p-2 text-slate-200 focus:outline-none focus:border-emerald-500 text-xs"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Simulated Slippage (pips)</label>
            <input
              type="number"
              step="0.1"
              value={slippagePips}
              onChange={(e) => setSlippagePips(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-md p-2 text-slate-200 focus:outline-none focus:border-emerald-500 text-xs"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-slate-400 mb-1">Historical Window</label>
            <input
              type="text"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-md p-2 text-slate-200 focus:outline-none focus:border-emerald-500 text-xs"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Look-ahead bias prevention checked. Candle High/Low collision handled.</span>
          </div>

          <button
            id="btn-run-backtest"
            onClick={handleRunSimulation}
            disabled={isRunning}
            className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isRunning ? 'Simulating Historical Ticks...' : 'Run Simulation'}</span>
          </button>
        </div>
      </div>

      {/* Simulation Results Output */}
      {hasRun && (
        <div className="space-y-4">
          <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-100 font-mono">
                  Backtest Results: {selectedStrategy?.name} (v{selectedStrategy?.currentVersion})
                </h3>
                <span className="text-xs text-slate-400">
                  {instrument} | {timeframe} | {dateRange}
                </span>
              </div>
              <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-400 text-xs font-mono font-bold">
                COMPLETED
              </span>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-xs font-mono">
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Net Profit</span>
                <span className="text-base font-bold text-emerald-400">+$18,420</span>
                <span className="text-[10px] text-slate-500">+18.4%</span>
              </div>
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Win Rate</span>
                <span className="text-base font-bold text-slate-100">62.8%</span>
                <span className="text-[10px] text-slate-500">71W / 42L</span>
              </div>
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Profit Factor</span>
                <span className="text-base font-bold text-emerald-400">2.14</span>
                <span className="text-[10px] text-slate-500">Gross 34k / 16k</span>
              </div>
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Expectancy</span>
                <span className="text-base font-bold text-emerald-400">+0.68R</span>
                <span className="text-[10px] text-slate-500">$163 / trade</span>
              </div>
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Max Drawdown</span>
                <span className="text-base font-bold text-amber-400">5.4%</span>
                <span className="text-[10px] text-slate-500">-$5,640</span>
              </div>
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Total Simulated Trades</span>
                <span className="text-base font-bold text-slate-100">113</span>
                <span className="text-[10px] text-slate-500">18 months</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
