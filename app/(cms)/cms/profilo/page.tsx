/**
 * ============================================================================
 * PAGINA CMS: PROFILO BARBER
 * ============================================================================
 * 
 * FUNZIONALITÀ:
 * - Visualizza e modifica informazioni personali
 * - Gestisce biografia
 * - Gestisce specializzazioni
 * - Gestisce telefono di contatto
 * ============================================================================
 */

'use client';

import { useState, useEffect } from 'react';
import webservice from '@/utils/webservice';
import Card from '@/componenti/interfaccia/Card';
import Bottone from '@/componenti/interfaccia/Bottone';
import Input from '@/componenti/interfaccia/Input';
import Messaggio from '@/componenti/comuni/Messaggio';
import Caricamento from '@/componenti/comuni/Caricamento';

interface Profilo {
  utente: {
    nome: string;
    cognome: string;
    email: string;
  };
  biografia: string;
  specializzazioni: string[];
  telefono: string;
}

export default function ProfiloPage() {
  const [profilo, setProfilo] = useState<Profilo | null>(null);
  const [biografia, setBiografia] = useState('');
  const [specializzazioni, setSpecializzazioni] = useState<string[]>([]);
  const [telefono, setTelefono] = useState('');
  const [nuovaSpecializzazione, setNuovaSpecializzazione] = useState('');
  
  const [caricamento, setCaricamento] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [errore, setErrore] = useState('');
  const [successo, setSuccesso] = useState('');

  useEffect(() => {
    caricaProfilo();
  }, []);

  const caricaProfilo = async () => {
    try {
      setCaricamento(true);
      // Richiede i dati utente per visualizzare nome, cognome, email
      const risposta = await webservice.get('/api/barber/profilo?includeUtente=true');
      
      setProfilo(risposta.dati);
      setBiografia(risposta.dati.biografia || '');
      setSpecializzazioni(risposta.dati.specializzazioni || []);
      setTelefono(risposta.dati.telefono || '');
    } catch (err) {
      setErrore('Errore nel caricamento del profilo');
    } finally {
      setCaricamento(false);
    }
  };

  const handleAggiungiSpecializzazione = () => {
    if (!nuovaSpecializzazione.trim()) {
      setErrore('Inserisci una specializzazione');
      return;
    }

    if (specializzazioni.includes(nuovaSpecializzazione.trim())) {
      setErrore('Specializzazione già presente');
      return;
    }

    setSpecializzazioni([...specializzazioni, nuovaSpecializzazione.trim()]);
    setNuovaSpecializzazione('');
    setSuccesso('Specializzazione aggiunta');
  };

  const handleRimuoviSpecializzazione = (index: number) => {
    setSpecializzazioni(specializzazioni.filter((_, i) => i !== index));
    setSuccesso('Specializzazione rimossa');
  };

  const handleSalva = async () => {
    try {
      setSalvando(true);
      setErrore('');

      await webservice.put('/api/barber/profilo', {
        biografia,
        specializzazioni,
        telefono,
      });

      setSuccesso('Profilo aggiornato con successo!');
      caricaProfilo();
    } catch (err: any) {
      const messaggio = err.response?.data?.errore || 'Errore durante il salvataggio';
      setErrore(messaggio);
    } finally {
      setSalvando(false);
    }
  };

  if (caricamento) return <Caricamento />;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Il Mio Profilo</h1>

      {errore && <Messaggio tipo="errore" messaggio={errore} onChiudi={() => setErrore('')} />}
      {successo && <Messaggio tipo="successo" messaggio={successo} onChiudi={() => setSuccesso('')} />}

      {/* INFORMAZIONI ACCOUNT */}
      <Card titolo="Informazioni Account">
        <div className="space-y-3">
          <div>
            <label className="label">Nome Completo</label>
            <p className="text-lg font-medium">
              {profilo?.utente.nome} {profilo?.utente.cognome}
            </p>
          </div>
          <div>
            <label className="label">Email</label>
            <p className="text-lg">{profilo?.utente.email}</p>
          </div>
          <p className="text-sm text-gray-600 mt-4">
            Per modificare nome ed email, contatta l'amministratore
          </p>
        </div>
      </Card>

      {/* INFORMAZIONI PROFESSIONALI */}
      <Card titolo="Informazioni Professionali" className="mt-6">
        <div className="space-y-4">
          <Input
            label="Telefono"
            type="tel"
            value={telefono}
            onChange={setTelefono}
            placeholder="Es: 3331234567"
          />

          <div>
            <label className="label">Biografia</label>
            <textarea
              value={biografia}
              onChange={(e) => setBiografia(e.target.value)}
              placeholder="Racconta qualcosa di te, della tua esperienza e del tuo stile..."
              className="input-field"
              rows={6}
            />
            <p className="text-sm text-gray-600 mt-1">
              Questa biografia sarà visibile ai clienti
            </p>
          </div>
        </div>
      </Card>

      {/* SPECIALIZZAZIONI */}
      <Card titolo="Specializzazioni" className="mt-6">
        <div className="space-y-4">
          {/* Lista specializzazioni */}
          {specializzazioni.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {specializzazioni.map((spec, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-primary-100 text-primary-800 px-3 py-2 rounded-full"
                >
                  <span>{spec}</span>
                  <button
                    onClick={() => handleRimuoviSpecializzazione(index)}
                    className="text-primary-600 hover:text-primary-800 font-bold"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Form nuova specializzazione */}
          <div className="flex gap-2">
            <Input
              label="Aggiungi Specializzazione"
              value={nuovaSpecializzazione}
              onChange={setNuovaSpecializzazione}
              placeholder="Es: Taglio classico, Barba, Colorazione"
            />
            <div className="flex items-end">
              <Bottone onClick={handleAggiungiSpecializzazione}>
                Aggiungi
              </Bottone>
            </div>
          </div>

          <div className="bg-blue-50 p-3 rounded">
            <p className="text-sm text-blue-800">
              💡 <strong>Suggerimenti:</strong> Taglio classico, Taglio moderno, Barba, 
              Rasatura tradizionale, Colorazione, Trattamenti capelli, Styling
            </p>
          </div>
        </div>
      </Card>

      {/* STATISTICHE */}
      <Card titolo="Statistiche" className="mt-6">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded">
            <p className="text-sm text-gray-600">Appuntamenti Totali</p>
            <p className="text-3xl font-bold text-primary-600">-</p>
            <p className="text-xs text-gray-500 mt-1">Disponibile prossimamente</p>
          </div>
          <div className="bg-gray-50 p-4 rounded">
            <p className="text-sm text-gray-600">Clienti Serviti</p>
            <p className="text-3xl font-bold text-primary-600">-</p>
            <p className="text-xs text-gray-500 mt-1">Disponibile prossimamente</p>
          </div>
          <div className="bg-gray-50 p-4 rounded">
            <p className="text-sm text-gray-600">Valutazione Media</p>
            <p className="text-3xl font-bold text-primary-600">-</p>
            <p className="text-xs text-gray-500 mt-1">Disponibile prossimamente</p>
          </div>
        </div>
      </Card>

      {/* BOTTONE SALVA */}
      <div className="mt-8">
        <Bottone
          onClick={handleSalva}
          disabled={salvando}
          className="w-full md:w-auto"
        >
          {salvando ? 'Salvataggio...' : 'Salva Modifiche'}
        </Bottone>
      </div>
    </div>
  );
}

