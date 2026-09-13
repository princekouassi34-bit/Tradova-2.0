import React, { useState, useMemo } from 'react';
import { X, CheckCircle, AlertTriangle, ShieldAlert, Sparkles, Image as ImageIcon } from 'lucide-react';
import { FinancialEngine } from '../../core/calculations/financialEngine';
import { RiskEngine, RiskRuleConfig } from '../../core/risk/riskEngine';
import {
  Trade,
  TradingAccount,
  Strategy,
  TradeDirection,
  EmotionalState,
  SessionName,
  AssetClass,
} from '../../types/domain';

interface QuickAddTradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts?: TradingAccount[];
  account?: TradingAccount;
  strategies?: Strategy[];
  currentAccountId?: string;
  riskRules?: RiskRuleConfig;
  todayTradesCount?: number;
  onSaveTrade?: (trade: Trade) => void;
  onAddTrade?: (trade: Trade) => void;
}

export const QuickAddTradeModal: React.FC<QuickAddTradeModalProps> = ({
  isOpen,
  onClose,
  accounts = [],
  account,
  strategies = [],
  currentAccountId,
  riskRules,
  todayTradesCount = 0,
  onSaveTrade,
  onAddTrade,
}) => {
  const safeAccounts = accounts.length > 0 ? accounts : (account ? [account] : []);
  const [selectedAccountId, setSelectedAccountId] = useState(
    currentAccountId || account?.id || safeAccounts[0]?.id || ''
  );
  const [instrument, setInstrument] = useState('EURUSD');
  const [assetClass, setAssetClass] = useState<AssetClass>('FOREX');
  const [direction, setDirection] = useState<TradeDirection>('LONG');
  const [entryPrice, setEntryPrice] = useState('1.0850');
  const [stopLossPrice, setStopLossPrice] = useState('1.0830');
  const [takeProfitPrice, setTakeProfitPrice] = useState('1.0910');
  const [exitPrice, setExitPrice] = useState('1.0910');
  const [isTradeClosed, setIsTradeClosed] = useState(true);
  const [targetRiskPercent, setTargetRiskPercent] = useState('1.0');
  const [strategyId, setStrategyId] = useState(strategies[0]?.id || '');
  const [strategyFollowed, setStrategyFollowed] = useState(true);
  const [errorType, setErrorType] = useState<Trade['errorType']>('NONE');
  const [psychologicalState, setPsychologicalState] = useState<EmotionalState>('Calm');
  const [session, setSession] = useState<SessionName>('LONDON');
  const [timeframe, setTimeframe] = useState('15m');
  const [notes, setNotes] = useState('');

  const currentAccount = safeAccounts.find((a) => a.id === selectedAccountId) || safeAccounts[0] || account;

  // Default Risk Rules for validation
  const effectiveRules: RiskRuleConfig = useMemo(() => {
    if (riskRules) return riskRules;
    return {
      maxRiskPerTradePercent: 1.5,
      maxRiskPerTradeDollars: (currentAccount?.currentEquity || 100000) * 0.015,
      maxDailyLossDollars: (currentAccount?.currentEquity || 100000) * 0.03,
      maxWeeklyLossDollars: (currentAccount?.currentEquity || 100000) * 0.06,
      maxAccountDrawdownPercent: 8.0,
      maxDailyTradesCount: 5,
      maxOpenTradesCount: 2,
      requireStopLoss: true,
      maxLeverage: 30,
      isPropFirmAccount: currentAccount?.accountType === 'PROP',
      propDailyDrawdownPercent: 5.0,
      propMaxDrawdownPercent: 10.0,
    };
  }, [currentAccount, riskRules]);

  // Live Position Sizing & Risk Engine Check
  const numEntry = parseFloat(entryPrice) || 0;
  const numStop = parseFloat(stopLossPrice) || 0;
  const numTP = parseFloat(takeProfitPrice) || 0;
  const numExit = parseFloat(exitPrice) || numEntry;
  const numRiskPct = parseFloat(targetRiskPercent) || 1.0;

  const positionCalculation = useMemo(() => {
    if (!currentAccount || numEntry <= 0 || numStop <= 0) return null;
    return FinancialEngine.calculatePositionSize({
      accountBalance: currentAccount.currentEquity,
      riskPercent: numRiskPct,
      entryPrice: numEntry,
      stopLossPrice: numStop,
      tickSize: assetClass === 'FOREX' ? 0.0001 : 0.01,
      tickValue: assetClass === 'FOREX' ? 10 : 1,
    });
  }, [currentAccount, numRiskPct, numEntry, numStop, assetClass]);

  const riskValidation = useMemo(() => {
    if (!currentAccount || numEntry <= 0) return null;
    return RiskEngine.validateTrade(
      {
        accountId: currentAccount.id,
        accountBalance: currentAccount.currentEquity,
        currentDailyLoss: 0,
        currentWeeklyLoss: 0,
        currentDrawdownPercent: 1.2,
        openTradesCount: 0,
        todayTradesCount: todayTradesCount,
        instrument,
        direction,
        entryPrice: numEntry,
        stopLossPrice: numStop,
        takeProfitPrice: numTP > 0 ? numTP : undefined,
        requestedLots: positionCalculation?.recommendedLots,
        targetRiskPercent: numRiskPct,
      },
      effectiveRules
    );
  }, [currentAccount, numEntry, numStop, numTP, instrument, direction, positionCalculation, numRiskPct, effectiveRules, todayTradesCount]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!positionCalculation) return;

    // Financial Calculation for Net PnL and R-Multiple
    let grossPnL = 0;
    let netPnL = 0;
    let rMultiple = 0;

    const recommendedLots = positionCalculation.recommendedLots || 1.0;
    const fees = Math.round(recommendedLots * 4 * 100) / 100;

    if (isTradeClosed && numExit > 0) {
      grossPnL = FinancialEngine.calculatePnL({
        direction,
        entryPrice: numEntry,
        exitPrice: numExit,
        positionSize: recommendedLots,
        pointValue: assetClass === 'FOREX' ? 100000 : 100,
      });
      netPnL = FinancialEngine.calculateNetPnL(grossPnL, fees);
      rMultiple = FinancialEngine.calculateRMultiple(netPnL, positionCalculation.riskAmount);
    }

    const selectedStrategy = strategies.find((s) => s.id === strategyId);

    const newTrade: Trade = {
      id: `tr_${Date.now()}`,
      userId: currentAccount.userId,
      accountId: selectedAccountId,
      instrument: instrument.toUpperCase(),
      assetClass,
      direction,
      status: isTradeClosed ? 'CLOSED' : 'OPEN',
      strategyId: strategyId || undefined,
      strategyVersionNumber: selectedStrategy?.currentVersion ?? 1,
      timeframe,
      entryPrice: numEntry,
      stopLossPrice: numStop,
      takeProfitPrice: numTP > 0 ? numTP : undefined,
      exitPrice: isTradeClosed ? numExit : undefined,
      positionSize: recommendedLots,
      riskAmount: positionCalculation.riskAmount,
      entryTime: new Date().toISOString(),
      exitTime: isTradeClosed ? new Date().toISOString() : undefined,
      grossPnL: isTradeClosed ? grossPnL : undefined,
      fees,
      netPnL: isTradeClosed ? netPnL : undefined,
      rMultiple: isTradeClosed ? rMultiple : undefined,
      strategyFollowed,
      errorType: strategyFollowed ? 'NONE' : errorType,
      psychologicalState,
      session,
      notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saveHandler = onSaveTrade || onAddTrade || (() => {});
    saveHandler(newTrade);
    onClose();
  };

  return (
    <div
      id="modal-quick-add-trade"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-[#0f172a] border border-slate-800 rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              Log New Trade Execution
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Financial calculation & Risk Engine active verification
            </p>
          </div>
          <button
            id="btn-close-trade-modal"
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Risk Engine Feedback Banner */}
        {riskValidation && (
          <div
            className={`px-5 py-3 border-b text-xs flex items-center justify-between ${
              riskValidation.status === 'ALLOW'
                ? 'bg-emerald-950/40 border-emerald-900/50 text-emerald-300'
                : riskValidation.status === 'WARNING'
                ? 'bg-amber-950/40 border-amber-900/50 text-amber-300'
                : 'bg-rose-950/40 border-rose-900/50 text-rose-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {riskValidation.status === 'ALLOW' && <CheckCircle className="w-4 h-4 text-emerald-400" />}
              {riskValidation.status === 'WARNING' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
              {riskValidation.status === 'BLOCK' && <ShieldAlert className="w-4 h-4 text-rose-400" />}
              <div>
                <span className="font-bold tracking-wider mr-2">[{riskValidation.status}]</span>
                <span>{riskValidation.recommendation}</span>
              </div>
            </div>
            {positionCalculation && (
              <span className="font-mono font-bold text-slate-200">
                Lots: {positionCalculation.recommendedLots} (${positionCalculation.riskAmount})
              </span>
            )}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          {/* Row 1: Account & Asset */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Trading Account</label>
              <select
                id="trade-account-select"
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-md px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
              >
                {safeAccounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} (${acc.currentEquity.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Instrument Symbol</label>
              <input
                id="trade-instrument-input"
                type="text"
                value={instrument}
                onChange={(e) => setInstrument(e.target.value)}
                placeholder="e.g. EURUSD, NAS100"
                className="w-full bg-slate-900 border border-slate-700 rounded-md px-2.5 py-1.5 text-slate-200 uppercase font-mono font-bold focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Asset Class</label>
              <select
                value={assetClass}
                onChange={(e) => setAssetClass(e.target.value as AssetClass)}
                className="w-full bg-slate-900 border border-slate-700 rounded-md px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="FOREX">Forex</option>
                <option value="INDICES">Indices</option>
                <option value="COMMODITIES">Commodities</option>
                <option value="CRYPTO">Crypto</option>
                <option value="EQUITIES">Equities</option>
                <option value="FUTURES">Futures</option>
              </select>
            </div>
          </div>

          {/* Row 2: Direction & Price Levels */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Direction</label>
              <div className="grid grid-cols-2 gap-1 bg-slate-900 p-0.5 rounded-md border border-slate-700">
                <button
                  type="button"
                  id="trade-direction-long"
                  onClick={() => setDirection('LONG')}
                  className={`py-1 text-center font-bold rounded ${
                    direction === 'LONG'
                      ? 'bg-emerald-600 text-slate-950 font-extrabold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  LONG
                </button>
                <button
                  type="button"
                  id="trade-direction-short"
                  onClick={() => setDirection('SHORT')}
                  className={`py-1 text-center font-bold rounded ${
                    direction === 'SHORT'
                      ? 'bg-rose-600 text-slate-100 font-extrabold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  SHORT
                </button>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Entry Price</label>
              <input
                id="trade-entry-price"
                type="number"
                step="any"
                value={entryPrice}
                onChange={(e) => setEntryPrice(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-md px-2.5 py-1.5 text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Stop Loss (Mandatory)</label>
              <input
                id="trade-sl-price"
                type="number"
                step="any"
                value={stopLossPrice}
                onChange={(e) => setStopLossPrice(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-md px-2.5 py-1.5 text-rose-400 font-mono font-bold focus:outline-none focus:border-rose-500"
                required
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Take Profit</label>
              <input
                id="trade-tp-price"
                type="number"
                step="any"
                value={takeProfitPrice}
                onChange={(e) => setTakeProfitPrice(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-md px-2.5 py-1.5 text-emerald-400 font-mono font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Row 3: Position Size & Risk Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Target Risk %</label>
              <input
                id="trade-risk-percent"
                type="number"
                step="0.1"
                min="0.1"
                max="5.0"
                value={targetRiskPercent}
                onChange={(e) => setTargetRiskPercent(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-md px-2.5 py-1 text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Calculated Lots</label>
              <div className="px-2.5 py-1 bg-slate-800/80 border border-slate-700 rounded-md font-mono text-emerald-400 font-bold">
                {positionCalculation?.recommendedLots ?? '0.00'} lots
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Cash Risk $</label>
              <div className="px-2.5 py-1 bg-slate-800/80 border border-slate-700 rounded-md font-mono text-slate-200 font-bold">
                ${positionCalculation?.riskAmount ?? '0.00'}
              </div>
            </div>
          </div>

          {/* Row 4: Strategy Playbook & Execution Discipline */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Strategy Playbook</label>
              <select
                id="trade-strategy-select"
                value={strategyId}
                onChange={(e) => setStrategyId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-md px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                {strategies.map((strat) => (
                  <option key={strat.id} value={strat.id}>
                    {strat.name} (v{strat.currentVersion})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Playbook Respected?</label>
              <div className="grid grid-cols-2 gap-1 bg-slate-900 p-0.5 rounded-md border border-slate-700">
                <button
                  type="button"
                  onClick={() => {
                    setStrategyFollowed(true);
                    setErrorType('NONE');
                  }}
                  className={`py-1 text-center font-bold rounded ${
                    strategyFollowed
                      ? 'bg-emerald-600 text-slate-950'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  YES
                </button>
                <button
                  type="button"
                  onClick={() => setStrategyFollowed(false)}
                  className={`py-1 text-center font-bold rounded ${
                    !strategyFollowed
                      ? 'bg-rose-600 text-slate-100'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  NO
                </button>
              </div>
            </div>

            {!strategyFollowed && (
              <div>
                <label className="block text-rose-400 font-medium mb-1">Execution Error Type</label>
                <select
                  value={errorType}
                  onChange={(e) => setErrorType(e.target.value as Trade['errorType'])}
                  className="w-full bg-slate-900 border border-rose-500/50 rounded-md px-2.5 py-1.5 text-rose-300 focus:outline-none focus:border-rose-400"
                >
                  <option value="FOMO">FOMO / Chased</option>
                  <option value="CHASED_ENTRY">Chased Entry</option>
                  <option value="EARLY_EXIT">Early Exit Panic</option>
                  <option value="MOVED_STOP_LOSS">Moved Stop Loss</option>
                  <option value="OVERSIZED">Oversized Position</option>
                  <option value="REVENGE_TRADE">Revenge Trade</option>
                </select>
              </div>
            )}

            {strategyFollowed && (
              <div>
                <label className="block text-slate-400 font-medium mb-1">Market Session</label>
                <select
                  value={session}
                  onChange={(e) => setSession(e.target.value as SessionName)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-md px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="LONDON">London Open</option>
                  <option value="NEW_YORK">New York</option>
                  <option value="LONDON_NY_OVERLAP">London/NY Overlap</option>
                  <option value="ASIAN">Asian Session</option>
                  <option value="MARKET_CLOSE">Market Close</option>
                </select>
              </div>
            )}
          </div>

          {/* Row 5: Psychology State (Calm, Confident, FOMO, Revenge, etc.) */}
          <div>
            <label className="block text-slate-400 font-medium mb-1.5">
              Psychological State at Execution
            </label>
            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  'Calm',
                  'Confident',
                  'Neutral',
                  'FOMO',
                  'Fear',
                  'Greed',
                  'Frustration',
                  'Revenge',
                  'Tired',
                  'Impatient',
                ] as EmotionalState[]
              ).map((emotion) => (
                <button
                  type="button"
                  key={emotion}
                  onClick={() => setPsychologicalState(emotion)}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors border ${
                    psychologicalState === emotion
                      ? emotion === 'Calm' || emotion === 'Confident'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                        : emotion === 'FOMO' || emotion === 'Revenge' || emotion === 'Frustration'
                        ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                        : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {emotion}
                </button>
              ))}
            </div>
          </div>

          {/* Row 6: Exit Price if closed */}
          <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-300">Trade Outcome Status</span>
              <div className="flex items-center gap-2">
                <label className="text-slate-400 cursor-pointer flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={isTradeClosed}
                    onChange={(e) => setIsTradeClosed(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-700 text-emerald-500 focus:ring-0"
                  />
                  <span>Trade is already closed</span>
                </label>
              </div>
            </div>

            {isTradeClosed && (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Exit Price</label>
                  <input
                    id="trade-exit-price"
                    type="number"
                    step="any"
                    value={exitPrice}
                    onChange={(e) => setExitPrice(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-md px-2.5 py-1.5 text-slate-100 font-mono font-bold focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Timeframe</label>
                  <select
                    value={timeframe}
                    onChange={(e) => setTimeframe(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-md px-2.5 py-1.5 text-slate-200"
                  >
                    <option value="1m">1m</option>
                    <option value="5m">5m</option>
                    <option value="15m">15m</option>
                    <option value="1h">1h</option>
                    <option value="4h">4h</option>
                    <option value="1D">1D</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Screenshot Storage Note */}
          <div className="p-2.5 rounded-lg border border-dashed border-slate-800 bg-slate-900/30 flex items-center gap-3">
            <ImageIcon className="w-5 h-5 text-slate-500" />
            <div className="text-[11px] text-slate-400">
              <span className="font-semibold text-slate-300">Screenshot Storage Slot:</span> Pre-trade,
              during-trade, and post-trade chart captures can be attached in the Journal drawer.
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-slate-400 font-medium mb-1">Trader Notes & Rationale</label>
            <textarea
              id="trade-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="What market structure or confluence triggered this order?"
              className="w-full bg-slate-900 border border-slate-700 rounded-md p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Submit Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="btn-confirm-save-trade"
              disabled={riskValidation?.status === 'BLOCK'}
              className={`px-5 py-2 rounded-md font-bold transition-all shadow-md ${
                riskValidation?.status === 'BLOCK'
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-950/40 active:scale-[0.98]'
              }`}
            >
              Confirm & Journal Trade
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
