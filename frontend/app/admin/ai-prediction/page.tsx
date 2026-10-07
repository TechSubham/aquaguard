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
} from 'lucide-react';

export default function AIPredictionPage() {
  const { selectedTank, aiPrediction, currentReading, refreshData, isLiveUpdating } = useAquaGuard();
  const [isInferring, setIsInferring] = useState(false);
  const [modelSimState, setModelSimState] = useState<'nominal' | 'simulated'>('nominal');

  const handleRunInference = async () => {
    setIsInferring(true);
    await new Promise((r) => setTimeout(r, 900));
    await refreshData();
    setIsInferring(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono px-2 py-0.5 rounded border border-white text-white bg-zinc-900 flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> AquaGuard AI Engine
            </span>
            <span className="text-xs font-mono text-zinc-400">Model: {aiPrediction.modelVersion}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <BrainCircuit className="h-6 w-6 text-white" />
            Predictive Water Contamination Analytics
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            LSTM Multi-variate neural network projecting contamination probabilities before water reaches student taps.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <TankSelector />
          <Button
            onClick={handleRunInference}
            disabled={isInferring}
            variant="outline"
            size="sm"
            className="flex items-center gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isInferring ? 'animate-spin' : ''}`} />
            {isInferring ? 'Running Inference...' : 'Trigger Model Run'}
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Current & Future Trajectory */}
        <div className="lg:col-span-2 space-y-6">
          {/* Executive Risk Hero */}
          <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-950 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 relative z-10">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                  Target Tank: {selectedTank.code} ({selectedTank.name})
                </span>
                <h2 className="text-xl font-bold text-white mt-1">Water Contamination Risk Projection</h2>
                <p className="text-xs text-zinc-400 mt-1 max-w-xl">
                  {aiPrediction.predictionSummary}
                </p>
              </div>

              {/* Huge Risk Score Display */}
              <div className="flex items-center sm:flex-col items-end sm:items-center bg-black border border-zinc-800 p-4 rounded-xl text-center min-w-[140px]">
                <span className="text-[10px] font-mono uppercase text-zinc-400">Current AI Risk</span>
                <div className="text-4xl font-extrabold font-mono tracking-tight text-white my-1">
                  {aiPrediction.currentRiskPercent}%
                </div>
                <Badge
                  variant={aiPrediction.currentRiskPercent > 70 ? 'danger' : 'outline'}
                  className="font-mono text-[10px] tracking-wider"
                >
                  {aiPrediction.riskLevel} RISK
                </Badge>
              </div>
            </div>

            {/* Warning Callout Box */}
            {aiPrediction.currentRiskPercent > 60 && (
              <div className="mt-5 p-4 rounded-lg border border-zinc-800 bg-black flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-white flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="text-xs font-bold text-white uppercase tracking-wide">
                    ⚠️ Early Deterioration Warning Active
                  </div>
                  <div className="text-xs text-zinc-300">
                    Water-quality deterioration likely within 4–6 hours based on slope of turbidity acceleration and TDS saturation.
                  </div>
                </div>
              </div>
            )}

            {/* Trajectory Bar Matrix */}
            <div className="mt-6 pt-5 border-t border-zinc-800/80">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4" /> Future Risk Trajectory Projections
                </span>
                <span className="text-[11px] font-mono text-zinc-500">Inference interval: +2hr step</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {aiPrediction.futureProjections.map((proj, idx) => {
                  const isHigh = proj.riskPercent >= 80;
                  return (
                    <div
                      key={proj.timeOffset}
                      className="p-3.5 rounded-lg border border-zinc-800 bg-black flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                        <span>{proj.timeOffset}</span>
                        {idx > 0 && <span className="text-[10px] text-zinc-500">+{idx * 2}h</span>}
                      </div>

                      <div className="my-2.5">
                        <div className="text-2xl font-bold font-mono text-white">
                          {proj.riskPercent}%
                        </div>
                        {/* Visual mini-bar */}
                        <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden">
                          <div
                            className="bg-white h-full rounded-full transition-all duration-500"
                            style={{ width: `${proj.riskPercent}%` }}
                          />
                        </div>
                      </div>

                      <span className="text-[10px] font-mono text-zinc-400 uppercase">
                        {proj.riskPercent > 80 ? '🔴 Critical' : proj.riskPercent > 50 ? '🟠 Warning' : '🟢 Nominal'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Root Cause Analysis: Why is the risk increasing? */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Why is the risk increasing?
                  </CardTitle>
                  <CardDescription>
                    Feature importance attribution from the temporal convolutional layers
                  </CardDescription>
                </div>
                <Badge variant="outline" className="font-mono text-[10px]">
                  Attribution: SHAP/Integrated Gradients
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {aiPrediction.rootCauses.map((rc, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg border border-zinc-800 bg-zinc-900/50 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded border border-zinc-800 bg-black flex items-center justify-center font-mono text-xs">
                      {rc.trend === 'up' ? (
                        <ArrowUpRight className="h-4 w-4 text-white" />
                      ) : rc.trend === 'down' ? (
                        <ArrowDownRight className="h-4 w-4 text-white" />
                      ) : (
                        <span className="text-zinc-500">—</span>
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">{rc.factor}</div>
                      <div className="text-[11px] text-zinc-400">{rc.detail}</div>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black border border-zinc-800 text-zinc-300 uppercase">
                    {rc.trend === 'up' ? 'Accelerating ↑' : rc.trend === 'down' ? 'Declining ↓' : 'Stable'}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Possible Causes & Recommended Actions */}
        <div className="space-y-6">
          {/* Possible Cause & Confidence */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Cpu className="h-4 w-4" />
                Diagnosed Root Cause
              </CardTitle>
              <CardDescription>Probabilistic classification of mechanical failure</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {aiPrediction.possibleCauses.length > 0 ? (
                aiPrediction.possibleCauses.map((cause, i) => (
                  <div key={i} className="p-4 rounded-xl border border-zinc-800 bg-black space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-sm font-bold text-white">{cause.cause}</div>
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
                          className="bg-white h-full rounded-full"
                          style={{ width: `${cause.confidencePercent}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                        <span>Low confidence</span>
                        <span>High confidence</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-lg border border-zinc-800 bg-black text-center py-6">
                  <CheckCircle2 className="h-6 w-6 text-white mx-auto mb-2" />
                  <div className="text-xs font-semibold text-white">No Fault Signatures Detected</div>
                  <div className="text-[11px] text-zinc-400 mt-1">
                    Sensor signals align with clean operating parameters.
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recommended Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ShieldAlert className="h-4 w-4" />
                Prescriptive Actions
              </CardTitle>
              <CardDescription>Automated playbook for hostel maintenance crew</CardDescription>
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
                <Button className="w-full text-xs font-semibold" variant="default">
                  Dispatch Maintenance Work Order
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* AI Metadata Box */}
          <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950 text-[11px] space-y-2 text-zinc-400 font-mono">
            <div className="flex justify-between">
              <span>Model Architecture:</span>
              <span className="text-white">PyTorch LSTM + XGBoost Ensemble</span>
            </div>
            <div className="flex justify-between">
              <span>Last Inferred:</span>
              <span className="text-white">{aiPrediction.lastInferenceAt}</span>
            </div>
            <div className="flex justify-between">
              <span>Inference Latency:</span>
              <span className="text-white">42ms on local CPU</span>
            </div>
            <div className="flex justify-between">
              <span>Plug-in Interface:</span>
              <span className="text-white">POST /ai/predict-risk</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
