
'use client';

import React, { useState } from 'react';
import { useAquaGuard } from '@/lib/store';
import { IncidentStage } from '@/lib/types';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import {
  GitBranch,
  CheckCircle2,
  Wrench,
  FileText,
  UserCheck,
} from 'lucide-react';

export default function IncidentsPage() {
  const { incident, advanceIncidentStage } = useAquaGuard();

  const [actionNote, setActionNote] = useState('');
  const [targetStage, setTargetStage] =
    useState<IncidentStage>('ACTION_TAKEN');

  const STAGES: {
    stage: IncidentStage;
    label: string;
    desc: string;
  }[] = [
    {
      stage: 'DETECTED',
      label: 'Detected',
      desc: 'IoT sensor threshold breached (>5.0 NTU)',
    },
    {
      stage: 'INVESTIGATING',
      label: 'Investigating',
      desc: 'Facilities dispatch and field triage initiated',
    },
    {
      stage: 'ACTION_TAKEN',
      label: 'Action Taken',
      desc: 'Tank isolated, flushing and coagulant dosing applied',
    },
    {
      stage: 'TESTING',
      label: 'Testing',
      desc: 'Secondary laboratory assay and sensor stabilization run',
    },
    {
      stage: 'RESOLVED',
      label: 'Resolved',
      desc: 'Normal telemetry confirmed, line reopened to students',
    },
  ];

  const currentStageIndex = STAGES.findIndex(
    (s) => s.stage === incident.currentStage
  );

  const handleAdvance = (stage: IncidentStage) => {
    advanceIncidentStage(
      stage,
      actionNote || 'Stage updated by facilities coordinator.'
    );

    setActionNote('');
  };

  return (
    <div className="space-y-6 text-slate-900">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-300 pb-4 md:flex-row md:items-center">
        <div>
          <div className="mb-1 flex items-center gap-2">
            {/* <span className="rounded-md border border-slate-300 bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-700">
              Live Contamination Incident Response
            </span> */}

            {/* <span className="font-mono text-xs text-slate-500">
              Incident #{incident.incidentNumber}
            </span> */}
          </div>

          <h1 className="flex items-center gap-2.5 text-2xl font-bold tracking-tight text-slate-900">
            <GitBranch className="h-6 w-6 text-sky-600" />
            Active Incident Workflow
          </h1>

          <p className="mt-1 text-xs text-slate-500">
            Standard operating procedure tracker guiding facilities from
            anomaly detection to certified resolution.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="danger"
            className="border border-red-200 px-2.5 py-1 font-mono text-xs"
          >
            🔴 SEVERITY: {incident.severity}
          </Badge>

          <Badge
            variant="outline"
            className="border-slate-300 bg-slate-50 px-2.5 py-1 font-mono text-xs text-slate-700"
          >
            CURRENT STATUS : {incident.currentStage}
          </Badge>
        </div>
      </div>

      {/* Main Incident Overview */}
      <div className="rounded-2xl border border-slate-300 bg-slate-50 p-6 text-slate-900 shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-300 pb-5 sm:flex-row sm:items-center">
          <div>
            {/* <span className="font-mono text-[11px] uppercase text-slate-500">
              Target Asset &amp; Location
            </span> */}

            <h2 className="mt-0.5 text-xl font-bold tracking-tight text-slate-900">
              Incident #{incident.incidentNumber} — {incident.title}
            </h2>

            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-600 sm:gap-3">
              <span>
                Tank:{' '}
                <strong className="font-mono text-slate-900">
                  {incident.tankId} ({incident.tankName})
                </strong>
              </span>

              <span className="text-slate-400">•</span>

              <span>
                Detected:{' '}
                <strong className="font-mono text-slate-900">
                  {incident.detectedAt}
                </strong>
              </span>
            </div>
          </div>

          {/* Response SLA Clock */}
          <div className="rounded-xl border border-slate-300 bg-white p-3 text-right shadow-sm">
            <div className="font-mono text-[10px] uppercase text-slate-500">
              Response SLA Clock
            </div>

            <div className="font-mono text-base font-bold text-slate-900">
              01h 14m Elapsed
            </div>
          </div>
        </div>

        {/* Stage Progression Timeline */}
        <div className="pt-6">
          <div className="mb-5 font-mono text-xs font-semibold uppercase tracking-wider text-slate-600">
            Stage Progression Timeline
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
            {STAGES.map((s, idx) => {
              const isPast = idx < currentStageIndex;
              const isCurrent = idx === currentStageIndex;

              return (
                <div
                  key={s.stage}
                  className={`rounded-xl border p-4 transition-all ${
                    isCurrent
                      ? 'border-sky-400 bg-sky-50 text-slate-900 shadow-sm ring-1 ring-sky-100'
                      : isPast
                      ? 'border-slate-300 bg-slate-100 text-slate-800'
                      : 'border-slate-300 bg-white text-slate-600'
                  }`}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="rounded-md border border-slate-300 bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-600">
                      Step 0{idx + 1}
                    </span>

                    {isPast ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    ) : isCurrent ? (
                      <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-sky-500" />
                    ) : (
                      <span className="h-2 w-2 rounded-full bg-slate-300" />
                    )}
                  </div>

                  <div className="text-sm font-bold tracking-tight">
                    {s.label}
                  </div>

                  <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-slate-600">
                    {s.desc}
                  </p>

                  {isCurrent && idx < STAGES.length - 1 && (
                    <div className="mt-3 border-t border-slate-300 pt-3">
                      <Button
                        size="sm"
                        variant="default"
                        className="h-8 w-full border border-sky-700 bg-sky-600 font-mono text-[11px] text-white hover:bg-sky-700"
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

      {/* Main Grid: Timeline and Action Panel */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Response Action Log */}
        <div className="space-y-4 lg:col-span-2">
          <Card className="border border-slate-300 bg-slate-50 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base text-slate-900">
                <FileText className="h-4 w-4 text-sky-600" />
                Response Action Log &amp; Timeline
              </CardTitle>

              <CardDescription className="text-slate-500">
                Chronological journal of interventions and field observations
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {incident.timeline.map((entry, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-4 rounded-xl border border-slate-300 bg-white p-4 shadow-sm transition-colors hover:border-slate-400"
                >
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-slate-300 bg-slate-100 font-mono text-xs text-slate-700">
                    {idx + 1}
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-center">
                      <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-900">
                        {entry.label}
                      </span>

                      <span className="font-mono text-[11px] text-slate-500">
                        {entry.timestamp}
                      </span>
                    </div>

                    <p className="text-xs leading-relaxed text-slate-700">
                      {entry.note}
                    </p>

                    <div className="flex items-center gap-1.5 pt-1 font-mono text-[11px] text-slate-500">
                      <UserCheck className="h-3 w-3 text-slate-500" />
                      <span>Logged by: {entry.actor}</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Log Incident Action Panel */}
        <div className="space-y-6">
          <Card className="border border-slate-300 bg-slate-50 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base text-slate-900">
                <Wrench className="h-4 w-4 text-sky-600" />
                Log Incident Action
              </CardTitle>

              <CardDescription className="text-slate-500">
                Append notes or progress to next response milestone
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Target Stage */}
              <div>
                <label
                  htmlFor="target-stage"
                  className="mb-1 block font-mono text-[11px] text-slate-600"
                >
                  Target Stage
                </label>

                <select
                  id="target-stage"
                  value={targetStage}
                  onChange={(e) =>
                    setTargetStage(e.target.value as IncidentStage)
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-800 transition-colors hover:border-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
                >
                  {STAGES.map((s) => (
                    <option key={s.stage} value={s.stage}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Action Notes */}
              <div>
                <label
                  htmlFor="action-notes"
                  className="mb-1 block font-mono text-[11px] text-slate-600"
                >
                  Action Notes
                </label>

                <textarea
                  id="action-notes"
                  rows={3}
                  placeholder="Describe technicians dispatched, valve isolations, dosing changes..."
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-800 transition-colors placeholder:text-slate-400 hover:border-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
                />
              </div>

              <Button
                className="w-full border border-slate-800 bg-slate-900 font-mono text-xs text-white hover:bg-slate-800"
                onClick={() => handleAdvance(targetStage)}
              >
                Submit Stage Transition
              </Button>
            </CardContent>
          </Card>

          {/* Campus Water Safety Protocol */}
          <div className="space-y-2 rounded-xl border border-slate-300 bg-slate-100 p-4 font-mono text-xs text-slate-600 shadow-sm">
            <div className="text-[10px] font-bold uppercase text-slate-900">
              Campus Water Safety Protocol:
            </div>

            <p>
              1. Automatically dispatch SMS/Push advisory if Turbidity &gt;
              5.0 NTU for &gt; 10 mins.
            </p>

            <p>
              2. Physical inspection of roof breather vents required prior to
              marking resolved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
