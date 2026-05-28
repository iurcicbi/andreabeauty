'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import webservice from '@/utils/webservice';

export default function Footer() {
  const [impostazioni, setImpostazioni] = useState<any>({});

  useEffect(() => {
    webservice.get('/api/settings')
      .then((r) => setImpostazioni(r.dati ?? {}))
      .catch(() => {});
  }, []);

  const sez = impostazioni?.sezioniHomepage || {};
  const attiva = (tipo: string) => sez[tipo]?.attiva !== false;

  const sezioniMenu: { tipo: string; href: string }[] = [
    { tipo: 'servizi',    href: '/#services'  },
    { tipo: 'about',      href: '/#about'     },
    { tipo: 'orari',      href: '/#hours'     },
    { tipo: 'recensioni', href: '/#reviews'   },
    { tipo: 'contatti',   href: '/#contact'   },
    { tipo: 'galleria',   href: '/#gallery'   },
    { tipo: 'filosofia',  href: '/#filosofia' },
  ].filter((s) => attiva(s.tipo) && sez[s.tipo]?.mostraNelMenu !== false);

  const labelMenu = (tipo: string) =>
    sez[tipo]?.nomeMenu ||
    ({
      servizi:    'Servizi',
      about:      'Chi Siamo',
      orari:      'Orari',
      recensioni: 'Recensioni',
      contatti:   'Contatti',
      galleria:   'Galleria',
      filosofia:  'Filosofia',
    } as Record<string, string>)[tipo] || tipo;

  const anno = new Date().getFullYear();
  const nome = impostazioni?.nomeAzienda || '';
  const bgColor = sez.colorePrimario || '#F5EEE1';

  // Logo o nome — riusato in entrambi i layout
  const logoEl = impostazioni?.logo ? (
    <img src={impostazioni.logo} alt={impostazioni?.logoAlt || nome} className="h-32 object-contain" />
  ) : (
    <span
      className="text-2xl text-[#1e1b14]"
      style={{ fontFamily: 'Playfair Display, serif', fontWeight: 600, letterSpacing: '0.06em' }}
    >
      {nome.toUpperCase()}
    </span>
  );

  // Icone social — riusate in entrambi i layout
  const socialIcons = (size: string) => (
    <div className={`flex items-center gap-5`}>
      {/* <a href={impostazioni?.social?.facebook || '#'}
        target={impostazioni?.social?.facebook ? '_blank' : undefined}
        rel="noopener noreferrer" aria-label="Facebook"
        className="text-[#4d453e] hover:text-[#1e1b14] transition-colors">
        <svg className={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
        </svg>
      </a> */}
      <a href={impostazioni?.social?.instagram || '#'}
        target={impostazioni?.social?.instagram ? '_blank' : undefined}
        rel="noopener noreferrer" aria-label="Instagram"
        className="text-[#4d453e] hover:text-[#1e1b14] transition-colors">
        <svg className={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
        </svg>
      </a>
      {/* <a href={impostazioni?.email ? `mailto:${impostazioni.email}` : '#'}
        aria-label="Email"
        className="text-[#4d453e] hover:text-[#1e1b14] transition-colors">
        <svg className={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
        </svg>
      </a> */}
    </div>
  );

  return (
    <footer className="w-full border-t" style={{ backgroundColor: bgColor, borderColor: 'rgba(107,92,74,0.15)' }}>

      {/* ══════════════ MOBILE ══════════════ */}
      <div className="md:hidden flex flex-col items-center text-center px-6 py-16 gap-10">
        {logoEl}

        {/* Social mobile — icone più grandi, Instagram + Twitter */}
        <div className="flex items-center justify-center gap-8">
          <a href={impostazioni?.social?.instagram || '#'}
            target={impostazioni?.social?.instagram ? '_blank' : undefined}
            rel="noopener noreferrer" aria-label="Instagram"
            className="text-[#1e1b14] hover:opacity-60 transition-opacity">
            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
              <circle cx="12" cy="12" r="4"/>
              <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
            </svg>
          </a>
          {/* <a href={impostazioni?.social?.twitter || impostazioni?.social?.facebook || '#'}
            target="_blank" rel="noopener noreferrer" aria-label="Twitter"
            className="text-[#1e1b14] hover:opacity-60 transition-opacity">
            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </a> */}
        </div>

        {/* Link legal */}
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
          {impostazioni?.linkPrivacyPolicy ? (
            <a href={impostazioni.linkPrivacyPolicy} target="_blank" rel="noopener noreferrer"
              className="text-xs tracking-[0.12em] uppercase text-[#4d453e] hover:text-[#1e1b14] transition-colors"
              style={{ fontFamily: 'Manrope, sans-serif' }}>Confidențialitate</a>
          ) : (
            <span className="text-xs tracking-[0.12em] uppercase text-[#4d453e]"
              style={{ fontFamily: 'Manrope, sans-serif' }}>Confidențialitate</span>
          )}
          {impostazioni?.linkTerminiCondizioni ? (
            <a href={impostazioni.linkTerminiCondizioni} target="_blank" rel="noopener noreferrer"
              className="text-xs tracking-[0.12em] uppercase text-[#4d453e] hover:text-[#1e1b14] transition-colors"
              style={{ fontFamily: 'Manrope, sans-serif' }}>Termeni</a>
          ) : (
            <span className="text-xs tracking-[0.12em] uppercase text-[#4d453e]"
              style={{ fontFamily: 'Manrope, sans-serif' }}>Termeni</span>
          )}
        </div>

        <p className="text-[11px] tracking-[0.08em] uppercase text-[#7f756d] leading-relaxed"
          style={{ fontFamily: 'Manrope, sans-serif' }}>
          © {anno} {nome.toUpperCase()}.
        </p>
      </div>

      {/* ══════════════ DESKTOP ══════════════ */}
      <div className="hidden md:block container mx-auto px-4 md:px-6 py-16 md:py-20">
        <div className="grid grid-cols-12 gap-6">

          {/* Col 1-3: Logo + tagline + social */}
          <div className="col-span-3">
            {logoEl}
            {impostazioni?.tagline && (
              <p className="text-sm text-[#4d453e] max-w-[200px] mb-6 leading-relaxed"
                style={{ fontFamily: 'Manrope, sans-serif' }}>
                {impostazioni.tagline}
              </p>
            )}
            <div className="mt-6">
              {socialIcons('w-5 h-5')}
            </div>
          </div>

          {/* Col 5-8: Navigare in griglia 2 colonne */}
          <div className="col-span-4 col-start-5">
            <h4 className="text-[10px] tracking-[0.15em] uppercase text-[#7f756d] font-semibold mb-6"
              style={{ fontFamily: 'Manrope, sans-serif' }}>
              Navigare
            </h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-4">
              <a href="/" className="text-sm text-[#4d453e] hover:text-[#1e1b14] transition-colors hover:underline underline-offset-4"
                style={{ fontFamily: 'Manrope, sans-serif' }}>Home</a>
              {sezioniMenu.map((s) => (
                <a key={s.tipo} href={s.href}
                  className="text-sm text-[#4d453e] hover:text-[#1e1b14] transition-colors hover:underline underline-offset-4"
                  style={{ fontFamily: 'Manrope, sans-serif' }}>
                  {labelMenu(s.tipo)}
                </a>
              ))}
            </div>
          </div>

          {/* Col 9-10: Legal */}
          <div className="col-span-2 col-start-9">
            <h4 className="text-[10px] tracking-[0.15em] uppercase text-[#7f756d] font-semibold mb-6"
              style={{ fontFamily: 'Manrope, sans-serif' }}>
              Legal
            </h4>
            <ul className="space-y-4">
              <li>
                {impostazioni?.linkPrivacyPolicy ? (
                  <a href={impostazioni.linkPrivacyPolicy} target="_blank" rel="noopener noreferrer"
                    className="text-sm text-[#4d453e] hover:text-[#1e1b14] transition-colors hover:underline underline-offset-4"
                    style={{ fontFamily: 'Manrope, sans-serif' }}>
                    Politică de Confidențialitate
                  </a>
                ) : (
                  <span className="text-sm text-[#4d453e]" style={{ fontFamily: 'Manrope, sans-serif' }}>
                    Politică de Confidențialitate
                  </span>
                )}
              </li>
              <li>
                {impostazioni?.linkTerminiCondizioni ? (
                  <a href={impostazioni.linkTerminiCondizioni} target="_blank" rel="noopener noreferrer"
                    className="text-sm text-[#4d453e] hover:text-[#1e1b14] transition-colors hover:underline underline-offset-4"
                    style={{ fontFamily: 'Manrope, sans-serif' }}>
                    Termeni și Condiții
                  </a>
                ) : (
                  <span className="text-sm text-[#4d453e]" style={{ fontFamily: 'Manrope, sans-serif' }}>
                    Termeni și Condiții
                  </span>
                )}
              </li>
            </ul>
          </div>

          {/* Col 11-12: Prenota */}
          {/* <div className="col-span-2 col-start-11 flex flex-col items-end">
            <h4 className="text-[10px] tracking-[0.15em] uppercase text-[#7f756d] font-semibold mb-6"
              style={{ fontFamily: 'Manrope, sans-serif' }}>
              Prenota
            </h4>
            <Link href="/booking" className="flex flex-col items-center gap-1.5 group" aria-label="Prenota appuntamento">
              <div className="w-16 h-16 border-2 border-[#C49A8C] text-[#C49A8C] group-hover:bg-[#C49A8C] group-hover:text-white transition-all flex items-center justify-center">
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                  <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"/>
                </svg>
              </div>
              <span className="text-[10px] uppercase tracking-widest text-[#C49A8C] font-medium group-hover:text-[#a07860] transition-colors"
                style={{ fontFamily: 'Manrope, sans-serif' }}>
                Prenota
              </span>
            </Link>
          </div> */}

          {/* Copyright bar */}
          <div className="col-span-12 border-t pt-8 mt-4 flex flex-col md:flex-row justify-between items-center gap-3"
            style={{ borderColor: 'rgba(107,92,74,0.15)' }}>
            <span className="text-[11px] tracking-[0.1em] uppercase text-[#7f756d]"
              style={{ fontFamily: 'Manrope, sans-serif' }}>
              © {anno} {nome.toUpperCase()}. 
            </span>
            {/* <span className="text-[11px] tracking-[0.1em] uppercase text-[#7f756d]"
              style={{ fontFamily: 'Manrope, sans-serif' }}>
              DESIGNED IN PURSUIT OF RADIANCE
            </span> */}
          </div>

        </div>
      </div>

    </footer>
  );
}
