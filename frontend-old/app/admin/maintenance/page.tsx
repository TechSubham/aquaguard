'use client';

import React, { useState } from 'react';
import { useAquaGuard } from '@/lib/store';
import { Tank } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Wrench,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  BrainCircuit,
  Filter,
  Check,
  RotateCcw,
} from 'lucide-react';

export default function MaintenancePage() {
  const { tanks, markMaintenanceComplete } = useAquaGuard();
  const [selectedTankId, setSelectedTankId] = useState<string>('A2-ROOF-01');
  const [completedMessage, setCompletedMessage] = useState<string | null>(null);

  const selectedTank = tanks.find((t) => t.id === selectedTankId) || tanks[0];

  const handleMarkComplete = (tankId: string) => {
    markMaintenanceComplete(tankId);
    setCompletedMessage(`Maintenance marked completed for ${tankId}. Service log updated.`);
    setTimeout(() => setCompletedMessage(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono px-2 py-0.5 rounded border border-zinc-700 bg-zinc-900 text-zinc-300">
              Asset Lifecycle & Preventative Maintenance
            </span>
            <span className="text-xs font-mono text-zinc-500">Autonomous Scheduling</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Wrench className="h-6 w-6 text-white" />
            Tanks Maintenance Schedule
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Track service logs, filter replacements, sediment flushing, and AI-predicted mechanical degradation risks.
          </p>
        </div>
      </div>

      {completedMessage && (
        <div className="p-3.5 rounded-lg border border-white bg-zinc-900 text-white text-xs font-mono flex items-center gap-2 transition-all">
          <CheckCircle2 className="h-4 w-4 text-white" />
          <span>{completedMessage}</span>
        </div>
      )}

      {/* Main Grid: Maintenance Table & Details View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Maintenance Table */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                <span>Campus Tank Fleet Maintenance</span>
                <span className="text-xs font-mono text-zinc-400 font-normal">
                  Total Managed Tanks: {tanks.length}
                </span>
              </CardTitle>
              <CardDescription>
                Click any tank row to view maintenance history and schedule logs
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-y border-zinc-800 bg-zinc-950 text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                      <th className="py-3 px-4">Tank ID</th>
                      <th className="py-3 px-4">Location</th>
                      <th className="py-3 px-4">Last Service</th>
                      <th className="py-3 px-4">Next Due</th>
                      <th className="py-3 px-4">AI Risk</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800 text-xs font-mono">
                    {tanks.map((tank) => {
                      const isSelected = selectedTank.id === tank.id;
                      return (
                        <tr
                          key={tank.id}
                          onClick={() => setSelectedTankId(tank.id)}
                          className={`cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-zinc-900/90 text-white font-medium'
                              : 'hover:bg-zinc-900/40 text-zinc-300'
                          }`}
                        >
                          <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                            <span>{tank.code}</span>
                            {isSelected && (
                              <span className="w-1.5 h-1.5 rounded-full bg-white" />
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-zinc-400">{tank.block}</td>
                          <td className="py-3.5 px-4 text-zinc-300">{tank.lastServiceDate}</td>
                          <td className="py-3.5 px-4 text-zinc-300">{tank.nextServiceDate}</td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                                tank.aiMaintenanceRisk > 70
                                  ? 'bg-white text-black font-bold'
                                  : tank.aiMaintenanceRisk > 40
                                  ? 'border border-zinc-700 text-zinc-200'
                                  : 'text-zinc-500'
                              }`}
                            >
                              {tank.aiMaintenanceRisk}%
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <Badge
                              variant={
                                tank.maintenanceStatus === 'OVERDUE'
                                  ? 'danger'
                                  : tank.maintenanceStatus === 'DUE_SOON'
                                  ? 'outline'
                                  : 'secondary'
                              }
                              className="text-[10px]"
                            >
                              {tank.maintenanceStatus === 'DUE_SOON'
                                ? '🟠 Due Soon'
                                : tank.maintenanceStatus === 'GOOD'
                                ? '🟢 Good'
                                : '🔴 Overdue'}
                            </Badge>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-[11px] h-7 px-2 hover:bg-zinc-800"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTankId(tank.id);
                              }}
                            >
                              Inspect
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Tank Details Card (Matches user prompt section 10) */}
        <div className="space-y-6">
          <Card className="border-white/20">
            <CardHeader className="pb-3 border-b border-zinc-800">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">Service Dossier</span>
                  <CardTitle className="text-lg font-mono text-white mt-0.5">
                    {selectedTank.code}
                  </CardTitle>
                </div>
                <Badge
                  variant={selectedTank.maintenanceStatus === 'DUE_SOON' ? 'outline' : 'secondary'}
                >
                  {selectedTank.maintenanceStatus}
                </Badge>
              </div>
              <CardDescription>{selectedTank.name} • {selectedTank.block}</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-zinc-950 border border-zinc-800">
                <div>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase block">Last Maintenance</span>
                  <div className="text-xs font-bold font-mono text-white mt-1">
                    {selectedTank.lastServiceDate}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase block">Next Maintenance</span>
                  <div className="text-xs font-bold font-mono text-white mt-1">
                    {selectedTank.nextServiceDate}
                  </div>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-mono text-zinc-500 uppercase block">Maintenance Type</span>
                <div className="text-xs font-semibold text-white mt-1 p-2.5 rounded-lg bg-black border border-zinc-800">
                  {selectedTank.maintenanceType}
                </div>
              </div>

              {/* AI Maintenance Risk Box (from user spec: "Later AI can add: AI maintenance risk: 78%") */}
              <div className="p-4 rounded-xl border border-zinc-800 bg-black space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <BrainCircuit className="h-4 w-4" /> AI Maintenance Risk
                  </span>
                  <span className="text-base font-extrabold font-mono text-white">
                    {selectedTank.aiMaintenanceRisk}%
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  {selectedTank.aiMaintenanceRisk > 50
                    ? 'High vibration and turbidity fluctuations suggest membrane particulate buildup.'
                    : 'Acoustic and flow metrics indicate nominal operational integrity.'}
                </p>
                <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-white h-full rounded-full"
                    style={{ width: `${selectedTank.aiMaintenanceRisk}%` }}
                  />
                </div>
              </div>

              {/* Action Button from user spec: [Mark Complete] */}
              <div className="pt-2">
                <Button
                  className="w-full text-xs font-bold flex items-center justify-center gap-2"
                  onClick={() => handleMarkComplete(selectedTank.id)}
                >
                  <Check className="h-4 w-4" />
                  Mark Complete
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
