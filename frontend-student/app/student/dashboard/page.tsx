'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useAquaGuard } from '@/lib/store';
import { formatClockTime, formatNumber } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartLegend, ChartTooltip, type ChartConfig } from '@/components/ui/chart';
import { TankSelector } from '@/components/shared/TankSelector';
import { SensorReading } from '@/lib/types';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Droplet,
  Flag,
  FlaskConical,
  MessageSquareWarning,
  ShieldAlert,
  ShieldCheck,
  Thermometer,
  Waves,
} from 'lucide-react';

type ParamStatus = 'good' | 'warn';
type MetricKey = 'ph' | 'tds' | 'turbidity' | 'temperature';

const chartConfig: ChartConfig = {
  ph: { label: 'pH', color: '#0284C7', unit: 'pH' },
  tds: { label: 'TDS', color: '#0F766E', unit: 'ppm' },
  turbidity: { label: 'Turbidity', color: '#F59E0B', unit: 'NTU' },
  temperature: { label: 'Temp', color: '#EF4444', unit: 'C' },
};

const chartDetails: Record<MetricKey, { title: string; decimals: number; maxHint: number }> = {
  ph: { title: 'pH stability', decimals: 2, maxHint: 14 },
  tds: { title: 'Dissolved solids', decimals: 0, maxHint: 600 },
  turbidity: { title: 'Turbidity drift', decimals: 2, maxHint: 5 },
  temperature: { title: 'Tank temperature', decimals: 1, maxHint: 40 },
};

function clamp(n: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, n));
}

function StatusPill({ status }: { status: ParamStatus }) {
  return status === 'good' ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 text-sky-700 px-2 py-0.5 text-[10px] font-semibold">
      <CheckCircle2 className="h-3 w-3" /> In range
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 text-red-700 px-2 py-0.5 text-[10px] font-semibold">
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
    <Card className="rounded-3xl border-blue-100 p-4 shadow-[0_8px_24px_-12px_rgba(37,99,235,0.35)]">
      <div className="flex items-start justify-between">
        <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 text-white flex items-center justify-center">
          {icon}
        </div>
        {status && <StatusPill status={status} />}
      </div>

      <div className="mt-3">
        <p className="text-[11px] font-medium text-slate-500">{label}</p>
        <p className="text-2xl font-extrabold text-slate-900 leading-tight">
          {value}
          {unit && <span className="ml-1 text-xs font-semibold text-slate-400">{unit}</span>}
        </p>
      </div>

      {percent !== undefined && (
        <div className="mt-3 h-1.5 w-full rounded-full bg-blue-50 overflow-hidden">
          <div
            className={`h-full rounded-full ${
              status === 'warn'
                ? 'bg-gradient-to-r from-red-500 to-rose-400'
                : 'bg-gradient-to-r from-blue-500 to-cyan-400'
            }`}
            style={{ width: `${clamp(percent)}%` }}
          />
        </div>
      )}

      <div className="mt-3">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-blue-500">{target}</p>
        <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">{note}</p>
      </div>
    </Card>
  );
}

