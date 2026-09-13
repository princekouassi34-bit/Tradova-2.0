/**
 * TRADOVA Trader Score Engine
 * 
 * Objective mathematical evaluation of a trader's PROCESS quality,
 * deliberately decoupled from mere lucky streaks or casino-style profit bets.
 * 
 * 6 Core Pillars:
 * 1. Strategy Adherence (25%)
 * 2. Risk Management (25%)
 * 3. Execution (15%)
 * 4. Discipline (15%)
 * 5. Consistency (10%)
 * 6. Psychology (10%)
 */

import { Trade, PsychologyEntry, TraderScore } from '../../types/domain';

export class TraderScoreEngine {
  /**
   * Convenience calculation method
   */
  static calculateTraderScore(trades: Trade[], userBaseline = 1): TraderScore {
    return this.evaluateScore('usr_edge_001', trades, []);
  }

  /**
   * Calculate a comprehensive Trader Score from trade history and psychology logs
   */
  static evaluateScore(
    userId: string,
    trades: Trade[],
    psychologyEntries: PsychologyEntry[]
  ): TraderScore {
    const closedTrades = trades.filter((t) => t.status === 'CLOSED');

    if (closedTrades.length === 0) {
      return {
        id: `ts_${Date.now()}`,
        userId,
        date: new Date().toISOString().split('T')[0],
        overallScore: 70, // Baseline for new account
        strategyAdherenceScore: 70,
        riskManagementScore: 70,
        executionScore: 70,
        disciplineScore: 70,
        consistencyScore: 70,
        psychologyScore: 70,
        feedbackNotes: [
          'Account initiated. Complete at least 5 journaled trades to calibrate your personalized Edge Score.',
        ],
        calculatedAt: new Date().toISOString(),
      };
    }

    const feedbackNotes: string[] = [];

    // 1. Strategy Adherence (25%)
    // Did trader follow their defined strategy rules?
    const followedCount = closedTrades.filter((t) => t.strategyFollowed).length;
    const adherenceRatio = followedCount / closedTrades.length;
    const strategyAdherenceScore = Math.round(adherenceRatio * 100);

    if (strategyAdherenceScore >= 90) {
      feedbackNotes.push('Exceptional strategy compliance: Trading rules are consistently respected.');
    } else if (strategyAdherenceScore < 70) {
      feedbackNotes.push(`Strategy leakage: ${Math.round((1 - adherenceRatio) * 100)}% of trades breached playbook criteria.`);
    }

    // 2. Risk Management (25%)
    // Did trader respect stop losses and avoid catastrophic oversized losses?
    let riskViolations = 0;
    for (const t of closedTrades) {
      if (!t.stopLossPrice || t.stopLossPrice <= 0) riskViolations += 2;
      if (t.errorType === 'MOVED_STOP_LOSS' || t.errorType === 'OVERSIZED') riskViolations += 1.5;
    }
    const maxRiskPenalty = closedTrades.length * 2;
    const riskDeductions = Math.min(100, (riskViolations / (maxRiskPenalty || 1)) * 100);
    const riskManagementScore = Math.max(10, Math.round(100 - riskDeductions));

    if (riskManagementScore >= 85) {
      feedbackNotes.push('Flawless risk protection: Hard stop losses maintained and loss caps respected.');
    } else {
      feedbackNotes.push('Risk vulnerability detected: Avoid moving stop losses or modifying lot sizes mid-trade.');
    }

    // 3. Execution (15%)
    // Chased entries, early exits, slippage
    let executionErrors = 0;
    for (const t of closedTrades) {
      if (t.errorType === 'CHASED_ENTRY' || t.errorType === 'EARLY_EXIT') executionErrors++;
    }
    const executionScore = Math.max(15, Math.round(100 - (executionErrors / closedTrades.length) * 100));

    // 4. Discipline (15%)
    // Overtrading, revenge trades, FOMO
    let disciplineErrors = 0;
    for (const t of closedTrades) {
      if (t.errorType === 'FOMO' || t.errorType === 'REVENGE_TRADE') disciplineErrors += 2;
    }
    const disciplineScore = Math.max(10, Math.round(100 - (disciplineErrors / (closedTrades.length * 2 || 1)) * 100));
    if (disciplineErrors > 0) {
      feedbackNotes.push(`Discipline alert: ${disciplineErrors} instance(s) of FOMO or revenge trading recorded.`);
    }

    // 5. Consistency (10%)
    // Trade distribution & steady R:R rather than erratic lottery outcomes
    const rMultiples = closedTrades.map((t) => t.rMultiple ?? 0);
    const positiveR = rMultiples.filter((r) => r > 0);
    const avgR = positiveR.length > 0 ? positiveR.reduce((a, b) => a + b, 0) / positiveR.length : 0;
    let consistencyScore = 65;
    if (avgR >= 1.5 && avgR <= 4.0) consistencyScore = 88;
    else if (avgR > 4.0) consistencyScore = 80; // Possible outlier spikes
    else consistencyScore = 60;

    // 6. Psychology (10%)
    // Emotional stability and pre/post trade calmness
    let psychologyScore = 75;
    if (psychologyEntries.length > 0) {
      const recent = psychologyEntries.slice(-10);
      const avgMood = recent.reduce((sum, e) => sum + e.moodRating, 0) / recent.length;
      const avgStress = recent.reduce((sum, e) => sum + e.stressRating, 0) / recent.length;
      // High mood + low stress = high score
      psychologyScore = Math.round(Math.min(100, Math.max(20, (avgMood * 10 + (10 - avgStress) * 10) / 2)));
    } else {
      // Check emotional states in trades
      const negativeEmotions = closedTrades.filter(
        (t) => t.psychologicalState === 'Revenge' || t.psychologicalState === 'FOMO' || t.psychologicalState === 'Frustration'
      ).length;
      psychologyScore = Math.max(25, Math.round(100 - (negativeEmotions / closedTrades.length) * 100));
    }

    // Weighted Overall Score calculation
    const overallScore = Math.round(
      strategyAdherenceScore * 0.25 +
      riskManagementScore * 0.25 +
      executionScore * 0.15 +
      disciplineScore * 0.15 +
      consistencyScore * 0.10 +
      psychologyScore * 0.10
    );

    return {
      id: `ts_${Date.now()}`,
      userId,
      date: new Date().toISOString().split('T')[0],
      overallScore: Math.max(1, Math.min(100, overallScore)),
      strategyAdherenceScore,
      riskManagementScore,
      executionScore,
      disciplineScore,
      consistencyScore,
      psychologyScore,
      feedbackNotes,
      calculatedAt: new Date().toISOString(),
    };
  }
}
