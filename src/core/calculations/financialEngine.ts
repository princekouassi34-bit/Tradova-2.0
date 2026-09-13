/**
 * TRADOVA Financial Calculation Engine
 * 
 * Central Source of Truth for all financial math across:
 * - Trade Journaling
 * - Risk Engine
 * - Backtesting Lab
 * - Market Replay
 * - Analytics & Reporting
 * 
 * All functions are pure, deterministic, and fully tested.
 */

export interface PositionSizeParams {
  accountBalance: number;
  riskPercent: number; // e.g. 1 for 1%
  entryPrice: number;
  stopLossPrice: number;
  tickSize?: number; // default 0.0001 for forex, 0.01 or 1 for indices/crypto
  tickValue?: number; // value per tick per 1 lot (e.g. 10 USD per pip on standard lot EURUSD)
  lotSize?: number; // units per lot (e.g. 100,000 for standard forex)
}

export interface PositionSizeResult {
  riskAmount: number;
  stopDistance: number;
  stopPipsOrPoints: number;
  recommendedLots: number;
  units: number;
  notionalValue: number;
  effectiveRiskPercent: number;
}

export interface PnLParams {
  direction: 'LONG' | 'SHORT';
  entryPrice: number;
  exitPrice: number;
  positionSize: number; // lots
  pointValue?: number; // default multiplier per point/lot
  contractSize?: number;
}

export interface BasicTradeRecord {
  netPnL: number;
  grossPnL?: number;
  riskAmount?: number;
  rMultiple?: number;
  direction?: 'LONG' | 'SHORT';
  date?: string;
}

export interface DrawdownResult {
  maxDrawdownAmount: number;
  maxDrawdownPercent: number;
  currentDrawdownAmount: number;
  currentDrawdownPercent: number;
  peakEquity: number;
  lowestEquity: number;
  drawdownSeries: number[];
}

export class FinancialEngine {
  /**
   * Calculate maximum cash risk allowed based on balance and target percentage
   */
  static calculateRiskAmount(accountBalance: number, riskPercent: number): number {
    if (accountBalance <= 0 || riskPercent <= 0) return 0;
    const amount = (accountBalance * riskPercent) / 100;
    return Math.round(amount * 100) / 100;
  }

  /**
   * Calculate position size in lots/contracts based on account risk and Stop Loss distance
   */
  static calculatePositionSize(params: PositionSizeParams): PositionSizeResult {
    const {
      accountBalance,
      riskPercent,
      entryPrice,
      stopLossPrice,
      tickSize = 0.0001,
      tickValue = 10,
      lotSize = 100000,
    } = params;

    const riskAmount = this.calculateRiskAmount(accountBalance, riskPercent);
    const stopDistance = Math.abs(entryPrice - stopLossPrice);

    if (stopDistance <= 0 || riskAmount <= 0) {
      return {
        riskAmount,
        stopDistance: 0,
        stopPipsOrPoints: 0,
        recommendedLots: 0,
        units: 0,
        notionalValue: 0,
        effectiveRiskPercent: 0,
      };
    }

    // Number of ticks/points in the stop distance
    const ticks = stopDistance / tickSize;
    const riskPerLot = ticks * tickValue;

    let recommendedLots = 0;
    if (riskPerLot > 0) {
      recommendedLots = riskAmount / riskPerLot;
    }

    // Format to 2 decimal places (standard micro-lots)
    recommendedLots = Math.max(0.01, Math.floor(recommendedLots * 100) / 100);

    const units = Math.round(recommendedLots * lotSize);
    const notionalValue = Math.round(units * entryPrice * 100) / 100;
    const actualRisk = recommendedLots * riskPerLot;
    const effectiveRiskPercent = accountBalance > 0 ? (actualRisk / accountBalance) * 100 : 0;

    return {
      riskAmount,
      stopDistance: Math.round(stopDistance * 100000) / 100000,
      stopPipsOrPoints: Math.round(ticks * 10) / 10,
      recommendedLots,
      units,
      notionalValue,
      effectiveRiskPercent: Math.round(effectiveRiskPercent * 100) / 100,
    };
  }

