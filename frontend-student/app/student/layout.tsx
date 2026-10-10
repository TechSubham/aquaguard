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
    <div className="flex-1 bg-[#F3F4F6] text-[#0B1B22] flex flex-col">
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-8 py-4 sm:py-6 pb-24 sm:pb-10 space-y-5">
        {/* Administrator Preview Notification Banner */}
        {role === 'ADMIN' && (
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl border border-slate-200 bg-white text-xs shadow-sm">
            <div className="flex items-center gap-2.5 text-slate-700">
              <ShieldCheck className="h-4 w-4 text-[#0284C7]" />
              <span>
                <strong className="text-slate-900 font-semibold">Admin Mode:</strong> You are currently previewing the Student Portal.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setRole('STUDENT')}
                className="h-7 text-xs rounded-full border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              >
                Set Role to Student
              </Button>
              <Link
                href="/admin/dashboard"
                className="h-7 px-3 text-xs bg-[#0B1B22] text-white hover:bg-black font-semibold rounded-full inline-flex items-center gap-1 transition-colors"
              >
                Command Center <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        )}

        {/* Student View Page Content */}
        {children}
      </main>

      {/* Mobile-First Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 sm:hidden">
        <div className="flex items-center justify-around py-2 px-1 max-w-md mx-auto">
          {studentNav.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center p-2 rounded-xl text-[10px] transition-colors relative ${
                  isActive ? 'text-[#0B1B22] font-bold' : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                <div className="relative">
                  <Icon className={`h-5 w-5 ${isActive ? 'text-[#0B1B22]' : 'text-slate-400'}`} />
                  {item.badge !== undefined && (
                    <span className="absolute -top-1 -right-2 h-4 w-4 bg-[#0284C7] text-white font-extrabold text-[9px] rounded-full flex items-center justify-center">
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
