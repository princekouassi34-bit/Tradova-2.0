import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Trash2,
  X,
  Camera,
  CheckCircle,
  AlertCircle,
  FileText,
  SlidersHorizontal,
} from 'lucide-react';
import { Trade, Strategy } from '../../types/domain';

interface JournalViewProps {
  trades: Trade[];
  strategies: Strategy[];
  onOpenQuickAddTrade: () => void;
  onDeleteTrade: (id: string) => void;
}

export const JournalView: React.FC<JournalViewProps> = ({
  trades,
  strategies,
  onOpenQuickAddTrade,
  onDeleteTrade,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDirection, setFilterDirection] = useState<'ALL' | 'LONG' | 'SHORT'>('ALL');
  const [filterStrategy, setFilterStrategy] = useState<string>('ALL');
  const [filterOutcome, setFilterOutcome] = useState<'ALL' | 'WIN' | 'LOSS'>('ALL');
  const [filterAdherence, setFilterAdherence] = useState<'ALL' | 'FOLLOWED' | 'VIOLATED'>('ALL');
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);

  // Filtered trade list
  const filteredTrades = useMemo(() => {
    return trades.filter((tr) => {
      const matchSearch =
        tr.instrument.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (tr.notes && tr.notes.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchDir = filterDirection === 'ALL' || tr.direction === filterDirection;
      const matchStrat = filterStrategy === 'ALL' || tr.strategyId === filterStrategy;
      const matchOutcome =
        filterOutcome === 'ALL' ||
        (filterOutcome === 'WIN' && (tr.netPnL ?? 0) > 0) ||
        (filterOutcome === 'LOSS' && (tr.netPnL ?? 0) <= 0);

      const matchAdherence =
        filterAdherence === 'ALL' ||
        (filterAdherence === 'FOLLOWED' && tr.strategyFollowed) ||
        (filterAdherence === 'VIOLATED' && !tr.strategyFollowed);

      return matchSearch && matchDir && matchStrat && matchOutcome && matchAdherence;
    });
  }, [trades, searchTerm, filterDirection, filterStrategy, filterOutcome, filterAdherence]);

  const totalPnL = filteredTrades.reduce((acc, t) => acc + (t.netPnL ?? 0), 0);
  const winCount = filteredTrades.filter((t) => (t.netPnL ?? 0) > 0).length;
  const winRate = filteredTrades.length > 0 ? ((winCount / filteredTrades.length) * 100).toFixed(1) : '0';

  return (
    <div id="view-journal" className="p-4 sm:p-6 space-y-5 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-100 tracking-tight">Performance Journal</h1>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold">
              {filteredTrades.length} RECORDED
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Institutional trade logging with strategy versioning, R-multiples & discipline audit
          </p>
        </div>

        <button
          id="btn-journal-add-trade"
          onClick={onOpenQuickAddTrade}
          className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-3.5 py-2 rounded-lg transition-all shadow-md shadow-emerald-950/40"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>New Journal Entry</span>
        </button>
      </div>

      {/* Summary Filter Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#0f172a] border border-slate-800 rounded-xl p-3.5 text-xs font-mono">
        <div>
          <span className="text-slate-400 block text-[11px]">Filtered Net P&L</span>
          <span
            className={`text-base font-bold ${
              totalPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {totalPnL >= 0 ? `+$${totalPnL.toLocaleString()}` : `-$${Math.abs(totalPnL).toLocaleString()}`}
          </span>
        </div>
        <div>
          <span className="text-slate-400 block text-[11px]">Filtered Win Rate</span>
          <span className="text-base font-bold text-slate-100">{winRate}%</span>
        </div>
        <div>
          <span className="text-slate-400 block text-[11px]">Winning Trades</span>
          <span className="text-base font-bold text-emerald-400">{winCount}</span>
        </div>
        <div>
          <span className="text-slate-400 block text-[11px]">Losing Trades</span>
          <span className="text-base font-bold text-rose-400">{filteredTrades.length - winCount}</span>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-3.5 flex flex-wrap items-center gap-2.5 text-xs">
        {/* Search */}
        <div className="relative flex-1 min-w-[180px]">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
          <input
            id="journal-search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search instrument, notes..."
            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-xs"
          />
        </div>

        {/* Direction Filter */}
        <select
          id="journal-filter-direction"
          value={filterDirection}
          onChange={(e) => setFilterDirection(e.target.value as any)}
          className="bg-slate-900 border border-slate-700 text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500 text-xs"
        >
          <option value="ALL">All Directions</option>
          <option value="LONG">Longs Only</option>
          <option value="SHORT">Shorts Only</option>
        </select>

        {/* Strategy Filter */}
        <select
          id="journal-filter-strategy"
          value={filterStrategy}
          onChange={(e) => setFilterStrategy(e.target.value)}
          className="bg-slate-900 border border-slate-700 text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500 text-xs"
        >
          <option value="ALL">All Strategies</option>
          {strategies.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} (v{s.currentVersion})
            </option>
          ))}
        </select>

        {/* Outcome Filter */}
        <select
          id="journal-filter-outcome"
          value={filterOutcome}
          onChange={(e) => setFilterOutcome(e.target.value as any)}
          className="bg-slate-900 border border-slate-700 text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500 text-xs"
        >
          <option value="ALL">All Outcomes</option>
          <option value="WIN">Winners</option>
          <option value="LOSS">Losers</option>
        </select>

        {/* Adherence Filter */}
        <select
          id="journal-filter-adherence"
          value={filterAdherence}
          onChange={(e) => setFilterAdherence(e.target.value as any)}
          className="bg-slate-900 border border-slate-700 text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500 text-xs"
        >
          <option value="ALL">All Discipline</option>
          <option value="FOLLOWED">Playbook Respected</option>
          <option value="VIOLATED">Rule Breached</option>
        </select>
      </div>

      {/* Main Journal Table */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        {filteredTrades.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-600" />
            No trades match the selected criteria or no entries logged.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-900/80 border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Instrument</th>
                  <th className="py-3 px-3">Direction</th>
                  <th className="py-3 px-3">Strategy Version</th>
                  <th className="py-3 px-3">Entry</th>
                  <th className="py-3 px-3">Exit</th>
                  <th className="py-3 px-3">Net P&L</th>
                  <th className="py-3 px-3">R-Multiple</th>
                  <th className="py-3 px-3">Playbook Adherence</th>
                  <th className="py-3 px-3">Session</th>
                  <th className="py-3 px-3">Emotion</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filteredTrades.map((tr) => {
                  const strat = strategies.find((s) => s.id === tr.strategyId);
                  return (
                    <tr
                      key={tr.id}
                      onClick={() => setSelectedTrade(tr)}
                      className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-3 text-slate-400 text-[11px]">
                        {new Date(tr.entryTime).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-100">{tr.instrument}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            tr.direction === 'LONG'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {tr.direction}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-[11px] text-slate-300">
                          {strat ? strat.name.substring(0, 16) + '...' : 'Discretionary'}
                        </span>
                        <span className="ml-1 px-1 rounded bg-slate-800 text-[9px] text-slate-400">
                          v{tr.strategyVersionNumber}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-300">{tr.entryPrice}</td>
                      <td className="py-3 px-3 text-slate-300">{tr.exitPrice ?? '-'}</td>
                      <td
                        className={`py-3 px-3 font-bold ${
                          (tr.netPnL ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {(tr.netPnL ?? 0) >= 0
                          ? `+$${(tr.netPnL ?? 0).toLocaleString()}`
                          : `-$${Math.abs(tr.netPnL ?? 0).toLocaleString()}`}
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-200">
                        {tr.rMultiple !== undefined ? `${tr.rMultiple}R` : '-'}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            tr.strategyFollowed
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-900'
                              : 'bg-rose-950 text-rose-400 border border-rose-900'
                          }`}
                        >
                          {tr.strategyFollowed ? 'FOLLOWED' : tr.errorType}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-[11px] text-slate-400">{tr.session}</td>
                      <td className="py-3 px-3 text-[11px] text-slate-400">{tr.psychologicalState}</td>
                      <td className="py-3 px-3 text-right">
                        <button
                          id={`btn-delete-trade-${tr.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteTrade(tr.id);
                          }}
                          className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                          title="Delete trade"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Trade Detail Drawer / Inspection Modal */}
      {selectedTrade && (
        <div
          id="trade-detail-drawer"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setSelectedTrade(null)}
        >
          <div
            className="bg-[#0f172a] border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl my-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded text-xs font-bold font-mono ${
                    selectedTrade.direction === 'LONG'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-rose-500/20 text-rose-400'
                  }`}
                >
                  {selectedTrade.direction}
                </span>
                <h3 className="text-base font-bold text-slate-100 font-mono">
                  {selectedTrade.instrument} Detailed Audit
                </h3>
              </div>
              <button
                id="btn-close-trade-drawer"
                onClick={() => setSelectedTrade(null)}
                className="p-1 rounded-md text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              {/* Financial Snapshot */}
              <div className="grid grid-cols-3 gap-2 bg-slate-900/80 p-3 rounded-lg border border-slate-800 font-mono">
                <div>
                  <span className="text-slate-400 block text-[10px]">Net P&L</span>
                  <span
                    className={`text-base font-bold ${
                      (selectedTrade.netPnL ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {(selectedTrade.netPnL ?? 0) >= 0
                      ? `+$${(selectedTrade.netPnL ?? 0).toLocaleString()}`
                      : `-$${Math.abs(selectedTrade.netPnL ?? 0).toLocaleString()}`}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">R-Multiple</span>
                  <span className="text-base font-bold text-slate-100">
                    {selectedTrade.rMultiple ?? 0}R
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Risk Amount</span>
                  <span className="text-base font-bold text-slate-100">
                    ${selectedTrade.riskAmount}
                  </span>
                </div>
              </div>

              {/* Execution Levels */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-300 font-mono">
                <div className="bg-slate-900 p-2 rounded border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">Entry</span>
                  <span className="font-bold">{selectedTrade.entryPrice}</span>
                </div>
                <div className="bg-slate-900 p-2 rounded border border-slate-800">
                  <span className="text-rose-400 text-[10px] block">Stop Loss</span>
                  <span className="font-bold text-rose-300">{selectedTrade.stopLossPrice}</span>
                </div>
                <div className="bg-slate-900 p-2 rounded border border-slate-800">
                  <span className="text-emerald-400 text-[10px] block">Take Profit</span>
                  <span className="font-bold text-emerald-300">
                    {selectedTrade.takeProfitPrice ?? '-'}
                  </span>
                </div>
                <div className="bg-slate-900 p-2 rounded border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">Exit Price</span>
                  <span className="font-bold">{selectedTrade.exitPrice ?? '-'}</span>
                </div>
              </div>

              {/* Process & Discipline Audit */}
              <div className="space-y-2 bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                <span className="font-bold text-slate-200 block">Execution Discipline Audit</span>
                <div className="flex justify-between items-center py-1 border-b border-slate-800">
                  <span className="text-slate-400">Playbook Followed:</span>
                  <span
                    className={`font-bold ${
                      selectedTrade.strategyFollowed ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {selectedTrade.strategyFollowed ? 'YES (100% Rule Adherence)' : `NO (${selectedTrade.errorType})`}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-800">
                  <span className="text-slate-400">Psychological State:</span>
                  <span className="font-semibold text-slate-200">{selectedTrade.psychologicalState}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-400">Market Session:</span>
                  <span className="font-semibold text-slate-200">{selectedTrade.session}</span>
                </div>
              </div>

              {/* Screenshot Slots */}
              <div>
                <span className="font-bold text-slate-200 block mb-2">Trade Chart Screenshots</span>
                <div className="grid grid-cols-3 gap-2">
                  <div className="h-24 rounded-lg bg-slate-900 border border-slate-800 flex flex-col items-center justify-center text-slate-500 gap-1 hover:border-slate-700 transition-colors cursor-pointer">
                    <Camera className="w-5 h-5 text-slate-400" />
                    <span className="text-[10px] text-slate-400">Before Entry</span>
                  </div>
                  <div className="h-24 rounded-lg bg-slate-900 border border-slate-800 flex flex-col items-center justify-center text-slate-500 gap-1 hover:border-slate-700 transition-colors cursor-pointer">
                    <Camera className="w-5 h-5 text-slate-400" />
                    <span className="text-[10px] text-slate-400">In Trade Management</span>
                  </div>
                  <div className="h-24 rounded-lg bg-slate-900 border border-slate-800 flex flex-col items-center justify-center text-slate-500 gap-1 hover:border-slate-700 transition-colors cursor-pointer">
                    <Camera className="w-5 h-5 text-slate-400" />
                    <span className="text-[10px] text-slate-400">After Exit</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedTrade.notes && (
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <span className="font-bold text-slate-400 block text-[10px] mb-1 uppercase tracking-wider">
                    Trader Rationale & Retrospective Notes
                  </span>
                  <p className="text-slate-200 leading-relaxed">{selectedTrade.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
