/**
 * ============================================================================
 * PAGINA: ERRORE PRENOTAZIONE
 * ============================================================================
 * 
 * Mostra messaggio di errore quando la prenotazione fallisce
 * ============================================================================
 */

'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function PrenotazioneErrorePage() {
  const searchParams = useSearchParams();
  const errore = searchParams.get('errore') || 'Si è verificato un errore durante la prenotazione';

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-2xl w-full">
        
        {/* Icona Errore */}
        <div className="text-center mb-8">
          <div className="inline-block w-32 h-32 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center shadow-2xl">
            <svg className="w-20 h-20 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        </div>

        {/* Card Principale */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-red-500 to-red-600 p-8 text-center">
            <h1 className="text-4xl font-bold text-white mb-2">
              ❌ Prenotazione Non Riuscita
            </h1>
            <p className="text-red-100 text-lg">
              Si è verificato un problema durante la prenotazione
            </p>
          </div>

          {/* Contenuto */}
          <div className="p-8">
            
            {/* Messaggio Errore */}
            <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-xl mb-6">
              <h3 className="font-bold text-red-900 mb-2 flex items-center gap-2">
                <span>⚠️</span>
                <span>Dettagli Errore</span>
              </h3>
              <p className="text-red-800">{errore}</p>
            </div>

            {/* Possibili Cause */}
            <div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-r-xl mb-6">
              <h3 className="font-bold text-amber-900 mb-3 flex items-center gap-2">
                <span>💡</span>
                <span>Possibili Cause</span>
              </h3>
              <ul className="text-sm text-amber-800 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-0.5">•</span>
                  <span>Lo slot orario selezionato potrebbe essere stato prenotato da un altro utente</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-0.5">•</span>
                  <span>Il barber potrebbe aver modificato i suoi orari di disponibilità</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-0.5">•</span>
                  <span>Potrebbe esserci un problema temporaneo di connessione</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-0.5">•</span>
                  <span>La data selezionata potrebbe essere stata chiusa per ferie</span>
                </li>
              </ul>
            </div>

            {/* Cosa Fare */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-xl mb-6">
              <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                <span>🔧</span>
                <span>Cosa Puoi Fare</span>
              </h3>
              <ul className="text-sm text-blue-800 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">1.</span>
                  <span>Riprova a prenotare selezionando un altro orario disponibile</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">2.</span>
                  <span>Verifica la tua connessione internet e riprova</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">3.</span>
                  <span>Contatta il barber direttamente per assistenza</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">4.</span>
                  <span>Se il problema persiste, contatta il supporto tecnico</span>
                </li>
              </ul>
            </div>

            {/* Azioni */}
            <div className="space-y-3">
              <Link
                href="/prenotazione"
                className="block w-full bg-gradient-to-r from-primary-600 to-purple-600 text-white text-center py-4 rounded-xl font-bold text-lg hover:shadow-lg transition-all transform hover:scale-105"
              >
                🔄 Riprova a Prenotare
              </Link>

              <Link
                href="/"
                className="block w-full bg-white border-2 border-gray-300 text-gray-700 text-center py-4 rounded-xl font-bold text-lg hover:bg-gray-50 transition-all"
              >
                🏠 Torna alla Home
              </Link>

              <Link
                href="/"
                className="block w-full text-center py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                🏠 Torna alla Home
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-600">
            Ci scusiamo per l'inconveniente 🙏
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Il nostro team è sempre disponibile per aiutarti
          </p>
        </div>
      </div>
    </div>
  );
}
