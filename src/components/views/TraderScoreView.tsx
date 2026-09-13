import React from 'react';
import { Award, ShieldCheck, CheckCircle, AlertTriangle, ArrowRight, Zap } from 'lucide-react';
import { TraderScore } from '../../types/domain';

interface TraderScoreViewProps {
  score: TraderScore;
}

export const TraderScoreView: React.FC<TraderScoreViewProps> = ({ score }) => {
  const pillars = [
    {
      title: 'Strategy Adherence',
      score: score.strategyAdherenceScore,
      description: 'Execution strictly adhering to defined playbook rules and entry triggers.',
      weight: '25%',
    },
    {
      title: 'Risk Management',
      score: score.riskManagementScore,
      description: 'Position sizing discipline, stop loss placement, and avoiding oversize bets.',
      weight: '25%',
    },
    {
      title: 'Execution Quality',
      score: score.executionQualityScore,
      description: 'Precision on slippage, market orders vs limit fills, and clean trade management.',
      weight: '15%',
    },
    {
      title: 'Discipline & Rules',
      score: score.disciplineScore,
      description: 'Avoiding FOMO, revenge trading, and respect of daily trade quotas.',
      weight: '15%',
    },
    {
      title: 'Performance Consistency',
      score: score.consistencyScore,
      description: 'Smooth equity progression and controlled drawdown variance.',
      weight: '10%',
    },
    {
      title: 'Emotional Mastery',
      score: score.psychologyScore,
      description: 'Maintenance of calm, objective mindset and avoidance of tilted trading.',
      weight: '10%',
    },
  ];

  return (
    <div id="view-trader-score" className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-extrabold text-slate-100 tracking-tight">Trader Edge Score Diagnostic</h1>
          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold">
            PROCESS OVER PROFIT
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-0.5">
          Holistic 6-pillar assessment measuring systematic discipline rather than random short-term luck
        </p>
      </div>

      {/* Main Score Hero Card */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-6">
          {/* Radial score circle */}
          <div className="w-28 h-28 rounded-full bg-slate-900 border-4 border-emerald-500/80 flex flex-col items-center justify-center shadow-lg shadow-emerald-500/10">
            <span className="text-3xl font-extrabold font-mono text-emerald-400">
              {score.overallScore}
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              / 100
            </span>
          </div>

          <div>
            <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-xs font-mono font-bold">
              {score.overallScore >= 80 ? 'DISCIPLINED OPERATOR' : 'DEVELOPING EDGE'}
            </span>
            <h2 className="text-lg font-bold text-slate-100 mt-1.5">
              Comprehensive Edge Score
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 max-w-md">
              A high score reflects that you trade like an institutional fund: respecting position limits,
              executing your edge without emotional override, and treating risk as primary.
            </p>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl text-xs space-y-2 w-full md:w-auto">
          <span className="font-bold text-slate-200 block uppercase tracking-wider text-[11px]">
            Formula Weighting
          </span>
          <div className="flex justify-between text-slate-400 gap-6">
            <span>Core Discipline (Adherence + Risk):</span>
            <span className="text-emerald-400 font-bold font-mono">50%</span>
          </div>
          <div className="flex justify-between text-slate-400 gap-6">
            <span>Execution & Quotas:</span>
            <span className="text-slate-200 font-bold font-mono">30%</span>
          </div>
          <div className="flex justify-between text-slate-400 gap-6">
            <span>Consistency & Psychology:</span>
            <span className="text-slate-200 font-bold font-mono">20%</span>
          </div>
        </div>
      </div>

      {/* 6 Pillars Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pillars.map((p) => {
          const isExcellent = p.score >= 80;
          return (
            <div
              key={p.title}
              className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-slate-200 text-xs">{p.title}</span>
                  <span className="text-[10px] font-mono text-slate-500">{p.weight}</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">{p.description}</p>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-mono mb-1">
                  <span className="text-slate-400">Score:</span>
                  <span className={`font-bold ${isExcellent ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {p.score}/100
                  </span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isExcellent ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${p.score}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Actionable Recommendations Output by Engine */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2.5">
          <Zap className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Algorithmic Coaching Directives
          </h3>
        </div>

        <div className="space-y-2">
          {score.recommendations.map((rec, idx) => (
            <div
              key={idx}
              className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex items-start gap-3 text-xs text-slate-300"
            >
              <ArrowRight className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{rec}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
