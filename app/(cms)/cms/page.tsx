/**
 * PAGINA: /cms
 * 
 * Redirect automatico alla dashboard del CMS
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Caricamento from '@/componenti/comuni/Caricamento';

export default function CMSIndexPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect automatico alla dashboard
    router.push('/cms/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Caricamento />
    </div>
  );
}
