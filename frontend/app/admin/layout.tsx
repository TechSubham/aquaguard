'use client';

import React from 'react';
import Link from 'next/link';
import { useAquaGuard } from '@/lib/store';
import { Sidebar } from '@/components/shared/Sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldAlert, ArrowLeft, KeyRound, Lock } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { role, setRole, session } = useAquaGuard();

  // Route-Level Access Control Guard for Admin Portal
  if (role !== 'ADMIN') {
    return (
      <div className="flex-1 flex items-center justify-center p-4 bg-black min-h-[calc(100vh-4rem)]">
        <Card className="max-w-md w-full border-zinc-800 bg-zinc-950 text-white shadow-2xl">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-700 mb-2">
              <ShieldAlert className="h-7 w-7 text-white" />
            </div>
            <CardTitle className="text-xl font-bold tracking-tight text-white">
              Access Restricted
            </CardTitle>
            <CardDescription className="text-xs text-zinc-400">
              Administrator credentials required for this operational route
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5 pt-2">
            <div className="rounded-lg border border-zinc-800 bg-black/60 p-3.5 space-y-2 text-xs">
              <div className="flex items-center justify-between text-zinc-400">
                <span>Active Profile:</span>
                <span className="text-white font-semibold">{session.name}</span>
              </div>
              <div className="flex items-center justify-between text-zinc-400">
                <span>Assigned Role:</span>
                <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-zinc-300 font-bold uppercase text-[10px]">
                  {role}
                </span>
              </div>
              <div className="flex items-center justify-between text-zinc-400">
                <span>Security Clearance:</span>
                <span className="text-zinc-400">Student Tier (Read-Only Portal)</span>
              </div>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed text-center">
              The Facilities Command Center contains critical telemetry controls, automated shutoff valve overrides, and campus tank diagnostics. Only authorized campus administrative personnel may access these resources.
            </p>

            <div className="space-y-2 pt-1">
              <Button
                onClick={() => setRole('ADMIN')}
                className="w-full bg-white text-black hover:bg-zinc-200 font-bold text-xs py-2.5 gap-2"
              >
                <KeyRound className="h-4 w-4" />
                Authenticate as Administrator
              </Button>

              <Link
                href="/student/dashboard"
                className="w-full inline-flex items-center justify-center rounded-md border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 text-zinc-300 hover:text-white text-xs py-2.5 gap-2 transition-colors font-medium"
              >
                <ArrowLeft className="h-4 w-4" />
                Return to Student Portal
              </Link>
            </div>

            <div className="pt-2 text-center border-t border-zinc-900">
              <span className="text-[10px] text-zinc-600 uppercase tracking-widest font-semibold">
                RBAC Policy Enforced • Campus Network Security
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col md:flex-row bg-black text-zinc-100">
      <Sidebar />
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full space-y-6">
        {children}
      </main>
    </div>
  );
}