function LiveQualityChart({ data }: { data: SensorReading[] }) {
  const [metric, setMetric] = useState<MetricKey>('ph');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const details = chartDetails[metric];

  const points = useMemo(() => {
    const source = data.length > 1 ? data : [];
    if (!source.length) return [];

    const values = source.map((reading) => Number(reading[metric]));
    const min = Math.min(...values);
    const max = Math.max(...values);
    const paddedMin = Math.max(0, min - (max - min || details.maxHint) * 0.2);
    const paddedMax = Math.max(max + (max - min || details.maxHint) * 0.2, details.maxHint * 0.2);
    const width = 760;
    const height = 250;
    const padX = 42;
    const padTop = 24;
    const padBottom = 36;
    const plotWidth = width - padX * 2;
    const plotHeight = height - padTop - padBottom;

    return source.map((reading, index) => {
      const value = Number(reading[metric]);
      const x = padX + (index / Math.max(1, source.length - 1)) * plotWidth;
      const y = padTop + plotHeight - ((value - paddedMin) / Math.max(1, paddedMax - paddedMin)) * plotHeight;
      return { x, y, value, reading };
    });
  }, [data, details.maxHint, metric]);

  const path = points.reduce((acc, point, index) => {
    return index === 0 ? `M ${point.x} ${point.y}` : `${acc} L ${point.x} ${point.y}`;
  }, '');
  const areaPath = points.length
    ? `${path} L ${points[points.length - 1].x} 214 L ${points[0].x} 214 Z`
    : '';
  const latest = points[points.length - 1];
  const hovered = hoveredIndex !== null ? points[hoveredIndex] : latest;
  const chartColor = chartConfig[metric].color;

  return (
    <Card className="rounded-3xl lg:col-span-7">
      <CardHeader className="flex flex-col gap-4 pb-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-sky-600" />
            <CardTitle>{details.title}</CardTitle>
          </div>
          <p className="mt-1 text-xs text-slate-500">Live readings from the selected tank sensor</p>
        </div>
        <ChartLegend
          config={chartConfig}
          activeKey={metric}
          onSelect={(key) => {
            setMetric(key as MetricKey);
            setHoveredIndex(null);
          }}
        />
      </CardHeader>

      <CardContent>
        <div className="mb-3 grid grid-cols-3 gap-3 text-xs">
          <div className="rounded-2xl bg-slate-50 p-3">
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Current</p>
            <p className="mt-1 font-mono text-lg font-extrabold text-slate-900">
              {latest ? formatNumber(latest.value, details.decimals) : '--'} {chartConfig[metric].unit}
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-3">
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Samples</p>
            <p className="mt-1 font-mono text-lg font-extrabold text-slate-900">{data.length}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-3">
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Last sync</p>
            <p className="mt-1 font-mono text-sm font-bold text-slate-900">
              {latest ? formatClockTime(latest.reading.recorded_at) : '--'}
            </p>
          </div>
        </div>

        <ChartContainer config={chartConfig} className="border border-sky-100 bg-sky-50/30">
          {hovered && (
            <ChartTooltip
              style={{
                left: `${clamp((hovered.x / 760) * 100, 8, 78)}%`,
                top: `${clamp(hovered.y - 52, 8, 170)}px`,
              }}
            >
              <p className="font-bold text-slate-900">
                {formatNumber(hovered.value, details.decimals)} {chartConfig[metric].unit}
              </p>
              <p className="text-[10px] text-slate-500">{formatClockTime(hovered.reading.recorded_at)}</p>
            </ChartTooltip>
          )}
          <svg viewBox="0 0 760 250" className="h-full w-full select-none">
            <defs>
              <linearGradient id="dashboardQualityArea" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={chartColor} stopOpacity="0.24" />
                <stop offset="100%" stopColor={chartColor} stopOpacity="0" />
              </linearGradient>
            </defs>
            {[0, 1, 2, 3].map((line) => (
              <line
                key={line}
                x1="42"
                x2="718"
                y1={40 + line * 48}
                y2={40 + line * 48}
                stroke="#DBEAFE"
                strokeDasharray="5 5"
              />
            ))}
            <path d={areaPath} fill="url(#dashboardQualityArea)" />
            <path d={path} fill="none" stroke={chartColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            {points.map((point, index) => (
              <circle
                key={`${point.reading.recorded_at}-${index}`}
                cx={point.x}
                cy={point.y}
                r={hoveredIndex === index ? 7 : 4}
                fill="#FFFFFF"
                stroke={chartColor}
                strokeWidth="2.5"
                className="cursor-pointer transition-all"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            ))}
          </svg>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

function AdvisoryButton({ activeCount }: { activeCount: number }) {
  return (
    <Link href="/student/alerts" className="group block">
      <Card className="relative min-h-[210px] overflow-hidden rounded-3xl border-sky-100 bg-white p-0 shadow-[0_18px_50px_-28px_rgba(2,132,199,0.65)] transition-all hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-[0_24px_55px_-28px_rgba(2,132,199,0.85)]">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-400" />
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 ring-1 ring-sky-100">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-sky-600">Hostel advisories</p>
                <h3 className="mt-1 text-lg font-extrabold text-slate-900">Active updates</h3>
              </div>
            </div>
            <span className="rounded-full bg-slate-900 px-3 py-1 text-[11px] font-bold text-white transition-colors group-hover:bg-sky-700">
              View all
            </span>
          </div>

          <div className="mt-6 flex items-end justify-between gap-4">
            <div>
              <p className="font-mono text-5xl font-extrabold tracking-tight text-slate-900">{activeCount}</p>
              <p className="mt-1 text-xs font-semibold text-slate-500">
                {activeCount === 1 ? 'active advisory' : 'active advisories'} for your hostel block
              </p>
            </div>
            <div className="rounded-2xl bg-emerald-50 px-3 py-2 text-right ring-1 ring-emerald-100">
              <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-600">Tap line</p>
              <p className="text-sm font-extrabold text-emerald-700">Safe</p>
            </div>
          </div>

          <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-sky-500 to-emerald-400 transition-all group-hover:w-full" />
          </div>
        </div>
      </Card>
    </Link>
  );
}

export default function StudentDashboardPage() {
  const {
    selectedTank,
    selectedHostel,
    currentReading,
    historyReadings,
    alerts,
    session,
  } = useAquaGuard();

  const activeAlerts = alerts.filter((a) => a.status !== 'RESOLVED');
  const isSafe = selectedTank.riskStatus !== 'CRITICAL' && selectedTank.riskStatus !== 'HIGH';
  const phOk = currentReading.ph >= 6.5 && currentReading.ph <= 8.5;
  const tdsOk = currentReading.tds < 300;
  const turbOk = currentReading.turbidity < 1.0;
  const phPct = ((currentReading.ph - 4) / (11 - 4)) * 100;
  const tdsPct = (currentReading.tds / 600) * 100;
  const turbPct = (currentReading.turbidity / 2) * 100;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#0B1B22]">
            Good morning, {session.name.split(' ')[0]}!
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
            {selectedHostel.name} • {selectedTank.block} • Potable drinking water online
          </p>
        </div>

        <Link href="/student/complaints">
          <Button className="h-10 px-5 gap-2">
            <MessageSquareWarning className="h-4 w-4" />
            Report water issue
          </Button>
        </Link>
      </div>

      <TankSelector />

      <section
        className={`relative overflow-hidden rounded-[2rem] p-6 text-white shadow-xl ${
          isSafe
            ? 'bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400 shadow-blue-300/50'
            : 'bg-gradient-to-br from-red-600 via-red-500 to-rose-400 shadow-red-200/60'
        }`}
      >
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/15" />
        <div className="pointer-events-none absolute right-16 top-24 h-16 w-16 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-12 -left-8 h-36 w-36 rounded-full bg-white/10" />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur px-3 py-1 text-[10px] font-semibold uppercase tracking-widest">
              <Droplet className="h-3 w-3" /> {selectedTank.block}
            </span>

            <div className="mt-5 flex items-center gap-4">
              <div className="h-14 w-14 shrink-0 rounded-2xl bg-white text-blue-600 flex items-center justify-center shadow-lg">
                {isSafe ? (
                  <ShieldCheck className="h-8 w-8" />
                ) : (
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                )}
              </div>
              <div>
                <p className="text-[11px] font-medium text-white/80">Current health advisory</p>
                <h2 className="text-xl font-extrabold leading-snug">
                  {isSafe ? 'Safe to drink & bathe' : 'Filter or boil before drinking'}
                </h2>
              </div>
            </div>

            <p className="mt-4 text-xs leading-relaxed text-white/90">
              {isSafe
                ? 'Every measured parameter is within the Bureau of Indian Standards (IS 10500:2012) drinking limits.'
                : 'Turbidity or TDS is currently elevated in this reservoir. Please use the RO water stations in the mess until it is cleared.'}
            </p>
          </div>

          <Link href="/student/complaints">
            <Button className="bg-white text-blue-700 hover:bg-blue-50 ring-1 ring-white/40 gap-2">
              <Flag className="h-4 w-4" />
              Report concern
            </Button>
          </Link>
        </div>
      </section>

      <div className="flex items-center gap-2 px-1">
        <Activity className="h-4 w-4 text-blue-600" />
        <h2 className="text-sm font-bold text-slate-800">Live water readings</h2>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:col-span-5">
          <ParamTile
            icon={<FlaskConical className="h-4 w-4" />}
            label="pH level"
            value={currentReading.ph.toFixed(2)}
            target="Ideal 6.5 - 8.5"
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

        <LiveQualityChart data={historyReadings} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8 card-elevated p-6 space-y-5 bg-white">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Campus hydration hygiene</h3>
              <p className="text-xs text-slate-500">Normal, caution, and severe ranges for drinking-water readings</p>
            </div>
            <span className="rounded-full bg-sky-50 px-3 py-1 text-[11px] font-bold text-sky-700 ring-1 ring-sky-100">
              IS 10500 reference
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {[
              {
                label: 'pH level',
                current: currentReading.ph.toFixed(2),
                normal: '6.5 - 8.5',
                caution: '6.0 - 6.4 or 8.6 - 9.0',
                severe: '< 6.0 or > 9.0',
                note: 'Very acidic or alkaline water can irritate skin and signal pipe corrosion.',
              },
              {
                label: 'TDS',
                current: `${currentReading.tds} ppm`,
                normal: '100 - 300 ppm',
                caution: '301 - 500 ppm',
                severe: '> 500 ppm',
                note: 'High dissolved solids can cause salty taste and scaling in kettles or filters.',
              },
              {
                label: 'Turbidity',
                current: `${currentReading.turbidity.toFixed(2)} NTU`,
                normal: '< 1.0 NTU',
                caution: '1.0 - 5.0 NTU',
                severe: '> 5.0 NTU',
                note: 'Cloudiness can indicate sediment, filtration issues, or microbial risk.',
              },
              {
                label: 'Temperature',
                current: `${currentReading.temperature.toFixed(1)} °C`,
                normal: '15 - 25 °C',
                caution: '26 - 30 °C',
                severe: '> 30 °C',
                note: 'Warm storage tanks can worsen taste and support faster biological growth.',
              },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900">{item.label}</h4>
                    <p className="mt-1 text-[11px] text-slate-500">Current: {item.current}</p>
                  </div>
                  <span className="rounded-full bg-white px-2 py-1 text-[10px] font-bold text-slate-600 ring-1 ring-slate-200">
                    Live
                  </span>
                </div>

                <div className="mt-4 grid gap-2 text-[11px]">
                  <div className="rounded-xl bg-emerald-50 px-3 py-2 text-emerald-800 ring-1 ring-emerald-100">
                    <span className="font-bold">Normal:</span> {item.normal}
                  </div>
                  <div className="rounded-xl bg-amber-50 px-3 py-2 text-amber-800 ring-1 ring-amber-100">
                    <span className="font-bold">Caution:</span> {item.caution}
                  </div>
                  <div className="rounded-xl bg-red-50 px-3 py-2 text-red-800 ring-1 ring-red-100">
                    <span className="font-bold">Severe:</span> {item.severe}
                  </div>
                </div>

                <p className="mt-3 text-[11px] leading-relaxed text-slate-500">{item.note}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4">
          <AdvisoryButton activeCount={activeAlerts.length} />
        </div>
      </div>
    </div>
  );
}
