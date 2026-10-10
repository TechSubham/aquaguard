'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAquaGuard } from '@/lib/store';
import {
  LayoutDashboard,
  Database,
  Activity,
  AlertTriangle,
  BrainCircuit,
  MessageSquareWarning,
  Wrench,
  FlaskConical,
  GitBranch,
  FileText,
  Settings,
  HelpCircle,
  Droplets,
  ShieldAlert,
  ClipboardList,
  LogOut,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  tag?: string;
}

export function Sidebar() {
  const pathname = usePathname();
  const { role, alerts, complaints } = useAquaGuard();

  const activeAlertsCount = alerts.filter((a) => a.status !== 'RESOLVED').length;
  const openComplaintsCount = complaints.filter((c) => c.status !== 'RESOLVED').length;

  const adminNavItems: NavItem[] = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Tanks', href: '/admin/tanks', icon: Database },
    { label: 'Water Quality', href: '/admin/water-quality', icon: Activity },
    { label: 'Alerts', href: '/admin/alerts', icon: AlertTriangle, badge: activeAlertsCount > 0 ? activeAlertsCount : undefined },
    { label: 'AI Prediction', href: '/admin/ai-prediction', icon: BrainCircuit, tag: 'USP' },
    { label: 'Complaints', href: '/admin/complaints', icon: MessageSquareWarning, badge: openComplaintsCount > 0 ? openComplaintsCount : undefined },
    { label: 'Maintenance', href: '/admin/maintenance', icon: Wrench },
    { label: 'Water Testing', href: '/admin/water-tests', icon: FlaskConical },
    { label: 'Incidents', href: '/admin/incidents', icon: GitBranch },
    { label: 'Reports', href: '/admin/reports', icon: FileText },
    { label: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  const studentNavItems: NavItem[] = [
    { label: 'Student Home', href: '/student/dashboard', icon: LayoutDashboard },
    { label: 'Water Status', href: '/student/status', icon: Droplets },
    { label: 'Advisory Alerts', href: '/student/alerts', icon: ShieldAlert, badge: activeAlertsCount > 0 ? activeAlertsCount : undefined },
    { label: 'Report Problem', href: '/student/complaints', icon: MessageSquareWarning },
    { label: 'My Complaints', href: '/student/history', icon: ClipboardList },
  ];

  const navItems: NavItem[] = role === 'ADMIN' ? adminNavItems : studentNavItems;

  return (
    <aside className="w-64 border-r border-zinc-800 bg-black flex-shrink-0 flex flex-col justify-between py-5 px-3 min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        <div>
          <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-semibold">
            {role === 'ADMIN' ? 'Facility Command Center' : 'Student Portal'}
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/admin/dashboard' && item.href !== '/student/dashboard' && pathname.startsWith(item.href));
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-white text-black font-semibold shadow-sm'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`h-4 w-4 ${isActive ? 'text-black' : 'text-zinc-400'}`} />
                    <span>{item.label}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {item.tag && (
                      <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded ${isActive ? 'bg-black text-white' : 'border border-zinc-700 bg-zinc-900 text-zinc-300'}`}>
                        {item.tag}
                      </span>
                    )}
                    {item.badge !== undefined && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isActive ? 'bg-black text-white' : 'bg-white text-black'}`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="space-y-4">
        {/* System Footer info */}
        <div className="pt-4 border-t border-zinc-900 px-3 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-zinc-500 font-mono">
            <span>AquaGuard Core</span>
            <span className="text-zinc-400">v2.4.0</span>
          </div>
          <div className="text-[10px] text-zinc-600 font-mono leading-tight">
            Campus Smart Water IoT Platform
          </div>
        </div>
      </div>
    </aside>
  );
}
