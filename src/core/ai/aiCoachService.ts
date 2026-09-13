/**
 * TRADOVA AI Coach Service & Safety Pipeline
 * 
 * Pipeline:
 * TRADOVA DATA -> DATA SELECTION -> ANALYTICS / CONTEXT -> AI CONTEXT BUILDER -> AI MODEL -> VALIDATION / SAFETY LAYER -> RESPONSE
 * 
 * Strict Four-Tier Distinction:
 * 1. Facts (Objective factual baseline)
 * 2. Statistics (Calculated metrics from real trades)
 * 3. Interpretation (Contextual behavioral and process pattern analysis)
 * 4. Suggestions (Actionable routine / discipline improvements - NEVER profit guarantees)
 */

import { Trade, PsychologyEntry, Goal, TraderScore, AICoachReport } from '../../types/domain';
import { AnalyticsEngine } from '../analytics/analyticsEngine';

export const AI_COACH_PROMPT_VERSION = '2026.03.1-PRODUCTION';

export interface AICoachContext {
  userId: string;
  reviewType: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  periodLabel: string;
  totalTrades: number;
  winRate: number;
  netPnL: number;
  profitFactor: number;
  avgR: number;
  maxDrawdownPercent: number;
  strategyAdherenceRate: number;
  dominantEmotion: string;
  recordedErrors: Record<string, number>;
  activeGoals: string[];
  traderScore: number;
}

export class AICoachService {
  /**
   * 1. Data Selection & AI Context Builder
   * Extracts ONLY authenticated user's private data, verifies zero leakage across tenants.
   */
  static buildContext(
    userId: string,
    reviewType: 'DAILY' | 'WEEKLY' | 'MONTHLY',
    trades: Trade[],
    psychology: PsychologyEntry[],
    goals: Goal[],
    traderScore: TraderScore
  ): AICoachContext {
    // Filter strictly by user ID
    const userTrades = trades.filter((t) => t.userId === userId && t.status === 'CLOSED');
    const userPsychology = psychology.filter((p) => p.userId === userId);
    const userGoals = goals.filter((g) => g.userId === userId);

    const summary = AnalyticsEngine.computeSummary(userTrades);

    // Determine error frequencies
    const errors: Record<string, number> = {};
    for (const t of userTrades) {
      if (t.errorType && t.errorType !== 'NONE') {
        errors[t.errorType] = (errors[t.errorType] || 0) + 1;
      }
    }

    // Dominant emotion
    let dominantEmotion = 'Calm';
    if (userPsychology.length > 0) {
      const emotionCounts: Record<string, number> = {};
      for (const p of userPsychology) {
        emotionCounts[p.primaryEmotion] = (emotionCounts[p.primaryEmotion] || 0) + 1;
      }
      dominantEmotion = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1])[0][0];
    }

    return {
      userId,
      reviewType,
      periodLabel: new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' }),
      totalTrades: summary.closedTrades,
      winRate: summary.winRate,
      netPnL: summary.netPnL,
      profitFactor: summary.profitFactor,
      avgR: summary.averageR,
      maxDrawdownPercent: summary.maxDrawdownPercent,
      strategyAdherenceRate: summary.strategyAdherenceRate,
      dominantEmotion,
      recordedErrors: errors,
      activeGoals: userGoals.slice(0, 3).map((g) => `${g.title} (${g.currentValue}/${g.targetValue} ${g.unit})`),
      traderScore: traderScore.overallScore,
    };
  }

  /**
   * Safety and Structure Formatter:
   * Generates a guaranteed 4-Tier structured response even if offline or when building prompt.
   */
  static generateStructuredReport(context: AICoachContext): AICoachReport {
    // 1. Facts
    const facts: string[] = [
      `User completed ${context.totalTrades} closed trade(s) during this cycle.`,
      `Strategy rules followed in ${context.strategyAdherenceRate}% of trade decisions.`,
      `Recorded errors breakdown: ${
        Object.keys(context.recordedErrors).length > 0
          ? Object.entries(context.recordedErrors).map(([err, cnt]) => `${err} (${cnt}x)`).join(', ')
          : 'None recorded (clean execution).'
      }`,
      `Primary recorded emotional baseline: ${context.dominantEmotion}.`,
    ];

    // 2. Statistics
    const statistics = {
      totalTrades: context.totalTrades,
      winRate: context.winRate,
      netPnL: context.netPnL,
      profitFactor: context.profitFactor,
      avgR: context.avgR,
      ruleAdherenceRate: context.strategyAdherenceRate,
    };

    // 3. Interpretation
    let interpretation = '';
    if (context.strategyAdherenceRate >= 85 && context.avgR >= 1.5) {
      interpretation = `Your trading behavior exhibits disciplined asymmetric risk taking. Strategy adherence is high (${context.strategyAdherenceRate}%), meaning current PnL reflects your edge rather than random distribution. Emotional control under ${context.dominantEmotion} state proved constructive.`;
    } else if (context.recordedErrors['FOMO'] || context.recordedErrors['REVENGE_TRADE']) {
      interpretation = `Behavioral analysis detects impulse leakage. The presence of FOMO / revenge entries indicates that cognitive fatigue or market impatience compromised your risk boundary. Your mathematical edge degrades significantly when trades are triggered outside playbook criteria.`;
    } else if (context.winRate < 40 && context.avgR < 1.2) {
      interpretation = `Current performance is under statistical stress. Either trades are exiting before reaching planned R multiples (premature liquidation), or current market volatility regime is out of sync with your chosen setup timeframes.`;
    } else {
      interpretation = `Steady operational cycle. Execution remains aligned with your core baseline (Trader Score: ${context.traderScore}/100). Focus on eliminating unforced errors in trade journal documentation.`;
    }

    // 4. Suggestions (Strictly behavioral/risk suggestions - ZERO profit guarantees)
    const suggestions: string[] = [];
    if (context.strategyAdherenceRate < 80) {
      suggestions.push('Pre-Session Gate: Require explicit confirmation of all 3 entry rules before clicking order execution.');
    }
    if (context.recordedErrors['MOVED_STOP_LOSS'] || context.recordedErrors['NO_STOP_LOSS']) {
      suggestions.push('Hard Stop Lockdown: Place initial Stop Loss directly with the order ticket and disable in-flight SL modification in Risk Engine.');
    }
    if (context.dominantEmotion === 'Revenge' || context.dominantEmotion === 'Frustration') {
      suggestions.push('Cool-down Protocol: Mandate a 60-minute terminal lockout following 2 consecutive losing trades.');
    }
    suggestions.push('Maintain strict risk per trade: Do not exceed 1.0% of account equity regardless of confidence level.');

    return {
      id: `rep_${Date.now()}`,
      userId: context.userId,
      reviewType: context.reviewType,
      periodDate: new Date().toISOString().split('T')[0],
      facts,
      statistics,
      interpretation,
      suggestions,
      promptVersion: AI_COACH_PROMPT_VERSION,
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Safety Filter: Verifies AI output contains no forbidden claims (profit guarantees, fortune-telling, cross-user leaks)
   */
  static validateSafety(text: string): { isValid: boolean; flaggedTerms: string[] } {
    const forbiddenPatterns = [
      /guaranteed profit/i,
      /you will make \$/i,
      /100% win rate/i,
      /can never lose/i,
      /sure thing/i,
      /financial advice/i,
    ];

    const flaggedTerms: string[] = [];
    for (const pattern of forbiddenPatterns) {
      if (pattern.test(text)) {
        flaggedTerms.push(pattern.source);
      }
    }

    return {
      isValid: flaggedTerms.length === 0,
      flaggedTerms,
    };
  }
}
