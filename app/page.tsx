'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Caricamento from '@/componenti/comuni/Caricamento';
import Header from '@/componenti/layout/Header';
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
  SezioneFilosofia,
} from '@/componenti/homepage';
import FeaturedReviewsStrip from '@/componenti/homepage/FeaturedReviewsStrip';

export default function HomePage() {
  const [impostazioni, setImpostazioni] = useState<any>(null);
  const [servizi, setServizi] = useState<any[]>([]);
  const [caricamento, setCaricamento] = useState(true);

  useEffect(() => {
    caricaDati();
  }, []);

  useEffect(() => {
    if (!caricamento) {
      const hash = window.location.hash;
      if (hash) {
        setTimeout(() => {
          const el = document.querySelector(hash);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [caricamento]);

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
      <div className="min-h-screen bg-[#FDF6F8] flex items-center justify-center">
        <Caricamento />
      </div>
    );
  }

  const sez = impostazioni?.sezioniHomepage || {};
  const ordine = (tipo: string) => sez[tipo]?.ordine || 1;
  const attiva = (tipo: string) => sez[tipo]?.attiva !== false;
  const config = (tipo: string) => ({
    ...sez[tipo],
    mostraPrezziFrontend: impostazioni?.funzionalita?.mostraPrezziFrontend !== false,
    colorePrimario: sez[tipo]?.colorePrimario || sez.colorePrimario || '#FFF8F0',
    coloreSecondario: sez[tipo]?.coloreSecondario || sez.coloreSecondario || '#F5EEE1',
  });

  const serviziFiltrati = (() => {
    const cfgServizi = config('servizi');
    const selezionati = cfgServizi?.serviziSelezionati;
    if (selezionati && selezionati.length > 0) {
      return servizi.filter((s: any) => selezionati.includes(s._id));
    }
    return servizi;
  })();

  const sezioni = [
    { tipo: 'hero', render: (index: number) => <SezioneHero key="hero" sezioneConfig={config('hero')} impostazioni={impostazioni} bgIndex={index} /> },
    { tipo: 'servizi', render: (index: number) => <SezioneServizi key="servizi" servizi={serviziFiltrati} config={config('servizi')} bgIndex={index} /> },
    { tipo: 'about', render: (index: number) => <SezioneAbout key="about" config={config('about')} bgIndex={index} /> },
    { tipo: 'orari', render: (index: number) => <SezioneOrari key="orari" config={config('orari')} orariApertura={impostazioni?.orariApertura} bgIndex={index} /> },
    { tipo: 'recensioni', render: (index: number) => <SezioneRecensioni key="recensioni" config={config('recensioni')} bgIndex={index} /> },
    { tipo: 'contatti', render: (index: number) => <SezioneContatti key="contatti" config={config('contatti')} impostazioni={impostazioni} bgIndex={index} /> },
    { tipo: 'ctaFinale', render: (index: number) => <SezioneCtaFinale key="ctaFinale" config={config('ctaFinale')} bgIndex={index} /> },
    { tipo: 'galleria', render: (index: number) => <SezioneGalleria key="galleria" config={config('galleria')} bgIndex={index} /> },
    { tipo: 'filosofia', render: (index: number) => <SezioneFilosofia key="filosofia" config={config('filosofia')} bgIndex={index} /> },
  ]
    .filter((s) => attiva(s.tipo))
    .sort((a, b) => ordine(a.tipo) - ordine(b.tipo));

  return (
    <div className="min-h-screen bg-[#FDF6F8] text-[#4A3035] overflow-hidden">
      <Header />
      <FeaturedReviewsStrip limit={3} />
      {sezioni.map((s, index) => s.render(index))}

      {/* Footer */}
      <footer className="bg-[#4A3035] text-white/60 py-8 border-t border-[#E0B2B7]/20">
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
