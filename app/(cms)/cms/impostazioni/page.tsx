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
    stepBarber?: string;
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
    nomeAzienda: 'Barbershop'
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
      const risposta = await webservice.get('/api/impostazioni');
      setImpostazioni(risposta.dati);
    } catch (err) {
      setMessaggio({ tipo: 'errore', testo: 'Errore nel caricamento delle impostazioni' });
    } finally {
      setCaricamento(false);
    }
  };

  const handleSalva = async () => {
    try {
      setSalvando(true);
      await webservice.put('/api/impostazioni', impostazioni);
      setMessaggio({ tipo: 'successo', testo: 'Impostazioni salvate con successo!' });
    } catch (err) {
      setMessaggio({ tipo: 'errore', testo: 'Errore nel salvataggio delle impostazioni' });
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
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Impostazioni Globali</h1>
            <p className="text-gray-600">Configura tutti gli aspetti del tuo sito</p>
          </div>
          <button
            onClick={handleSalva}
            disabled={salvando}
            className="px-6 py-3 bg-black text-white font-bold hover:bg-gray-800 disabled:opacity-50"
          >
            {salvando ? 'Salvataggio...' : 'Salva Modifiche'}
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
        <div className="border-b border-gray-200 mb-8">
          <div className="flex gap-4 overflow-x-auto">
            {[
              { id: 'generale', label: 'Generale' },
              { id: 'contatti', label: 'Contatti' },
              { id: 'orari', label: 'Orari' },
              { id: 'testi', label: 'Testi' },
              { id: 'social', label: 'Social' },
              { id: 'seo', label: 'SEO' },
              { id: 'avanzate', label: 'Avanzate' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setTabAttiva(tab.id as any)}
                className={`px-4 py-3 font-medium border-b-2 transition-colors whitespace-nowrap ${
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
                  <label className="block text-sm font-medium mb-2">Logo URL</label>
                  <input
                    type="text"
                    value={impostazioni.logo || ''}
                    onChange={(e) => aggiorna('logo', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-black"
                    placeholder="https://esempio.com/logo.png"
                  />
                  {impostazioni.logo && (
                    <div className="mt-2">
                      <img src={impostazioni.logo} alt="Logo preview" className="h-20 object-contain" />
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Nome Azienda</label>
                  <input
                    type="text"
                    value={impostazioni.nomeAzienda}
                    onChange={(e) => aggiorna('nomeAzienda', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Tagline</label>
                  <input
                    type="text"
                    value={impostazioni.tagline || ''}
                    onChange={(e) => aggiorna('tagline', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-black"
                    placeholder="Il tuo stile, la nostra passione"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Descrizione</label>
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
              <h2 className="text-xl font-bold mb-4">Informazioni di Contatto</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Telefono</label>
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
                    placeholder="+39 123 456 7890"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 border border-gray-200">
              <h2 className="text-xl font-bold mb-4">Indirizzo</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Via/Piazza</label>
                  <input
                    type="text"
                    value={impostazioni.indirizzo || ''}
                    onChange={(e) => aggiorna('indirizzo', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Città</label>
                  <input
                    type="text"
                    value={impostazioni.citta || ''}
                    onChange={(e) => aggiorna('citta', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">CAP</label>
                  <input
                    type="text"
                    value={impostazioni.cap || ''}
                    onChange={(e) => aggiorna('cap', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Provincia</label>
                  <input
                    type="text"
                    value={impostazioni.provincia || ''}
                    onChange={(e) => aggiorna('provincia', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Paese</label>
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
          <div className="bg-white p-6 border border-gray-200">
            <h2 className="text-xl font-bold mb-4">Orari di Apertura</h2>
            <div className="space-y-4">
              {['lunedi', 'martedi', 'mercoledi', 'giovedi', 'venerdi', 'sabato', 'domenica'].map(giorno => (
                <div key={giorno} className="flex items-center gap-4">
                  <label className="w-32 text-sm font-medium capitalize">{giorno}</label>
                  <input
                    type="text"
                    value={impostazioni.orariApertura?.[giorno as keyof typeof impostazioni.orariApertura] || ''}
                    onChange={(e) => aggiorna(`orariApertura.${giorno}`, e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 focus:outline-none focus:border-black"
                    placeholder="09:00 - 19:00 o Chiuso"
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
              <h2 className="text-xl font-bold mb-4">Testi Homepage</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Badge Hero</label>
                  <input
                    type="text"
                    value={impostazioni.testiHomepage?.badgeHero || ''}
                    onChange={(e) => aggiorna('testiHomepage.badgeHero', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Titolo Hero (lascia vuoto per usare nome azienda)</label>
                  <input
                    type="text"
                    value={impostazioni.testiHomepage?.titoloHero || ''}
                    onChange={(e) => aggiorna('testiHomepage.titoloHero', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Sottotitolo Hero (lascia vuoto per usare tagline)</label>
                  <input
                    type="text"
                    value={impostazioni.testiHomepage?.sottotitoloHero || ''}
                    onChange={(e) => aggiorna('testiHomepage.sottotitoloHero', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-black"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Testo CTA Primario</label>
                    <input
                      type="text"
                      value={impostazioni.testiHomepage?.testoCtaPrimario || ''}
                      onChange={(e) => aggiorna('testiHomepage.testoCtaPrimario', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Testo CTA Secondario</label>
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
              <h2 className="text-xl font-bold mb-4">Testi Prenotazione</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Titolo Pagina</label>
                  <input
                    type="text"
                    value={impostazioni.testiPrenotazione?.titoloPagina || ''}
                    onChange={(e) => aggiorna('testiPrenotazione.titoloPagina', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Sottotitolo Pagina</label>
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
            <h2 className="text-xl font-bold mb-4">SEO e Metadati</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Titolo Pagina</label>
                <input
                  type="text"
                  value={impostazioni.seo?.titoloPagina || ''}
                  onChange={(e) => aggiorna('seo.titoloPagina', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Descrizione Meta</label>
                <textarea
                  value={impostazioni.seo?.descrizioneMeta || ''}
                  onChange={(e) => aggiorna('seo.descrizioneMeta', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-black"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Keywords (separate da virgola)</label>
                <input
                  type="text"
                  value={impostazioni.seo?.keywords || ''}
                  onChange={(e) => aggiorna('seo.keywords', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Immagine Open Graph</label>
                <input
                  type="text"
                  value={impostazioni.seo?.ogImage || ''}
                  onChange={(e) => aggiorna('seo.ogImage', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:border-black"
                  placeholder="https://esempio.com/og-image.jpg"
                />
              </div>
            </div>
          </div>
        )}

        {/* AVANZATE */}
        {tabAttiva === 'avanzate' && (
          <div className="bg-white p-6 border border-gray-200">
            <h2 className="text-xl font-bold mb-4">Funzionalità</h2>
            <div className="space-y-4">
              {[
                { key: 'mostraOrari', label: 'Mostra Orari di Apertura' },
                { key: 'mostraServizi', label: 'Mostra Sezione Servizi' },
                { key: 'mostraSocial', label: 'Mostra Link Social' },
                { key: 'mostraContatti', label: 'Mostra Informazioni di Contatto' },
                { key: 'abilitaPrenotazioni', label: 'Abilita Sistema Prenotazioni' }
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
