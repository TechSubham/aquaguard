'use client';

import React from 'react';
import Link from 'next/link';
import { useAquaGuard } from '@/lib/store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Droplets,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldAlert,
  MessageSquareWarning,
  Building,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

import { TankSelector } from '@/components/shared/TankSelector';

export default function StudentDashboardPage() {
  const { currentReading, selectedTank, alerts, lastRefreshTime, refreshData } = useAquaGuard();

  const isHighRisk = selectedTank.riskStatus === 'CRITICAL' || selectedTank.riskStatus === 'HIGH';

  return (
    <div className="space-y-6">
      {/* Campus Hostel & Tank Selector */}
      <TankSelector />

      {/* Conditional: WATER QUALITY ALERT BANNER (Matches user prompt section 8) */}
      {isHighRisk ? (
        <div className="p-6 rounded-2xl border-2 border-white bg-black text-white space-y-4 shadow-2xl relative overflow-hidden">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center flex-shrink-0 font-bold">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-white inline-block">
                🔴 CRITICAL ADVISORY
              </span>
              <h2 className="text-xl font-extrabold tracking-tight text-white mt-1">
                WATER QUALITY ALERT
              </h2>
              <p className="text-xs text-zinc-300 leading-relaxed max-w-md pt-1">
                A water-quality issue has been detected in your block. Please avoid drinking water from this source until further notice.
              </p>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
            <Link href="/student/alerts" className="flex-1">
              <Button variant="default" className="w-full text-xs font-bold bg-white text-black hover:bg-zinc-200">
                View Alert Details
              </Button>
            </Link>
            <Link href="/student/complaints" className="flex-1">
              <Button variant="outline" className="w-full text-xs font-bold border-zinc-700 hover:bg-zinc-900">
                Report Issue in My Room
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        /* NORMAL WATER STATUS HERO (Matches user prompt section 8) */
        <div className="p-8 rounded-2xl border border-zinc-800 bg-zinc-950 text-center space-y-3">
          <span className="text-xs font-mono uppercase tracking-widest text-zinc-400 font-semibold">
            WATER STATUS
          </span>

          <div className="py-2">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-zinc-700 bg-black text-sm font-extrabold text-white font-mono shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
              🟢 NORMAL
            </div>
          </div>

          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            Water quality in <strong className="text-white">{selectedTank.block}</strong> complies with campus potable safety benchmarks.
          </p>

          <div className="text-[11px] font-mono text-zinc-500 pt-1 flex items-center justify-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            <span>Last checked: 2 minutes ago</span>
          </div>
        </div>
      )}

      {/* Simplified 3 Key Metrics from user spec: pH, TDS, Turbidity */}
      <div className="space-y-3">
        <div className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold flex items-center justify-between">
          <span>Current Tap Water Purity</span>
          <span className="text-[10px] text-zinc-500 font-normal">Real-Time IoT</span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {/* pH */}
          <div className="p-4 rounded-xl border border-zinc-800 bg-black text-center space-y-1">
            <span className="text-[10px] font-mono text-zinc-500 uppercase">pH Level</span>
            <div className="text-2xl font-bold font-mono text-white">
              {currentReading.ph.toFixed(1)}
            </div>
            <span className="text-[10px] font-mono text-zinc-400">
              {currentReading.ph >= 6.5 && currentReading.ph <= 8.5 ? 'Balanced' : 'Abnormal'}
            </span>
          </div>

          {/* TDS */}
          <div className="p-4 rounded-xl border border-zinc-800 bg-black text-center space-y-1">
            <span className="text-[10px] font-mono text-zinc-500 uppercase">TDS</span>
            <div className="text-2xl font-bold font-mono text-white">
              {currentReading.tds} <span className="text-xs font-normal text-zinc-500">ppm</span>
            </div>
            <span className="text-[10px] font-mono text-zinc-400">
              {currentReading.tds <= 300 ? 'Clean' : currentReading.tds <= 500 ? 'Moderate' : 'High'}
            </span>
          </div>

          {/* Turbidity */}
          <div className="p-4 rounded-xl border border-zinc-800 bg-black text-center space-y-1">
            <span className="text-[10px] font-mono text-zinc-500 uppercase">Turbidity</span>
            <div className="text-2xl font-bold font-mono text-white">
              {currentReading.turbidity.toFixed(1)} <span className="text-xs font-normal text-zinc-500">NTU</span>
            </div>
            <span className="text-[10px] font-mono text-zinc-400">
              {currentReading.turbidity <= 2.0 ? 'Clear' : 'Cloudy'}
            </span>
          </div>
        </div>
      </div>

      {/* Primary Action Button from user spec: [ Report a Problem ] */}
      <div className="pt-2">
        <Link href="/student/complaints">
          <Button
            size="lg"
            className="w-full text-sm font-bold py-6 flex items-center justify-center gap-2 bg-white text-black hover:bg-zinc-200 transition-all shadow-lg"
          >
            <MessageSquareWarning className="h-5 w-5" />
            <span>Report a Problem</span>
          </Button>
        </Link>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <Link
          href="/student/status"
          className="p-4 rounded-xl border border-zinc-800 bg-zinc-950 hover:border-zinc-700 transition-all space-y-1 block"
        >
          <div className="text-xs font-bold text-white flex items-center justify-between">
            <span>Water Quality Guide</span>
            <ArrowRight className="h-3.5 w-3.5 text-zinc-400" />
          </div>
          <p className="text-[11px] text-zinc-400">Learn what pH and TDS values mean for your health.</p>
        </Link>

        <Link
          href="/student/history"
          className="p-4 rounded-xl border border-zinc-800 bg-zinc-950 hover:border-zinc-700 transition-all space-y-1 block"
        >
          <div className="text-xs font-bold text-white flex items-center justify-between">
            <span>My Complaints</span>
            <ArrowRight className="h-3.5 w-3.5 text-zinc-400" />
          </div>
          <p className="text-[11px] text-zinc-400">Track resolution status of your submitted reports.</p>
        </Link>
      </div>
    </div>
  );
}
