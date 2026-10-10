'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAquaGuard } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldCheck, UserCheck, Lock, Mail, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { setRole, setSession } = useAquaGuard();
  const [email, setEmail] = useState('admin.aquaguard@nsut.ac.in');
  const [password, setPassword] = useState('••••••••••••');
  const [selectedRole, setSelectedRole] = useState<'ADMIN' | 'STUDENT'>('ADMIN');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRole === 'ADMIN') {
      setRole('ADMIN');
      setSession({
        role: 'ADMIN',
        name: 'Chief Facilities Officer',
        email: email || 'admin.aquaguard@nsut.ac.in',
        block: 'Block A',
      });
      router.push('/admin/dashboard');
    } else {
      setRole('STUDENT');
      setSession({
        role: 'STUDENT',
        name: 'Aarav Patel',
        email: email || 'student.nsut@campus.in',
        block: 'Block A',
        room: 'Room 304',
      });
      router.push('/student/dashboard');
    }
  };

  const handleQuickLogin = (role: 'ADMIN' | 'STUDENT') => {
    if (role === 'ADMIN') {
      setRole('ADMIN');
      setSession({
        role: 'ADMIN',
        name: 'Chief Facilities Officer',
        email: 'admin.aquaguard@nsut.ac.in',
        block: 'Block A',
      });
      router.push('/admin/dashboard');
    } else {
      setRole('STUDENT');
      setSession({
        role: 'STUDENT',
        name: 'Aarav Patel',
        email: 'student.nsut@campus.in',
        block: 'Block A',
        room: 'Room 304',
      });
      router.push('/student/dashboard');
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 bg-black min-h-[calc(100vh-4rem)]">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white text-black font-black text-2xl shadow-[0_0_25px_rgba(255,255,255,0.3)]">
            AG
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">AquaGuard</h1>
          <p className="text-xs text-zinc-400 font-mono">Sign in to your campus water intelligence portal</p>
        </div>

        <Card className="border-zinc-800 bg-zinc-950 p-2">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-base text-white text-center">Authentication</CardTitle>
            <CardDescription className="text-center text-xs text-zinc-400">
              Select your role or enter credentials to proceed
            </CardDescription>

            {/* Role Tab Selector */}
            <div className="grid grid-cols-2 gap-1.5 p-1 rounded-lg bg-zinc-900 border border-zinc-800 mt-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedRole('ADMIN');
                  setEmail('admin.aquaguard@nsut.ac.in');
                }}
                className={`py-1.5 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1.5 ${
                  selectedRole === 'ADMIN' ? 'bg-white text-black font-bold shadow-sm' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                Administrator
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedRole('STUDENT');
                  setEmail('aarav.student@nsut.ac.in');
                }}
                className={`py-1.5 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1.5 ${
                  selectedRole === 'STUDENT' ? 'bg-white text-black font-bold shadow-sm' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <UserCheck className="h-3.5 w-3.5" />
                Student
              </button>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-zinc-500" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@nsut.ac.in"
                  className="w-full bg-black border border-zinc-800 text-white text-xs rounded-lg px-3 py-2.5 font-mono focus:outline-none focus:border-zinc-500 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5 text-zinc-500" />
                    Password
                  </label>
                  <span className="text-[11px] text-zinc-500 hover:text-zinc-400 cursor-pointer">Forgot?</span>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-black border border-zinc-800 text-white text-xs rounded-lg px-3 py-2.5 font-mono focus:outline-none focus:border-zinc-500 transition-colors"
                />
              </div>

              <Button type="submit" className="w-full text-xs font-bold py-2.5 gap-2 mt-2">
                <span>Login to {selectedRole === 'ADMIN' ? 'Command Center' : 'Student Portal'}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </form>

            <div className="mt-6 pt-5 border-t border-zinc-800/80 text-center space-y-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 block">
                Instant Mock Launch
              </span>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickLogin('ADMIN')}
                  className="flex-1 text-xs"
                >
                  Admin View →
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickLogin('STUDENT')}
                  className="flex-1 text-xs"
                >
                  Student View →
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
