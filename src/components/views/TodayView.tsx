import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Plus,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import { DailyPlan, Trade, DailyTask, TradingAccount } from '../../types/domain';
import { initialDailyPlan } from '../../data/initialData';
import { RiskRuleConfig } from '../../core/risk/riskEngine';

interface TodayViewProps {
  dailyPlan?: DailyPlan;
  tradesToday?: Trade[];
  account?: TradingAccount;
  trades?: Trade[];
  rules?: RiskRuleConfig;
  onUpdateTasks?: (tasks: DailyTask[]) => void;
  onUpdateBias?: (bias: DailyPlan['primaryBias']) => void;
  onOpenQuickAddTrade?: () => void;
  onOpenAddTrade?: () => void;
}

export const TodayView: React.FC<TodayViewProps> = ({
  dailyPlan = initialDailyPlan,
  tradesToday,
  account,
  trades,
  rules,
  onUpdateTasks = (_tasks: DailyTask[]) => {},
  onUpdateBias = (_bias: any) => {},
  onOpenQuickAddTrade,
  onOpenAddTrade,
}) => {
  const effectiveDailyPlan = dailyPlan || initialDailyPlan;
  const effectiveTradesToday = tradesToday || trades || [];
  const handleOpenAdd = onOpenQuickAddTrade || onOpenAddTrade || (() => {});
  const [tasks, setTasks] = useState<DailyTask[]>(effectiveDailyPlan.tasks || []);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const toggleTask = (taskId: string) => {
    const updated = tasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t));
    setTasks(updated);
    onUpdateTasks(updated);
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const newTask: DailyTask = {
      id: `task_${Date.now()}`,
      dailyPlanId: effectiveDailyPlan.id,
      title: newTaskTitle.trim(),
      completed: false,
      category: 'EXECUTION',
    };
    const updated = [...tasks, newTask];
    setTasks(updated);
    onUpdateTasks(updated);
    setNewTaskTitle('');
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const progressPercent = Math.round((completedCount / (tasks.length || 1)) * 100);

  const todayNetPnL = effectiveTradesToday.reduce((acc, t) => acc + (t.netPnL ?? 0), 0);

  return (
    <div id="view-today" className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-100 tracking-tight">Today Session Terminal</h1>
            <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30 text-[10px] font-mono font-bold">
              {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Pre-market preparation, session execution boundaries & discipline protocol
          </p>
        </div>

        <button
          id="btn-today-log-trade"
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-3.5 py-2 rounded-lg transition-all shadow-md shadow-emerald-950/40 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Execute Trade Today</span>
        </button>
      </div>

      {/* Global Session Bar & Market Hours Clock */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-slate-200">Global Forex & Futures Sessions</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">Server UTC Synchronization</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-lg">
            <div className="flex justify-between items-center text-slate-400 mb-1">
              <span className="font-semibold">Sydney</span>
              <span className="text-[10px] font-mono text-slate-500">21:00 - 06:00 UTC</span>
            </div>
            <span className="text-xs font-mono text-slate-300">Quiet Range</span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-lg">
            <div className="flex justify-between items-center text-slate-400 mb-1">
              <span className="font-semibold">Tokyo</span>
              <span className="text-[10px] font-mono text-slate-500">00:00 - 09:00 UTC</span>
            </div>
            <span className="text-xs font-mono text-slate-300">Asian Liquidity Accumulation</span>
          </div>

          <div className="bg-emerald-950/20 border border-emerald-500/40 p-3 rounded-lg">
            <div className="flex justify-between items-center text-emerald-400 mb-1">
              <span className="font-bold">London Open</span>
              <span className="text-[10px] font-mono text-emerald-400">07:00 - 16:00 UTC</span>
            </div>
            <span className="text-xs font-mono text-emerald-300 font-semibold">High Momentum Expansion</span>
          </div>

          <div className="bg-blue-950/20 border border-blue-500/40 p-3 rounded-lg">
            <div className="flex justify-between items-center text-blue-400 mb-1">
              <span className="font-bold">New York</span>
              <span className="text-[10px] font-mono text-blue-400">13:00 - 22:00 UTC</span>
            </div>
            <span className="text-xs font-mono text-blue-300 font-semibold">NY Reversal & Trends</span>
          </div>
        </div>
      </div>

      {/* Bias Selector & Risk Cap */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Bias Selector */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4">
          <span className="text-xs font-bold text-slate-300 block mb-2">Daily Market Bias</span>
          <div className="grid grid-cols-3 gap-2">
            <button
              id="btn-bias-bullish"
              onClick={() => onUpdateBias('BULLISH')}
              className={`py-2 px-2 rounded-lg font-bold text-xs flex flex-col items-center gap-1 border transition-all ${
                dailyPlan.primaryBias === 'BULLISH'
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Bullish</span>
            </button>
            <button
              id="btn-bias-neutral"
              onClick={() => onUpdateBias('NEUTRAL')}
              className={`py-2 px-2 rounded-lg font-bold text-xs flex flex-col items-center gap-1 border transition-all ${
                dailyPlan.primaryBias === 'NEUTRAL'
                  ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Minus className="w-4 h-4" />
              <span>Neutral</span>
            </button>
            <button
              id="btn-bias-bearish"
              onClick={() => onUpdateBias('BEARISH')}
              className={`py-2 px-2 rounded-lg font-bold text-xs flex flex-col items-center gap-1 border transition-all ${
                dailyPlan.primaryBias === 'BEARISH'
                  ? 'bg-rose-500/20 border-rose-500 text-rose-400'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <TrendingDown className="w-4 h-4" />
              <span>Bearish</span>
            </button>
          </div>
        </div>

        {/* Trade Quota & Daily Loss Cap */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4">
          <span className="text-xs font-bold text-slate-300 block mb-2">Execution Quota</span>
          <div className="flex items-center justify-between text-xs py-1 border-b border-slate-800">
            <span className="text-slate-400">Max Trades Allowed:</span>
            <span className="font-mono font-bold text-slate-200">{dailyPlan.maxTradesAllowed} trades</span>
          </div>
          <div className="flex items-center justify-between text-xs py-1 border-b border-slate-800">
            <span className="text-slate-400">Trades Executed:</span>
            <span className="font-mono font-bold text-emerald-400">{tradesToday.length} trades</span>
          </div>
          <div className="flex items-center justify-between text-xs py-1">
            <span className="text-slate-400">Max Daily Loss Cap:</span>
            <span className="font-mono font-bold text-rose-400">${dailyPlan.maxDailyLossAllowed}</span>
          </div>
        </div>

        {/* Today's Net PnL */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-300 block mb-2">Today's Session Result</span>
          <div>
            <div className="text-2xl font-mono font-extrabold">
              <span className={todayNetPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                {todayNetPnL >= 0 ? `+$${todayNetPnL.toLocaleString()}` : `-$${Math.abs(todayNetPnL).toLocaleString()}`}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              Net of all commissions & spread fees
            </span>
          </div>
          <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1 mt-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Risk rules strictly protected</span>
          </div>
        </div>
      </div>

      {/* Daily Routine Protocol & Tasks */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Daily Trading Routine Protocol
            </h2>
            <p className="text-xs text-slate-400">
              Discipline adherence tracker: {completedCount} of {tasks.length} tasks completed ({progressPercent}%)
            </p>
          </div>
          <div className="w-28 bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Task List */}
        <div className="space-y-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              onClick={() => toggleTask(task.id)}
              className={`p-3 rounded-lg border flex items-center justify-between cursor-pointer transition-colors ${
                task.completed
                  ? 'bg-slate-900/40 border-slate-800/60 text-slate-400'
                  : 'bg-slate-900/90 border-slate-700/80 text-slate-200 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center gap-3">
                {task.completed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-500 shrink-0" />
                )}
                <span className={`text-xs ${task.completed ? 'line-through text-slate-500' : 'font-medium'}`}>
                  {task.title}
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                {task.category}
              </span>
            </div>
          ))}
        </div>

        {/* Add custom routine task */}
        <form onSubmit={addTask} className="flex gap-2 pt-2">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Add custom pre/post market discipline item..."
            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs px-4 py-2 rounded-lg transition-colors"
          >
            Add Task
          </button>
        </form>
      </div>
    </div>
  );
};
