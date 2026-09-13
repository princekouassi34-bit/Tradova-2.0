import React from 'react';
import {
  LayoutDashboard,
  CalendarDays,
  BookOpen,
  GitBranch,
  FlaskConical,
  PlayCircle,
  BarChart3,
  Bot,
  Target,
  Wallet,
  Settings,
  ShieldCheck,
  Plus,
  Globe,
  Sliders,
  Award,
} from 'lucide-react';
import { SupportedLanguage, TRANSLATIONS } from '../../i18n/translations';
import { TradingAccount, PropAccount } from '../../types/domain';

export type NavView =
  | 'home'
  | 'today'
  | 'journal'
  | 'strategies'
  | 'backtest'
  | 'replay'
  | 'analytics'
  | 'aiCoach'
  | 'goals'
  | 'accounts'
  | 'settings'
  | 'profile'
  | 'admin'
  | 'risk'
  | 'traderScore'
  | 'propFirm'
  | 'csvImport'
  | 'integrations'
  | 'subscriptions'
  | 'documentation';

interface SidebarProps {
  currentView: string;
  onSelectView: (view: any) => void;
  language?: SupportedLanguage;
  onSelectLanguage?: (lang: SupportedLanguage) => void;
  accounts?: TradingAccount[];
  selectedAccountId?: string;
  onSelectAccount?: (id: string) => void;
  propAccount?: PropAccount;
  onOpenQuickAddTrade?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView = (_view: any) => {},
  language = 'en',
  onSelectLanguage = (_lang: SupportedLanguage) => {},
  accounts = [],
  selectedAccountId = '',
  onSelectAccount = (_id: string) => {},
  propAccount,
  onOpenQuickAddTrade = () => {},
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const safeAccounts = accounts.length > 0 ? accounts : [];
  const currentAccount = safeAccounts.find((a) => a.id === selectedAccountId) || safeAccounts[0];

  const checkIsActive = (id: string) => {
    if (currentView === id) return true;
    if (id === 'home' && (currentView === 'DASHBOARD' || currentView === 'home')) return true;
    if (id === 'today' && (currentView === 'TODAY' || currentView === 'today')) return true;
    if (id === 'journal' && (currentView === 'JOURNAL' || currentView === 'journal')) return true;
    if (id === 'strategies' && (currentView === 'STRATEGIES' || currentView === 'strategies')) return true;
    if (id === 'backtest' && (currentView === 'BACKTEST' || currentView === 'backtest')) return true;
    if (id === 'replay' && (currentView === 'REPLAY' || currentView === 'replay')) return true;
    if (id === 'analytics' && (currentView === 'ANALYTICS' || currentView === 'analytics')) return true;
    if (id === 'aiCoach' && (currentView === 'COACH' || currentView === 'aiCoach')) return true;
    if (id === 'goals' && (currentView === 'GOALS' || currentView === 'goals')) return true;
    if (id === 'accounts' && (currentView === 'ACCOUNTS' || currentView === 'accounts')) return true;
    if (id === 'risk' && (currentView === 'RISK' || currentView === 'risk')) return true;
    if (id === 'traderScore' && (currentView === 'TRADER_SCORE' || currentView === 'traderScore')) return true;
    if (id === 'propFirm' && (currentView === 'PROP_FIRM' || currentView === 'propFirm')) return true;
    if (id === 'settings' && (currentView === 'SETTINGS' || currentView === 'settings')) return true;
    if (id === 'admin' && (currentView === 'ADMIN' || currentView === 'admin')) return true;
    if (id === 'documentation' && (currentView === 'ARCHITECTURE' || currentView === 'documentation')) return true;
    return false;
  };

