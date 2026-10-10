'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAquaGuard } from '@/lib/store';
import { timeAgo, formatClockTime } from '@/lib/utils';
import {
  SlidersHorizontal,
  ChevronDown,
  Download,
  Search,
  MoreVertical,
  Plus,
  Wifi,
  ChevronRight,
  BrainCircuit,
  Radio,
  RefreshCw,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Droplets,
  Layers,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const {
    selectedTank,
    selectedHostel,
    hostels,
    setSelectedHostelId,
    tanks,
    setSelectedTankId,
    currentReading,
    historyReadings,
    alerts,
    aiPrediction,
    isLiveUpdating,
    setIsLiveUpdating,
    refreshData,
    lastRefreshTime,
    role,
  } = useAquaGuard();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTimeframe, setSelectedTimeframe] = useState<'24h' | '7d' | '30d'>('24h');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [accountsExpanded, setAccountsExpanded] = useState(true);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const latestReadingLabel = currentReading.recorded_at
    ? timeAgo(currentReading.recorded_at)
    : 'Live telemetry active';

  const unreadAlerts = alerts.filter((a) => a.status !== 'RESOLVED');

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* 1. Header Greeting & Primary Action Pill (Matching Reference UI) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#0B1B22]">
            Good morning, Ranjeet!
          </h1>
          {/* <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
            Campus water facilities operational • All IoT nodes reporting nominal flow
          </p> */}
        </div>

        <div className="flex items-center gap-3">
          <Link href="/admin/water-tests">
            <button className="rounded-full bg-[#0B1B22] hover:bg-black text-white font-semibold text-xs sm:text-sm px-5 py-2.5 shadow-sm transition-all flex items-center gap-2 group cursor-pointer">
              <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" />
              <span>New water sample test</span>
            </button>
          </Link>
        </div>
      </div>

      {/* 2. Secondary Filter & Action Toolbar (Matching Reference UI) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
        {/* Left Pills: Filter, Dropdown, Export */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* <button
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            className="flex items-center gap-2 rounded-full bg-white border border-slate-200/90 px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:border-slate-300 shadow-sm transition-all cursor-pointer"
          >
            <SlidersHorizontal className="h-3.5 w-3.5 text-slate-500" />
            <span>Filter</span>
          </button> */}

          <div className="relative">
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="flex items-center gap-2 rounded-full bg-white border border-slate-200/90 px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:border-slate-300 shadow-sm transition-all cursor-pointer"
            >
              <span>{selectedHostel.code}: {selectedTank.code}</span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>

            {showFilterDropdown && (
              <div className="absolute left-0 top-full mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl z-30 animate-in fade-in zoom-in-95">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1.5">
                  Filter by Facility & Tank
                </div>
                <div className="space-y-1.5 max-h-56 overflow-y-auto">
                  {tanks.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setSelectedTankId(t.id);
                        setShowFilterDropdown(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs font-medium transition-colors ${
                        t.id === selectedTank.id
                          ? 'bg-[#0284C7]/10 text-[#0284C7] font-bold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{t.name} ({t.block})</span>
                      <span className="text-[10px] text-slate-400 font-mono">{t.waterLevelPercent}%</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* <button
            onClick={() => refreshData()}
            className="flex items-center gap-2 rounded-full bg-white border border-slate-200/90 px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:border-slate-300 shadow-sm transition-all cursor-pointer"
            title="Export Telemetry Log"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            <span>Export</span>
          </button> */}

          {/* Live Stream Toggle Pill */}
          <button
            onClick={() => setIsLiveUpdating(!isLiveUpdating)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all shadow-sm ${
              isLiveUpdating
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-white text-slate-500 border border-slate-200'
            }`}
          >
            <Radio className={`h-3 w-3 ${isLiveUpdating ? 'text-emerald-500 animate-pulse' : 'text-slate-400'}`} />
            <span>{isLiveUpdating ? 'Live: 5s' : 'Paused'}</span>
          </button>
        </div>

        {/* Right Pills: Search and More Menu */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search tanks, parameters..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-full bg-white border border-slate-200/90 pl-9 pr-4 py-2 text-xs font-medium text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#0284C7] w-56 sm:w-64 shadow-sm transition-all"
            />
          </div>

          <button
            onClick={() => refreshData()}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white border border-slate-200/90 text-slate-500 hover:text-slate-800 hover:border-slate-300 shadow-sm transition-all cursor-pointer"
            title="Refresh"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 3. Main Dashboard Grid (Directly Inspired by Reference UI Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ========================================================= */}
        {/* COLUMN 1 (Left 4 cols): "My accounts" -> Water Reserves & Pass */}
        {/* ========================================================= */}
        <div className="lg:col-span-4 space-y-6">
          <div className="card-elevated p-6 space-y-5 bg-white">
            {/* Card Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                My reserves
              </h2>
              <button
                onClick={() => refreshData()}
                className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
              >
                <Plus className="h-3 w-3" />
                <span>Add node</span>
              </button>
            </div>

            {/* Smart Tank Digital Card Graphic (Water Reservoir Reserve Node) */}
            <div className="aspect-[1.58/1] rounded-2xl overflow-hidden shadow-lg border border-slate-200/70 relative flex select-none">
              {/* Left 38%: Electric Ocean Gradient */}
              <div className="w-[38%] bg-gradient-to-br from-[#0284C7] to-[#0369A1] p-4 flex flex-col justify-between text-white relative">
                <div className="flex items-center gap-1">
                  <div className="h-6 w-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Droplets className="h-3.5 w-3.5 text-white" />
                  </div>
                </div>
                <div className="text-[10px] font-mono tracking-wider text-sky-100 font-semibold uppercase">
                  Reserve Node
                </div>
              </div>

              {/* Right 62%: Frosted Silver / White Surface */}
              <div className="flex-1 bg-gradient-to-br from-[#FAFBFD] to-[#F1F5F9] p-4 flex flex-col justify-between text-slate-800">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold tracking-tight text-xs uppercase text-slate-900">
                    AQUAGUARD
                  </span>
                  <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    ONLINE
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">
                    PRIMARY OVERHEAD TANK
                  </div>
                  <div className="text-sm font-mono font-bold text-slate-900">
                    {selectedTank.code}
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span>CAPACITY: 10,000 L</span>
                  <span className="font-semibold text-slate-700">{selectedTank.block}</span>
                </div>
              </div>
            </div>

            {/* Net Worth / Total Reserves Header */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                <Layers className="h-4 w-4 text-slate-400" />
                <span>Net reserves</span>
              </div>
              <span className="text-lg font-bold font-mono text-slate-900 tracking-tight">
                16,531.54 L
              </span>
            </div>

            {/* Hierarchical Reserve Breakdown */}
            <div className="space-y-3 pt-1 text-xs">
              {/* Primary Storage */}
              <div className="flex items-center justify-between font-medium text-slate-700">
                <div className="flex items-center gap-2">
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                  <span>Main storage</span>
                </div>
                <span className="font-mono font-bold text-slate-900">9,681.49 L</span>
              </div>

              {/* Potable & Checking (Expandable) */}
              <div className="space-y-2">
                <button
                  onClick={() => setAccountsExpanded(!accountsExpanded)}
                  className="w-full flex items-center justify-between font-medium text-slate-700 hover:text-slate-900 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <ChevronDown
                      className={`h-3.5 w-3.5 text-slate-400 transition-transform ${
                        accountsExpanded ? '' : '-rotate-90'
                      }`}
                    />
                    <span className="font-semibold text-slate-900">Potable & buffer</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900">7,583.00 L</span>
                </button>

                {accountsExpanded && (
                  <div className="pl-6 space-y-2 text-slate-500 text-[11px] animate-in fade-in duration-100">
                    <div className="flex items-center justify-between">
                      <span>RO Clean Buffer</span>
                      <span className="font-mono font-medium text-slate-700">5,299.52 L</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Reserve target</span>
                      <span className="font-mono font-medium text-slate-700">958.00 L</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Available draw</span>
                      <span className="font-mono font-medium text-slate-700">7,602.15 L</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* COLUMN 2 & 3 (Right 8 cols): 2x2 Grid of Analytical Cards */}
        {/* ========================================================= */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* --------------------------------------------------------- */}
          {/* CARD 2: "Spending plan" -> Purity Spectrum & Pill Bar Chart */}
          {/* --------------------------------------------------------- */}
          <div className="card-elevated p-6 space-y-4 bg-white flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                  Purity spectrum
                </h2>
                <Link
                  href="/admin/water-quality"
                  className="text-xs font-semibold text-slate-500 hover:text-[#0284C7] flex items-center gap-1"
                >
                  <span>View details</span>
                  <ChevronRight className="h-3 w-3" />
                </Link>
              </div>

              {/* Big Metric Display */}
              <div className="mt-4 flex items-baseline gap-3">
                <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 font-mono">
                  98.4%
                </span>
                <span className="text-xs text-slate-500 font-medium leading-tight">
                  Potability index<br />for current cycle
                </span>
              </div>
            </div>

            {/* Dynamic Pill Bars (Visualized matching reference with values on top) */}
            <div className="pt-4 flex items-end justify-between gap-3 min-h-[140px]">
              {/* Bar 1: pH Level (Charcoal/Black Pill Bar) */}
              <div className="flex-1 flex flex-col items-center gap-2">
                <span className="text-[11px] font-mono font-bold text-slate-700">
                  {currentReading.ph.toFixed(2)}
                </span>
                <div className="w-full bg-[#0B1B22] rounded-2xl h-24 flex items-end justify-center pb-2 transition-all hover:scale-105">
                  <span className="text-[10px] font-semibold text-slate-300">pH</span>
                </div>
              </div>

              {/* Bar 2: TDS (Electric Ocean Blue Pill Bar with badge) */}
              <div className="flex-1 flex flex-col items-center gap-2 relative">
                <span className="text-[11px] font-mono font-bold text-slate-700">
                  {currentReading.tds} ppm
                </span>
                <div className="w-full bg-gradient-to-t from-[#0284C7] to-[#0EA5E9] rounded-2xl h-16 relative flex items-center justify-center transition-all hover:scale-105 shadow-sm">
                  {/* +10% Style Floating Badge on the bar */}
                  <div className="absolute -top-3.5 px-2 py-0.5 rounded-full bg-slate-900 text-white text-[9px] font-extrabold shadow-sm">
                    +8%
                  </div>
                  <span className="text-[10px] font-semibold text-white mt-1">TDS</span>
                </div>
              </div>

              {/* Bar 3: Turbidity (Subtle striped / clean pill bar) */}
              <div className="flex-1 flex flex-col items-center gap-2">
                <span className="text-[11px] font-mono font-bold text-slate-700">
                  {currentReading.turbidity.toFixed(2)} NTU
                </span>
                <div className="w-full bg-slate-100 border border-slate-200/90 rounded-2xl h-20 flex items-end justify-center pb-2 transition-all hover:scale-105">
                  <span className="text-[10px] font-semibold text-slate-600">Turb</span>
                </div>
              </div>
            </div>
          </div>

          {/* --------------------------------------------------------- */}
          {/* CARD 3: Semicircular Gauge Arc Meter (Available & Safe)     */}
          {/* (PURPLE COLOR REMOVED -> REPLACED WITH OCEAN CYAN & EMERALD) */}
          {/* --------------------------------------------------------- */}
          <div className="card-elevated p-6 bg-white flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Safety & potability
              </h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Safe to Drink
              </span>
            </div>

            {/* Seamless Semicircular Potability Gauge */}
            <div className="py-2 flex flex-col items-center justify-center">
              <div className="relative w-48 h-28 flex items-center justify-center">
                <svg viewBox="0 0 200 110" className="w-full h-full select-none overflow-visible">
                  <defs>
                    <linearGradient id="smoothPotabilityGradient" x1="0%" y1="100%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#EF4444" />
                      <stop offset="25%" stopColor="#EF4444" />
                      <stop offset="42%" stopColor="#F59E0B" />
                      <stop offset="62%" stopColor="#F59E0B" />
                      <stop offset="78%" stopColor="#0284C7" />
                      <stop offset="100%" stopColor="#0284C7" />
                    </linearGradient>
                  </defs>
                  {/* Subtle Background Track */}
                  <path
                    d="M 22 95 A 78 78 0 0 1 178 95"
                    fill="none"
                    stroke="#F1F5F9"
                    strokeWidth="14"
                    strokeLinecap="round"
                  />
                  {/* Seamless Smooth Continuous Curve */}
                  <path
                    d="M 22 95 A 78 78 0 0 1 178 95"
                    fill="none"
                    stroke="url(#smoothPotabilityGradient)"
                    strokeWidth="14"
                    strokeLinecap="round"
                  />
                </svg>

                {/* Center Bold Metric */}
                <div className="absolute bottom-1 text-center flex flex-col items-center">
                  <div className="text-3xl font-extrabold font-mono text-slate-900 tracking-tight">
                    4,682 L
                  </div>
                  <div className="text-[11px] font-semibold text-slate-400 -mt-0.5">
                    Safe Potable Available
                  </div>
                </div>
              </div>

              {/* Legend Dots (Replacing purple with ocean blue) */}
              <div className="mt-4 flex items-center justify-center gap-4 text-xs font-semibold text-slate-600">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#EF4444]" />
                  <span>Critical &lt; 20%</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#F59E0B]" />
                  <span>Cycle</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#0284C7]" />
                  <span>Potable</span>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-center text-slate-400 font-medium">
              Standard IS 10500 potable water quality compliance verified
            </div>
          </div>

          {/* --------------------------------------------------------- */}
          {/* CARD 4: "Income" -> Telemetry Inflow & Smooth Wave Curve  */}
          {/* --------------------------------------------------------- */}
          <div className="card-elevated p-6 space-y-4 bg-white flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Inflow & stability
                </span>
                <span className="text-xs font-semibold text-slate-500 hover:text-slate-900 cursor-pointer">
                  Past 24 hours ▾
                </span>
              </div>

              <div className="mt-2 flex items-baseline gap-3">
                <span className="text-3xl font-extrabold font-mono text-slate-900 tracking-tight">
                  3,800 L
                </span>
                <div className="flex items-center gap-0.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                  <ArrowUpRight className="h-3 w-3" />
                  <span>16.4%</span>
                </div>
              </div>
            </div>

            {/* Smooth Wave Curve with Milestone Point Dot */}
            <div className="relative w-full h-24 select-none pt-2">
              <svg viewBox="0 0 300 80" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="waveGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0284C7" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#0284C7" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Smooth wave area fill */}
                <path
                  d="M 0 65 C 60 65, 120 50, 180 30 C 230 15, 270 10, 300 5 L 300 80 L 0 80 Z"
                  fill="url(#waveGradient)"
                />

                {/* Smooth stroke line */}
                <path
                  d="M 0 65 C 60 65, 120 50, 180 30 C 230 15, 270 10, 300 5"
                  fill="none"
                  stroke="#0284C7"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Milestone Dot with Date Label */}
                <g transform="translate(180, 30)">
                  <circle cx="0" cy="0" r="4.5" fill="#FFFFFF" stroke="#0284C7" strokeWidth="2.5" />
                  <rect
                    x="-20"
                    y="-24"
                    width="40"
                    height="18"
                    rx="9"
                    fill="#0B1B22"
                  />
                  <text
                    x="0"
                    y="-12"
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontSize="9"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    14:00
                  </text>
                </g>
              </svg>
            </div>
          </div>

          {/* --------------------------------------------------------- */}
          {/* CARD 5: "Fitness first" -> AI Risk Projection Accent Card  */}
          {/* (PURPLE REMOVED -> REPLACED WITH DEEP ELECTRIC OCEAN BLUE) */}
          {/* --------------------------------------------------------- */}
          <Link href="/admin/ai-prediction" className="group block">
            <div className="card-elevated p-6 bg-gradient-to-br from-[#0284C7] via-[#0369A1] to-[#0A4F88] text-white flex flex-col justify-between transition-all hover:shadow-xl hover:scale-[1.01] cursor-pointer min-h-[190px]">
              <div>
                <div className="flex items-center justify-between text-sky-100">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                    <BrainCircuit className="h-4 w-4 text-sky-200" />
                    <span>AI Risk projection</span>
                  </div>
                  <span className="text-xs text-sky-200 group-hover:text-white transition-colors">
                    Past 24 hours ▾
                  </span>
                </div>

                <div className="mt-3 flex items-baseline gap-3">
                  <span className="text-3xl font-extrabold font-mono text-white tracking-tight">
                    {aiPrediction.currentRiskPercent}%
                  </span>
                  <div className="flex items-center gap-0.5 rounded-full bg-white/20 backdrop-blur-sm px-2 py-0.5 text-[11px] font-bold text-white">
                    <ArrowDownRight className="h-3 w-3" />
                    <span>21.8% Risk</span>
                  </div>
                </div>
              </div>

              {/* Glowing Wave Curve with Milestone Point Dot */}
              <div className="relative w-full h-16 select-none pt-2">
                <svg viewBox="0 0 300 60" className="w-full h-full overflow-visible">
                  {/* Glowing cyan curve line */}
                  <path
                    d="M 0 50 C 70 48, 140 38, 200 20 C 250 8, 280 5, 300 3"
                    fill="none"
                    stroke="#38BDF8"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />

                  {/* Highlight Point Dot */}
                  <g transform="translate(200, 20)">
                    <circle cx="0" cy="0" r="4" fill="#FFFFFF" stroke="#38BDF8" strokeWidth="2.5" />
                    <rect
                      x="-18"
                      y="-22"
                      width="36"
                      height="16"
                      rx="8"
                      fill="#FFFFFF"
                    />
                    <text
                      x="0"
                      y="-11"
                      textAnchor="middle"
                      fill="#0369A1"
                      fontSize="8"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      Safe
                    </text>
                  </g>
                </svg>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* 4. Active Alerts & Facility Nodes Diagnostic Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
        {/* Alerts Feed */}
        <div className="lg:col-span-8 card-elevated p-6 space-y-4 bg-white">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Active alerts & telemetry anomalies
              </h3>
              <p className="text-xs text-slate-500">
                Real-time rule engine & continuous sensor diagnostics
              </p>
            </div>
            <Link href="/admin/alerts">
              <button className="rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold px-4 py-2 transition-colors">
                View all ({alerts.length})
              </button>
            </Link>
          </div>

          <div className="space-y-3">
            {unreadAlerts.slice(0, 3).map((alert) => (
              <div
                key={alert.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        alert.severity === 'CRITICAL' ? 'bg-red-500' : 'bg-amber-500'
                      }`}
                    />
                    <span className="font-bold text-xs text-slate-900">{alert.title}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-slate-200 font-bold text-slate-700">
                      {alert.tankName}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-1">{alert.description}</p>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap">
                    {alert.timestamp}
                  </span>
                  <Link href="/admin/alerts">
                    <button className="rounded-full bg-white border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-100 transition-colors">
                      Investigate
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Node Connectivity Card */}
        <div className="lg:col-span-4 card-elevated p-6 space-y-4 bg-white">
          <div className="pb-2 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">
              Campus hardware status
            </h3>
            <p className="text-xs text-slate-500">
              IoT ESP32 gateway telemetry
            </p>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-600">Optical sensor array</span>
              <span className="flex items-center gap-1.5 font-bold text-emerald-600">
                <CheckCircle2 className="h-4 w-4" /> Online
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-600">MQTT bridge (port 1883)</span>
              <span className="flex items-center gap-1.5 font-bold text-emerald-600">
                <CheckCircle2 className="h-4 w-4" /> Connected
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-600">Calibration certificate</span>
              <span className="font-semibold text-slate-800">ISO-17025 Valid</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}