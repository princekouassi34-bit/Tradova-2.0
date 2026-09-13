/**
 * TRADOVA Domain Types & Database Schemas
 * Core data models covering all 30 entities for PostgreSQL / SQL and application state.
 */

export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'SUPPORT' | 'CONTENT_MANAGER' | 'USER';

export type SubscriptionPlan = 'FREE' | 'PRO' | 'AI_PRO' | 'PROFESSIONAL';

export type AccountType = 'LIVE' | 'DEMO' | 'PROP';

export type TradeDirection = 'LONG' | 'SHORT';

export type TradeStatus = 'OPEN' | 'CLOSED' | 'CANCELLED';

export type AssetClass = 'FOREX' | 'CRYPTO' | 'INDICES' | 'COMMODITIES' | 'EQUITIES' | 'FUTURES';

export type SessionName = 'ASIAN' | 'LONDON' | 'NEW_YORK' | 'LONDON_NY_OVERLAP' | 'MARKET_CLOSE';

export type EmotionalState =
  | 'Calm'
  | 'Confident'
  | 'Fear'
  | 'FOMO'
  | 'Greed'
  | 'Frustration'
  | 'Revenge'
  | 'Tired'
  | 'Impatient'
  | 'Neutral';

export type PropAccountStatus = 'SAFE' | 'WARNING' | 'CRITICAL' | 'BREACHED';

export type RiskCheckStatus = 'ALLOW' | 'WARNING' | 'BLOCK';

export type ImplementationStatus = 'IMPLEMENTED' | 'PREPARED' | 'PENDING';

