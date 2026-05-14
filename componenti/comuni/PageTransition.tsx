/**
 * Componente per transizioni fluide tra pagine
 */

'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import LoadingSpinner from './LoadingSpinner';

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const [displayChildren, setDisplayChildren] = useState(children);

  useEffect(() => {
    setIsLoading(true);
    
    // Simula un breve caricamento per la transizione
    const timer = setTimeout(() => {
      setDisplayChildren(children);
      setIsLoading(false);
    }, 150);

    return () => clearTimeout(timer);
  }, [pathname, children]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      {displayChildren}
    </div>
  );
}