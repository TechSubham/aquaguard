'use client';

import Link from 'next/link';
import { useAquaGuard } from '@/lib/store';
import { AlertTriangle, ChevronRight, FileText, GitBranch, LifeBuoy, ShieldCheck } from 'lucide-react';

export default function ReportsPage() {
  const { alerts, complaints, incident, tanks } = useAquaGuard();

  const activeAlerts = alerts.filter((alert) => alert.status !== 'RESOLVED').length;
  const openComplaints = complaints.filter((complaint) => complaint.status !== 'RESOLVED').length;
  const activeIncidents = incident.currentStage === 'RESOLVED' ? 0 : 1;
  const averageRisk = Math.round(
    tanks.reduce((total, tank) => total + tank.riskScore, 0) / Math.max(tanks.length, 1)
  );

  const reportCards = [
    {
      label: 'Fleet Risk',
      value: `${averageRisk}/100`,
      detail: `${tanks.length} monitored tank${tanks.length === 1 ? '' : 's'}`,
      href: '/admin/tanks',
      icon: ShieldCheck,
    },
    {
      label: 'Active Alerts',
      value: activeAlerts,
      detail: 'unresolved telemetry alerts',
      href: '/admin/alerts',
      icon: AlertTriangle,
    },
    {
      label: 'Incidents',
      value: activeIncidents,
      detail: 'active response workflows',
      href: '/admin/incidents',
      icon: GitBranch,
    },
    {
      label: 'Student Reports',
      value: openComplaints,
      detail: 'open complaint tickets',
      href: '/admin/complaints',
      icon: LifeBuoy,
    },
  ];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#0284C7]" />
            Operational Reports
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Project summary across telemetry alerts, incidents, student reports, and fleet risk.
          </p>
        </div>
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center gap-1 rounded-full bg-white border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:text-slate-900 hover:border-slate-300"
        >
          Back to dashboard
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {reportCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.label} href={card.href} className="card-elevated bg-white p-5 group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{card.label}</span>
                <Icon className="h-4 w-4 text-[#0284C7]" />
              </div>
              <div className="mt-4 flex items-end justify-between gap-3">
                <div>
                  <div className="text-3xl font-extrabold font-mono text-slate-900">{card.value}</div>
                  <p className="text-xs text-slate-500 mt-1">{card.detail}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-[#0284C7]" />
              </div>
            </Link>
          );
        })}
      </div>

      <div className="card-elevated bg-white p-6">
        <h2 className="text-base font-bold text-slate-900">Current Incident Snapshot</h2>
        <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-sm font-bold text-slate-900">{incident.title}</div>
              <div className="mt-1 text-xs text-slate-500">
                {incident.tankName} • Stage: {incident.currentStage.replaceAll('_', ' ')}
              </div>
            </div>
            <Link
              href="/admin/incidents"
              className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
            >
              Open incident
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
