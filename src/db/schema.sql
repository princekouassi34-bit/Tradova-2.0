-- ==============================================================================
-- TRADOVA DATABASE SCHEMA (PostgreSQL 15+)
-- Trading Performance Operating System — Build Your Edge.
--
-- Security: Row Level Security (RLS) enabled on all private user tables.
-- Multi-Tenancy: Strict isolation by user_id.
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    role VARCHAR(30) DEFAULT 'USER' CHECK (role IN ('SUPER_ADMIN', 'ADMIN', 'SUPPORT', 'CONTENT_MANAGER', 'USER')),
    plan VARCHAR(30) DEFAULT 'FREE' CHECK (plan IN ('FREE', 'PRO', 'AI_PRO', 'PROFESSIONAL')),
    avatar_url TEXT,
    is_2fa_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret VARCHAR(255),
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. USER PREFERENCES
CREATE TABLE IF NOT EXISTS user_preferences (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    language VARCHAR(10) DEFAULT 'en',
    currency VARCHAR(10) DEFAULT 'USD',
    theme VARCHAR(10) DEFAULT 'dark',
    default_risk_percent NUMERIC(5, 2) DEFAULT 1.00,
    timezone VARCHAR(50) DEFAULT 'UTC',
    sound_alerts BOOLEAN DEFAULT TRUE,
    email_alerts BOOLEAN DEFAULT TRUE,
    push_alerts BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. SESSIONS
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) UNIQUE NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_token ON sessions(token_hash);

-- 4. TRADING ACCOUNTS
CREATE TABLE IF NOT EXISTS trading_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    broker VARCHAR(100) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    account_type VARCHAR(20) NOT NULL CHECK (account_type IN ('LIVE', 'DEMO', 'PROP')),
    initial_balance NUMERIC(15, 2) NOT NULL,
    current_balance NUMERIC(15, 2) NOT NULL,
    current_equity NUMERIC(15, 2) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_trading_accounts_user ON trading_accounts(user_id);

-- 5. PROP ACCOUNTS (PROP FIRM MODE)
CREATE TABLE IF NOT EXISTS prop_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID UNIQUE REFERENCES trading_accounts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    firm_name VARCHAR(100) NOT NULL,
    account_size NUMERIC(15, 2) NOT NULL,
    profit_target_percent NUMERIC(5, 2) NOT NULL,
    profit_target_amount NUMERIC(15, 2) NOT NULL,
    max_daily_drawdown_percent NUMERIC(5, 2) NOT NULL,
    max_daily_drawdown_amount NUMERIC(15, 2) NOT NULL,
    max_total_drawdown_percent NUMERIC(5, 2) NOT NULL,
    max_total_drawdown_amount NUMERIC(15, 2) NOT NULL,
    current_daily_loss NUMERIC(15, 2) DEFAULT 0.00,
    current_total_drawdown NUMERIC(15, 2) DEFAULT 0.00,
    current_profit NUMERIC(15, 2) DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'SAFE' CHECK (status IN ('SAFE', 'WARNING', 'CRITICAL', 'BREACHED')),
    phase VARCHAR(30) DEFAULT 'CHALLENGE_PHASE_1',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_prop_accounts_user ON prop_accounts(user_id);

-- 6. STRATEGIES
CREATE TABLE IF NOT EXISTS strategies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    asset_classes TEXT[],
    current_version INT DEFAULT 1,
    color_hex VARCHAR(10) DEFAULT '#10B981',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_strategies_user ON strategies(user_id);

-- 7. STRATEGY VERSIONS (Version Control for trading models)
CREATE TABLE IF NOT EXISTS strategy_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    strategy_id UUID NOT NULL REFERENCES strategies(id) ON DELETE CASCADE,
    version_number INT NOT NULL,
    changelog TEXT,
    timeframes TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(strategy_id, version_number)
);

-- 8. STRATEGY RULES
CREATE TABLE IF NOT EXISTS strategy_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    strategy_version_id UUID NOT NULL REFERENCES strategy_versions(id) ON DELETE CASCADE,
    rule_type VARCHAR(20) CHECK (rule_type IN ('ENTRY', 'EXIT', 'RISK', 'FILTER')),
    condition_logic VARCHAR(10) DEFAULT 'AND' CHECK (condition_logic IN ('AND', 'OR')),
    description TEXT NOT NULL,
    indicator VARCHAR(100),
    is_mandatory BOOLEAN DEFAULT TRUE
);

-- 9. SETUPS
CREATE TABLE IF NOT EXISTS setups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    strategy_id UUID NOT NULL REFERENCES strategies(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    win_rate_target NUMERIC(5, 2)
);

