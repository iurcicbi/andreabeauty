'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import webservice from '@/utils/webservice';

export default function Header() {
  const [impostazioni, setImpostazioni] = useState<any>(null);
  const [menuAperto, setMenuAperto] = useState(false);

  useEffect(() => {
    caricaImpostazioni();
  }, []);

  const caricaImpostazioni = async () => {
    try {
      const risposta = await webservice.get('/api/settings');
      setImpostazioni(risposta.dati);
    } catch {}
  };

  const sez = impostazioni?.sezioniHomepage || {};
  const attiva = (tipo: string) => sez[tipo]?.attiva !== false;

  const sezioniMenu: { tipo: string; href: string }[] = [
    { tipo: 'servizi', href: '/#services' },
    { tipo: 'about', href: '/#about' },
    { tipo: 'orari', href: '/#hours' },
    { tipo: 'recensioni', href: '/#reviews' },
    { tipo: 'contatti', href: '/#contact' },
    { tipo: 'galleria', href: '/#gallery' },
  ].filter((s) => attiva(s.tipo) && sez[s.tipo]?.mostraNelMenu !== false);

  const labelMenu = (tipo: string) => sez[tipo]?.nomeMenu || ({
    servizi: 'Servizi',
    about: 'Chi Siamo',
    orari: 'Orari',
    recensioni: 'Recensioni',
    contatti: 'Contatti',
    galleria: 'Galleria',
  } as Record<string, string>)[tipo] || tipo;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#FBF9F7]/95 backdrop-blur-md border-b border-[#E0B2B7]/10">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-24 md:h-24">
          <div className="flex items-center gap-3">
            {impostazioni?.logo ? (
              <img src={impostazioni.logo} alt={impostazioni.logoAlt || impostazioni.nomeAzienda} className="h-[120px] md:h-[120px] object-contain" />
            ) : (
              <svg className="w-8 h-8 md:w-10 md:h-10 text-[#E0B2B7]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                <path d="M12 8v8M8 12h8"/>
              </svg>
            )}
          </div>

          <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            <a href="/" className="text-[#5F5D5C] hover:text-[#4A3035] transition-colors tracking-wide text-sm uppercase">Home</a>
            {sezioniMenu.map((s) => (
              <a key={s.tipo} href={s.href} className="text-[#5F5D5C] hover:text-[#4A3035] transition-colors tracking-wide text-sm uppercase">{labelMenu(s.tipo)}</a>
            ))}
          </div>

          <div className="flex items-center gap-3">


            <button onClick={() => setMenuAperto(!menuAperto)} className="md:hidden text-[#4A3035] p-2">
              <div className="w-6 h-5 flex flex-col justify-between">
                <span className={`w-full h-0.5 bg-[#4A3035] transition-all ${menuAperto ? 'rotate-45 translate-y-2' : ''}`}></span>
                <span className={`w-full h-0.5 bg-[#4A3035] transition-all ${menuAperto ? 'opacity-0' : ''}`}></span>
                <span className={`w-full h-0.5 bg-[#4A3035] transition-all ${menuAperto ? '-rotate-45 -translate-y-2' : ''}`}></span>
              </div>
            </button>
            <Link href="/booking" className="flex flex-col items-center gap-0.5 group" aria-label="Prenota appuntamento">
              <div className="w-10 h-10 md:w-14 md:h-14 border-2 border-[#C49A8C] text-[#C49A8C] group-hover:bg-[#C49A8C] group-hover:text-white transition-all flex items-center justify-center">
                <svg className="w-5 h-5 md:w-7 md:h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                  <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"/>
                </svg>
              </div>
              <span className="hidden md:block text-[10px] uppercase tracking-widest text-[#C49A8C] font-medium">Prenota</span>
            </Link>
          </div>
        </div>
      </div>
      {menuAperto && (
        <div className="md:hidden bg-[#FBF9F7] border-t border-[#E0B2B7]/10">
          <div className="container mx-auto px-4 py-6 space-y-4">
            <a href="/" onClick={() => setMenuAperto(false)} className="block text-[#5F5D5C] hover:text-[#4A3035] transition-colors py-2 uppercase tracking-wide text-sm">Home</a>
            {sezioniMenu.map((s) => (
              <a key={s.tipo} href={s.href} onClick={() => setMenuAperto(false)} className="block text-[#5F5D5C] hover:text-[#4A3035] transition-colors py-2 uppercase tracking-wide text-sm">{labelMenu(s.tipo)}</a>
            ))}
            <Link href="/booking" className="block text-center mt-4" onClick={() => setMenuAperto(false)}>
              <span className="flex items-center justify-center gap-3 px-6 py-3 border-2 border-[#C49A8C] text-[#C49A8C] hover:bg-[#C49A8C] hover:text-white transition-all font-bold tracking-wider text-sm uppercase">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                  <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"/>
                </svg>
                PRENOTA
              </span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