  const primaryNavItems: { id: NavView; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'home', label: t.nav.home, icon: LayoutDashboard },
    { id: 'today', label: t.nav.today, icon: CalendarDays },
    { id: 'journal', label: t.nav.journal, icon: BookOpen },
    { id: 'strategies', label: t.nav.strategies, icon: GitBranch },
    { id: 'backtest', label: t.nav.backtest, icon: FlaskConical },
    { id: 'replay', label: t.nav.replay, icon: PlayCircle },
    { id: 'analytics', label: t.nav.analytics, icon: BarChart3 },
    { id: 'aiCoach', label: t.nav.aiCoach, icon: Bot },
    { id: 'goals', label: t.nav.goals, icon: Target },
    { id: 'accounts', label: t.nav.accounts, icon: Wallet },
  ];

  const secondaryNavItems: { id: NavView; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'risk', label: 'Risk Engine', icon: Sliders },
    { id: 'traderScore', label: 'Trader Score', icon: Award },
    { id: 'propFirm', label: 'Prop Firm Mode', icon: ShieldCheck },
    { id: 'settings', label: t.nav.settings, icon: Settings },
    { id: 'admin', label: t.nav.admin, icon: ShieldCheck },
  ];

  return (
    <aside
      id="tradova-sidebar"
      className="hidden lg:flex flex-col w-64 bg-[#0d131f] border-r border-slate-800/80 h-screen sticky top-0 select-none z-30"
    >
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-extrabold tracking-wider text-sm shadow-sm shadow-emerald-500/10">
              TR
            </div>
            <div>
              <span className="font-extrabold text-base tracking-wider text-slate-100 uppercase">
                TRADOVA
              </span>
              <span className="ml-1.5 text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                OS
              </span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-medium tracking-wide">
            Build Your Edge.
          </p>
        </div>
      </div>

      {/* Account Switcher & Prop Status Badge */}
      <div className="p-3 border-b border-slate-800/60 bg-[#090d16]/50">
        <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1 block">
          Active Account
        </label>
        {safeAccounts.length > 0 && (
          <select
            id="account-selector"
            value={selectedAccountId}
            onChange={(e) => onSelectAccount(e.target.value)}
            className="w-full bg-[#131b2c] border border-slate-700/70 text-slate-200 text-xs rounded-md px-2 py-1.5 focus:outline-none focus:border-emerald-500 transition-colors font-mono"
          >
            {safeAccounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name} (${acc.currentEquity.toLocaleString()})
              </option>
            ))}
          </select>
        )}

        {currentAccount?.accountType === 'PROP' && propAccount && (
          <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Prop Desk Status:</span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                propAccount.status === 'SAFE'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : propAccount.status === 'WARNING'
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                  : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
              }`}
            >
              {propAccount.status}
            </span>
          </div>
        )}
      </div>

      {/* Quick Add Trade Call to Action */}
      <div className="px-3 pt-3 pb-2">
        <button
          id="btn-sidebar-quick-add-trade"
          onClick={onOpenQuickAddTrade}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs py-2 px-3 rounded-md flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-950/40 active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>{t.nav.quickAddTrade}</span>
        </button>
      </div>

      {/* Main Navigation links */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5 text-xs">
        <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Core Operating Loop
        </div>
        {primaryNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = checkIsActive(item.id);
          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              onClick={() => onSelectView(item.id)}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md font-medium transition-colors ${
                isActive
                  ? 'bg-slate-800/90 text-emerald-400 font-semibold'
                  : 'text-slate-300 hover:bg-slate-800/40 hover:text-slate-100'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}

        <div className="pt-3 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Governance & Tools
        </div>
        {secondaryNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = checkIsActive(item.id);
          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              onClick={() => onSelectView(item.id)}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md font-medium transition-colors ${
                isActive
                  ? 'bg-slate-800/90 text-emerald-400 font-semibold'
                  : 'text-slate-300 hover:bg-slate-800/40 hover:text-slate-100'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Footer: Language Switcher & Architecture Specs link */}
      <div className="p-3 border-t border-slate-800/80 bg-[#090d16]/80 flex flex-col gap-2">
        <button
          id="btn-nav-architecture-docs"
          onClick={() => onSelectView('documentation')}
          className={`w-full text-left px-2 py-1.5 rounded text-[11px] font-medium flex items-center justify-between transition-colors ${
            currentView === 'documentation'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
          }`}
        >
          <span>Architecture & Tests</span>
          <span className="text-[9px] px-1 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">
            LIVE
          </span>
        </button>

        <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
          <div className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px]">Lang:</span>
          </div>
          <select
            id="language-selector"
            value={language}
            onChange={(e) => onSelectLanguage(e.target.value as SupportedLanguage)}
            aria-label="Language Selector"
            className="bg-[#131b2c] border border-slate-700 text-slate-300 text-[11px] rounded px-1.5 py-1 focus:outline-none focus:border-emerald-500 font-mono"
          >
            <option value="en">EN</option>
            <option value="fr">FR</option>
            <option value="es">ES</option>
            <option value="pt">PT</option>
            <option value="de">DE</option>
            <option value="it">IT</option>
            <option value="ar">العربية (RTL)</option>
            <option value="zh">中文</option>
            <option value="ja">日本語</option>
            <option value="ko">한국어</option>
            <option value="tr">TR</option>
          </select>
        </div>
      </div>
    </aside>
  );
};
