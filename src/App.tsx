import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/navigation/Sidebar';
import { MobileNav } from './components/navigation/MobileNav';
import { Header } from './components/navigation/Header';
import { QuickAddTradeModal } from './components/modals/QuickAddTradeModal';

// Views
import { HomeDashboard } from './components/views/HomeDashboard';
import { TodayView } from './components/views/TodayView';
import { JournalView } from './components/views/JournalView';
import { StrategiesView } from './components/views/StrategiesView';
import { MarketReplayView } from './components/views/MarketReplayView';
import { AnalyticsView } from './components/views/AnalyticsView';
import { RiskManagementView } from './components/views/RiskManagementView';
import { TraderScoreView } from './components/views/TraderScoreView';
import { AICoachView } from './components/views/AICoachView';
import { BacktestView } from './components/views/BacktestView';
import { GoalsView } from './components/views/GoalsView';
import { PsychologyView } from './components/views/PsychologyView';
import { AccountsView } from './components/views/AccountsView';
import { PropFirmModeView } from './components/views/PropFirmModeView';
import { CsvImportView } from './components/views/CsvImportView';
import { SettingsView } from './components/views/SettingsView';
import { AdminView } from './components/views/AdminView';
import { ArchitectureDocView } from './components/views/ArchitectureDocView';

// Initial Data & Types
import {
  initialTradingAccounts,
  initialStrategies,
  initialTrades,
  initialPsychologyEntries,
  initialGoals,
  initialPropAccount,
  initialAuditLogs,
  initialAICoachReport,
  initialDailyPlan,
} from './data/initialData';
import {
  TradingAccount,
  Strategy,
  Trade,
  PsychologyEntry,
  Goal,
  AuditLogEntry,
  PropAccount,
  AICoachReport,
  DailyPlan,
} from './types/domain';
import { RiskRuleConfig, RiskEngine } from './core/risk/riskEngine';
import { TraderScoreEngine } from './core/traderScore/traderScoreEngine';
import { SupportedLanguage, translations } from './i18n/translations';

