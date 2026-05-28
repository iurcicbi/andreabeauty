'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function ContenutoErrore() {
  const searchParams = useSearchParams();
  const errore = searchParams.get('errore') || 'S-a produs o eroare în timpul programării';

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center py-12 px-4">
      <div className="max-w-2xl w-full">
        {/* Error icon */}
        <div className="text-center mb-8">
          <div className="inline-block w-24 h-24 bg-error rounded-full flex items-center justify-center shadow-lg">
            <svg className="w-14 h-14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-surface-container-low border border-outline/20 overflow-hidden">
          {/* Header */}
          <div className="bg-error p-8 text-center">
            <h1 className="font-headline-md text-headline-md text-on-error mb-2">
              Programare nereușită
            </h1>
            <p className="font-body-md text-body-md text-on-error/80">
              S-a produs o problemă în timpul programării
            </p>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Error details */}
            <div className="bg-error-container/30 border-l-4 border-error p-4 mb-6">
              <h3 className="font-headline-sm text-[18px] text-on-error-container mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                Detalii Eroare
              </h3>
              <p className="font-body-md text-body-md text-on-error-container">{errore}</p>
            </div>

            {/* Possible causes */}
            <div className="bg-tertiary-container/20 border-l-4 border-tertiary p-4 mb-6">
              <h3 className="font-headline-sm text-[18px] text-on-tertiary-container mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/></svg>
                Cauze Posibile
              </h3>
              <ul className="font-body-md text-body-md text-on-tertiary-container space-y-2">
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="6"/></svg>
                  <span>Este posibil ca intervalul orar selectat să fi fost deja rezervat</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="6"/></svg>
                  <span>Specialistul poate să-și fi modificat disponibilitatea</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="6"/></svg>
                  <span>Ar putea exista o problemă temporară de conexiune</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="6"/></svg>
                  <span>Data selectată ar putea fi închisă pentru concediu</span>
                </li>
              </ul>
            </div>

            {/* What to do */}
            <div className="bg-primary-container/20 border-l-4 border-primary p-4 mb-6">
              <h3 className="font-headline-sm text-[18px] text-on-primary-container mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
                Ce Poți Face
              </h3>
              <ul className="font-body-md text-body-md text-on-primary-container space-y-2">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-primary">1.</span>
                  <span>Încearcă din nou selectând un alt interval orar disponibil</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-primary">2.</span>
                  <span>Verifică conexiunea la internet și încearcă din nou</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-primary">3.</span>
                  <span>Contactează salonul pentru asistență directă</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-primary">4.</span>
                  <span>Dacă problema persistă, contactează suportul tehnic</span>
                </li>
              </ul>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Link
                href="/booking"
                className="block w-full bg-primary text-on-primary text-center py-4 font-label-caps text-label-caps uppercase tracking-widest hover:opacity-90 transition-all"
              >
                Încearcă din Nou
              </Link>
              <Link
                href="/"
                className="block w-full bg-surface border-2 border-outline/30 text-on-surface text-center py-4 font-label-caps text-label-caps uppercase tracking-widest hover:bg-surface-container-highest transition-all"
              >
                Înapoi la Acasă
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="font-body-md text-body-md text-on-surface-variant">
            Ne cerem scuze pentru neplăceri
          </p>
          <p className="font-label-md text-label-md text-on-surface-variant opacity-70 mt-2">
            Echipa noastră este întotdeauna disponibilă pentru a te ajuta
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PrenotazioneErrorePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <p className="font-body-md text-on-surface-variant">Se încarcă...</p>
      </div>
    }>
      <ContenutoErrore />
    </Suspense>
  );
}
