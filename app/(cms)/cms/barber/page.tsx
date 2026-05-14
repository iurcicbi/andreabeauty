/**
 * PAGINA: LISTA BARBER
 * URL: /cms/barber
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import webservice from '@/utils/webservice';
import Card from '@/componenti/interfaccia/Card';
import Bottone from '@/componenti/interfaccia/Bottone';
import Messaggio from '@/componenti/comuni/Messaggio';
import Caricamento from '@/componenti/comuni/Caricamento';
import { Plus, Edit3, CheckCircle, XCircle, UserCheck, UserX } from 'lucide-react';

interface Barber {
  _id: string;
  utente: {
    nome: string;
    cognome: string;
    email: string;
    telefono: string;
    attivo: boolean;
  };
  biografia: string;
  specializzazioni: string[];
  attivo: boolean;
}

export default function BarberListaPage() {
  const router = useRouter();
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [caricamento, setCaricamento] = useState(true);
  const [errore, setErrore] = useState('');
  const [successo, setSuccesso] = useState('');

  useEffect(() => {
    caricaBarbers();
  }, []);

  const caricaBarbers = async () => {
    try {
      setCaricamento(true);
      const risposta = await webservice.get('/api/barber/gestione');
      setBarbers(risposta.dati);
    } catch (err) {
      setErrore('Errore nel caricamento dei barber');
    } finally {
      setCaricamento(false);
    }
  };

  const handleToggleAttivo = async (barber: Barber) => {
    try {
      await webservice.put(`/api/barber/gestione/${barber._id}`, {
        attivo: !barber.attivo,
      });
      setSuccesso(`Barber ${!barber.attivo ? 'attivato' : 'disattivato'}`);
      caricaBarbers();
    } catch (err: any) {
      const messaggio = err.response?.data?.errore || 'Errore durante l\'aggiornamento';
      setErrore(messaggio);
    }
  };

  if (caricamento) return <Caricamento />;

  const barbersAttivi = barbers.filter(b => b.attivo);
  const barbersInattivi = barbers.filter(b => !b.attivo);

  return (
    <div className="container mx-auto px-2 md:px-4 py-4 md:py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 md:gap-4 mb-4 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-4xl font-bold">Gestione Barber</h1>
          <p className="text-sm md:text-base text-gray-600 mt-1 md:mt-2">
            Totali: {barbers.length} | Attivi: {barbersAttivi.length} | Inattivi: {barbersInattivi.length}
          </p>
        </div>
        <Bottone onClick={() => router.push('/cms/barber/nuovo')} dimensione="small" className="w-full sm:w-auto flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" />
          Nuovo Barber
        </Bottone>
      </div>

      {errore && <Messaggio tipo="errore" messaggio={errore} onChiudi={() => setErrore('')} />}
      {successo && <Messaggio tipo="successo" messaggio={successo} onChiudi={() => setSuccesso('')} />}

      {/* Barber Attivi - Mobile Optimized */}
      {barbersAttivi.length > 0 && (
        <div className="mb-6 md:mb-8">
          <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-green-600" />
            Barber Attivi
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {barbersAttivi.map((barber) => (
              <Card key={barber._id}>
                <div className="space-y-2 md:space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-lg md:text-2xl font-bold flex-shrink-0">
                      {barber.utente.nome[0]}{barber.utente.cognome[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base md:text-xl font-bold truncate">
                        {barber.utente.nome} {barber.utente.cognome}
                      </h3>
                      <p className="text-xs md:text-sm text-gray-600 truncate">{barber.utente.email}</p>
                    </div>
                  </div>

                  {barber.specializzazioni && barber.specializzazioni.length > 0 && (
                    <div>
                      <p className="text-xs md:text-sm font-semibold text-gray-700 mb-1">Specializzazioni:</p>
                      <div className="flex flex-wrap gap-1">
                        {barber.specializzazioni.slice(0, 3).map((spec, i) => (
                          <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                            {spec}
                          </span>
                        ))}
                        {barber.specializzazioni.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                            +{barber.specializzazioni.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-2 pt-2 md:pt-3 border-t">
                    <Bottone 
                      onClick={() => router.push(`/cms/barber/${barber._id}`)} 
                      dimensione="small" 
                      className="flex-1 text-xs md:text-sm flex items-center justify-center gap-1"
                    >
                      <Edit3 className="w-3 h-3" />
                      Modifica
                    </Bottone>
                    <Bottone 
                      onClick={() => handleToggleAttivo(barber)} 
                      dimensione="small" 
                      variante="secondary"
                      className="flex-1 text-xs md:text-sm flex items-center justify-center gap-1"
                    >
                      <XCircle className="w-3 h-3" />
                      Disattiva
                    </Bottone>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Barber Inattivi - Mobile Optimized */}
      {barbersInattivi.length > 0 && (
        <div>
          <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 flex items-center gap-2">
            <UserX className="w-6 h-6 text-red-600" />
            Barber Inattivi
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {barbersInattivi.map((barber) => (
              <Card key={barber._id} className="opacity-60">
                <div className="space-y-2 md:space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gray-400 flex items-center justify-center text-white text-lg md:text-2xl font-bold flex-shrink-0">
                      {barber.utente.nome[0]}{barber.utente.cognome[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base md:text-xl font-bold truncate">
                        {barber.utente.nome} {barber.utente.cognome}
                      </h3>
                      <p className="text-xs md:text-sm text-gray-600 truncate">{barber.utente.email}</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 pt-2 md:pt-3 border-t">
                    <Bottone 
                      onClick={() => router.push(`/cms/barber/${barber._id}`)} 
                      dimensione="small" 
                      className="flex-1 text-xs md:text-sm flex items-center justify-center gap-1"
                    >
                      <Edit3 className="w-3 h-3" />
                      Modifica
                    </Bottone>
                    <Bottone 
                      onClick={() => handleToggleAttivo(barber)} 
                      dimensione="small" 
                      variante="secondary"
                      className="flex-1 text-xs md:text-sm flex items-center justify-center gap-1"
                    >
                      <CheckCircle className="w-3 h-3" />
                      Riattiva
                    </Bottone>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {barbers.length === 0 && (
        <Card>
          <p className="text-center py-8 text-gray-600 text-sm md:text-base">
            Nessun barber presente. Crea il primo barber!
          </p>
        </Card>
      )}
    </div>
  );
}
