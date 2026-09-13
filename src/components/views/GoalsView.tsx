import React, { useState } from 'react';
import { Target, CheckCircle2, Plus, Calendar, Award } from 'lucide-react';
import { Goal } from '../../types/domain';

interface GoalsViewProps {
  goals: Goal[];
  onAddGoal: (goal: Goal) => void;
  onUpdateGoalProgress: (goalId: string, value: number) => void;
}

export const GoalsView: React.FC<GoalsViewProps> = ({
  goals,
  onAddGoal,
  onUpdateGoalProgress,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<Goal['type']>('PROCESS');
  const [targetValue, setTargetValue] = useState('90');
  const [unit, setUnit] = useState('%');
  const [deadline, setDeadline] = useState('2026-09-30');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const newG: Goal = {
      id: `g_${Date.now()}`,
      userId: 'usr_edge_001',
      title: title.trim(),
      description: description.trim(),
      type,
      period: 'MONTHLY',
      targetValue: parseFloat(targetValue) || 100,
      currentValue: 0,
      unit,
      achieved: false,
      deadline,
      createdAt: new Date().toISOString(),
    };
    onAddGoal(newG);
    setIsModalOpen(false);
    setTitle('');
    setDescription('');
  };

  return (
    <div id="view-goals" className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-100 tracking-tight">Discipline & Goals</h1>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold">
              PROCESS MILESTONES
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Focus on execution and risk habits rather than vanity metrics. Consistency breeds probability.
          </p>
        </div>

        <button
          id="btn-add-goal"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-3.5 py-2 rounded-lg transition-all shadow-md shadow-emerald-950/40"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>New Goal Commitment</span>
        </button>
      </div>

      {/* Goal Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {goals.map((g) => {
          const progress = Math.min(100, Math.round((g.currentValue / (g.targetValue || 1)) * 100));
          const isComplete = g.currentValue >= g.targetValue;
          return (
            <div
              key={g.id}
              className={`bg-[#0f172a] border rounded-xl p-5 flex flex-col justify-between space-y-4 ${
                isComplete ? 'border-emerald-500/50' : 'border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      g.type === 'PROCESS'
                        ? 'bg-blue-500/20 text-blue-400'
                        : g.type === 'DISCIPLINE'
                        ? 'bg-purple-500/20 text-purple-400'
                        : 'bg-emerald-500/20 text-emerald-400'
                    }`}
                  >
                    {g.type}
                  </span>
                  {isComplete ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 font-mono">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>ACHIEVED</span>
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-mono">
                      Due: {g.deadline ? g.deadline : 'Continuous'}
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-slate-100">{g.title}</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{g.description}</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Progress:</span>
                  <span className="font-bold text-slate-200">
                    {g.currentValue} / {g.targetValue} {g.unit} ({progress}%)
                  </span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isComplete ? 'bg-emerald-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: New Goal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-[#0f172a] border border-slate-800 rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-sm font-bold text-slate-100">Add Goal Commitment</h3>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Goal Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 100% Stop Loss Placement on All Trades"
                  className="w-full bg-slate-900 border border-slate-700 rounded-md p-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as Goal['type'])}
                  className="w-full bg-slate-900 border border-slate-700 rounded-md p-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="PROCESS">Process Goal</option>
                  <option value="DISCIPLINE">Discipline Goal</option>
                  <option value="PROFIT_MILESTONE">Profit Milestone</option>
                  <option value="RISK_REDUCTION">Risk Reduction</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Target Value</label>
                  <input
                    type="number"
                    value={targetValue}
                    onChange={(e) => setTargetValue(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-md p-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Unit</label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="%, trades, $"
                    className="w-full bg-slate-900 border border-slate-700 rounded-md p-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Why does this goal strengthen your operational edge?"
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
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
