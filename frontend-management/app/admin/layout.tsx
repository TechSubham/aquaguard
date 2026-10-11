'use client';

import React from 'react';
import Link from 'next/link';
import { useAquaGuard } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Navbar } from '@/components/shared/Navbar';
import { ShieldAlert, ArrowLeft, KeyRound } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { role, setRole, session } = useAquaGuard();

  // Route-Level Access Control Guard for Admin Portal
  if (role !== 'ADMIN') {
    return (
      <>
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-6 bg-[#F3F4F6] min-h-[calc(100vh-5rem)]">
          <Card className="max-w-md w-full border border-slate-200 bg-white text-slate-900 shadow-xl rounded-[28px] overflow-hidden">
            <CardHeader className="text-center pb-2 pt-6">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 border border-slate-200 mb-2">
                <ShieldAlert className="h-7 w-7 text-[#0284C7]" />
              </div>
              <CardTitle className="text-xl font-bold tracking-tight text-slate-900">
                Access Restricted
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 mt-1">
                Administrator credentials required for this operational route
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5 p-6 pt-2">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-500">
                  <span>Active Profile:</span>
                  <span className="text-slate-900 font-semibold">{session.name}</span>
                </div>
                <div className="flex items-center justify-between text-slate-500">
                  <span>Assigned Role:</span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-800 font-bold uppercase text-[10px]">
                    {role}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed text-center">
                The Facilities Command Center contains critical telemetry controls and tank diagnostics. Only authorized campus administrative personnel may access these resources.
              </p>

              <div className="space-y-2 pt-1">
                <Button
                  onClick={() => setRole('ADMIN')}
                  className="w-full bg-[#0B1B22] text-white hover:bg-black font-semibold text-xs py-2.5 rounded-full"
                >
                  <KeyRound className="h-4 w-4 mr-2" />
                  Authenticate as Administrator
                </Button>

                <Link
                  href="/student/dashboard"
                  className="w-full inline-flex items-center justify-center rounded-full border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs py-2.5 font-medium transition-colors"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Return to Student Portal
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="flex-1 bg-[#F3F4F6] text-[#0B1B22]">
        <main className="max-w-[1440px] mx-auto px-4 sm:px-8 py-4 sm:py-6 space-y-6">
          {children}
        </main>
      </div>
    </>
  );
}
