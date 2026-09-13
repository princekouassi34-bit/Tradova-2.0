/**
 * TRADOVA Market Replay & Simulation Engine
 * 
 * Strict Zero-Lookahead Architecture:
 * The trader / simulation runner NEVER sees or accesses future candle bars
 * until they are sequentially revealed by the replay clock.
 */

import { CandleBar, TradeDirection, Trade } from '../../types/domain';
import { FinancialEngine } from '../calculations/financialEngine';

export type ReplayBar = CandleBar;

export interface ReplayPosition {
  id: string;
  direction: TradeDirection;
  entryPrice: number;
  stopLoss?: number;
  takeProfit?: number;
  lots: number;
  entryBarIndex: number;
  exitBarIndex?: number;
  exitPrice?: number;
  exitReason?: 'STOP_LOSS' | 'TAKE_PROFIT' | 'MANUAL';
  unrealizedPnL: number;
  unrealizedR: number;
  status: 'OPEN' | 'CLOSED';
}

export interface ActiveReplayPosition {
  id: string;
  direction: TradeDirection;
  entryPrice: number;
  stopLossPrice: number;
  takeProfitPrice: number;
  positionSize: number; // lots
  entryBarIndex: number;
  entryTime: string;
  unrealizedPnL: number;
  unrealizedR: number;
}

export class ReplayEngine {
  private instrument: string;
  private timeframe: string;
  private startPrice: number;
  private totalCount: number;
  private allBars: CandleBar[] = [];
  private currentRevealedIndex = 15;
  private activePosition: ReplayPosition | null = null;
  private closedPositions: ReplayPosition[] = [];

  constructor(
    instrument = 'EURUSD',
    timeframe = '15m',
    startPrice = 1.0850,
    count = 70
  ) {
    this.instrument = instrument;
    this.timeframe = timeframe;
    this.startPrice = startPrice;
    this.totalCount = count;
    this.reset();
  }

  reset(): void {
    this.allBars = ReplayEngine.generateHistoricalBars(
      this.instrument,
      this.totalCount,
      this.startPrice
    );
    this.currentRevealedIndex = 15;
    this.activePosition = null;
    this.closedPositions = [];
  }

  getRevealedBars(): CandleBar[] {
    return this.allBars.slice(0, this.currentRevealedIndex);
  }

  getTotalBars(): number {
    return this.allBars.length;
  }

  getCurrentIndex(): number {
    return this.currentRevealedIndex;
  }

  canStep(): boolean {
    return this.currentRevealedIndex < this.allBars.length;
  }

  getActivePosition(): ReplayPosition | null {
    return this.activePosition;
  }

  getClosedPositions(): ReplayPosition[] {
    return this.closedPositions;
  }

  openPosition(params: {
    direction: TradeDirection;
    entryPrice: number;
    lots: number;
    stopLoss?: number;
    takeProfit?: number;
  }): ReplayPosition {
    const pos: ReplayPosition = {
      id: `rpos_${Date.now()}`,
      direction: params.direction,
      entryPrice: params.entryPrice,
      stopLoss: params.stopLoss,
      takeProfit: params.takeProfit,
      lots: params.lots,
      entryBarIndex: this.currentRevealedIndex - 1,
      unrealizedPnL: 0,
      unrealizedR: 0,
      status: 'OPEN',
    };
    this.activePosition = pos;
    return pos;
  }

  closeActivePosition(reason: 'STOP_LOSS' | 'TAKE_PROFIT' | 'MANUAL' = 'MANUAL'): void {
    if (!this.activePosition) return;
    const currentBar = this.allBars[this.currentRevealedIndex - 1];
    this.activePosition.exitPrice = currentBar.close;
    this.activePosition.exitBarIndex = this.currentRevealedIndex - 1;
    this.activePosition.exitReason = reason;
    this.activePosition.status = 'CLOSED';
    this.closedPositions.unshift({ ...this.activePosition });
    this.activePosition = null;
  }