export default function App() {
  // Navigation State
  const [currentView, setCurrentView] = useState<string>('DASHBOARD');
  const [isQuickAddOpen, setIsQuickAddOpen] = useState<boolean>(false);
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>('en');

  // Core Data Collections
  const [accounts, setAccounts] = useState<TradingAccount[]>(initialTradingAccounts);
  const [selectedAccountId, setSelectedAccountId] = useState<string>(initialTradingAccounts[0].id);
  const [strategies, setStrategies] = useState<Strategy[]>(initialStrategies);
  const [trades, setTrades] = useState<Trade[]>(initialTrades);
  const [dailyPlan, setDailyPlan] = useState<DailyPlan>(initialDailyPlan);
  const [psychologyEntries, setPsychologyEntries] = useState<PsychologyEntry[]>(initialPsychologyEntries);
  const [goals, setGoals] = useState<Goal[]>(initialGoals);
  const [propAccount, setPropAccount] = useState<PropAccount>(initialPropAccount);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(initialAuditLogs);
  const [aiReport, setAiReport] = useState<AICoachReport>(initialAICoachReport);

  // Active Risk Rules Config
  const [riskRules, setRiskRules] = useState<RiskRuleConfig>({
    maxRiskPerTradePercent: 1.0,
    maxRiskPerTradeDollars: 1000,
    maxDailyLossDollars: 2000,
    maxWeeklyLossDollars: 5000,
    maxAccountDrawdownPercent: 10,
    maxOpenTradesCount: 3,
    maxDailyTradesCount: 5,
    requireStopLoss: true,
    maxLeverage: 30,
    isPropFirmAccount: true,
  });

  // Active Account with guaranteed fallback
  const activeAccount =
    accounts.find((a) => a.id === selectedAccountId) ||
    accounts[0] ||
    initialTradingAccounts[0];

  // Dynamic Trader Score computation based on current trade log
  const traderScore = TraderScoreEngine.calculateTraderScore(trades, 1);

  // Internationalization text helper
  const t = translations[currentLanguage] || translations.en;
  const isRTL = currentLanguage === 'ar';

  // Handlers
  const handleAddTrade = (newTrade: Trade) => {
    setTrades((prev) => [newTrade, ...prev]);

    // Update account equity
    if (newTrade.netPnL) {
      setAccounts((prev) =>
        prev.map((acc) => {
          if (acc.id === newTrade.accountId) {
            return {
              ...acc,
              currentEquity: acc.currentEquity + newTrade.netPnL!,
              currentBalance: acc.currentBalance + newTrade.netPnL!,
            };
          }
          return acc;
        })
      );
    }

    // Add audit log
    const log: AuditLogEntry = {
      id: `log_${Date.now()}`,
      userId: 'usr_edge_001',
      action: 'TRADE_LOGGED',
      entityType: 'TRADE',
      entityId: newTrade.id,
      timestamp: new Date().toISOString(),
      ipAddress: '127.0.0.1',
    };
    setAuditLogs((prev) => [log, ...prev]);
  };

  const handleImportTrades = (newTrades: Trade[]) => {
    setTrades((prev) => [...newTrades, ...prev]);
    const log: AuditLogEntry = {
      id: `log_${Date.now()}`,
      userId: 'usr_edge_001',
      action: 'BATCH_CSV_IMPORT',
      entityType: 'TRADE',
      entityId: `${newTrades.length}_records`,
      timestamp: new Date().toISOString(),
      ipAddress: '127.0.0.1',
    };
    setAuditLogs((prev) => [log, ...prev]);
  };

  const handleAddStrategy = (strat: Strategy) => {
    setStrategies((prev) => [...prev, strat]);
  };

  const handleBumpStrategyVersion = (strategyId: string, changeLog: string) => {
    setStrategies((prev) =>
      prev.map((s) => {
        if (s.id === strategyId) {
          return {
            ...s,
            currentVersion: s.currentVersion + 1,
            updatedAt: new Date().toISOString(),
          };
        }
        return s;
      })
    );
  };

  const handleAddGoal = (goal: Goal) => {
    setGoals((prev) => [...prev, goal]);
  };

  const handleUpdateGoalProgress = (goalId: string, value: number) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id === goalId) {
          return { ...g, currentValue: value, achieved: value >= g.targetValue };
        }
        return g;
      })
    );
  };

  const handleAddPsychologyEntry = (entry: PsychologyEntry) => {
    setPsychologyEntries((prev) => [entry, ...prev]);
  };

  const handleAddAccount = (acc: TradingAccount) => {
    setAccounts((prev) => [...prev, acc]);
    setSelectedAccountId(acc.id);
  };

  const handleRefreshAIReport = (type: 'DAILY' | 'WEEKLY' | 'MONTHLY') => {
    // Generate new AI report contextually
    setAiReport({
      id: `rep_${Date.now()}`,
      userId: 'usr_edge_001',
      type,
      facts: [
        `${trades.length} trades recorded in evaluation period.`,
        `Average risk strictly held to ${(riskRules.maxRiskPerTradePercent).toFixed(1)}%.`,
        `Highest volume instrument: EURUSD.`,
      ],
      statistics: [
        `Win rate: ${((trades.filter((t) => (t.netPnL ?? 0) > 0).length / (trades.length || 1)) * 100).toFixed(1)}%`,
        `Discipline Score: ${traderScore.overallScore}/100`,
      ],
      interpretation:
        'Your trade execution demonstrates high mechanical discipline. Most rule deviations occur during high-volatility session openings. Protect your psychological edge by setting a 15-minute wait rule.',
      suggestions: [
        'Maintain current stop-loss placement without manual tampering.',
        'Enforce a strict 2-trade limit per day on high-impact news days.',
      ],
      createdAt: new Date().toISOString(),
    });
  };

  const handleResetSampleData = () => {
    setTrades(initialTrades);
    setAccounts(initialTradingAccounts);
    setSelectedAccountId(initialTradingAccounts[0].id);
    setStrategies(initialStrategies);
    setDailyPlan(initialDailyPlan);
  };

  const handleLoadEmptyState = () => {
    setTrades([]);
  };

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col antialiased selection:bg-emerald-500/30 selection:text-emerald-300 font-sans"
    >
      {/* Top Header Bar */}
      <Header
        activeAccount={activeAccount}
        account={activeAccount}
        accounts={accounts}
        selectedAccountId={selectedAccountId}
        onSelectAccount={setSelectedAccountId}
        onOpenQuickAdd={() => setIsQuickAddOpen(true)}
        onOpenQuickAddTrade={() => setIsQuickAddOpen(true)}
        onResetData={handleResetSampleData}
        onLoadEmptyState={handleLoadEmptyState}
        hasCustomTrades={trades.length > 0}
        overallScore={traderScore.overallScore}
        currentLanguage={currentLanguage}
        onLanguageChange={setCurrentLanguage}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Desktop Sidebar */}
        <Sidebar
          currentView={currentView}
          onSelectView={setCurrentView}
          accounts={accounts}
          selectedAccountId={selectedAccountId}
          onSelectAccount={setSelectedAccountId}
          propAccount={propAccount}
          language={currentLanguage}
          onSelectLanguage={setCurrentLanguage}
          onOpenQuickAddTrade={() => setIsQuickAddOpen(true)}
        />

        {/* Main Center Stage */}
        <main className="flex-1 overflow-y-auto pb-24 md:pb-8 bg-[#090d16]">
          {(currentView === 'DASHBOARD' || currentView === 'home') && (
            <HomeDashboard
              account={activeAccount}
              propAccount={propAccount}
              trades={trades}
              strategies={strategies}
              traderScore={traderScore}
              aiReport={aiReport}
              language={currentLanguage}
              onNavigate={setCurrentView}
              onOpenQuickAddTrade={() => setIsQuickAddOpen(true)}
              onOpenAddTrade={() => setIsQuickAddOpen(true)}
            />
          )}

          {(currentView === 'TODAY' || currentView === 'today') && (
            <TodayView
              dailyPlan={dailyPlan}
              tradesToday={trades.filter((t) => t.entryTime.slice(0, 10) === new Date().toISOString().slice(0, 10))}
              account={activeAccount}
              trades={trades}
              rules={riskRules}
              onUpdateTasks={(updated) => setDailyPlan((prev) => ({ ...prev, tasks: updated }))}
              onUpdateBias={(bias) => setDailyPlan((prev) => ({ ...prev, primaryBias: bias }))}
              onOpenQuickAddTrade={() => setIsQuickAddOpen(true)}
              onOpenAddTrade={() => setIsQuickAddOpen(true)}
            />
          )}

          {(currentView === 'JOURNAL' || currentView === 'journal') && (
            <JournalView
              trades={trades}
              strategies={strategies}
              onOpenQuickAddTrade={() => setIsQuickAddOpen(true)}
              onOpenAddTrade={() => setIsQuickAddOpen(true)}
              onDeleteTrade={(id) => setTrades((prev) => prev.filter((t) => t.id !== id))}
            />
          )}

          {(currentView === 'STRATEGIES' || currentView === 'strategies') && (
            <StrategiesView
              strategies={strategies}
              trades={trades}
              onAddStrategy={handleAddStrategy}
              onBumpVersion={handleBumpStrategyVersion}
            />
          )}

          {(currentView === 'REPLAY' || currentView === 'replay') && (
            <MarketReplayView onJournalSimulationTrade={handleAddTrade} />
          )}

          {(currentView === 'ANALYTICS' || currentView === 'analytics') && (
            <AnalyticsView trades={trades} strategies={strategies} />
          )}

          {(currentView === 'RISK' || currentView === 'risk') && (
            <RiskManagementView
              account={activeAccount}
              rules={riskRules}
              onUpdateRules={setRiskRules}
            />
          )}

          {(currentView === 'TRADER_SCORE' || currentView === 'traderScore') && (
            <TraderScoreView score={traderScore} />
          )}

          {(currentView === 'COACH' || currentView === 'aiCoach') && (
            <AICoachView
              report={aiReport}
              onRefreshReport={handleRefreshAIReport}
            />
          )}

          {(currentView === 'BACKTEST' || currentView === 'backtest') && (
            <BacktestView strategies={strategies} />
          )}

          {(currentView === 'GOALS' || currentView === 'goals') && (
            <GoalsView
              goals={goals}
              onAddGoal={handleAddGoal}
              onUpdateGoalProgress={handleUpdateGoalProgress}
            />
          )}

          {(currentView === 'PSYCHOLOGY' || currentView === 'psychology') && (
            <PsychologyView
              entries={psychologyEntries}
              trades={trades}
              onAddEntry={handleAddPsychologyEntry}
            />
          )}

          {(currentView === 'ACCOUNTS' || currentView === 'accounts') && (
            <AccountsView
              accounts={accounts}
              selectedAccountId={selectedAccountId}
              onSelectAccount={setSelectedAccountId}
              onAddAccount={handleAddAccount}
            />
          )}

          {(currentView === 'PROP_FIRM' || currentView === 'propFirm') && (
            <PropFirmModeView
              propAccount={propAccount}
              account={activeAccount}
            />
          )}

          {(currentView === 'CSV_IMPORT' || currentView === 'csvImport') && (
            <CsvImportView onImportTrades={handleImportTrades} />
          )}

          {(currentView === 'SETTINGS' || currentView === 'settings') && (
            <SettingsView
              currentLang={currentLanguage}
              onLanguageChange={setCurrentLanguage}
              riskRules={riskRules}
              onUpdateRiskRules={setRiskRules}
            />
          )}

          {(currentView === 'ADMIN' || currentView === 'admin') && (
            <AdminView auditLogs={auditLogs} />
          )}

          {(currentView === 'ARCHITECTURE' || currentView === 'documentation') && (
            <ArchitectureDocView />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav
        currentView={currentView}
        onSelectView={setCurrentView}
        onOpenQuickAddTrade={() => setIsQuickAddOpen(true)}
      />

      {/* Quick Add Trade Modal (Integrated with Live Risk Engine Gatekeeper) */}
      <QuickAddTradeModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        accounts={accounts}
        account={activeAccount}
        currentAccountId={selectedAccountId}
        strategies={strategies}
        riskRules={riskRules}
        todayTradesCount={trades.filter((t) => t.entryTime.slice(0, 10) === new Date().toISOString().slice(0, 10)).length}
        onSaveTrade={handleAddTrade}
        onAddTrade={handleAddTrade}
      />
    </div>
  );
}
