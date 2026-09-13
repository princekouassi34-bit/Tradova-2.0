import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { FinancialEngine } from './src/core/calculations/financialEngine';
import { RiskEngine, RiskRuleConfig, TradeValidationRequest } from './src/core/risk/riskEngine';
import { AICoachService, AICoachContext } from './src/core/ai/aiCoachService';
import { MODULE_REGISTRY } from './src/data/initialData';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON Body Parser with size limit protection
  app.use(express.json({ limit: '5mb' }));

  // In-memory Audit Log Store (prepared for PostgreSQL persistence)
  const auditLogs: Array<{
    id: string;
    timestamp: string;
    action: string;
    resource: string;
    ipAddress?: string;
    details: unknown;
  }> = [];

  // Helper: Log audit action
  const recordAudit = (action: string, resource: string, details: unknown, ip?: string) => {
    auditLogs.unshift({
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      action,
      resource,
      ipAddress: ip || '127.0.0.1',
      details,
    });
    if (auditLogs.length > 500) auditLogs.pop();
  };

  // 1. Health check
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'TRADOVA Operating System API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    });
  });

  // 2. Module status inventory (22 Modules)
  app.get('/api/modules', (_req: Request, res: Response) => {
    res.json({
      success: true,
      modules: MODULE_REGISTRY,
    });
  });

  // 3. Server-side Financial Calculations
  app.post('/api/calculations/position-size', (req: Request, res: Response) => {
    try {
      const { accountBalance, riskPercent, entryPrice, stopLossPrice, tickSize, tickValue, lotSize } = req.body;
      const result = FinancialEngine.calculatePositionSize({
        accountBalance: Number(accountBalance),
        riskPercent: Number(riskPercent),
        entryPrice: Number(entryPrice),
        stopLossPrice: Number(stopLossPrice),
        tickSize: tickSize ? Number(tickSize) : undefined,
        tickValue: tickValue ? Number(tickValue) : undefined,
        lotSize: lotSize ? Number(lotSize) : undefined,
      });
      res.json({ success: true, result });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Calculation error';
      res.status(400).json({ success: false, error: message });
    }
  });

  // 4. Server-Side Risk Validation Engine (TRADE REQUEST -> RISK ENGINE -> ALLOW / WARNING / BLOCK)
  app.post('/api/risk/validate', (req: Request, res: Response) => {
    try {
      const { request, rules } = req.body as { request: TradeValidationRequest; rules: RiskRuleConfig };

      if (!request || !rules) {
        res.status(400).json({ success: false, error: 'Missing request or rules payload' });
        return;
      }

      const validation = RiskEngine.validateTrade(request, rules);

      // Audit log critical risk violations
      if (validation.status === 'BLOCK') {
        recordAudit('RISK_CHECK_BLOCKED', 'TRADE_REQUEST', {
          instrument: request.instrument,
          direction: request.direction,
          violations: validation.violations,
        }, req.ip);
      }

      res.json({ success: true, validation });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Risk Engine verification failed';
      res.status(500).json({ success: false, error: message });
    }
  });

  // 5. Server-Side AI Coach
  app.post('/api/ai/coach', async (req: Request, res: Response) => {
    try {
      const { context } = req.body as { context: AICoachContext };
      if (!context) {
        res.status(400).json({ success: false, error: 'Missing context payload' });
        return;
      }

      // Base structured report (Deterministic facts, statistics, interpretation, suggestions)
      const baseReport = AICoachService.generateStructuredReport(context);

      // If GEMINI_API_KEY exists, enrich with real Gemini model while strictly enforcing safety
      if (process.env.GEMINI_API_KEY) {
        try {
          const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
          const prompt = `You are the TRADOVA AI Performance Coach for professional traders.
Analyze this trader's cycle strictly adhering to:
1. FACTS (Objective metrics only)
2. STATISTICS (Calculated metrics)
3. INTERPRETATION (Process and behavioral patterns)
4. SUGGESTIONS (Actionable risk and discipline rules - NEVER guarantee profits or predict market direction).

Trader Context:
- Total Closed Trades: ${context.totalTrades}
- Win Rate: ${context.winRate}%
- Net PnL: $${context.netPnL}
- Profit Factor: ${context.profitFactor}
- Strategy Rule Adherence: ${context.strategyAdherenceRate}%
- Dominant Emotional State: ${context.dominantEmotion}
- Error frequency: ${JSON.stringify(context.recordedErrors)}
- Trader Edge Score: ${context.traderScore}/100

Provide a concise, high-impact review for the trader. Keep the tone calm, objective, disciplined, and institutional. Return your output in clear sections.`;

          const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
          });

          const rawText = response.text || '';
          const safety = AICoachService.validateSafety(rawText);

          if (safety.isValid && rawText.length > 50) {
            baseReport.interpretation = rawText.substring(0, 1000);
          }
        } catch (aiErr) {
          console.warn('[AI Coach] Gemini call fallback to deterministic engine:', aiErr);
        }
      }

      recordAudit('AI_COACH_REPORT_GENERATED', 'AI_COACH', {
        reviewType: context.reviewType,
        totalTrades: context.totalTrades,
      }, req.ip);

      res.json({ success: true, report: baseReport });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'AI Coach error';
      res.status(500).json({ success: false, error: message });
    }
  });

  // 6. Audit Logs API (Admin / Security)
  app.get('/api/audit', (_req: Request, res: Response) => {
    res.json({
      success: true,
      logs: auditLogs,
    });
  });

  // Vite middleware in Development mode
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TRADOVA OS Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
