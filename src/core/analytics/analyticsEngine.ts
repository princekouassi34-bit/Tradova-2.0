/**
 * TRADOVA Analytics Engine
 * 
 * Provides deep statistical breakdowns, risk-adjusted returns,
 * behavioral correlations, and session analysis from real journal records.
 */

import { FinancialEngine } from '../calculations/financialEngine';
import { Trade } from '../../types/domain';

export interface PerformanceSummary {
  totalTrades: number;
  openTrades: number;
  closedTrades: number;
  winningTrades: number;
  losingTrades: number;
  breakevenTrades: number;
  winRate: number;
  grossProfit: number;
  grossLoss: number;
  netPnL: number;
  totalFees: number;
  profitFactor: number;
  expectancyDollars: number;
  expectancyR: number;
  averageWin: number;
  averageLoss: number;
  averageR: number;
  maxDrawdownAmount: number;
  maxDrawdownDollars: number;
  maxDrawdownPercent: number;
  currentDrawdownPercent: number;
  maxConsecutiveWins: number;
  maxConsecutiveLosses: number;
  consecutiveWins: number;
  consecutiveLosses: number;
  currentStreak: number; // positive for win streak, negative for loss streak
  winLossRatio: number;
  sharpeRatio: number;
  sortinoRatio: number;
  recoveryFactor: number;
  averageHoldingTimeMinutes: number;
  strategyAdherenceRate: number;
}

export interface GroupPerformance {
  groupKey: string;
  label: string;
  tradesCount: number;
  winRate: number;
  netPnL: number;
  profitFactor: number;
  avgR: number;
}

export class AnalyticsEngine {
  /**
   * Compute comprehensive performance summary for a list of trades
   */
  static computeSummary(trades: Trade[], initialBalance = 100000): PerformanceSummary {
    const closedTrades = trades.filter((t) => t.status === 'CLOSED');
    const openTrades = trades.filter((t) => t.status === 'OPEN');

    if (closedTrades.length === 0) {
      return {
        totalTrades: trades.length,
        openTrades: openTrades.length,
        closedTrades: 0,
        winningTrades: 0,
        losingTrades: 0,
        breakevenTrades: 0,
        winRate: 0,
        grossProfit: 0,
        grossLoss: 0,
        netPnL: 0,
        totalFees: 0,
        profitFactor: 0,
        expectancyDollars: 0,
        expectancyR: 0,
        averageWin: 0,
        averageLoss: 0,
        averageR: 0,
        maxDrawdownAmount: 0,
        maxDrawdownDollars: 0,
        maxDrawdownPercent: 0,
        currentDrawdownPercent: 0,
        maxConsecutiveWins: 0,
        maxConsecutiveLosses: 0,
        consecutiveWins: 0,
        consecutiveLosses: 0,
        currentStreak: 0,
        winLossRatio: 0,
        sharpeRatio: 0,
        sortinoRatio: 0,
        recoveryFactor: 0,
        averageHoldingTimeMinutes: 0,
        strategyAdherenceRate: 100,
      };
    }

    let grossProfit = 0;
    let grossLoss = 0;
    let netPnL = 0;
    let totalFees = 0;
    let followedStrategyCount = 0;
    let totalHoldingMinutes = 0;
    let tradesWithHoldingTime = 0;

    const wins: number[] = [];
    const losses: number[] = [];
    const rMultiples: number[] = [];
    const returnsList: number[] = [];

    // Streak calculation variables
    let maxWins = 0;
    let maxLosses = 0;
    let currentStreakWins = 0;
    let currentStreakLosses = 0;
    let runningStreak = 0;

    // Equity tracking for drawdown
    const equityCurve: number[] = [initialBalance];
    let runningEquity = initialBalance;

    for (const trade of closedTrades) {
      const pnl = trade.netPnL ?? 0;
      netPnL += pnl;
      totalFees += trade.fees;
      runningEquity += pnl;
      equityCurve.push(runningEquity);

      if (trade.strategyFollowed) {
        followedStrategyCount++;
      }

      if (trade.rMultiple !== undefined) {
        rMultiples.push(trade.rMultiple);
      }

      // Holding time calculation
      if (trade.entryTime && trade.exitTime) {
        const start = new Date(trade.entryTime).getTime();
        const end = new Date(trade.exitTime).getTime();
        if (end > start) {
          totalHoldingMinutes += (end - start) / (1000 * 60);
          tradesWithHoldingTime++;
        }
      }

      // Return % relative to account size at that trade
      const returnPct = initialBalance > 0 ? (pnl / initialBalance) * 100 : 0;
      returnsList.push(returnPct);

      if (pnl > 0) {
        grossProfit += pnl;
        wins.push(pnl);
        currentStreakWins++;
        currentStreakLosses = 0;
        runningStreak = runningStreak > 0 ? runningStreak + 1 : 1;
        if (currentStreakWins > maxWins) maxWins = currentStreakWins;
      } else if (pnl < 0) {
        grossLoss += Math.abs(pnl);
        losses.push(Math.abs(pnl));
        currentStreakLosses++;
        currentStreakWins = 0;
        runningStreak = runningStreak < 0 ? runningStreak - 1 : -1;
        if (currentStreakLosses > maxLosses) maxLosses = currentStreakLosses;
      } else {
        // Breakeven
        currentStreakWins = 0;
        currentStreakLosses = 0;
        runningStreak = 0;
      }
    }

    const drawdown = FinancialEngine.calculateDrawdown(equityCurve);
    const winRate = (wins.length / closedTrades.length) * 100;
    const profitFactor = FinancialEngine.calculateProfitFactor(closedTrades.map((t) => ({ netPnL: t.netPnL ?? 0 })));
    const expectancy = FinancialEngine.calculateExpectancy(
      closedTrades.map((t) => ({ netPnL: t.netPnL ?? 0, rMultiple: t.rMultiple }))
    );

    const averageWin = wins.length > 0 ? wins.reduce((a, b) => a + b, 0) / wins.length : 0;
    const averageLoss = losses.length > 0 ? losses.reduce((a, b) => a + b, 0) / losses.length : 0;
    const averageR = rMultiples.length > 0 ? rMultiples.reduce((a, b) => a + b, 0) / rMultiples.length : 0;
    const sharpe = FinancialEngine.calculateSharpeRatio(returnsList);
    const sortino = FinancialEngine.calculateSortinoRatio(returnsList);
    const recovery = FinancialEngine.calculateRecoveryFactor(netPnL, drawdown.maxDrawdownAmount);
    const avgHolding = tradesWithHoldingTime > 0 ? totalHoldingMinutes / tradesWithHoldingTime : 0;
    const adherenceRate = (followedStrategyCount / closedTrades.length) * 100;

    return {
      totalTrades: trades.length,
      openTrades: openTrades.length,
      closedTrades: closedTrades.length,
      winningTrades: wins.length,
      losingTrades: losses.length,
      breakevenTrades: closedTrades.length - wins.length - losses.length,
      winRate: Math.round(winRate * 10) / 10,
      grossProfit: Math.round(grossProfit * 100) / 100,
      grossLoss: Math.round(grossLoss * 100) / 100,
      netPnL: Math.round(netPnL * 100) / 100,
      totalFees: Math.round(totalFees * 100) / 100,
      profitFactor,
      expectancyDollars: expectancy.expectancyDollars,
      expectancyR: expectancy.expectancyR,
      averageWin: Math.round(averageWin * 100) / 100,
      averageLoss: Math.round(averageLoss * 100) / 100,
      averageR: Math.round(averageR * 100) / 100,
      maxDrawdownAmount: drawdown.maxDrawdownAmount,
      maxDrawdownDollars: drawdown.maxDrawdownAmount,
      maxDrawdownPercent: drawdown.maxDrawdownPercent,
      currentDrawdownPercent: drawdown.currentDrawdownPercent,
      maxConsecutiveWins: maxWins,
      maxConsecutiveLosses: maxLosses,
      consecutiveWins: maxWins,
      consecutiveLosses: maxLosses,
      currentStreak: runningStreak,
      winLossRatio: losses.length > 0 ? Math.round((wins.length / losses.length) * 100) / 100 : wins.length,
      sharpeRatio: sharpe,
      sortinoRatio: sortino,
      recoveryFactor: recovery,
      averageHoldingTimeMinutes: Math.round(avgHolding),
      strategyAdherenceRate: Math.round(adherenceRate * 10) / 10,
    };
  }