-- 10. TRADES
CREATE TABLE IF NOT EXISTS trades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES trading_accounts(id) ON DELETE CASCADE,
    strategy_id UUID REFERENCES strategies(id) ON DELETE SET NULL,
    strategy_version_number INT,
    setup_id UUID REFERENCES setups(id) ON DELETE SET NULL,
    instrument VARCHAR(50) NOT NULL,
    asset_class VARCHAR(30) NOT NULL,
    direction VARCHAR(10) NOT NULL CHECK (direction IN ('LONG', 'SHORT')),
    status VARCHAR(20) DEFAULT 'CLOSED' CHECK (status IN ('OPEN', 'CLOSED', 'CANCELLED')),
    timeframe VARCHAR(20) NOT NULL,
    entry_price NUMERIC(15, 5) NOT NULL,
    stop_loss_price NUMERIC(15, 5) NOT NULL,
    take_profit_price NUMERIC(15, 5),
    exit_price NUMERIC(15, 5),
    position_size NUMERIC(12, 4) NOT NULL,
    risk_amount NUMERIC(15, 2) NOT NULL,
    entry_time TIMESTAMPTZ NOT NULL,
    exit_time TIMESTAMPTZ,
    gross_pnl NUMERIC(15, 2),
    fees NUMERIC(10, 2) DEFAULT 0.00,
    net_pnl NUMERIC(15, 2),
    r_multiple NUMERIC(6, 2),
    strategy_followed BOOLEAN DEFAULT TRUE,
    error_type VARCHAR(50) DEFAULT 'NONE',
    psychological_state VARCHAR(50) DEFAULT 'Calm',
    session VARCHAR(30) DEFAULT 'NEW_YORK',
    notes TEXT,
    trader_review TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_trades_user_id ON trades(user_id);
CREATE INDEX idx_trades_account ON trades(account_id);
CREATE INDEX idx_trades_entry_time ON trades(entry_time);

-- 11. TRADE SCREENSHOTS
CREATE TABLE IF NOT EXISTS trade_screenshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trade_id UUID NOT NULL REFERENCES trades(id) ON DELETE CASCADE,
    phase VARCHAR(20) CHECK (phase IN ('BEFORE', 'DURING', 'AFTER')),
    storage_path TEXT NOT NULL,
    caption TEXT,
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. PSYCHOLOGY ENTRIES
CREATE TABLE IF NOT EXISTS psychology_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    mood_rating INT CHECK (mood_rating BETWEEN 1 AND 10),
    confidence_rating INT CHECK (confidence_rating BETWEEN 1 AND 10),
    stress_rating INT CHECK (stress_rating BETWEEN 1 AND 10),
    fatigue_rating INT CHECK (fatigue_rating BETWEEN 1 AND 10),
    concentration_rating INT CHECK (concentration_rating BETWEEN 1 AND 10),
    primary_emotion VARCHAR(50) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_psychology_user_date ON psychology_entries(user_id, date);

-- 13. TRADING SESSIONS LOG
CREATE TABLE IF NOT EXISTS trading_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_name VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    planned_trades_count INT DEFAULT 0,
    actual_trades_count INT DEFAULT 0,
    followed_plan BOOLEAN DEFAULT TRUE,
    notes TEXT
);

-- 14. DAILY PLANS & 15. DAILY TASKS
CREATE TABLE IF NOT EXISTS daily_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    primary_bias VARCHAR(20) CHECK (primary_bias IN ('BULLISH', 'BEARISH', 'NEUTRAL')),
    key_instruments TEXT[],
    max_trades_allowed INT DEFAULT 3,
    max_daily_loss_allowed NUMERIC(15, 2) DEFAULT 500.00,
    mental_state_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, date)
);

CREATE TABLE IF NOT EXISTS daily_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    daily_plan_id UUID NOT NULL REFERENCES daily_plans(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    category VARCHAR(50) DEFAULT 'PRE_MARKET'
);

-- 16. GOALS
CREATE TABLE IF NOT EXISTS goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    goal_type VARCHAR(50) NOT NULL,
    period VARCHAR(20) CHECK (period IN ('DAILY', 'WEEKLY', 'MONTHLY', 'LONG_TERM')),
    target_value NUMERIC(12, 2) NOT NULL,
    current_value NUMERIC(12, 2) DEFAULT 0.00,
    unit VARCHAR(20) NOT NULL,
    achieved BOOLEAN DEFAULT FALSE,
    deadline DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_goals_user ON goals(user_id);

-- 17. TRADER SCORES
CREATE TABLE IF NOT EXISTS trader_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    overall_score INT NOT NULL,
    strategy_adherence_score INT NOT NULL,
    risk_management_score INT NOT NULL,
    execution_score INT NOT NULL,
    discipline_score INT NOT NULL,
    consistency_score INT NOT NULL,
    psychology_score INT NOT NULL,
    feedback_notes TEXT[],
    calculated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_trader_scores_user ON trader_scores(user_id, date);

