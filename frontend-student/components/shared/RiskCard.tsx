import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, BrainCircuit, Activity, ShieldCheck, ArrowRight } from 'lucide-react';
import { Tank } from '@/lib/types';

interface RiskCardProps {
  tank: Tank;
  riskScore: number;
  onInvestigate?: () => void;
}

export function RiskCard({ tank, riskScore, onInvestigate }: RiskCardProps) {
  const isHighRisk = riskScore >= 70;
  const isMediumRisk = riskScore >= 40 && riskScore < 70;

  return (
    <Card className={`relative overflow-hidden border-2 ${
      isHighRisk
        ? 'border-red-600/70 bg-gradient-to-r from-red-950/40 via-zinc-950 to-zinc-950'
        : isMediumRisk
        ? 'border-amber-600/60 bg-gradient-to-r from-amber-950/30 via-zinc-950 to-zinc-950'
        : 'border-zinc-800 bg-zinc-950'
    }`}>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Left Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                {tank.hostel} • {tank.block} / {tank.code}
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-zinc-600" />
              <span className="text-xs font-mono text-zinc-500">{tank.name}</span>
            </div>

            <div className="flex items-center gap-3">
              {isHighRisk ? (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-red-500 bg-red-950/60 text-red-100 text-xs font-bold shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                  <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
                  🔴 HIGH RISK DETECTED
                </div>
              ) : isMediumRisk ? (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500 bg-amber-950/60 text-amber-100 text-xs font-bold">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  🟠 ELEVATED ATTENTION REQUIRED
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-700 bg-zinc-900 text-zinc-200 text-xs font-semibold">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  🟢 NOMINAL HYGIENE STATE
                </div>
              )}

              <div className="text-xs font-mono text-zinc-400 hidden sm:block">
                Level: <strong className="text-white">{tank.waterLevelPercent}%</strong> ({tank.capacityLiters.toLocaleString()} L)
              </div>
            </div>

            <p className="text-xs text-zinc-400 max-w-xl">
              {isHighRisk
                ? 'Composite water risk index exceeded the critical threshold. Microbial filtration breakdown or high particulate turbidity detected. Automated advisory issued to block taps.'
                : 'Sensor telemetry confirms drinking water parameters adhere to IS 10500 standards.'}
            </p>
          </div>

          {/* Right: Risk Score & Action Buttons */}
          <div className="flex items-center gap-6 self-start md:self-center border-t md:border-t-0 pt-4 md:pt-0 border-zinc-800">
            {/* Risk Gauge Box */}
            <div className="text-center px-4 py-2 rounded-xl border border-zinc-800 bg-black/60 min-w-[130px]">
              <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                Risk Score
              </div>
              <div className="flex items-baseline justify-center gap-1 font-mono">
                <span className={`text-4xl font-extrabold ${isHighRisk ? 'text-red-400' : isMediumRisk ? 'text-amber-400' : 'text-zinc-100'}`}>
                  {riskScore}
                </span>
                <span className="text-sm text-zinc-500 font-semibold">/100</span>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-1.5 mt-1 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isHighRisk ? 'bg-red-500' : isMediumRisk ? 'bg-amber-400' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, riskScore)}%` }}
                />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col gap-2">
              <Link href="/admin/ai-prediction">
                <Button variant="default" size="sm" className="w-full text-xs gap-1.5">
                  <BrainCircuit className="h-3.5 w-3.5" />
                  AI Diagnosis
                </Button>
              </Link>
              <Link href="/admin/alerts">
                <Button variant="outline" size="sm" className="w-full text-xs gap-1.5 text-zinc-300">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Investigate Alerts
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
