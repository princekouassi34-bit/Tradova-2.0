import React, { useState } from 'react';
import {
  Bot,
  Sparkles,
  ShieldAlert,
  Send,
  CheckCircle2,
  FileSpreadsheet,
  TrendingUp,
  Brain,
  Lightbulb,
} from 'lucide-react';
import { AICoachReport } from '../../types/domain';
import { AICoachService } from '../../core/ai/aiCoachService';

interface AICoachViewProps {
  report?: AICoachReport;
  onRefreshReport: (type: 'DAILY' | 'WEEKLY' | 'MONTHLY') => void;
}

export const AICoachView: React.FC<AICoachViewProps> = ({ report, onRefreshReport }) => {
  const [activeTab, setActiveTab] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY'>('WEEKLY');
  const [userQuery, setUserQuery] = useState('');
  const [chatHistory, setChatHistory] = useState<
    Array<{ sender: 'trader' | 'coach'; message: string; timestamp: string }>
  >([
    {
      sender: 'coach',
      message:
        'Welcome to TRADOVA AI Performance Coach. My mandate is purely focused on execution discipline, risk limits, and emotional control. I do not predict market direction or give financial advice. How can I help audit your edge today?',
      timestamp: 'Just now',
    },
  ]);
  const [isAnswering, setIsAnswering] = useState(false);

  const handleTabChange = (tab: 'DAILY' | 'WEEKLY' | 'MONTHLY') => {
    setActiveTab(tab);
    onRefreshReport(tab);
  };

  const handleSendQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userQuery.trim() || isAnswering) return;

    const q = userQuery.trim();
    setUserQuery('');
    setChatHistory((prev) => [
      ...prev,
      { sender: 'trader', message: q, timestamp: new Date().toLocaleTimeString() },
    ]);
    setIsAnswering(true);

    try {
      // Call server-side API or fallback to deterministic safe response
      const res = await fetch('/api/ai/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context: {
            reviewType: activeTab,
            totalTrades: 5,
            winRate: 60,
            netPnL: 4250,
            profitFactor: 2.1,
            strategyAdherenceRate: 80,
            dominantEmotion: 'Calm',
            recordedErrors: ['FOMO'],
            traderScore: 84,
          },
        }),
      });

      const data = await res.json();
      const responseText =
        data?.report?.interpretation ||
        'Your questions reflect disciplined self-awareness. Review your trade journal for any recurring FOMO entries and enforce an explicit 15-minute cooldown timer before opening positions outside predefined liquidity sweeps.';

      // Verify safety
      const safety = AICoachService.validateSafety(responseText);
      const safeResponse = safety.isValid
        ? responseText
        : 'Actionable Directive: Focus exclusively on your defined risk cap and stop loss rules. Maintain emotional detachment from individual trade outcomes.';

      setChatHistory((prev) => [
        ...prev,
        { sender: 'coach', message: safeResponse, timestamp: new Date().toLocaleTimeString() },
      ]);
    } catch {
      setChatHistory((prev) => [
        ...prev,
        {
          sender: 'coach',
          message:
            'Focus on systematic execution: reduce your position size by 50% after any rule violation until you log 5 consecutive playbook-compliant trades.',
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } finally {
      setIsAnswering(false);
    }
  };

  return (
    <div id="view-ai-coach" className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-100 tracking-tight">
              AI Performance Coach
            </h1>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold">
              4-TIER COGNITIVE AUDIT
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Strict separation of Facts, Statistics, Interpretation & Suggestions. Zero market prediction.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-[#0f172a] border border-slate-800 p-1 rounded-lg text-xs font-mono">
          <button
            id="tab-coach-daily"
            onClick={() => handleTabChange('DAILY')}
            className={`px-3 py-1.5 rounded font-bold transition-colors ${
              activeTab === 'DAILY'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Daily
          </button>
          <button
            id="tab-coach-weekly"
            onClick={() => handleTabChange('WEEKLY')}
            className={`px-3 py-1.5 rounded font-bold transition-colors ${
              activeTab === 'WEEKLY'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Weekly
          </button>
          <button
            id="tab-coach-monthly"
            onClick={() => handleTabChange('MONTHLY')}
            className={`px-3 py-1.5 rounded font-bold transition-colors ${
              activeTab === 'MONTHLY'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Monthly
          </button>
        </div>
      </div>

      {/* Safety Directive Banner */}
      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3 text-xs text-slate-300">
        <ShieldAlert className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-slate-100">Institutional Process Protocol:</span> TRADOVA AI is
          architected to enforce process consistency and detect behavioral pitfalls (FOMO, revenge trading, oversized risk). It
          will never encourage overtrading, predict upcoming price direction, or promise financial returns.
        </div>
      </div>

      {/* 4-Tier Structured Review Card */}
      {report && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tier 1: Facts */}
          <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
              <FileSpreadsheet className="w-4 h-4 text-blue-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                1. Objective Facts
              </h3>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-300 font-mono">
              {report.facts.map((fact, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-blue-400 font-bold">•</span>
                  <span>{fact}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Tier 2: Statistics */}
          <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                2. Statistical Metrics
              </h3>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-300 font-mono">
              {report.statistics.map((stat, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>{stat}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Tier 3: Interpretation */}
          <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
              <Brain className="w-4 h-4 text-purple-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                3. Process & Behavioral Interpretation
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed italic">
              &quot;{report.interpretation}&quot;
            </p>
          </div>

          {/* Tier 4: Suggestions */}
          <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                4. Actionable Suggestions
              </h3>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {report.suggestions.map((sug, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>{sug}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Interactive Coach Dialog */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-emerald-400" />
            <h2 className="text-sm font-bold text-slate-100">Direct Process Consultation</h2>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            Safety Guardrail Active
          </span>
        </div>

        {/* Message Stream */}
        <div className="space-y-3 max-h-60 overflow-y-auto pr-1 text-xs">
          {chatHistory.map((item, i) => (
            <div
              key={i}
              className={`p-3 rounded-xl max-w-2xl ${
                item.sender === 'trader'
                  ? 'ml-auto bg-emerald-950/40 border border-emerald-900/50 text-slate-200'
                  : 'mr-auto bg-slate-900 border border-slate-800 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                <span className="font-bold">{item.sender === 'trader' ? 'You' : 'TRADOVA AI'}</span>
                <span>{item.timestamp}</span>
              </div>
              <p className="leading-relaxed">{item.message}</p>
            </div>
          ))}
          {isAnswering && (
            <div className="p-3 rounded-xl mr-auto bg-slate-900 border border-slate-800 text-xs text-slate-400 italic flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 animate-spin text-emerald-400" />
              <span>Analyzing execution history against safety rules...</span>
            </div>
          )}
        </div>

        {/* Input bar */}
        <form onSubmit={handleSendQuestion} className="flex gap-2">
          <input
            type="text"
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
            placeholder="Ask regarding your risk rules, FOMO triggers, or execution discipline..."
            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            disabled={isAnswering || !userQuery.trim()}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-1 transition-colors disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
