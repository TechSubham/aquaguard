'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAquaGuard } from '@/lib/store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Bell,
  RefreshCw,
  Radio,
  User,
  ChevronDown,
  Building,
} from 'lucide-react';

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const {
    role,
    setRole,
    session,
    hostels,
    selectedHostelId,
    setSelectedHostelId,
    selectedHostel,
    selectedTank,
    tanks,
    setSelectedTankId,
    alerts,
    isLiveUpdating,
    refreshData,
    lastRefreshTime,
  } = useAquaGuard();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showTankMenu, setShowTankMenu] = useState(false);

  const unreadAlerts = alerts.filter((a) => a.status !== 'RESOLVED');
  const hostelTanks = tanks.filter((t) => t.hostelId === selectedHostelId || t.hostel === selectedHostel.name);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800 bg-black/95 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Brand & Live Indicator */}
        <div className="flex items-center gap-4">
          <Link
            href={role === 'ADMIN' ? '/admin/dashboard' : '/student/dashboard'}
            className="flex items-center gap-2.5 group"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-black font-black text-lg tracking-tighter shadow-[0_0_15px_rgba(255,255,255,0.25)] transition-transform group-hover:scale-105">
              AG
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-white">AquaGuard</span>
                <span className="text-[10px] uppercase px-1.5 py-0.5 rounded border border-zinc-700 bg-zinc-900 text-zinc-300 font-semibold">
                  {role}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 hidden sm:block">Campus Water Intelligence</p>
            </div>
          </Link>

          {/* IoT Telemetry status badge */}
          <div className="hidden lg:flex items-center gap-2 pl-4 border-l border-zinc-800">
            <span className="relative flex h-2 w-2">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isLiveUpdating ? 'bg-emerald-400' : 'bg-zinc-500'
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isLiveUpdating ? 'bg-emerald-500' : 'bg-zinc-600'
                }`}
              />
            </span>
            <span className="text-xs text-zinc-400">
              {isLiveUpdating ? 'MQTT: 1883 • 5s Pulse' : 'Telemetry Paused'}
            </span>
          </div>
        </div>

        {/* Center / Hostel & Tank Quick Switcher */}
        <div className="hidden md:flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setShowTankMenu(!showTankMenu)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-950 text-xs font-medium text-zinc-200 hover:border-zinc-700 hover:bg-zinc-900 transition-colors"
            >
              <Building className="h-3.5 w-3.5 text-zinc-400" />
              <span className="text-zinc-400">{selectedHostel.code}:</span>
              <span className="text-white font-semibold">{selectedTank.code}</span>
              <ChevronDown className="h-3.5 w-3.5 text-zinc-500" />
            </button>

            {showTankMenu && (
              <div className="absolute top-full mt-2 w-72 rounded-xl border border-zinc-800 bg-zinc-950 p-2 shadow-2xl z-50">
                {/* Hostel Selector inside quick menu */}
                <div className="px-2 py-1.5 border-b border-zinc-800/80 mb-1">
                  <div className="text-[11px] text-zinc-500 uppercase tracking-wider font-semibold mb-1">
                    Select Campus Hostel
                  </div>
                  <select
                    value={selectedHostelId}
                    onChange={(e) => setSelectedHostelId(e.target.value)}
                    className="w-full bg-black border border-zinc-800 text-xs text-white rounded p-1.5 focus:outline-none focus:border-white"
                  >
                    {hostels.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="text-[11px] text-zinc-500 px-2 py-1 uppercase tracking-wider font-semibold">
                  Tanks in {selectedHostel.name.split(' (')[0]}
                </div>
                <div className="max-h-56 overflow-y-auto space-y-1">
                  {hostelTanks.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setSelectedTankId(t.id);
                        setShowTankMenu(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition-colors ${
                        t.id === selectedTank.id
                          ? 'bg-zinc-800 text-white font-semibold'
                          : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                      }`}
                    >
                      <div>
                        <div className="text-zinc-200">{t.name}</div>
                        <div className="text-[10px] text-zinc-500">
                          {t.block} • {t.capacityLiters.toLocaleString()} L
                        </div>
                      </div>
                      {t.riskStatus === 'CRITICAL' ? (
                        <span className="h-2 w-2 rounded-full bg-red-500" />
                      ) : (
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => refreshData()}
            title={`Last refreshed ${lastRefreshTime.toLocaleTimeString()}`}
            className="text-zinc-400 hover:text-white h-8 w-8"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Right tools: Notifications, Role Switcher, Profile */}
        <div className="flex items-center gap-3">
          {/* Role Switcher Pill with Instant Route Sync */}
          <div className="flex items-center rounded-lg border border-zinc-800 bg-zinc-950 p-0.5">
            <button
              onClick={() => {
                setRole('ADMIN');
                if (pathname.startsWith('/student')) {
                  router.push('/admin/dashboard');
                }
              }}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                role === 'ADMIN'
                  ? 'bg-white text-black font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Admin View
            </button>
            <button
              onClick={() => {
                setRole('STUDENT');
                if (pathname.startsWith('/admin')) {
                  router.push('/student/dashboard');
                }
              }}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                role === 'STUDENT'
                  ? 'bg-white text-black font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Student View
            </button>
          </div>

          {/* Notifications Popover */}
          <div className="relative">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative h-9 w-9 border-zinc-800 hover:border-zinc-700 bg-zinc-950 text-zinc-300 hover:text-white"
            >
              <Bell className="h-4 w-4" />
              {unreadAlerts.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-white text-black text-[10px] font-bold">
                  {unreadAlerts.length}
                </span>
              )}
            </Button>

            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-xl border border-zinc-800 bg-zinc-950 p-4 shadow-2xl z-50">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-white">Telemetry Notifications</span>
                    <Badge variant="secondary">{unreadAlerts.length} active</Badge>
                  </div>
                  <Link
                    href={role === 'ADMIN' ? '/admin/alerts' : '/student/alerts'}
                    onClick={() => setShowNotifications(false)}
                    className="text-xs text-zinc-400 hover:text-white underline"
                  >
                    View All
                  </Link>
                </div>

                <div className="mt-3 space-y-2.5 max-h-80 overflow-y-auto pr-1">
                  {alerts.slice(0, 4).map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-3 rounded-lg border text-xs ${
                        alert.severity === 'CRITICAL'
                          ? 'border-red-900/40 bg-zinc-900/60'
                          : alert.severity === 'PREDICTIVE'
                          ? 'border-zinc-700 bg-zinc-900/40'
                          : 'border-zinc-800 bg-zinc-900/20'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-semibold text-zinc-100">{alert.title}</span>
                        <span className="text-[10px] text-zinc-500 whitespace-nowrap">{alert.timestamp}</span>
                      </div>
                      <p className="text-zinc-400 text-[11px] mt-1">{alert.description}</p>
                      <div className="mt-2 flex items-center justify-between text-[10px] text-zinc-500">
                        <span>{alert.tankName}</span>
                        <span
                          className={
                            alert.severity === 'CRITICAL' ? 'text-red-400 font-bold' : 'text-zinc-400'
                          }
                        >
                          Risk: {alert.riskScore}/100
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User profile avatar */}
          <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-zinc-800">
            <div className="h-8 w-8 rounded-full border border-zinc-700 bg-zinc-900 flex items-center justify-center text-zinc-200">
              <User className="h-4 w-4" />
            </div>
            <div className="text-left hidden lg:block">
              <div className="text-xs font-medium text-zinc-200 leading-tight">
                {role === 'ADMIN' ? 'Admin Facilities' : session.name.split(' ')[0]}
              </div>
              <div className="text-[10px] text-zinc-500">{session.block}</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
