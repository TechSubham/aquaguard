'use client';

import React, { useState } from 'react';
import { useAquaGuard } from '@/lib/store';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Settings,
  Sliders,
  BellRing,
  Cpu,
  Save,
  CheckCircle2,
  RefreshCw,
  ShieldAlert,
} from 'lucide-react';

export default function AdminSettingsPage() {
  const { isLiveUpdating, setIsLiveUpdating } = useAquaGuard();

  const [savedSuccess, setSavedSuccess] = useState(false);

  // Thresholds state
  const [turbidityWarning, setTurbidityWarning] = useState('4.0');
  const [turbidityCritical, setTurbidityCritical] = useState('5.0');
  const [tdsWarning, setTdsWarning] = useState('450');
  const [tdsCritical, setTdsCritical] = useState('500');
  const [phMin, setPhMin] = useState('6.5');
  const [phMax, setPhMax] = useState('8.5');

  // Integrations state
  const [fastApiUrl, setFastApiUrl] = useState('http://localhost:8000');
  const [aiEndpoint, setAiEndpoint] = useState('http://localhost:8000/ai/predict');
  const [smsAdvisory, setSmsAdvisory] = useState(true);
  const [pushAdvisory, setPushAdvisory] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono px-2 py-0.5 rounded border border-zinc-700 bg-zinc-900 text-zinc-300">
              System Configuration
            </span>
            <span className="text-xs font-mono text-zinc-500">Autonomous Threshold Control</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Settings className="h-6 w-6 text-white" />
            AquaGuard System Settings
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Configure IoT telemetry alert boundaries, AI prediction interfaces, and automated emergency notification relays.
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-2 text-xs font-mono text-white bg-zinc-900 border border-white px-3 py-1.5 rounded-lg animate-fade-in">
            <CheckCircle2 className="h-4 w-4" />
            <span>Parameters Saved & Propagated</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Water Quality Safety Thresholds */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Sliders className="h-4 w-4" />
                Water Quality Safety Thresholds
              </CardTitle>
              <CardDescription>
                Breaches trigger immediate Critical and Warning alarms on dashboards
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono text-zinc-400 block mb-1">
                    Turbidity Warning (NTU)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={turbidityWarning}
                    onChange={(e) => setTurbidityWarning(e.target.value)}
                    className="w-full bg-black border border-zinc-800 rounded p-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-zinc-400 block mb-1">
                    Turbidity Critical (NTU)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={turbidityCritical}
                    onChange={(e) => setTurbidityCritical(e.target.value)}
                    className="w-full bg-black border border-zinc-800 rounded p-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono text-zinc-400 block mb-1">
                    TDS Warning (ppm)
                  </label>
                  <input
                    type="number"
                    value={tdsWarning}
                    onChange={(e) => setTdsWarning(e.target.value)}
                    className="w-full bg-black border border-zinc-800 rounded p-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-zinc-400 block mb-1">
                    TDS Critical (ppm)
                  </label>
                  <input
                    type="number"
                    value={tdsCritical}
                    onChange={(e) => setTdsCritical(e.target.value)}
                    className="w-full bg-black border border-zinc-800 rounded p-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono text-zinc-400 block mb-1">
                    pH Minimum (Lower Bound)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={phMin}
                    onChange={(e) => setPhMin(e.target.value)}
                    className="w-full bg-black border border-zinc-800 rounded p-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-zinc-400 block mb-1">
                    pH Maximum (Upper Bound)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={phMax}
                    onChange={(e) => setPhMax(e.target.value)}
                    className="w-full bg-black border border-zinc-800 rounded p-2 text-xs text-white"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Backend & AI Integration */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Cpu className="h-4 w-4" />
                Backend & AI Teammate Integration
              </CardTitle>
              <CardDescription>
                Endpoints for live FastAPI and modular machine learning models
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-[11px] font-mono text-zinc-400 block mb-1">
                  FastAPI Telemetry Gateway
                </label>
                <input
                  type="text"
                  value={fastApiUrl}
                  onChange={(e) => setFastApiUrl(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded p-2 text-xs font-mono text-white"
                />
                <span className="text-[10px] text-zinc-500 font-mono mt-1 block">
                  Connected to PostgreSQL / TimescaleDB pipeline
                </span>
              </div>

              <div>
                <label className="text-[11px] font-mono text-zinc-400 block mb-1">
                  AI Model Inference URL (Teammate USP Endpoint)
                </label>
                <input
                  type="text"
                  value={aiEndpoint}
                  onChange={(e) => setAiEndpoint(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded p-2 text-xs font-mono text-white"
                />
                <span className="text-[10px] text-zinc-500 font-mono mt-1 block">
                  Accepts JSON payload: &#123; tank_id, history_hours, window &#125;
                </span>
              </div>

              <div className="pt-2 border-t border-zinc-800">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white">Live Polling Pulse (5s)</div>
                    <div className="text-[11px] text-zinc-400">
                      Auto-fetch live sensor readings every 5 seconds
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={isLiveUpdating}
                    onChange={(e) => setIsLiveUpdating(e.target.checked)}
                    className="w-4 h-4 rounded bg-black border-zinc-700"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Automated Student Alert Broadcasts */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BellRing className="h-4 w-4" />
                Student Safety Broadcast Dispatchers
              </CardTitle>
              <CardDescription>
                Autonomous triggers dispatched when water in a block breaches potability
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-zinc-800 bg-black flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white">Push Notification Warning</div>
                    <div className="text-[11px] text-zinc-400">
                      Send urgent banner to student mobile portal
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={pushAdvisory}
                    onChange={(e) => setPushAdvisory(e.target.checked)}
                    className="w-4 h-4"
                  />
                </div>

                <div className="p-4 rounded-xl border border-zinc-800 bg-black flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white">Campus SMS Blast Relay</div>
                    <div className="text-[11px] text-zinc-400">
                      Dispatches direct SMS to hostel block residents
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={smsAdvisory}
                    onChange={(e) => setSmsAdvisory(e.target.checked)}
                    className="w-4 h-4"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-3">
                <Button type="submit" className="flex items-center gap-2 font-mono text-xs">
                  <Save className="h-4 w-4" />
                  Save System Configuration
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
