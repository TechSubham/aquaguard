'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { SensorReading } from '@/lib/types';
import { formatClockTime, formatNumber, useIsClientMounted } from '@/lib/utils';
import { Activity, Clock } from 'lucide-react';

interface WaterQualityChartProps {
  data: SensorReading[];
  title?: string;
  defaultMetric?: 'turbidity' | 'tds' | 'ph' | 'temperature';
}

type MetricKey = 'turbidity' | 'tds' | 'ph' | 'temperature';

interface MetricConfig {
  label: string;
  title: string;
  unit: string;
  threshold?: number;
  thresholdLabel?: string;
  color: string;
  decimals: number;
}

const METRICS: Record<MetricKey, MetricConfig> = {
  turbidity: {
    label: 'Turbidity',
    title: 'Turbidity Sensor History (Optical Backscatter)',
    unit: 'NTU',
    threshold: 5.0,
    thresholdLabel: 'Safety Limit (5.0 NTU)',
    color: '#0284C7',
    decimals: 2,
  },
  tds: {
    label: 'TDS',
    title: 'Total Dissolved Solids (TDS) History (Conductivity Cell)',
    unit: 'ppm',
    threshold: 500,
    thresholdLabel: 'Acceptable Limit (500 ppm)',
    color: '#0284C7',
    decimals: 0,
  },
  ph: {
    label: 'pH Level',
    title: 'pH History (Electrochemical Probe)',
    unit: 'pH',
    threshold: 6.5,
    thresholdLabel: 'Lower Boundary (6.5 pH)',
    color: '#0284C7',
    decimals: 2,
  },
  temperature: {
    label: 'Temperature',
    title: 'Temperature History (PT100 RTD Probe)',
    unit: '°C',
    threshold: 28,
    thresholdLabel: 'Threshold (28 °C)',
    color: '#0284C7',
    decimals: 1,
  },
};

