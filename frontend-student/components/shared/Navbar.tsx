'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAquaGuard } from '@/lib/store';
import {
  Bell,
  Waves,
  Building2,
  ChevronDown,
  LogOut,
} from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const {
    session,
    hostels,
    selectedHostelId,
    setSelectedHostelId,
    selectedHostel,
    selectedTank,
    tanks,
    setSelectedTankId,
    alerts,
  } = useAquaGuard();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showTankMenu, setShowTankMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const tankMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const unreadAlerts = alerts.filter((a) => a.status !== 'RESOLVED');
  const hostelTanks = tanks.filter((t) => t.hostelId === selectedHostelId || t.hostel === selectedHostel.name);
  const studentInitials = useMemo(() => {
    const initials = session.name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('');

    return initials || 'ST';
  }, [session.name]);

  useEffect(() => {
    const closeOpenMenus = (event: PointerEvent) => {
      const target = event.target as Node;
      const clickedInside =
        tankMenuRef.current?.contains(target) ||
        notificationsRef.current?.contains(target) ||
        userMenuRef.current?.contains(target);

      if (!clickedInside) {
        setShowTankMenu(false);
        setShowNotifications(false);
        setShowUserMenu(false);
      }
    };

    document.addEventListener('pointerdown', closeOpenMenus);
    return () => document.removeEventListener('pointerdown', closeOpenMenus);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('aquaguard_token');
    localStorage.removeItem('aquaguard_student_session');
    router.push('/login');
  };

  const navItems = [
    { label: 'Dashboard', href: '/student/dashboard' },
    { label: 'Advisories', href: '/student/alerts', badge: unreadAlerts.length > 0 ? unreadAlerts.length : undefined },
    { label: 'Report Issue', href: '/student/complaints' },
    { label: 'My Complaints', href: '/student/history' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full px-4 sm:px-8 pt-4 pb-3">
      <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-4">
        {/* Left: Brand Icon Pill (Inspired by Logo glyph in reference) */}
        <div className="flex items-center gap-3">
          <Link
            href="/student/dashboard"
            className="group flex items-center gap-2.5 rounded-2xl bg-white p-2.5 px-3.5 border border-slate-200/80 shadow-sm transition-all hover:shadow-md hover:border-slate-300"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#0B1B22] text-white shadow-sm transition-transform group-hover:scale-105">
              <Waves className="h-4 w-4 text-[#38BDF8]" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-[15px] tracking-tight text-[#0B1B22] leading-none">
                AquaGuard
              </span>
              <span className="text-[10px] font-semibold text-[#0284C7] tracking-wider uppercase leading-tight mt-0.5">
                Student Portal
              </span>
            </div>
          </Link>

          {/* Quick Hostel / Block Pill */}
          <div ref={tankMenuRef} className="relative hidden xl:block">
            <button
              onClick={() => {
                setShowTankMenu((open) => !open);
                setShowNotifications(false);
                setShowUserMenu(false);
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-full bg-white border border-slate-200/80 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:border-slate-300 shadow-sm transition-all"
            >
              <Building2 className="h-3.5 w-3.5 text-[#0284C7]" />
              <span className="text-slate-400 font-normal">{selectedHostel.code}:</span>
              <span className="text-slate-900">{selectedTank.block}</span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>

            {showTankMenu && (
              <div className="absolute top-full mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-2.5 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-2 py-1.5 border-b border-slate-100 mb-1.5">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1">
                    Select Hostel
                  </div>
                  <select
                    value={selectedHostelId}
                    onChange={(e) => setSelectedHostelId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-lg p-1.5 font-medium focus:outline-none focus:border-[#0284C7]"
                  >
                    {hostels.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="text-[10px] text-slate-400 px-2 py-1 uppercase tracking-wider font-bold">
                  Blocks in {selectedHostel.name.split(' (')[0]}
                </div>
                <div className="max-h-52 overflow-y-auto space-y-1 pr-1">
                  {hostelTanks.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setSelectedTankId(t.id);
                        setShowTankMenu(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-colors ${
                        t.id === selectedTank.id
                          ? 'bg-slate-100 text-slate-900 font-bold'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <div>
                        <div className="text-slate-900 font-medium">{t.block}</div>
                        <div className="text-[10px] text-slate-500">{t.name}</div>
                      </div>
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center: Sleek Capsule Pill Navigation (Directly Inspired by Reference UI) */}
        <nav className="hidden md:flex items-center gap-1 bg-white/90 backdrop-blur-md rounded-full p-1.5 border border-slate-200/80 shadow-sm">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/student/dashboard' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative px-5 py-2 rounded-full text-[13px] font-semibold transition-all duration-150 flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#0B1B22] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span
                    className={`ml-1 text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive ? 'bg-[#0284C7] text-white' : 'bg-slate-900 text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right: Round Utility Action Icons (Notification, User Avatar) */}
        <div className="flex items-center gap-2.5">
          {/* Notifications Button */}
          <div ref={notificationsRef} className="relative">
            <button
              onClick={() => {
                setShowNotifications((open) => !open);
                setShowTankMenu(false);
                setShowUserMenu(false);
              }}
              className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white border border-slate-200/80 text-slate-600 hover:text-slate-900 hover:border-slate-300 shadow-sm transition-all"
              title="Advisories & Alerts"
            >
              <Bell className="h-4 w-4" />
              {unreadAlerts.length > 0 && (
                <span className="absolute top-1 right-1 flex h-2.5 w-2.5 rounded-full bg-[#0284C7] ring-2 ring-white" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">Hostel Advisories</span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {unreadAlerts.length} active
                    </span>
                  </div>
                  <Link
                    href="/student/alerts"
                    onClick={() => setShowNotifications(false)}
                    className="text-xs font-semibold text-[#0284C7] hover:underline"
                  >
                    View All
                  </Link>
                </div>

                <div className="mt-3 space-y-2 max-h-80 overflow-y-auto pr-1">
                  {alerts.slice(0, 4).map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-3 rounded-xl border text-xs transition-colors ${
                        alert.severity === 'CRITICAL'
                          ? 'border-red-200 bg-red-50/50'
                          : 'border-slate-100 bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-slate-900">{alert.title}</span>
                        <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                          {alert.timestamp}
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px] mt-1 leading-relaxed">
                        {alert.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar Pill */}
          <div ref={userMenuRef} className="relative">
            <button
              onClick={() => {
                setShowUserMenu((open) => !open);
                setShowTankMenu(false);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full bg-white border border-slate-200/80 hover:border-slate-300 shadow-sm transition-all"
            >
              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-[#0284C7] to-[#38BDF8] flex items-center justify-center text-white font-bold text-xs shadow-inner">
                {studentInitials}
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-2 border-b border-slate-100">
                  <div className="font-bold text-xs text-slate-900">{session.name}</div>
                  <div className="text-[10px] text-slate-400">{session.email}</div>
                  <div className="mt-1">
                    <span className="inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      Student Tier
                    </span>
                  </div>
                </div>

                <div className="p-1 space-y-1">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
