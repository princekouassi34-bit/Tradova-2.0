import React from 'react';
import { ShieldCheck, AlertTriangle, ShieldAlert, Award, TrendingUp, Info } from 'lucide-react';
import { PropAccount, TradingAccount } from '../../types/domain';

interface PropFirmModeViewProps {
  propAccount?: PropAccount;
  account: TradingAccount;
}

export const PropFirmModeView: React.FC<PropFirmModeViewProps> = ({ propAccount, account }) => {
  if (!propAccount) {
    return (
      <div className="p-6 text-center text-slate-400 text-xs">
        No active prop firm desk configured for this account. Switch to a Prop Firm account in the selector.
      </div>
    );
  }

  const profitPct = ((propAccount.currentProfit / propAccount.profitTargetAmount) * 100).toFixed(1);
  const dailyLossPct = ((propAccount.currentDailyLoss / propAccount.maxDailyDrawdownAmount) * 100).toFixed(1);
  const totalDDPct = ((propAccount.currentTotalDrawdown / propAccount.maxTotalDrawdownAmount) * 100).toFixed(1);

  return (
    <div id="view-prop-firm" className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-100 tracking-tight">
              Prop Firm Guardian Desk
            </h1>
            <span
              className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold uppercase tracking-wider ${
                propAccount.status === 'SAFE'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : propAccount.status === 'WARNING'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              }`}
            >
              STATUS: {propAccount.status}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {propAccount.firmName} | {propAccount.phase} | ${propAccount.accountSize.toLocaleString()} Account
          </p>
        </div>
      </div>

      {/* 3 Vital Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 1. Profit Target */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-slate-200">Profit Target</span>
            <span className="text-xs font-mono text-emerald-400 font-bold">
              +{propAccount.profitTargetPercent}%
            </span>
          </div>

          <div className="space-y-1 font-mono">
            <span className="text-2xl font-bold text-emerald-400">
              ${propAccount.currentProfit.toLocaleString()}
            </span>
            <span className="text-slate-400 block text-xs">
              Target: ${propAccount.profitTargetAmount.toLocaleString()} ({profitPct}%)
            </span>
          </div>

          <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-slate-800">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all"
              style={{ width: `${Math.min(100, parseFloat(profitPct))}%` }}
            />
          </div>

          <span className="text-[10px] text-slate-500 block">
            ${propAccount.profitTargetAmount - propAccount.currentProfit} remaining to pass phase
          </span>
        </div>

        {/* 2. Daily Loss Limit */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-slate-200">Daily Drawdown Gauge</span>
            <span className="text-xs font-mono text-amber-400 font-bold">
              Max {propAccount.maxDailyDrawdownPercent}%
            </span>
          </div>

          <div className="space-y-1 font-mono">
            <span className="text-2xl font-bold text-slate-100">
              ${propAccount.currentDailyLoss.toLocaleString()}
            </span>
            <span className="text-slate-400 block text-xs">
              Hard Ceiling: ${propAccount.maxDailyDrawdownAmount.toLocaleString()} ({dailyLossPct}%)
            </span>
          </div>

          <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-slate-800">
            <div
              className="bg-amber-500 h-full rounded-full transition-all"
              style={{ width: `${Math.min(100, parseFloat(dailyLossPct))}%` }}
            />
          </div>

          <span className="text-[10px] text-emerald-400 block font-mono">
            ${propAccount.maxDailyDrawdownAmount - propAccount.currentDailyLoss} remaining safety buffer today
          </span>
        </div>

        {/* 3. Maximum Total Drawdown */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-slate-200">Max Total Drawdown</span>
            <span className="text-xs font-mono text-rose-400 font-bold">
              Cap {propAccount.maxTotalDrawdownPercent}%
            </span>
          </div>

          <div className="space-y-1 font-mono">
            <span className="text-2xl font-bold text-slate-100">
              ${propAccount.currentTotalDrawdown.toLocaleString()}
            </span>
            <span className="text-slate-400 block text-xs">
              Ceiling: ${propAccount.maxTotalDrawdownAmount.toLocaleString()} ({totalDDPct}%)
            </span>
          </div>

          <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-slate-800">
            <div
              className="bg-rose-500 h-full rounded-full transition-all"
              style={{ width: `${Math.min(100, parseFloat(totalDDPct))}%` }}
            />
          </div>

          <span className="text-[10px] text-emerald-400 block font-mono">
            ${propAccount.maxTotalDrawdownAmount - propAccount.currentTotalDrawdown} remaining cushion
          </span>
        </div>
      </div>

      {/* Safety Protocol Rule Matrix */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 space-y-3 text-xs">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <h3 className="font-bold text-slate-100 uppercase tracking-wider text-xs">
            Prop Desk Enforcement Rules
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-300">
          <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg space-y-1">
            <span className="font-bold text-slate-200 block">Relative High-Water Mark Trailing</span>
            <p className="text-slate-400 text-[11px]">
              Drawdown is calculated dynamically from peak closed equity. Stop loss is mandatory to prevent overnight slippage.
            </p>
          </div>
          <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg space-y-1">
            <span className="font-bold text-slate-200 block">Automated Gatekeeper Lockdown</span>
            <p className="text-slate-400 text-[11px]">
              If daily loss reaches 80% of allowed threshold, Risk Engine status transitions to WARNING. At 95%, execution is BLOCKED.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
