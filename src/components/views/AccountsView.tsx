import React, { useState } from 'react';
import { Wallet, Plus, ShieldCheck, Check, DollarSign } from 'lucide-react';
import { TradingAccount } from '../../types/domain';

interface AccountsViewProps {
  accounts: TradingAccount[];
  selectedAccountId: string;
  onSelectAccount: (id: string) => void;
  onAddAccount: (account: TradingAccount) => void;
}

export const AccountsView: React.FC<AccountsViewProps> = ({
  accounts,
  selectedAccountId,
  onSelectAccount,
  onAddAccount,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [broker, setBroker] = useState('Interactive Brokers');
  const [currency, setCurrency] = useState('USD');
  const [accountType, setAccountType] = useState<TradingAccount['accountType']>('LIVE');
  const [initialBalance, setInitialBalance] = useState('50000');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const bal = parseFloat(initialBalance) || 10000;
    const newAcc: TradingAccount = {
      id: `acc_${Date.now()}`,
      userId: 'usr_edge_001',
      name: name.trim(),
      broker,
      currency,
      accountType,
      initialBalance: bal,
      currentBalance: bal,
      currentEquity: bal,
      isDefault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onAddAccount(newAcc);
    setIsModalOpen(false);
    setName('');
  };

  return (
    <div id="view-accounts" className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-100 tracking-tight">Portfolio & Accounts</h1>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold">
              MULTI-ACCOUNT ARCHITECTURE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage personal Live brokerage accounts, Prop Firm challenge desks & Demo testing balances
          </p>
        </div>

        <button
          id="btn-add-account"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-3.5 py-2 rounded-lg transition-all shadow-md shadow-emerald-950/40"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add Trading Account</span>
        </button>
      </div>

      {/* Accounts List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((acc) => {
          const isSelected = acc.id === selectedAccountId;
          const pnl = acc.currentEquity - acc.initialBalance;
          const pct = ((pnl / acc.initialBalance) * 100).toFixed(2);
          return (
            <div
              key={acc.id}
              onClick={() => onSelectAccount(acc.id)}
              className={`bg-[#0f172a] border rounded-xl p-5 cursor-pointer transition-all space-y-4 ${
                isSelected
                  ? 'border-emerald-500 shadow-lg shadow-emerald-950/30'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-100 text-sm">{acc.name}</span>
                  <span className="text-[11px] text-slate-400 block">{acc.broker}</span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                    acc.accountType === 'PROP'
                      ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                      : acc.accountType === 'LIVE'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  }`}
                >
                  {acc.accountType}
                </span>
              </div>

              <div className="space-y-1 font-mono">
                <span className="text-[10px] text-slate-400 block uppercase tracking-wider">
                  Current Net Equity
                </span>
                <div className="text-xl font-bold text-slate-100">
                  ${acc.currentEquity.toLocaleString()}
                </div>
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-400">Total Return:</span>
                  <span className={`font-bold ${pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {pnl >= 0 ? `+$${pnl.toLocaleString()}` : `-$${Math.abs(pnl).toLocaleString()}`} ({pct}%)
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
                <span className="text-slate-500 font-mono">Base: {acc.currency}</span>
                {isSelected ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Active Account</span>
                  </span>
                ) : (
                  <span className="text-slate-400 hover:text-slate-200">Click to switch</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-[#0f172a] border border-slate-800 rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-sm font-bold text-slate-100">Add New Trading Account</h3>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Account Label</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Apex 50k Funded #2"
                  className="w-full bg-slate-900 border border-slate-700 rounded-md p-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Broker / Desk</label>
                <input
                  type="text"
                  value={broker}
                  onChange={(e) => setBroker(e.target.value)}
                  placeholder="e.g. Interactive Brokers, Eightcap, Tradovate"
                  className="w-full bg-slate-900 border border-slate-700 rounded-md p-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Account Type</label>
                  <select
                    value={accountType}
                    onChange={(e) => setAccountType(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-md p-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="LIVE">Live Real Capital</option>
                    <option value="PROP">Prop Firm Challenge</option>
                    <option value="DEMO">Demo Paper</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-md p-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Starting Balance</label>
                <input
                  type="number"
                  value={initialBalance}
                  onChange={(e) => setInitialBalance(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-md p-2 text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 rounded bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
