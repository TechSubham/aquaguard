import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { SensorMetricCardData } from '@/lib/types';
import { formatNumber } from '@/lib/utils';

interface SensorCardProps {
  metric: SensorMetricCardData;
}

export function SensorCard({ metric }: SensorCardProps) {
  const getStatusBadge = (status: SensorMetricCardData['status']) => {
    switch (status) {
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold border border-red-500/80 bg-red-950/40 text-red-300">
            <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" />
            Critical
          </span>
        );
      case 'WARNING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold border border-amber-500/80 bg-amber-950/40 text-amber-300">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            Elevated
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border border-zinc-700 bg-zinc-900 text-zinc-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Normal
          </span>
        );
    }
  };

  return (
    <Card className="hover:border-zinc-700 transition-colors relative overflow-hidden">
      {metric.status === 'CRITICAL' && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-red-500" />
      )}
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xs font-mono uppercase text-zinc-400 tracking-wider">
          {metric.label}
        </CardTitle>
        {getStatusBadge(metric.status)}
      </CardHeader>

      <CardContent>
        {/* Main Metric Value */}
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-bold tracking-tight text-white font-mono">
            {formatNumber(metric.value, metric.key === 'tds' ? 0 : 2)}
          </span>
          <span className="text-sm font-medium text-zinc-400">{metric.unit}</span>
        </div>

        {/* Trend & Previous Value */}
        <div className="mt-3 flex items-center justify-between text-xs pt-2.5 border-t border-zinc-800/80">
          <div className="flex items-center gap-1 font-mono">
            {metric.trend === 'UP' ? (
              <span className={`inline-flex items-center gap-0.5 ${metric.status === 'CRITICAL' ? 'text-red-400 font-semibold' : 'text-zinc-300'}`}>
                <TrendingUp className="h-3.5 w-3.5" />
                +{Math.abs(metric.changePercent)}%
              </span>
            ) : metric.trend === 'DOWN' ? (
              <span className="inline-flex items-center gap-0.5 text-zinc-400">
                <TrendingDown className="h-3.5 w-3.5" />
                -{Math.abs(metric.changePercent)}%
              </span>
            ) : (
              <span className="inline-flex items-center gap-0.5 text-zinc-500">
                <Minus className="h-3.5 w-3.5" /> 0%
              </span>
            )}
            <span className="text-zinc-600 text-[10px] ml-1">
              (was {metric.previousValue} {metric.unit})
            </span>
          </div>

          <span className="text-[10px] font-mono text-zinc-500">{metric.lastUpdated}</span>
        </div>

        {/* Optimal Range Guide */}
        <div className="mt-2 text-[10px] text-zinc-500 font-mono flex items-center justify-between">
          <span>Target: {metric.optimalRange}</span>
        </div>
      </CardContent>
    </Card>
  );
}
