import React from 'react';
import { Globe, Shield, User, Bell, Sliders } from 'lucide-react';
import { SupportedLanguage } from '../../i18n/translations';
import { RiskRuleConfig } from '../../core/risk/riskEngine';

interface SettingsViewProps {
  currentLang: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  riskRules: RiskRuleConfig;
  onUpdateRiskRules: (rules: RiskRuleConfig) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentLang,
  onLanguageChange,
  riskRules,
  onUpdateRiskRules,
}) => {
  const languages: Array<{ code: SupportedLanguage; name: string; native: string }> = [
    { code: 'en', name: 'English', native: 'English' },
    { code: 'fr', name: 'French', native: 'Français' },
    { code: 'es', name: 'Spanish', native: 'Español' },
    { code: 'pt', name: 'Portuguese', native: 'Português' },
    { code: 'de', name: 'German', native: 'Deutsch' },
    { code: 'it', name: 'Italian', native: 'Italiano' },
    { code: 'ar', name: 'Arabic', native: 'العربية (RTL)' },
    { code: 'zh', name: 'Chinese', native: '中文' },
    { code: 'ja', name: 'Japanese', native: '日本語' },
    { code: 'ko', name: 'Korean', native: '한국어' },
    { code: 'tr', name: 'Turkish', native: 'Türkçe' },
  ];

  return (
    <div id="view-settings" className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-extrabold text-slate-100 tracking-tight">System Settings</h1>
          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold">
            GLOBAL CONFIGURATION
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-0.5">
          Internationalization, risk default parameters & operational environment preferences
        </p>
      </div>

      {/* Language / Localization */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Globe className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-bold text-slate-100">Internationalization & Locale (11 Languages)</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-xs">
          {languages.map((l) => {
            const isSelected = l.code === currentLang;
            return (
              <button
                key={l.code}
                id={`lang-btn-${l.code}`}
                onClick={() => onLanguageChange(l.code)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  isSelected
                    ? 'bg-emerald-500/15 border-emerald-500 text-emerald-400 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="font-bold">{l.native}</div>
                <div className="text-[10px] text-slate-500 uppercase">{l.name}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Risk Defaults */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Shield className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-bold text-slate-100">Trading Desk Risk Defaults</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
          <div>
            <label className="block text-slate-400 mb-1">Default Risk Per Trade (%)</label>
            <input
              type="number"
              step="0.1"
              value={riskRules.maxRiskPerTradePercent}
              onChange={(e) =>
                onUpdateRiskRules({
                  ...riskRules,
                  maxRiskPerTradePercent: parseFloat(e.target.value) || 1.0,
                })
              }
              className="w-full bg-slate-900 border border-slate-700 rounded-md p-2 text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Max Daily Loss Cap ($)</label>
            <input
              type="number"
              value={riskRules.maxDailyLossDollars}
              onChange={(e) =>
                onUpdateRiskRules({
                  ...riskRules,
                  maxDailyLossDollars: parseFloat(e.target.value) || 2000,
                })
              }
              className="w-full bg-slate-900 border border-slate-700 rounded-md p-2 text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Daily Trade Execution Limit</label>
            <input
              type="number"
              value={riskRules.maxDailyTradesCount}
              onChange={(e) =>
                onUpdateRiskRules({
                  ...riskRules,
                  maxDailyTradesCount: parseInt(e.target.value, 10) || 5,
                })
              }
              className="w-full bg-slate-900 border border-slate-700 rounded-md p-2 text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* User Profile Summary */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 space-y-3 text-xs">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <User className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-bold text-slate-100">Trader Profile & Security</h2>
        </div>

        <div className="space-y-2 text-slate-300 font-mono">
          <div className="flex justify-between">
            <span className="text-slate-500">Trader Identity:</span>
            <span className="text-slate-200 font-bold">Alex Vance (Pro Operator)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Security Tier:</span>
            <span className="text-emerald-400 font-bold">Two-Factor Authentication (2FA) Active</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Data Isolation:</span>
            <span className="text-slate-200 font-bold">Row-Level Security (PostgreSQL tenant-isolated)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