  stepForward(): CandleBar | null {
    if (!this.canStep()) return null;
    this.currentRevealedIndex++;
    const currentBar = this.allBars[this.currentRevealedIndex - 1];

    if (this.activePosition && this.activePosition.status === 'OPEN') {
      const active = this.activePosition;
      const pointValue = this.instrument.includes('JPY') ? 1000 : 100000;
      const riskDistance = active.stopLoss
        ? Math.abs(active.entryPrice - active.stopLoss)
        : 0.0020;

      if (active.direction === 'LONG') {
        if (active.stopLoss && currentBar.low <= active.stopLoss) {
          active.exitPrice = active.stopLoss;
          active.exitBarIndex = this.currentRevealedIndex - 1;
          active.exitReason = 'STOP_LOSS';
          active.status = 'CLOSED';
          active.unrealizedPnL =
            Math.round((active.exitPrice - active.entryPrice) * active.lots * pointValue * 100) / 100;
          active.unrealizedR =
            Math.round(((active.exitPrice - active.entryPrice) / (riskDistance || 0.001)) * 100) / 100;
          this.closedPositions.unshift({ ...active });
          this.activePosition = null;
        } else if (active.takeProfit && currentBar.high >= active.takeProfit) {
          active.exitPrice = active.takeProfit;
          active.exitBarIndex = this.currentRevealedIndex - 1;
          active.exitReason = 'TAKE_PROFIT';
          active.status = 'CLOSED';
          active.unrealizedPnL =
            Math.round((active.exitPrice - active.entryPrice) * active.lots * pointValue * 100) / 100;
          active.unrealizedR =
            Math.round(((active.exitPrice - active.entryPrice) / (riskDistance || 0.001)) * 100) / 100;
          this.closedPositions.unshift({ ...active });
          this.activePosition = null;
        } else {
          active.unrealizedPnL =
            Math.round((currentBar.close - active.entryPrice) * active.lots * pointValue * 100) / 100;
          active.unrealizedR =
            Math.round(((currentBar.close - active.entryPrice) / (riskDistance || 0.001)) * 100) / 100;
        }
      } else {
        // SHORT
        if (active.stopLoss && currentBar.high >= active.stopLoss) {
          active.exitPrice = active.stopLoss;
          active.exitBarIndex = this.currentRevealedIndex - 1;
          active.exitReason = 'STOP_LOSS';
          active.status = 'CLOSED';
          active.unrealizedPnL =
            Math.round((active.entryPrice - active.exitPrice) * active.lots * pointValue * 100) / 100;
          active.unrealizedR =
            Math.round(((active.entryPrice - active.exitPrice) / (riskDistance || 0.001)) * 100) / 100;
          this.closedPositions.unshift({ ...active });
          this.activePosition = null;
        } else if (active.takeProfit && currentBar.low <= active.takeProfit) {
          active.exitPrice = active.takeProfit;
          active.exitBarIndex = this.currentRevealedIndex - 1;
          active.exitReason = 'TAKE_PROFIT';
          active.status = 'CLOSED';
          active.unrealizedPnL =
            Math.round((active.entryPrice - active.exitPrice) * active.lots * pointValue * 100) / 100;
          active.unrealizedR =
            Math.round(((active.entryPrice - active.exitPrice) / (riskDistance || 0.001)) * 100) / 100;
          this.closedPositions.unshift({ ...active });
          this.activePosition = null;
        } else {
          active.unrealizedPnL =
            Math.round((active.entryPrice - currentBar.close) * active.lots * pointValue * 100) / 100;
          active.unrealizedR =
            Math.round(((active.entryPrice - currentBar.close) / (riskDistance || 0.001)) * 100) / 100;
        }
      }
    }

    return currentBar;
  }

  /**
   * Generates realistic deterministic historical price bars for simulation
   * based on Brownian motion with realistic volatility and candle wicks.
   */
  static generateHistoricalBars(
    instrument = 'EURUSD',
    count = 120,
    startPrice = 1.0850,
    volatility = 0.0006
  ): CandleBar[] {
    const bars: CandleBar[] = [];
    let currentPrice = startPrice;
    const baseTime = Date.now() - count * 15 * 60 * 1000; // 15-minute bars

    for (let i = 0; i < count; i++) {
      const timeMs = baseTime + i * 15 * 60 * 1000;
      const d = new Date(timeMs);
      const timeString = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;

      const open = currentPrice;
      const seed = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
      const rand1 = (seed - Math.floor(seed)) * 2 - 1;
      const seed2 = Math.cos(i * 45.123 + 12.789) * 23421.12;
      const rand2 = seed2 - Math.floor(seed2);

      const delta = rand1 * volatility;
      const close = Math.round((open + delta) * 100000) / 100000;
      const high = Math.round((Math.max(open, close) + rand2 * volatility * 0.8) * 100000) / 100000;
      const low = Math.round((Math.min(open, close) - (1 - rand2) * volatility * 0.8) * 100000) / 100000;
      const volume = Math.floor(500 + Math.abs(rand1) * 3000);

      bars.push({
        timestamp: timeMs,
        timeString,
        open,
        high,
        low,
        close,
        volume,
      });

      currentPrice = close;
    }

    return bars;
  }