  /**
   * Calculate gross PnL
   */
  static calculatePnL(params: PnLParams): number {
    const { direction, entryPrice, exitPrice, positionSize, pointValue = 100000 } = params;
    const priceDiff = direction === 'LONG' ? exitPrice - entryPrice : entryPrice - exitPrice;
    const gross = priceDiff * positionSize * pointValue;
    return Math.round(gross * 100) / 100;
  }

  /**
   * Calculate trading commissions and spread fees
   */
  static calculateFees(commissionPerLot: number, positionSize: number, spreadCost = 0): number {
    const totalFees = commissionPerLot * positionSize + spreadCost;
    return Math.round(totalFees * 100) / 100;
  }

  /**
   * Calculate Net PnL = Gross PnL - Fees
   */
  static calculateNetPnL(grossPnL: number, fees: number): number {
    return Math.round((grossPnL - fees) * 100) / 100;
  }

  /**
   * Calculate R-Multiple: (Net PnL) / (Initial Risk $)
   * Example: risked $100, made $250 -> 2.5R
   */
  static calculateRMultiple(netPnL: number, riskAmount: number): number {
    if (riskAmount <= 0) return 0;
    const r = netPnL / riskAmount;
    return Math.round(r * 100) / 100;
  }

  /**
   * Calculate sequential equity curve from initial balance and list of trades
   */
  static calculateEquity(startingBalance: number, trades: BasicTradeRecord[]): { equityCurve: number[]; currentEquity: number } {
    const curve: number[] = [startingBalance];
    let runningEquity = startingBalance;

    for (const trade of trades) {
      runningEquity += trade.netPnL;
      curve.push(Math.round(runningEquity * 100) / 100);
    }

    return {
      equityCurve: curve,
      currentEquity: Math.round(runningEquity * 100) / 100,
    };
  }

  /**
   * Calculate peak-to-trough Drawdown metrics from an equity curve
   */
  static calculateDrawdown(equityCurve: number[]): DrawdownResult {
    if (equityCurve.length === 0) {
      return {
        maxDrawdownAmount: 0,
        maxDrawdownPercent: 0,
        currentDrawdownAmount: 0,
        currentDrawdownPercent: 0,
        peakEquity: 0,
        lowestEquity: 0,
        drawdownSeries: [],
      };
    }

    let peak = equityCurve[0];
    let maxDdAmount = 0;
    let maxDdPercent = 0;
    let lowest = equityCurve[0];
    const ddSeries: number[] = [];

    for (const equity of equityCurve) {
      if (equity > peak) {
        peak = equity;
      }
      if (equity < lowest) {
        lowest = equity;
      }

      const ddAmount = peak - equity;
      const ddPercent = peak > 0 ? (ddAmount / peak) * 100 : 0;
      ddSeries.push(Math.round(ddPercent * 100) / 100);

      if (ddAmount > maxDdAmount) {
        maxDdAmount = ddAmount;
      }
      if (ddPercent > maxDdPercent) {
        maxDdPercent = ddPercent;
      }
    }

    const currentEquity = equityCurve[equityCurve.length - 1];
    const currentDdAmount = peak - currentEquity;
    const currentDdPercent = peak > 0 ? (currentDdAmount / peak) * 100 : 0;

    return {
      maxDrawdownAmount: Math.round(maxDdAmount * 100) / 100,
      maxDrawdownPercent: Math.round(maxDdPercent * 100) / 100,
      currentDrawdownAmount: Math.round(currentDdAmount * 100) / 100,
      currentDrawdownPercent: Math.round(currentDdPercent * 100) / 100,
      peakEquity: Math.round(peak * 100) / 100,
      lowestEquity: Math.round(lowest * 100) / 100,
      drawdownSeries: ddSeries,
    };
  }