  /**
   * Group performance by trading session (ASIAN, LONDON, NEW_YORK, etc.)
   */
  static computeSessionStats(trades: Trade[]): GroupPerformance[] {
    return this.groupByField(trades, 'session');
  }

  /**
   * Group performance by psychological state (Calm, FOMO, etc.)
   */
  static computeEmotionStats(trades: Trade[]): GroupPerformance[] {
    return this.groupByField(trades, 'psychologicalState');
  }

  /**
   * Calculate R-multiple distribution buckets
   */
  static computeRDistribution(trades: Trade[]): { bucket: string; count: number }[] {
    const buckets: Record<string, number> = {
      '<-2R': 0,
      '-2R to -1R': 0,
      '-1R to 0R': 0,
      '0R to 1R': 0,
      '1R to 2R': 0,
      '2R to 3R': 0,
      '>3R': 0,
    };

    for (const trade of trades) {
      if (trade.status !== 'CLOSED' || trade.rMultiple === undefined) continue;
      const r = trade.rMultiple;
      if (r < -2) buckets['<-2R']++;
      else if (r < -1) buckets['-2R to -1R']++;
      else if (r < 0) buckets['-1R to 0R']++;
      else if (r < 1) buckets['0R to 1R']++;
      else if (r < 2) buckets['1R to 2R']++;
      else if (r < 3) buckets['2R to 3R']++;
      else buckets['>3R']++;
    }

    return Object.entries(buckets).map(([bucket, count]) => ({ bucket, count }));
  }

  /**
   * Group performance by any field (e.g. session, assetClass, psychologicalState, direction)
   */
  static groupByField(trades: Trade[], fieldKey: keyof Trade): GroupPerformance[] {
    const groups: Record<string, Trade[]> = {};

    for (const trade of trades) {
      if (trade.status !== 'CLOSED') continue;
      const key = String(trade[fieldKey] ?? 'Unknown');
      if (!groups[key]) groups[key] = [];
      groups[key].push(trade);
    }

    return Object.entries(groups).map(([key, groupTrades]) => {
      const summary = this.computeSummary(groupTrades);
      return {
        groupKey: key,
        label: key,
        tradesCount: groupTrades.length,
        winRate: summary.winRate,
        netPnL: summary.netPnL,
        profitFactor: summary.profitFactor,
        avgR: summary.averageR,
      };
    }).sort((a, b) => b.netPnL - a.netPnL);
  }
}
