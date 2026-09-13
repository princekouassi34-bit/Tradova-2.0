import React, { useState } from 'react';
import { GitBranch, Plus, CheckCircle, ShieldAlert, History, Tag, Layers } from 'lucide-react';
import { Strategy, Trade } from '../../types/domain';

interface StrategiesViewProps {
  strategies: Strategy[];
  trades: Trade[];
  onAddStrategy: (strategy: Strategy) => void;
  onBumpVersion: (strategyId: string, changeLog: string) => void;
}

export const StrategiesView: React.FC<StrategiesViewProps> = ({
  strategies,
  trades,
  onAddStrategy,
  onBumpVersion,
}) => {
  const [selectedStrategyId, setSelectedStrategyId] = useState(strategies[0]?.id || '');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newStratName, setNewStratName] = useState('');
  const [newStratDesc, setNewStratDesc] = useState('');

  const activeStrategy = strategies.find((s) => s.id === selectedStrategyId) || strategies[0];

  // Calculate performance for active strategy
  const stratTrades = trades.filter((t) => t.strategyId === activeStrategy?.id);
  const stratWins = stratTrades.filter((t) => (t.netPnL ?? 0) > 0).length;
  const stratWinRate = stratTrades.length > 0 ? ((stratWins / stratTrades.length) * 100).toFixed(1) : '0';
  const stratPnL = stratTrades.reduce((acc, t) => acc + (t.netPnL ?? 0), 0);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStratName.trim()) return;
    const newS: Strategy = {
      id: `strat_${Date.now()}`,
      userId: 'usr_edge_001',
      name: newStratName.trim(),
      description: newStratDesc.trim(),
      assetClasses: ['FOREX', 'INDICES'],
      currentVersion: 1,
      colorHex: '#10B981',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onAddStrategy(newS);
    setSelectedStrategyId(newS.id);
    setIsNewModalOpen(false);
    setNewStratName('');
    setNewStratDesc('');
  };

  return (
    <div id="view-strategies" className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-100 tracking-tight">Strategy Playbook Lab</h1>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold">
              VERSIONING ENGINE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Define, test and version your trading edge. Historical trade versions remain permanently isolated.
          </p>
        </div>

        <button
          id="btn-create-strategy"
          onClick={() => setIsNewModalOpen(true)}
          className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-3.5 py-2 rounded-lg transition-all shadow-md shadow-emerald-950/40"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>New Playbook Strategy</span>
        </button>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Strategy List */}
        <div className="space-y-3">
          <span className="text-xs font-bold text-slate-300 block uppercase tracking-wider">
            Your Playbooks ({strategies.length})
          </span>

          {strategies.map((strat) => {
            const count = trades.filter((t) => t.strategyId === strat.id).length;
            const isSelected = strat.id === selectedStrategyId;
            return (
              <div
                key={strat.id}
                id={`strat-card-${strat.id}`}
                onClick={() => setSelectedStrategyId(strat.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-slate-800/90 border-emerald-500/60 shadow-lg shadow-emerald-950/20'
                    : 'bg-[#0f172a] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-slate-100 text-xs truncate max-w-[200px]">
                    {strat.name}
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    v{strat.currentVersion}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {strat.description}
                </p>
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mt-3 pt-2 border-t border-slate-800">
                  <span>{count} trades recorded</span>
                  <span className="text-emerald-400">ACTIVE</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Selected Strategy Details, Version Control & Rules */}
        {activeStrategy && (
          <div className="lg:col-span-2 space-y-4">
            {/* Header Card */}
            <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-slate-100">{activeStrategy.name}</h2>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-xs font-mono font-bold">
                      Version {activeStrategy.currentVersion}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">{activeStrategy.description}</p>
                </div>
                <button
                  id="btn-bump-version"
                  onClick={() =>
                    onBumpVersion(
                      activeStrategy.id,
                      `Incremental rule adjustment for v${activeStrategy.currentVersion + 1}`
                    )
                  }
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-bold font-mono transition-colors flex items-center gap-1.5 shrink-0"
                >
                  <History className="w-3.5 h-3.5" />
                  <span>Release v{activeStrategy.currentVersion + 1}</span>
                </button>
              </div>

              {/* Edge Performance Metrics */}
              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-800 text-xs font-mono">
                <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Net Strategy P&L</span>
                  <span
                    className={`text-sm font-bold ${
                      stratPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {stratPnL >= 0 ? `+$${stratPnL.toLocaleString()}` : `-$${Math.abs(stratPnL).toLocaleString()}`}
                  </span>
                </div>
                <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Win Rate</span>
                  <span className="text-sm font-bold text-slate-100">{stratWinRate}%</span>
                </div>
                <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Execution Count</span>
                  <span className="text-sm font-bold text-slate-100">{stratTrades.length} trades</span>
                </div>
              </div>
            </div>

            {/* Strategy Rules & Logic Matrix */}
            <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    Execution Rules Checklist (AND Logic)
                  </h3>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">All must pass for ALLOW</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded bg-emerald-500/10 text-emerald-400 font-bold font-mono flex items-center justify-center text-xs">
                      1
                    </span>
                    <div>
                      <span className="font-bold text-slate-200">Liquidity Sweep of Key Level</span>
                      <span className="block text-[11px] text-slate-400">
                        Price must take out Asian session High or Low or previous day high/low.
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono text-[10px]">
                    MANDATORY
                  </span>
                </div>

                <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded bg-emerald-500/10 text-emerald-400 font-bold font-mono flex items-center justify-center text-xs">
                      2
                    </span>
                    <div>
                      <span className="font-bold text-slate-200">Market Structure Shift (MSS)</span>
                      <span className="block text-[11px] text-slate-400">
                        Displacement candle with body closure breaking recent 5m swing high/low.
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono text-[10px]">
                    MANDATORY
                  </span>
                </div>

                <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded bg-emerald-500/10 text-emerald-400 font-bold font-mono flex items-center justify-center text-xs">
                      3
                    </span>
                    <div>
                      <span className="font-bold text-slate-200">Fair Value Gap (FVG) Retest</span>
                      <span className="block text-[11px] text-slate-400">
                        Entry on first touch of 5m or 15m unmitigated imbalance zone.
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono text-[10px]">
                    MANDATORY
                  </span>
                </div>
              </div>

              {/* Integrity Warning */}
              <div className="p-3 rounded-lg bg-blue-950/20 border border-blue-500/30 text-xs text-blue-300 flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <span className="font-bold">Historical Integrity Guarantee:</span> Modifying rules here
                  automatically prompts a version bump. Your previous trades logged under version v
                  {activeStrategy.currentVersion} will permanently reflect that version&apos;s statistical baseline.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal: New Strategy */}
      {isNewModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsNewModalOpen(false)}
        >
          <div
            className="bg-[#0f172a] border border-slate-800 rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-sm font-bold text-slate-100">Create New Playbook Strategy</h3>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Strategy Name</label>
                <input
                  type="text"
                  value={newStratName}
                  onChange={(e) => setNewStratName(e.target.value)}
                  placeholder="e.g. New York Reversal Model"
                  className="w-full bg-slate-900 border border-slate-700 rounded-md p-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Description & Thesis</label>
                <textarea
                  value={newStratDesc}
                  onChange={(e) => setNewStratDesc(e.target.value)}
                  placeholder="Core rules, edge rationale, asset classes..."
                  rows={3}
                  className="w-full bg-slate-900 border border-slate-700 rounded-md p-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-3 py-1.5 rounded bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold"
                >
                  Save Strategy v1
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
