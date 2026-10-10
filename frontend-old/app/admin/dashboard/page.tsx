'use client';

import React from 'react';
import Link from 'next/link';
import { useAquaGuard } from '@/lib/store';
import { TankSelector } from '@/components/shared/TankSelector';
import { RiskCard } from '@/components/shared/RiskCard';
import { SensorCard } from '@/components/shared/SensorCard';
import { WaterQualityChart } from '@/components/shared/WaterQualityChart';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertTriangle,
  BrainCircuit,
  CheckCircle2,
  Radio,
  ArrowRight,
  TrendingUp,
  Cpu,
  RefreshCw,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { SensorMetricCardData } from '@/lib/types';

export default function AdminDashboardPage() {
  const {
    selectedTank,
    currentReading,
    historyReadings,
    alerts,
    aiPrediction,
    isLiveUpdating,
    setIsLiveUpdating,
    refreshData,
    lastRefreshTime,
  } = useAquaGuard();

  const sensorMetrics: SensorMetricCardData[] = [
    {
      key: 'ph',
      label: 'pH Level',
      value: currentReading.ph,
      unit: 'pH',
      previousValue: 6.95,
      changePercent: -8.1,
      trend: currentReading.ph < 6.5 ? 'DOWN' : 'STABLE',
      status: currentReading.ph < 6.5 || currentReading.ph > 8.5 ? 'WARNING' : 'NORMAL',
      optimalRange: '6.5 – 8.5',
      lastUpdated: 'Just now',
    },
    {
      key: 'tds',
      label: 'TDS (Dissolved Solids)',
      value: currentReading.tds,
      unit: 'ppm',
      previousValue: 410,
      changePercent: 18.5,
      trend: currentReading.tds > 400 ? 'UP' : 'STABLE',
      status: currentReading.tds > 500 ? 'CRITICAL' : currentReading.tds > 300 ? 'WARNING' : 'NORMAL',
      optimalRange: '< 300 ppm (Max 500)',
      lastUpdated: 'Just now',
    },
    {
      key: 'turbidity',
      label: 'Turbidity',
      value: currentReading.turbidity,
      unit: 'NTU',
      previousValue: 5.81,
      changePercent: 18.4,
      trend: currentReading.turbidity > 2.0 ? 'UP' : 'STABLE',
      status: currentReading.turbidity > 5.0 ? 'CRITICAL' : currentReading.turbidity > 1.5 ? 'WARNING' : 'NORMAL',
      optimalRange: '< 1.0 NTU (Safe < 5.0)',
      lastUpdated: 'Just now',
    },
    {
      key: 'temperature',
      label: 'Water Temperature',
      value: currentReading.temperature,
      unit: '°C',
      previousValue: 25.8,
      changePercent: 1.9,
      trend: 'UP',
      status: currentReading.temperature > 30 ? 'WARNING' : 'NORMAL',
      optimalRange: '18 – 28 °C',
      lastUpdated: 'Just now',
    },
    {
      key: 'water_level',
      label: 'Water Level',
      value: currentReading.water_level,
      unit: '%',
      previousValue: 82.0,
      changePercent: -2.5,
      trend: 'DOWN',
      status: currentReading.water_level < 20 ? 'CRITICAL' : 'NORMAL',
      optimalRange: '30 – 100 %',
      lastUpdated: 'Just now',
    },
    {
      key: 'flow_rate',
      label: 'Inlet Flow Rate',
      value: currentReading.flow_rate,
      unit: 'L/min',
      previousValue: 3.4,
      changePercent: 2.9,
      trend: 'STABLE',
      status: 'NORMAL',
      optimalRange: '2.0 – 6.0 L/min',
      lastUpdated: 'Just now',
    },
  ];

  const recentTankAlerts = alerts
    .filter((a) => a.tankId === selectedTank.id || a.severity === 'CRITICAL')
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Top Controls & Tank Selector */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>Facility Water Intelligence Dashboard</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-zinc-700 bg-zinc-900 text-zinc-300">
                LIVE TELEMETRY
              </span>
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Real-time physicochemical sensor metrics, automated risk scores, and AI projections
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={isLiveUpdating ? 'default' : 'outline'}
              size="sm"
              onClick={() => setIsLiveUpdating(!isLiveUpdating)}
              className="text-xs gap-1.5 font-mono"
            >
              <Radio className={`h-3 w-3 ${isLiveUpdating ? 'text-black animate-pulse' : 'text-zinc-400'}`} />
              {isLiveUpdating ? 'Live Stream: ON' : 'Live Stream: OFF'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refreshData()}
              className="text-xs gap-1.5"
            >
              <RefreshCw className="h-3 w-3" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Tank Selector bar */}
        <TankSelector />
      </div>

      {/* ⭐ Risk Score Card / Alert Banner */}
      <RiskCard tank={selectedTank} riskScore={currentReading.risk_score} />

      {/* ⭐ 6 Sensor Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold flex items-center gap-1.5">
            <Cpu className="h-3.5 w-3.5" />
            Physicochemical Sensor Array Readings
          </span>
          <span className="text-[11px] font-mono text-zinc-500">
            Node: {selectedTank.code}-ESP32
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {sensorMetrics.map((metric) => (
            <SensorCard key={metric.key} metric={metric} />
          ))}
        </div>
      </div>

      {/* ⭐ Water Quality Trends Chart */}
      <WaterQualityChart data={historyReadings} defaultMetric="turbidity" />

      {/* Bottom Dual Grid: Recent Alerts & System Node Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Recent Alerts */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-zinc-300" />
                Active Alerts & Anomaly Feed
              </CardTitle>
              <CardDescription>
                Triggered rule anomalies & predictive forecasting notifications
              </CardDescription>
            </div>
            <Link href="/admin/alerts">
              <Button variant="ghost" size="sm" className="text-xs gap-1">
                View All Alerts <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>

          <CardContent className="space-y-3">
            {recentTankAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-3.5 rounded-lg border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  alert.severity === 'CRITICAL'
                    ? 'border-red-900/40 bg-zinc-950/80'
                    : alert.severity === 'PREDICTIVE'
                    ? 'border-zinc-700 bg-zinc-900/30'
                    : 'border-zinc-800 bg-zinc-950/50'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        alert.severity === 'CRITICAL'
                          ? 'bg-red-500 animate-ping'
                          : alert.severity === 'PREDICTIVE'
                          ? 'bg-zinc-100'
                          : 'bg-amber-400'
                      }`}
                    />
                    <span className="font-semibold text-white">{alert.title}</span>
                    <Badge variant={alert.severity === 'CRITICAL' ? 'critical' : 'secondary'} className="text-[10px]">
                      {alert.severity}
                    </Badge>
                  </div>
                  <p className="text-zinc-400 text-[11px] leading-relaxed">{alert.description}</p>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between text-right flex-shrink-0">
                  <span className="text-[10px] font-mono text-zinc-500">{alert.timestamp}</span>
                  <Link href="/admin/alerts">
                    <Button variant="outline" size="sm" className="text-[11px] h-7 px-2.5 mt-1">
                      Investigate
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Right: Tank & Node Diagnostics */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Radio className="h-4 w-4 text-zinc-300" />
              Node & Tank Diagnostics
            </CardTitle>
            <CardDescription>Sensor health, telemetry link & MQTT state</CardDescription>
          </CardHeader>

          <CardContent className="space-y-3 font-mono text-xs">
            <div className="p-2.5 rounded-lg border border-zinc-800/80 bg-zinc-900/30 flex items-center justify-between">
              <span className="text-zinc-400">Sensor Optical Array</span>
              <span className="text-emerald-400 flex items-center gap-1 font-bold">
                <CheckCircle2 className="h-3.5 w-3.5" /> ONLINE
              </span>
            </div>

            <div className="p-2.5 rounded-lg border border-zinc-800/80 bg-zinc-900/30 flex items-center justify-between">
              <span className="text-zinc-400">MQTT Broker Bridge</span>
              <span className="text-emerald-400 flex items-center gap-1 font-bold">
                <CheckCircle2 className="h-3.5 w-3.5" /> CONNECTED
              </span>
            </div>

            <div className="p-2.5 rounded-lg border border-zinc-800/80 bg-zinc-900/30 flex items-center justify-between">
              <span className="text-zinc-400">Sensor Calibration</span>
              <span className="text-zinc-200">ISO-17025 Valid</span>
            </div>

            <div className="p-2.5 rounded-lg border border-zinc-800/80 bg-zinc-900/30 flex items-center justify-between">
              <span className="text-zinc-400">Packet Loss Rate</span>
              <span className="text-zinc-200">0.02% (Excellent)</span>
            </div>

            <div className="pt-2">
              <Link href="/admin/ai-prediction">
                <div className="p-3 rounded-xl border border-zinc-700 bg-zinc-900/60 hover:bg-zinc-900 transition-colors cursor-pointer group">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                      <BrainCircuit className="h-3 w-3 text-white" />
                      AI Risk Projection
                    </span>
                    <ExternalLink className="h-3 w-3 text-zinc-500 group-hover:text-white transition-colors" />
                  </div>
                  <div className="text-sm font-bold text-white mt-1">
                    {aiPrediction.currentRiskPercent}% Current Risk → {aiPrediction.futureProjections[aiPrediction.futureProjections.length - 1]?.riskPercent}% in +6h
                  </div>
                  <p className="text-[10px] text-zinc-400 font-sans mt-0.5 line-clamp-1">
                    {aiPrediction.predictionSummary}
                  </p>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