export function WaterQualityChart({ data, title, defaultMetric = 'turbidity' }: WaterQualityChartProps) {
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>(defaultMetric);
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; val: number; time: string } | null>(null);
  const isMounted = useIsClientMounted();

  if (!data || data.length === 0) {
    return (
      <Card className="p-8 text-center text-slate-500 font-mono text-xs bg-white">
        No telemetry history recorded for selected sensor node.
      </Card>
    );
  }

  const metricConfig = METRICS[selectedMetric];
  const chartTitle = title || metricConfig.title;
  const values = data.map((d) => d[selectedMetric]);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal || 1;
  const padding = range * 0.15;
  const chartMin = Math.max(0, minVal - padding);
  const chartMax = maxVal + padding;

  // Chart dimensions in SVG viewBox
  const width = 800;
  const height = 260;
  const padLeft = 55;
  const padRight = 20;
  const padTop = 25;
  const padBottom = 35;
  const plotWidth = width - padLeft - padRight;
  const plotHeight = height - padTop - padBottom;

  const points = data.map((d, i) => {
    const x = padLeft + (i / (data.length - 1)) * plotWidth;
    const y = padTop + plotHeight - ((d[selectedMetric] - chartMin) / (chartMax - chartMin)) * plotHeight;
    return { x, y, val: d[selectedMetric], time: d.recorded_at };
  });

  const pathD = points.reduce((acc, curr, idx) => {
    return idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${padTop + plotHeight} L ${points[0].x} ${padTop + plotHeight} Z`;

  // Threshold line coordinate if within chart bounds
  const thresholdY =
    metricConfig.threshold && metricConfig.threshold >= chartMin && metricConfig.threshold <= chartMax
      ? padTop + plotHeight - ((metricConfig.threshold - chartMin) / (chartMax - chartMin)) * plotHeight
      : null;

  return (
    <Card className="border border-slate-200/90 bg-white shadow-sm">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 gap-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-[#0284C7]" />
            <CardTitle className="text-base font-bold text-slate-900">{chartTitle}</CardTitle>
          </div>
          <CardDescription className="text-xs text-slate-900 mt-0.5">
            24-hour continuous sensor timeline • Automated 5-second delta tracking
          </CardDescription>
        </div>

        {/* Metric Selector Tabs */}
        <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1 overflow-x-auto shadow-inner">
          {(Object.keys(METRICS) as MetricKey[]).map((key) => (
            <button
              key={key}
              onClick={() => {
                setSelectedMetric(key);
                setHoveredPoint(null);
              }}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                selectedMetric === key
                  ? 'bg-[#0284C7] text-white font-bold shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white'
              }`}
            >
              {METRICS[key].label}
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        {/* Metric Summary Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 pb-3 border-b border-slate-100 font-mono text-xs">
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Current</span>
            <span className="text-base font-bold text-[#0284C7]">
              {formatNumber(values[values.length - 1], metricConfig.decimals)} {metricConfig.unit}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">24h Peak</span>
            <span className="text-base font-bold text-slate-800">
              {formatNumber(maxVal, metricConfig.decimals)} {metricConfig.unit}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">24h Minimum</span>
            <span className="text-base font-bold text-slate-800">
              {formatNumber(minVal, metricConfig.decimals)} {metricConfig.unit}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Safety Threshold</span>
            <span className="text-base font-bold text-slate-600">
              {metricConfig.threshold ? `${metricConfig.threshold} ${metricConfig.unit}` : 'Standard'}
            </span>
          </div>
        </div>

        {/* SVG Chart Canvas */}
        <div className="relative w-full overflow-hidden">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto select-none overflow-visible">
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0284C7" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#0284C7" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
              const y = padTop + plotHeight * pct;
              const val = chartMax - pct * (chartMax - chartMin);
              return (
                <g key={i}>
                  <line
                    x1={padLeft}
                    y1={y}
                    x2={width - padRight}
                    y2={y}
                    stroke="#E2E8F0"
                    strokeDasharray="3 3"
                    strokeWidth="1"
                  />
                  <text
                    x={padLeft - 8}
                    y={y + 4}
                    textAnchor="end"
                    fill="#64748B"
                    fontSize="10"
                    fontFamily="monospace"
                  >
                    {formatNumber(val, metricConfig.decimals)}
                  </text>
                </g>
              );
            })}

            {/* Critical safety threshold line */}
            {thresholdY !== null && (
              <g>
                <line
                  x1={padLeft}
                  y1={thresholdY}
                  x2={width - padRight}
                  y2={thresholdY}
                  stroke="#EF4444"
                  strokeDasharray="4 4"
                  strokeWidth="1.5"
                />
                <text
                  x={width - padRight - 8}
                  y={thresholdY - 6}
                  textAnchor="end"
                  fill="#EF4444"
                  fontSize="9"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {metricConfig.thresholdLabel}
                </text>
              </g>
            )}

            {/* Area Fill */}
            <path d={areaD} fill="url(#areaGradient)" />

            {/* Trend Line (Vibrant Ocean Azure Blue) */}
            <path
              d={pathD}
              fill="none"
              stroke="#0284C7"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Interactive Data points */}
            {points.map((pt, i) => (
              <g
                key={i}
                onMouseEnter={() => setHoveredPoint(pt)}
                className="cursor-pointer group"
              >
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="4"
                  fill="#0284C7"
                  stroke="#ffffff"
                  strokeWidth="2"
                  className="transition-transform group-hover:scale-150"
                />
              </g>
            ))}

            {/* Hover Tooltip Overlay */}
            {hoveredPoint && (
              <g>
                <line
                  x1={hoveredPoint.x}
                  y1={padTop}
                  x2={hoveredPoint.x}
                  y2={padTop + plotHeight}
                  stroke="#94A3B8"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />
                <circle cx={hoveredPoint.x} cy={hoveredPoint.y} r="6" fill="#0284C7" stroke="#ffffff" strokeWidth="2.5" />
                <rect
                  x={Math.min(width - 150, Math.max(padLeft, hoveredPoint.x - 70))}
                  y={Math.max(5, hoveredPoint.y - 45)}
                  width="140"
                  height="36"
                  rx="8"
                  fill="#0F172A"
                  stroke="#334155"
                  strokeWidth="1"
                  filter="drop-shadow(0 4px 6px rgba(0,0,0,0.15))"
                />
                <text
                  x={Math.min(width - 80, Math.max(padLeft + 70, hoveredPoint.x))}
                  y={Math.max(5, hoveredPoint.y - 45) + 16}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="11"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  {formatNumber(hoveredPoint.val, metricConfig.decimals)} {metricConfig.unit}
                </text>
                <text
                  x={Math.min(width - 80, Math.max(padLeft + 70, hoveredPoint.x))}
                  y={Math.max(5, hoveredPoint.y - 45) + 29}
                  textAnchor="middle"
                  fill="#94A3B8"
                  fontSize="9"
                  fontFamily="monospace"
                >
                  {isMounted ? formatClockTime(hoveredPoint.time) : ''}
                </text>
              </g>
            )}

            {/* Time labels across X Axis */}
            {points.filter((_, idx) => idx % 6 === 0 || idx === points.length - 1).map((pt, i) => (
              <text key={i} x={pt.x} y={padTop + plotHeight + 20} textAnchor="middle" fill="#64748B" fontSize="9" fontFamily="monospace">
                {isMounted ? formatClockTime(pt.time) : ''}
              </text>
            ))}
          </svg>
        </div>
      </CardContent>
    </Card>
  );
}
