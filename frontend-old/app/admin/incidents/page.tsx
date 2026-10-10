'use client';

import React, { useState } from 'react';
import { useAquaGuard } from '@/lib/store';
import { IncidentStage } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  GitBranch,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldAlert,
  Wrench,
  AlertOctagon,
  FileText,
  UserCheck,
} from 'lucide-react';

export default function IncidentsPage() {
  const { incident, advanceIncidentStage } = useAquaGuard();
  const [actionNote, setActionNote] = useState('');
  const [targetStage, setTargetStage] = useState<IncidentStage>('ACTION_TAKEN');

  const STAGES: { stage: IncidentStage; label: string; desc: string }[] = [
    { stage: 'DETECTED', label: 'Detected', desc: 'IoT sensor threshold breached (>5.0 NTU)' },
    { stage: 'INVESTIGATING', label: 'Investigating', desc: 'Facilities dispatch and field triage initiated' },
    { stage: 'ACTION_TAKEN', label: 'Action Taken', desc: 'Tank isolated, flushing and coagulant dosing applied' },
    { stage: 'TESTING', label: 'Testing', desc: 'Secondary laboratory assay and sensor stabilization run' },
    { stage: 'RESOLVED', label: 'Resolved', desc: 'Normal telemetry confirmed, line reopened to students' },
  ];

  const currentStageIndex = STAGES.findIndex((s) => s.stage === incident.currentStage);

  const handleAdvance = (stage: IncidentStage) => {
    advanceIncidentStage(stage, actionNote || 'Stage updated by facilities coordinator.');
    setActionNote('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono px-2 py-0.5 rounded border border-white text-white bg-zinc-900">
              Live Contamination Incident Response
            </span>
            <span className="text-xs font-mono text-zinc-500">Incident #{incident.incidentNumber}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <GitBranch className="h-6 w-6 text-white" />
            Active Incident Workflow
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Standard operating procedure tracker guiding facilities from anomaly detection to certified resolution.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="danger" className="font-mono text-xs px-2.5 py-1">
            🔴 SEVERITY: {incident.severity}
          </Badge>
          <Badge variant="outline" className="font-mono text-xs px-2.5 py-1">
            CURRENT: {incident.currentStage}
          </Badge>
        </div>
      </div>

      {/* Hero Overview Box */}
      <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-950">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-800">
          <div>
            <span className="text-[11px] font-mono uppercase text-zinc-400">Target Asset & Location</span>
            <h2 className="text-xl font-bold font-mono text-white mt-0.5">
              Incident #{incident.incidentNumber} — {incident.title}
            </h2>
            <div className="text-xs text-zinc-400 mt-1 flex items-center gap-3">
              <span>Tank: <strong className="text-white font-mono">{incident.tankId} ({incident.tankName})</strong></span>
              <span>•</span>
              <span>Detected: <strong className="text-white font-mono">{incident.detectedAt}</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-black border border-zinc-800 p-3 rounded-lg text-right">
            <div>
              <div className="text-[10px] font-mono text-zinc-500 uppercase">Response SLA Clock</div>
              <div className="text-base font-bold font-mono text-white">01h 14m Elapsed</div>
            </div>
          </div>
        </div>

        {/* Multi-Step Workflow Visualizer (Detected -> Investigating -> Action Taken -> Testing -> Resolved) */}
        <div className="pt-6">
          <div className="text-xs font-semibold uppercase font-mono tracking-wider text-zinc-400 mb-5">
            Stage Progression Timeline
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {STAGES.map((s, idx) => {
              const isPast = idx < currentStageIndex;
              const isCurrent = idx === currentStageIndex;
              const isFuture = idx > currentStageIndex;

              return (
                <div
                  key={s.stage}
                  className={`p-4 rounded-xl border transition-all ${
                    isCurrent
                      ? 'border-white bg-zinc-900 text-white shadow-lg'
                      : isPast
                      ? 'border-zinc-800 bg-black text-zinc-300'
                      : 'border-zinc-800/40 bg-zinc-950/40 text-zinc-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
                      Step 0{idx + 1}
                    </span>
                    {isPast ? (
                      <CheckCircle2 className="h-4 w-4 text-white" />
                    ) : isCurrent ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-zinc-700" />
                    )}
                  </div>

                  <div className="font-bold text-sm tracking-tight">{s.label}</div>
                  <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                    {s.desc}
                  </p>

                  {isCurrent && idx < STAGES.length - 1 && (
                    <div className="mt-3 pt-3 border-t border-zinc-800">
                      <Button
                        size="sm"
                        variant="default"
                        className="w-full text-[11px] font-mono h-7"
                        onClick={() => handleAdvance(STAGES[idx + 1].stage)}
                      >
                        Advance Stage &rarr;
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Grid: Action Log & Timeline Journal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline Log Journal */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Response Action Log & Timeline
              </CardTitle>
              <CardDescription>Chronological journal of interventions and field observations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {incident.timeline.map((entry, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-zinc-800 bg-black flex items-start gap-4"
                >
                  <div className="w-8 h-8 rounded-full border border-zinc-700 bg-zinc-900 flex items-center justify-center flex-shrink-0 text-white font-mono text-xs">
                    {idx + 1}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                        {entry.label}
                      </span>
                      <span className="text-[11px] font-mono text-zinc-500">{entry.timestamp}</span>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed">{entry.note}</p>
                    <div className="text-[11px] font-mono text-zinc-500 flex items-center gap-1.5 pt-1">
                      <UserCheck className="h-3 w-3 text-zinc-400" />
                      <span>Logged by: {entry.actor}</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Action Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Wrench className="h-4 w-4" />
                Log Incident Action
              </CardTitle>
              <CardDescription>Append notes or progress to next response milestone</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-[11px] font-mono text-zinc-400 block mb-1">Target Stage</label>
                <select
                  value={targetStage}
                  onChange={(e) => setTargetStage(e.target.value as IncidentStage)}
                  className="w-full bg-black border border-zinc-800 rounded-lg p-2 text-xs text-white"
                >
                  {STAGES.map((s) => (
                    <option key={s.stage} value={s.stage}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-mono text-zinc-400 block mb-1">Action Notes</label>
                <textarea
                  rows={3}
                  placeholder="Describe technicians dispatched, valve isolations, dosing changes..."
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded-lg p-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-white transition-colors"
                />
              </div>

              <Button
                className="w-full text-xs font-mono"
                onClick={() => handleAdvance(targetStage)}
              >
                Submit Stage Transition
              </Button>
            </CardContent>
          </Card>

          {/* Quick Guidance Box */}
          <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950 text-xs font-mono text-zinc-400 space-y-2">
            <div className="text-white font-bold uppercase text-[10px]">Campus Water Safety Protocol:</div>
            <p>1. Automatically dispatch SMS/Push advisory if Turbidity &gt; 5.0 NTU for &gt; 10 mins.</p>
            <p>2. Physical inspection of roof breather vents required prior to marking resolved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
