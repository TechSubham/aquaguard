'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAquaGuard } from '@/lib/store';
import { loginUserApi, registerUserApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldCheck, Lock, Mail, ArrowRight, User as UserIcon, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { setRole, setSession } = useAquaGuard();
  
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        const res = await loginUserApi(email, password);
        handleAuthSuccess(res);
      } else {
        const res = await registerUserApi({
          name,
          email,
          password,
          role: 'admin'
        });
        handleAuthSuccess(res);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSuccess = (res: any) => {
    // Save token
    if (res.access_token) {
      localStorage.setItem('aquaguard_token', res.access_token);
    }
    
    // Update global state
    setRole('ADMIN');
    setSession({
      role: 'ADMIN',
      name: res.user?.name || 'Chief Facilities Officer',
      email: res.user?.email || email,
      block: 'Facilities HQ',
    });
    
    router.push('/admin/dashboard');
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 bg-black min-h-[calc(100vh-4rem)] relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="w-full max-w-md space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white text-black font-black text-2xl shadow-[0_0_25px_rgba(255,255,255,0.3)]">
            AG
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">AquaGuard</h1>
          <p className="text-xs text-zinc-400 font-mono">Sign in to your campus water intelligence portal</p>
        </div>

        <Card className="border-zinc-800 bg-zinc-950/80 backdrop-blur-xl p-2 shadow-2xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-base text-white text-center">
              Management Authentication
            </CardTitle>
            <CardDescription className="text-center text-xs text-zinc-400">
              {isLogin ? 'Enter your credentials to access the command center' : 'Create a new administrative account'}
            </CardDescription>

            {/* Mode Toggle */}
            <div className="grid grid-cols-2 gap-1.5 p-1 rounded-lg bg-zinc-900 border border-zinc-800 mt-4">
              <button
                type="button"
                onClick={() => { setIsLogin(true); setError(null); }}
                className={`py-1.5 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1.5 ${
                  isLogin ? 'bg-white text-black font-bold shadow-sm' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setIsLogin(false); setError(null); }}
                className={`py-1.5 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1.5 ${
                  !isLogin ? 'bg-white text-black font-bold shadow-sm' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Create Account
              </button>
            </div>
            
            <div className="pt-2 flex justify-center">
               <div className="py-1 px-3 text-[10px] uppercase tracking-wider font-bold rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center gap-1.5">
                  <ShieldCheck className="h-3 w-3" />
                  Administrator Portal
               </div>
            </div>
          </CardHeader>

          <CardContent>
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
                <p className="text-xs text-red-400 font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                    <UserIcon className="h-3.5 w-3.5 text-zinc-500" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={!isLogin}
                    placeholder="Chief Facilities Officer"
                    className="w-full bg-black/50 border border-zinc-800 text-white text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              )}

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
                  placeholder="admin.aquaguard@nsut.ac.in"
                  className="w-full bg-black/50 border border-zinc-800 text-white text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5 text-zinc-500" />
                    Password
                  </label>
                  {isLogin && <span className="text-[11px] text-indigo-400 hover:text-indigo-300 cursor-pointer transition-colors">Forgot?</span>}
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••••••"
                  className="w-full bg-black/50 border border-zinc-800 text-white text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full text-xs font-bold py-2.5 gap-2 mt-2 bg-white text-black hover:bg-zinc-200">
                <span>{loading ? 'Processing...' : (isLogin ? 'Login to Command Center' : 'Create Admin Account')}</span>
                {!loading && <ArrowRight className="h-3.5 w-3.5" />}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
