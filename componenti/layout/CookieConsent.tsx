'use client';

import { useState, useEffect } from 'react';
import webservice from '@/utils/webservice';

export default function CookieConsent() {
  const [consentito, setConsentito] = useState(true);
  const [linkPrivacy, setLinkPrivacy] = useState('');
  const [linkCookie, setLinkCookie] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('cookieConsent');
    if (!stored) {
      setConsentito(false);
    }
    webservice.get('/api/settings')
      .then((r) => {
        setLinkPrivacy(r.dati?.linkPrivacyPolicy || '');
        setLinkCookie(r.dati?.linkCookiePolicy || '');
      })
      .catch(() => {});
  }, []);

  const accetta = () => {
    localStorage.setItem('cookieConsent', 'true');
    setConsentito(true);
  };

  if (consentito) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#1e1b14]/95 backdrop-blur-sm text-white px-4 py-4 md:py-3">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        <p className="text-xs md:text-sm leading-relaxed text-center md:text-left" style={{ fontFamily: 'Manrope, sans-serif' }}>
          Acest site utilizează cookie-uri esențiale pentru funcționarea corectă.
          Prin continuarea navigării, ești de acord cu
          {linkCookie ? (
            <a href={linkCookie} target="_blank" rel="noopener noreferrer" className="underline mx-1 hover:text-[#C49A8C] transition-colors">Politica privind Cookie-urile</a>
          ) : <span className="mx-1">Politica privind Cookie-urile</span>}
          și
          {linkPrivacy ? (
            <a href={linkPrivacy} target="_blank" rel="noopener noreferrer" className="underline mx-1 hover:text-[#C49A8C] transition-colors">Politica de Confidențialitate</a>
          ) : <span className="mx-1">Politica de Confidențialitate</span>}.
        </p>
        <button
          onClick={accetta}
          className="bg-[#C49A8C] hover:bg-[#b0897a] text-white text-xs font-bold px-6 py-2.5 uppercase tracking-widest transition-colors whitespace-nowrap"
          style={{ fontFamily: 'Manrope, sans-serif' }}
        >
          Accept
        </button>
      </div>
    </div>
  );
}
