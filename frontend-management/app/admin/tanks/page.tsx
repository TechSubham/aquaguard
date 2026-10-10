'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAquaGuard } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Database, Building, Layers, CheckCircle, AlertTriangle, ArrowRight, Activity, Droplets } from 'lucide-react';

export default function TanksPage() {
  const { tanks, hostels, setSelectedTankId } = useAquaGuard();
  const [selectedHostelFilter, setSelectedHostelFilter] = useState<string>('ALL');
  const [selectedBlockFilter, setSelectedBlockFilter] = useState<string>('ALL');

  const filteredByHostel = selectedHostelFilter === 'ALL'
    ? tanks
    : tanks.filter((t) => t.hostelId === selectedHostelFilter || t.hostel.includes(selectedHostelFilter));

  const blocks = ['ALL', ...Array.from(new Set(filteredByHostel.map((t) => t.block)))];

  const filteredTanks = selectedBlockFilter === 'ALL'
    ? filteredByHostel
    : filteredByHostel.filter((t) => t.block === selectedBlockFilter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Database className="h-5 w-5 text-[#0284C7]" />
            <span>Water Storage Tanks & Reservoirs</span>
          </h1>
        </div>

        {/* Filters: Hostel & Block */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Hostel Dropdown */}
          <div className="flex items-center gap-1.5 p-1 rounded-lg border border-slate-200 bg-white text-xs shadow-sm">
            <span className="text-slate-500 px-2 text-[11px] uppercase tracking-wider font-semibold">Hostel:</span>
            <select
              value={selectedHostelFilter}
              onChange={(e) => {
                setSelectedHostelFilter(e.target.value);
                setSelectedBlockFilter('ALL');
              }}
              className="bg-slate-50 border border-slate-200 text-slate-800 rounded px-2 py-1 text-xs focus:outline-none focus:border-[#0284C7] cursor-pointer"
            >
              <option value="ALL">All Campus Hostels ({tanks.length} Tanks)</option>
              {hostels.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>
          </div>

          {/* Block Filter Pills */}
          <div className="flex items-center gap-1 p-1 rounded-lg border border-slate-200 bg-white text-xs shadow-sm">
            <span className="text-slate-500 px-1.5 text-[11px] uppercase tracking-wider font-semibold">Block:</span>
            {blocks.map((b) => (
              <button
                key={b}
                onClick={() => setSelectedBlockFilter(b)}
                className={`px-2.5 py-1 rounded text-xs transition-colors ${
                  selectedBlockFilter === b
                    ? 'bg-[#0284C7] text-white font-bold shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tanks Grid (Light Blue Water Theme) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {filteredTanks.map((tank) => (
          <Card
            key={tank.id}
            className={`rounded-2xl border border-sky-200 bg-gradient-to-br from-[#E0F2FE] via-[#F0F9FF] to-[#E0F7FA] text-slate-900 shadow-sm hover:shadow-md transition-all ${
              tank.riskStatus === 'CRITICAL' ? 'ring-2 ring-red-400/50' : ''
            }`}
          >
            <CardHeader className="flex flex-row items-start justify-between pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base font-mono font-bold text-sky-950">
                    {tank.code}
                  </CardTitle>
                  <span className="text-xs text-sky-800 font-mono font-semibold">({tank.block})</span>
                </div>
                <CardDescription className="font-mono text-slate-600 mt-0.5">
                  {tank.name} • {tank.hostel}
                </CardDescription>
              </div>

              {tank.riskStatus === 'CRITICAL' ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border border-red-300 bg-red-100 text-red-800 shadow-sm">
                  <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
                  🔴 High Risk ({tank.riskScore})
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border border-emerald-300 bg-emerald-100 text-emerald-800">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  🟢 Normal ({tank.riskScore})
                </span>
              )}
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Capacity & Water Level visual meter */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-700 font-semibold">Water Level</span>
                  <span className="text-sky-950 font-bold">
                    {tank.waterLevelPercent}%{' '}
                    <span className="text-slate-600 font-normal">
                      ({Math.round((tank.waterLevelPercent / 100) * tank.capacityLiters).toLocaleString()} /{' '}
                      {tank.capacityLiters.toLocaleString()} L)
                    </span>
                  </span>
                </div>
                <div className="w-full bg-sky-200/80 rounded-full h-2.5 border border-sky-300/60 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      tank.waterLevelPercent < 25
                        ? 'bg-red-500'
                        : 'bg-gradient-to-r from-[#0284C7] to-[#38BDF8]'
                    }`}
                    style={{ width: `${tank.waterLevelPercent}%` }}
                  />
                </div>
              </div>

              {/* Node Specifications */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-3 border-t border-sky-200/80 text-slate-700">
                <div>
                  <span className="text-sky-800/80 text-[10px] uppercase font-bold block">IoT Sensor Status</span>
                  <span className="text-emerald-700 font-bold flex items-center gap-1 mt-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    ONLINE (ESP32)
                  </span>
                </div>
                <div>
                  <span className="text-sky-800/80 text-[10px] uppercase font-bold block">Last Maintenance</span>
                  <span className="text-slate-900 font-semibold mt-0.5 block">{tank.lastServiceDate}</span>
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex items-center justify-between pt-3 border-t border-sky-200/80">
                <span className="text-[11px] text-slate-600 font-mono">
                  Next Service: {tank.nextServiceDate}
                </span>

                <div className="flex items-center gap-2">
                  <Link href="/admin/water-quality">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => setSelectedTankId(tank.id)}
                      className="text-xs gap-1.5 bg-[#0284C7] hover:bg-[#0369A1] text-white font-semibold rounded-full shadow-sm"
                    >
                      <Activity className="h-3.5 w-3.5" />
                      View Telemetry
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
