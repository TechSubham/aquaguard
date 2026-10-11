'use client';

import Link from 'next/link';
import { useAquaGuard } from '@/lib/store';
import { timeAgo } from '@/lib/utils';
import {
  AlertTriangle,
  ArrowUpRight,
  Beaker,
  BrainCircuit,
  Building2,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Droplets,
  Gauge,
  LifeBuoy,
  Radio,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  Siren,
} from 'lucide-react';

const adminLinks = [
  {
    href: '/admin/tanks',
    label: 'Tank Network',
    detail: 'Capacity, blocks, and sensor nodes',
    icon: Droplets,
  },
  {
    href: '/admin/water-quality',
    label: 'Water Quality',
    detail: 'pH, TDS, turbidity telemetry',
    icon: Beaker,
  },
  {
    href: '/admin/ai-prediction',
    label: 'AI Prediction',
    detail: 'Deterioration and anomaly forecast',
    icon: BrainCircuit,
  },
  {
    href: '/admin/alerts',
    label: 'Alerts',
    detail: 'Active quality and system warnings',
    icon: AlertTriangle,
  },
  {
    href: '/admin/incidents',
    label: 'Incidents',
    detail: 'Response workflow and evidence trail',
    icon: Siren,
  },
  {
    href: '/admin/complaints',
    label: 'Complaints',
    detail: 'Student reports and closure status',
    icon: LifeBuoy,
  },
  {
    href: '/admin/reports',
    label: 'Reports',
    detail: 'Operational summaries and exports',
    icon: ClipboardList,
  },
  {
    href: '/admin/settings',
    label: 'Settings',
    detail: 'System preferences and thresholds',
    icon: Settings,
  },
];

