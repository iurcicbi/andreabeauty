'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Caricamento from '@/componenti/comuni/Caricamento';
import webservice from '@/utils/webservice';
import { formattaPrezzo } from '@/utils/helpers';

interface ImpostazioniFrontend {
  logo?: string;
  logoAlt?: string;
  logoCentrale?: string;
  nomeAzienda: string;
  tagline?: string;
  telefono?: string;
  email?: string;
  whatsapp?: string;
  indirizzo?: string;
  citta?: string;
  cap?: string;
  provincia?: string;
  orariApertura?: Record<string, string>;
  social?: Record<string, string>;
  sezioniHomepage?: any;
  testiHomepage?: any;
  funzionalita?: any;
}

interface Servizio {
  _id: string;
  nome: string;
  durata: number;
  prezzo: number;
  descrizione?: string;
  categoria?: string;
  attivo?: boolean;
}

export default function HomePage() {
  const [impostazioni, setImpostazioni] = useState<ImpostazioniFrontend | null>(null);
  const [servizi, setServizi] = useState<Servizio[]>([]);
  const [caricamento, setCaricamento] = useState(true);
  const [reviews, setReviews] = useState<any[]>([]);
  const [menuAperto, setMenuAperto] = useState(false);

  useEffect(() => {
    caricaDati();
    caricaReviews();
  }, []);

  const caricaReviews = async () => {
    try {
      const risposta = await webservice.get('/api/reviews?limit=6');
      setReviews(risposta.dati || []);
    } catch (err) {
      console.log('Error loading reviews');
    }
  };

  const caricaDati = async () => {
    try {
      const rispostaImpostazioni = await webservice.get('/api/settings');
      console.log('📦 Impostazioni caricate:', rispostaImpostazioni.dati);
      setImpostazioni(rispostaImpostazioni.dati);

      if (rispostaImpostazioni.dati?.funzionalita?.mostraServizi !== false) {
        const rispostaServizi = await webservice.get('/api/services');
        const serviziAttivi = rispostaServizi.dati.filter((s: Servizio) => s.attivo !== false);
        setServizi(serviziAttivi);
      }
    } catch (err) {
      console.log('Errore caricamento dati');
      setImpostazioni({
        nomeAzienda: 'Beauty Salon',
        tagline: 'Il tuo stile, la nostra passione'
      });
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

  // Determina quali sezioni mostrare
  const sezioniAttive = [];
  const sez = impostazioni?.sezioniHomepage;
  
  if (sez) {
    if (sez.hero?.attiva !== false) sezioniAttive.push({ tipo: 'hero', ordine: sez.hero?.ordine || 1 });
    if (sez.servizi?.attiva !== false) sezioniAttive.push({ tipo: 'servizi', ordine: sez.servizi?.ordine || 2 });
    if (sez.about?.attiva !== false) sezioniAttive.push({ tipo: 'about', ordine: sez.about?.ordine || 3 });
    if (sez.orari?.attiva !== false && impostazioni?.orariApertura) sezioniAttive.push({ tipo: 'orari', ordine: sez.orari?.ordine || 4 });
    if (sez.recensioni?.attiva !== false && reviews.length > 0) sezioniAttive.push({ tipo: 'recensioni', ordine: sez.recensioni?.ordine || 5 });
    if (sez.contatti?.attiva !== false) sezioniAttive.push({ tipo: 'contatti', ordine: sez.contatti?.ordine || 6 });
    if (sez.ctaFinale?.attiva !== false) sezioniAttive.push({ tipo: 'ctaFinale', ordine: sez.ctaFinale?.ordine || 7 });
  } else {
    // Fallback
    sezioniAttive.push(
      { tipo: 'hero', ordine: 1 },
      { tipo: 'servizi', ordine: 2 },
      { tipo: 'about', ordine: 3 },
      { tipo: 'contatti', ordine: 6 },
      { tipo: 'ctaFinale', ordine: 7 }
    );
  }
  
  sezioniAttive.sort((a, b) => a.ordine - b.ordine);

  const getConfig = (tipo: string) => impostazioni?.sezioniHomepage?.[tipo] || {};

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
              <a href="#services" className="text-white/80 hover:text-white transition-colors font-medium">Servizi</a>
              <a href="#about" className="text-white/80 hover:text-white transition-colors font-medium">Chi Siamo</a>
              <a href="#contact" className="text-white/80 hover:text-white transition-colors font-medium">Contatti</a>
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
              <a href="#services" onClick={() => setMenuAperto(false)} className="block text-white/80 hover:text-white transition-colors py-2">Servizi</a>
              <a href="#about" onClick={() => setMenuAperto(false)} className="block text-white/80 hover:text-white transition-colors py-2">Chi Siamo</a>
              <a href="#contact" onClick={() => setMenuAperto(false)} className="block text-white/80 hover:text-white transition-colors py-2">Contatti</a>
              <Link href="/booking" className="block text-center px-6 py-3 bg-white text-black font-bold rounded-none hover:bg-white/90 transition-all border-2 border-white mt-4">
                PRENOTA ORA
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Render sezioni dinamicamente */}
      {sezioniAttive.map(sezione => {
        const config = getConfig(sezione.tipo);
        const key = sezione.tipo;

        // HERO
        if (sezione.tipo === 'hero') {
          const titolo = config.titolo || impostazioni?.testiHomepage?.titoloHero || impostazioni?.nomeAzienda || 'BEAUTY SALON';
          const sottotitolo = config.sottotitolo || impostazioni?.testiHomepage?.sottotitoloHero || impostazioni?.tagline || 'Il tuo stile, la nostra passione';
          const badge = config.badge || impostazioni?.testiHomepage?.badgeHero || 'Premium Beauty Salon';
          
          return (
            <section key={key} id="home" className="relative min-h-screen flex items-center justify-center pt-20">
              <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, white 2px, white 4px)' }}></div>
              </div>
              <div className="container mx-auto px-4 text-center relative z-10">
                <div className="max-w-4xl mx-auto">
                  {(impostazioni?.logoCentrale || impostazioni?.logo) && (
                    <div className="mb-8 flex justify-center">
                      <img src={impostazioni.logoCentrale || impostazioni.logo} alt={impostazioni.nomeAzienda} className="h-32 md:h-48 object-contain" />
                    </div>
                  )}
                  <div className="inline-block mb-8">
                    <div className="px-6 py-2 border border-white/30 backdrop-blur-sm">
                      <span className="text-sm tracking-widest uppercase text-white/80">{badge}</span>
                    </div>
                  </div>
                  {!impostazioni?.logoCentrale && (
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 tracking-tighter">{titolo}</h1>
                  )}
                  <p className="text-xl md:text-2xl text-white/60 mb-12 font-light tracking-wide">{sottotitolo}</p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Link href="/booking" className="group relative px-8 py-4 bg-white text-black font-bold text-lg overflow-hidden transition-all hover:scale-105 w-full sm:w-auto">
                      <span className="relative z-10">PRENOTA APPUNTAMENTO</span>
                    </Link>
                    <a href="#contact" className="px-8 py-4 border-2 border-white text-white font-bold text-lg hover:bg-white hover:text-black transition-all w-full sm:w-auto">
                      DOVE SIAMO
                    </a>
                  </div>
                </div>
              </div>
            </section>
          );
        }

        // SERVIZI
        if (sezione.tipo === 'servizi') {
          const titolo = config.titolo || impostazioni?.testiHomepage?.titoloServizi || 'I NOSTRI SERVIZI';
          const sottotitolo = config.sottotitolo || impostazioni?.testiHomepage?.sottotitoloServizi || 'Qualità e professionalità';
          const mostraPrezzi = config.mostraPrezzi !== false;
          const mostraDurata = config.mostraDurata !== false;
          const layoutGriglia = config.layoutGriglia || 'grid-3';
          
          const gridClass = layoutGriglia === 'grid-2' ? 'md:grid-cols-2' : 
                            layoutGriglia === 'grid-4' ? 'md:grid-cols-2 lg:grid-cols-4' : 
                            'md:grid-cols-2 lg:grid-cols-3';
          
          return (
            <section key={key} id="services" className="py-20 md:py-32 bg-white text-black">
              <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                  <h2 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">{titolo}</h2>
                  <p className="text-xl text-black/60">{sottotitolo}</p>
                </div>
                {servizi.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-xl text-black/60">Nessun servizio disponibile al momento</p>
                  </div>
                ) : (
                  <div className={`grid grid-cols-1 ${gridClass} gap-8 max-w-6xl mx-auto`}>
                    {servizi.map((servizio) => (
                      <div key={servizio._id} className="group relative overflow-hidden bg-black text-white p-8 hover:scale-105 transition-transform">
                        <svg className="w-16 h-16 mb-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                        </svg>
                        <h3 className="text-2xl font-bold mb-4 uppercase">{servizio.nome}</h3>
                        {servizio.descrizione && <p className="text-white/70 mb-6">{servizio.descrizione}</p>}
                        <div className="flex items-center justify-between mb-6">
                          {mostraDurata && (
                            <div className="flex items-center gap-2 text-white/70">
                              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"/>
                                <polyline points="12 6 12 12 16 14"/>
                              </svg>
                              <span>{servizio.durata} min</span>
                            </div>
                          )}
                          {mostraPrezzi && <div className="text-2xl font-bold">{formattaPrezzo(servizio.prezzo)}</div>}
                        </div>
                        <div className="h-1 w-20 bg-white"></div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="text-center mt-12">
                  <Link href="/booking" className="inline-block px-8 py-4 bg-black text-white font-bold text-lg hover:bg-black/90 transition-all">
                    PRENOTA ORA →
                  </Link>
                </div>
              </div>
            </section>
          );
        }

        // ABOUT
        if (sezione.tipo === 'about') {
          const titolo = config.titolo || 'CHI SIAMO';
          const sottotitolo = config.sottotitolo || 'La nostra storia';
          const descrizione = config.descrizione || 'Siamo un team di professionisti appassionati.';
          
          return (
            <section key={key} id="about" className="py-20 md:py-32 bg-black text-white">
              <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto text-center">
                  <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">{titolo}</h2>
                  <p className="text-xl text-white/60 mb-8">{sottotitolo}</p>
                  <p className="text-lg text-white/80 leading-relaxed">{descrizione}</p>
                </div>
              </div>
            </section>
          );
        }

        // CONTATTI
        if (sezione.tipo === 'contatti') {
          const titolo = config.titolo || 'CONTATTACI';
          const sottotitolo = config.sottotitolo || 'Siamo qui per te';
          
          return (
            <section key={key} id="contact" className="py-20 md:py-32 bg-white text-black">
              <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto text-center">
                  <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">{titolo}</h2>
                  <p className="text-xl text-black/60 mb-12">{sottotitolo}</p>
                  <div className="space-y-4">
                    {impostazioni?.telefono && (
                      <div><strong>Telefono:</strong> <a href={`tel:${impostazioni.telefono}`}>{impostazioni.telefono}</a></div>
                    )}
                    {impostazioni?.email && (
                      <div><strong>Email:</strong> <a href={`mailto:${impostazioni.email}`}>{impostazioni.email}</a></div>
                    )}
                    {impostazioni?.indirizzo && (
                      <div><strong>Indirizzo:</strong> {impostazioni.indirizzo}, {impostazioni.citta}</div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          );
        }

        // CTA FINALE
        if (sezione.tipo === 'ctaFinale') {
          const titolo = config.titolo || 'PRONTO PER IL TUO NUOVO LOOK?';
          const sottotitolo = config.sottotitolo || 'Prenota ora';
          
          return (
            <section key={key} className="py-20 md:py-32 bg-black text-white">
              <div className="container mx-auto px-4 text-center">
                <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">{titolo}</h2>
                <p className="text-xl text-white/60 mb-12 max-w-2xl mx-auto">{sottotitolo}</p>
                <Link href="/booking" className="inline-block px-12 py-5 bg-white text-black font-bold text-xl hover:scale-105 transition-transform">
                  PRENOTA SUBITO
                </Link>
              </div>
            </section>
          );
        }

        return null;
      })}

      {/* Footer */}
      <footer className="bg-black text-white/60 py-8 border-t border-white/10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm">
              © {new Date().getFullYear()} {impostazioni?.nomeAzienda || 'Beauty Salon'}. Tutti i diritti riservati.
            </div>
            <div className="flex gap-6 text-sm">
              <a href="#home" className="hover:text-white transition-colors">Home</a>
              <a href="#services" className="hover:text-white transition-colors">Servizi</a>
              <a href="#about" className="hover:text-white transition-colors">Chi Siamo</a>
              <a href="#contact" className="hover:text-white transition-colors">Contatti</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
