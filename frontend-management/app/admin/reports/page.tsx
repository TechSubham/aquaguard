'use client';

import React, { useState } from 'react';
import { useAquaGuard } from '@/lib/store';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  FileText,
  Download,
  Printer,
  Calendar,
  Building,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  FlaskConical,
  Droplet,
  Layers,
} from 'lucide-react';

export default function ReportsPage() {
  const { tanks, selectedTank, alerts, waterTests, complaints, incident } = useAquaGuard();

  const [selectedHostel, setSelectedHostel] = useState('NSUT Campus');
  const [selectedBlock, setSelectedBlock] = useState('Block A');
  const [selectedTankCode, setSelectedTankCode] = useState(selectedTank.code);
  const [reportPeriod, setReportPeriod] = useState('01 Oct 2026 – 07 Oct 2026');

  // Aggregated Report Metrics matching user prompt section 13
  const reportMetrics = {
    avgPh: 6.84,
    avgTds: 342,
    avgTurbidity: 2.41,
    alertsCount: alerts.length,
    incidentsCount: 1,
    maintenanceEvents: 2,
    labTestsCount: waterTests.length,
    complaintsCount: complaints.length,
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Generate text/csv report or trigger download notification
    const content = `AquaGuard Water Quality Report\nHostel: ${selectedHostel}\nBlock: ${selectedBlock}\nTank: ${selectedTankCode}\nPeriod: ${reportPeriod}\nAvg pH: ${reportMetrics.avgPh}\nAvg TDS: ${reportMetrics.avgTds}\nAvg Turbidity: ${reportMetrics.avgTurbidity}\nAlerts: ${reportMetrics.alertsCount}\nIncidents: ${reportMetrics.incidentsCount}\n`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `AquaGuard_Report_${selectedTankCode}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono px-2 py-0.5 rounded border border-zinc-700 bg-zinc-900 text-zinc-300">
              Audit & Compliance Documentation
            </span>
            <span className="text-xs font-mono text-zinc-500">Automated Generation</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <FileText className="h-6 w-6 text-white" />
            Water Quality Reports
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Consolidate IoT historical telemetry, incident responses, and lab certificates into printable compliance dossiers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={handleDownload} className="flex items-center gap-1.5">
            <Download className="h-3.5 w-3.5" />
            Download Data
          </Button>
          <Button size="sm" onClick={handlePrint} className="flex items-center gap-1.5">
            <Printer className="h-3.5 w-3.5" />
            Print / PDF Report
          </Button>
        </div>
      </div>

      {/* Report Filter Controls */}
      <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
        <div>
          <label className="text-[10px] font-mono uppercase text-zinc-500 block mb-1">Hostel</label>
          <select
            value={selectedHostel}
            onChange={(e) => setSelectedHostel(e.target.value)}
            className="w-full bg-black border border-zinc-800 rounded p-2 text-white"
          >
            <option value="NSUT Campus">NSUT Campus</option>
            <option value="Hostel Boys A">Hostel Boys A</option>
            <option value="Hostel Girls B">Hostel Girls B</option>
          </select>
        </div>

        <div>
          <label className="text-[10px] font-mono uppercase text-zinc-500 block mb-1">Block</label>
          <select
            value={selectedBlock}
            onChange={(e) => setSelectedBlock(e.target.value)}
            className="w-full bg-black border border-zinc-800 rounded p-2 text-white"
          >
            <option value="Block A">Block A</option>
            <option value="Block B">Block B</option>
            <option value="Block C">Block C</option>
          </select>
        </div>

        <div>
          <label className="text-[10px] font-mono uppercase text-zinc-500 block mb-1">Tank</label>
          <select
            value={selectedTankCode}
            onChange={(e) => setSelectedTankCode(e.target.value)}
            className="w-full bg-black border border-zinc-800 rounded p-2 text-white"
          >
            {tanks.map((t) => (
              <option key={t.id} value={t.code}>
                {t.code} ({t.name})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[10px] font-mono uppercase text-zinc-500 block mb-1">Reporting Period</label>
          <select
            value={reportPeriod}
            onChange={(e) => setReportPeriod(e.target.value)}
            className="w-full bg-black border border-zinc-800 rounded p-2 text-white"
          >
            <option value="01 Oct 2026 – 07 Oct 2026">01 Oct 2026 – 07 Oct 2026 (7 Days)</option>
            <option value="Past 24 Hours">Past 24 Hours</option>
            <option value="Past 30 Days">Past 30 Days</option>
          </select>
        </div>
      </div>

      {/* Printable Report Dossier Card (Matches section 13 schema) */}
      <div className="border border-zinc-700 rounded-xl bg-black p-8 max-w-4xl mx-auto space-y-8 print:border-none print:p-0">
        {/* Document Header */}
        <div className="border-b border-zinc-800 pb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="text-[11px] font-mono tracking-widest uppercase text-zinc-400">
              OFFICIAL SANITATION AUDIT
            </div>
            <h2 className="text-2xl font-bold font-mono tracking-tight text-white mt-1">
              AquaGuard Water Quality Report
            </h2>
            <div className="text-xs text-zinc-400 mt-2 space-y-0.5 font-mono">
              <div>Hostel: <span className="text-white font-bold">{selectedHostel}</span></div>
              <div>Block: <span className="text-white font-bold">{selectedBlock}</span></div>
              <div>Tank: <span className="text-white font-bold">{selectedTankCode}</span></div>
            </div>
          </div>

          <div className="text-right font-mono text-xs text-zinc-400 space-y-1">
            <div className="text-white font-bold text-sm">Dossier #AQ-REP-2026-088</div>
            <div>Reporting Period: {reportPeriod}</div>
            <div>Generated: 08 Oct 2026, 02:00 IST</div>
            <div className="pt-2">
              <Badge variant="outline" className="font-mono text-[10px]">
                STATUS: AUDIT VERIFIED
              </Badge>
            </div>
          </div>
        </div>

        {/* Section 1: Chemical & Physical Averages */}
        <div className="space-y-3">
          <h3 className="text-xs font-mono uppercase font-bold tracking-wider text-zinc-400">
            1. Temporal Average Telemetry (Sensor Array)
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950">
              <span className="text-[10px] font-mono uppercase text-zinc-500 block">Average pH</span>
              <div className="text-2xl font-extrabold font-mono text-white mt-1">
                {reportMetrics.avgPh}
              </div>
              <span className="text-[10px] text-zinc-400">Target: 6.5 – 8.5 (IS 10500)</span>
            </div>

            <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950">
              <span className="text-[10px] font-mono uppercase text-zinc-500 block">Average TDS</span>
              <div className="text-2xl font-extrabold font-mono text-white mt-1">
                {reportMetrics.avgTds} <span className="text-xs font-normal text-zinc-400">ppm</span>
              </div>
              <span className="text-[10px] text-zinc-400">Target: &lt; 500 ppm</span>
            </div>

            <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950">
              <span className="text-[10px] font-mono uppercase text-zinc-500 block">Average Turbidity</span>
              <div className="text-2xl font-extrabold font-mono text-white mt-1">
                {reportMetrics.avgTurbidity} <span className="text-xs font-normal text-zinc-400">NTU</span>
              </div>
              <span className="text-[10px] text-zinc-400">Target: &lt; 1.0 NTU</span>
            </div>
          </div>
        </div>

        {/* Section 2: Health & Safety Incident Counts */}
        <div className="space-y-3">
          <h3 className="text-xs font-mono uppercase font-bold tracking-wider text-zinc-400">
            2. Campus Incident & Maintenance Statistics
          </h3>
          <div className="grid grid-cols-4 gap-3">
            <div className="p-3.5 rounded-lg border border-zinc-800 bg-zinc-950 text-center">
              <span className="text-[10px] font-mono uppercase text-zinc-500 block">Number of Alerts</span>
              <div className="text-xl font-bold font-mono text-white mt-1">
                {reportMetrics.alertsCount}
              </div>
            </div>

            <div className="p-3.5 rounded-lg border border-zinc-800 bg-zinc-950 text-center">
              <span className="text-[10px] font-mono uppercase text-zinc-500 block">Number of Incidents</span>
              <div className="text-xl font-bold font-mono text-white mt-1">
                {reportMetrics.incidentsCount}
              </div>
            </div>

            <div className="p-3.5 rounded-lg border border-zinc-800 bg-zinc-950 text-center">
              <span className="text-[10px] font-mono uppercase text-zinc-500 block">Maintenance Events</span>
              <div className="text-xl font-bold font-mono text-white mt-1">
                {reportMetrics.maintenanceEvents}
              </div>
            </div>

            <div className="p-3.5 rounded-lg border border-zinc-800 bg-zinc-950 text-center">
              <span className="text-[10px] font-mono uppercase text-zinc-500 block">Student Tickets</span>
              <div className="text-xl font-bold font-mono text-white mt-1">
                {reportMetrics.complaintsCount}
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Laboratory Certification Summary */}
        <div className="space-y-3">
          <h3 className="text-xs font-mono uppercase font-bold tracking-wider text-zinc-400">
            3. Independent Laboratory Assays
          </h3>
          <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950 space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <span className="text-white font-bold">Central Public Health Engineering Lab Certification</span>
              <Badge variant="secondary">PASSED • POTABLE</Badge>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-zinc-300 pt-1">
              <div>Assay Date: 06 Oct 2026</div>
              <div>E. coli: Negative</div>
              <div>Total Coliform: Negative</div>
              <div>Report: AQUA-CERT-8812</div>
            </div>
          </div>
        </div>

        {/* Certification Signatures */}
        <div className="pt-8 border-t border-zinc-800 grid grid-cols-2 gap-8 text-xs font-mono">
          <div className="space-y-6">
            <div className="text-zinc-500">Prepared by:</div>
            <div className="border-b border-zinc-700 w-48 pb-1 text-white font-bold">
              AquaGuard Autonomous Core
            </div>
            <div className="text-[10px] text-zinc-500">Automated Telemetry Aggregator</div>
          </div>

          <div className="space-y-6">
            <div className="text-zinc-500">Authorized Officer:</div>
            <div className="border-b border-zinc-700 w-48 pb-1 text-white font-bold">
              Chief Facilities Officer
            </div>
            <div className="text-[10px] text-zinc-500">NSUT Campus Administration</div>
          </div>
        </div>
      </div>
    </div>
  );
}
