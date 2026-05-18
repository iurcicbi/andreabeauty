/**
 * ============================================================================
 * PAGINA: PRENOTAZIONE CONFERMATA CON SUCCESSO
 * ============================================================================
 * 
 * Mostra conferma della prenotazione con tutti i dettagli e azioni successive
 * ============================================================================
 */

'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function ContenutoSuccesso() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState(10);

  // Recupera dati dalla query string
  const specialistNome = searchParams.get('specialist');
  const servizio = searchParams.get('servizio');
  const data = searchParams.get('data');
  const ora = searchParams.get('ora');
  const prezzo = searchParams.get('prezzo');

  useEffect(() => {
    // Countdown per redirect automatico
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

  // Formatta la data
  const dataFormattata = data ? new Date(data).toLocaleDateString('it-IT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }) : '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-2xl w-full">
        
        {/* Animazione Successo */}
        <div className="text-center mb-8 animate-bounce">
          <div className="inline-block w-32 h-32 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-2xl">
            <svg className="w-20 h-20 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        {/* Card Principale */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-8 text-center">
            <h1 className="text-4xl font-bold text-white mb-2">
              🎉 Prenotazione Confermata!
            </h1>
            <p className="text-green-100 text-lg">
              Il tuo appuntamento è stato registrato con successo
            </p>
          </div>

          {/* Dettagli Prenotazione */}
          <div className="p-8">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                📋 Dettagli Appuntamento
              </h2>

              <div className="space-y-4">
                {/* Specialist */}
                <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center text-2xl">
                      💈
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Specialist</p>
                      <p className="font-bold text-lg text-gray-800">{specialistNome}</p>
                    </div>
                  </div>
                </div>

                {/* Servizio */}
                <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-2xl">
                      ✂️
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Servizio</p>
                      <p className="font-bold text-lg text-gray-800">{servizio}</p>
                    </div>
                  </div>
                  {prezzo && (
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Prezzo</p>
                      <p className="font-bold text-xl text-primary-600">{prezzo}</p>
                    </div>
                  )}
                </div>

                {/* Data e Ora */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white rounded-xl shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center text-2xl">
                        📅
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Data</p>
                        <p className="font-bold text-gray-800">{dataFormattata}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-white rounded-xl shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-2xl">
                        🕐
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Orario</p>
                        <p className="font-bold text-gray-800">{ora}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Informazioni Importanti */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-xl mb-6">
              <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                <span>ℹ️</span>
                <span>Informazioni Importanti</span>
              </h3>
              <ul className="text-sm text-blue-800 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>Riceverai una conferma via email con tutti i dettagli</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>Ti consigliamo di arrivare 5 minuti prima dell&apos;orario prenotato</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>Puoi prenotare altri appuntamenti dalla homepage</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>In caso di imprevisti, ti preghiamo di avvisare con almeno 2 ore di anticipo</span>
                </li>
              </ul>
            </div>

            {/* Azioni */}
            <div className="space-y-3">
              <Link
                href="/"
                className="block w-full bg-gradient-to-r from-primary-600 to-purple-600 text-white text-center py-4 rounded-xl font-bold text-lg hover:shadow-lg transition-all transform hover:scale-105"
              >
                🏠 Torna alla Home
              </Link>

              <Link
                href="/booking"
                className="block w-full bg-white border-2 border-gray-300 text-gray-700 text-center py-4 rounded-xl font-bold text-lg hover:bg-gray-50 transition-all"
              >
                ➕ Prenota un Altro Appuntamento
              </Link>

              <Link
                href="/"
                className="block w-full text-center py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                🏠 Torna alla Home
              </Link>
            </div>

            {/* Countdown */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Verrai reindirizzato alla home tra{' '}
                <span className="font-bold text-primary-600">{countdown}</span> secondi
              </p>
              <button
                onClick={() => router.push('/')}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium mt-1"
              >
                Vai subito →
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-600">
            Grazie per aver scelto il nostro servizio! 💈
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Per qualsiasi domanda, non esitare a contattarci
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PrenotazioneSuccessoPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>}>
      <ContenutoSuccesso />
    </Suspense>
  );
}
