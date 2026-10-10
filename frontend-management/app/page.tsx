'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAquaGuard } from '@/lib/store';

export default function RootPage() {
  const router = useRouter();
  const { role } = useAquaGuard();

  useEffect(() => {
    if (role === 'ADMIN') {
      router.replace('/admin/dashboard');
    } else {
      router.replace('/login');
    }
  }, [role, router]);

  return (
    <div className="flex-1 flex items-center justify-center bg-black text-zinc-400 font-mono text-xs">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-white animate-ping" />
        Connecting to AquaGuard Telemetry Node...
      </div>
    </div>
  );
}
