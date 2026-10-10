
'use client';

import React from 'react';
import { useAquaGuard } from '@/lib/store';
import { Database, Building, Layers } from 'lucide-react';

export function TankSelector() {
  const {
    hostels,
    selectedHostelId,
    setSelectedHostelId,
    selectedHostel,
    tanks,
    selectedTankId,
    setSelectedTankId,
    selectedTank,
  } = useAquaGuard();

  // Filter tanks belonging to the selected hostel
  const hostelTanks = tanks.filter(
    (t) =>
      t.hostelId === selectedHostelId ||
      t.hostel === selectedHostel.name
  );

  // Get available blocks for this hostel
  const blocks = Array.from(
    new Set(hostelTanks.map((t) => t.block))
  );

  const currentBlock = selectedTank.block;

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-300 bg-white p-3 shadow-sm transition-shadow hover:shadow-md">

      {/* 1. Hostel Selector */}
      <div className="flex items-center gap-2 text-xs text-slate-700">
        <Building className="h-4 w-4 text-sky-600" />

        <span className="hidden text-[11px] font-semibold uppercase tracking-wider text-slate-500 sm:inline">
          Hostel:
        </span>

        <select
          value={selectedHostelId}
          onChange={(e) => setSelectedHostelId(e.target.value)}
          aria-label="Select Campus Hostel"
          className="max-w-full cursor-pointer rounded-lg border border-slate-300 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-800 transition-colors hover:border-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
        >
          {hostels.map((h) => (
            <option key={h.id} value={h.id}>
              {h.name} ({h.type})
            </option>
          ))}
        </select>
      </div>

      {/* Divider */}
      <div className="hidden h-6 w-px bg-slate-300 sm:block" />

      {/* 2. Block Selector */}
      <div className="flex items-center gap-1.5 text-xs">
        <Layers className="h-3.5 w-3.5 text-sky-600" />

        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          Block:
        </span>

        <div className="flex items-center gap-1">
          {blocks.map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => {
                const firstTankInBlock = hostelTanks.find(
                  (t) => t.block === b
                );

                if (firstTankInBlock) {
                  setSelectedTankId(firstTankInBlock.id);
                }
              }}
              className={`rounded-lg border px-2.5 py-1 text-xs transition-all ${
                currentBlock === b
                  ? 'border-sky-300 bg-sky-50 font-semibold text-sky-700 shadow-sm'
                  : 'border-slate-300 bg-white text-slate-600 hover:border-slate-400 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="hidden h-6 w-px bg-slate-300 sm:block" />

      {/* 3. Tank Selector */}
      <div className="flex min-w-[220px] flex-1 items-center gap-2 text-xs">
        <Database className="h-3.5 w-3.5 shrink-0 text-sky-600" />

        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          Tank:
        </span>

        <select
          value={selectedTankId}
          onChange={(e) => setSelectedTankId(e.target.value)}
          aria-label="Select Tank"
          className="min-w-0 flex-1 cursor-pointer rounded-lg border border-slate-300 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-800 transition-colors hover:border-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
        >
          {hostelTanks.map((t) => (
            <option key={t.id} value={t.id}>
              {t.code} — {t.name} ({t.waterLevelPercent}% •{' '}
              {t.capacityLiters.toLocaleString()} L)
            </option>
          ))}
        </select>
      </div>

      {/* 4. Live Telemetry Node Status */}
      <div className="hidden items-center gap-2 pl-2 text-xs lg:flex">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          Node:
        </span>

        <span className="flex items-center gap-1.5 font-medium text-emerald-600">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
          ONLINE
        </span>
      </div>
    </div>
  );
}
