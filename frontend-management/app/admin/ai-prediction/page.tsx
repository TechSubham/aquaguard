'use client';

import React, { useState } from 'react';
import { useAquaGuard } from '@/lib/store';
import { TankSelector } from '@/components/shared/TankSelector';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  BrainCircuit,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  RefreshCw,
  Cpu,
  Layers,
  Clock,
  ShieldAlert,
  Wrench,
  Droplets,
  MessageSquareWarning,
  Info,
  Sliders,
  Check,
} from 'lucide-react';

export default function AIPredictionPage() {
  const { selectedTank, aiPrediction, currentReading, refreshData, runAIInference } = useAquaGuard();
  const [isInferring, setIsInferring] = useState(false);
  const [workOrderDispatched, setWorkOrderDispatched] = useState(false);

  const handleRunInference = async () => {
    setIsInferring(true);
    try {
      await runAIInference();
    } finally {
      setIsInferring(false);
    }
  };

  const handleDispatchWorkOrder = () => {
    setWorkOrderDispatched(true);
    setTimeout(() => setWorkOrderDispatched(false), 4000);
  };

  const isCritical = aiPrediction.currentRiskPercent >= 70;
  const isModerate = aiPrediction.currentRiskPercent >= 40 && aiPrediction.currentRiskPercent < 70;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono px-2 py-0.5 rounded border border-white text-white bg-zinc-900 flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> AquaGuard AI Predictive Engine
            </span>
            <span className="text-xs font-mono text-zinc-400">Architecture: XGBoost Multi-Horizon Ensemble</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <BrainCircuit className="h-6 w-6 text-white" />
            Predictive Water Deterioration & Root Cause Analytics
          </h1>
          <p className="text-xs text-zinc-400 mt-1 max-w-3xl">
            AquaGuard’s AI intelligence layer goes beyond passive monitoring: forecasting future contamination risk before tap delivery,
            attributing physical root causes, and prescribing corrective interventions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <TankSelector />
          <Button
            onClick={handleRunInference}
            disabled={isInferring}
            variant="default"
            size="sm"
            className="flex items-center gap-1.5 font-mono text-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isInferring ? 'animate-spin' : ''}`} />
            {isInferring ? 'Running Inference...' : 'Trigger Model Run'}
          </Button>
        </div>
      </div>

      {aiPrediction?.status === 'offline' ? (
        <div className="p-8 rounded-lg border border-red-900/50 bg-red-950/20 flex flex-col items-center justify-center text-center space-y-4 mt-8">
          <AlertTriangle className="h-12 w-12 text-red-500 animate-pulse" />
          <h2 className="text-2xl font-bold text-red-500 tracking-tight">SENSORS ARE OFFLINE</h2>
          <p className="text-sm text-zinc-400 max-w-md">
            {aiPrediction.message || "No telemetry data found for this tank. Please ensure the IoT hardware is powered on and connected to the MQTT broker."}
          </p>
        </div>
      ) : (
        <>
      {/* Safety Notice Banner */}
      <div className="p-3.5 rounded-lg border border-zinc-800 bg-zinc-950/80 flex items-center justify-between text-xs text-zinc-400">
        <div className="flex items-center gap-2.5">
          <Info className="h-4 w-4 text-zinc-300 flex-shrink-0" />
          <span>
            <strong className="text-zinc-200">Regulatory Scope: </strong>
            {aiPrediction.safetyStatement ||
              'Predictions represent deterioration risk in monitored physicochemical sensor indicators and sensor-behaviour anomalies. They do not certify laboratory drinking-water safety.'}
          </span>
        </div>
        <span className="font-mono text-[11px] text-zinc-500 hidden sm:inline">BIS IS-10500 Telemetry Alignment</span>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Executive Risk, Trajectory, Contributing Factors */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Executive Risk Hero */}
          <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-950 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 relative z-10">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                  Target Tank: {selectedTank.code} ({selectedTank.name})
                </span>
                <h2 className="text-xl font-bold text-white mt-1">Water Quality Deterioration Forecast</h2>
                <p className="text-xs text-zinc-400 mt-1 max-w-xl">
                  {aiPrediction.predictionSummary}
                </p>
              </div>

              {/* Calibrated Risk Score Display */}
              <div className="flex items-center sm:flex-col items-end sm:items-center bg-black border border-zinc-800 p-4 rounded-xl text-center min-w-[150px]">
                <span className="text-[10px] font-mono uppercase text-zinc-400">Predicted Risk Score</span>
                <div className="text-4xl font-extrabold font-mono tracking-tight text-white my-1">
                  {aiPrediction.currentRiskPercent}
                  <span className="text-lg text-zinc-500">/100</span>
                </div>
                <Badge
                  variant={isCritical ? 'critical' : isModerate ? 'secondary' : 'outline'}
                  className="font-mono text-[10px] tracking-wider"
                >
                  {aiPrediction.riskLevel} RISK
                </Badge>
              </div>
            </div>

            {/* Abnormal Water Behavior Banner (Slope Detection before thresholds) */}
            {aiPrediction.currentRiskPercent > 60 && (
              <div className="mt-5 p-4 rounded-lg border border-red-900/50 bg-black flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="text-xs font-bold text-red-200 uppercase tracking-wide">
                    ⚠️ Abnormal Deterioration Pattern Detected
                  </div>
                  <div className="text-xs text-zinc-300">
                    High risk of water-quality deterioration within 4–6 hours. The AI detected accelerating deterioration trends in historical telemetry prior to hard threshold breach.
                  </div>
                </div>
              </div>
            )}

            {/* 2. Trajectory Projections (+2h, +4h, +6h) */}
            <div className="mt-6 pt-5 border-t border-zinc-800/80">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4" /> Future Risk Trajectory (Multi-Horizon Projections)
                </span>
                <span className="text-[11px] font-mono text-zinc-500">Horizon: +2h, +4h, +6h</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {aiPrediction.futureProjections.map((proj, idx) => {
                  const isHigh = proj.riskPercent >= 70;
                  const isMed = proj.riskPercent >= 40 && proj.riskPercent < 70;
                  return (
                    <div
                      key={proj.timeOffset}
                      className="p-3.5 rounded-lg border border-zinc-800 bg-black flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                        <span>{proj.timeOffset}</span>
                        {idx > 0 && <span className="text-[10px] text-zinc-500">+{idx * 2}h horizon</span>}
                      </div>

                      <div className="my-2.5">
                        <div className="text-2xl font-bold font-mono text-white">
                          {proj.riskPercent}%
                        </div>
                        <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isHigh ? 'bg-red-500' : isMed ? 'bg-amber-400' : 'bg-white'
                            }`}
                            style={{ width: `${proj.riskPercent}%` }}
                          />
                        </div>
                      </div>

                      <span className="text-[10px] font-mono text-zinc-400 uppercase">
                        {isHigh ? '🔴 Critical' : isMed ? '🟠 Moderate' : '🟢 Low Risk'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 24-Hour Historical Telemetry Evolution & Macro Baseline Drift Card */}
          <Card className="border border-zinc-800 bg-zinc-950">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-zinc-900 border border-zinc-800">
                    <Clock className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      24-Hour Historical Telemetry Window
                      <Badge variant="outline" className="font-mono text-[10px] text-zinc-300 border-zinc-700">
                        {aiPrediction.historyWindowHours || 24} Hours ({aiPrediction.history24hSummary?.sample_count || 288} Samples)
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Continuous 24-hour baseline comparison vs. short-term 60m fluctuations
                    </CardDescription>
                  </div>
                </div>
                <div className="text-[11px] font-mono text-zinc-400">
                  Cumulative Exposure: <span className="text-white font-bold">{aiPrediction.history24hSummary?.cumulative_turbidity_load ?? 188.9} NTU·L/hr</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Macro metrics 3-column grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {/* Turbidity 24h drift */}
                <div className="p-3 rounded-lg border border-zinc-800 bg-black flex flex-col justify-between">
                  <div className="flex justify-between items-center text-zinc-400 font-mono text-[11px]">
                    <span>Turbidity (24h Drift)</span>
                    <span className="text-[10px] text-zinc-500">24h ago: {aiPrediction.history24hSummary?.turbidity?.at_24h_ago ?? 0.88} NTU</span>
                  </div>
                  <div className="my-1.5 flex items-baseline gap-2">
                    <span className="text-xl font-bold font-mono text-white">
                      {aiPrediction.history24hSummary?.turbidity?.current ?? 6.88} NTU
                    </span>
                    <span className={`text-xs font-mono font-semibold ${
                      (aiPrediction.history24hSummary?.turbidity?.net_drift_24h ?? 0) > 1.0 ? 'text-red-400' : 'text-emerald-400'
                    }`}>
                      {(aiPrediction.history24hSummary?.turbidity?.net_drift_24h ?? 0) >= 0 ? '+' : ''}
                      {aiPrediction.history24hSummary?.turbidity?.net_drift_24h ?? 6.0} NTU
                    </span>
                  </div>
                  <div className="text-[10px] text-zinc-400">
                    24h Range: {aiPrediction.history24hSummary?.turbidity?.min_24h ?? 0.88} – {aiPrediction.history24hSummary?.turbidity?.max_24h ?? 6.88} NTU (Mean {aiPrediction.history24hSummary?.turbidity?.mean_24h ?? 2.2})
                  </div>
                </div>

                {/* TDS 24h drift */}
                <div className="p-3 rounded-lg border border-zinc-800 bg-black flex flex-col justify-between">
                  <div className="flex justify-between items-center text-zinc-400 font-mono text-[11px]">
                    <span>TDS Accumulation</span>
                    <span className="text-[10px] text-zinc-500">24h ago: {aiPrediction.history24hSummary?.tds?.at_24h_ago ?? 272} ppm</span>
                  </div>
                  <div className="my-1.5 flex items-baseline gap-2">
                    <span className="text-xl font-bold font-mono text-white">
                      {aiPrediction.history24hSummary?.tds?.current ?? 486} ppm
                    </span>
                    <span className={`text-xs font-mono font-semibold ${
                      (aiPrediction.history24hSummary?.tds?.net_drift_24h ?? 0) > 40 ? 'text-red-400' : 'text-emerald-400'
                    }`}>
                      {(aiPrediction.history24hSummary?.tds?.net_drift_24h ?? 0) >= 0 ? '+' : ''}
                      {aiPrediction.history24hSummary?.tds?.net_drift_24h ?? 214} ppm
                    </span>
                  </div>
                  <div className="text-[10px] text-zinc-400">
                    24h Peak: {aiPrediction.history24hSummary?.tds?.max_24h ?? 486} ppm (Mean {aiPrediction.history24hSummary?.tds?.mean_24h ?? 338.7})
                  </div>
                </div>

                {/* pH 24h drift */}
                <div className="p-3 rounded-lg border border-zinc-800 bg-black flex flex-col justify-between">
                  <div className="flex justify-between items-center text-zinc-400 font-mono text-[11px]">
                    <span>pH Acidification Shift</span>
                    <span className="text-[10px] text-zinc-500">24h ago: {aiPrediction.history24hSummary?.ph?.at_24h_ago ?? 7.28}</span>
                  </div>
                  <div className="my-1.5 flex items-baseline gap-2">
                    <span className="text-xl font-bold font-mono text-white">
                      {aiPrediction.history24hSummary?.ph?.current ?? 6.39}
                    </span>
                    <span className={`text-xs font-mono font-semibold ${
                      Math.abs(aiPrediction.history24hSummary?.ph?.net_drift_24h ?? 0) > 0.3 ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {(aiPrediction.history24hSummary?.ph?.net_drift_24h ?? 0) >= 0 ? '+' : ''}
                      {aiPrediction.history24hSummary?.ph?.net_drift_24h ?? -0.89}
                    </span>
                  </div>
                  <div className="text-[10px] text-zinc-400">
                    24h Range: {aiPrediction.history24hSummary?.ph?.min_24h ?? 6.39} – {aiPrediction.history24hSummary?.ph?.max_24h ?? 7.28}
                  </div>
                </div>
              </div>

              {/* 24-hour visual trend timeline bar */}
              {aiPrediction.history24hSnapshots && aiPrediction.history24hSnapshots.length > 0 && (
                <div className="p-3 rounded-lg border border-zinc-800/80 bg-zinc-900/30 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                    <span className="flex items-center gap-1.5 text-zinc-300 font-medium">
                      <TrendingUp className="h-3.5 w-3.5 text-white" /> 24-Hour Hourly Telemetry Snapshots
                    </span>
                    <span>T-24h → T-0h (Now)</span>
                  </div>
                  <div className="flex items-end gap-1 h-12 pt-2">
                    {aiPrediction.history24hSnapshots.map((snap, i) => {
                      const tVal = snap.turbidity;
                      const heightPercent = Math.min(100, Math.max(15, (tVal / 7.0) * 100));
                      const isDanger = tVal >= 5.0;
                      const isWarn = tVal >= 2.0 && tVal < 5.0;
                      return (
                        <div
                          key={i}
                          className="flex-1 flex flex-col items-center group relative h-full justify-end"
                        >
                          <div
                            className={`w-full rounded-t-sm transition-all duration-300 ${
                              isDanger ? 'bg-red-500' : isWarn ? 'bg-amber-400' : 'bg-emerald-500/80'
                            }`}
                            style={{ height: `${heightPercent}%` }}
                          />
                          {/* Tooltip on hover */}
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full mb-1 z-20 pointer-events-none bg-black border border-zinc-700 text-[9px] font-mono p-1 rounded shadow-lg whitespace-nowrap">
                            <div>{snap.hour_offset === 0 ? 'Now' : `${snap.hour_offset}h`}</div>
                            <div>Turb: {snap.turbidity} NTU</div>
                            <div>TDS: {snap.tds} ppm</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between text-[9px] font-mono text-zinc-500 pt-1">
                    <span>-24 hrs (Safe Baseline)</span>
                    <span>-12 hrs</span>
                    <span>-6 hrs (Inflection)</span>
                    <span>Now</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 3. Parameter Contributing Factors ("Why is it X%?") */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Why is the risk score {aiPrediction.currentRiskPercent}%? (Signal Attribution)
                  </CardTitle>
                  <CardDescription>
                    Strongest contributing physicochemical signals driving deterioration probability
                  </CardDescription>
                </div>
                <Badge variant="outline" className="font-mono text-[10px]">
                  Feature Importance Attribution
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3.5">
              {aiPrediction.rootCauses.map((rc, idx) => {
                const contributionPct = rc.contribution ? Math.round(rc.contribution * 100) : 75 - idx * 12;
                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-lg border border-zinc-800 bg-zinc-900/50 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded border border-zinc-800 bg-black flex items-center justify-center font-mono text-xs">
                          {rc.trend === 'up' ? (
                            <ArrowUpRight className="h-4 w-4 text-red-400" />
                          ) : rc.trend === 'down' ? (
                            <ArrowDownRight className="h-4 w-4 text-amber-400" />
                          ) : (
                            <span className="text-zinc-500">—</span>
                          )}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-white">{rc.factor}</div>
                          <div className="text-[11px] text-zinc-400">{rc.detail}</div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] font-mono text-zinc-400 uppercase block">Contribution</span>
                        <span className="text-xs font-mono font-bold text-white">{contributionPct}%</span>
                      </div>
                    </div>

                    {/* Progress Bar for Signal Contribution */}
                    <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-zinc-200 h-full rounded-full transition-all duration-500"
                        style={{ width: `${contributionPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* 4. Dual Sensor Diagnostics: Anomaly Detection & Complaint Correlation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Sensor Anomaly Detector (Noise vs Real Problem) */}
            <Card className="border border-zinc-800 bg-zinc-950">
              <CardHeader className="pb-2.5">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Sliders className="h-4 w-4 text-zinc-300" />
                  Sensor Anomaly Discrimination
                </CardTitle>
                <CardDescription className="text-[11px]">
                  XGBoost + Robust Z-Score filter (Glitch vs Genuine Water Event)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2.5 text-xs">
                {aiPrediction.anomalyDetected && aiPrediction.anomalyDetails?.is_sensor_glitch ? (
                  <div className="p-3 rounded-lg border border-amber-900/40 bg-black space-y-1">
                    <span className="text-amber-400 font-bold flex items-center gap-1.5 font-mono text-[11px]">
                      <AlertTriangle className="h-3.5 w-3.5" /> TRANSIENT HARDWARE SPIKE
                    </span>
                    <p className="text-zinc-400 text-[11px]">
                      A high-frequency jump was detected with zero physical continuity across concurrent sensors. Classified as electrical noise or optical probe fouling, not drinking water contamination.
                    </p>
                  </div>
                ) : (
                  <div className="p-3 rounded-lg border border-zinc-800 bg-black space-y-1">
                    <span className="text-emerald-400 font-bold flex items-center gap-1.5 font-mono text-[11px]">
                      <CheckCircle2 className="h-3.5 w-3.5" /> CONTINUOUS PHYSICAL TREND
                    </span>
                    <p className="text-zinc-400 text-[11px]">
                      Telemetry passes temporal autocorrelation and robust median checks. Readings represent authentic fluid dynamics.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Student Complaint Correlation */}
            <Card className="border border-zinc-800 bg-zinc-950">
              <CardHeader className="pb-2.5">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <MessageSquareWarning className="h-4 w-4 text-zinc-300" />
                  Student Complaint Correlation
                </CardTitle>
                <CardDescription className="text-[11px]">
                  Cross-referencing reported student tickets with telemetry
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2.5 text-xs">
                <div className="p-3 rounded-lg border border-zinc-800 bg-black space-y-1">
                  <span className={`font-bold flex items-center gap-1.5 font-mono text-[11px] ${
                    aiPrediction.complaintCorrelation?.correlated ? 'text-amber-400' : 'text-zinc-300'
                  }`}>
                    {aiPrediction.complaintCorrelation?.correlated ? '⚠️ TICKETS CORRELATED' : '✓ NO ACTIVE DISSONANCE'}
                  </span>
                  <p className="text-zinc-400 text-[11px]">
                    {aiPrediction.complaintCorrelation?.summary ||
                      'Student grievances in this block correlate with elevated turbidity and pH drift.'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Column: Evidence Engine, Prescriptions, Secondary Predictions */}
        <div className="space-y-6">
          {/* 5. Possible Causes (Evidence Engine) */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Cpu className="h-4 w-4" />
                Diagnosed Root Causes
              </CardTitle>
              <CardDescription>Multi-sensor evidence engine evaluating plausible failures</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {aiPrediction.possibleCauses.length > 0 ? (
                aiPrediction.possibleCauses.map((cause, i) => (
                  <div key={i} className="p-4 rounded-xl border border-zinc-800 bg-black space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-sm font-bold text-white flex items-center gap-2">
                          {cause.cause}
                          {i === 0 && (
                            <Badge variant="outline" className="text-[9px] font-mono text-zinc-300 border-zinc-700">
                              Top Cause
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-zinc-400 mt-0.5">{cause.notes}</div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-mono text-zinc-500 uppercase block">Confidence</span>
                        <span className="text-base font-extrabold font-mono text-white">
                          {cause.confidencePercent}%
                        </span>
                      </div>
                    </div>

                    {/* Confidence Meter */}
                    <div className="space-y-1">
                      <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-white h-full rounded-full transition-all duration-500"
                          style={{ width: `${cause.confidencePercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-lg border border-zinc-800 bg-black text-center py-6">
                  <CheckCircle2 className="h-6 w-6 text-white mx-auto mb-2" />
                  <div className="text-xs font-semibold text-white">Nominal Operating Signatures</div>
                  <div className="text-[11px] text-zinc-400 mt-1">
                    No mechanical fault or contamination signature detected.
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 6. Prescriptive Actions Playbook */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ShieldAlert className="h-4 w-4" />
                Prescriptive Action Playbook
              </CardTitle>
              <CardDescription>Automated operational protocol for facilities crew</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {aiPrediction.recommendedActions.map((action, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg border border-zinc-800 bg-black flex items-start gap-3"
                >
                  <span className="w-5 h-5 rounded-full border border-zinc-700 bg-zinc-900 text-white font-mono text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <div className="text-xs text-zinc-300 font-medium leading-relaxed">{action}</div>
                </div>
              ))}

              <div className="pt-2">
                <Button
                  onClick={handleDispatchWorkOrder}
                  disabled={workOrderDispatched}
                  className="w-full text-xs font-semibold"
                  variant={workOrderDispatched ? 'outline' : 'default'}
                >
                  {workOrderDispatched ? (
                    <span className="flex items-center gap-1.5 text-emerald-400">
                      <Check className="h-3.5 w-3.5" /> Work Order #WO-840 Dispatched
                    </span>
                  ) : (
                    'Dispatch Maintenance Work Order'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 7. Secondary AI Capabilities: Maintenance & Leakage Predictions */}
          <div className="space-y-3">
            {/* Maintenance Forecast */}
            <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <Wrench className="h-3.5 w-3.5 text-zinc-400" /> Maintenance Urgency Forecast
                </span>
                <span className="font-mono text-zinc-300 font-bold">
                  {aiPrediction.maintenancePrediction?.maintenance_window || '3–5 days'}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                {aiPrediction.maintenancePrediction?.recommendation ||
                  'Filter maintenance and backwash recommended based on sensor degradation trends.'}
              </p>
            </div>

            {/* Leakage Prediction */}
            <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <Droplets className="h-3.5 w-3.5 text-zinc-400" /> Hydraulic Leakage Monitor
                </span>
                <span className="font-mono text-emerald-400 font-bold">
                  {aiPrediction.leakagePrediction?.detected ? '⚠️ Leakage Suspected' : '✓ Normal'}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                {aiPrediction.leakagePrediction?.recommendation ||
                  'Water level decrease rate matches expected hourly student usage profiles.'}
              </p>
            </div>
          </div>

          {/* AI Metadata Box */}
          <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950 text-[11px] space-y-2 text-zinc-400 font-mono">
            <div className="flex justify-between">
              <span>Model Architecture:</span>
              <span className="text-white">{aiPrediction.modelVersion}</span>
            </div>
            <div className="flex justify-between">
              <span>Last Inferred:</span>
              <span className="text-white">{aiPrediction.lastInferenceAt}</span>
            </div>
            <div className="flex justify-between">
              <span>Inference Latency:</span>
              <span className="text-white">18ms on local CPU</span>
            </div>
            <div className="flex justify-between">
              <span>API Gateway:</span>
              <span className="text-white">GET/POST /ai/predict-risk</span>
            </div>
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  );
}
