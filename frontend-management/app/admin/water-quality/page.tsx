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
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <Activity className="h-5 w-5 text-white" />
              <span>Deep Water Quality Analytics & Sensor Monitoring</span>
            </h1>
            <p className="text-xs text-zinc-400 font-mono mt-0.5">
              Live multi-parameter sensor readings and dedicated individual time-series histories
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-zinc-400">Current Status:</span>
            {isCritical ? (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold border border-red-500 bg-red-950/60 text-red-200 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
                🔴 High Risk ({currentReading.risk_score}/100)
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full text-xs font-medium border border-zinc-700 bg-zinc-900 text-zinc-200 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                🟢 Normal ({currentReading.risk_score}/100)
              </span>
            )}
          </div>
        </div>

        <TankSelector />
      </div>

      {/* Snapshot Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="p-3.5">
          <div className="text-[10px] font-mono uppercase text-zinc-500">pH Level</div>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            {formatNumber(currentReading.ph, 2)}
          </div>
          <div className="text-[10px] font-mono text-zinc-400 mt-1">Limit: 6.5–8.5</div>
        </Card>

        <Card className="p-3.5">
          <div className="text-[10px] font-mono uppercase text-zinc-500">TDS</div>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            {Math.round(currentReading.tds)} <span className="text-xs font-normal text-zinc-400">ppm</span>
          </div>
          <div className="text-[10px] font-mono text-zinc-400 mt-1">Limit: &lt; 500</div>
        </Card>

        <Card className="p-3.5">
          <div className="text-[10px] font-mono uppercase text-zinc-500">Turbidity</div>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            {formatNumber(currentReading.turbidity, 2)} <span className="text-xs font-normal text-zinc-400">NTU</span>
          </div>
          <div className="text-[10px] font-mono text-red-400 font-bold mt-1">Limit: &lt; 5.0</div>
        </Card>

        <Card className="p-3.5">
          <div className="text-[10px] font-mono uppercase text-zinc-500">Temperature</div>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            {formatNumber(currentReading.temperature, 1)} <span className="text-xs font-normal text-zinc-400">°C</span>
          </div>
          <div className="text-[10px] font-mono text-zinc-400 mt-1">Range: 18–28°C</div>
        </Card>

        <Card className="p-3.5">
          <div className="text-[10px] font-mono uppercase text-zinc-500">Water Level</div>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            {formatNumber(currentReading.water_level, 1)} <span className="text-xs font-normal text-zinc-400">%</span>
          </div>
          <div className="text-[10px] font-mono text-zinc-400 mt-1">Capacity: 10,000L</div>
        </Card>

        <Card className="p-3.5">
          <div className="text-[10px] font-mono uppercase text-zinc-500">Flow Rate</div>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            {formatNumber(currentReading.flow_rate, 1)} <span className="text-xs font-normal text-zinc-400">L/m</span>
          </div>
          <div className="text-[10px] font-mono text-zinc-400 mt-1">Inlet active</div>
        </Card>
      </div>

      {/* Individual Parameter History Charts */}
      <div className="space-y-6">
        <WaterQualityChart
          data={historyReadings}
          title="Turbidity Sensor History (Optical Backscatter)"
          defaultMetric="turbidity"
        />

        <WaterQualityChart
          data={historyReadings}
          title="Total Dissolved Solids (TDS) History (Conductivity Cell)"
          defaultMetric="tds"
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <WaterQualityChart
            data={historyReadings}
            title="pH History (Electrochemical Probe)"
            defaultMetric="ph"
          />
          <WaterQualityChart
            data={historyReadings}
            title="Temperature History (PT100 RTD Probe)"
            defaultMetric="temperature"
          />
        </div>
      </div>
    </div>
  );
}
