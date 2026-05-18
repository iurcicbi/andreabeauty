'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Caricamento from '@/componenti/comuni/Caricamento';
import webservice from '@/utils/webservice';
import {
  SezioneHero,
  SezioneServizi,
  SezioneAbout,
  SezioneOrari,
  SezioneRecensioni,
  SezioneContatti,
  SezioneCtaFinale,
  SezioneGalleria,
} from '@/componenti/homepage';

export default function HomePage() {
  const [impostazioni, setImpostazioni] = useState<any>(null);
  const [servizi, setServizi] = useState<any[]>([]);
  const [caricamento, setCaricamento] = useState(true);
  const [menuAperto, setMenuAperto] = useState(false);

  useEffect(() => {
    caricaDati();
  }, []);

  const caricaDati = async () => {
    try {
      const risposta = await webservice.get('/api/settings');
      setImpostazioni(risposta.dati);

      if (risposta.dati?.funzionalita?.mostraServizi !== false) {
        const rispostaServizi = await webservice.get('/api/services');
        setServizi(rispostaServizi.dati.filter((s: any) => s.attivo !== false));
      }
    } catch {
      setImpostazioni({ nomeAzienda: 'Beauty Salon', tagline: 'Il tuo stile, la nostra passione' });
    } finally {
      setCaricamento(false);
    }
  };

  if (caricamento) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Caricamento />
      </div>
    );
  }

  const sez = impostazioni?.sezioniHomepage || {};
  const ordine = (tipo: string) => sez[tipo]?.ordine || 1;
  const attiva = (tipo: string) => sez[tipo]?.attiva !== false;
  const config = (tipo: string) => sez[tipo] || {};

  const sezioni = [
    { tipo: 'hero', render: () => <SezioneHero key="hero" sezioneConfig={config('hero')} impostazioni={impostazioni} /> },
    { tipo: 'servizi', render: () => <SezioneServizi key="servizi" servizi={servizi} config={config('servizi')} /> },
    { tipo: 'about', render: () => <SezioneAbout key="about" config={config('about')} /> },
    { tipo: 'orari', render: () => <SezioneOrari key="orari" config={config('orari')} orariApertura={impostazioni?.orariApertura} /> },
    { tipo: 'recensioni', render: () => <SezioneRecensioni key="recensioni" config={config('recensioni')} /> },
    { tipo: 'contatti', render: () => <SezioneContatti key="contatti" config={config('contatti')} impostazioni={impostazioni} /> },
    { tipo: 'ctaFinale', render: () => <SezioneCtaFinale key="ctaFinale" config={config('ctaFinale')} /> },
    { tipo: 'galleria', render: () => <SezioneGalleria key="galleria" config={config('galleria')} /> },
  ]
    .filter((s) => attiva(s.tipo))
    .sort((a, b) => ordine(a.tipo) - ordine(b.tipo));

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-30">
            <div className="flex items-center gap-3">
              {impostazioni?.logo ? (
                <img src={impostazioni.logo} alt={impostazioni.logoAlt || impostazioni.nomeAzienda} className="h-[70px] md:h-[100px] object-contain" />
              ) : (
                <svg className="w-8 h-8 md:w-10 md:h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                  <path d="M12 8v8M8 12h8"/>
                </svg>
              )}
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a href="#home" className="text-white/80 hover:text-white transition-colors font-medium">Home</a>
              {attiva('servizi') && <a href="#services" className="text-white/80 hover:text-white transition-colors font-medium">Servizi</a>}
              {attiva('about') && <a href="#about" className="text-white/80 hover:text-white transition-colors font-medium">Chi Siamo</a>}
              {attiva('galleria') && <a href="#gallery" className="text-white/80 hover:text-white transition-colors font-medium">Galleria</a>}
              {attiva('contatti') && <a href="#contact" className="text-white/80 hover:text-white transition-colors font-medium">Contatti</a>}
              <Link href="/booking" className="px-6 py-3 bg-white text-black font-bold rounded-none hover:bg-white/90 transition-all border-2 border-white">
                PRENOTA ORA
              </Link>
            </div>

            <button onClick={() => setMenuAperto(!menuAperto)} className="md:hidden text-white p-2">
              <div className="w-6 h-5 flex flex-col justify-between">
                <span className={`w-full h-0.5 bg-white transition-all ${menuAperto ? 'rotate-45 translate-y-2' : ''}`}></span>
                <span className={`w-full h-0.5 bg-white transition-all ${menuAperto ? 'opacity-0' : ''}`}></span>
                <span className={`w-full h-0.5 bg-white transition-all ${menuAperto ? '-rotate-45 -translate-y-2' : ''}`}></span>
              </div>
            </button>
          </div>
        </div>

        {menuAperto && (
          <div className="md:hidden bg-black border-t border-white/10">
            <div className="container mx-auto px-4 py-6 space-y-4">
              <a href="#home" onClick={() => setMenuAperto(false)} className="block text-white/80 hover:text-white transition-colors py-2">Home</a>
              {attiva('servizi') && <a href="#services" onClick={() => setMenuAperto(false)} className="block text-white/80 hover:text-white transition-colors py-2">Servizi</a>}
              {attiva('about') && <a href="#about" onClick={() => setMenuAperto(false)} className="block text-white/80 hover:text-white transition-colors py-2">Chi Siamo</a>}
              {attiva('galleria') && <a href="#gallery" onClick={() => setMenuAperto(false)} className="block text-white/80 hover:text-white transition-colors py-2">Galleria</a>}
              {attiva('contatti') && <a href="#contact" onClick={() => setMenuAperto(false)} className="block text-white/80 hover:text-white transition-colors py-2">Contatti</a>}
              <Link href="/booking" className="block text-center px-6 py-3 bg-white text-black font-bold rounded-none hover:bg-white/90 transition-all border-2 border-white mt-4">
                PRENOTA ORA
              </Link>
            </div>
          </div>
        )}
      </nav>

      {sezioni.map((s) => s.render())}

      {/* Footer */}
      <footer className="bg-black text-white/60 py-8 border-t border-white/10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm">
              © {new Date().getFullYear()} {impostazioni?.nomeAzienda || 'Beauty Salon'}. Tutti i diritti riservati.
            </div>
            <div className="flex gap-6 text-sm">
              <a href="#home" className="hover:text-white transition-colors">Home</a>
              {attiva('servizi') && <a href="#services" className="hover:text-white transition-colors">Servizi</a>}
              {attiva('about') && <a href="#about" className="hover:text-white transition-colors">Chi Siamo</a>}
              {attiva('contatti') && <a href="#contact" className="hover:text-white transition-colors">Contatti</a>}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
