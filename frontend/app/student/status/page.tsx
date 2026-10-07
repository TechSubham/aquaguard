'use client';

import React from 'react';
import Link from 'next/link';
import { useAquaGuard } from '@/lib/store';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Droplet,
  ShieldCheck,
  AlertTriangle,
  Info,
  Thermometer,
  CheckCircle2,
  HelpCircle,
  Clock,
} from 'lucide-react';

import { TankSelector } from '@/components/shared/TankSelector';

export default function StudentWaterStatusPage() {
  const { currentReading, selectedTank } = useAquaGuard();

  const isSafe = selectedTank.riskStatus !== 'CRITICAL' && selectedTank.riskStatus !== 'HIGH';

  return (
    <div className="space-y-6">
      <TankSelector />

      {/* Header */}
      <div className="pb-3 border-b border-zinc-800">
        <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
          Campus Potability Guide
        </span>
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2 mt-0.5">
          <Droplet className="h-5 w-5 text-white" />
          Water Purity Breakdown
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Detailed physicochemical breakdown of tap water supplied to {selectedTank.block}.
        </p>
      </div>

      {/* Safety Verdict Box */}
      <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-950 flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center flex-shrink-0">
          {isSafe ? <ShieldCheck className="h-6 w-6" /> : <AlertTriangle className="h-6 w-6" />}
        </div>
        <div>
          <span className="text-xs font-mono font-bold tracking-wider uppercase text-zinc-400">
            Current Health Advisory
          </span>
          <h2 className="text-lg font-bold text-white mt-0.5">
            {isSafe ? 'Water Safe for Direct Drinking & Bathing' : 'Advisory: Filtration or Boiling Required'}
          </h2>
          <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
            {isSafe
              ? 'All physical and chemical parameters fall strictly within the Bureau of Indian Standards (IS 10500:2012) drinking threshold.'
              : 'Turbidity or TDS levels are currently elevated in this storage reservoir. Hostel management recommends utilizing RO water stations in the mess until cleared.'}
          </p>
        </div>
      </div>

      {/* Detailed Sensor Parameter Guide */}
      <div className="space-y-3">
        <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold">
          Detailed Parameter Measurements
        </h3>

        <div className="space-y-3">
          {/* pH */}
          <div className="p-4 rounded-xl border border-zinc-800 bg-black space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-white">pH (Acidity / Alkalinity)</span>
                <span className="text-[11px] text-zinc-500 block">Optimal drinking range: 6.5 – 8.5</span>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold font-mono text-white">{currentReading.ph.toFixed(2)}</span>
              </div>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              pH indicates acidity. Values between 6.5 and 8.5 ensure optimal mineral absorption without pipe corrosion.
            </p>
          </div>

          {/* TDS */}
          <div className="p-4 rounded-xl border border-zinc-800 bg-black space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-white">TDS (Total Dissolved Solids)</span>
                <span className="text-[11px] text-zinc-500 block">Optimal drinking limit: &lt; 300 ppm</span>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold font-mono text-white">{currentReading.tds} ppm</span>
              </div>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Measures essential dissolved minerals including calcium and magnesium. Readings below 500 ppm are healthy.
            </p>
          </div>

          {/* Turbidity */}
          <div className="p-4 rounded-xl border border-zinc-800 bg-black space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-white">Turbidity (Clarity & Sediment)</span>
                <span className="text-[11px] text-zinc-500 block">Target limit: &lt; 1.0 NTU</span>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold font-mono text-white">{currentReading.turbidity.toFixed(2)} NTU</span>
              </div>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Turbidity reflects water cloudiness. Low values (&lt; 1.0 NTU) guarantee sediment filtration and UV disinfection efficacy.
            </p>
          </div>

          {/* Temperature */}
          <div className="p-4 rounded-xl border border-zinc-800 bg-black space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-white">Temperature</span>
                <span className="text-[11px] text-zinc-500 block">Ambient roof tank temp</span>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold font-mono text-white">{currentReading.temperature.toFixed(1)} °C</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-2">
        <Link href="/student/complaints">
          <Button variant="outline" className="w-full text-xs font-bold py-5">
            Something Seems Off? Report To Facilities
          </Button>
        </Link>
      </div>
    </div>
  );
}
