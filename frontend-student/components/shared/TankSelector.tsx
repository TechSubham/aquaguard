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

  // Filter tanks belonging to currently selected hostel
  const hostelTanks = tanks.filter(
    (t) => t.hostelId === selectedHostelId || t.hostel === selectedHostel.name
  );

  // Available blocks in this hostel
  const blocks = Array.from(new Set(hostelTanks.map((t) => t.block)));
  const currentBlock = selectedTank.block;

  return (
    <div className="flex flex-wrap items-center gap-3 p-3 rounded-xl border border-sky-100 bg-white/95 backdrop-blur-sm shadow-[0_8px_24px_-16px_rgba(2,132,199,0.45)]">
      {/* 1. Campus Hostel Dropdown */}
      <div className="flex items-center gap-2 text-xs text-slate-700">
        <Building className="h-4 w-4 text-sky-500" />
        <span className="text-slate-400 text-[11px] uppercase tracking-wider font-semibold hidden sm:inline">
          Hostel:
        </span>
        <select
          value={selectedHostelId}
          onChange={(e) => setSelectedHostelId(e.target.value)}
          aria-label="Select Campus Hostel"
          className="bg-sky-50 border border-sky-100 text-slate-900 font-medium text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-sky-400 cursor-pointer hover:border-sky-200 transition-colors"
        >
          {hostels.map((h) => (
            <option key={h.id} value={h.id} className="bg-white text-slate-900">
              {h.name} ({h.type})
            </option>
          ))}
        </select>
      </div>

      <div className="h-4 w-px bg-sky-100 hidden sm:block" />

      {/* 2. Block Selector for this hostel */}
      <div className="flex items-center gap-1.5 text-xs">
        <Layers className="h-3.5 w-3.5 text-sky-500" />
        <span className="text-slate-400 text-[11px] uppercase tracking-wider font-semibold">Block:</span>
        <div className="flex items-center gap-1">
          {blocks.map((b) => (
            <button
              key={b}
              onClick={() => {
                const firstTankInBlock = hostelTanks.find((t) => t.block === b);
                if (firstTankInBlock) setSelectedTankId(firstTankInBlock.id);
              }}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                currentBlock === b
                  ? 'bg-sky-600 text-white font-bold shadow-sm'
                  : 'text-slate-500 hover:text-sky-700 hover:bg-sky-50'
              }`}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      <div className="h-4 w-px bg-sky-100 hidden sm:block" />

      {/* 3. Tank Dropdown for this hostel */}
      <div className="flex items-center gap-2 text-xs flex-1 min-w-[220px]">
        <Database className="h-3.5 w-3.5 text-sky-500" />
        <span className="text-slate-400 text-[11px] uppercase tracking-wider font-semibold">Tank:</span>
        <select
          value={selectedTankId}
          onChange={(e) => setSelectedTankId(e.target.value)}
          aria-label="Select Tank"
          className="flex-1 bg-sky-50 border border-sky-100 text-slate-900 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-sky-400 cursor-pointer hover:border-sky-200 transition-colors"
        >
          {hostelTanks.map((t) => (
            <option key={t.id} value={t.id} className="bg-white text-slate-900">
              {t.code} — {t.name} ({t.waterLevelPercent}% • {t.capacityLiters.toLocaleString()} L)
            </option>
          ))}
        </select>
      </div>

      {/* 4. Live telemetry node status */}
      <div className="hidden lg:flex items-center gap-2 pl-2 text-xs">
        <span className="text-slate-400 text-[11px] uppercase">Node:</span>
        <span className="text-emerald-600 flex items-center gap-1.5 font-medium">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          ONLINE
        </span>
      </div>
    </div>
  );
}
