import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Target,
  Award,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  BarChart2,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import {
  Trade,
  TradingAccount,
  PropAccount,
  TraderScore,
  AICoachReport,
  Strategy,
} from '../../types/domain';
import { AnalyticsEngine } from '../../core/analytics/analyticsEngine';
import { SupportedLanguage, TRANSLATIONS } from '../../i18n/translations';

interface HomeDashboardProps {
  account?: TradingAccount;
  propAccount?: PropAccount;
  trades?: Trade[];
  strategies?: Strategy[];
  traderScore?: TraderScore;
  aiReport?: AICoachReport;
  language?: SupportedLanguage;
  onOpenQuickAddTrade?: () => void;
  onOpenAddTrade?: () => void;
  onNavigate: (view: any) => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  account,
  propAccount,
  trades = [],
  strategies = [],
  traderScore,
  aiReport,
  language = 'en',
  onOpenQuickAddTrade,
  onOpenAddTrade,
  onNavigate,
}) => {
  const safeAccount: TradingAccount = account || {
    id: 'acc_live_01',
    userId: 'usr_edge_001',
    name: 'Primary Trading Desk',
    broker: 'Interactive Brokers',
    currency: 'USD',
    accountType: 'LIVE',
    initialBalance: 100000,
    currentBalance: 100000,
    currentEquity: 100000,
    openPositionsCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const handleOpenQuickAdd = onOpenQuickAddTrade || onOpenAddTrade || (() => {});
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const summary = AnalyticsEngine.computeSummary(trades, safeAccount.initialBalance);

  // Recent 5 closed trades
  const recentTrades = trades.slice(0, 5);

  // SVG Equity curve path calculation
  const equityPoints: number[] = [safeAccount.initialBalance];
  let running = safeAccount.initialBalance;
  for (const tr of trades) {
    if (tr.status === 'CLOSED') {
      running += tr.netPnL ?? 0;
      equityPoints.push(running);
    }
  }

  const minEquity = Math.min(...equityPoints) * 0.99;
  const maxEquity = Math.max(...equityPoints) * 1.01;
  const range = maxEquity - minEquity || 1;

  const svgWidth = 600;
  const svgHeight = 160;

  const pathCoordinates = equityPoints.map((val, idx) => {
    const x = (idx / (equityPoints.length - 1 || 1)) * (svgWidth - 20) + 10;
    const y = svgHeight - ((val - minEquity) / range) * (svgHeight - 30) - 15;
    return `${x},${y}`;
  });

  const pathString = `M ${pathCoordinates.join(' L ')}`;

  return (
    <div id="view-dashboard" className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner: Edge Status & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-100 tracking-tight">
              Operating Terminal
            </h1>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold">
              EDGE ACTIVE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Systematic execution loop: BUILD → TEST → PRACTICE → TRADE → JOURNAL → ANALYZE → IMPROVE
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-dash-quick-log"
            onClick={handleOpenQuickAdd}
            className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-3.5 py-2 rounded-lg transition-all shadow-md shadow-emerald-950/40 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Log Trade Execution</span>
          </button>
        </div>
      </div>

      {/* Primary 8 Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {/* 1. Net Equity */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-3">
          <span className="text-[11px] font-medium text-slate-400 block">{t.metrics.equity}</span>
          <span className="text-base font-bold font-mono text-slate-100 mt-1 block">
            ${safeAccount.currentEquity.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5 block font-mono">
            Init: ${safeAccount.initialBalance.toLocaleString()}
          </span>
        </div>

        {/* 2. Net P&L */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-3">
          <span className="text-[11px] font-medium text-slate-400 block">{t.metrics.pnl}</span>
          <div className="flex items-center gap-1 mt-1">
            {summary.netPnL >= 0 ? (
              <ArrowUpRight className="w-4 h-4 text-emerald-400" />
            ) : (
              <ArrowDownRight className="w-4 h-4 text-rose-400" />
            )}
            <span
              className={`text-base font-bold font-mono ${
                summary.netPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {summary.netPnL >= 0 ? `+$${summary.netPnL.toLocaleString()}` : `-$${Math.abs(summary.netPnL).toLocaleString()}`}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block font-mono">
            Fees: ${summary.totalFees}
          </span>
        </div>

        {/* 3. Win Rate */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-3">
          <span className="text-[11px] font-medium text-slate-400 block">{t.metrics.winRate}</span>
          <span className="text-base font-bold font-mono text-slate-100 mt-1 block">
            {summary.winRate}%
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5 block font-mono">
            {summary.winningTrades}W / {summary.losingTrades}L
          </span>
        </div>

        {/* 4. Profit Factor */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-3">
          <span className="text-[11px] font-medium text-slate-400 block">{t.metrics.profitFactor}</span>
          <span
            className={`text-base font-bold font-mono mt-1 block ${
              summary.profitFactor >= 1.5 ? 'text-emerald-400' : 'text-slate-200'
            }`}
          >
            {summary.profitFactor}
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5 block font-mono">
            Target &gt; 1.50
          </span>
        </div>

        {/* 5. Expectancy */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-3">
          <span className="text-[11px] font-medium text-slate-400 block">{t.metrics.expectancy}</span>
          <span className="text-base font-bold font-mono text-emerald-400 mt-1 block">
            +{summary.expectancyR}R
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5 block font-mono">
            ${summary.expectancyDollars}/tr
          </span>
        </div>

        {/* 6. Drawdown */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-3">
          <span className="text-[11px] font-medium text-slate-400 block">{t.metrics.drawdown}</span>
          <span className="text-base font-bold font-mono text-amber-400 mt-1 block">
            {summary.maxDrawdownPercent}%
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5 block font-mono">
            Cap: &lt; 8.0%
          </span>
        </div>

        {/* 7. Total Trades */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-3">
          <span className="text-[11px] font-medium text-slate-400 block">{t.metrics.trades}</span>
          <span className="text-base font-bold font-mono text-slate-100 mt-1 block">
            {summary.totalTrades}
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5 block font-mono">
            Closed: {summary.closedTrades}
          </span>
        </div>

        {/* 8. Trader Score */}
        <div
          onClick={() => onNavigate('traderScore')}
          className="bg-[#0f172a] border border-emerald-500/30 hover:border-emerald-500/60 rounded-xl p-3 cursor-pointer transition-all bg-emerald-950/10"
        >
          <span className="text-[11px] font-medium text-emerald-400 block flex items-center gap-1">
            <Award className="w-3 h-3 text-emerald-400" />
            Edge Score
          </span>
          <span className="text-base font-bold font-mono text-emerald-300 mt-1 block">
            {traderScore.overallScore}/100
          </span>
          <span className="text-[10px] text-emerald-500 mt-0.5 block font-mono">
            Process Based
          </span>
        </div>
      </div>

      {/* Middle Grid: Equity Curve Chart & Prop Firm / AI Coach Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Equity Growth Chart (2 cols) */}
        <div className="lg:col-span-2 bg-[#0f172a] border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-emerald-400" />
                Sequential Equity Curve
              </h2>
              <p className="text-[11px] text-slate-400">
                True account balance evolution from trade 1 to {equityPoints.length - 1}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-slate-400">High:</span>
              <span className="text-emerald-400 font-bold">${Math.round(maxEquity).toLocaleString()}</span>
            </div>
          </div>

          {/* SVG Line Chart */}
          <div className="w-full h-44 flex items-center justify-center relative">
            {equityPoints.length > 1 ? (
              <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="w-full h-full overflow-visible"
                preserveAspectRatio="none"
              >
                {/* Subtle Grid Lines */}
                <line x1="0" y1={svgHeight * 0.25} x2={svgWidth} y2={svgHeight * 0.25} stroke="#1e293b" strokeDasharray="3 3" />
                <line x1="0" y1={svgHeight * 0.5} x2={svgWidth} y2={svgHeight * 0.5} stroke="#1e293b" strokeDasharray="3 3" />
                <line x1="0" y1={svgHeight * 0.75} x2={svgWidth} y2={svgHeight * 0.75} stroke="#1e293b" strokeDasharray="3 3" />

                {/* Primary Trend Curve */}
                <path
                  d={pathString}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Data Points */}
                {equityPoints.map((val, idx) => {
                  const x = (idx / (equityPoints.length - 1 || 1)) * (svgWidth - 20) + 10;
                  const y = svgHeight - ((val - minEquity) / range) * (svgHeight - 30) - 15;
                  return (
                    <circle
                      key={idx}
                      cx={x}
                      cy={y}
                      r="3.5"
                      fill="#0f172a"
                      stroke="#10b981"
                      strokeWidth="2"
                    />
                  );
                })}
              </svg>
            ) : (
              <div className="text-center text-xs text-slate-500">
                <AlertCircle className="w-6 h-6 mx-auto mb-1 text-slate-600" />
                No closed trades yet to construct equity progression.
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-3 border-t border-slate-800/80">
            <span>Starting Capital: ${safeAccount.initialBalance.toLocaleString()}</span>
            <span className="text-emerald-400">Current: ${safeAccount.currentEquity.toLocaleString()}</span>
          </div>
        </div>

        {/* Right: Prop Firm Desk Mode / AI Coach Snippet */}
        <div className="space-y-4">
          {/* Prop Desk Card */}
          {propAccount && (
            <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5 mb-3">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-slate-200">Prop Desk Guardian</span>
                </div>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    propAccount.status === 'SAFE'
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {propAccount.status}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>Profit Target (${propAccount.profitTargetAmount.toLocaleString()})</span>
                    <span className="font-mono text-emerald-400 font-bold">
                      ${propAccount.currentProfit} (
                      {((propAccount.currentProfit / propAccount.profitTargetAmount) * 100).toFixed(0)}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(
                          100,
                          (propAccount.currentProfit / propAccount.profitTargetAmount) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>Daily Drawdown Limit (${propAccount.maxDailyDrawdownAmount.toLocaleString()})</span>
                    <span className="font-mono text-slate-200 font-bold">
                      ${propAccount.currentDailyLoss} / ${propAccount.maxDailyDrawdownAmount}
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-500 h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(
                          100,
                          (propAccount.currentDailyLoss / propAccount.maxDailyDrawdownAmount) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AI Coach Card */}
          <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5 mb-3">
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-slate-200">AI Performance Coach</span>
              </div>
              <span className="text-[9px] font-mono text-slate-400">Structured Review</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed italic">
              &quot;{aiReport?.interpretation ||
                'Discipline and risk management maintained across initial executions. Strategy adherence is your core lever.'}&quot;
            </p>

            <button
              id="btn-dash-open-ai-coach"
              onClick={() => onNavigate('aiCoach')}
              className="mt-3 w-full py-1.5 px-2.5 rounded bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-emerald-400 text-center transition-colors block"
            >
              Open Full AI Review →
            </button>
          </div>
        </div>
      </div>

      {/* Recent Trades Section */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-100">Recent Executions</h3>
            <p className="text-xs text-slate-400">Latest recorded journal transactions</p>
          </div>
          <button
            id="btn-dash-view-all-journal"
            onClick={() => onNavigate('journal')}
            className="text-xs font-semibold text-emerald-400 hover:underline"
          >
            View All in Journal →
          </button>
        </div>

        {recentTrades.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-600" />
            No trades logged yet. Click &quot;Log Trade Execution&quot; to begin your performance record.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
                  <th className="pb-2">Instrument</th>
                  <th className="pb-2">Dir</th>
                  <th className="pb-2">Entry</th>
                  <th className="pb-2">Exit</th>
                  <th className="pb-2">Net P&L</th>
                  <th className="pb-2">R-Mult</th>
                  <th className="pb-2">Playbook</th>
                  <th className="pb-2">Emotion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {recentTrades.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 font-bold text-slate-100">{t.instrument}</td>
                    <td className="py-2.5">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          t.direction === 'LONG'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-rose-500/10 text-rose-400'
                        }`}
                      >
                        {t.direction}
                      </span>
                    </td>
                    <td className="py-2.5 text-slate-300">{t.entryPrice}</td>
                    <td className="py-2.5 text-slate-300">{t.exitPrice ?? '-'}</td>
                    <td
                      className={`py-2.5 font-bold ${
                        (t.netPnL ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {(t.netPnL ?? 0) >= 0
                        ? `+$${(t.netPnL ?? 0).toLocaleString()}`
                        : `-$${Math.abs(t.netPnL ?? 0).toLocaleString()}`}
                    </td>
                    <td className="py-2.5 font-bold text-slate-200">
                      {t.rMultiple !== undefined ? `${t.rMultiple}R` : '-'}
                    </td>
                    <td className="py-2.5">
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded ${
                          t.strategyFollowed
                            ? 'bg-emerald-950 text-emerald-400'
                            : 'bg-rose-950 text-rose-400 font-bold'
                        }`}
                      >
                        {t.strategyFollowed ? 'YES' : t.errorType}
                      </span>
                    </td>
                    <td className="py-2.5 text-slate-400">{t.psychologicalState}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