// 1. User
export interface User {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  plan: SubscriptionPlan;
  avatarUrl?: string;
  is2FAEnabled: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// 2. UserPreferences
export interface UserPreferences {
  userId: string;
  language: 'en' | 'fr' | 'es' | 'pt' | 'de' | 'it' | 'ar' | 'zh' | 'ja' | 'ko' | 'tr';
  currency: 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CAD' | 'AUD' | 'CHF';
  theme: 'dark' | 'light' | 'system';
  defaultRiskPercent: number;
  timezone: string;
  soundAlerts: boolean;
  emailAlerts: boolean;
  pushAlerts: boolean;
}

// 3. Session
export interface AuthSession {
  id: string;
  userId: string;
  token: string;
  ipAddress: string;
  userAgent: string;
  expiresAt: string;
  createdAt: string;
}

// 4. TradingAccount
export interface TradingAccount {
  id: string;
  userId: string;
  name: string;
  broker: string;
  currency: string;
  accountType: AccountType;
  initialBalance: number;
  currentEquity: number;
  currentBalance: number;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

// 5. PropAccount (Prop Firm Mode)
export interface PropAccount {
  id: string;
  accountId: string;
  userId: string;
  firmName: string; // e.g. FTMO, Topstep, FundingPips
  accountSize: number;
  profitTargetAmount: number;
  profitTargetPercent: number;
  maxDailyDrawdownPercent: number;
  maxDailyDrawdownAmount: number;
  maxTotalDrawdownPercent: number;
  maxTotalDrawdownAmount: number;
  currentDailyLoss: number;
  currentTotalDrawdown: number;
  currentProfit: number;
  status: PropAccountStatus;
  phase: 'CHALLENGE_PHASE_1' | 'CHALLENGE_PHASE_2' | 'FUNDED';
  updatedAt: string;
}

// 6. Strategy
export interface Strategy {
  id: string;
  userId: string;
  name: string;
  description: string;
  assetClasses: AssetClass[];
  currentVersion: number;
  colorHex: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// 7. StrategyVersion
export interface StrategyVersion {
  id: string;
  strategyId: string;
  versionNumber: number;
  changelog: string;
  timeframes: string[];
  rules: StrategyRule[];
  createdAt: string;
}

// 8. StrategyRule
export interface StrategyRule {
  id: string;
  strategyVersionId?: string;
  type: 'ENTRY' | 'EXIT' | 'RISK' | 'FILTER';
  conditionLogic: 'AND' | 'OR';
  description: string;
  indicator?: string; // e.g., 'EMA 20 > EMA 50'
  isMandatory: boolean;
}

// 9. Setup
export interface Setup {
  id: string;
  strategyId: string;
  name: string; // e.g., 'Liquidity Sweep + MSS', 'Breakout & Retest'
  description?: string;
  winRateTarget?: number;
}

// 10. TradeScreenshot
export interface TradeScreenshot {
  id: string;
  tradeId: string;
  phase: 'BEFORE' | 'DURING' | 'AFTER';
  url: string;
  caption?: string;
  uploadedAt: string;
}

// 11. Trade
export interface Trade {
  id: string;
  userId: string;
  accountId: string;
  instrument: string; // e.g., 'EURUSD', 'NAS100', 'BTCUSDT', 'XAUUSD'
  assetClass: AssetClass;
  direction: TradeDirection;
  status: TradeStatus;
  strategyId?: string;
  strategyVersionNumber?: number;
  setupId?: string;
  timeframe: string; // '1m', '5m', '15m', '1h', '4h', '1D'
  entryPrice: number;
  stopLossPrice: number;
  takeProfitPrice?: number;
  exitPrice?: number;
  positionSize: number; // in lots or contracts
  riskAmount: number;
  entryTime: string;
  exitTime?: string;
  grossPnL?: number;
  fees: number;
  netPnL?: number;
  rMultiple?: number;
  strategyFollowed: boolean;
  errorType?: 'FOMO' | 'CHASED_ENTRY' | 'EARLY_EXIT' | 'MOVED_STOP_LOSS' | 'OVERSIZED' | 'NO_STOP_LOSS' | 'REVENGE_TRADE' | 'NONE';
  psychologicalState: EmotionalState;
  notes?: string;
  traderReview?: string;
  session: SessionName;
  screenshots?: TradeScreenshot[];
  createdAt: string;
  updatedAt: string;
}

// 12. PsychologyEntry
export interface PsychologyEntry {
  id: string;
  userId: string;
  date: string;
  moodRating: number; // 1 to 10
  confidenceRating: number; // 1 to 10
  stressRating: number; // 1 to 10
  fatigueRating: number; // 1 to 10
  concentrationRating: number; // 1 to 10
  primaryEmotion: EmotionalState;
  notes: string;
  createdAt: string;
}

// 13. TradingSession (Day / Session Log)
export interface TradingSessionLog {
  id: string;
  userId: string;
  sessionName: SessionName;
  date: string;
  plannedTradesCount: number;
  actualTradesCount: number;
  followedPlan: boolean;
  notes?: string;
}

// 14. DailyPlan & 15. DailyTask
export interface DailyPlan {
  id: string;
  userId: string;
  date: string;
  primaryBias: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  keyInstruments: string[];
  maxTradesAllowed: number;
  maxDailyLossAllowed: number;
  mentalStateNotes: string;
  tasks: DailyTask[];
}

export interface DailyTask {
  id: string;
  dailyPlanId: string;
  title: string;
  completed: boolean;
  category: 'PRE_MARKET' | 'EXECUTION' | 'POST_MARKET' | 'MINDSET';
}

// 16. Goal
export interface Goal {
  id: string;
  userId: string;
  title: string;
  description: string;
  type: 'PROCESS' | 'DISCIPLINE' | 'RISK' | 'LEARNING' | 'PROFIT_MILESTONE';
  period: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'LONG_TERM';
  targetValue: number;
  currentValue: number;
  unit: '%' | 'trades' | 'days' | 'R' | '$';
  achieved: boolean;
  deadline?: string;
  createdAt: string;
}

// 17. TraderScore (Pillars & Process evaluation)
export interface TraderScore {
  id: string;
  userId: string;
  date: string;
  overallScore: number; // 0 to 100
  strategyAdherenceScore: number; // 0 to 100 (25%)
  riskManagementScore: number; // 0 to 100 (25%)
  executionScore: number; // 0 to 100 (15%)
  disciplineScore: number; // 0 to 100 (15%)
  consistencyScore: number; // 0 to 100 (10%)
  psychologyScore: number; // 0 to 100 (10%)
  feedbackNotes: string[];
  calculatedAt: string;
}

// 18. Backtest & 19. BacktestTrade & 20. BacktestResult
export interface Backtest {
  id: string;
  userId: string;
  name: string;
  strategyId: string;
  strategyVersionNumber: number;
  instrument: string;
  timeframe: string;
  startDate: string;
  endDate: string;
  initialCapital: number;
  riskPercent: number;
  spreadPips: number;
  commissionPerLot: number;
  slippagePips: number;
  leverage: number;
  status: 'DRAFT' | 'RUNNING' | 'COMPLETED';
  createdAt: string;
}

export interface BacktestTrade {
  id: string;
  backtestId: string;
  barIndex: number;
  timestamp: string;
  direction: TradeDirection;
  entryPrice: number;
  stopLossPrice: number;
  takeProfitPrice: number;
  exitPrice: number;
  exitTime: string;
  pnl: number;
  rMultiple: number;
  exitReason: 'STOP_LOSS' | 'TAKE_PROFIT' | 'TIME_EXIT' | 'RULE_EXIT';
}

export interface BacktestResult {
  id: string;
  backtestId: string;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  profitFactor: number;
  netProfit: number;
  maxDrawdownPercent: number;
  expectancy: number;
  sharpeRatio: number;
  equityCurve: { date: string; equity: number }[];
}

// 21. ReplaySession & 22. ReplayTrade
export interface CandleBar {
  timestamp: number;
  timeString: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface ReplaySession {
  id: string;
  userId: string;
  instrument: string;
  timeframe: string;
  startDate: string;
  currentBarIndex: number;
  totalBars: number;
  speed: number;
  isPlaying: boolean;
  virtualEquity: number;
  initialBalance: number;
  createdAt: string;
}

export interface ReplayTrade {
  id: string;
  replaySessionId: string;
  direction: TradeDirection;
  entryPrice: number;
  stopLossPrice: number;
  takeProfitPrice?: number;
  exitPrice?: number;
  positionSize: number;
  entryBarIndex: number;
  exitBarIndex?: number;
  pnl?: number;
  rMultiple?: number;
  status: 'OPEN' | 'CLOSED';
}

// 23. AICoach Report & Conversations
export interface AICoachReport {
  id: string;
  userId: string;
  reviewType: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  periodDate: string;
  facts: string[];
  statistics: {
    totalTrades: number;
    winRate: number;
    netPnL: number;
    profitFactor: number;
    avgR: number;
    ruleAdherenceRate: number;
  };
  interpretation: string;
  suggestions: string[];
  promptVersion: string;
  createdAt: string;
}

export interface AIConversation {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface AIMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  category?: 'FACT' | 'STATISTIC' | 'INTERPRETATION' | 'SUGGESTION';
  createdAt: string;
}

// 24. AuditLog
export interface AuditLog {
  id: string;
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: Record<string, unknown>;
  ipAddress?: string;
  createdAt: string;
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  timestamp: string;
  ipAddress: string;
}

// 25. Notification
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'RISK_ALERT' | 'PROP_ALERT' | 'GOAL_ACHIEVED' | 'SYSTEM' | 'AI_REPORT';
  isRead: boolean;
  createdAt: string;
}

// 26. Subscription
export interface Subscription {
  id: string;
  userId: string;
  plan: SubscriptionPlan;
  status: 'ACTIVE' | 'PAST_DUE' | 'CANCELLED';
  currentPeriodEnd: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

// 27. Integration
export interface Integration {
  id: string;
  userId: string;
  provider: 'METATRADER_4' | 'METATRADER_5' | 'CTRADER' | 'TRADINGVIEW' | 'INTERACTIVE_BROKERS' | 'TRADOVATE';
  status: 'CONNECTED' | 'DISCONNECTED' | 'SYNCING' | 'ERROR';
  lastSyncAt?: string;
  accountMapping?: Record<string, string>;
}

// 28. Instrument
export interface Instrument {
  symbol: string;
  displayName: string;
  assetClass: AssetClass;
  tickSize: number;
  tickValue: number;
  lotSize: number;
  baseCurrency: string;
}

// 29. MarketDataSource
export interface MarketDataSource {
  id: string;
  name: string;
  type: 'REST' | 'WEBSOCKET' | 'HISTORICAL_CSV';
  status: 'OPERATIONAL' | 'DEGRADED' | 'MAINTENANCE';
  latencyMs: number;
}
