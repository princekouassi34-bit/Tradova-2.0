import React, { useState } from 'react';
import {
  Code,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Play,
  Layers,
  Database,
  Cpu,
  Lock,
} from 'lucide-react';
import { FinancialEngine } from '../../core/calculations/financialEngine';
import { RiskEngine } from '../../core/risk/riskEngine';
import { ReplayEngine } from '../../core/replay/replayEngine';
import { TraderScoreEngine } from '../../core/traderScore/traderScoreEngine';
import { AICoachService } from '../../core/ai/aiCoachService';
import { moduleRegistry } from '../../data/initialData';

interface TestResult {
  name: string;
  category: string;
  passed: boolean;
  message: string;
  durationMs: number;
}

export const ArchitectureDocView: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);

  const runAllUnitTests = () => {
    setIsRunningTests(true);
    const results: TestResult[] = [];

    // Test 1: FinancialEngine Position Sizing
    const t0 = performance.now();
    try {
      const sizing = FinancialEngine.calculatePositionSize({
        accountBalance: 100000,
        riskPercent: 1.0,
        entryPrice: 1.0850,
        stopLossPrice: 1.0825,
        tickSize: 0.0001,
        tickValue: 10,
      });
      // 100k balance @ 1% = $1000 risk. 25 pips @ $10/pip/lot = $250/lot. Lots = 4.0.
      const passed = sizing.recommendedLots === 4 && sizing.riskAmount === 1000;
      results.push({
        name: 'FinancialEngine: Deterministic Position Sizing',
        category: 'FINANCIAL_MATH',
        passed,
        message: `Expected lots=4.0, risk=$1000. Computed lots=${sizing.recommendedLots}, risk=$${sizing.riskAmount}`,
        durationMs: Math.round(performance.now() - t0),
      });
    } catch (e: any) {
      results.push({
        name: 'FinancialEngine: Deterministic Position Sizing',
        category: 'FINANCIAL_MATH',
        passed: false,
        message: e.message,
        durationMs: Math.round(performance.now() - t0),
      });
    }

    // Test 2: RiskEngine Gatekeeper Blocks Missing Stop Loss
    const t1 = performance.now();
    try {
      const riskCheck = RiskEngine.validateTrade(
        {
          accountId: 'acc_01',
          accountBalance: 100000,
          currentDailyLoss: 0,
          currentWeeklyLoss: 0,
          currentDrawdownPercent: 0,
          openTradesCount: 0,
          todayTradesCount: 0,
          instrument: 'EURUSD',
          direction: 'LONG',
          entryPrice: 1.0850,
          stopLossPrice: undefined, // Missing SL!
          requestedLots: 1.0,
          targetRiskPercent: 1.0,
        },
        {
          maxRiskPerTradePercent: 2.0,
          maxRiskPerTradeDollars: 2000,
          maxDailyLossDollars: 2000,
          maxWeeklyLossDollars: 5000,
          maxAccountDrawdownPercent: 10,
          maxOpenTradesCount: 3,
          maxDailyTradesCount: 5,
          requireStopLoss: true,
          maxLeverage: 30,
          isPropFirmAccount: true,
        }
      );
      const passed = riskCheck.status === 'BLOCK' && riskCheck.violations.some((v) => v.message.includes('Stop Loss'));
      results.push({
        name: 'RiskEngine: Gatekeeper Blocks Missing Stop Loss',
        category: 'RISK_GATEKEEPER',
        passed,
        message: `Status: ${riskCheck.status}, Violations: ${riskCheck.violations.map((v) => v.message).join(', ')}`,
        durationMs: Math.round(performance.now() - t1),
      });
    } catch (e: any) {
      results.push({
        name: 'RiskEngine: Gatekeeper Blocks Missing Stop Loss',
        category: 'RISK_GATEKEEPER',
        passed: false,
        message: e.message,
        durationMs: Math.round(performance.now() - t1),
      });
    }

    // Test 3: ReplayEngine Zero Look-Ahead Bias
    const t2 = performance.now();
    try {
      const replay = new ReplayEngine('EURUSD', '15m', 1.0850, 40);
      const initialRevealed = replay.getRevealedBars().length;
      replay.stepForward();
      const afterStep = replay.getRevealedBars().length;
      const passed = initialRevealed === 15 && afterStep === 16 && replay.getTotalBars() === 40;
      results.push({
        name: 'ReplayEngine: Future Candles Masked Until Revealed',
        category: 'REPLAY_ENGINE',
        passed,
        message: `Initial bars: ${initialRevealed}, After step: ${afterStep}, Total bars: ${replay.getTotalBars()}`,
        durationMs: Math.round(performance.now() - t2),
      });
    } catch (e: any) {
      results.push({
        name: 'ReplayEngine: Future Candles Masked Until Revealed',
        category: 'REPLAY_ENGINE',
        passed: false,
        message: e.message,
        durationMs: Math.round(performance.now() - t2),
      });
    }

    // Test 4: TraderScoreEngine 6-Pillar Computation
    const t3 = performance.now();
    try {
      const mockTrade = {
        id: 't1',
        userId: 'u1',
        accountId: 'a1',
        instrument: 'EURUSD',
        assetClass: 'FOREX' as const,
        direction: 'LONG' as const,
        status: 'CLOSED' as const,
        entryPrice: 1.0850,
        stopLossPrice: 1.0825,
        exitPrice: 1.0900,
        positionSize: 1.0,
        riskAmount: 250,
        timeframe: '15m',
        fees: 4,
        entryTime: new Date().toISOString(),
        netPnL: 500,
        rMultiple: 2.0,
        strategyFollowed: true,
        errorType: 'NONE' as const,
        psychologicalState: 'Calm' as const,
        session: 'LONDON' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const score = TraderScoreEngine.calculateTraderScore([mockTrade], 1);
      const passed = score.overallScore >= 0 && score.overallScore <= 100 && score.strategyAdherenceScore === 100;
      results.push({
        name: 'TraderScoreEngine: Weighted 6-Pillar Discipline Score',
        category: 'EDGE_SCORE',
        passed,
        message: `Overall Score: ${score.overallScore}/100, Strategy Adherence: ${score.strategyAdherenceScore}/100`,
        durationMs: Math.round(performance.now() - t3),
      });
    } catch (e: any) {
      results.push({
        name: 'TraderScoreEngine: Weighted 6-Pillar Discipline Score',
        category: 'EDGE_SCORE',
        passed: false,
        message: e.message,
        durationMs: Math.round(performance.now() - t3),
      });
    }

    // Test 5: AI Coach Safety Guardrail Filter
    const t4 = performance.now();
    try {
      const unsafeText = 'Buy now, this will guarantee 1000% profit next week!';
      const safeText = 'Review your risk parameters and ensure stop losses are defined.';
      const checkUnsafe = AICoachService.validateSafety(unsafeText);
      const checkSafe = AICoachService.validateSafety(safeText);
      const passed = !checkUnsafe.isValid && checkSafe.isValid;
      results.push({
        name: 'AICoachService: Prohibited Advice & Get-Rich-Quick Filter',
        category: 'AI_SAFETY',
        passed,
        message: `Unsafe rejected: ${!checkUnsafe.isValid}, Safe permitted: ${checkSafe.isValid}`,
        durationMs: Math.round(performance.now() - t4),
      });
    } catch (e: any) {
      results.push({
        name: 'AICoachService: Prohibited Advice & Get-Rich-Quick Filter',
        category: 'AI_SAFETY',
        passed: false,
        message: e.message,
        durationMs: Math.round(performance.now() - t4),
      });
    }

    setTestResults(results);
    setIsRunningTests(false);
  };

  return (
    <div id="view-architecture" className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-100 tracking-tight">
              TRADOVA Architecture Blueprint
            </h1>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold">
              CORE-FIRST ENGINE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Institutional full-stack specifications, database schema, and live mathematical unit test suite
          </p>
        </div>

        <button
          id="btn-run-all-tests"
          onClick={runAllUnitTests}
          disabled={isRunningTests}
          className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-3.5 py-2 rounded-lg transition-all shadow-md shadow-emerald-950/40 disabled:opacity-50"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>{isRunningTests ? 'Running Suite...' : 'Execute Unit Tests'}</span>
        </button>
      </div>

      {/* Interactive Test Runner Panel */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-slate-100">Live Mathematical Test Harness</h2>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            {testResults.length > 0
              ? `${testResults.filter((r) => r.passed).length} / ${testResults.length} PASSED`
              : 'Click "Execute Unit Tests" to verify engines'}
          </span>
        </div>

        {testResults.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500 font-mono">
            Click the &quot;Execute Unit Tests&quot; button above to run real-time browser assertions against
            FinancialEngine, RiskEngine, ReplayEngine, TraderScoreEngine, and AICoachService.
          </div>
        ) : (
          <div className="space-y-2">
            {testResults.map((t, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg border flex items-start justify-between gap-3 text-xs font-mono ${
                  t.passed
                    ? 'bg-emerald-950/20 border-emerald-900/40 text-slate-200'
                    : 'bg-rose-950/30 border-rose-900/50 text-rose-300'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {t.passed ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-100">{t.name}</span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400">
                        {t.category}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 block mt-0.5">{t.message}</span>
                  </div>
                </div>
                <span className="text-[10px] text-slate-500 shrink-0">{t.durationMs}ms</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Architecture Layers Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Layer 1 */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
            <Cpu className="w-4 h-4" />
            <span>1. Pure Domain Logic Layer</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Located in <code className="text-emerald-400">/src/core/</code>. Zero UI dependencies. Houses
            FinancialEngine, RiskEngine, ReplayEngine, TraderScoreEngine, and AnalyticsEngine for deterministic
            portability to Node.js backend or mobile clients.
          </p>
        </div>

        {/* Layer 2 */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-blue-400 font-bold text-xs">
            <Database className="w-4 h-4" />
            <span>2. Persistence & Isolation</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Schema defined in <code className="text-blue-400">/src/db/schema.sql</code>. Implements PostgreSQL
            Row-Level Security (RLS) ensuring strict multi-tenant user isolation. Append-only audit log stream
            records all risk triggers.
          </p>
        </div>

        {/* Layer 3 */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-purple-400 font-bold text-xs">
            <Lock className="w-4 h-4" />
            <span>3. Server Gatekeeper & Safety</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            API endpoints in <code className="text-purple-400">server.ts</code> enforce server-side risk
            verification, audit trail logging, and AI coach prompt sanitization to prevent ungrounded predictions
            or gambler mentality.
          </p>
        </div>
      </div>

      {/* System Module Inventory (16 Core Modules) */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-100">
              TRADOVA 16-Module Functional Registry
            </h3>
          </div>
          <span className="text-[10px] font-mono text-emerald-400">100% OPERATIONAL</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          {moduleRegistry.map((mod) => (
            <div key={mod.id} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200">{mod.name}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2">{mod.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
