'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAquaGuard } from '@/lib/store';
import {
  Droplet,
  ShieldAlert,
  MessageSquareWarning,
  ClipboardList,
  Home,
} from 'lucide-react';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { alerts } = useAquaGuard();

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
