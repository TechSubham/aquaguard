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
import { formatClockTime, timeAgo } from '@/lib/utils';
import {
  AlertTriangle,
  BrainCircuit,
  CheckCircle2,
  Radio,
  ArrowRight,
  Cpu,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { SensorMetricCardData } from '@/lib/types';

// Shared look for every card on this page
const CARD = 'rounded-[32px] border-0 bg-white shadow-none';
const PILL = 'rounded-full h-12 px-5 text-[15px] font-semibold';

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

  const latestReadingLabel = currentReading.recorded_at
    ? timeAgo(currentReading.recorded_at)
    : 'No live reading';

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
      lastUpdated: latestReadingLabel,
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
      lastUpdated: latestReadingLabel,
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
      lastUpdated: latestReadingLabel,
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
      lastUpdated: latestReadingLabel,
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
      lastUpdated: latestReadingLabel,
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
      lastUpdated: latestReadingLabel,
    },
  ];

  const recentTankAlerts = alerts
    .filter((a) => a.tankId === selectedTank.id || a.severity === 'CRITICAL')
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Greeting + actions */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <h1 className="font-display text-4xl sm:text-5xl font-medium leading-[1.05] tracking-tight text-[#0B1B22]">
            Facility water, at a glance
          </h1>
          <p className="flex flex-wrap items-center gap-2 text-sm text-[#4C5F69]">
            <span className="rounded-full bg-[#DCEBF7] px-3 py-1 text-[11px] font-semibold tracking-wider text-[#074677]">
              LIVE TELEMETRY
            </span>
            Real-time physicochemical sensor metrics, automated risk scores, and AI projections
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            onClick={() => setIsLiveUpdating(!isLiveUpdating)}
            aria-pressed={isLiveUpdating}
            className={`${PILL} gap-2 bg-white text-[#0B1B22] hover:bg-white/80`}
          >
            <Radio
              className={`h-4 w-4 ${isLiveUpdating ? 'text-[#2E9E7A] animate-pulse' : 'text-[#8A9AA3]'}`}
            />
            {isLiveUpdating ? 'Live Stream: ON' : 'Live Stream: OFF'}
          </Button>
          <Button
            onClick={() => refreshData()}
            className={`${PILL} gap-2 bg-white text-[#0B1B22] hover:bg-white/80`}
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Link href="/admin/ai-prediction">
            <Button className={`${PILL} gap-2 bg-[#0B1B22] text-white hover:bg-[#0B1B22]/90`}>
              <BrainCircuit className="h-4 w-4" />
              AI Diagnosis
            </Button>
          </Link>
        </div>
      </div>

      {/* Hostel / block / tank filter pills */}
      <TankSelector />

      {aiPrediction?.status === 'offline' ? (
        <div className="mt-8 flex flex-col items-center justify-center space-y-4 rounded-[32px] bg-[#FBE3DA] p-10 text-center">
          <AlertTriangle className="h-12 w-12 text-[#C8431C]" />
          <h2 className="font-display text-3xl font-medium tracking-tight text-[#8F2B0C]">
            Sensors are offline
          </h2>
          <p className="max-w-md text-sm text-[#4C5F69]">
            {aiPrediction.message ||
              'No telemetry data found for this tank. Please ensure the IoT hardware is powered on and connected to the MQTT broker.'}
          </p>
        </div>
      ) : (
        <>
          {/* Risk score card / alert banner (restyle RiskCard next) */}
          <RiskCard tank={selectedTank} riskScore={currentReading.risk_score} />

          {/* 6 sensor cards */}
          <section className="space-y-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-display flex items-center gap-2 text-2xl font-medium tracking-tight text-[#0B1B22]">
                <Cpu className="h-5 w-5 text-[#4C5F69]" />
                Physicochemical sensor array
              </h2>
              <span className="text-[13px] text-[#4C5F69]">
                Node: {selectedTank.code}-ESP32 • Latest DB reading: {latestReadingLabel} • UI checked{' '}
                {formatClockTime(lastRefreshTime)}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {sensorMetrics.map((metric) => (
                <SensorCard key={metric.key} metric={metric} />
              ))}
            </div>
          </section>

          {/* Water quality trends chart */}
          <WaterQualityChart data={historyReadings} defaultMetric="turbidity" />

          {/* Bottom grid: alerts + node status */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Recent alerts */}
            <Card className={`${CARD} lg:col-span-2`}>
              <CardHeader className="flex flex-row items-center justify-between gap-3 pb-3">
                <div>
                  <CardTitle className="font-display flex items-center gap-2 text-2xl font-medium text-[#0B1B22]">
                    Active alerts & anomaly feed
                  </CardTitle>
                  <CardDescription className="text-[13px] text-[#4C5F69]">
                    Triggered rule anomalies & predictive forecasting notifications
                  </CardDescription>
                </div>
                <Link href="/admin/alerts">
                  <Button className="h-10 gap-1.5 rounded-full bg-[#EEF2F4] px-4 text-[13px] font-semibold text-[#0B1B22] hover:bg-[#E1E8EB]">
                    View all <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </CardHeader>

              <CardContent className="space-y-3">
                {recentTankAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`flex flex-col justify-between gap-3 rounded-[22px] p-4 sm:flex-row sm:items-center ${
                      alert.severity === 'CRITICAL'
                        ? 'bg-[#FDF0EB]'
                        : alert.severity === 'PREDICTIVE'
                        ? 'bg-[#E8F1F9]'
                        : 'bg-[#F3F6F7]'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${
                            alert.severity === 'CRITICAL'
                              ? 'bg-[#E4572E]'
                              : alert.severity === 'PREDICTIVE'
                              ? 'bg-[#0B5FA5]'
                              : 'bg-[#F2B33D]'
                          }`}
                        />
                        <span className="text-[15px] font-semibold text-[#0B1B22]">{alert.title}</span>
                        <Badge
                          variant={alert.severity === 'CRITICAL' ? 'critical' : 'secondary'}
                          className="rounded-full text-[11px]"
                        >
                          {alert.severity}
                        </Badge>
                      </div>
                      <p className="text-[13px] leading-relaxed text-[#4C5F69]">{alert.description}</p>
                    </div>

                    <div className="flex flex-shrink-0 items-center justify-between text-right sm:flex-col sm:items-end">
                      <span className="text-[12px] text-[#4C5F69]">{alert.timestamp}</span>
                      <Link href="/admin/alerts">
                        <Button className="mt-1 h-9 rounded-full bg-white px-4 text-[13px] font-semibold text-[#0B1B22] hover:bg-white/70">
                          Investigate
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Node & tank diagnostics + AI projection accent card */}
            <div className="flex flex-col gap-6">
              <Card className={CARD}>
                <CardHeader className="pb-3">
                  <CardTitle className="font-display flex items-center gap-2 text-2xl font-medium text-[#0B1B22]">
                    Node & tank diagnostics
                  </CardTitle>
                  <CardDescription className="text-[13px] text-[#4C5F69]">
                    Sensor health, telemetry link & MQTT state
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-2.5 text-[14px]">
                  <div className="flex items-center justify-between rounded-2xl bg-[#F3F6F7] px-4 py-3">
                    <span className="text-[#4C5F69]">Sensor optical array</span>
                    <span className="flex items-center gap-1.5 font-semibold text-[#14694B]">
                      <CheckCircle2 className="h-4 w-4" /> Online
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-[#F3F6F7] px-4 py-3">
                    <span className="text-[#4C5F69]">MQTT broker bridge</span>
                    <span className="flex items-center gap-1.5 font-semibold text-[#14694B]">
                      <CheckCircle2 className="h-4 w-4" /> Connected
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-[#F3F6F7] px-4 py-3">
                    <span className="text-[#4C5F69]">Sensor calibration</span>
                    <span className="font-medium text-[#0B1B22]">ISO-17025 Valid</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-[#F3F6F7] px-4 py-3">
                    <span className="text-[#4C5F69]">Packet loss rate</span>
                    <span className="font-medium text-[#0B1B22]">0.02% (Excellent)</span>
                  </div>
                </CardContent>
              </Card>

              <Link href="/admin/ai-prediction" className="group block">
                <div className="space-y-3 rounded-[32px] bg-[#0B5FA5] p-7 text-white transition-colors group-hover:bg-[#0A5594]">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-[13px] font-semibold text-[#D6E8F7]">
                      <BrainCircuit className="h-4 w-4" />
                      AI risk projection
                    </span>
                    <ExternalLink className="h-4 w-4 text-[#D6E8F7]" />
                  </div>
                  <div className="font-display text-2xl font-medium leading-tight tracking-tight">
                    {aiPrediction.currentRiskPercent}% current risk →{' '}
                    {aiPrediction.futureProjections[aiPrediction.futureProjections.length - 1]?.riskPercent}% in +6h
                  </div>
                  <p className="line-clamp-2 text-[13px] leading-relaxed text-[#D6E8F7]">
                    {aiPrediction.predictionSummary}
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}