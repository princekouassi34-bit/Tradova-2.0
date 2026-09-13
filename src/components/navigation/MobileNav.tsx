import React, { useState } from 'react';
import {
  LayoutDashboard,
  CalendarDays,
  BookOpen,
  BarChart3,
  Menu,
  Plus,
  X,
  GitBranch,
  FlaskConical,
  PlayCircle,
  Bot,
  Target,
  Wallet,
  Settings,
  ShieldCheck,
  Award,
} from 'lucide-react';
import { NavView } from './Sidebar';
import { SupportedLanguage, TRANSLATIONS } from '../../i18n/translations';

interface MobileNavProps {
  currentView?: string;
  onSelectView?: (view: any) => void;
  language?: SupportedLanguage;
  onOpenQuickAddTrade?: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  currentView = 'DASHBOARD',
  onSelectView = (_view: any) => {},
  language = 'en',
  onOpenQuickAddTrade,
}) => {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const handleSelect = (view: NavView) => {
    onSelectView(view);
    setIsMoreOpen(false);
  };

  const isViewActive = (viewKey: string) => {
    if (currentView === viewKey) return true;
    if (viewKey === 'home' && currentView === 'DASHBOARD') return true;
    if (viewKey === 'today' && currentView === 'TODAY') return true;
    if (viewKey === 'journal' && currentView === 'JOURNAL') return true;
    if (viewKey === 'analytics' && currentView === 'ANALYTICS') return true;
    if (viewKey === 'strategies' && currentView === 'STRATEGIES') return true;
    if (viewKey === 'risk' && currentView === 'RISK') return true;
    if (viewKey === 'propFirm' && currentView === 'PROP_FIRM') return true;
    if (viewKey === 'traderScore' && currentView === 'TRADER_SCORE') return true;
    if (viewKey === 'aiCoach' && currentView === 'COACH') return true;
    if (viewKey === 'backtest' && currentView === 'BACKTEST') return true;
    if (viewKey === 'replay' && currentView === 'REPLAY') return true;
    if (viewKey === 'goals' && currentView === 'GOALS') return true;
    if (viewKey === 'accounts' && currentView === 'ACCOUNTS') return true;
    if (viewKey === 'settings' && currentView === 'SETTINGS') return true;
    if (viewKey === 'admin' && currentView === 'ADMIN') return true;
    if (viewKey === 'documentation' && currentView === 'ARCHITECTURE') return true;
    return false;
  };

  const moreItems: { id: NavView; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'strategies', label: t.nav.strategies, icon: GitBranch },
    { id: 'backtest', label: t.nav.backtest, icon: FlaskConical },
    { id: 'replay', label: t.nav.replay, icon: PlayCircle },
    { id: 'aiCoach', label: t.nav.aiCoach, icon: Bot },
    { id: 'goals', label: t.nav.goals, icon: Target },
    { id: 'accounts', label: t.nav.accounts, icon: Wallet },
    { id: 'traderScore', label: 'Trader Score', icon: Award },
    { id: 'propFirm', label: 'Prop Firm Mode', icon: ShieldCheck },
    { id: 'settings', label: t.nav.settings, icon: Settings },
    { id: 'admin', label: t.nav.admin, icon: ShieldCheck },
    { id: 'documentation', label: 'Architecture & Tests', icon: BookOpen },
  ];

  return (
    <>
      {/* Mobile Drawer (More) */}
      {isMoreOpen && (
        <div
          id="mobile-more-drawer"
          className="lg:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col justify-end"
          onClick={() => setIsMoreOpen(false)}
        >
          <div
            className="bg-[#0f172a] border-t border-slate-800 rounded-t-2xl p-5 max-h-[75vh] overflow-y-auto space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-sm font-bold uppercase tracking-wider text-slate-200">
                TRADOVA Modules
              </span>
              <button
                id="btn-close-mobile-drawer"
                onClick={() => setIsMoreOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {moreItems.map((item) => {
                const Icon = item.icon;
                const isActive = isViewActive(item.id);
                return (
                  <button
                    key={item.id}
                    id={`mobile-more-${item.id}`}
                    onClick={() => handleSelect(item.id)}
                    className={`flex items-center gap-2.5 p-3 rounded-lg text-xs font-medium border text-left transition-colors ${
                      isActive
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                        : 'bg-slate-800/40 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Floating Quick Add Trade Button on Mobile */}
      <div className="lg:hidden fixed bottom-18 right-4 z-40">
        <button
          id="btn-mobile-floating-add-trade"
          onClick={onOpenQuickAddTrade}
          className="w-12 h-12 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/20 active:scale-95 transition-transform cursor-pointer"
          aria-label="Add Trade"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav
        id="tradova-mobile-nav"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0d131f]/95 backdrop-blur-md border-t border-slate-800 flex items-center justify-around h-16 px-2 select-none"
      >
        <button
          id="mobile-nav-home"
          onClick={() => handleSelect('home')}
          className={`flex flex-col items-center justify-center flex-1 py-1 text-[11px] font-medium transition-colors ${
            isViewActive('home') ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span>{t.nav.home}</span>
        </button>

        <button
          id="mobile-nav-today"
          onClick={() => handleSelect('today')}
          className={`flex flex-col items-center justify-center flex-1 py-1 text-[11px] font-medium transition-colors ${
            isViewActive('today') ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <CalendarDays className="w-5 h-5 mb-0.5" />
          <span>{t.nav.today}</span>
        </button>

        <button
          id="mobile-nav-journal"
          onClick={() => handleSelect('journal')}
          className={`flex flex-col items-center justify-center flex-1 py-1 text-[11px] font-medium transition-colors ${
            isViewActive('journal') ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-5 h-5 mb-0.5" />
          <span>{t.nav.journal}</span>
        </button>

        <button
          id="mobile-nav-analytics"
          onClick={() => handleSelect('analytics')}
          className={`flex flex-col items-center justify-center flex-1 py-1 text-[11px] font-medium transition-colors ${
            isViewActive('analytics') ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BarChart3 className="w-5 h-5 mb-0.5" />
          <span>{t.nav.analytics}</span>
        </button>

        <button
          id="mobile-nav-more"
          onClick={() => setIsMoreOpen(true)}
          className={`flex flex-col items-center justify-center flex-1 py-1 text-[11px] font-medium transition-colors ${
            isMoreOpen ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Menu className="w-5 h-5 mb-0.5" />
          <span>{t.nav.more}</span>
        </button>
      </nav>
    </>
  );
};
