'use client';

import React from 'react';
import Link from 'next/link';
import { useAquaGuard } from '@/lib/store';
import { Button } from '@/components/ui/button';
import {
  Droplet,
  ShieldCheck,
  AlertTriangle,
  Thermometer,
  CheckCircle2,
  Activity,
  Waves,
  FlaskConical,
  Flag,
} from 'lucide-react';

import { TankSelector } from '@/components/shared/TankSelector';

type ParamStatus = 'good' | 'warn';

function clamp(n: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, n));
}

function StatusPill({ status }: { status: ParamStatus }) {
  return status === 'good' ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 text-sky-700 px-2 py-0.5 text-[10px] font-semibold">
      <CheckCircle2 className="h-3 w-3" /> In range
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-700 px-2 py-0.5 text-[10px] font-semibold">
      <AlertTriangle className="h-3 w-3" /> Check
    </span>
  );
}

function ParamTile({
  icon,
  label,
  value,
  unit,
  target,
  percent,
  status,
  note,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit?: string;
  target: string;
  percent?: number;
  status?: ParamStatus;
  note: string;
}) {
  return (
    <div className="rounded-3xl bg-white p-4 shadow-[0_8px_24px_-12px_rgba(37,99,235,0.35)] ring-1 ring-blue-100 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 text-white flex items-center justify-center">
          {icon}
        </div>
        {status && <StatusPill status={status} />}
      </div>

      <div>
        <p className="text-[11px] font-medium text-slate-500">{label}</p>
        <p className="text-2xl font-extrabold text-slate-900 leading-tight">
          {value}
          {unit && <span className="ml-1 text-xs font-semibold text-slate-400">{unit}</span>}
        </p>
      </div>

      {percent !== undefined && (
        <div className="h-1.5 w-full rounded-full bg-blue-50 overflow-hidden">
          <div
            className={`h-full rounded-full ${
              status === 'warn'
                ? 'bg-gradient-to-r from-amber-400 to-orange-400'
                : 'bg-gradient-to-r from-blue-500 to-cyan-400'
            }`}
            style={{ width: `${clamp(percent)}%` }}
          />
        </div>
      )}

      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wide text-blue-500">{target}</p>
        <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">{note}</p>
      </div>
    </div>
  );
}

export default function StudentWaterStatusPage() {
  const { currentReading, selectedTank } = useAquaGuard();

  const isSafe = selectedTank.riskStatus !== 'CRITICAL' && selectedTank.riskStatus !== 'HIGH';

  const phOk = currentReading.ph >= 6.5 && currentReading.ph <= 8.5;
  const tdsOk = currentReading.tds < 300;
  const turbOk = currentReading.turbidity < 1.0;

  // Position of each reading along a visual scale
  const phPct = ((currentReading.ph - 4) / (11 - 4)) * 100;
  const tdsPct = (currentReading.tds / 600) * 100;
  const turbPct = (currentReading.turbidity / 2) * 100;

  return (
    <div className="space-y-5 pb-6">
      <TankSelector />

      {/* Hero */}
      <section
        className={`relative overflow-hidden rounded-[2rem] p-6 text-white shadow-xl ${
          isSafe
            ? 'bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400 shadow-blue-300/50'
            : 'bg-gradient-to-br from-amber-500 via-orange-400 to-amber-300 shadow-amber-200/60'
        }`}
      >
        {/* decorative bubbles */}
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/15" />
        <div className="pointer-events-none absolute right-16 top-24 h-16 w-16 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-12 -left-8 h-36 w-36 rounded-full bg-white/10" />

        <div className="relative">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur px-3 py-1 text-[10px] font-semibold uppercase tracking-widest">
            <Droplet className="h-3 w-3" /> {selectedTank.block}
          </span>

          <div className="mt-5 flex items-center gap-4">
            <div className="h-14 w-14 shrink-0 rounded-2xl bg-white text-blue-600 flex items-center justify-center shadow-lg">
              {isSafe ? (
                <ShieldCheck className="h-8 w-8" />
              ) : (
                <AlertTriangle className="h-8 w-8 text-amber-500" />
              )}
            </div>
            <div>
              <p className="text-[11px] font-medium text-white/80">Current health advisory</p>
              <h1 className="text-xl font-extrabold leading-snug">
                {isSafe ? 'Safe to drink & bathe' : 'Filter or boil before drinking'}
              </h1>
            </div>
          </div>

          <p className="mt-4 text-xs leading-relaxed text-white/90">
            {isSafe
              ? 'Every measured parameter is within the Bureau of Indian Standards (IS 10500:2012) drinking limits.'
              : 'Turbidity or TDS is currently elevated in this reservoir. Please use the RO water stations in the mess until it is cleared.'}
          </p>
        </div>
      </section>

      {/* Section title */}
      <div className="flex items-center gap-2 px-1">
        <Activity className="h-4 w-4 text-blue-600" />
        <h2 className="text-sm font-bold text-slate-800">Live water readings</h2>
      </div>

      {/* Parameter grid */}
      <div className="grid grid-cols-2 gap-3">
        <ParamTile
          icon={<FlaskConical className="h-4 w-4" />}
          label="pH level"
          value={currentReading.ph.toFixed(2)}
          target="Ideal 6.5 – 8.5"
          percent={phPct}
          status={phOk ? 'good' : 'warn'}
          note="Balanced pH aids mineral absorption and prevents pipe corrosion."
        />
        <ParamTile
          icon={<Waves className="h-4 w-4" />}
          label="TDS"
          value={String(currentReading.tds)}
          unit="ppm"
          target="Ideal < 300 ppm"
          percent={tdsPct}
          status={tdsOk ? 'good' : 'warn'}
          note="Dissolved minerals like calcium and magnesium. Below 500 ppm is healthy."
        />
        <ParamTile
          icon={<Droplet className="h-4 w-4" />}
          label="Turbidity"
          value={currentReading.turbidity.toFixed(2)}
          unit="NTU"
          target="Target < 1.0 NTU"
          percent={turbPct}
          status={turbOk ? 'good' : 'warn'}
          note="Cloudiness of water. Low values mean filtration and UV are working."
        />
        <ParamTile
          icon={<Thermometer className="h-4 w-4" />}
          label="Temperature"
          value={currentReading.temperature.toFixed(1)}
          unit="°C"
          target="Roof tank ambient"
          note="Measured inside the storage tank on the roof."
        />
      </div>

      {/* CTA */}
      <Link href="/student/complaints" className="block">
        <Button className="w-full rounded-2xl py-6 text-sm font-bold bg-white text-blue-700 ring-1 ring-blue-200 shadow-sm hover:bg-blue-50">
          <Flag className="h-4 w-4 mr-2" />
          Something seems off? Report to facilities
        </Button>
      </Link>
    </div>
  );
}