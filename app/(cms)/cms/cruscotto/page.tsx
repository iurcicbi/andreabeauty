/**
 * PAGINA CMS: CRUSCOTTO (DASHBOARD)
 * 
 * Dashboard principale per il barber con:
 * - Appuntamenti di oggi
 * - Statistiche rapide
 * - Prossimi appuntamenti
 * 
 * ACCESSO: Solo utenti con ruolo 'barber'
 */

'use client';

import { useEffect, useState } from 'react';
import webservice from '@/utils/webservice';
import Card from '@/componenti/interfaccia/Card';
import Caricamento from '@/componenti/comuni/Caricamento';
import Messaggio from '@/componenti/comuni/Messaggio';
import { formattaData, formattaPrezzo } from '@/utils/helpers';

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
      const risposta = await webservice.get(`/api/appuntamenti?data=${oggi}`);
      
      setAppuntamenti(risposta.dati);
    } catch (err: any) {
      if (err.response?.status === 401) {
        setErrore('Devi effettuare il login come barber');
      } else {
        setErrore('Errore nel caricamento degli appuntamenti');
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8 text-gray-800">Dashboard Barber</h1>

        {errore && <Messaggio tipo="errore" messaggio={errore} onChiudi={() => setErrore('')} />}

        {/* Statistiche */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <div className="text-center">
              <p className="text-gray-600 mb-2">Appuntamenti Oggi</p>
              <p className="text-4xl font-bold text-primary-600">{appuntamenti.length}</p>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <p className="text-gray-600 mb-2">In Attesa</p>
              <p className="text-4xl font-bold text-yellow-600">{appuntamentiInAttesa}</p>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <p className="text-gray-600 mb-2">Ricavo Oggi</p>
              <p className="text-4xl font-bold text-green-600">
                {formattaPrezzo(ricavoGiornaliero)}
              </p>
            </div>
          </Card>
        </div>

        {/* Lista Appuntamenti */}
        <Card titolo="Appuntamenti di Oggi">
          {appuntamenti.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Nessun appuntamento per oggi
            </p>
          ) : (
            <div className="space-y-4">
              {appuntamenti.map((app) => (
                <div
                  key={app._id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg">
                        {app.utente.nome} {app.utente.cognome}
                      </h3>
                      <p className="text-gray-600">{app.servizio.nome}</p>
                      <p className="text-sm text-gray-500">{app.utente.telefono}</p>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-bold text-primary-600">
                        {app.oraInizio} - {app.oraFine}
                      </p>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm mt-2 ${
                          app.stato === 'confermato'
                            ? 'bg-green-100 text-green-800'
                            : app.stato === 'in_attesa'
                            ? 'bg-yellow-100 text-yellow-800'
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
      </div>
    </div>
  );
}
