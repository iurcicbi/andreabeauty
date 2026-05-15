/**
 * PAGINA: SERVIZI
 * 
 * Mostra tutti i servizi disponibili raggruppati per categoria.
 * 
 * FLUSSO:
 * 1. Carica i servizi dall'API
 * 2. Raggruppa per categoria
 * 3. Mostra in card con dettagli
 */

'use client';

import { useEffect, useState } from 'react';
import webservice from '@/utils/webservice';
import Card from '@/componenti/interfaccia/Card';
import Caricamento from '@/componenti/comuni/Caricamento';
import Messaggio from '@/componenti/comuni/Messaggio';
import { formattaPrezzo } from '@/utils/helpers';

interface Servizio {
  _id: string;
  nome: string;
  descrizione: string;
  durata: number;
  prezzo: number;
  categoria: string;
}

export default function ServiziPage() {
  const [servizi, setServizi] = useState<Servizio[]>([]);
  const [caricamento, setCaricamento] = useState(true);
  const [errore, setErrore] = useState('');

  useEffect(() => {
    caricaServizi();
  }, []);

  const caricaServizi = async () => {
    try {
      setCaricamento(true);
      const risposta = await webservice.get('/api/services');
      setServizi(risposta.dati);
    } catch (err) {
      setErrore('Errore nel caricamento dei servizi');
      console.error(err);
    } finally {
      setCaricamento(false);
    }
  };

  // Raggruppa servizi per categoria
  const serviziPerCategoria = servizi.reduce((acc, servizio) => {
    if (!acc[servizio.categoria]) {
      acc[servizio.categoria] = [];
    }
    acc[servizio.categoria].push(servizio);
    return acc;
  }, {} as Record<string, Servizio[]>);

  const nomiCategorie: Record<string, string> = {
    capelli: 'Capelli',
    barba: 'Barba',
    trattamenti: 'Trattamenti',
    colorazione: 'Colorazione',
    altro: 'Altro',
  };

  if (caricamento) return <Caricamento />;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8 text-gray-800">I Nostri Servizi</h1>

        {errore && <Messaggio tipo="errore" messaggio={errore} onChiudi={() => setErrore('')} />}

        {Object.entries(serviziPerCategoria).map(([categoria, serviziCategoria]) => (
          <div key={categoria} className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-gray-700">
              {nomiCategorie[categoria] || categoria}
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {serviziCategoria.map((servizio) => (
                <Card key={servizio._id}>
                  <h3 className="text-xl font-bold mb-2">{servizio.nome}</h3>
                  <p className="text-gray-600 mb-4">{servizio.descrizione}</p>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-500">Durata</p>
                      <p className="font-semibold">{servizio.durata} min</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Prezzo</p>
                      <p className="font-bold text-primary-600 text-xl">
                        {formattaPrezzo(servizio.prezzo)}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}

        {servizi.length === 0 && !caricamento && (
          <p className="text-center text-gray-500 py-8">
            Nessun servizio disponibile al momento.
          </p>
        )}
      </div>
    </div>
  );
}
