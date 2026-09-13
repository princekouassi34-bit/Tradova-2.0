import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  ShieldAlert,
  Calculator,
  Sliders,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';
import { FinancialEngine } from '../../core/calculations/financialEngine';
import { RiskEngine, RiskRuleConfig } from '../../core/risk/riskEngine';
import { TradingAccount } from '../../types/domain';

interface RiskManagementViewProps {
  account: TradingAccount;
  rules: RiskRuleConfig;
  onUpdateRules: (newRules: RiskRuleConfig) => void;
}

export const RiskManagementView: React.FC<RiskManagementViewProps> = ({
  account,
  rules,
  onUpdateRules,
}) => {
  // Sandbox Simulator State
  const [balance, setBalance] = useState(account.currentEquity.toString());
  const [riskPercent, setRiskPercent] = useState('1.0');
  const [entryPrice, setEntryPrice] = useState('1.0850');
  const [stopLossPrice, setStopLossPrice] = useState('1.0825');
  const [takeProfitPrice, setTakeProfitPrice] = useState('1.0925');
  const [instrument, setInstrument] = useState('EURUSD');
  const [direction, setDirection] = useState<'LONG' | 'SHORT'>('LONG');

  // Interactive Position Sizing calculation
  const numBalance = parseFloat(balance) || account.currentEquity;
  const numRiskPct = parseFloat(riskPercent) || 1.0;
  const numEntry = parseFloat(entryPrice) || 1.0850;
  const numStop = parseFloat(stopLossPrice) || 1.0825;
  const numTP = parseFloat(takeProfitPrice) || 1.0925;

  const sizing = useMemo(() => {
    return FinancialEngine.calculatePositionSize({
      accountBalance: numBalance,
      riskPercent: numRiskPct,
      entryPrice: numEntry,
      stopLossPrice: numStop,
      tickSize: 0.0001,
      tickValue: 10,
    });
  }, [numBalance, numRiskPct, numEntry, numStop]);

  // Risk Engine Verification
  const verification = useMemo(() => {
    return RiskEngine.validateTrade(
      {
        accountId: account.id,
        accountBalance: numBalance,
        currentDailyLoss: 250,
        currentWeeklyLoss: 600,
        currentDrawdownPercent: 1.2,
        openTradesCount: 1,
        todayTradesCount: 2,
        instrument,
        direction,
        entryPrice: numEntry,
        stopLossPrice: numStop,
        takeProfitPrice: numTP,
        requestedLots: sizing.recommendedLots,
        targetRiskPercent: numRiskPct,
      },
      rules
    );
  }, [account.id, numBalance, instrument, direction, numEntry, numStop, numTP, sizing, numRiskPct, rules]);

  return (
    <div id="view-risk-management" className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-extrabold text-slate-100 tracking-tight">Risk Management Protocol</h1>
          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold">
            CENTRALIZED SOURCE OF TRUTH
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-0.5">
          Deterministic position sizing, drawdown thresholds & pre-trade execution gatekeeper
        </p>
      </div>

      {/* Grid: Position Size Calculator + Risk Rules Engine */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Position Size Sizing Calculator */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-slate-100">Deterministic Position Calculator</h2>
            </div>
            <span className="text-[10px] font-mono text-slate-400">FinancialEngine API</span>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Account Balance ($)</label>
                <input
                  id="calc-balance-input"
                  type="number"
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-md p-2 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Risk Percentage (%)</label>
                <input
                  id="calc-risk-pct-input"
                  type="number"
                  step="0.1"
                  value={riskPercent}
                  onChange={(e) => setRiskPercent(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-md p-2 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Entry Price</label>
                <input
                  id="calc-entry-input"
                  type="number"
                  step="any"
                  value={entryPrice}
                  onChange={(e) => setEntryPrice(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-md p-2 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-rose-400 mb-1">Stop Loss</label>
                <input
                  id="calc-sl-input"
                  type="number"
                  step="any"
                  value={stopLossPrice}
                  onChange={(e) => setStopLossPrice(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-md p-2 text-rose-300 focus:outline-none focus:border-rose-500"
                />
              </div>
              <div>
                <label className="block text-emerald-400 mb-1">Take Profit</label>
                <input
                  id="calc-tp-input"
                  type="number"
                  step="any"
                  value={takeProfitPrice}
                  onChange={(e) => setTakeProfitPrice(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-md p-2 text-emerald-300 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Calculated Output Matrix */}
            <div className="mt-4 p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2.5">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block border-b border-slate-800 pb-1.5">
                Exact Math Output
              </span>
              <div className="flex justify-between items-center text-slate-300">
                <span>Maximum Cash at Risk:</span>
                <span className="text-base font-bold text-slate-100 font-mono">
                  ${sizing.riskAmount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>Stop Distance (pips/pts):</span>
                <span className="font-bold text-slate-200 font-mono">
                  {sizing.stopDistance.toFixed(4)}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>Authorized Lot Size:</span>
                <span className="text-lg font-bold text-emerald-400 font-mono">
                  {sizing.recommendedLots} lots
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>Planned Risk-to-Reward:</span>
                <span className="text-base font-bold text-emerald-400 font-mono">
                  1 : {(Math.abs(numTP - numEntry) / (sizing.stopDistance || 1)).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Live Gatekeeper Verification & Active Rule Configuration */}
        <div className="space-y-4">
          {/* Live Gatekeeper Result */}
          <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <span className="text-sm font-bold text-slate-100">Live Gatekeeper Decision</span>
              <span
                className={`px-2.5 py-0.5 rounded text-xs font-bold font-mono tracking-wider ${
                  verification.status === 'ALLOW'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : verification.status === 'WARNING'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                }`}
              >
                [{verification.status}]
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {verification.recommendation}
            </p>

            {verification.violations.length > 0 && (
              <div className="space-y-1.5 pt-2">
                <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider">
                  Triggered Violations:
                </span>
                {verification.violations.map((v, i) => (
                  <div
                    key={i}
                    className="p-2 rounded bg-rose-950/30 border border-rose-900/40 text-rose-300 text-xs flex items-center gap-2"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span>{v}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Risk Rules Editor */}
          <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-slate-100">Risk Rule Parameters</h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-400">ENFORCED</span>
            </div>

            <div className="space-y-2.5 font-mono">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Max Risk Per Trade:</span>
                <span className="text-slate-200 font-bold">{rules.maxRiskPerTradePercent}% of equity</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Max Daily Loss Cap:</span>
                <span className="text-slate-200 font-bold">${rules.maxDailyLossDollars}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Max Daily Executions:</span>
                <span className="text-slate-200 font-bold">{rules.maxDailyTradesCount} trades</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Stop Loss Requirement:</span>
                <span className="text-emerald-400 font-bold">MANDATORY (NO EXCEPTIONS)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Prop Firm Desk Protection:</span>
                <span className="text-emerald-400 font-bold">
                  {rules.isPropFirmAccount ? 'ACTIVE (Daily DD 5%, Total DD 10%)' : 'DISABLED'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
