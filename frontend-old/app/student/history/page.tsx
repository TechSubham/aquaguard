'use client';

import React from 'react';
import Link from 'next/link';
import { useAquaGuard } from '@/lib/store';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageSquareWarning,
  Plus,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export default function StudentHistoryPage() {
  const { complaints } = useAquaGuard();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
            Resolution Tracker
          </span>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2 mt-0.5">
            <ClipboardList className="h-5 w-5 text-white" />
            My Complaints
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time status of your logged water safety grievances and technician dispatch logs.
          </p>
        </div>

        <Link href="/student/complaints">
          <Button size="sm" className="text-xs flex items-center gap-1.5 font-bold">
            <Plus className="h-3.5 w-3.5" />
            New Report
          </Button>
        </Link>
      </div>

      {/* Complaints List matching user prompt section 9 */}
      <div className="space-y-4">
        {complaints.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-zinc-800 bg-zinc-950 space-y-3">
            <CheckCircle2 className="h-10 w-10 text-zinc-600 mx-auto" />
            <h3 className="text-sm font-bold text-white">No Active Grievances</h3>
            <p className="text-xs text-zinc-400 max-w-xs mx-auto">
              You haven&apos;t filed any water quality tickets. If you observe strange odors or cloudy water, submit a report.
            </p>
            <Link href="/student/complaints">
              <Button size="sm" variant="outline" className="mt-2 text-xs">
                Report Water Problem
              </Button>
            </Link>
          </div>
        ) : (
          complaints.map((item) => {
            const isInvestigating = item.status === 'INVESTIGATING';
            const isResolved = item.status === 'RESOLVED';
            const isOpen = item.status === 'OPEN';

            return (
              <div
                key={item.id}
                className="p-5 rounded-2xl border border-zinc-800 bg-zinc-950 space-y-3 hover:border-zinc-700 transition-all"
              >
                {/* Top header row */}
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-extrabold text-white">{item.id}</span>
                    <span className="text-xs text-zinc-500 font-mono">• {item.block}</span>
                  </div>

                  {/* Status Badge from user prompt: 🟡 Investigating / 🟢 Resolved / 🔴 Open */}
                  <Badge
                    variant={
                      isOpen ? 'danger' : isInvestigating ? 'outline' : 'secondary'
                    }
                    className="font-mono text-[10px]"
                  >
                    {isInvestigating
                      ? '🟡 Investigating'
                      : isResolved
                      ? '🟢 Resolved'
                      : '🔴 Open'}
                  </Badge>
                </div>

                {/* Primary Issue & Description */}
                <div>
                  <div className="text-sm font-bold text-white">
                    {item.issues.join(', ')}
                  </div>
                  <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                    &quot;{item.description}&quot;
                  </p>
                </div>

                {/* Admin / Facilities Update note if present */}
                {item.adminNotes && (
                  <div className="p-3 rounded-lg bg-black border border-zinc-800 text-xs font-mono space-y-1">
                    <span className="text-[10px] text-zinc-500 uppercase block">Facilities Update:</span>
                    <p className="text-zinc-300">{item.adminNotes}</p>
                  </div>
                )}

                {/* Footer submission date */}
                <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60 text-[11px] font-mono text-zinc-500">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3 w-3" />
                    <span>Submitted: {item.submittedAt}</span>
                  </div>
                  <span>Assigned: Facilities Plumbing Team</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
