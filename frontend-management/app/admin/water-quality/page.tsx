'use client';

import React from 'react';
import { useAquaGuard } from '@/lib/store';
import { TankSelector } from '@/components/shared/TankSelector';
import { WaterQualityChart } from '@/components/shared/WaterQualityChart';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatNumber } from '@/lib/utils';
import { Activity, Droplet, Thermometer, Gauge, Waves } from 'lucide-react';

export default function WaterQualityPage() {
  const { selectedTank, currentReading, historyReadings } = useAquaGuard();

  const isCritical = currentReading.risk_score >= 70;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <Activity className="h-6 w-6 text-[#0284C7]" />
              <span>Deep Water Quality Analytics & Sensor Monitoring</span>
            </h1>
            {/* <p className="text-xs text-slate-500 font-mono mt-0.5">
              Live multi-parameter sensor readings and dedicated individual time-series histories
            </p> */}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-500">Current Status:</span>
            {isCritical ? (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold border border-red-300 bg-red-100 text-red-800 flex items-center gap-1.5 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
                🔴 High Risk ({currentReading.risk_score}/100)
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold border border-emerald-300 bg-emerald-100 text-emerald-800 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                🟢 Normal ({currentReading.risk_score}/100)
              </span>
            )}
          </div>
        </div>

        <TankSelector />
      </div>

      {/* Snapshot Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="p-3.5 bg-white border border-slate-200 shadow-sm">
          <div className="text-[10px] font-mono uppercase text-slate-500 font-semibold">pH Level</div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
            {formatNumber(currentReading.ph, 2)}
          </div>
          <div className="text-[10px] font-mono text-slate-500 mt-1">Limit: 6.5–8.5</div>
        </Card>

        <Card className="p-3.5 bg-white border border-slate-200 shadow-sm">
          <div className="text-[10px] font-mono uppercase text-slate-500 font-semibold">TDS</div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
            {Math.round(currentReading.tds)} <span className="text-xs font-normal text-slate-500">ppm</span>
          </div>
          <div className="text-[10px] font-mono text-slate-500 mt-1">Limit: &lt; 500</div>
        </Card>

        <Card className="p-3.5 bg-white border border-slate-200 shadow-sm">
          <div className="text-[10px] font-mono uppercase text-slate-500 font-semibold">Turbidity</div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
            {formatNumber(currentReading.turbidity, 2)} <span className="text-xs font-normal text-slate-500">NTU</span>
          </div>
          <div className="text-[10px] font-mono text-red-600 font-bold mt-1">Limit: &lt; 5.0</div>
        </Card>

        <Card className="p-3.5 bg-white border border-slate-200 shadow-sm">
          <div className="text-[10px] font-mono uppercase text-slate-500 font-semibold">Temperature</div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
            {formatNumber(currentReading.temperature, 1)} <span className="text-xs font-normal text-slate-500">°C</span>
          </div>
          <div className="text-[10px] font-mono text-slate-500 mt-1">Range: 18–28°C</div>
        </Card>

        <Card className="p-3.5 bg-white border border-slate-200 shadow-sm">
          <div className="text-[10px] font-mono uppercase text-slate-500 font-semibold">Water Level</div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
            {formatNumber(currentReading.water_level, 1)} <span className="text-xs font-normal text-slate-500">%</span>
          </div>
          <div className="text-[10px] font-mono text-slate-500 mt-1">Capacity: 10,000L</div>
        </Card>

        <Card className="p-3.5 bg-white border border-slate-200 shadow-sm">
          <div className="text-[10px] font-mono uppercase text-slate-500 font-semibold">Flow Rate</div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
            {formatNumber(currentReading.flow_rate, 1)} <span className="text-xs font-normal text-slate-500">L/m</span>
          </div>
          <div className="text-[10px] font-mono text-slate-500 mt-1">Inlet active</div>
        </Card>
      </div>

      {/* Single Interactive Parameter History Chart (Easily switchable via selector) */}
      <div>
        <WaterQualityChart data={historyReadings} />
      </div>
    </div>
  );
}
