import React from 'react';
import { BarChart3, TrendingUp, ShieldCheck, PieChart, Activity } from 'lucide-react';
import { Trade, Strategy } from '../../types/domain';
import { AnalyticsEngine } from '../../core/analytics/analyticsEngine';

interface AnalyticsViewProps {
  trades: Trade[];
  strategies: Strategy[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ trades, strategies }) => {
  const summary = AnalyticsEngine.computeSummary(trades, 100000);
  const sessionStats = AnalyticsEngine.computeSessionStats(trades);
  const emotionStats = AnalyticsEngine.computeEmotionStats(trades);
  const rBuckets = AnalyticsEngine.computeRDistribution(trades);

  return (
    <div id="view-analytics" className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-extrabold text-slate-100 tracking-tight">Statistical Edge Analytics</h1>
          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold">
            ADVANCED QUANT METRICS
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-0.5">
          Mathematical validation of trade expectancy, risk-adjusted returns & behavioral variance
        </p>
      </div>

      {/* Quant Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-xs font-mono">
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-3.5">
          <span className="text-slate-400 block text-[10px]">Sharpe Ratio</span>
          <span className="text-lg font-bold text-slate-100 mt-1 block">{summary.sharpeRatio}</span>
          <span className="text-[10px] text-slate-500">Benchmark &gt; 1.0</span>
        </div>

        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-3.5">
          <span className="text-slate-400 block text-[10px]">Sortino Ratio</span>
          <span className="text-lg font-bold text-emerald-400 mt-1 block">{summary.sortinoRatio}</span>
          <span className="text-[10px] text-slate-500">Downside deviation</span>
        </div>

        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-3.5">
          <span className="text-slate-400 block text-[10px]">Profit Factor</span>
          <span className="text-lg font-bold text-emerald-400 mt-1 block">{summary.profitFactor}</span>
          <span className="text-[10px] text-slate-500">Gross Win / Gross Loss</span>
        </div>

        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-3.5">
          <span className="text-slate-400 block text-[10px]">Expectancy (R)</span>
          <span className="text-lg font-bold text-emerald-400 mt-1 block">+{summary.expectancyR}R</span>
          <span className="text-[10px] text-slate-500">${summary.expectancyDollars} / trade</span>
        </div>

        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-3.5">
          <span className="text-slate-400 block text-[10px]">Max Drawdown</span>
          <span className="text-lg font-bold text-amber-400 mt-1 block">{summary.maxDrawdownPercent}%</span>
          <span className="text-[10px] text-slate-500">${summary.maxDrawdownDollars} peak-to-trough</span>
        </div>

        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-3.5">
          <span className="text-slate-400 block text-[10px]">Recovery Factor</span>
          <span className="text-lg font-bold text-slate-100 mt-1 block">{summary.recoveryFactor}</span>
          <span className="text-[10px] text-slate-500">Net PnL / Max DD</span>
        </div>
      </div>

      {/* R-Distribution & Streaks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: R-Multiple Distribution Histogram (2 cols) */}
        <div className="lg:col-span-2 bg-[#0f172a] border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                R-Multiple Distribution Profile
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Risk Normalized Outcomes</span>
          </div>

          <div className="space-y-2 pt-2 text-xs font-mono">
            {rBuckets.map((b) => {
              const maxCount = Math.max(...rBuckets.map((x) => x.count), 1);
              const barWidth = Math.round((b.count / maxCount) * 100);
              const isProfit = !b.bucket.includes('-');
              return (
                <div key={b.bucket} className="flex items-center gap-3">
                  <span className="w-20 text-slate-400 text-right shrink-0">{b.bucket}</span>
                  <div className="flex-1 bg-slate-900 h-5 rounded overflow-hidden flex items-center p-0.5 border border-slate-800">
                    <div
                      className={`h-full rounded transition-all ${
                        isProfit ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${Math.max(barWidth, b.count > 0 ? 5 : 0)}%` }}
                    />
                  </div>
                  <span className="w-8 text-slate-200 font-bold text-left">{b.count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Streak & Average metrics */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 space-y-4 text-xs font-mono">
          <span className="font-bold text-slate-200 uppercase tracking-wider block border-b border-slate-800 pb-2">
            Execution Velocity
          </span>

          <div className="space-y-2.5">
            <div className="flex justify-between text-slate-400">
              <span>Avg Winning Trade:</span>
              <span className="font-bold text-emerald-400">+${summary.averageWin}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Avg Losing Trade:</span>
              <span className="font-bold text-rose-400">-${summary.averageLoss}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Win/Loss Payoff Ratio:</span>
              <span className="font-bold text-slate-100">{summary.winLossRatio}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Max Consecutive Wins:</span>
              <span className="font-bold text-emerald-400">{summary.consecutiveWins}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Max Consecutive Losses:</span>
              <span className="font-bold text-rose-400">{summary.consecutiveLosses}</span>
            </div>
            <div className="flex justify-between text-slate-400 pt-2 border-t border-slate-800">
              <span>Total Fees Paid:</span>
              <span className="font-bold text-slate-200">${summary.totalFees}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Session Breakdown & Behavioral Emotion Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Session Breakdown */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 space-y-3 text-xs">
          <span className="font-bold text-slate-200 uppercase tracking-wider block border-b border-slate-800 pb-2">
            Performance by Market Session
          </span>

          <table className="w-full text-left font-mono">
            <thead>
              <tr className="text-slate-500 uppercase text-[10px] border-b border-slate-800">
                <th className="pb-1.5">Session</th>
                <th className="pb-1.5">Trades</th>
                <th className="pb-1.5">Win Rate</th>
                <th className="pb-1.5 text-right">Net P&L</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {sessionStats.map((s) => (
                <tr key={s.groupKey} className="py-2">
                  <td className="py-2 text-slate-300 font-bold">{s.label}</td>
                  <td className="py-2 text-slate-400">{s.tradesCount}</td>
                  <td className="py-2 text-slate-200">{s.winRate}%</td>
                  <td
                    className={`py-2 text-right font-bold ${
                      s.netPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {s.netPnL >= 0 ? `+$${s.netPnL.toLocaleString()}` : `-$${Math.abs(s.netPnL).toLocaleString()}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Emotion Breakdown */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 space-y-3 text-xs">
          <span className="font-bold text-slate-200 uppercase tracking-wider block border-b border-slate-800 pb-2">
            Performance by Psychological State
          </span>

          <table className="w-full text-left font-mono">
            <thead>
              <tr className="text-slate-500 uppercase text-[10px] border-b border-slate-800">
                <th className="pb-1.5">Emotional State</th>
                <th className="pb-1.5">Trades</th>
                <th className="pb-1.5">Win Rate</th>
                <th className="pb-1.5 text-right">Net P&L</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {emotionStats.map((em) => (
                <tr key={em.groupKey} className="py-2">
                  <td className="py-2 text-slate-300 font-bold">{em.label}</td>
                  <td className="py-2 text-slate-400">{em.tradesCount}</td>
                  <td className="py-2 text-slate-200">{em.winRate}%</td>
                  <td
                    className={`py-2 text-right font-bold ${
                      em.netPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {em.netPnL >= 0 ? `+$${em.netPnL.toLocaleString()}` : `-$${Math.abs(em.netPnL).toLocaleString()}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
