import React, { useState } from 'react';
import { Shield, Users, Server, Database, CheckCircle2, Activity, Clock } from 'lucide-react';
import { AuditLogEntry } from '../../types/domain';

interface AdminViewProps {
  auditLogs: AuditLogEntry[];
}

export const AdminView: React.FC<AdminViewProps> = ({ auditLogs }) => {
  const [users] = useState([
    {
      id: 'usr_001',
      name: 'Alex Vance',
      email: 'alex@tradova.io',
      role: 'ADMIN',
      status: 'ACTIVE',
      tradesLogged: 142,
      lastLogin: '2 mins ago',
    },
    {
      id: 'usr_002',
      name: 'Elena Rostova',
      email: 'elena@tradova.io',
      role: 'COACH',
      status: 'ACTIVE',
      tradesLogged: 0,
      lastLogin: '1 hour ago',
    },
    {
      id: 'usr_003',
      name: 'Marcus Sterling',
      email: 'marcus@fundedge.com',
      role: 'TRADER',
      status: 'ACTIVE',
      tradesLogged: 89,
      lastLogin: 'Yesterday',
    },
    {
      id: 'usr_004',
      name: 'David Chen',
      email: 'chen@quantedge.org',
      role: 'ANALYST',
      status: 'ACTIVE',
      tradesLogged: 12,
      lastLogin: '3 days ago',
    },
  ]);

  return (
    <div id="view-admin" className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-extrabold text-slate-100 tracking-tight">
            System Administration & Audit
          </h1>
          <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30 text-[10px] font-mono font-bold">
            SUPERVISOR PRIVILEGE
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-0.5">
          Role-Based Access Control (RBAC), multi-tenant health telemetry & immutable security audit trail
        </p>
      </div>

      {/* System Health Telemetry */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-3.5 space-y-1">
          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
            <Server className="w-3.5 h-3.5 text-emerald-400" />
            <span>API Server</span>
          </div>
          <span className="text-sm font-bold text-emerald-400 block">HEALTHY (99.98%)</span>
          <span className="text-[10px] text-slate-500">Latency: 18ms</span>
        </div>

        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-3.5 space-y-1">
          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>PostgreSQL RLS</span>
          </div>
          <span className="text-sm font-bold text-emerald-400 block">ISOLATED</span>
          <span className="text-[10px] text-slate-500">Active Connections: 6</span>
        </div>

        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-3.5 space-y-1">
          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Risk Gatekeeper</span>
          </div>
          <span className="text-sm font-bold text-emerald-400 block">ENFORCING</span>
          <span className="text-[10px] text-slate-500">0 Breaches bypassed</span>
        </div>

        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-3.5 space-y-1">
          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
            <Users className="w-3.5 h-3.5 text-emerald-400" />
            <span>Active Tenants</span>
          </div>
          <span className="text-sm font-bold text-slate-100 block">4 Accounts</span>
          <span className="text-[10px] text-slate-500">RBAC Verified</span>
        </div>
      </div>

      {/* RBAC Users Table */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-slate-100">User Roster & Access Roles (RBAC)</h2>
          </div>
          <span className="text-[10px] font-mono text-slate-400">4 Managed Identities</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <th className="pb-2">User</th>
                <th className="pb-2">Email</th>
                <th className="pb-2">RBAC Role</th>
                <th className="pb-2">Trades Logged</th>
                <th className="pb-2">Status</th>
                <th className="pb-2 text-right">Last Login</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {users.map((u) => (
                <tr key={u.id} className="py-2.5">
                  <td className="py-2.5 font-bold text-slate-200">{u.name}</td>
                  <td className="py-2.5 text-slate-400">{u.email}</td>
                  <td className="py-2.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.role === 'ADMIN'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : u.role === 'COACH'
                          ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                          : u.role === 'TRADER'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-2.5 text-slate-300">{u.tradesLogged}</td>
                  <td className="py-2.5 text-emerald-400 font-bold">{u.status}</td>
                  <td className="py-2.5 text-right text-slate-400">{u.lastLogin}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Immutable Audit Log Stream */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-slate-100">Security & Operational Audit Stream</h2>
          </div>
          <span className="text-[10px] font-mono text-emerald-400">Append-Only Immutable Ledger</span>
        </div>

        <div className="space-y-2">
          {auditLogs.map((log) => (
            <div
              key={log.id}
              className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg text-xs font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2">
                <span className="text-slate-500 text-[11px]">{log.timestamp.replace('T', ' ').substring(0, 19)}</span>
                <span className="font-bold text-slate-200">[{log.action}]</span>
                <span className="text-slate-400">{log.entityType} ({log.entityId})</span>
              </div>
              <div className="text-[11px] text-slate-400">
                <span>By: {log.userId}</span> | <span>IP: {log.ipAddress}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
