'use client';

import React from 'react';
import Link from 'next/link';
import { useAquaGuard } from '@/lib/store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Building,
  Info,
  ArrowRight,
} from 'lucide-react';

export default function StudentAlertsPage() {
  const { alerts, selectedTank } = useAquaGuard();

  const activeAlerts = alerts.filter((a) => a.status !== 'RESOLVED');
  const pastAlerts = alerts.filter((a) => a.status === 'RESOLVED');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-3 border-b border-zinc-800">
        <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
          Campus Health Advisories
        </span>
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2 mt-0.5">
          <ShieldAlert className="h-5 w-5 text-white" />
          Water Quality Advisories
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Active precautionary notices issued by campus facilities for {selectedTank.block} and surrounding blocks.
        </p>
      </div>

      {/* Active Advisories */}
      <div className="space-y-4">
        <h2 className="text-xs font-mono uppercase font-bold tracking-wider text-zinc-400">
          Active Directives ({activeAlerts.length})
        </h2>

        {activeAlerts.length === 0 ? (
          <div className="p-8 rounded-2xl border border-zinc-800 bg-zinc-950 text-center space-y-2">
            <CheckCircle2 className="h-8 w-8 text-white mx-auto" />
            <h3 className="text-sm font-bold text-white">No Active Advisories</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              Water quality across all residential blocks is nominal. No drinking restrictions in effect.
            </p>
          </div>
        ) : (
          activeAlerts.map((alert) => (
            <div
              key={alert.id}
              className="p-5 rounded-2xl border border-white bg-black space-y-3 shadow-xl"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                    {alert.severity} NOTICE
                  </span>
                </div>
                <span className="text-[11px] font-mono text-zinc-400">{alert.timestamp}</span>
              </div>

              <div>
                <h3 className="text-base font-bold text-white">{alert.title}</h3>
                <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                  {alert.description}
                </p>
              </div>

              {/* Action guidance callout */}
              <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-mono space-y-1">
                <div className="text-white font-bold flex items-center gap-1.5">
                  <Info className="h-3.5 w-3.5" /> Recommended Student Action:
                </div>
                <p className="text-zinc-300">
                  Please use filtered drinking water stations located on the Ground Floor mess until technician testing completes.
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-[11px] font-mono text-zinc-400">
                <span>Location: {alert.tankName}</span>
                <span>Facilities Team On-Site</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Past Advisories History */}
      {pastAlerts.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-zinc-800">
          <h2 className="text-xs font-mono uppercase font-bold tracking-wider text-zinc-500">
            Past Resolved Advisories
          </h2>

          <div className="space-y-2">
            {pastAlerts.map((alert) => (
              <div
                key={alert.id}
                className="p-4 rounded-xl border border-zinc-800 bg-zinc-950 text-xs flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-white">{alert.title}</div>
                  <div className="text-[11px] text-zinc-500 font-mono">
                    {alert.tankName} • Resolved at {alert.timestamp}
                  </div>
                </div>
                <Badge variant="secondary" className="font-mono text-[10px]">
                  RESOLVED
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer Link */}
      <div className="pt-2">
        <Link href="/student/complaints">
          <Button variant="outline" className="w-full text-xs font-bold py-5">
            Notice a New Problem? Submit Report
          </Button>
        </Link>
      </div>
    </div>
  );
}
