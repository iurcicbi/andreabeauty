/**
 * PAGINA CMS - IMPOSTAZIONI GLOBALI
 * 
 * Gestione completa di tutte le impostazioni del sito
 */

'use client';

import { useState, useEffect } from 'react';
import webservice from '@/utils/webservice';
import Messaggio from '@/componenti/comuni/Messaggio';
import Caricamento from '@/componenti/comuni/Caricamento';

interface Impostazioni {
  logo?: string;
  logoAlt?: string;
  favicon?: string;
  nomeAzienda: string;
  tagline?: string;
  descrizione?: string;
  telefono?: string;
  email?: string;
  whatsapp?: string;
  indirizzo?: string;
  citta?: string;
  cap?: string;
  provincia?: string;
  paese?: string;
  orariApertura?: {
    lunedi?: string;
    martedi?: string;
    mercoledi?: string;
    giovedi?: string;
    venerdi?: string;
    sabato?: string;
    domenica?: string;
  };
  social?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    tiktok?: string;
    youtube?: string;
  };
  testiHomepage?: {
    titoloHero?: string;
    sottotitoloHero?: string;
    badgeHero?: string;
    testoCtaPrimario?: string;
    testoCtaSecondario?: string;
    titoloServizi?: string;
    sottotitoloServizi?: string;
    titoloOrari?: string;
    sottotitoloOrari?: string;
    titoloCtaFinale?: string;
    sottotitoloCtaFinale?: string;
  };
  testiPrenotazione?: {
    titoloPagina?: string;
    sottotitoloPagina?: string;
    stepSpecialist?: string;
    stepServizio?: string;
    stepData?: string;
    stepOrario?: string;
    stepConferma?: string;
  };
  tema?: {
    colorePrimario?: string;
    coloreSecondario?: string;
    coloreAccento?: string;
  };
  seo?: {
    titoloPagina?: string;
    descrizioneMeta?: string;
    keywords?: string;
    ogImage?: string;
  };
  funzionalita?: {
    mostraOrari?: boolean;
    mostraServizi?: boolean;
    mostraSocial?: boolean;
    mostraContatti?: boolean;
    abilitaPrenotazioni?: boolean;
  };
}