  /**
   * Evaluates active positions against a newly revealed bar's High/Low/Close.
   */
  static evaluatePositionOnBar(
    position: ActiveReplayPosition,
    bar: CandleBar,
    pointValue = 100000
  ): {
    isClosed: boolean;
    exitReason?: 'STOP_LOSS' | 'TAKE_PROFIT' | 'MANUAL';
    exitPrice?: number;
    realizedPnL?: number;
    realizedR?: number;
    unrealizedPnL: number;
    unrealizedR: number;
  } {
    const riskDistance = Math.abs(position.entryPrice - position.stopLossPrice);

    if (position.direction === 'LONG') {
      if (bar.low <= position.stopLossPrice) {
        const exitPrice = position.stopLossPrice;
        const gross = (exitPrice - position.entryPrice) * position.positionSize * pointValue;
        const r = riskDistance > 0 ? (exitPrice - position.entryPrice) / riskDistance : -1;
        return {
          isClosed: true,
          exitReason: 'STOP_LOSS',
          exitPrice,
          realizedPnL: Math.round(gross * 100) / 100,
          realizedR: Math.round(r * 100) / 100,
          unrealizedPnL: 0,
          unrealizedR: 0,
        };
      }

      if (bar.high >= position.takeProfitPrice) {
        const exitPrice = position.takeProfitPrice;
        const gross = (exitPrice - position.entryPrice) * position.positionSize * pointValue;
        const r = riskDistance > 0 ? (exitPrice - position.entryPrice) / riskDistance : 1;
        return {
          isClosed: true,
          exitReason: 'TAKE_PROFIT',
          exitPrice,
          realizedPnL: Math.round(gross * 100) / 100,
          realizedR: Math.round(r * 100) / 100,
          unrealizedPnL: 0,
          unrealizedR: 0,
        };
      }

      const currentGross = (bar.close - position.entryPrice) * position.positionSize * pointValue;
      const currentR = riskDistance > 0 ? (bar.close - position.entryPrice) / riskDistance : 0;
      return {
        isClosed: false,
        unrealizedPnL: Math.round(currentGross * 100) / 100,
        unrealizedR: Math.round(currentR * 100) / 100,
      };
    } else {
      if (bar.high >= position.stopLossPrice) {
        const exitPrice = position.stopLossPrice;
        const gross = (position.entryPrice - exitPrice) * position.positionSize * pointValue;
        const r = riskDistance > 0 ? (position.entryPrice - exitPrice) / riskDistance : -1;
        return {
          isClosed: true,
          exitReason: 'STOP_LOSS',
          exitPrice,
          realizedPnL: Math.round(gross * 100) / 100,
          realizedR: Math.round(r * 100) / 100,
          unrealizedPnL: 0,
          unrealizedR: 0,
        };
      }

      if (bar.low <= position.takeProfitPrice) {
        const exitPrice = position.takeProfitPrice;
        const gross = (position.entryPrice - exitPrice) * position.positionSize * pointValue;
        const r = riskDistance > 0 ? (position.entryPrice - exitPrice) / riskDistance : 1;
        return {
          isClosed: true,
          exitReason: 'TAKE_PROFIT',
          exitPrice,
          realizedPnL: Math.round(gross * 100) / 100,
          realizedR: Math.round(r * 100) / 100,
          unrealizedPnL: 0,
          unrealizedR: 0,
        };
      }

      const currentGross = (position.entryPrice - bar.close) * position.positionSize * pointValue;
      const currentR = riskDistance > 0 ? (position.entryPrice - bar.close) / riskDistance : 0;
      return {
        isClosed: false,
        unrealizedPnL: Math.round(currentGross * 100) / 100,
        unrealizedR: Math.round(currentR * 100) / 100,
      };
    }
  }

  /**
   * Converts a closed replay trade into a full Trade journal record
   */
  static convertReplayToJournalTrade(
    position: ActiveReplayPosition,
    exitPrice: number,
    exitTime: string,
    realizedPnL: number,
    realizedR: number,
    instrument: string,
    userId: string,
    accountId: string
  ): Trade {
    const fees = Math.round(position.positionSize * 4 * 100) / 100;
    const netPnL = Math.round((realizedPnL - fees) * 100) / 100;
    const initialRisk = FinancialEngine.calculateRiskAmount(100000, 1);

    return {
      id: `trade_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      accountId,
      instrument,
      assetClass: 'FOREX',
      direction: position.direction,
      status: 'CLOSED',
      timeframe: '15m',
      entryPrice: position.entryPrice,
      stopLossPrice: position.stopLossPrice,
      takeProfitPrice: position.takeProfitPrice,
      exitPrice,
      positionSize: position.positionSize,
      riskAmount: initialRisk,
      entryTime: position.entryTime,
      exitTime,
      grossPnL: realizedPnL,
      fees,
      netPnL,
      rMultiple: realizedR,
      strategyFollowed: true,
      psychologicalState: 'Calm',
      session: 'LONDON',
      notes: 'Executed via TRADOVA Market Replay Practice Simulator',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
}