  /**
   * Calculate Win Rate (% of winning trades)
   */
  static calculateWinRate(trades: BasicTradeRecord[]): number {
    if (trades.length === 0) return 0;
    const wins = trades.filter((t) => t.netPnL > 0).length;
    const rate = (wins / trades.length) * 100;
    return Math.round(rate * 10) / 10;
  }

  /**
   * Calculate Profit Factor = Gross Profit / Gross Loss
   */
  static calculateProfitFactor(trades: BasicTradeRecord[]): number {
    let grossProfit = 0;
    let grossLoss = 0;

    for (const t of trades) {
      if (t.netPnL > 0) {
        grossProfit += t.netPnL;
      } else if (t.netPnL < 0) {
        grossLoss += Math.abs(t.netPnL);
      }
    }

    if (grossLoss === 0) {
      return grossProfit > 0 ? 99.99 : 0;
    }

    const pf = grossProfit / grossLoss;
    return Math.round(pf * 100) / 100;
  }

  /**
   * Calculate Mathematical Expectancy per trade:
   * (WinRate * AvgWin) - (LossRate * AvgLoss)
   */
  static calculateExpectancy(trades: BasicTradeRecord[]): { expectancyDollars: number; expectancyR: number } {
    if (trades.length === 0) return { expectancyDollars: 0, expectancyR: 0 };

    const wins = trades.filter((t) => t.netPnL > 0);
    const losses = trades.filter((t) => t.netPnL < 0);

    const winRate = wins.length / trades.length;
    const lossRate = losses.length / trades.length;

    const avgWin = wins.length > 0 ? wins.reduce((acc, t) => acc + t.netPnL, 0) / wins.length : 0;
    const avgLoss = losses.length > 0 ? Math.abs(losses.reduce((acc, t) => acc + t.netPnL, 0)) / losses.length : 0;

    const expectancyDollars = winRate * avgWin - lossRate * avgLoss;

    // Expectancy in R
    const rValues = trades.map((t) => t.rMultiple ?? 0);
    const avgR = rValues.length > 0 ? rValues.reduce((a, b) => a + b, 0) / rValues.length : 0;

    return {
      expectancyDollars: Math.round(expectancyDollars * 100) / 100,
      expectancyR: Math.round(avgR * 100) / 100,
    };
  }

  /**
   * Sharpe Ratio calculation (annualized or per-trade)
   */
  static calculateSharpeRatio(returns: number[], riskFreeRate = 0): number {
    if (returns.length < 2) return 0;
    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (returns.length - 1);
    const stdDev = Math.sqrt(variance);
    if (stdDev === 0) return 0;
    return Math.round(((mean - riskFreeRate) / stdDev) * 100) / 100;
  }

  /**
   * Sortino Ratio (focusing solely on downside volatility)
   */
  static calculateSortinoRatio(returns: number[], riskFreeRate = 0): number {
    if (returns.length < 2) return 0;
    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const downsideReturns = returns.filter((r) => r < 0);
    if (downsideReturns.length === 0) return 99.99;

    const downsideVariance =
      downsideReturns.reduce((acc, val) => acc + Math.pow(val, 2), 0) / downsideReturns.length;
    const downsideDeviation = Math.sqrt(downsideVariance);
    if (downsideDeviation === 0) return 0;
    return Math.round(((mean - riskFreeRate) / downsideDeviation) * 100) / 100;
  }

  /**
   * Recovery Factor = Net Profit / Max Drawdown Amount
   */
  static calculateRecoveryFactor(netProfit: number, maxDrawdownAmount: number): number {
    if (maxDrawdownAmount <= 0) return netProfit > 0 ? 99.99 : 0;
    const rf = netProfit / maxDrawdownAmount;
    return Math.round(rf * 100) / 100;
  }
}
