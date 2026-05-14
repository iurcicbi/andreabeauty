/**
 * ============================================================================
 * PAGINA CMS: NUOVO APPUNTAMENTO
 * ============================================================================
 * 
 * FUNZIONALITÀ COMPLETE:
 * 1. Select clienti esistenti con ricerca
 * 2. Form per aggiungere nuovo cliente al volo
 * 3. Selezione servizio
 * 4. Calendario per scegliere data
 * 5. Slot orari disponibili automatici
 * 6. Validazione completa
 * 7. Salvataggio automatico cliente se nuovo
 * ============================================================================
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import webservice from '@/utils/webservice';
import Card from '@/componenti/interfaccia/Card';
import Bottone from '@/componenti/interfaccia/Bottone';
import Input from '@/componenti/interfaccia/Input';
import Messaggio from '@/componenti/comuni/Messaggio';
import { formattaPrezzo } from '@/utils/helpers';

interface Cliente {
  _id: string;
  nome: string;
  cognome: string;
  email: string;
  telefono: string;
}

interface Servizio {
  _id: string;
  nome: string;
  durata: number;
  prezzo: number;
  categoria: string;
}

export default function NuovoAppuntamentoPage() {
  const router = useRouter();

  // STATO: Clienti
  const [clienti, setClienti] = useState<Cliente[]>([]);
  const [clienteSelezionato, setClienteSelezionato] = useState('');
  const [mostraFormCliente, setMostraFormCliente] = useState(false);

  // STATO: Nuovo cliente
  const [nuovoCliente, setNuovoCliente] = useState({
    nome: '',
    cognome: '',
    email: '',
    telefono: '',
  });

  // STATO: Servizi
  const [servizi, setServizi] = useState<Servizio[]>([]);
  const [servizioSelezionato, setServizioSelezionato] = useState('');

  // STATO: Data e ora
  const [data, setData] = useState('');
  const [slotDisponibili, setSlotDisponibili] = useState<string[]>([]);
  const [oraSelezionata, setOraSelezionata] = useState('');

  // STATO: Note
  const [note, setNote] = useState('');

  // STATO: UI
  const [caricamento, setCaricamento] = useState(false);
  const [caricamentoSlot, setCaricamentoSlot] = useState(false);
  const [errore, setErrore] = useState('');
  const [successo, setSuccesso] = useState('');

  // Carica clienti e servizi all'avvio
  useEffect(() => {
    caricaClienti();
    caricaServizi();
  }, []);

  // Carica slot disponibili quando cambiano data o servizio
  useEffect(() => {
    if (data && servizioSelezionato) {
      caricaSlotDisponibili();
    }
  }, [data, servizioSelezionato]);

  const caricaClienti = async () => {
    try {
      const risposta = await webservice.get('/api/clienti');
      setClienti(risposta.dati);
    } catch (err) {
      console.error('Errore caricamento clienti:', err);
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
      
      // Recupera ID barber dal localStorage
      const utenteStr = localStorage.getItem('utente');
      if (!utenteStr) return;
      
      const utente = JSON.parse(utenteStr);
      
      const risposta = await webservice.get(
        `/api/appuntamenti/disponibilita?barberId=${utente.id}&servizioId=${servizioSelezionato}&data=${data}`
      );
      
      setSlotDisponibili(risposta.dati.slotDisponibili);
      setOraSelezionata('');  // Reset ora selezionata
    } catch (err) {
      console.error('Errore caricamento slot:', err);
      setSlotDisponibili([]);
    } finally {
      setCaricamentoSlot(false);
    }
  };

  // Funzione per normalizzare il numero di telefono in formato internazionale
  const normalizzaTelefono = (telefono: string): string => {
    // Rimuovi spazi, trattini e altri caratteri, ma mantieni il numero pulito
    let numeroPulito = telefono.replace(/[\s\-\(\)\.]/g, '');
    
    // Se inizia già con +39, restituisci così com'è
    if (numeroPulito.startsWith('+39')) {
      return numeroPulito;
    }
    
    // Se inizia con 39, aggiungi solo il +
    if (numeroPulito.startsWith('39') && numeroPulito.length >= 12) {
      return '+' + numeroPulito;
    }
    
    // Se inizia con 3 (numero mobile italiano), aggiungi +39
    if (numeroPulito.startsWith('3') && numeroPulito.length >= 10) {
      return '+39' + numeroPulito;
    }
    
    // Se inizia con 0 (numero fisso italiano), rimuovi SOLO il primo 0 e aggiungi +39
    if (numeroPulito.startsWith('0') && numeroPulito.length >= 10) {
      return '+39' + numeroPulito.substring(1);
    }
    
    // Altrimenti, aggiungi +39 assumendo sia un numero italiano
    return '+39' + numeroPulito;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validazione
    if (!servizioSelezionato || !data || !oraSelezionata) {
      setErrore('Seleziona servizio, data e orario');
      return;
    }

    if (!clienteSelezionato && !mostraFormCliente) {
      setErrore('Seleziona un cliente o aggiungi uno nuovo');
      return;
    }

    if (mostraFormCliente) {
      if (!nuovoCliente.nome || !nuovoCliente.cognome || !nuovoCliente.telefono) {
        setErrore('Nome, cognome e telefono del cliente sono obbligatori');
        return;
      }
    }

    try {
      setCaricamento(true);
      setErrore('');

      // Recupera ID barber
      const utenteStr = localStorage.getItem('utente');
      if (!utenteStr) {
        setErrore('Sessione scaduta');
        return;
      }
      
      const utente = JSON.parse(utenteStr);

      // Prepara dati appuntamento
      const datiAppuntamento: any = {
        barberId: utente.id,
        servizioId: servizioSelezionato,
        data,
        oraInizio: oraSelezionata,
        note,
      };

      // Aggiungi dati cliente
      if (clienteSelezionato) {
        datiAppuntamento.clienteId = clienteSelezionato;
      } else {
        datiAppuntamento.clienteNome = nuovoCliente.nome;
        datiAppuntamento.clienteCognome = nuovoCliente.cognome;
        datiAppuntamento.clienteEmail = nuovoCliente.email;
        datiAppuntamento.clienteTelefono = normalizzaTelefono(nuovoCliente.telefono);
      }

      // Crea appuntamento
      await webservice.post('/api/appuntamenti', datiAppuntamento);

      setSuccesso('Appuntamento creato con successo!');
      
      // Redirect dopo 2 secondi
      setTimeout(() => {
        router.push('/cms/appuntamenti');
      }, 2000);

    } catch (err: any) {
      const messaggio = err.response?.data?.errore || 'Errore durante la creazione';
      setErrore(messaggio);
    } finally {
      setCaricamento(false);
    }
  };

  const servizioCorrente = servizi.find(s => s._id === servizioSelezionato);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Nuovo Appuntamento</h1>

        {errore && <Messaggio tipo="errore" messaggio={errore} onChiudi={() => setErrore('')} />}
        {successo && <Messaggio tipo="successo" messaggio={successo} />}

        <Card>
          <form onSubmit={handleSubmit}>
            {/* ========== SELEZIONE CLIENTE ========== */}
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-4">1. Cliente</h3>
              
              {!mostraFormCliente ? (
                <>
                  <label className="label">Seleziona Cliente</label>
                  <select
                    value={clienteSelezionato}
                    onChange={(e) => setClienteSelezionato(e.target.value)}
                    className="input-field mb-2"
                  >
                    <option value="">-- Seleziona cliente --</option>
                    {clienti.map((cliente) => (
                      <option key={cliente._id} value={cliente._id}>
                        {cliente.nome} {cliente.cognome} - {cliente.telefono}
                      </option>
                    ))}
                  </select>
                  
                  <button
                    type="button"
                    onClick={() => setMostraFormCliente(true)}
                    className="text-primary-600 hover:text-primary-700 text-sm"
                  >
                    + Aggiungi nuovo cliente
                  </button>
                </>
              ) : (
                <>
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-semibold">Nuovo Cliente</h4>
                      <button
                        type="button"
                        onClick={() => {
                          setMostraFormCliente(false);
                          setNuovoCliente({ nome: '', cognome: '', email: '', telefono: '' });
                        }}
                        className="text-sm text-gray-600 hover:text-gray-800"
                      >
                        Annulla
                      </button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <Input
                        label="Nome"
                        value={nuovoCliente.nome}
                        onChange={(v) => setNuovoCliente({ ...nuovoCliente, nome: v })}
                        required
                      />
                      <Input
                        label="Cognome"
                        value={nuovoCliente.cognome}
                        onChange={(v) => setNuovoCliente({ ...nuovoCliente, cognome: v })}
                        required
                      />
                      <Input
                        label="Telefono"
                        type="tel"
                        value={nuovoCliente.telefono}
                        onChange={(v) => setNuovoCliente({ ...nuovoCliente, telefono: v })}
                        required
                      />
                      <Input
                        label="Email (opzionale)"
                        type="email"
                        value={nuovoCliente.email}
                        onChange={(v) => setNuovoCliente({ ...nuovoCliente, email: v })}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* ========== SELEZIONE SERVIZIO ========== */}
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-4">2. Servizio</h3>
              
              <label className="label">Seleziona Servizio</label>
              <select
                value={servizioSelezionato}
                onChange={(e) => setServizioSelezionato(e.target.value)}
                className="input-field"
                required
              >
                <option value="">-- Seleziona servizio --</option>
                {servizi.map((servizio) => (
                  <option key={servizio._id} value={servizio._id}>
                    {servizio.nome} - {formattaPrezzo(servizio.prezzo)} ({servizio.durata} min)
                  </option>
                ))}
              </select>
            </div>

            {/* ========== SELEZIONE DATA ========== */}
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-4">3. Data</h3>
              
              <Input
                label="Seleziona Data"
                type="date"
                value={data}
                onChange={setData}
                required
              />
            </div>

            {/* ========== SELEZIONE ORARIO ========== */}
            {data && servizioSelezionato && (
              <div className="mb-6">
                <h3 className="text-lg font-bold mb-4">4. Orario</h3>
                
                {caricamentoSlot ? (
                  <p className="text-gray-600">Caricamento slot disponibili...</p>
                ) : slotDisponibili.length > 0 ? (
                  <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                    {slotDisponibili.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setOraSelezionata(slot)}
                        className={`p-3 rounded-lg border-2 transition-colors ${
                          oraSelezionata === slot
                            ? 'border-primary-600 bg-primary-100 text-primary-700 font-semibold'
                            : 'border-gray-300 hover:border-primary-400'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-red-600">Nessuno slot disponibile per questa data</p>
                )}
              </div>
            )}

            {/* ========== NOTE ========== */}
            <div className="mb-6">
              <label className="label">Note (opzionale)</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Eventuali note o richieste particolari..."
                className="input-field"
                rows={3}
              />
            </div>

            {/* ========== RIEPILOGO ========== */}
            {servizioCorrente && oraSelezionata && (
              <div className="bg-primary-50 p-4 rounded-lg mb-6">
                <h3 className="font-bold mb-2">Riepilogo</h3>
                <p><strong>Servizio:</strong> {servizioCorrente.nome}</p>
                <p><strong>Durata:</strong> {servizioCorrente.durata} minuti</p>
                <p><strong>Prezzo:</strong> {formattaPrezzo(servizioCorrente.prezzo)}</p>
                <p><strong>Data:</strong> {new Date(data).toLocaleDateString('it-IT')}</p>
                <p><strong>Orario:</strong> {oraSelezionata}</p>
              </div>
            )}

            {/* ========== BOTTONI ========== */}
            <div className="flex gap-4">
              <Bottone
                type="submit"
                disabled={caricamento}
                className="flex-1"
              >
                {caricamento ? 'Creazione...' : 'Crea Appuntamento'}
              </Bottone>
              
              <Bottone
                type="button"
                variante="secondary"
                onClick={() => router.back()}
              >
                Annulla
              </Bottone>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