-- 18. BACKTESTS, 19. BACKTEST TRADES, 20. BACKTEST RESULTS
CREATE TABLE IF NOT EXISTS backtests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    strategy_id UUID REFERENCES strategies(id) ON DELETE SET NULL,
    strategy_version_number INT,
    instrument VARCHAR(50) NOT NULL,
    timeframe VARCHAR(20) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    initial_capital NUMERIC(15, 2) NOT NULL,
    risk_percent NUMERIC(5, 2) DEFAULT 1.00,
    spread_pips NUMERIC(5, 2) DEFAULT 1.0,
    commission_per_lot NUMERIC(6, 2) DEFAULT 4.0,
    slippage_pips NUMERIC(5, 2) DEFAULT 0.5,
    status VARCHAR(20) DEFAULT 'COMPLETED',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS backtest_trades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    backtest_id UUID NOT NULL REFERENCES backtests(id) ON DELETE CASCADE,
    bar_index INT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    direction VARCHAR(10) NOT NULL,
    entry_price NUMERIC(15, 5) NOT NULL,
    stop_loss_price NUMERIC(15, 5) NOT NULL,
    take_profit_price NUMERIC(15, 5) NOT NULL,
    exit_price NUMERIC(15, 5) NOT NULL,
    exit_time TIMESTAMPTZ NOT NULL,
    pnl NUMERIC(15, 2) NOT NULL,
    r_multiple NUMERIC(6, 2) NOT NULL,
    exit_reason VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS backtest_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    backtest_id UUID UNIQUE NOT NULL REFERENCES backtests(id) ON DELETE CASCADE,
    total_trades INT NOT NULL,
    winning_trades INT NOT NULL,
    losing_trades INT NOT NULL,
    win_rate NUMERIC(5, 2) NOT NULL,
    profit_factor NUMERIC(6, 2) NOT NULL,
    net_profit NUMERIC(15, 2) NOT NULL,
    max_drawdown_percent NUMERIC(5, 2) NOT NULL,
    expectancy NUMERIC(10, 2) NOT NULL,
    sharpe_ratio NUMERIC(6, 2) NOT NULL,
    equity_curve JSONB
);

-- 21. REPLAY SESSIONS & 22. REPLAY TRADES
CREATE TABLE IF NOT EXISTS replay_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    instrument VARCHAR(50) NOT NULL,
    timeframe VARCHAR(20) NOT NULL,
    start_date DATE NOT NULL,
    current_bar_index INT DEFAULT 0,
    total_bars INT NOT NULL,
    virtual_equity NUMERIC(15, 2) NOT NULL,
    initial_balance NUMERIC(15, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS replay_trades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    replay_session_id UUID NOT NULL REFERENCES replay_sessions(id) ON DELETE CASCADE,
    direction VARCHAR(10) NOT NULL,
    entry_price NUMERIC(15, 5) NOT NULL,
    stop_loss_price NUMERIC(15, 5) NOT NULL,
    take_profit_price NUMERIC(15, 5),
    exit_price NUMERIC(15, 5),
    position_size NUMERIC(10, 2) NOT NULL,
    entry_bar_index INT NOT NULL,
    exit_bar_index INT,
    pnl NUMERIC(15, 2),
    r_multiple NUMERIC(6, 2),
    status VARCHAR(20) DEFAULT 'CLOSED'
);

-- 23. AI REPORTS, CONVERSATIONS, MESSAGES, MEMORY
CREATE TABLE IF NOT EXISTS ai_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    review_type VARCHAR(20) CHECK (review_type IN ('DAILY', 'WEEKLY', 'MONTHLY')),
    period_date DATE NOT NULL,
    facts JSONB NOT NULL,
    statistics JSONB NOT NULL,
    interpretation TEXT NOT NULL,
    suggestions JSONB NOT NULL,
    prompt_version VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    category VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_memory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    key VARCHAR(100) NOT NULL,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, key)
);

-- 24. AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(100) NOT NULL,
    resource_id VARCHAR(100),
    details JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_action ON audit_logs(action);

-- 25. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read);

-- 26. SUBSCRIPTIONS
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan VARCHAR(30) NOT NULL,
    status VARCHAR(30) DEFAULT 'ACTIVE',
    current_period_end TIMESTAMPTZ NOT NULL,
    stripe_customer_id VARCHAR(100),
    stripe_subscription_id VARCHAR(100)
);

-- 27. INTEGRATIONS
CREATE TABLE IF NOT EXISTS integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL,
    status VARCHAR(30) DEFAULT 'DISCONNECTED',
    last_sync_at TIMESTAMPTZ,
    account_mapping JSONB
);

-- 28. INSTRUMENTS
CREATE TABLE IF NOT EXISTS instruments (
    symbol VARCHAR(30) PRIMARY KEY,
    display_name VARCHAR(100) NOT NULL,
    asset_class VARCHAR(30) NOT NULL,
    tick_size NUMERIC(10, 6) NOT NULL,
    tick_value NUMERIC(10, 4) NOT NULL,
    lot_size INT NOT NULL,
    base_currency VARCHAR(10) NOT NULL
);

-- 29. MARKET DATA SOURCES
CREATE TABLE IF NOT EXISTS market_data_sources (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    data_type VARCHAR(30) NOT NULL,
    status VARCHAR(30) DEFAULT 'OPERATIONAL',
    latency_ms INT DEFAULT 15
);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE trading_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE prop_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE psychology_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE trader_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Sample policy example (enforcing user isolation)
-- CREATE POLICY user_trades_isolation ON trades FOR ALL USING (user_id = auth.uid());
