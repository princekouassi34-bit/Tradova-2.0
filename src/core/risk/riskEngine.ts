/**
 * TRADOVA Risk Engine
 * 
 * Flow:
 * TRADE REQUEST -> RISK ENGINE -> CHECK RULES -> CALCULATE POSITION -> VALIDATE -> ALLOW / WARNING / BLOCK
 * 
 * Protects trader capital and Prop Firm rules before any order execution.
 */

import { FinancialEngine } from '../calculations/financialEngine';
import { RiskCheckStatus, TradeDirection } from '../../types/domain';

export interface RiskRuleConfig {
  maxRiskPerTradePercent: number; // e.g. 1.5%
  maxRiskPerTradeDollars: number; // e.g. $1,500
  maxDailyLossDollars: number; // e.g. $2,500
  maxWeeklyLossDollars: number; // e.g. $5,000
  maxAccountDrawdownPercent: number; // e.g. 8%
  maxDailyTradesCount: number; // e.g. 5 trades
  maxOpenTradesCount: number; // e.g. 2
  requireStopLoss: boolean;
  maxLeverage: number; // e.g. 30
  isPropFirmAccount: boolean;
  propDailyDrawdownPercent?: number; // e.g. 5%
  propMaxDrawdownPercent?: number; // e.g. 10%
}

export interface TradeValidationRequest {
  accountId: string;
  accountBalance: number;
  currentDailyLoss: number;
  currentWeeklyLoss: number;
  currentDrawdownPercent: number;
  openTradesCount: number;
  todayTradesCount: number;
  instrument: string;
  direction: TradeDirection;
  entryPrice: number;
  stopLossPrice?: number;
  takeProfitPrice?: number;
  requestedLots?: number;
  targetRiskPercent?: number;
  tickSize?: number;
  tickValue?: number;
}

export interface RiskCheckViolation {
  code: string;
  severity: 'BLOCK' | 'WARNING';
  message: string;
  limit: number | string;
  attempted: number | string;
}

export interface RiskValidationResult {
  status: RiskCheckStatus;
  isAllowed: boolean;
  violations: RiskCheckViolation[];
  calculatedRiskAmount: number;
  calculatedLots: number;
  effectiveRiskPercent: number;
  rMultipleProjected?: number;
  recommendation: string;
}

