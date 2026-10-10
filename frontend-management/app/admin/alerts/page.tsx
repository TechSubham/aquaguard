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
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <span>Telemetry Alerts & Anomaly Center</span>
          </h1>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Automated threshold infractions, predictive alarms, and incident investigation logs
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-1 p-1 rounded-lg border border-slate-200 bg-white text-xs font-mono overflow-x-auto shadow-sm">
          {['ALL', 'CRITICAL', 'WARNING', 'PREDICTIVE', 'RESOLVED'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-md transition-all ${
                filter === f
                  ? 'bg-slate-900 text-white font-bold shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
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
          <Card className="p-8 text-center text-slate-500 font-mono text-xs bg-white">
            No alerts found matching filter criteria "{filter}".
          </Card>
        ) : (
          filteredAlerts.map((alert) => {
            const isResolved = alert.status === 'RESOLVED';

            return (
              <Card
                key={alert.id}
                className={`border transition-all ${
                  isResolved
                    ? 'border-slate-400 bg-slate-300 shadow-sm'
                    : alert.severity === 'CRITICAL'
                    ? 'border-red-500/70 bg-[#18212D] shadow-[0_0_20px_rgba(239,68,68,0.12)]'
                    : alert.severity === 'PREDICTIVE'
                    ? 'border-indigo-500/60 bg-[#18212D]'
                    : 'border-slate-700/70 bg-[#18212D]'
                }`}
              >
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    {/* Left Column: Severity & Details */}
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        {isResolved ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border border-emerald-600 bg-emerald-100 text-emerald-900">
                            <CheckCircle className="h-3 w-3 text-emerald-600" />
                            🟢 RESOLVED
                          </span>
                        ) : alert.severity === 'CRITICAL' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border border-red-500 bg-red-950/80 text-red-100">
                            <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
                            🔴 CRITICAL
                          </span>
                        ) : alert.severity === 'WARNING' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border border-amber-500 bg-amber-950/80 text-amber-100">
                            <span className="h-2 w-2 rounded-full bg-amber-500" />
                            🟠 WARNING
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border border-indigo-400/50 bg-indigo-950/80 text-indigo-100">
                            <BrainCircuit className="h-3 w-3 text-indigo-300" />
                            🔮 PREDICTIVE AI
                          </span>
                        )}

                        <span className={`text-sm font-bold font-mono ${isResolved ? 'text-slate-900' : 'text-white'}`}>
                          {alert.tankName} ({alert.tankId})
                        </span>
                        <span className={`text-xs font-mono ${isResolved ? 'text-slate-700 font-semibold' : 'text-slate-400'}`}>
                          • {alert.timestamp}
                        </span>
                      </div>

                      <h3 className={`text-base font-bold leading-tight ${isResolved ? 'text-slate-950' : 'text-white'}`}>
                        {alert.title}
                      </h3>
                      <p className={`text-xs leading-relaxed max-w-2xl ${isResolved ? 'text-slate-800 font-medium' : 'text-slate-300'}`}>
                        {alert.description}
                      </p>

                      {/* Sensor snapshot tags */}
                      <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-[11px]">
                        <span className={`px-2 py-0.5 rounded border ${isResolved ? 'bg-slate-200 border-slate-400 text-slate-900 font-semibold' : 'bg-slate-800/90 border-slate-700 text-slate-200'}`}>
                          Risk Score: <strong className={alert.riskScore >= 70 ? 'text-red-500 font-extrabold' : isResolved ? 'text-slate-950 font-bold' : 'text-white font-bold'}>{alert.riskScore}/100</strong>
                        </span>
                        {alert.metricsSummary.turbidity !== undefined && (
                          <span className={`px-2 py-0.5 rounded border ${isResolved ? 'bg-slate-200 border-slate-400 text-slate-900 font-semibold' : 'bg-slate-800/90 border-slate-700 text-slate-200'}`}>
                            Turbidity: <strong className={isResolved ? 'text-slate-950 font-bold' : 'text-white'}>{alert.metricsSummary.turbidity} NTU</strong>
                          </span>
                        )}
                        {alert.metricsSummary.tds !== undefined && (
                          <span className={`px-2 py-0.5 rounded border ${isResolved ? 'bg-slate-200 border-slate-400 text-slate-900 font-semibold' : 'bg-slate-800/90 border-slate-700 text-slate-200'}`}>
                            TDS: <strong className={isResolved ? 'text-slate-950 font-bold' : 'text-white'}>{alert.metricsSummary.tds} ppm</strong>
                          </span>
                        )}
                        {alert.confidence && (
                          <span className={`px-2 py-0.5 rounded border ${isResolved ? 'bg-slate-200 border-slate-400 text-slate-900 font-semibold' : 'bg-slate-800/90 border-slate-700 text-slate-200'}`}>
                            AI Model Confidence: <strong className={isResolved ? 'text-slate-950 font-bold' : 'text-white'}>{alert.confidence}%</strong>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right Actions */}
                    <div className={`flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 flex-shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 ${isResolved ? 'border-slate-400' : 'border-slate-800'}`}>
                      <div className={`text-[10px] font-mono uppercase tracking-wider ${isResolved ? 'text-slate-700 font-bold' : 'text-slate-400'}`}>
                        Status: <strong className={isResolved ? 'text-slate-950 font-extrabold' : 'text-white'}>{alert.status}</strong>
                      </div>

                      <div className="flex items-center gap-2">
                        {!isResolved ? (
                          <>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => setSelectedAlertForModal(alert)}
                              className="text-xs h-8 px-3 bg-white text-slate-900 hover:bg-slate-100 font-bold"
                            >
                              Investigate
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => resolveAlert(alert.id)}
                              className="text-xs h-8 px-3 border-slate-600 bg-slate-800 text-white hover:bg-slate-700 font-semibold"
                            >
                              <Check className="h-3 w-3 mr-1 text-emerald-400" />
                              Resolve
                            </Button>
                          </>
                        ) : (
                          <span className="text-xs font-mono font-bold text-emerald-800 flex items-center gap-1.5 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-400">
                            <CheckCircle className="h-3.5 w-3.5 text-emerald-700" /> Resolved
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Investigation Details Modal */}
      {selectedAlertForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <Card className="max-w-lg w-full border-slate-700 bg-[#18212D] text-white p-2 shadow-2xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Incident Investigation Dossier</span>
                <Badge variant={selectedAlertForModal.severity === 'CRITICAL' ? 'critical' : 'secondary'}>
                  {selectedAlertForModal.id}
                </Badge>
              </div>
              <CardTitle className="text-base text-white mt-1">
                {selectedAlertForModal.title}
              </CardTitle>
              <CardDescription className="font-mono text-slate-400">
                {selectedAlertForModal.tankName} • {selectedAlertForModal.timestamp}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 text-xs">
              <div className="p-3 rounded-lg border border-slate-700 bg-slate-800/60 space-y-1.5">
                <span className="text-slate-400 uppercase text-[10px] font-mono block">Diagnostic Summary</span>
                <p className="text-slate-200 leading-relaxed">{selectedAlertForModal.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 font-mono">
                <div className="p-2.5 rounded border border-slate-700 bg-slate-800/40">
                  <span className="text-slate-400 text-[10px] uppercase block">Risk Score Index</span>
                  <span className="text-base font-bold text-red-400">{selectedAlertForModal.riskScore} / 100</span>
                </div>
                <div className="p-2.5 rounded border border-slate-700 bg-slate-800/40">
                  <span className="text-slate-400 text-[10px] uppercase block">Standard Action</span>
                  <span className="text-slate-200">Manual Filter Flush & Lab Re-test</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-700">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedAlertForModal(null)}
                  className="border-slate-600 bg-slate-800 text-slate-200 hover:bg-slate-700"
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
                  className="bg-white text-slate-900 hover:bg-slate-100 font-bold"
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
