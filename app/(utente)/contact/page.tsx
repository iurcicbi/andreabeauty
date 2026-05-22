'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Caricamento from '@/componenti/comuni/Caricamento';
import webservice from '@/utils/webservice';

interface ImpostazioniFrontend {
  logo?: string;
  logoAlt?: string;
  nomeAzienda: string;
  tagline?: string;
  email?: string;
  telefono?: string;
  whatsapp?: string;
  indirizzo?: string;
  citta?: string;
  cap?: string;
  provincia?: string;
  paese?: string;
  coordinate?: {
    lat: number;
    lng: number;
  };
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
}

export default function ContattiPage() {
  const [impostazioni, setImpostazioni] = useState<ImpostazioniFrontend | null>(null);
  const [caricamento, setCaricamento] = useState(true);

  useEffect(() => {
    caricaImpostazioni();
  }, []);

  const caricaImpostazioni = async () => {
    try {
      const risposta = await webservice.get('/api/settings');
      setImpostazioni(risposta.dati);
    } catch (err) {
      console.log('Nessuna impostazione trovata');
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

  if (!impostazioni) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white/60">Informazioni non disponibili</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Page Header */}
      <div className="bg-white text-black py-16 md:py-24 pt-20 md:pt-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">
            CONTATTI
          </h1>
          {impostazioni.tagline && (
            <p className="text-xl md:text-2xl text-black/60">{impostazioni.tagline}</p>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 md:py-24 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
          
          {/* Informazioni di Contatto */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 tracking-tight">
              INFORMAZIONI
            </h2>
            <div className="space-y-6">
              {impostazioni.indirizzo && (
                <div className="flex items-start gap-4">
                  <svg className="w-6 h-6 flex-shrink-0 mt-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  <div>
                    <p className="font-bold text-lg mb-1">Indirizzo</p>
                    <p className="text-white/70">
                      {impostazioni.indirizzo}<br/>
                      {impostazioni.cap} {impostazioni.citta} {impostazioni.provincia && `(${impostazioni.provincia})`}<br/>
                      {impostazioni.paese}
                    </p>
                  </div>
                </div>
              )}

              {impostazioni.telefono && (
                <div className="flex items-start gap-4">
                  <svg className="w-6 h-6 flex-shrink-0 mt-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                  <div>
                    <p className="font-bold text-lg mb-1">Telefono</p>
                    <a href={`tel:${impostazioni.telefono}`} className="text-white/70 hover:text-white transition-colors">
                      {impostazioni.telefono}
                    </a>
                  </div>
                </div>
              )}

              {impostazioni.email && (
                <div className="flex items-start gap-4">
                  <svg className="w-6 h-6 flex-shrink-0 mt-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  <div>
                    <p className="font-bold text-lg mb-1">Email</p>
                    <a href={`mailto:${impostazioni.email}`} className="text-white/70 hover:text-white transition-colors">
                      {impostazioni.email}
                    </a>
                  </div>
                </div>
              )}

              {impostazioni.whatsapp && (
                <div className="flex items-start gap-4">
                  <svg className="w-6 h-6 flex-shrink-0 mt-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                  </svg>
                  <div>
                    <p className="font-bold text-lg mb-1">WhatsApp</p>
                    <a 
                      href={`https://wa.me/${impostazioni.whatsapp.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/70 hover:text-white transition-colors"
                    >
                      {impostazioni.whatsapp}
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Social Media */}
            {(impostazioni.social?.facebook || impostazioni.social?.instagram) && (
              <div className="mt-8 pt-8 border-t border-white/10">
                <p className="font-bold text-lg mb-4">SEGUICI SU:</p>
                <div className="flex gap-3">
                  {impostazioni.social.facebook && (
                    <a
                      href={impostazioni.social.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 border-2 border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-all"
                      aria-label="Facebook"
                    >
                      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </a>
                  )}
                  {impostazioni.social.instagram && (
                    <a
                      href={impostazioni.social.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 border-2 border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-all"
                      aria-label="Instagram"
                    >
                      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Orari di Apertura */}
          {impostazioni.orariApertura && (
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-8 tracking-tight">
                ORARI
              </h2>
              <div className="space-y-4">
                {Object.entries(impostazioni.orariApertura).map(([giorno, orario]) => (
                  orario && (
                    <div key={giorno} className="flex justify-between items-center py-3 border-b border-white/10 last:border-0">
                      <span className="font-medium uppercase tracking-wide">
                        {giorno.charAt(0).toUpperCase() + giorno.slice(1)}
                      </span>
                      <span className={`font-bold ${orario.toLowerCase().includes('chiuso') ? 'text-red-500' : 'text-white'}`}>
                        {orario}
                      </span>
                    </div>
                  )
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Mappa */}
        {impostazioni.coordinate && (
          <div className="mt-12 bg-white/5 backdrop-blur-sm border border-white/10 p-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 tracking-tight">
              DOVE SIAMO
            </h2>
            <div className="aspect-video w-full overflow-hidden">
              <iframe
                src={`https://www.google.com/maps?q=${impostazioni.coordinate.lat},${impostazioni.coordinate.lng}&output=embed`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <div className="mt-6">
              <a
                href={`https://www.google.com/maps?q=${impostazioni.coordinate.lat},${impostazioni.coordinate.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-6 py-3 bg-white text-black font-bold hover:bg-white/90 transition-all"
              >
                APRI IN GOOGLE MAPS →
              </a>
            </div>
          </div>
        )}

        {/* CTA Prenotazione */}
        <div className="mt-16 text-center">
          <Link
            href="/booking"
            className="inline-block px-12 py-5 bg-white text-black font-bold text-xl hover:scale-105 transition-transform"
          >
            PRENOTA APPUNTAMENTO
          </Link>
        </div>
      </div>
    </div>
  );
}
