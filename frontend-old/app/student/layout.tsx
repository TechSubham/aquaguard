'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAquaGuard } from '@/lib/store';
import { Button } from '@/components/ui/button';
import {
  Droplet,
  ShieldAlert,
  MessageSquareWarning,
  ClipboardList,
  Home,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { role, setRole, alerts } = useAquaGuard();

  const activeAlertsCount = alerts.filter((a) => a.status !== 'RESOLVED').length;

  const studentNav = [
    { label: 'Status', href: '/student/dashboard', icon: Home },
    { label: 'Water Quality', href: '/student/status', icon: Droplet },
    {
      label: 'Alerts',
      href: '/student/alerts',
      icon: ShieldAlert,
      badge: activeAlertsCount > 0 ? activeAlertsCount : undefined,
    },
    { label: 'Report Issue', href: '/student/complaints', icon: MessageSquareWarning },
    { label: 'My Complaints', href: '/student/history', icon: ClipboardList },
  ];

  return (
    <div className="flex-1 bg-black text-white flex flex-col selection:bg-white selection:text-black">
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-6 pb-24 sm:pb-10 space-y-4">
        {/* Administrator Preview Notification Banner */}
        {role === 'ADMIN' && (
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl border border-zinc-700 bg-zinc-950 text-xs shadow-md">
            <div className="flex items-center gap-2.5 text-zinc-300">
              <ShieldCheck className="h-4 w-4 text-white" />
              <span>
                <strong className="text-white">Admin Preview Mode:</strong> You are viewing the Student Portal view.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setRole('STUDENT')}
                className="h-7 text-xs border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-900"
              >
                Set Role to Student
              </Button>
              <Link
                href="/admin/dashboard"
                className="h-7 px-2.5 text-xs bg-white text-black hover:bg-zinc-200 font-bold rounded-md inline-flex items-center gap-1 transition-colors"
              >
                Command Center <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        )}

        {/* Desktop Student Navigation Bar */}
        <div className="hidden sm:flex items-center gap-1 p-1 rounded-xl border border-zinc-800 bg-zinc-950/80">
          {studentNav.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-white text-black font-bold shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-black' : 'text-zinc-400'}`} />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive ? 'bg-black text-white' : 'bg-white text-black'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Student View Page Content */}
        {children}
      </main>

      {/* Mobile-First Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 backdrop-blur-md border-t border-zinc-800 sm:hidden">
        <div className="flex items-center justify-around py-2 px-1 max-w-md mx-auto">
          {studentNav.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center p-2 rounded-lg text-[10px] transition-colors relative ${
                  isActive ? 'text-white font-bold' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <div className="relative">
                  <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-zinc-500'}`} />
                  {item.badge !== undefined && (
                    <span className="absolute -top-1 -right-2 h-4 w-4 bg-white text-black font-extrabold text-[9px] rounded-full flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="mt-1">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
