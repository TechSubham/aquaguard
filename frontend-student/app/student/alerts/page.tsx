'use client';

import React from 'react';
import Link from 'next/link';
import { useAquaGuard } from '@/lib/store';
import { Info, MapPin, Wrench, Clock, CheckCircle2, ArrowUpRight } from 'lucide-react';

const LEVELS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

function levelOf(severity: string) {
  const i = LEVELS.indexOf(String(severity).toUpperCase());
  return i === -1 ? 1 : i;
}

/** Concentric ripple graphic with the active count in the centre */
function RippleCount({ count }: { count: number }) {
  return (
    <div className="relative h-28 w-28 shrink-0">
      <svg viewBox="0 0 112 112" className="absolute inset-0 h-full w-full">
        <circle cx="56" cy="56" r="54" fill="none" stroke="#DBEAFE" strokeWidth="1.5" />
        <circle cx="56" cy="56" r="42" fill="none" stroke="#BFDBFE" strokeWidth="1.5" strokeDasharray="3 5" />
        <circle cx="56" cy="56" r="30" fill="#EFF6FF" stroke="#93C5FD" strokeWidth="1.5" />
        {count > 0 && (
          <circle cx="56" cy="56" r="54" fill="none" stroke="#2563EB" strokeWidth="3" strokeLinecap="round"
            strokeDasharray="60 280" transform="rotate(-90 56 56)" />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black leading-none text-blue-700">{count}</span>
        <span className="mt-1 text-[9px] font-semibold uppercase tracking-widest text-blue-400">Active</span>
      </div>
    </div>
  );
}

export default function StudentAlertsPage() {
  const { alerts, selectedTank } = useAquaGuard();

  const activeAlerts = alerts.filter((a) => a.status !== 'RESOLVED');
  const pastAlerts = alerts.filter((a) => a.status === 'RESOLVED');

  return (
    <div className="space-y-8 rounded-3xl bg-blue-50 p-5 pb-8">
      {/* Editorial header */}
      <header className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-blue-400">
            {selectedTank.block}
          </p>
          <h1 className="mt-1 text-3xl font-black leading-[1.05] tracking-tight text-slate-900">
            Water
            <br />
            <span className="text-blue-600">Advisories</span>
          </h1>
          <p className="mt-3 max-w-[15rem] text-xs leading-relaxed text-slate-500">
            Notices from campus facilities for your block and the ones around it.
          </p>
        </div>
        <RippleCount count={activeAlerts.length} />
      </header>

      {/* Active tickets */}
      <section className="space-y-4">
        <h2 className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400">Happening now</h2>

        {activeAlerts.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-blue-200 bg-white/70 px-6 py-10 text-center">
            <CheckCircle2 className="mx-auto h-9 w-9 text-blue-500" />
            <p className="mt-3 text-sm font-extrabold text-slate-900">All clear</p>
            <p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed text-slate-500">
              Water quality in every residential block is nominal. No drinking restrictions in effect.
            </p>
          </div>
        ) : (
          activeAlerts.map((alert) => {
            const level = levelOf(alert.severity);
            return (
              <article key={alert.id} className="relative drop-shadow-[0_10px_20px_rgba(37,99,235,0.15)]">
                {/* top half */}
                <div className="rounded-t-3xl bg-white px-5 pb-5 pt-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex items-end gap-0.5">
                        {LEVELS.map((_, i) => (
                          <span
                            key={i}
                            className={`w-1.5 rounded-sm ${i <= level ? 'bg-blue-600' : 'bg-blue-100'}`}
                            style={{ height: `${8 + i * 4}px` }}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-blue-700">
                        {alert.severity}
                      </span>
                    </div>
                    <span className="flex items-center gap-1 text-[11px] text-slate-400">
                      <Clock className="h-3 w-3" /> {alert.timestamp}
                    </span>
                  </div>

                  <h3 className="mt-4 text-lg font-black leading-snug text-slate-900">{alert.title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-600">{alert.description}</p>
                </div>

                {/* perforation */}
                <div className="relative h-0">
                  <span className="absolute -left-3 -top-3 h-6 w-6 rounded-full bg-blue-50" />
                  <span className="absolute -right-3 -top-3 h-6 w-6 rounded-full bg-blue-50" />
                  <div className="mx-5 border-t-2 border-dashed border-blue-100" />
                </div>

                {/* bottom half */}
                <div className="rounded-b-3xl bg-white px-5 pb-5 pt-5">
                  <div className="flex gap-3">
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
                      <Info className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600">
                        What you should do
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-slate-700">
                        Use the filtered drinking water stations on the Ground Floor mess until technician testing completes.
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between rounded-xl bg-blue-50 px-3 py-2 text-[11px] font-medium text-blue-700">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {alert.tankName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Wrench className="h-3 w-3" /> Team on-site
                    </span>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </section>

      {/* Timeline of resolved */}
      {pastAlerts.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400">Resolved earlier</h2>

          <ol className="relative ml-2 space-y-5 border-l-2 border-blue-200 pl-6">
            {pastAlerts.map((alert) => (
              <li key={alert.id} className="relative">
                <span className="absolute -left-[33px] top-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-50 ring-2 ring-blue-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                </span>
                <p className="text-sm font-bold text-slate-800">{alert.title}</p>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  {alert.tankName} · resolved {alert.timestamp}
                </p>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* CTA */}
      <Link
        href="/student/complaints"
        className="group flex items-center justify-between rounded-full bg-blue-600 py-3 pl-6 pr-3 text-sm font-bold text-white shadow-lg shadow-blue-300/60 transition hover:bg-blue-700"
      >
        Notice a new problem?
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-blue-600 transition group-hover:rotate-45">
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </Link>
    </div>
  );
}