import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  ArrowUp,
  ArrowDown,
  ShieldCheck,
  Award,
  Zap,
  BookOpen,
  CheckCircle,
} from 'lucide-react';
import { ReplayEngine, ReplayBar, ReplayPosition } from '../../core/replay/replayEngine';
import { Trade } from '../../types/domain';

interface MarketReplayViewProps {
  onJournalSimulationTrade: (trade: Trade) => void;
}

export const MarketReplayView: React.FC<MarketReplayViewProps> = ({
  onJournalSimulationTrade,
}) => {
  // Initialize ReplayEngine instance with 60 bars starting from EURUSD 1.0850
  const engineRef = useRef<ReplayEngine | null>(null);
  if (!engineRef.current) {
    engineRef.current = new ReplayEngine('EURUSD', '15m', 1.0850, 70);
  }
  const engine = engineRef.current;

  // React state reflecting the replay engine
  const [revealedBars, setRevealedBars] = useState<ReplayBar[]>(engine.getRevealedBars());
  const [position, setPosition] = useState<ReplayPosition | null>(engine.getActivePosition());
  const [closedPositions, setClosedPositions] = useState<ReplayPosition[]>(engine.getClosedPositions());
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState<number>(1000); // ms per bar

  // Order Ticket state
  const [orderLots, setOrderLots] = useState('1.0');
  const [orderSL, setOrderSL] = useState('1.0820');
  const [orderTP, setOrderTP] = useState('1.0920');
  const [lastJournaledId, setLastJournaledId] = useState<string | null>(null);

  // Sync state helper
  const syncFromEngine = () => {
    setRevealedBars([...engine.getRevealedBars()]);
    setPosition(engine.getActivePosition() ? { ...engine.getActivePosition()! } : null);
    setClosedPositions([...engine.getClosedPositions()]);
  };

  // Step 1 bar forward
  const stepForward = () => {
    const bar = engine.stepForward();
    syncFromEngine();
    if (!bar) setIsPlaying(false);
  };

  // Reset simulation
  const resetReplay = () => {
    engine.reset();
    syncFromEngine();
    setIsPlaying(false);
  };

  // Auto-play interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying) {
      interval = setInterval(() => {
        if (engine.canStep()) {
          engine.stepForward();
          syncFromEngine();
        } else {
          setIsPlaying(false);
        }
      }, playSpeed);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, playSpeed]);

  const currentBar = revealedBars[revealedBars.length - 1];

  // Open Order
  const handleOpenOrder = (direction: 'LONG' | 'SHORT') => {
    if (!currentBar) return;
    const lots = parseFloat(orderLots) || 1.0;
    const sl = parseFloat(orderSL);
    const tp = parseFloat(orderTP);

    const pos = engine.openPosition({
      direction,
      entryPrice: currentBar.close,
      lots,
      stopLoss: !isNaN(sl) ? sl : undefined,
      takeProfit: !isNaN(tp) ? tp : undefined,
    });

    if (pos) syncFromEngine();
  };

  // Close active position
  const handleCloseActive = () => {
    engine.closeActivePosition('MANUAL');
    syncFromEngine();
  };

  // Push closed replay trade to real TRADOVA journal
  const handlePushToJournal = (pos: ReplayPosition) => {
    const newTrade: Trade = {
      id: `sim_${pos.id}`,
      userId: 'usr_edge_001',
      accountId: 'acc_prop_01',
      instrument: 'EURUSD (REPLAY)',
      assetClass: 'FOREX',
      direction: pos.direction,
      status: 'CLOSED',
      timeframe: '15m',
      entryPrice: pos.entryPrice,
      stopLossPrice: pos.stopLoss || pos.entryPrice * 0.99,
      takeProfitPrice: pos.takeProfit,
      exitPrice: pos.exitPrice,
      positionSize: pos.lots,
      riskAmount: 500,
      entryTime: new Date(pos.entryBarIndex * 15 * 60000).toISOString(),
      exitTime: new Date(pos.exitBarIndex! * 15 * 60000).toISOString(),
      grossPnL: pos.unrealizedPnL,
      fees: 4,
      netPnL: pos.unrealizedPnL - 4,
      rMultiple: Math.round((pos.unrealizedPnL / 500) * 100) / 100,
      strategyFollowed: true,
      errorType: 'NONE',
      psychologicalState: 'Calm',
      session: 'LONDON',
      notes: `Executed in TRADOVA Market Replay. Exit reason: ${pos.exitReason}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onJournalSimulationTrade(newTrade);
    setLastJournaledId(pos.id);
  };

  // Candlestick SVG rendering calculations
  const displayBars = revealedBars.slice(-25); // show last 25 revealed candles
  const allLows = displayBars.map((b) => b.low);
  const allHighs = displayBars.map((b) => b.high);
  const minPrice = Math.min(...allLows) * 0.9995;
  const maxPrice = Math.max(...allHighs) * 1.0005;
  const priceRange = maxPrice - minPrice || 0.001;

  const chartWidth = 640;
  const chartHeight = 220;
  const candleSpacing = chartWidth / (displayBars.length || 1);

  return (
    <div id="view-replay" className="p-4 sm:p-6 space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-100 tracking-tight">Market Replay Simulator</h1>
            <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold">
              ZERO LOOK-AHEAD BIAS
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Bar-by-bar price action simulator. Future bars are strictly blocked from execution context.
          </p>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-2 bg-[#0f172a] border border-slate-800 p-1.5 rounded-lg">
          <button
            id="btn-replay-play"
            onClick={() => setIsPlaying(!isPlaying)}
            className={`p-2 rounded font-bold text-xs flex items-center gap-1 transition-colors ${
              isPlaying
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
            }`}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isPlaying ? 'Pause' : 'Play'}</span>
          </button>

          <button
            id="btn-replay-step"
            onClick={stepForward}
            disabled={isPlaying || !engine.canStep()}
            className="p-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1 disabled:opacity-40"
            title="Step 1 bar forward"
          >
            <SkipForward className="w-3.5 h-3.5" />
            <span>Step</span>
          </button>

          <select
            value={playSpeed}
            onChange={(e) => setPlaySpeed(Number(e.target.value))}
            aria-label="Replay Speed"
            className="bg-slate-900 border border-slate-700 text-slate-300 text-xs rounded px-2 py-1.5 focus:outline-none"
          >
            <option value={1500}>0.5x</option>
            <option value={1000}>1x</option>
            <option value={500}>2x</option>
            <option value={200}>5x</option>
          </select>

          <button
            id="btn-replay-reset"
            onClick={resetReplay}
            className="p-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs"
            title="Reset simulation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Replay Stage & Order Ticket */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Replay Candlestick Chart (2 cols) */}
        <div className="lg:col-span-2 bg-[#0f172a] border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-2">
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="font-bold text-slate-100">{engine.instrument}</span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-400">{engine.timeframe}</span>
              <span className="text-slate-500">|</span>
              <span className="text-emerald-400 font-bold">
                Bar {revealedBars.length} of {engine.getTotalBars()}
              </span>
            </div>

            {currentBar && (
              <div className="font-mono text-xs text-slate-300">
                Close: <span className="text-emerald-400 font-bold">{currentBar.close.toFixed(5)}</span>
              </div>
            )}
          </div>

          {/* SVG Candlesticks */}
          <div className="w-full h-56 bg-slate-950/50 rounded-lg border border-slate-900 flex items-center justify-center relative overflow-hidden">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-full"
              preserveAspectRatio="none"
            >
              {displayBars.map((bar, i) => {
                const xCenter = i * candleSpacing + candleSpacing / 2;
                const candleWidth = Math.max(candleSpacing * 0.65, 4);

                // Y coordinates
                const highY = chartHeight - ((bar.high - minPrice) / priceRange) * (chartHeight - 30) - 15;
                const lowY = chartHeight - ((bar.low - minPrice) / priceRange) * (chartHeight - 30) - 15;
                const openY = chartHeight - ((bar.open - minPrice) / priceRange) * (chartHeight - 30) - 15;
                const closeY = chartHeight - ((bar.close - minPrice) / priceRange) * (chartHeight - 30) - 15;

                const isBullish = bar.close >= bar.open;
                const color = isBullish ? '#10b981' : '#f43f5e';
                const bodyTop = Math.min(openY, closeY);
                const bodyHeight = Math.max(Math.abs(closeY - openY), 1.5);

                return (
                  <g key={i}>
                    {/* Wick */}
                    <line x1={xCenter} y1={highY} x2={xCenter} y2={lowY} stroke={color} strokeWidth="1.5" />
                    {/* Real Body */}
                    <rect
                      x={xCenter - candleWidth / 2}
                      y={bodyTop}
                      width={candleWidth}
                      height={bodyHeight}
                      fill={color}
                      rx="1"
                    />
                  </g>
                );
              })}

              {/* Stop Loss & Take Profit Visual Lines if active position exists */}
              {position && position.stopLoss && (
                <line
                  x1="0"
                  y1={chartHeight - ((position.stopLoss - minPrice) / priceRange) * (chartHeight - 30) - 15}
                  x2={chartWidth}
                  y2={chartHeight - ((position.stopLoss - minPrice) / priceRange) * (chartHeight - 30) - 15}
                  stroke="#f43f5e"
                  strokeDasharray="4 2"
                  strokeWidth="1.5"
                />
              )}
              {position && position.takeProfit && (
                <line
                  x1="0"
                  y1={chartHeight - ((position.takeProfit - minPrice) / priceRange) * (chartHeight - 30) - 15}
                  x2={chartWidth}
                  y2={chartHeight - ((position.takeProfit - minPrice) / priceRange) * (chartHeight - 30) - 15}
                  stroke="#10b981"
                  strokeDasharray="4 2"
                  strokeWidth="1.5"
                />
              )}
            </svg>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-2">
            <span>Historical candle window (25 candles)</span>
            <span>Next bar unrevealed</span>
          </div>
        </div>

        {/* Right: Order Ticket & Active Position */}
        <div className="space-y-4">
          {/* Active Live Position Card */}
          {position ? (
            <div className="bg-[#0f172a] border border-emerald-500/40 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-emerald-400" />
                  Position Open
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                    position.direction === 'LONG'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-rose-500/20 text-rose-400'
                  }`}
                >
                  {position.direction} {position.lots} LOTS
                </span>
              </div>

              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Entry Price:</span>
                  <span className="text-slate-200">{position.entryPrice.toFixed(5)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Current Price:</span>
                  <span className="text-slate-200">{currentBar?.close.toFixed(5)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Stop Loss:</span>
                  <span className="text-rose-400">{position.stopLoss?.toFixed(5) ?? 'None'}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Take Profit:</span>
                  <span className="text-emerald-400">{position.takeProfit?.toFixed(5) ?? 'None'}</span>
                </div>
                <div className="flex justify-between text-slate-400 pt-2 border-t border-slate-800">
                  <span className="font-bold text-slate-200">Unrealized P&L:</span>
                  <span
                    className={`font-bold text-sm ${
                      position.unrealizedPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {position.unrealizedPnL >= 0
                      ? `+$${position.unrealizedPnL.toFixed(2)}`
                      : `-$${Math.abs(position.unrealizedPnL).toFixed(2)}`}
                  </span>
                </div>
              </div>

              <button
                id="btn-replay-close-active"
                onClick={handleCloseActive}
                className="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg transition-colors"
              >
                Close Position at Market
              </button>
            </div>
          ) : (
            /* Order Ticket */
            <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 space-y-3">
              <span className="text-xs font-bold text-slate-200 block border-b border-slate-800 pb-2">
                Order Execution Ticket
              </span>

              <div className="space-y-2 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Position Lots</label>
                  <input
                    id="replay-lots-input"
                    type="number"
                    step="0.1"
                    value={orderLots}
                    onChange={(e) => setOrderLots(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-md p-1.5 text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-rose-400 mb-1">Stop Loss</label>
                    <input
                      id="replay-sl-input"
                      type="number"
                      step="any"
                      value={orderSL}
                      onChange={(e) => setOrderSL(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-md p-1.5 text-rose-300 font-mono focus:outline-none focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block text-emerald-400 mb-1">Take Profit</label>
                    <input
                      id="replay-tp-input"
                      type="number"
                      step="any"
                      value={orderTP}
                      onChange={(e) => setOrderTP(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-md p-1.5 text-emerald-300 font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    id="btn-replay-buy"
                    onClick={() => handleOpenOrder('LONG')}
                    className="py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-extrabold rounded-lg flex items-center justify-center gap-1 transition-all active:scale-[0.98]"
                  >
                    <ArrowUp className="w-4 h-4 stroke-[3]" />
                    <span>BUY / LONG</span>
                  </button>
                  <button
                    id="btn-replay-sell"
                    onClick={() => handleOpenOrder('SHORT')}
                    className="py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-extrabold rounded-lg flex items-center justify-center gap-1 transition-all active:scale-[0.98]"
                  >
                    <ArrowDown className="w-4 h-4 stroke-[3]" />
                    <span>SELL / SHORT</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Closed Simulation Trades Feed with Auto-Journal CTA */}
          <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 space-y-2">
            <span className="text-xs font-bold text-slate-300 block mb-1">
              Simulation Trades History ({closedPositions.length})
            </span>

            {closedPositions.length === 0 ? (
              <span className="text-xs text-slate-500 block italic">
                No replay trades closed yet. Open a position and advance candles.
              </span>
            ) : (
              <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                {closedPositions.map((pos) => (
                  <div
                    key={pos.id}
                    className="p-2 bg-slate-900/80 border border-slate-800 rounded-lg text-xs font-mono flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-slate-200">
                        {pos.direction} ({pos.exitReason})
                      </span>
                      <span
                        className={`block text-[11px] font-bold ${
                          pos.unrealizedPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {pos.unrealizedPnL >= 0
                          ? `+$${pos.unrealizedPnL.toFixed(2)}`
                          : `-$${Math.abs(pos.unrealizedPnL).toFixed(2)}`}
                      </span>
                    </div>

                    <button
                      id={`btn-journal-sim-${pos.id}`}
                      onClick={() => handlePushToJournal(pos)}
                      disabled={lastJournaledId === pos.id}
                      className={`px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 transition-colors ${
                        lastJournaledId === pos.id
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                      }`}
                    >
                      {lastJournaledId === pos.id ? (
                        <>
                          <CheckCircle className="w-3 h-3" />
                          <span>Journaled</span>
                        </>
                      ) : (
                        <>
                          <BookOpen className="w-3 h-3" />
                          <span>+ Journal</span>
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
