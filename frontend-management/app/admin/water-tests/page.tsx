'use client';

import React, { useState } from 'react';
import { useAquaGuard } from '@/lib/store';
import { TankSelector } from '@/components/shared/TankSelector';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { WaterTestReport } from '@/lib/types';
import {
  FlaskConical,
  Plus,
  FileCheck2,
  Calendar,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ShieldCheck,
  Building2,
  X,
} from 'lucide-react';

export default function WaterTestingPage() {
  const { selectedTank, waterTests, addWaterTest } = useAquaGuard();
  const [selectedReport, setSelectedReport] = useState<WaterTestReport | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form state
  const [testDate, setTestDate] = useState('08 Oct 2026');
  const [labName, setLabName] = useState('Central Public Health Engineering Lab');
  const [ph, setPh] = useState('7.1');
  const [tds, setTds] = useState('285');
  const [turbidity, setTurbidity] = useState('1.1');
  const [eColi, setEColi] = useState<'NEGATIVE' | 'POSITIVE'>('NEGATIVE');
  const [coliform, setColiform] = useState<'NEGATIVE' | 'POSITIVE'>('NEGATIVE');
  const [certifiedBy, setCertifiedBy] = useState('Dr. S. K. Raman (Chief Chemist)');
  const [notes, setNotes] = useState('Water sample is potably compliant with IS 10500:2012 specifications.');

  // Find the latest test for currently selected tank
  const tankTests = waterTests.filter((t) => t.tankId === selectedTank.id);
  const latestTest = tankTests[0] || waterTests[0];

  const handleCreateTest = (e: React.FormEvent) => {
    e.preventDefault();
    addWaterTest({
      tankId: selectedTank.id,
      testDate,
      laboratory: labName,
      ph: parseFloat(ph) || 7.0,
      tds: parseFloat(tds) || 250,
      turbidity: parseFloat(turbidity) || 1.0,
      eColi,
      coliform,
      certifiedBy,
      status: eColi === 'NEGATIVE' && coliform === 'NEGATIVE' ? 'PASSED' : 'FAILED',
      notes,
    });
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono px-2 py-0.5 rounded border border-zinc-700 bg-zinc-900 text-zinc-300">
              Laboratory Validation & Microbiology
            </span>
            <span className="text-xs font-mono text-zinc-500">IS 10500:2012 Benchmark</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <FlaskConical className="h-6 w-6 text-white" />
            Certified Water Testing
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Sensor data ≠ laboratory certification. Biological pathogen assays and wet chemical chromatography reports.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <TankSelector />
          <Button
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            Add New Test
          </Button>
        </div>
      </div>

      {/* Main Grid: Featured Latest Test & History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Latest Laboratory Test (Matches user prompt section 11) */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-white/20">
            <CardHeader className="pb-3 border-b border-zinc-800">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">
                    Official Certification
                  </span>
                  <CardTitle className="text-xl font-bold text-white mt-0.5">
                    Last Laboratory Test
                  </CardTitle>
                </div>
                <Badge
                  variant={latestTest?.status === 'PASSED' ? 'secondary' : 'danger'}
                  className="font-mono text-[10px]"
                >
                  {latestTest?.status === 'PASSED' ? 'CERTIFIED COMPLIANT' : 'ACTION REQUIRED'}
                </Badge>
              </div>
              <CardDescription>
                Tank: {selectedTank.code} • Date: {latestTest?.testDate || '06 Oct 2026'}
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-6 space-y-6">
              {/* Key Parameters Matrix from user spec */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-zinc-800 bg-black">
                  <span className="text-[10px] font-mono uppercase text-zinc-500 block">pH Level</span>
                  <div className="text-2xl font-bold font-mono text-white mt-1">
                    {latestTest?.ph ?? 7.1}
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400">Permissible: 6.5 – 8.5</span>
                </div>

                <div className="p-4 rounded-xl border border-zinc-800 bg-black">
                  <span className="text-[10px] font-mono uppercase text-zinc-500 block">TDS</span>
                  <div className="text-2xl font-bold font-mono text-white mt-1">
                    {latestTest?.tds ?? 285} <span className="text-xs font-normal text-zinc-400">ppm</span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400">Permissible: &lt; 500 ppm</span>
                </div>

                <div className="p-4 rounded-xl border border-zinc-800 bg-black">
                  <span className="text-[10px] font-mono uppercase text-zinc-500 block">Turbidity</span>
                  <div className="text-2xl font-bold font-mono text-white mt-1">
                    {latestTest?.turbidity ?? 1.1} <span className="text-xs font-normal text-zinc-400">NTU</span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400">Permissible: &lt; 5.0 NTU</span>
                </div>

                <div className="p-4 rounded-xl border border-zinc-800 bg-black">
                  <span className="text-[10px] font-mono uppercase text-zinc-500 block">E. coli Assay</span>
                  <div className="text-xl font-bold font-mono text-white mt-1 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                    {latestTest?.eColi ?? 'Negative'}
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400">Zero tolerance (0 CFU/100ml)</span>
                </div>

                <div className="p-4 rounded-xl border border-zinc-800 bg-black">
                  <span className="text-[10px] font-mono uppercase text-zinc-500 block">Coliform Count</span>
                  <div className="text-xl font-bold font-mono text-white mt-1 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                    {latestTest?.coliform ?? 'Negative'}
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400">Zero tolerance</span>
                </div>

                <div className="p-4 rounded-xl border border-zinc-800 bg-black">
                  <span className="text-[10px] font-mono uppercase text-zinc-500 block">Authorized Signatory</span>
                  <div className="text-xs font-semibold text-white mt-1 line-clamp-1">
                    {latestTest?.certifiedBy ?? 'Dr. S. K. Raman'}
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400">State Certified Chemist</span>
                </div>
              </div>

              {/* Lab Accreditation and Notes */}
              <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Building2 className="h-4 w-4 text-white" />
                    Testing Facility: {latestTest?.laboratory}
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-0.5">
                    Report Ref: {latestTest?.reportNumber} • {latestTest?.notes}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedReport(latestTest)}
                    className="text-xs"
                  >
                    View Report
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Historical Lab Tests List */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Testing Records History</CardTitle>
              <CardDescription>Archived wet-lab certifications for audit compliance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {waterTests.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setSelectedReport(t)}
                  className="p-3.5 rounded-lg border border-zinc-800 bg-black hover:border-zinc-700 cursor-pointer transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded border border-zinc-800 bg-zinc-900 flex items-center justify-center font-mono text-xs text-white">
                      <FileCheck2 className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        <span>{t.reportNumber}</span>
                        <span className="text-zinc-500 font-mono font-normal">({t.tankId})</span>
                      </div>
                      <div className="text-[11px] text-zinc-400">
                        Date: {t.testDate} • pH: {t.ph} • TDS: {t.tds} • Turbidity: {t.turbidity} NTU
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant={t.status === 'PASSED' ? 'secondary' : 'danger'} className="text-[10px]">
                      {t.status}
                    </Badge>
                    <span className="text-xs text-zinc-400 font-mono">&gt;</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Standards Guidance & Quick Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                Laboratory Standard (IS 10500)
              </CardTitle>
              <CardDescription>Mandatory Indian Drinking Water Specifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs font-mono">
              <div className="p-3 rounded-lg border border-zinc-800 bg-black space-y-1">
                <div className="text-zinc-400 uppercase text-[10px]">Turbidity Maximum</div>
                <div className="text-white font-bold">1.0 NTU (Desirable) / 5.0 (Permissible)</div>
              </div>
              <div className="p-3 rounded-lg border border-zinc-800 bg-black space-y-1">
                <div className="text-zinc-400 uppercase text-[10px]">Total Dissolved Solids</div>
                <div className="text-white font-bold">&lt; 500 mg/L (Max 2,000 mg/L)</div>
              </div>
              <div className="p-3 rounded-lg border border-zinc-800 bg-black space-y-1">
                <div className="text-zinc-400 uppercase text-[10px]">Microbial Tolerance</div>
                <div className="text-white font-bold">0 E. coli / 100 mL of sample</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal: View Report Certificate */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-700 rounded-xl max-w-xl w-full p-6 space-y-5 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div>
                <h3 className="text-lg font-bold font-mono">Laboratory Certificate of Analysis</h3>
                <p className="text-xs text-zinc-400">{selectedReport.reportNumber}</p>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="grid grid-cols-2 gap-3 p-3 bg-black border border-zinc-800 rounded-lg">
                <div>Sample Source: <span className="text-white font-bold">{selectedReport.tankId}</span></div>
                <div>Sampling Date: <span className="text-white font-bold">{selectedReport.testDate}</span></div>
                <div>Laboratory: <span className="text-white font-bold">{selectedReport.laboratory}</span></div>
                <div>Certification: <span className="text-white font-bold">{selectedReport.status}</span></div>
              </div>

              <div className="p-3 bg-black border border-zinc-800 rounded-lg space-y-2">
                <div className="text-zinc-400 uppercase text-[10px]">Physicochemical & Biological Profile</div>
                <div className="grid grid-cols-2 gap-2 text-zinc-300">
                  <div>pH: <span className="text-white font-bold">{selectedReport.ph}</span></div>
                  <div>TDS: <span className="text-white font-bold">{selectedReport.tds} ppm</span></div>
                  <div>Turbidity: <span className="text-white font-bold">{selectedReport.turbidity} NTU</span></div>
                  <div>E. coli: <span className="text-white font-bold">{selectedReport.eColi}</span></div>
                  <div>Coliforms: <span className="text-white font-bold">{selectedReport.coliform}</span></div>
                  <div>Signatory: <span className="text-white font-bold">{selectedReport.certifiedBy}</span></div>
                </div>
              </div>

              <p className="text-[11px] text-zinc-400 italic">&quot;{selectedReport.notes}&quot;</p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
              <Button size="sm" variant="outline" onClick={() => setSelectedReport(null)}>
                Close
              </Button>
              <Button size="sm" onClick={() => window.print()}>
                Print Certificate
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add New Test Form */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateTest}
            className="bg-zinc-950 border border-zinc-700 rounded-xl max-w-md w-full p-6 space-y-4 text-white"
          >
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <h3 className="text-base font-bold">Log New Laboratory Assay</h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-mono text-zinc-400 block mb-1">Laboratory Facility</label>
                <input
                  type="text"
                  required
                  value={labName}
                  onChange={(e) => setLabName(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded p-2 text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[11px] font-mono text-zinc-400 block mb-1">pH</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={ph}
                    onChange={(e) => setPh(e.target.value)}
                    className="w-full bg-black border border-zinc-800 rounded p-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-zinc-400 block mb-1">TDS (ppm)</label>
                  <input
                    type="number"
                    required
                    value={tds}
                    onChange={(e) => setTds(e.target.value)}
                    className="w-full bg-black border border-zinc-800 rounded p-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-zinc-400 block mb-1">Turbidity (NTU)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={turbidity}
                    onChange={(e) => setTurbidity(e.target.value)}
                    className="w-full bg-black border border-zinc-800 rounded p-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-mono text-zinc-400 block mb-1">E. coli</label>
                  <select
                    value={eColi}
                    onChange={(e) => setEColi(e.target.value as any)}
                    className="w-full bg-black border border-zinc-800 rounded p-2 text-white"
                  >
                    <option value="NEGATIVE">NEGATIVE</option>
                    <option value="POSITIVE">POSITIVE</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-mono text-zinc-400 block mb-1">Coliform</label>
                  <select
                    value={coliform}
                    onChange={(e) => setColiform(e.target.value as any)}
                    className="w-full bg-black border border-zinc-800 rounded p-2 text-white"
                  >
                    <option value="NEGATIVE">NEGATIVE</option>
                    <option value="POSITIVE">POSITIVE</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono text-zinc-400 block mb-1">Certified Chemist</label>
                <input
                  type="text"
                  required
                  value={certifiedBy}
                  onChange={(e) => setCertifiedBy(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded p-2 text-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-zinc-400 block mb-1">Lab Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded p-2 text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
              <Button type="button" size="sm" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Save & Verify
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
