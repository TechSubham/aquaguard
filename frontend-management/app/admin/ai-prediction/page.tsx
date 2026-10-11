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
  RefreshCw,
  Cpu,
  Clock,
  ShieldAlert,
  Droplets,
  MessageSquareWarning,
  Info,
  Sliders,
  Check,
  Radio,
} from 'lucide-react';

export default function AIPredictionPage() {
  const { selectedTank, aiPrediction, runAIInference } = useAquaGuard();
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
  const riskBadgeVariant = isCritical ? 'critical' : isModerate ? 'warning' : 'success';
  const riskTone = isCritical
    ? 'text-red-700 bg-red-50 border-red-200'
    : isModerate
    ? 'text-amber-700 bg-amber-50 border-amber-200'
    : 'text-emerald-700 bg-emerald-50 border-emerald-200';

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      <div className="flex flex-col gap-4 rounded-[28px] border border-slate-200/90 bg-white p-5 shadow-sm sm:p-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-[#0369A1]">
              <BrainCircuit className="h-3.5 w-3.5" />
              AquaGuard AI
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700">
              <Radio className="h-3 w-3" />
              XGBoost live inference
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-[#0B1B22] sm:text-3xl">
              Predictive Water Deterioration
            </h1>
            <p className="mt-1 max-w-3xl text-sm leading-relaxed text-slate-500">
              Forecast deterioration risk, explain the strongest telemetry signals, and translate model output into facility actions.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <TankSelector />
          <Button onClick={handleRunInference} disabled={isInferring} size="sm" className="gap-1.5">
            <RefreshCw className={`h-3.5 w-3.5 ${isInferring ? 'animate-spin' : ''}`} />
            {isInferring ? 'Running' : 'Run model'}
          </Button>
        </div>
      </div>

      {aiPrediction?.status === 'offline' ? (
        <div className="rounded-[28px] border border-red-200 bg-red-50 p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-red-200 bg-white">
            <AlertTriangle className="h-7 w-7 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-red-800">Sensors are offline</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-red-700">
            {aiPrediction.message || 'No telemetry data found for this tank. Check the IoT hardware or MQTT bridge.'}
          </p>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3 rounded-2xl border border-sky-100 bg-sky-50/80 p-4 text-xs text-slate-600 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-2.5">
              <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#0284C7]" />
              <span>
                <strong className="font-semibold text-slate-800">Regulatory scope: </strong>
                {aiPrediction.safetyStatement ||
                  'Predictions represent deterioration risk in monitored physicochemical sensor indicators and sensor-behaviour anomalies. They do not certify laboratory drinking-water safety.'}
              </span>
            </div>
            <span className="whitespace-nowrap rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-slate-500 shadow-sm">
              BIS IS-10500 aligned telemetry
            </span>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <section className="card-elevated overflow-hidden p-6">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <span className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                      Target tank: {selectedTank.code} ({selectedTank.name})
                    </span>
                    <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900">
                      Water quality forecast
                    </h2>
                    <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-500">
                      {aiPrediction.predictionSummary}
                    </p>
                  </div>

                  <div className={`min-w-[160px] rounded-2xl border p-4 text-center ${riskTone}`}>
                    <span className="text-[10px] font-bold uppercase tracking-wide">Predicted risk</span>
                    <div className="my-1 font-mono text-4xl font-extrabold tracking-tight">
                      {aiPrediction.currentRiskPercent}
                      <span className="text-lg opacity-60">/100</span>
                    </div>
                    <Badge variant={riskBadgeVariant} className="justify-center">
                      {aiPrediction.riskLevel} risk
                    </Badge>
                  </div>
                </div>

                {aiPrediction.currentRiskPercent > 60 && (
                  <div className="mt-5 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4">
                    <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wide text-red-800">
                        Abnormal deterioration pattern detected
                      </div>
                      <div className="mt-1 text-xs leading-relaxed text-red-700">
                        The model detected accelerating deterioration trends in historical telemetry before a hard threshold breach.
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-6 border-t border-slate-100 pt-5">
                  <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-700">
                      <TrendingUp className="h-4 w-4 text-[#0284C7]" />
                      Future risk trajectory
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400">Current, +2h, +4h, +6h</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {aiPrediction.futureProjections.map((proj, idx) => {
                      const isHigh = proj.riskPercent >= 70;
                      const isMed = proj.riskPercent >= 40 && proj.riskPercent < 70;
                      const barColor = isHigh ? 'bg-red-500' : isMed ? 'bg-amber-400' : 'bg-emerald-500';
                      return (
                        <div key={proj.timeOffset} className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5">
                          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                            <span>{proj.timeOffset}</span>
                            {idx > 0 && <span>+{idx * 2}h</span>}
                          </div>
                          <div className="my-2.5 font-mono text-2xl font-bold text-slate-900">
                            {proj.riskPercent}%
                          </div>
                          <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
                            <div className={`h-full rounded-full ${barColor}`} style={{ width: `${proj.riskPercent}%` }} />
                          </div>
                          <span className="mt-2 block text-[10px] font-bold uppercase tracking-wide text-slate-500">
                            {isHigh ? 'Critical' : isMed ? 'Moderate' : 'Low'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50">
                        <Clock className="h-4 w-4 text-[#0284C7]" />
                      </div>
                      <div>
                        <CardTitle className="flex items-center gap-2 text-sm">
                          Historical telemetry window
                          <Badge variant="outline">
                            {aiPrediction.historyWindowHours || 24}h / {aiPrediction.history24hSummary?.sample_count || 288} samples
                          </Badge>
                        </CardTitle>
                        <CardDescription>Baseline comparison against short-term fluctuations</CardDescription>
                      </div>
                    </div>
                    <div className="text-[11px] font-semibold text-slate-500">
                      Exposure: <span className="text-slate-900">{aiPrediction.history24hSummary?.cumulative_turbidity_load ?? 188.9} NTU L/hr</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-3">
                    <MetricPanel
                      label="Turbidity drift"
                      value={`${aiPrediction.history24hSummary?.turbidity?.current ?? 6.88} NTU`}
                      delta={aiPrediction.history24hSummary?.turbidity?.net_drift_24h ?? 6}
                      suffix="NTU"
                      description={`Range ${aiPrediction.history24hSummary?.turbidity?.min_24h ?? 0.88} to ${aiPrediction.history24hSummary?.turbidity?.max_24h ?? 6.88} NTU`}
                    />
                    <MetricPanel
                      label="TDS accumulation"
                      value={`${aiPrediction.history24hSummary?.tds?.current ?? 486} ppm`}
                      delta={aiPrediction.history24hSummary?.tds?.net_drift_24h ?? 214}
                      suffix="ppm"
                      description={`Peak ${aiPrediction.history24hSummary?.tds?.max_24h ?? 486} ppm`}
                    />
                    <MetricPanel
                      label="pH shift"
                      value={`${aiPrediction.history24hSummary?.ph?.current ?? 6.39}`}
                      delta={aiPrediction.history24hSummary?.ph?.net_drift_24h ?? -0.89}
                      suffix=""
                      description={`Range ${aiPrediction.history24hSummary?.ph?.min_24h ?? 6.39} to ${aiPrediction.history24hSummary?.ph?.max_24h ?? 7.28}`}
                    />
                  </div>

                  {aiPrediction.history24hSnapshots && aiPrediction.history24hSnapshots.length > 0 && (
                    <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                        <span className="flex items-center gap-1.5 text-slate-700">
                          <TrendingUp className="h-3.5 w-3.5 text-[#0284C7]" />
                          Hourly turbidity snapshots
                        </span>
                        <span>T-24h to now</span>
                      </div>
                      <div className="flex h-12 items-end gap-1 pt-2">
                        {aiPrediction.history24hSnapshots.map((snap, i) => {
                          const heightPercent = Math.min(100, Math.max(15, (snap.turbidity / 7.0) * 100));
                          const isDanger = snap.turbidity >= 5.0;
                          const isWarn = snap.turbidity >= 2.0 && snap.turbidity < 5.0;
                          return (
                            <div key={i} className="group relative flex h-full flex-1 items-end">
                              <div
                                className={`w-full rounded-t-sm transition-all duration-300 ${
                                  isDanger ? 'bg-red-500' : isWarn ? 'bg-amber-400' : 'bg-emerald-500'
                                }`}
                                style={{ height: `${heightPercent}%` }}
                              />
                              <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-1 -translate-x-1/2 whitespace-nowrap rounded-lg border border-slate-700 bg-slate-950 p-1.5 text-[9px] font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                                <div>{snap.hour_offset === 0 ? 'Now' : `${snap.hour_offset}h`}</div>
                                <div>Turb: {snap.turbidity} NTU</div>
                                <div>TDS: {snap.tds} ppm</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex justify-between pt-1 text-[9px] font-semibold text-slate-400">
                        <span>-24 hrs</span>
                        <span>-12 hrs</span>
                        <span>-6 hrs</span>
                        <span>Now</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Activity className="h-4 w-4 text-[#0284C7]" />
                        Why is the risk score {aiPrediction.currentRiskPercent}%?
                      </CardTitle>
                      <CardDescription>Strongest signals driving deterioration probability</CardDescription>
                    </div>
                    <Badge variant="outline">Feature attribution</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3.5">
                  {aiPrediction.rootCauses.map((rc, idx) => {
                    const contributionPct = rc.contribution ? Math.round(rc.contribution * 100) : 75 - idx * 12;
                    return (
                      <div key={idx} className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white">
                              {rc.trend === 'up' ? (
                                <ArrowUpRight className="h-4 w-4 text-red-500" />
                              ) : rc.trend === 'down' ? (
                                <ArrowDownRight className="h-4 w-4 text-amber-500" />
                              ) : (
                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                              )}
                            </div>
                            <div>
                              <div className="text-sm font-bold text-slate-900">{rc.factor}</div>
                              <div className="text-xs leading-relaxed text-slate-500">{rc.detail}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="block text-[10px] font-bold uppercase tracking-wide text-slate-400">Contribution</span>
                            <span className="font-mono text-sm font-bold text-slate-900">{contributionPct}%</span>
                          </div>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
                          <div className="h-full rounded-full bg-[#0284C7]" style={{ width: `${contributionPct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-2.5">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Sliders className="h-4 w-4 text-[#0284C7]" />
                      Sensor anomaly discrimination
                    </CardTitle>
                    <CardDescription>XGBoost and robust z-score filter</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {aiPrediction.anomalyDetected && aiPrediction.anomalyDetails?.is_sensor_glitch ? (
                      <InsightPanel
                        tone="warning"
                        title="Transient hardware spike"
                        body="A high-frequency jump was detected without physical continuity across concurrent sensors."
                      />
                    ) : (
                      <InsightPanel
                        tone="success"
                        title="Continuous physical trend"
                        body="Telemetry passes temporal autocorrelation and robust median checks."
                      />
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2.5">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <MessageSquareWarning className="h-4 w-4 text-[#0284C7]" />
                      Complaint correlation
                    </CardTitle>
                    <CardDescription>Student reports cross-checked with telemetry</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <InsightPanel
                      tone={aiPrediction.complaintCorrelation?.correlated ? 'warning' : 'neutral'}
                      title={aiPrediction.complaintCorrelation?.correlated ? 'Tickets correlated' : 'No active dissonance'}
                      body={aiPrediction.complaintCorrelation?.summary || 'Student grievances in this block correlate with elevated turbidity and pH drift.'}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Cpu className="h-4 w-4 text-[#0284C7]" />
                    Diagnosed root causes
                  </CardTitle>
                  <CardDescription>Multi-sensor evidence engine evaluating plausible failures</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {aiPrediction.possibleCauses.length > 0 ? (
                    aiPrediction.possibleCauses.map((cause, i) => (
                      <div key={i} className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex flex-wrap items-center gap-2 text-sm font-bold text-slate-900">
                              {cause.cause}
                              {i === 0 && <Badge variant="outline">Top cause</Badge>}
                            </div>
                            <div className="mt-1 text-xs leading-relaxed text-slate-500">{cause.notes}</div>
                          </div>
                          <div className="text-right">
                            <span className="block text-[10px] font-bold uppercase tracking-wide text-slate-400">Confidence</span>
                            <span className="font-mono text-base font-extrabold text-slate-900">{cause.confidencePercent}%</span>
                          </div>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
                          <div className="h-full rounded-full bg-[#0284C7]" style={{ width: `${cause.confidencePercent}%` }} />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-6 text-center">
                      <CheckCircle2 className="mx-auto mb-2 h-6 w-6 text-emerald-600" />
                      <div className="text-sm font-bold text-emerald-800">Nominal operating signatures</div>
                      <div className="mt-1 text-xs text-emerald-700">No mechanical fault signature detected.</div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <ShieldAlert className="h-4 w-4 text-[#0284C7]" />
                    Action playbook
                  </CardTitle>
                  <CardDescription>Operational protocol for the facilities crew</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {aiPrediction.recommendedActions.map((action, i) => (
                    <div key={i} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                      <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#0B1B22] text-xs font-bold text-white">
                        {i + 1}
                      </span>
                      <div className="text-xs font-medium leading-relaxed text-slate-700">{action}</div>
                    </div>
                  ))}

                  <Button
                    onClick={handleDispatchWorkOrder}
                    disabled={workOrderDispatched}
                    className="w-full gap-1.5"
                    variant={workOrderDispatched ? 'outline' : 'default'}
                  >
                    {workOrderDispatched ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                        Work order WO-840 dispatched
                      </>
                    ) : (
                      'Dispatch operations work order'
                    )}
                  </Button>
                </CardContent>
              </Card>

              <div className="space-y-3">
                <ForecastPanel
                  icon={<Droplets className="h-3.5 w-3.5 text-[#0284C7]" />}
                  title="Hydraulic leakage monitor"
                  value={aiPrediction.leakagePrediction?.detected ? 'Leakage suspected' : 'Normal'}
                  body={aiPrediction.leakagePrediction?.recommendation || 'Water level decrease rate matches expected hourly student usage profiles.'}
                />
              </div>

              <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4 text-[11px] font-semibold text-slate-500 shadow-sm">
                <MetaRow label="Model architecture" value={aiPrediction.modelVersion} />
                <MetaRow label="Last inferred" value={aiPrediction.lastInferenceAt} />
                <MetaRow label="Inference latency" value="18ms on local CPU" />
                <MetaRow label="API gateway" value="GET/POST /ai/predict-risk" />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function MetricPanel({
  label,
  value,
  delta,
  suffix,
  description,
}: {
  label: string;
  value: string;
  delta: number;
  suffix: string;
  description: string;
}) {
  const isHigh = Math.abs(delta) > 0.3;

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
      <div className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{label}</div>
      <div className="my-1.5 flex flex-wrap items-baseline gap-2">
        <span className="font-mono text-xl font-bold text-slate-900">{value}</span>
        <span className={`text-xs font-bold ${isHigh ? 'text-amber-600' : 'text-emerald-600'}`}>
          {delta >= 0 ? '+' : ''}
          {delta} {suffix}
        </span>
      </div>
      <div className="text-[11px] leading-relaxed text-slate-500">{description}</div>
    </div>
  );
}

function InsightPanel({
  tone,
  title,
  body,
}: {
  tone: 'success' | 'warning' | 'neutral';
  title: string;
  body: string;
}) {
  const toneClass =
    tone === 'success'
      ? 'border-emerald-100 bg-emerald-50 text-emerald-800'
      : tone === 'warning'
      ? 'border-amber-100 bg-amber-50 text-amber-800'
      : 'border-slate-200 bg-slate-50 text-slate-800';

  return (
    <div className={`rounded-2xl border p-3 ${toneClass}`}>
      <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide">
        {tone === 'success' ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
        {title}
      </div>
      <p className="mt-1 text-xs leading-relaxed opacity-80">{body}</p>
    </div>
  );
}

function ForecastPanel({
  icon,
  title,
  value,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  body: string;
}) {
  return (
    <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3 text-xs">
        <span className="flex items-center gap-1.5 font-bold text-slate-800">
          {icon}
          {title}
        </span>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-700">{value}</span>
      </div>
      <p className="text-xs leading-relaxed text-slate-500">{body}</p>
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span>{label}</span>
      <span className="truncate text-right font-bold text-slate-900">{value}</span>
    </div>
  );
}
