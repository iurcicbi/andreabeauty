/**
 * ============================================================================
 * PAGINA CMS: MODIFICA APPUNTAMENTO
 * ============================================================================
 * 
 * URL: /cms/appuntamenti/[id]
 * 
 * FUNZIONALITÀ:
 * - Carica dati appuntamento esistente
 * - Modifica data, ora, servizio
 * - Cambia stato (confermato, completato, cancellato)
 * - Aggiorna note
 * ============================================================================
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import webservice from '@/utils/webservice';
import { 
  AlertTriangle, 
  User, 
  Save, 
  Trash2, 
  Lock,
  Info
} from 'lucide-react';
import Card from '@/componenti/interfaccia/Card';
import Bottone from '@/componenti/interfaccia/Bottone';
import Input from '@/componenti/interfaccia/Input';
import Messaggio from '@/componenti/comuni/Messaggio';
import Caricamento from '@/componenti/comuni/Caricamento';
import { formattaPrezzo } from '@/utils/helpers';

interface Appuntamento {
  _id: string;
  utente: {
    _id: string;
    nome: string;
    cognome: string;
    email: string;
    telefono: string;
  };
  servizio: {
    _id: string;
    nome: string;
    durata: number;
    prezzo: number;
  };
  data: string;
  oraInizio: string;
  oraFine: string;
  stato: string;
  note?: string;
}

interface Servizio {
  _id: string;
  nome: string;
  durata: number;
  prezzo: number;
}

interface SlotOrario {
  ora: string;
  disponibile: boolean;
}

export default function ModificaAppuntamentoPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [appuntamento, setAppuntamento] = useState<Appuntamento | null>(null);
  const [servizi, setServizi] = useState<Servizio[]>([]);
  
  // Dati modificabili
  const [servizioSelezionato, setServizioSelezionato] = useState('');
  const [data, setData] = useState('');
  const [slotDisponibili, setSlotDisponibili] = useState<SlotOrario[]>([]);
  const [oraSelezionata, setOraSelezionata] = useState('');
  const [stato, setStato] = useState('');
  const [note, setNote] = useState('');

  // UI
  const [caricamento, setCaricamento] = useState(true);
  const [caricamentoSlot, setCaricamentoSlot] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [errore, setErrore] = useState('');
  const [successo, setSuccesso] = useState('');
  
  // Controlla se l'appuntamento è nel passato
  const [isPassato, setIsPassato] = useState(false);

  useEffect(() => {
    caricaAppuntamento();
    caricaServizi();
  }, [id]);

  useEffect(() => {
    if (data && servizioSelezionato && appuntamento) {
      caricaSlotDisponibili();
    }
  }, [data, servizioSelezionato]);

  const caricaAppuntamento = async () => {
    try {
      setCaricamento(true);
      const risposta = await webservice.get(`/api/appuntamenti/${id}`);
      const app = risposta.dati;
      
      setAppuntamento(app);
      setServizioSelezionato(app.servizio._id);
      setData(app.data.split('T')[0]);
      setOraSelezionata(app.oraInizio);
      setStato(app.stato);
      setNote(app.note || '');
      
      // Controlla se l'appuntamento è nel passato
      const dataApp = new Date(app.data);
      const oggi = new Date();
      oggi.setHours(0, 0, 0, 0);
      
      if (dataApp < oggi) {
        setIsPassato(true);
      }
    } catch (err: any) {
      setErrore(err.response?.data?.errore || 'Errore caricamento appuntamento');
    } finally {
      setCaricamento(false);
    }
  };

  const caricaServizi = async () => {
    try {
      const risposta = await webservice.get('/api/servizi');
      setServizi(risposta.dati);
    } catch (err) {
      console.error('Errore caricamento servizi:', err);
    }
  };

  const caricaSlotDisponibili = async () => {
    try {
      setCaricamentoSlot(true);
      
      const utenteStr = localStorage.getItem('utente');
      if (!utenteStr) return;
      
      const utente = JSON.parse(utenteStr);
      const servizio = servizi.find(s => s._id === servizioSelezionato);
      
      if (!servizio) return;
      
      const risposta = await webservice.get('/api/appuntamenti/disponibilita', {
        params: {
          barberId: utente.id,
          data: data,
          durata: servizio.durata,
        },
      });
      
      // L'API restituisce array di oggetti { ora: string, disponibile: boolean }
      let slots: SlotOrario[] = risposta.dati.slot || [];
      
      // Assicurati che l'orario corrente sia sempre nella lista
      // (così l'utente può mantenere lo stesso orario anche se ora è occupato da questo appuntamento)
      const oraCorrenteEsiste = slots.find(s => s.ora === oraSelezionata);
      if (!oraCorrenteEsiste && oraSelezionata) {
        slots.push({ ora: oraSelezionata, disponibile: true });
        slots.sort((a, b) => a.ora.localeCompare(b.ora));
      }
      
      setSlotDisponibili(slots);
    } catch (err) {
      console.error('Errore caricamento slot:', err);
      // In caso di errore, mostra almeno l'orario corrente
      setSlotDisponibili([{ ora: oraSelezionata, disponibile: true }]);
    } finally {
      setCaricamentoSlot(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!servizioSelezionato || !data || !oraSelezionata || !stato) {
      setErrore('Tutti i campi sono obbligatori');
      return;
    }

    try {
      setSalvando(true);
      setErrore('');

      await webservice.put(`/api/appuntamenti/${id}`, {
        servizioId: servizioSelezionato,
        data,
        oraInizio: oraSelezionata,
        stato,
        note,
      });

      setSuccesso('✓ Appuntamento aggiornato con successo!');
      
      setTimeout(() => {
        router.push('/cms/appuntamenti');
      }, 1500);

    } catch (err: any) {
      const messaggio = err.response?.data?.errore || 'Errore durante l\'aggiornamento';
      setErrore(messaggio);
    } finally {
      setSalvando(false);
    }
  };

  const handleElimina = async () => {
    if (!confirm('Sei sicuro di voler eliminare questo appuntamento?')) return;

    try {
      setSalvando(true);
      await webservice.delete(`/api/appuntamenti/${id}`);
      
      setSuccesso('✓ Appuntamento eliminato');
      
      setTimeout(() => {
        router.push('/cms/appuntamenti');
      }, 1500);
    } catch (err: any) {
      setErrore(err.response?.data?.errore || 'Errore durante l\'eliminazione');
      setSalvando(false);
    }
  };

  if (caricamento) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Caricamento />
      </div>
    );
  }

  if (!appuntamento) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <p className="text-center text-red-600">Appuntamento non trovato</p>
        </Card>
      </div>
    );
  }

  const servizioCorrente = servizi.find(s => s._id === servizioSelezionato);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">Modifica Appuntamento</h1>
          <button
            onClick={() => router.push('/cms/appuntamenti')}
            className="text-gray-600 hover:text-gray-800"
          >
            ← Indietro
          </button>
        </div>

        {errore && <Messaggio tipo="errore" messaggio={errore} onChiudi={() => setErrore('')} />}
        {successo && <Messaggio tipo="successo" messaggio={successo} />}

        {/* Banner Appuntamento Passato */}
        {isPassato && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-amber-500" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-bold text-yellow-800">
                  Appuntamento Passato
                </h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Questo appuntamento è già trascorso e non può essere modificato. 
                  Puoi visualizzare i dettagli ma non salvare modifiche.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Info Cliente */}
        <Card className="mb-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            Cliente
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Nome</p>
              <p className="font-semibold">{appuntamento.utente.nome} {appuntamento.utente.cognome}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Telefono</p>
              <p className="font-semibold">{appuntamento.utente.telefono}</p>
            </div>
            {appuntamento.utente.email && (
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-semibold">{appuntamento.utente.email}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Form Modifica */}
        <Card>
          <form onSubmit={handleSubmit}>
            {/* Servizio */}
            <div className="mb-6">
              <label className="label">Servizio</label>
              <select
                value={servizioSelezionato}
                onChange={(e) => setServizioSelezionato(e.target.value)}
                className="input-field"
                disabled={isPassato}
                required
              >
                {servizi.map((servizio) => (
                  <option key={servizio._id} value={servizio._id}>
                    {servizio.nome} - {formattaPrezzo(servizio.prezzo)} ({servizio.durata} min)
                  </option>
                ))}
              </select>
            </div>

            {/* Data */}
            <div className="mb-6">
              <Input
                label="Data"
                type="date"
                value={data}
                onChange={setData}
                disabled={isPassato}
                required
              />
            </div>

            {/* Orario */}
            {data && servizioSelezionato && (
              <div className="mb-6">
                <label className="label">Orario</label>
                
                {caricamentoSlot ? (
                  <p className="text-gray-600">Caricamento slot...</p>
                ) : slotDisponibili.length > 0 ? (
                  <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                    {slotDisponibili.map((slot) => (
                      <button
                        key={slot.ora}
                        type="button"
                        onClick={() => !isPassato && slot.disponibile && setOraSelezionata(slot.ora)}
                        disabled={!slot.disponibile || isPassato}
                        className={`p-3 rounded-lg border-2 transition-colors ${
                          oraSelezionata === slot.ora
                            ? 'border-primary-600 bg-primary-100 text-primary-700 font-semibold'
                            : slot.disponibile && !isPassato
                            ? 'border-gray-300 hover:border-primary-400 cursor-pointer'
                            : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                        title={!slot.disponibile ? 'Orario già occupato' : isPassato ? 'Appuntamento passato' : ''}
                      >
                        {slot.ora}
                        {!slot.disponibile && slot.ora !== oraSelezionata && (
                          <span className="block text-xs">🔒</span>
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-red-600">Nessuno slot disponibile</p>
                )}
                
                {slotDisponibili.some(s => !s.disponibile) && !isPassato && (
                  <p className="text-sm text-gray-600 mt-2">
                    🔒 = Orario già occupato da un altro appuntamento
                  </p>
                )}
              </div>
            )}

            {/* Stato */}
            <div className="mb-6">
              <label className="label">Stato</label>
              <select
                value={stato}
                onChange={(e) => setStato(e.target.value)}
                className="input-field"
                disabled={isPassato}
                required
              >
                <option value="in_attesa">In Attesa</option>
                <option value="confermato">Confermato</option>
                <option value="completato">Completato</option>
                <option value="cancellato">Cancellato</option>
              </select>
            </div>

            {/* Note */}
            <div className="mb-6">
              <label className="label">Note</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Eventuali note..."
                className="input-field"
                disabled={isPassato}
                rows={3}
              />
            </div>

            {/* Riepilogo */}
            {servizioCorrente && (
              <div className="bg-primary-50 p-4 rounded-lg mb-6">
                <h3 className="font-bold mb-2">📋 Riepilogo</h3>
                <p><strong>Servizio:</strong> {servizioCorrente.nome}</p>
                <p><strong>Durata:</strong> {servizioCorrente.durata} minuti</p>
                <p><strong>Prezzo:</strong> {formattaPrezzo(servizioCorrente.prezzo)}</p>
                <p><strong>Data:</strong> {new Date(data).toLocaleDateString('it-IT')}</p>
                <p><strong>Orario:</strong> {oraSelezionata}</p>
                <p><strong>Stato:</strong> <span className="capitalize">{stato.replace('_', ' ')}</span></p>
              </div>
            )}

            {/* Bottoni */}
            <div className="flex gap-4">
              <Bottone
                type="submit"
                disabled={salvando || isPassato}
                className="flex-1"
              >
                {salvando ? 'Salvataggio...' : isPassato ? (
                  <span className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Non Modificabile
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    Salva Modifiche
                  </span>
                )}
              </Bottone>
              
              <Bottone
                type="button"
                variante="secondary"
                onClick={() => router.push('/cms/appuntamenti')}
              >
                {isPassato ? 'Chiudi' : 'Annulla'}
              </Bottone>
              
              {!isPassato && (
                <Bottone
                  type="button"
                  variante="danger"
                  onClick={handleElimina}
                  disabled={salvando}
                >
                  <Trash2 className="w-4 h-4 inline mr-1" />
                  Elimina
                </Bottone>
              )}
            </div>
            
            {isPassato && (
              <p className="text-sm text-gray-600 text-center mt-4 flex items-center justify-center gap-2">
                <Info className="w-4 h-4" />
                Gli appuntamenti passati non possono essere modificati o eliminati
              </p>
            )}
          </form>
        </Card>
      </div>
    </div>
  );
}
