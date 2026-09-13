import React, { useState } from 'react';
import { Brain, Smile, AlertCircle, Plus, Info, TrendingUp, TrendingDown } from 'lucide-react';
import { PsychologyEntry, Trade, EmotionalState } from '../../types/domain';

interface PsychologyViewProps {
  entries: PsychologyEntry[];
  trades: Trade[];
  onAddEntry: (entry: PsychologyEntry) => void;
}

export const PsychologyView: React.FC<PsychologyViewProps> = ({
  entries,
  trades,
  onAddEntry,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mood, setMood] = useState(8);
  const [confidence, setConfidence] = useState(8);
  const [stress, setStress] = useState(3);
  const [fatigue, setFatigue] = useState(2);
  const [emotion, setEmotion] = useState<EmotionalState>('Calm');
  const [notes, setNotes] = useState('');

  // Performance vs Emotions calculation
  const emotionsList: EmotionalState[] = [
    'Calm',
    'Confident',
    'FOMO',
    'Revenge',
    'Fear',
    'Neutral',
    'Frustration',
  ];

  const emotionPerformance = emotionsList.map((em) => {
    const matchingTrades = trades.filter((t) => t.psychologicalState === em);
    const winTrades = matchingTrades.filter((t) => (t.netPnL ?? 0) > 0);
    const winRate = matchingTrades.length > 0 ? Math.round((winTrades.length / matchingTrades.length) * 100) : 0;
    const netPnL = matchingTrades.reduce((acc, t) => acc + (t.netPnL ?? 0), 0);
    return { emotion: em, count: matchingTrades.length, winRate, netPnL };
  }).filter((x) => x.count > 0);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newE: PsychologyEntry = {
      id: `psy_${Date.now()}`,
      userId: 'usr_edge_001',
      date: new Date().toISOString().split('T')[0],
      moodRating: mood,
      confidenceRating: confidence,
      stressRating: stress,
      fatigueRating: fatigue,
      concentrationRating: 8,
      primaryEmotion: emotion,
      notes,
      createdAt: new Date().toISOString(),
    };
    onAddEntry(newE);
    setIsModalOpen(false);
    setNotes('');
  };

  return (
    <div id="view-psychology" className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-100 tracking-tight">Behavioral & Mindset Audit</h1>
            <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/30 text-[10px] font-mono font-bold">
              BEHAVIORAL VARIANCE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Objective correlation between mental state, emotional trigger and trade execution quality
          </p>
        </div>

        <button
          id="btn-log-mindset"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-3.5 py-2 rounded-lg transition-all shadow-md shadow-emerald-950/40"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Record Session Mindset</span>
        </button>
      </div>

      {/* Scope Disclaimer Banner */}
      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3 text-xs text-slate-400">
        <Info className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <span className="font-bold text-slate-200">Behavioral Performance Scope:</span> This module provides
          non-clinical, objective tracking of cognitive states specifically related to trading execution. It does not
          provide psychological diagnoses.
        </p>
      </div>

      {/* Emotion vs Financial Outcome Table */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-purple-400" />
            <h2 className="text-sm font-bold text-slate-100">Emotional State Correlation to Financial Edge</h2>
          </div>
          <span className="text-[10px] font-mono text-slate-400">Direct Journal Aggregation</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <th className="pb-2">Emotional State</th>
                <th className="pb-2">Recorded Trades</th>
                <th className="pb-2">Win Rate</th>
                <th className="pb-2">Net Realized P&L</th>
                <th className="pb-2">Impact Assessment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {emotionPerformance.map((em) => {
                const isPositive = em.netPnL >= 0;
                return (
                  <tr key={em.emotion} className="py-2.5">
                    <td className="py-2.5 font-bold text-slate-200">{em.emotion}</td>
                    <td className="py-2.5 text-slate-400">{em.count} trades</td>
                    <td className="py-2.5 text-slate-200">{em.winRate}%</td>
                    <td
                      className={`py-2.5 font-bold ${
                        isPositive ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isPositive ? `+$${em.netPnL.toLocaleString()}` : `-$${Math.abs(em.netPnL).toLocaleString()}`}
                    </td>
                    <td className="py-2.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          em.emotion === 'Calm' || em.emotion === 'Confident'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-900'
                            : 'bg-rose-950 text-rose-400 border border-rose-900'
                        }`}
                      >
                        {em.emotion === 'Calm' || em.emotion === 'Confident'
                          ? 'HIGH EDGE ZONE'
                          : 'NEGATIVE EXPECTANCY'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mindset Journal Entries */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-slate-100">Session Mental Logs</h3>
        <div className="space-y-3">
          {entries.map((entry) => (
            <div key={entry.id} className="p-4 rounded-lg bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200 font-mono">{entry.date}</span>
                <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 font-bold text-[10px]">
                  {entry.primaryEmotion}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2 font-mono text-slate-400 text-[11px]">
                <span>Mood: {entry.moodRating}/10</span>
                <span>Confidence: {entry.confidenceRating}/10</span>
                <span>Stress: {entry.stressRating}/10</span>
                <span>Fatigue: {entry.fatigueRating}/10</span>
              </div>
              {entry.notes && <p className="text-slate-300 italic pt-1">&quot;{entry.notes}&quot;</p>}
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-[#0f172a] border border-slate-800 rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-sm font-bold text-slate-100">Log Session Psychological State</h3>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Primary Emotional State</label>
                <select
                  value={emotion}
                  onChange={(e) => setEmotion(e.target.value as EmotionalState)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-md p-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  {emotionsList.map((e) => (
                    <option key={e} value={e}>
                      {e}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Mood (1-10):</span>
                  <span className="font-mono text-slate-200">{mood}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={mood}
                  onChange={(e) => setMood(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Confidence (1-10):</span>
                  <span className="font-mono text-slate-200">{confidence}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={confidence}
                  onChange={(e) => setConfidence(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Stress Level (1-10):</span>
                  <span className="font-mono text-slate-200">{stress}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={stress}
                  onChange={(e) => setStress(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Pre/Post Session Mindset Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="How does your physiology feel? Any distractions or urge to overtrade?"
                  rows={3}
                  className="w-full bg-slate-900 border border-slate-700 rounded-md p-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 rounded bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold"
                >
                  Save Mindset Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
