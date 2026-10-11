'use client';

import React from 'react';
import Link from 'next/link';
import { useAquaGuard } from '@/lib/store';
import { Plus, Clock, MessageSquareText, Inbox, Search, BadgeCheck, ArrowRight } from 'lucide-react';

const COLUMNS = [
  {
    key: 'OPEN',
    title: 'Open',
    sub: 'Waiting to be picked up',
    icon: <Inbox className="h-4 w-4" />,
    head: 'bg-white text-blue-700 ring-1 ring-blue-200',
    badge: 'bg-blue-50 text-blue-700',
    bar: 'bg-blue-300',
  },
  {
    key: 'INVESTIGATING',
    title: 'In progress',
    sub: 'Team is on it',
    icon: <Search className="h-4 w-4" />,
    head: 'bg-blue-600 text-white',
    badge: 'bg-white/25 text-white',
    bar: 'bg-blue-600',
  },
  {
    key: 'RESOLVED',
    title: 'Resolved',
    sub: 'All sorted',
    icon: <BadgeCheck className="h-4 w-4" />,
    head: 'bg-sky-200 text-sky-900',
    badge: 'bg-white/60 text-sky-900',
    bar: 'bg-sky-300',
  },
] as const;

export default function StudentHistoryPage() {
  const { complaints } = useAquaGuard();

  return (
    <div className="space-y-6 rounded-3xl bg-gradient-to-b from-white to-blue-50 p-5 pb-7 ring-1 ring-blue-100">
      {/* Header */}
      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            Complaint <span className="text-blue-600">board</span>
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Swipe across to follow each report from open to resolved.
          </p>
        </div>
        <Link
          href="/student/complaints"
          className="flex shrink-0 items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-300/50 transition hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" /> New
        </Link>
      </header>

      {complaints.length === 0 ? (
        <div className="rounded-3xl bg-white px-6 py-12 text-center ring-1 ring-blue-100">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-500">
            <Inbox className="h-7 w-7" />
          </div>
          <h3 className="mt-3 text-sm font-extrabold text-slate-900">Your board is empty</h3>
          <p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed text-slate-500">
            When you report a water problem it will show up here and move across as the team works on it.
          </p>
          <Link
            href="/student/complaints"
            className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:underline"
          >
            Report a problem <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      ) : (
        <div className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-3">
          {COLUMNS.map((col) => {
            const items = complaints.filter((c) => c.status === col.key);

            return (
              <section key={col.key} className="w-[82%] shrink-0 snap-center sm:w-72">
                {/* Column header */}
                <div className={`flex items-center justify-between rounded-2xl px-4 py-3 ${col.head}`}>
                  <div className="flex items-center gap-2.5">
                    {col.icon}
                    <div className="leading-tight">
                      <p className="text-sm font-extrabold">{col.title}</p>
                      <p className="text-[10px] opacity-70">{col.sub}</p>
                    </div>
                  </div>
                  <span className={`flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-xs font-black ${col.badge}`}>
                    {items.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="mt-3 space-y-3">
                  {items.length === 0 ? (
                    <div className="rounded-2xl border-2 border-dashed border-blue-200 px-4 py-8 text-center text-[11px] text-blue-300">
                      Nothing here
                    </div>
                  ) : (
                    items.map((item) => (
                      <article
                        key={item.id}
                        className="relative overflow-hidden rounded-2xl bg-white p-4 shadow-[0_8px_20px_-12px_rgba(37,99,235,0.35)] ring-1 ring-blue-100"
                      >
                        <span className={`absolute inset-x-0 top-0 h-1 ${col.bar}`} />

                        <div className="flex items-center justify-between">
                          <span className="text-lg font-black tracking-tight text-blue-700">{item.id}</span>
                          <span className="max-w-[55%] truncate text-[10px] font-medium text-slate-400">
                            {item.block}
                          </span>
                        </div>

                        <div className="mt-2.5 flex flex-wrap gap-1.5">
                          {item.issues.map((issue: string) => (
                            <span
                              key={issue}
                              className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700"
                            >
                              {issue}
                            </span>
                          ))}
                        </div>

                        <p className="mt-2.5 line-clamp-3 text-xs leading-relaxed text-slate-600">
                          {item.description}
                        </p>

                        {item.adminNotes && (
                          <div className="mt-3 flex gap-2 rounded-xl bg-sky-50 p-2.5 ring-1 ring-sky-100">
                            <MessageSquareText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-600" />
                            <p className="text-[11px] leading-relaxed text-slate-700">{item.adminNotes}</p>
                          </div>
                        )}

                        <div className="mt-3 flex items-center gap-1.5 border-t border-blue-50 pt-2.5 text-[10px] text-slate-400">
                          <Clock className="h-3 w-3" />
                          {item.submittedAt}
                        </div>
                      </article>
                    ))
                  )}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {/* Column dots hint */}
      {complaints.length > 0 && (
        <p className="text-center text-[10px] font-semibold uppercase tracking-[0.25em] text-blue-300">
          Open · In progress · Resolved
        </p>
      )}
    </div>
  );
}