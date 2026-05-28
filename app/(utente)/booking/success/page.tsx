'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function ContenutoSuccesso() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState(10);

  const specialistNome = searchParams.get('specialist');
  const servizio = searchParams.get('servizio');
  const data = searchParams.get('data');
  const ora = searchParams.get('ora');
  const prezzo = searchParams.get('prezzo');
  const sede = searchParams.get('sede');
  const postazione = searchParams.get('postazione');

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [router]);

  const dataFormattata = data ? new Date(data).toLocaleDateString('ro-RO', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  }) : '';

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center py-12 px-4">
      <div className="max-w-2xl w-full">
        {/* Success icon */}
        <div className="text-center mb-8">
          <div className="inline-block w-24 h-24 bg-primary rounded-full flex items-center justify-center shadow-lg">
            <svg className="w-14 h-14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-surface-container-low border border-outline/20 overflow-hidden">
          {/* Header */}
          <div className="bg-primary p-8 text-center">
            <h1 className="font-headline-md text-headline-md text-on-primary mb-2">
              Programare Confirmată!
            </h1>
            <p className="font-body-md text-body-md text-on-primary/80">
              Programarea ta a fost înregistrată cu succes
            </p>
          </div>

          {/* Details */}
          <div className="p-8">
            <div className="bg-surface-variant/30 p-6 mb-6">
              <h2 className="font-headline-sm text-headline-sm mb-6 text-center">
                Detalii Programare
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-surface border border-outline/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-container rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    </div>
                    <div>
                      <p className="font-label-md text-label-md text-on-surface-variant">Specialist</p>
                      <p className="font-body-md text-body-md font-bold text-on-surface">{specialistNome}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-surface border border-outline/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-container rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22c3.314 0 6-2.686 6-6 0-3.314-2.686-6-6-6-3.314 0-6 2.686-6 6 0 3.314 2.686 6 6 6z"/><path d="M12 10V2"/><path d="M8 6h8"/></svg>
                    </div>
                    <div>
                      <p className="font-label-md text-label-md text-on-surface-variant">Serviciu</p>
                      <p className="font-body-md text-body-md font-bold text-on-surface">{servizio}</p>
                    </div>
                  </div>
                  {prezzo && (
                    <div className="text-right">
                      <p className="font-label-md text-label-md text-on-surface-variant">Preț</p>
                      <p className="font-headline-sm text-headline-sm text-primary">{prezzo}</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-surface border border-outline/10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-container rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                      </div>
                      <div>
                        <p className="font-label-md text-label-md text-on-surface-variant">Data</p>
                        <p className="font-body-md text-body-md font-bold text-on-surface">{dataFormattata}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-surface border border-outline/10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-container rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      </div>
                      <div>
                        <p className="font-label-md text-label-md text-on-surface-variant">Ora</p>
                        <p className="font-body-md text-body-md font-bold text-on-surface">{ora}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {sede && (
                  <div className="p-4 bg-surface border border-outline/10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-container rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                      </div>
                      <div>
                        <p className="font-label-md text-label-md text-on-surface-variant">Locație</p>
                        <p className="font-body-md text-body-md font-bold text-on-surface">{sede}</p>
                        {postazione && <p className="font-label-md text-label-md text-on-surface-variant">Postație: {postazione}</p>}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Important info */}
            <div className="bg-primary-container/20 border-l-4 border-primary p-4 mb-6">
              <h3 className="font-headline-sm text-[18px] text-on-primary-container mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                Informații Importante
              </h3>
              <ul className="font-body-md text-body-md text-on-primary-container space-y-2">
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                  <span>Vei primi o confirmare cu toate detaliile</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                  <span>Te rugăm să ajungi cu 5 minute înainte de ora programată</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                  <span>Poți programa alte servicii din pagina principală</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                  <span>În caz de neprevăzut, te rugăm să anunți cu cel puțin 2 ore înainte</span>
                </li>
              </ul>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Link
                href="/"
                className="block w-full bg-primary text-on-primary text-center py-4 font-label-caps text-label-caps uppercase tracking-widest hover:opacity-90 transition-all"
              >
                Înapoi la Acasă
              </Link>
              <Link
                href="/booking"
                className="block w-full bg-surface border-2 border-outline/30 text-on-surface text-center py-4 font-label-caps text-label-caps uppercase tracking-widest hover:bg-surface-container-highest transition-all"
              >
                Programează un Alt Serviciu
              </Link>
            </div>

            {/* Countdown */}
            <div className="mt-6 text-center">
              <p className="font-body-md text-body-md text-on-surface-variant">
                Vei fi redirecționat către pagina principală în{' '}
                <span className="font-bold text-primary">{countdown}</span> secunde
              </p>
              <button
                onClick={() => router.push('/')}
                className="font-label-caps text-label-caps text-primary underline mt-1"
              >
                Mergi acum
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="font-body-md text-body-md text-on-surface-variant">
            Îți mulțumim pentru alegerea făcută!
          </p>
          <p className="font-label-md text-label-md text-on-surface-variant opacity-70 mt-2">
            Pentru orice întrebare, nu ezita să ne contactezi
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PrenotazioneSuccessoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <p className="font-body-md text-on-surface-variant">Se încarcă...</p>
      </div>
    }>
      <ContenutoSuccesso />
    </Suspense>
  );
}
