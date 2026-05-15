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
  funzionalita?: {
    mostraOrari?: boolean;
    mostraServizi?: boolean;
    mostraSocial?: boolean;
    mostraContatti?: boolean;
  };
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
      // Carica impostazioni globali
      const rispostaImpostazioni = await webservice.get('/api/settings');
      console.log('📦 Impostazioni caricate:', rispostaImpostazioni.dati);
      setImpostazioni(rispostaImpostazioni.dati);

      // Carica servizi attivi solo se abilitati
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

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-30">
            {/* Logo */}
            <div className="flex items-center gap-3">
              {impostazioni?.logo ? (
                <img 
                  src={impostazioni.logo} 
                  alt={impostazioni.logoAlt || impostazioni.nomeAzienda}
                  className="h-[70px] md:h-[100px] object-contain"
                />
              ) : (
                <svg className="w-8 h-8 md:w-10 md:h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                  <path d="M12 8v8M8 12h8"/>
                </svg>
              )}
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#home" className="text-white/80 hover:text-white transition-colors font-medium">Home</a>
              <Link href="/contact" className="text-white/80 hover:text-white transition-colors font-medium">Contatti</Link>
              <Link 
                href="/booking"
                className="px-6 py-3 bg-white text-black font-bold rounded-none hover:bg-white/90 transition-all border-2 border-white"
              >
                PRENOTA ORA
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMenuAperto(!menuAperto)}
              className="md:hidden text-white p-2"
            >
              <div className="w-6 h-5 flex flex-col justify-between">
                <span className={`w-full h-0.5 bg-white transition-all ${menuAperto ? 'rotate-45 translate-y-2' : ''}`}></span>
                <span className={`w-full h-0.5 bg-white transition-all ${menuAperto ? 'opacity-0' : ''}`}></span>
                <span className={`w-full h-0.5 bg-white transition-all ${menuAperto ? '-rotate-45 -translate-y-2' : ''}`}></span>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuAperto && (
          <div className="md:hidden bg-black border-t border-white/10">
            <div className="container mx-auto px-4 py-6 space-y-4">
              <a href="#home" onClick={() => setMenuAperto(false)} className="block text-white/80 hover:text-white transition-colors py-2">Home</a>
              <Link href="/contact" onClick={() => setMenuAperto(false)} className="block text-white/80 hover:text-white transition-colors py-2">Contatti</Link>
              <Link 
                href="/booking"
                className="block text-center px-6 py-3 bg-white text-black font-bold rounded-none hover:bg-white/90 transition-all border-2 border-white mt-4"
              >
                PRENOTA ORA
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center justify-center pt-20">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, white 2px, white 4px)',
          }}></div>
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            {/* Logo Centrale (se disponibile) */}
            {(impostazioni?.logoCentrale || impostazioni?.logo) && (
              <div className="mb-8 flex justify-center">
                <img 
                  src={impostazioni.logoCentrale || impostazioni.logo} 
                  alt={impostazioni.logoAlt || impostazioni.nomeAzienda}
                  className="h-32 md:h-48 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}

            {/* Badge */}
            <div className="inline-block mb-8">
              <div className="px-6 py-2 border border-white/30 backdrop-blur-sm">
                <span className="text-sm tracking-widest uppercase text-white/80">
                  {impostazioni?.testiHomepage?.badgeHero || 'Premium Beauty Salon'}
                </span>
              </div>
            </div>

            {/* Main Title - mostra solo se non c'è logo centrale */}
            {!impostazioni?.logoCentrale && (
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 tracking-tighter">
                {impostazioni?.testiHomepage?.titoloHero || impostazioni?.nomeAzienda || 'BEAUTY SALON'}
              </h1>
            )}

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-white/60 mb-12 font-light tracking-wide">
              {impostazioni?.testiHomepage?.sottotitoloHero || impostazioni?.tagline || 'Il tuo stile, la nostra passione'}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/booking"
                className="group relative px-8 py-4 bg-white text-black font-bold text-lg overflow-hidden transition-all hover:scale-105 w-full sm:w-auto"
              >
                <span className="relative z-10">
                  {impostazioni?.testiHomepage?.testoCtaPrimario || 'PRENOTA APPUNTAMENTO'}
                </span>
                <div className="absolute inset-0 bg-black transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white z-20">
                  {impostazioni?.testiHomepage?.testoCtaPrimario || 'PRENOTA APPUNTAMENTO'} →
                </span>
              </Link>

              <Link
                href="/contact"
                className="px-8 py-4 border-2 border-white text-white font-bold text-lg hover:bg-white hover:text-black transition-all w-full sm:w-auto"
              >
                {impostazioni?.testiHomepage?.testoCtaSecondario || 'DOVE SIAMO'}
              </Link>
            </div>

            {/* Info rapide */}
            {impostazioni?.funzionalita?.mostraContatti !== false && (impostazioni?.telefono || impostazioni?.indirizzo) && (
              <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 text-white/60">
                {impostazioni?.telefono && (
                  <a href={`tel:${impostazioni.telefono}`} className="flex items-center gap-2 hover:text-white transition-colors">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                    <span>{impostazioni.telefono}</span>
                  </a>
                )}
                {impostazioni?.indirizzo && impostazioni?.citta && (
                  <>
                    {impostazioni?.telefono && <span className="hidden sm:block">|</span>}
                    <span className="flex items-center gap-2">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                        <circle cx="12" cy="10" r="3"/>
                      </svg>
                      <span>{impostazioni.indirizzo}, {impostazioni.citta}</span>
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
            <div className="w-1 h-3 bg-white/50 rounded-full"></div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      {impostazioni?.funzionalita?.mostraServizi !== false && (
      <section id="servizi" className="py-20 md:py-32 bg-white text-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">
              {impostazioni?.testiHomepage?.titoloServizi || 'I NOSTRI SERVIZI'}
            </h2>
            <p className="text-xl text-black/60">
              {impostazioni?.testiHomepage?.sottotitoloServizi || 'Qualità e professionalità per il tuo look perfetto'}
            </p>
          </div>

          {servizi.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl text-black/60">Nessun servizio disponibile al momento</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {servizi.map((servizio) => (
                <div key={servizio._id} className="group relative overflow-hidden bg-black text-white p-8 hover:scale-105 transition-transform">
                  <svg className="w-16 h-16 mb-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                  </svg>
                  <h3 className="text-2xl font-bold mb-4 uppercase">{servizio.nome}</h3>
                  {servizio.descrizione && (
                    <p className="text-white/70 mb-6">{servizio.descrizione}</p>
                  )}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2 text-white/70">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                      </svg>
                      <span>{servizio.durata} min</span>
                    </div>
                    <div className="text-2xl font-bold">{formattaPrezzo(servizio.prezzo)}</div>
                  </div>
                  <div className="h-1 w-20 bg-white"></div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              href="/booking"
              className="inline-block px-8 py-4 bg-black text-white font-bold text-lg hover:bg-black/90 transition-all"
            >
              PRENOTA ORA →
            </Link>
          </div>
        </div>
      </section>
      )}

      {/* Orari Section */}
      {impostazioni?.funzionalita?.mostraOrari !== false && impostazioni?.orariApertura && (
        <section id="orari" className="py-20 md:py-32 bg-black">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">
                  {impostazioni?.testiHomepage?.titoloOrari || 'ORARI DI APERTURA'}
                </h2>
                <p className="text-xl text-white/60">
                  {impostazioni?.testiHomepage?.sottotitoloOrari || 'Siamo qui per te'}
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 md:p-12">
                <div className="space-y-4">
                  {Object.entries(impostazioni.orariApertura).map(([giorno, orario]) => (
                    orario && (
                      <div key={giorno} className="flex justify-between items-center py-4 border-b border-white/10 last:border-0">
                        <span className="text-lg md:text-xl font-medium uppercase tracking-wide">
                          {giorno}
                        </span>
                        <span className={`text-lg md:text-xl font-bold ${orario.toLowerCase().includes('chiuso') ? 'text-red-500' : 'text-white'}`}>
                          {orario}
                        </span>
                      </div>
                    )
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Reviews Section */}
      {reviews.length > 0 && (
        <section className="py-20 md:py-32 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Ce spun clienții noștri</h2>
              <p className="text-xl text-gray-600">Opiniile voastre contează</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {reviews.slice(0, 6).map((review: any) => (
                <div key={review._id} className="bg-white rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center gap-1 mb-3 text-yellow-400 text-lg">
                    {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                  </div>
                  <p className="text-gray-700 mb-4 italic">{review.comment}</p>
                  {review.reply && (
                    <div className="ml-3 pl-3 border-l-2 border-primary-200 mb-3">
                      <p className="text-xs font-semibold text-primary-600 mb-1">Răspuns:</p>
                      <p className="text-sm text-gray-600">{review.reply}</p>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-3 border-t">
                    <span className="font-semibold text-sm">{review.customerName}</span>
                    <span className="text-xs text-gray-400">{review.serviceName}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Final */}
      <section className="py-20 md:py-32 bg-white text-black">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
            {impostazioni?.testiHomepage?.titoloCtaFinale || 'PRONTO PER IL TUO NUOVO LOOK?'}
          </h2>
          <p className="text-xl text-black/60 mb-12 max-w-2xl mx-auto">
            {impostazioni?.testiHomepage?.sottotitoloCtaFinale || 'Prenota ora il tuo appuntamento e affidati ai nostri professionisti'}
          </p>
          <Link
            href="/booking"
            className="inline-block px-12 py-5 bg-black text-white font-bold text-xl hover:scale-105 transition-transform"
          >
            {impostazioni?.testiHomepage?.testoCtaPrimario || 'PRENOTA SUBITO'}
          </Link>
        </div>
      </section>
    </div>
  );
}