export default function ImpostazioniPage() {
  const [impostazioni, setImpostazioni] = useState<Impostazioni>({
    nomeAzienda: 'Beauty Salon'
  });
  const [caricamento, setCaricamento] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [messaggio, setMessaggio] = useState<{ tipo: 'successo' | 'errore'; testo: string } | null>(null);
  const [tabAttiva, setTabAttiva] = useState<'generale' | 'contatti' | 'orari' | 'testi' | 'social' | 'seo' | 'avanzate'>('generale');

  useEffect(() => {
    caricaImpostazioni();
  }, []);

  const caricaImpostazioni = async () => {
    try {
      setCaricamento(true);
      const risposta = await webservice.get('/api/settings');
      setImpostazioni(risposta.dati);
    } catch (err) {
      setMessaggio({ tipo: 'errore', testo: 'Eroare la încărcarea setărilor' });
    } finally {
      setCaricamento(false);
    }
  };

  const handleSalva = async () => {
    try {
      setSalvando(true);
      await webservice.put('/api/settings', impostazioni);
      setMessaggio({ tipo: 'successo', testo: 'Setări salvate cu succes!' });
    } catch (err) {
      setMessaggio({ tipo: 'errore', testo: 'Eroare la salvarea setărilor' });
    } finally {
      setSalvando(false);
    }
  };

  const aggiorna = (campo: string, valore: any) => {
    setImpostazioni(prev => {
      const nuove = { ...prev };
      const parti = campo.split('.');
      let obj: any = nuove;
      
      for (let i = 0; i < parti.length - 1; i++) {
        if (!obj[parti[i]]) obj[parti[i]] = {};
        obj = obj[parti[i]];
      }
      
      obj[parti[parti.length - 1]] = valore;
      return nuove;
    });
  };

  if (caricamento) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Caricamento />
      </div>
    );
  }

  return (
    <div className="p-3 md:p-6 pb-24 md:pb-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 md:mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1">Setări Globale</h1>
            <p className="text-sm md:text-base text-gray-600">Configurează toate aspectele site-ului tău</p>
          </div>
          <button
            onClick={handleSalva}
            disabled={salvando}
            className="hidden sm:block px-6 py-3 bg-black text-white font-bold hover:bg-gray-800 disabled:opacity-50 text-sm md:text-base"
          >
            {salvando ? 'Salvare...' : 'Salvează Modificări'}
          </button>
        </div>

        {messaggio && (
          <div className="mb-6">
            <Messaggio
              tipo={messaggio.tipo}
              messaggio={messaggio.testo}
              onChiudi={() => setMessaggio(null)}
            />
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6 md:mb-8">
          <div className="flex gap-2 md:gap-4 overflow-x-auto scrollbar-hide -mx-3 px-3 md:mx-0 md:px-0">
            {[
              { id: 'generale', label: 'General' },
              { id: 'contatti', label: 'Contacte' },
              { id: 'orari', label: 'Orar' },
              { id: 'testi', label: 'Texte' },
              { id: 'social', label: 'Social' },
              { id: 'seo', label: 'SEO' },
              { id: 'avanzate', label: 'Avansat' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setTabAttiva(tab.id as any)}
                className={`px-3 md:px-4 py-2 md:py-3 text-sm md:text-base font-medium border-b-2 transition-colors whitespace-nowrap ${
                  tabAttiva === tab.id
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* GENERALE */}
        {tabAttiva === 'generale' && (
          <div className="space-y-6">
            <div className="bg-white p-6 border border-gray-200">
              <h2 className="text-xl font-bold mb-4">Branding</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">URL Logo</label>
                  <input
                    type="text"
                    value={impostazioni.logo || ''}
                    onChange={(e) => aggiorna('logo', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-black"
                    placeholder="https://exemplu.com/logo.png"
                  />
                  {impostazioni.logo && (
                    <div className="mt-2">
                      <img src={impostazioni.logo} alt="Logo preview" className="h-20 object-contain" />
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Nume Companie</label>
                  <input
                    type="text"
                    value={impostazioni.nomeAzienda}
                    onChange={(e) => aggiorna('nomeAzienda', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Slogan</label>
                  <input
                    type="text"
                    value={impostazioni.tagline || ''}
                    onChange={(e) => aggiorna('tagline', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-black"
                    placeholder="Stilul tău, pasiunea noastră"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Descriere</label>
                  <textarea
                    value={impostazioni.descrizione || ''}
                    onChange={(e) => aggiorna('descrizione', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-black"
                    rows={3}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CONTATTI */}
        {tabAttiva === 'contatti' && (
          <div className="space-y-6">
            <div className="bg-white p-6 border border-gray-200">
              <h2 className="text-xl font-bold mb-4">Informații de Contact</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Telefon</label>
                  <input
                    type="text"
                    value={impostazioni.telefono || ''}
                    onChange={(e) => aggiorna('telefono', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={impostazioni.email || ''}
                    onChange={(e) => aggiorna('email', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">WhatsApp</label>
                  <input
                    type="text"
                    value={impostazioni.whatsapp || ''}
                    onChange={(e) => aggiorna('whatsapp', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-black"
                    placeholder="+40 712 345 678"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 border border-gray-200">
              <h2 className="text-xl font-bold mb-4">Adresă</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Stradă/Piață</label>
                  <input
                    type="text"
                    value={impostazioni.indirizzo || ''}
                    onChange={(e) => aggiorna('indirizzo', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Oraș</label>
                  <input
                    type="text"
                    value={impostazioni.citta || ''}
                    onChange={(e) => aggiorna('citta', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Cod Poștal</label>
                  <input
                    type="text"
                    value={impostazioni.cap || ''}
                    onChange={(e) => aggiorna('cap', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Județ</label>
                  <input
                    type="text"
                    value={impostazioni.provincia || ''}
                    onChange={(e) => aggiorna('provincia', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Țară</label>
                  <input
                    type="text"
                    value={impostazioni.paese || ''}
                    onChange={(e) => aggiorna('paese', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-black"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ORARI */}
        {tabAttiva === 'orari' && (
              <div className="bg-white p-4 md:p-6 border border-gray-200">
              <h2 className="text-lg md:text-xl font-bold mb-4">Orar de Lucru</h2>
              <div className="space-y-3">
                {['lunedi', 'martedi', 'mercoledi', 'giovedi', 'venerdi', 'sabato', 'domenica'].map(giorno => (
                  <div key={giorno} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                    <label className="w-full sm:w-32 text-xs sm:text-sm font-medium capitalize">{giorno}</label>
                    <input
                      type="text"
                      value={impostazioni.orariApertura?.[giorno as keyof typeof impostazioni.orariApertura] || ''}
                      onChange={(e) => aggiorna(`orariApertura.${giorno}`, e.target.value)}
                      className="w-full sm:flex-1 px-3 md:px-4 py-2 border border-gray-300 focus:outline-none focus:border-black text-sm"
                      placeholder="09:00 - 19:00 sau Închis"
                    />
                  </div>
                ))}
              </div>
            </div>
        )}

        {/* TESTI */}
        {tabAttiva === 'testi' && (
          <div className="space-y-6">
            <div className="bg-white p-6 border border-gray-200">
              <h2 className="text-xl font-bold mb-4">Texte Pagina Principală</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Insignă Hero</label>
                  <input
                    type="text"
                    value={impostazioni.testiHomepage?.badgeHero || ''}
                    onChange={(e) => aggiorna('testiHomepage.badgeHero', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Titlu Hero (lasă gol pentru a folosi numele companiei)</label>
                  <input
                    type="text"
                    value={impostazioni.testiHomepage?.titoloHero || ''}
                    onChange={(e) => aggiorna('testiHomepage.titoloHero', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Subtitlu Hero (lasă gol pentru a folosi sloganul)</label>
                  <input
                    type="text"
                    value={impostazioni.testiHomepage?.sottotitoloHero || ''}
                    onChange={(e) => aggiorna('testiHomepage.sottotitoloHero', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-black"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Text CTA Principal</label>
                    <input
                      type="text"
                      value={impostazioni.testiHomepage?.testoCtaPrimario || ''}
                      onChange={(e) => aggiorna('testiHomepage.testoCtaPrimario', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Text CTA Secundar</label>
                    <input
                      type="text"
                      value={impostazioni.testiHomepage?.testoCtaSecondario || ''}
                      onChange={(e) => aggiorna('testiHomepage.testoCtaSecondario', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-black"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 border border-gray-200">
              <h2 className="text-xl font-bold mb-4">Texte Rezervare</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Titlu Pagină</label>
                  <input
                    type="text"
                    value={impostazioni.testiPrenotazione?.titoloPagina || ''}
                    onChange={(e) => aggiorna('testiPrenotazione.titoloPagina', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Subtitlu Pagină</label>
                  <input
                    type="text"
                    value={impostazioni.testiPrenotazione?.sottotitoloPagina || ''}
                    onChange={(e) => aggiorna('testiPrenotazione.sottotitoloPagina', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-black"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SOCIAL */}
        {tabAttiva === 'social' && (
          <div className="bg-white p-6 border border-gray-200">
            <h2 className="text-xl font-bold mb-4">Social Media</h2>
            <div className="space-y-4">
              {['facebook', 'instagram', 'twitter', 'linkedin', 'tiktok', 'youtube'].map(social => (
                <div key={social}>
                  <label className="block text-sm font-medium mb-2 capitalize">{social}</label>
                  <input
                    type="text"
                    value={impostazioni.social?.[social as keyof typeof impostazioni.social] || ''}
                    onChange={(e) => aggiorna(`social.${social}`, e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-black"
                    placeholder={`https://${social}.com/...`}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SEO */}
        {tabAttiva === 'seo' && (
          <div className="bg-white p-6 border border-gray-200">
            <h2 className="text-xl font-bold mb-4">SEO și Metadate</h2>
            <div className="space-y-4">
              <div>
                  <label className="block text-sm font-medium mb-2">Titlu Pagină</label>
                <input
                  type="text"
                  value={impostazioni.seo?.titoloPagina || ''}
                  onChange={(e) => aggiorna('seo.titoloPagina', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-black"
                />
              </div>
              <div>
                  <label className="block text-sm font-medium mb-2">Descriere Meta</label>
                <textarea
                  value={impostazioni.seo?.descrizioneMeta || ''}
                  onChange={(e) => aggiorna('seo.descrizioneMeta', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-black"
                  rows={3}
                />
              </div>
              <div>
                  <label className="block text-sm font-medium mb-2">Cuvinte cheie (separate prin virgulă)</label>
                <input
                  type="text"
                  value={impostazioni.seo?.keywords || ''}
                  onChange={(e) => aggiorna('seo.keywords', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-black"
                />
              </div>
              <div>
                  <label className="block text-sm font-medium mb-2">Imagine Open Graph</label>
                <input
                  type="text"
                  value={impostazioni.seo?.ogImage || ''}
                  onChange={(e) => aggiorna('seo.ogImage', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-black"
                  placeholder="https://exemplu.com/og-image.jpg"
                />
              </div>
            </div>
          </div>
        )}

        {/* Mobile Save Button */}
        <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-40">
          <button
            onClick={handleSalva}
            disabled={salvando}
            className="w-full py-3 bg-black text-white font-bold hover:bg-gray-800 disabled:opacity-50 text-sm"
          >
            {salvando ? 'Salvare...' : 'Salvează Modificări'}
          </button>
        </div>

        {/* AVANZATE */}
        {tabAttiva === 'avanzate' && (
          <div className="bg-white p-4 md:p-6 border border-gray-200">
            <h2 className="text-lg md:text-xl font-bold mb-4">Funcționalități</h2>
            <div className="space-y-4">
              {[
                { key: 'mostraOrari', label: 'Afișează Orarul de Lucru' },
                { key: 'mostraServizi', label: 'Afișează Secțiunea Servicii' },
                { key: 'mostraSocial', label: 'Afișează Linkuri Social' },
                { key: 'mostraContatti', label: 'Afișează Informațiile de Contact' },
                { key: 'abilitaPrenotazioni', label: 'Activează Sistemul de Rezervări' }
              ].map(func => (
                <label key={func.key} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={impostazioni.funzionalita?.[func.key as keyof typeof impostazioni.funzionalita] ?? true}
                    onChange={(e) => aggiorna(`funzionalita.${func.key}`, e.target.checked)}
                    className="w-5 h-5"
                  />
                  <span className="text-sm font-medium">{func.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
