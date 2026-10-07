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
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Database className="h-5 w-5 text-white" />
            <span>Water Storage Tanks & Reservoirs</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Campus hostel water infrastructure, capacitive storage levels, and real-time node links
          </p>
        </div>

        {/* Filters: Hostel & Block */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Hostel Dropdown */}
          <div className="flex items-center gap-1.5 p-1 rounded-lg border border-zinc-800 bg-zinc-950 text-xs">
            <span className="text-zinc-500 px-2 text-[11px] uppercase tracking-wider font-semibold">Hostel:</span>
            <select
              value={selectedHostelFilter}
              onChange={(e) => {
                setSelectedHostelFilter(e.target.value);
                setSelectedBlockFilter('ALL');
              }}
              className="bg-black border border-zinc-700 text-white rounded px-2 py-1 text-xs focus:outline-none focus:border-white cursor-pointer"
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
          <div className="flex items-center gap-1 p-1 rounded-lg border border-zinc-800 bg-zinc-950 text-xs">
            <span className="text-zinc-500 px-1.5 text-[11px] uppercase tracking-wider font-semibold">Block:</span>
            {blocks.map((b) => (
              <button
                key={b}
                onClick={() => setSelectedBlockFilter(b)}
                className={`px-2 py-0.5 rounded text-xs transition-colors ${
                  selectedBlockFilter === b
                    ? 'bg-white text-black font-bold shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tanks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {filteredTanks.map((tank) => (
          <Card
            key={tank.id}
            className={`hover:border-zinc-700 transition-all ${
              tank.riskStatus === 'CRITICAL' ? 'border-red-900/60 bg-zinc-950/90' : 'bg-zinc-950'
            }`}
          >
            <CardHeader className="flex flex-row items-start justify-between pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base font-mono font-bold text-white">
                    {tank.code}
                  </CardTitle>
                  <span className="text-xs text-zinc-400 font-mono">({tank.block})</span>
                </div>
                <CardDescription className="font-mono text-zinc-400 mt-0.5">
                  {tank.name} • {tank.hostel}
                </CardDescription>
              </div>

              {tank.riskStatus === 'CRITICAL' ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border border-red-500/80 bg-red-950/60 text-red-200">
                  <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
                  🔴 High Risk ({tank.riskScore})
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border border-zinc-700 bg-zinc-900 text-zinc-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  🟢 Normal ({tank.riskScore})
                </span>
              )}
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Capacity & Water Level visual meter */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-400">Water Level</span>
                  <span className="text-white font-bold">
                    {tank.waterLevelPercent}%{' '}
                    <span className="text-zinc-500 font-normal">
                      ({Math.round((tank.waterLevelPercent / 100) * tank.capacityLiters).toLocaleString()} /{' '}
                      {tank.capacityLiters.toLocaleString()} L)
                    </span>
                  </span>
                </div>
                <div className="w-full bg-zinc-900 rounded-full h-2 border border-zinc-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      tank.waterLevelPercent < 25
                        ? 'bg-red-500'
                        : tank.riskStatus === 'CRITICAL'
                        ? 'bg-zinc-200'
                        : 'bg-white'
                    }`}
                    style={{ width: `${tank.waterLevelPercent}%` }}
                  />
                </div>
              </div>

              {/* Node Specifications */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-3 border-t border-zinc-800/80 text-zinc-400">
                <div>
                  <span className="text-zinc-500 text-[10px] uppercase block">IoT Sensor Status</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    ONLINE (ESP32)
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 text-[10px] uppercase block">Last Maintenance</span>
                  <span className="text-zinc-200 mt-0.5 block">{tank.lastServiceDate}</span>
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex items-center justify-between pt-3 border-t border-zinc-800/80">
                <span className="text-[11px] text-zinc-500 font-mono">
                  Next Service: {tank.nextServiceDate}
                </span>

                <div className="flex items-center gap-2">
                  <Link href="/admin/water-quality">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => setSelectedTankId(tank.id)}
                      className="text-xs gap-1.5"
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
