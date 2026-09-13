import React from 'react';
import { Plus, Shield, Activity } from 'lucide-react';
import { SupportedLanguage, TRANSLATIONS } from '../../i18n/translations';
import { TradingAccount, User } from '../../types/domain';

export interface HeaderProps {
  user?: User;
  account?: TradingAccount;
  activeAccount?: TradingAccount;
  accounts?: TradingAccount[];
  selectedAccountId?: string;
  onSelectAccount?: (id: string) => void;
  language?: SupportedLanguage;
  currentLanguage?: SupportedLanguage;
  onLanguageChange?: (lang: SupportedLanguage) => void;
  onOpenQuickAdd?: () => void;
  onOpenQuickAddTrade?: () => void;
  onResetData?: () => void;
  onLoadEmptyState?: () => void;
  hasCustomTrades?: boolean;
  overallScore?: number;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  account,
  activeAccount,
  accounts,
  selectedAccountId,
  onSelectAccount,
  language,
  currentLanguage,
  onLanguageChange,
  onOpenQuickAdd,
  onOpenQuickAddTrade,
  onResetData,
  onLoadEmptyState,
  hasCustomTrades = true,
  overallScore,
}) => {
  const activeLang = currentLanguage || language || 'en';
  const t = TRANSLATIONS[activeLang] || TRANSLATIONS.en;
  const currentAcc = activeAccount || account || accounts?.[0];
  const currentUser = user || {
    id: 'usr_edge_001',
    email: 'trader@tradova.io',
    fullName: 'Alexandre Vance',
    role: 'ADMIN',
    plan: 'AI_PRO',
    is2FAEnabled: true,
    emailVerified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const handleOpenQuickAdd = onOpenQuickAddTrade || onOpenQuickAdd || (() => {});

  // Session detection (London: 08:00 - 16:30 UTC, NY: 13:30 - 20:00 UTC)
  const now = new Date();
  const utcHours = now.getUTCHours();
  let currentSession = 'ASIAN SESSION';
  if (utcHours >= 8 && utcHours < 13) currentSession = 'LONDON OPEN';
  else if (utcHours >= 13 && utcHours < 17) currentSession = 'LONDON / NY OVERLAP';
  else if (utcHours >= 17 && utcHours < 21) currentSession = 'NEW YORK AFTERNOON';

  return (
    <header
      id="tradova-header"
      className="h-14 border-b border-slate-800/80 bg-[#0d131f]/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20"
    >
      {/* Left: Active session & account telemetry */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-slate-400 font-semibold">{currentSession}</span>
        </div>

        {currentAcc ? (
          <div className="hidden sm:flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-400">{currentAcc.name}:</span>
            <span className="text-slate-100 font-bold">
              ${(currentAcc.currentEquity ?? 0).toLocaleString()}
            </span>
          </div>
        ) : (
          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-400">
            <span>Trading Desk</span>
          </div>
        )}
      </div>

      {/* Right: Actions, Quick Add Trade, States Toggle & Profile */}
      <div className="flex items-center gap-2.5">
        {/* Test State Switcher (To test 'no trades' / 'no account' states) */}
        {(onResetData || onLoadEmptyState) && (
          <div className="hidden md:flex items-center gap-1 bg-slate-900/80 border border-slate-800 p-0.5 rounded-lg text-[10px]">
            {onResetData && (
              <button
                id="btn-toggle-sample-data"
                onClick={onResetData}
                title="Load sample verified playbook trades"
                className={`px-2 py-1 rounded font-mono transition-colors cursor-pointer ${
                  hasCustomTrades
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Sample Data
              </button>
            )}
            {onLoadEmptyState && (
              <button
                id="btn-toggle-empty-data"
                onClick={onLoadEmptyState}
                title="Clear all trades to test 'no trades' empty state"
                className={`px-2 py-1 rounded font-mono transition-colors cursor-pointer ${
                  !hasCustomTrades
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Empty State
              </button>
            )}
          </div>
        )}

        {/* Overall Score pill if provided */}
        {overallScore !== undefined && (
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-[11px] font-mono">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400">Score:</span>
            <span className="text-emerald-400 font-bold">{overallScore}/100</span>
          </div>
        )}

        {/* Quick Add Trade Primary CTA */}
        <button
          id="btn-header-quick-add-trade"
          onClick={handleOpenQuickAdd}
          className="hidden sm:flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-3 py-1.5 rounded-md transition-all active:scale-[0.98] shadow-sm shadow-emerald-500/20 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span>{t.nav.quickAddTrade}</span>
        </button>

        {/* Plan Badge */}
        <div className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono text-emerald-400 font-bold">
          <Shield className="w-3 h-3 text-emerald-400" />
          <span>{currentUser.plan || 'PRO'}</span>
        </div>

        {/* User Pill */}
        <div className="flex items-center gap-2 pl-1 border-l border-slate-800">
          <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-200 font-mono">
            {(currentUser.fullName || 'TR').substring(0, 2).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
};