export default function AdminDashboardPage() {
  const {
    selectedTank,
    selectedHostel,
    tanks,
    currentReading,
    alerts,
    aiPrediction,
    complaints,
    incident,
    isLiveUpdating,
    setIsLiveUpdating,
    refreshData,
    setSelectedTankId,
  } = useAquaGuard();

  const activeAlerts = alerts.filter((alert) => alert.status !== 'RESOLVED');
  const criticalAlerts = activeAlerts.filter((alert) => alert.severity === 'CRITICAL');
  const openComplaints = complaints.filter((complaint) => complaint.status !== 'RESOLVED');
  const activeIncidents = incident.currentStage === 'RESOLVED' ? 0 : 1;
  const fleetRiskScore = Math.round(
    tanks.reduce((total, tank) => total + tank.riskScore, 0) / Math.max(tanks.length, 1)
  );
  const latestReadingLabel = currentReading.recorded_at
    ? timeAgo(currentReading.recorded_at)
    : 'Waiting for telemetry';
  const waterLevel = Math.round(selectedTank.waterLevelPercent);
  const qualityStatus =
    currentReading.ph >= 6.5 &&
    currentReading.ph <= 8.5 &&
    currentReading.tds <= 500 &&
    currentReading.turbidity <= 5
      ? 'Within Range'
      : 'Needs Review';

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pt-2">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm">
            <Building2 className="h-3.5 w-3.5 text-[#0284C7]" />
            {selectedHostel.name}
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#0B1B22]">
              AquaGuard Command Dashboard
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Live overview for water safety, predictive risk, incidents, and field operations.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsLiveUpdating(!isLiveUpdating)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold transition-all shadow-sm ${
              isLiveUpdating
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-white text-slate-500 border border-slate-200'
            }`}
          >
            <Radio className={`h-3.5 w-3.5 ${isLiveUpdating ? 'text-emerald-500 animate-pulse' : 'text-slate-400'}`} />
            <span>{isLiveUpdating ? 'MQTT Live' : 'Telemetry Paused'}</span>
          </button>
          <button
            onClick={() => refreshData()}
            className="flex items-center gap-2 rounded-full bg-white border border-slate-200/90 px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:border-slate-300 shadow-sm transition-all"
          >
            <RefreshCw className="h-3.5 w-3.5 text-[#0284C7]" />
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* <Link href="/admin/tanks" className="card-elevated p-5 bg-white group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Fleet Risk</span>
            <Gauge className="h-4 w-4 text-[#0284C7]" />
          </div>
          <div className="mt-4 flex items-end justify-between gap-3">
            <div>
              <div className="text-3xl font-extrabold font-mono text-slate-900">{fleetRiskScore}/100</div>
              <p className="text-xs text-slate-500 mt-1">{tanks.length} connected tanks</p>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-[#0284C7]" />
          </div>
        </Link> */}

        <Link href="/admin/alerts" className="card-elevated p-5 bg-white group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Open Alerts</span>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-4 flex items-end justify-between gap-3">
            <div>
              <div className="text-3xl font-extrabold font-mono text-slate-900">{activeAlerts.length}</div>
              <p className="text-xs text-slate-500 mt-1">{criticalAlerts.length} critical needing action</p>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-[#0284C7]" />
          </div>
        </Link>

        <Link href="/admin/ai-prediction" className="card-elevated p-5 bg-gradient-to-br from-[#0284C7] via-[#0369A1] to-[#0A4F88] text-white group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-100">AI Risk</span>
            <BrainCircuit className="h-4 w-4 text-sky-100" />
          </div>
          <div className="mt-4 flex items-end justify-between gap-3">
            <div>
              <div className="text-3xl font-extrabold font-mono">{aiPrediction.currentRiskPercent}%</div>
              <p className="text-xs text-sky-100 mt-1">{aiPrediction.riskLevel} prediction level</p>
            </div>
            <ArrowUpRight className="h-4 w-4 text-sky-100 group-hover:text-white" />
          </div>
        </Link>

        <Link href="/admin/complaints" className="card-elevated p-5 bg-white group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Student Reports</span>
            <LifeBuoy className="h-4 w-4 text-[#0284C7]" />
          </div>
          <div className="mt-4 flex items-end justify-between gap-3">
            <div>
              <div className="text-3xl font-extrabold font-mono text-slate-900">{openComplaints.length}</div>
              <p className="text-xs text-slate-500 mt-1">open complaints</p>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-[#0284C7]" />
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-8 space-y-6">
          <div className="card-elevated p-6 bg-white">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                  Selected Tank Snapshot
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {selectedTank.name} in {selectedTank.block} • last reading {latestReadingLabel}
                </p>
              </div>
              <Link
                href="/admin/water-quality"
                className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200"
              >
                Full telemetry
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">pH</div>
                <div className="mt-2 text-2xl font-extrabold font-mono text-slate-900">{currentReading.ph.toFixed(2)}</div>
                <div className="mt-2 text-xs font-semibold text-emerald-700">Target 6.5-8.5</div>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">TDS</div>
                <div className="mt-2 text-2xl font-extrabold font-mono text-slate-900">{Math.round(currentReading.tds)} ppm</div>
                <div className="mt-2 text-xs font-semibold text-emerald-700">Limit below 500</div>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Turbidity</div>
                <div className="mt-2 text-2xl font-extrabold font-mono text-slate-900">{currentReading.turbidity.toFixed(2)} NTU</div>
                <div className="mt-2 text-xs font-semibold text-emerald-700">Limit below 5</div>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Water Level</div>
                <div className="mt-2 text-2xl font-extrabold font-mono text-slate-900">{waterLevel}%</div>
                <div className="mt-2 h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div className="h-full rounded-full bg-[#0284C7]" style={{ width: `${Math.min(Math.max(waterLevel, 0), 100)}%` }} />
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3">
              <div className="flex items-center gap-2 text-sm font-bold text-emerald-800">
                <ShieldCheck className="h-4 w-4" />
                Potability: {qualityStatus}
              </div>
              <Link href="/admin/reports" className="text-xs font-semibold text-emerald-800 hover:text-emerald-950">
                View safety reports
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card-elevated p-6 bg-white">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Active Alerts</h3>
                  <p className="text-xs text-slate-500">Most urgent unresolved alerts</p>
                </div>
                <Link href="/admin/alerts" className="text-xs font-semibold text-slate-500 hover:text-[#0284C7]">
                  Open page
                </Link>
              </div>
              <div className="mt-4 space-y-3">
                {activeAlerts.length === 0 ? (
                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
                    No active alerts.
                  </div>
                ) : (
                  activeAlerts.slice(0, 3).map((alert) => (
                    <Link
                      key={alert.id}
                      href="/admin/alerts"
                      className="block rounded-2xl border border-slate-100 bg-slate-50 p-4 hover:border-[#0284C7]/40 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-bold text-slate-900">{alert.title}</span>
                        <span className={`h-2.5 w-2.5 rounded-full ${alert.severity === 'CRITICAL' ? 'bg-red-500' : 'bg-amber-500'}`} />
                      </div>
                      <p className="mt-1 text-xs text-slate-500">{alert.tankName} • {alert.timestamp}</p>
                    </Link>
                  ))
                )}
              </div>
            </div>

            <div className="card-elevated p-6 bg-white">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Operations Queue</h3>
                  <p className="text-xs text-slate-500">Work that needs admin follow-up</p>
                </div>
                <ClipboardList className="h-4 w-4 text-[#0284C7]" />
              </div>
              <div className="mt-4 grid grid-cols-1 gap-3 text-sm">
                <Link href="/admin/incidents" className="flex items-center justify-between rounded-2xl bg-slate-50 border border-slate-100 p-4 hover:border-[#0284C7]/40">
                  <span className="font-semibold text-slate-700">Active incident workflow</span>
                  <span className="font-mono font-extrabold text-slate-900">{activeIncidents}</span>
                </Link>
                <Link href="/admin/reports" className="flex items-center justify-between rounded-2xl bg-slate-50 border border-slate-100 p-4 hover:border-[#0284C7]/40">
                  <span className="font-semibold text-slate-700">Operational reports</span>
                  <span className="font-mono font-extrabold text-slate-900">Open</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="xl:col-span-4 space-y-6">
          <div className="card-elevated p-6 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Tank Navigator</h3>
                <p className="text-xs text-slate-500">Switch context or open the tank page</p>
              </div>
              <Link href="/admin/tanks" className="text-xs font-semibold text-slate-500 hover:text-[#0284C7]">
                Manage
              </Link>
            </div>
            <div className="mt-4 space-y-2 max-h-72 overflow-y-auto pr-1">
              {tanks.slice(0, 6).map((tank) => (
                <button
                  key={tank.id}
                  onClick={() => setSelectedTankId(tank.id)}
                  className={`w-full flex items-center justify-between gap-3 rounded-2xl border p-3 text-left transition-colors ${
                    tank.id === selectedTank.id
                      ? 'border-[#0284C7]/40 bg-sky-50'
                      : 'border-slate-100 bg-slate-50 hover:border-[#0284C7]/30'
                  }`}
                >
                  <div>
                    <div className="text-sm font-bold text-slate-900">{tank.code}</div>
                    <div className="text-xs text-slate-500">{tank.block} • {tank.capacityLiters.toLocaleString()} L</div>
                  </div>
                  <span className={`h-2.5 w-2.5 rounded-full ${tank.riskStatus === 'CRITICAL' ? 'bg-red-500' : 'bg-emerald-500'}`} />
                </button>
              ))}
            </div>
          </div>

          {/* <div className="card-elevated p-6 bg-white">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-[#0284C7]" />
              <h3 className="text-base font-bold text-slate-900">Connected Pages</h3>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-2">
              {adminLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3 hover:border-[#0284C7]/40 hover:bg-white transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white border border-slate-200 text-[#0284C7]">
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-slate-900 truncate">{item.label}</div>
                        <div className="text-[11px] text-slate-500 truncate">{item.detail}</div>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
                  </Link>
                );
              })}
            </div>
          </div> */}

          <div className="card-elevated p-6 bg-white">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">System Readiness</h3>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="mt-4 space-y-2 text-xs">
              <div className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-100 p-3">
                <span className="text-slate-600">MQTT telemetry</span>
                <span className="font-bold text-emerald-700">Connected</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-100 p-3">
                <span className="text-slate-600">AI inference</span>
                <span className="font-bold text-emerald-700">Online</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-100 p-3">
                <span className="text-slate-600">Latest cycle</span>
                <span className="font-bold text-slate-900">{latestReadingLabel}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
