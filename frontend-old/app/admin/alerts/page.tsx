'use client';

import React, { useState } from 'react';
import { useAquaGuard } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertItem, AlertSeverity } from '@/lib/types';
import { AlertTriangle, CheckCircle, ShieldAlert, BrainCircuit, Filter, Check } from 'lucide-react';

export default function AlertsPage() {
  const { alerts, resolveAlert, investigateAlert } = useAquaGuard();
  const [filter, setFilter] = useState<string>('ALL');
  const [selectedAlertForModal, setSelectedAlertForModal] = useState<AlertItem | null>(null);

  const filteredAlerts = filter === 'ALL'
    ? alerts
    : alerts.filter((a) => {
        if (filter === 'CRITICAL') return a.severity === 'CRITICAL';
        if (filter === 'WARNING') return a.severity === 'WARNING';
        if (filter === 'PREDICTIVE') return a.severity === 'PREDICTIVE';
        if (filter === 'RESOLVED') return a.status === 'RESOLVED';
        return true;
      });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-white" />
            <span>Telemetry Alerts & Anomaly Center</span>
          </h1>
          <p className="text-xs text-zinc-400 font-mono mt-0.5">
            Automated threshold infractions, predictive alarms, and incident investigation logs
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-1 p-1 rounded-lg border border-zinc-800 bg-zinc-950 text-xs font-mono overflow-x-auto">
          {['ALL', 'CRITICAL', 'WARNING', 'PREDICTIVE', 'RESOLVED'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-md transition-all ${
                filter === f
                  ? 'bg-white text-black font-bold shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <Card className="p-8 text-center text-zinc-500 font-mono text-xs">
            No alerts found matching filter criteria "{filter}".
          </Card>
        ) : (
          filteredAlerts.map((alert) => (
            <Card
              key={alert.id}
              className={`border transition-all ${
                alert.severity === 'CRITICAL' && alert.status !== 'RESOLVED'
                  ? 'border-red-600/80 bg-zinc-950 shadow-[0_0_20px_rgba(239,68,68,0.1)]'
                  : alert.severity === 'PREDICTIVE'
                  ? 'border-zinc-700 bg-zinc-950'
                  : alert.status === 'RESOLVED'
                  ? 'border-zinc-900 bg-zinc-950/40 opacity-75'
                  : 'border-zinc-800 bg-zinc-950'
              }`}
            >
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  {/* Left Column: Severity & Details */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      {alert.severity === 'CRITICAL' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border border-red-500 bg-red-950/80 text-red-100">
                          <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
                          🔴 CRITICAL
                        </span>
                      ) : alert.severity === 'WARNING' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border border-amber-500 bg-amber-950/80 text-amber-100">
                          <span className="h-2 w-2 rounded-full bg-amber-500" />
                          🟠 WARNING
                        </span>
                      ) : alert.severity === 'PREDICTIVE' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border border-zinc-600 bg-zinc-900 text-white">
                          <BrainCircuit className="h-3 w-3 text-white" />
                          🔮 PREDICTIVE AI
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border border-zinc-800 bg-zinc-900 text-zinc-400">
                          <CheckCircle className="h-3 w-3 text-emerald-400" />
                          🟢 RESOLVED
                        </span>
                      )}

                      <span className="text-sm font-bold text-white font-mono">{alert.tankName} ({alert.tankId})</span>
                      <span className="text-xs text-zinc-500 font-mono">• {alert.timestamp}</span>
                    </div>

                    <h3 className="text-base font-semibold text-zinc-100 leading-tight">
                      {alert.title}
                    </h3>
                    <p className="text-xs text-zinc-400 leading-relaxed max-w-2xl">
                      {alert.description}
                    </p>

                    {/* Sensor snapshot tags */}
                    <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-[11px]">
                      <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">
                        Risk Score: <strong className={alert.riskScore >= 70 ? 'text-red-400' : 'text-zinc-200'}>{alert.riskScore}/100</strong>
                      </span>
                      {alert.metricsSummary.turbidity !== undefined && (
                        <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">
                          Turbidity: <strong className="text-white">{alert.metricsSummary.turbidity} NTU</strong>
                        </span>
                      )}
                      {alert.metricsSummary.tds !== undefined && (
                        <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">
                          TDS: <strong className="text-white">{alert.metricsSummary.tds} ppm</strong>
                        </span>
                      )}
                      {alert.confidence && (
                        <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">
                          AI Model Confidence: <strong className="text-white">{alert.confidence}%</strong>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 flex-shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-zinc-800/80">
                    <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                      Status: <strong className="text-zinc-300">{alert.status}</strong>
                    </div>

                    <div className="flex items-center gap-2">
                      {alert.status !== 'RESOLVED' ? (
                        <>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => setSelectedAlertForModal(alert)}
                            className="text-xs h-8 px-3"
                          >
                            Investigate
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => resolveAlert(alert.id)}
                            className="text-xs h-8 px-3 text-zinc-300 hover:text-white"
                          >
                            <Check className="h-3 w-3 mr-1 text-emerald-400" />
                            Resolve
                          </Button>
                        </>
                      ) : (
                        <span className="text-xs font-mono text-zinc-500 flex items-center gap-1">
                          <CheckCircle className="h-3.5 w-3.5 text-emerald-500" /> Resolved
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Investigation Details Modal */}
      {selectedAlertForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <Card className="max-w-lg w-full border-zinc-700 bg-zinc-950 p-2 shadow-2xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-zinc-500 uppercase">Incident Investigation Dossier</span>
                <Badge variant={selectedAlertForModal.severity === 'CRITICAL' ? 'critical' : 'secondary'}>
                  {selectedAlertForModal.id}
                </Badge>
              </div>
              <CardTitle className="text-base text-white mt-1">
                {selectedAlertForModal.title}
              </CardTitle>
              <CardDescription className="font-mono text-zinc-400">
                {selectedAlertForModal.tankName} • {selectedAlertForModal.timestamp}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 text-xs">
              <div className="p-3 rounded-lg border border-zinc-800 bg-zinc-900/50 space-y-1.5">
                <span className="text-zinc-500 uppercase text-[10px] font-mono block">Diagnostic Summary</span>
                <p className="text-zinc-300 leading-relaxed">{selectedAlertForModal.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-mono">
                <div className="p-2.5 rounded border border-zinc-800 bg-zinc-900/30">
                  <span className="text-zinc-500 text-[10px] uppercase block">Risk Score Index</span>
                  <span className="text-base font-bold text-red-400">{selectedAlertForModal.riskScore} / 100</span>
                </div>
                <div className="p-2.5 rounded border border-zinc-800 bg-zinc-900/30">
                  <span className="text-zinc-500 text-[10px] uppercase block">Standard Action</span>
                  <span className="text-zinc-200">Manual Filter Flush & Lab Re-test</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedAlertForModal(null)}
                >
                  Close
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => {
                    investigateAlert(selectedAlertForModal.id);
                    setSelectedAlertForModal(null);
                  }}
                >
                  Mark Under Investigation
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => {
                    resolveAlert(selectedAlertForModal.id);
                    setSelectedAlertForModal(null);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500 font-semibold"
                >
                  Confirm Resolution
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