export class RiskEngine {
  /**
   * Main entry point for trade validation against defined risk rules
   */
  static validateTrade(
    request: TradeValidationRequest,
    rules: RiskRuleConfig
  ): RiskValidationResult {
    const violations: RiskCheckViolation[] = [];

    // 1. Mandatory Stop Loss Check
    if (rules.requireStopLoss && (!request.stopLossPrice || request.stopLossPrice <= 0)) {
      violations.push({
        code: 'NO_STOP_LOSS',
        severity: 'BLOCK',
        message: 'Trading without a Stop Loss is strictly prohibited by risk rules.',
        limit: 'Stop Loss required',
        attempted: 'No SL provided',
      });
    }

    // 2. Stop Loss direction consistency
    if (request.stopLossPrice && request.stopLossPrice > 0) {
      if (request.direction === 'LONG' && request.stopLossPrice >= request.entryPrice) {
        violations.push({
          code: 'INVALID_SL_LONG',
          severity: 'BLOCK',
          message: 'For LONG trades, Stop Loss price must be strictly BELOW the entry price.',
          limit: `< ${request.entryPrice}`,
          attempted: request.stopLossPrice,
        });
      } else if (request.direction === 'SHORT' && request.stopLossPrice <= request.entryPrice) {
        violations.push({
          code: 'INVALID_SL_SHORT',
          severity: 'BLOCK',
          message: 'For SHORT trades, Stop Loss price must be strictly ABOVE the entry price.',
          limit: `> ${request.entryPrice}`,
          attempted: request.stopLossPrice,
        });
      }
    }

    // 3. Daily Loss Limit Check
    if (request.currentDailyLoss >= rules.maxDailyLossDollars) {
      violations.push({
        code: 'DAILY_LOSS_LIMIT_REACHED',
        severity: 'BLOCK',
        message: 'Max daily loss threshold reached. Stop trading for the remainder of the session.',
        limit: `$${rules.maxDailyLossDollars}`,
        attempted: `$${request.currentDailyLoss}`,
      });
    }

    // 4. Weekly Loss Limit Check
    if (request.currentWeeklyLoss >= rules.maxWeeklyLossDollars) {
      violations.push({
        code: 'WEEKLY_LOSS_LIMIT_REACHED',
        severity: 'BLOCK',
        message: 'Max weekly loss threshold reached. Lock terminal until next weekly open.',
        limit: `$${rules.maxWeeklyLossDollars}`,
        attempted: `$${request.currentWeeklyLoss}`,
      });
    }

    // 5. Account Max Drawdown Check
    if (request.currentDrawdownPercent >= rules.maxAccountDrawdownPercent) {
      violations.push({
        code: 'ACCOUNT_DRAWDOWN_LIMIT',
        severity: 'BLOCK',
        message: 'Account drawdown limit reached. Capital preservation protocol activated.',
        limit: `${rules.maxAccountDrawdownPercent}%`,
        attempted: `${request.currentDrawdownPercent}%`,
      });
    }

    // 6. Max Daily Trades Count Check
    if (request.todayTradesCount >= rules.maxDailyTradesCount) {
      violations.push({
        code: 'MAX_DAILY_TRADES_EXCEEDED',
        severity: 'BLOCK',
        message: 'Daily trade frequency quota exceeded (Overtrading prevention).',
        limit: rules.maxDailyTradesCount,
        attempted: request.todayTradesCount,
      });
    }

    // 7. Max Open Trades Count Check
    if (request.openTradesCount >= rules.maxOpenTradesCount) {
      violations.push({
        code: 'MAX_OPEN_POSITIONS',
        severity: 'BLOCK',
        message: 'Maximum concurrent open positions reached. Manage existing exposure first.',
        limit: rules.maxOpenTradesCount,
        attempted: request.openTradesCount,
      });
    }

    // 8. Prop Firm Specific Rules Check
    if (rules.isPropFirmAccount) {
      const dailyDdLimit = rules.propDailyDrawdownPercent ?? 5;
      const totalDdLimit = rules.propMaxDrawdownPercent ?? 10;

      // Close to daily breach threshold warning
      const dailyLossPercent = (request.currentDailyLoss / request.accountBalance) * 100;
      if (dailyLossPercent >= dailyDdLimit * 0.8) {
        violations.push({
          code: 'PROP_DAILY_DD_WARNING',
          severity: dailyLossPercent >= dailyDdLimit ? 'BLOCK' : 'WARNING',
          message: `Prop Firm daily drawdown near/at ceiling (${dailyLossPercent.toFixed(1)}% / ${dailyDdLimit}% limit).`,
          limit: `${dailyDdLimit}%`,
          attempted: `${dailyLossPercent.toFixed(1)}%`,
        });
      }

      if (request.currentDrawdownPercent >= totalDdLimit * 0.85) {
        violations.push({
          code: 'PROP_TOTAL_DD_CRITICAL',
          severity: request.currentDrawdownPercent >= totalDdLimit ? 'BLOCK' : 'WARNING',
          message: `Prop Firm maximum drawdown near danger zone (${request.currentDrawdownPercent.toFixed(1)}% / ${totalDdLimit}% limit).`,
          limit: `${totalDdLimit}%`,
          attempted: `${request.currentDrawdownPercent.toFixed(1)}%`,
        });
      }
    }

    // 9. Position Sizing & Risk calculation
    const targetRiskPct = request.targetRiskPercent ?? rules.maxRiskPerTradePercent;
    let calculatedLots = 0;
    let calculatedRiskAmount = 0;
    let effectiveRiskPercent = 0;

    if (request.stopLossPrice && request.stopLossPrice > 0) {
      const sizing = FinancialEngine.calculatePositionSize({
        accountBalance: request.accountBalance,
        riskPercent: targetRiskPct,
        entryPrice: request.entryPrice,
        stopLossPrice: request.stopLossPrice,
        tickSize: request.tickSize,
        tickValue: request.tickValue,
      });

      calculatedLots = request.requestedLots ?? sizing.recommendedLots;
      calculatedRiskAmount = sizing.riskAmount;
      effectiveRiskPercent = sizing.effectiveRiskPercent;

      // Check if requested lots exceeds risk limits
      if (request.requestedLots && request.requestedLots > sizing.recommendedLots * 1.05) {
        violations.push({
          code: 'OVERSIZED_POSITION',
          severity: 'BLOCK',
          message: `Requested position size (${request.requestedLots} lots) exceeds maximum safe risk allocation (${sizing.recommendedLots} lots).`,
          limit: `${sizing.recommendedLots} lots`,
          attempted: `${request.requestedLots} lots`,
        });
      }

      if (calculatedRiskAmount > rules.maxRiskPerTradeDollars) {
        violations.push({
          code: 'MAX_RISK_DOLLARS_EXCEEDED',
          severity: 'BLOCK',
          message: `Cash risk ($${calculatedRiskAmount.toFixed(2)}) exceeds maximum dollar risk cap ($${rules.maxRiskPerTradeDollars}).`,
          limit: `$${rules.maxRiskPerTradeDollars}`,
          attempted: `$${calculatedRiskAmount.toFixed(2)}`,
        });
      }

      if (effectiveRiskPercent > rules.maxRiskPerTradePercent) {
        violations.push({
          code: 'MAX_RISK_PERCENT_EXCEEDED',
          severity: 'BLOCK',
          message: `Risk of ${effectiveRiskPercent.toFixed(2)}% exceeds max permitted ${rules.maxRiskPerTradePercent}%.`,
          limit: `${rules.maxRiskPerTradePercent}%`,
          attempted: `${effectiveRiskPercent.toFixed(2)}%`,
        });
      }
    }

    // 10. Projected Risk:Reward Ratio Check
    let rMultipleProjected: number | undefined;
    if (request.stopLossPrice && request.takeProfitPrice) {
      const riskDistance = Math.abs(request.entryPrice - request.stopLossPrice);
      const rewardDistance = Math.abs(request.takeProfitPrice - request.entryPrice);
      if (riskDistance > 0) {
        rMultipleProjected = Math.round((rewardDistance / riskDistance) * 100) / 100;
        if (rMultipleProjected < 1.0) {
          violations.push({
            code: 'POOR_RISK_REWARD',
            severity: 'WARNING',
            message: `Projected reward-to-risk ratio is below 1:1 (${rMultipleProjected}R). Elite traders prioritize >= 1.5R.`,
            limit: '>= 1.5R',
            attempted: `${rMultipleProjected}R`,
          });
        }
      }
    }

    // Determine Final Status
    const hasBlock = violations.some((v) => v.severity === 'BLOCK');
    const hasWarning = violations.some((v) => v.severity === 'WARNING');

    let status: RiskCheckStatus = 'ALLOW';
    let recommendation = 'Trade complies with all risk parameters. Execution approved.';

    if (hasBlock) {
      status = 'BLOCK';
      recommendation = 'Trade blocked by Risk Engine. Violates key capital protection rules.';
    } else if (hasWarning) {
      status = 'WARNING';
      recommendation = 'Trade permitted with cautions. Review warnings before placing order.';
    }

    return {
      status,
      isAllowed: !hasBlock,
      violations,
      calculatedRiskAmount,
      calculatedLots,
      effectiveRiskPercent,
      rMultipleProjected,
      recommendation,
    };
  }
}
