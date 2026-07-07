/**
 * PAGINA CMS: CRUSCOTTO (DASHBOARD)
 * 
 * Dashboard principale per lo specialist con:
 * - Appuntamenti di oggi
 * - Statistiche rapide
 * - Prossimi appuntamenti
 * 
 * ACCESSO: Solo utenti con ruolo 'specialist'
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import webservice from '@/utils/webservice';
import Card from '@/componenti/interfaccia/Card';
import Bottone from '@/componenti/interfaccia/Bottone';
import Caricamento from '@/componenti/comuni/Caricamento';
import Messaggio from '@/componenti/comuni/Messaggio';
import { formattaData, formattaPrezzo } from '@/utils/helpers';
import { Bell, Clock, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';

interface Appuntamento {
  _id: string;
  utente: {
    nome: string;
    cognome: string;
    telefono: string;
  };
  servizio: {
    nome: string;
    prezzo: number;
  };
  data: string;
  oraInizio: string;
  oraFine: string;
  stato: string;
}

export default function CruscottoPage() {
  const router = useRouter();
  const [appuntamenti, setAppuntamenti] = useState<Appuntamento[]>([]);
  const [caricamento, setCaricamento] = useState(true);
  const [errore, setErrore] = useState('');

  useEffect(() => {
    caricaAppuntamenti();
  }, []);

  const caricaAppuntamenti = async () => {
    try {
      setCaricamento(true);
      
      // Carica appuntamenti di oggi
      const oggi = new Date().toISOString().split('T')[0];
      const risposta = await webservice.get(`/api/appointments?data=${oggi}`);
      
      setAppuntamenti(risposta.dati);
    } catch (err: any) {
      if (err.response?.status === 401) {
        setErrore('Trebuie să te autentifici ca specialist');
      } else {
        setErrore('Eroare la încărcarea programărilor');
      }
    } finally {
      setCaricamento(false);
    }
  };

  // Calcola statistiche
  const appuntamentiConfermati = appuntamenti.filter(a => a.stato === 'confermato').length;
  const appuntamentiInAttesa = appuntamenti.filter(a => a.stato === 'in_attesa').length;
  const ricavoGiornaliero = appuntamenti
    .filter(a => a.stato === 'completato')
    .reduce((sum, a) => sum + a.servizio.prezzo, 0);

  if (caricamento) return <Caricamento />;

  return (
    <div className="min-h-screen bg-gray-50 py-4 md:py-8">
      <div className="container mx-auto px-3 md:px-4">
        <h1 className="text-xl md:text-4xl font-bold mb-4 md:mb-8 text-gray-800">Panou de control</h1>

        {errore && <Messaggio tipo="errore" messaggio={errore} onChiudi={() => setErrore('')} />}

        {/* Notificare - programări astăzi */}
        {appuntamenti.length > 0 && (
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-4 md:p-6 mb-4 md:mb-8 text-white shadow-lg">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 rounded-full p-3 shrink-0">
                <Bell className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-base md:text-lg">
                  Ai {appuntamenti.length} programări astăzi
                </p>
                <p className="text-sm text-white/80 mt-1">
                  {appuntamentiInAttesa > 0
                    ? `${appuntamentiInAttesa} dintre ele sunt în așteptare`
                    : 'Toate programările sunt confirmate'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Statistiche */}
        <div className="grid grid-cols-3 gap-2 md:gap-6 mb-4 md:mb-8">
          <Card className="h-full">
            <div className="text-center flex flex-col items-center justify-center h-full">
              <p className="text-[10px] md:text-base text-gray-600 mb-1 md:mb-2">Programări astăzi</p>
              <p className="text-xl md:text-4xl font-bold text-primary-600">{appuntamenti.length}</p>
            </div>
          </Card>

          <Card className="h-full">
            <div className="text-center flex flex-col items-center justify-center h-full">
              <p className="text-[10px] md:text-base text-gray-600 mb-1 md:mb-2">În așteptare</p>
              <p className="text-xl md:text-4xl font-bold text-yellow-600">{appuntamentiInAttesa}</p>
            </div>
          </Card>

          <Card className="h-full">
            <div className="text-center flex flex-col items-center justify-center h-full">
              <p className="text-[10px] md:text-base text-gray-600 mb-1 md:mb-2">Venit astăzi</p>
              <p className="text-xl md:text-4xl font-bold text-green-600">
                {formattaPrezzo(ricavoGiornaliero)}
              </p>
            </div>
          </Card>
        </div>

        {/* Programări în așteptare */}
        {appuntamentiInAttesa > 0 && (
          <Card titolo="În așteptare" className="mb-4 md:mb-6 border-l-4 border-yellow-400">
            <div className="space-y-3">
              {appuntamenti.filter(a => a.stato === 'in_attesa').map((app) => (
                <div
                  key={app._id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-yellow-50/50"
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5 shrink-0" />
                      <div>
                        <h3 className="font-bold text-base md:text-lg">
                          {app.utente.nome} {app.utente.cognome}
                        </h3>
                        <p className="text-sm md:text-base text-gray-600">{app.servizio.nome}</p>
                        <p className="text-xs md:text-sm text-gray-500">{app.utente.telefono}</p>
                      </div>
                    </div>
                    <div className="sm:text-right flex sm:block items-center gap-3 sm:gap-0">
                      <div className="flex items-center gap-1 sm:justify-end">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <p className="font-bold text-primary-600 text-sm md:text-base">
                          {app.oraInizio} - {app.oraFine}
                        </p>
                      </div>
                      <span className="inline-block px-3 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800 font-medium">
                        {app.stato}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Programări confirmate / Toate */}
        <Card
          titolo={appuntamentiConfermati > 0 ? 'Programări confirmate' : 'Programări de astăzi'}
        >
          {appuntamenti.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-lg">Nicio programare pentru astăzi</p>
              <p className="text-gray-400 text-sm mt-1">Este o zi liniștită! 🎉</p>
            </div>
          ) : (
            <div className="space-y-3">
              {(appuntamentiConfermati > 0
                ? appuntamenti.filter(a => a.stato !== 'in_attesa')
                : appuntamenti
              ).map((app) => (
                <div
                  key={app._id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                    <div>
                      <h3 className="font-bold text-base md:text-lg">
                        {app.utente.nome} {app.utente.cognome}
                      </h3>
                      <p className="text-sm md:text-base text-gray-600">{app.servizio.nome}</p>
                      <p className="text-xs md:text-sm text-gray-500">{app.utente.telefono}</p>
                    </div>
                    <div className="sm:text-right flex sm:block items-center gap-3 sm:gap-0">
                      <div className="flex items-center gap-1 sm:justify-end">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <p className="font-bold text-primary-600 text-sm md:text-base">
                          {app.oraInizio} - {app.oraFine}
                        </p>
                      </div>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          app.stato === 'confermato'
                            ? 'bg-green-100 text-green-800'
                            : app.stato === 'completat'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {app.stato}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Link către programări */}
        <div className="mt-4 md:mt-6 text-center">
          <Bottone
            variant="chiaro"
            onClick={() => router.push('/cms/appointments')}
          >
            Vezi toate programările <ArrowRight className="w-4 h-4 inline" />
          </Bottone>
        </div>
      </div>
    </div>
  );
}
