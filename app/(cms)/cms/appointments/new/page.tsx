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
      const risposta = await webservice.get('/api/clients');
      setClienti(risposta.dati);
    } catch (err) {
      console.error('Errore caricamento clienti:', err);
    }
  };

  const caricaServizi = async () => {
    try {
      const risposta = await webservice.get('/api/services');
      setServizi(risposta.dati);
    } catch (err) {
      console.error('Errore caricamento servizi:', err);
    }
  };

  const caricaSlotDisponibili = async () => {
    try {
      setCaricamentoSlot(true);
      
      // Recupera ID specialist dal localStorage
      const utenteStr = localStorage.getItem('utente');
      if (!utenteStr) return;
      
      const utente = JSON.parse(utenteStr);
      
      const risposta = await webservice.get(
        `/api/appointments/availability?specialistId=${utente.id}&servizioId=${servizioSelezionato}&data=${data}`
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
      setErrore('Selectează serviciu, dată și oră');
      return;
    }

    if (!clienteSelezionato && !mostraFormCliente) {
      setErrore('Selectează un client sau adaugă unul nou');
      return;
    }

    if (mostraFormCliente) {
      if (!nuovoCliente.nome || !nuovoCliente.cognome || !nuovoCliente.telefono) {
        setErrore('Numele, prenumele și telefonul clientului sunt obligatorii');
        return;
      }
    }

    try {
      setCaricamento(true);
      setErrore('');

      // Recupera ID specialist
      const utenteStr = localStorage.getItem('utente');
      if (!utenteStr) {
        setErrore('Sesiune expirată');
        return;
      }
      
      const utente = JSON.parse(utenteStr);

      // Prepara dati appuntamento
      const datiAppuntamento: any = {
        specialistaId: utente.id,
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
      await webservice.post('/api/appointments', datiAppuntamento);

      setSuccesso('Programare creată cu succes!');
      
      // Redirect dopo 2 secondi
      setTimeout(() => {
        router.push('/cms/appointments');
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
        <h1 className="text-2xl md:text-4xl font-bold mb-4 md:mb-8">Programare Nouă</h1>

        {errore && <Messaggio tipo="errore" messaggio={errore} onChiudi={() => setErrore('')} />}
        {successo && <Messaggio tipo="successo" messaggio={successo} />}

        <Card>
          <form onSubmit={handleSubmit}>
            {/* ========== SELEZIONE CLIENTE ========== */}
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-4">1. Client</h3>
              
              {!mostraFormCliente ? (
                <>
                  <label className="label">Selectează Client</label>
                  <select
                    value={clienteSelezionato}
                    onChange={(e) => setClienteSelezionato(e.target.value)}
                    className="input-field mb-2"
                  >
                    <option value="">-- Selectează client --</option>
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
                    + Adaugă client nou
                  </button>
                </>
              ) : (
                <>
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-semibold">Client Nou</h4>
                      <button
                        type="button"
                        onClick={() => {
                          setMostraFormCliente(false);
                          setNuovoCliente({ nome: '', cognome: '', email: '', telefono: '' });
                        }}
                        className="text-sm text-gray-600 hover:text-gray-800"
                      >
                        Anulare
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                      <Input
                        label="Prenume"
                        value={nuovoCliente.nome}
                        onChange={(v) => setNuovoCliente({ ...nuovoCliente, nome: v })}
                        required
                      />
                      <Input
                        label="Nume"
                        value={nuovoCliente.cognome}
                        onChange={(v) => setNuovoCliente({ ...nuovoCliente, cognome: v })}
                        required
                      />
                      <Input
                        label="Telefon"
                        type="tel"
                        value={nuovoCliente.telefono}
                        onChange={(v) => setNuovoCliente({ ...nuovoCliente, telefono: v })}
                        required
                      />
                      <Input
                        label="Email (opțional)"
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
              <h3 className="text-lg font-bold mb-4">2. Serviciu</h3>
              
              <label className="label">Selectează Serviciu</label>
              <select
                value={servizioSelezionato}
                onChange={(e) => setServizioSelezionato(e.target.value)}
                className="input-field"
                required
              >
                <option value="">-- Selectează serviciu --</option>
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
                label="Selectează Data"
                type="date"
                value={data}
                onChange={setData}
                required
              />
            </div>

            {/* ========== SELEZIONE ORARIO ========== */}
            {data && servizioSelezionato && (
              <div className="mb-6">
                <h3 className="text-lg font-bold mb-4">4. Oră</h3>
                
                {caricamentoSlot ? (
                  <p className="text-gray-600">Se încarcă sloturile disponibile...</p>
                ) : slotDisponibili.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
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
                  <p className="text-red-600">Nici un slot disponibil pentru această dată</p>
                )}
              </div>
            )}

            {/* ========== NOTE ========== */}
            <div className="mb-6">
              <label className="label">Note (opțional)</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Note sau cereri speciale..."
                className="input-field"
                rows={3}
              />
            </div>

            {/* ========== RIEPILOGO ========== */}
            {servizioCorrente && oraSelezionata && (
              <div className="bg-primary-50 p-4 rounded-lg mb-6">
                <h3 className="font-bold mb-2">Rezumat</h3>
                <p><strong>Servizio:</strong> {servizioCorrente.nome}</p>
                <p><strong>Durata:</strong> {servizioCorrente.durata} minuti</p>
                <p><strong>Prezzo:</strong> {formattaPrezzo(servizioCorrente.prezzo)}</p>
                <p><strong>Data:</strong> {new Date(data).toLocaleDateString('it-IT')}</p>
                <p><strong>Orario:</strong> {oraSelezionata}</p>
              </div>
            )}

            {/* ========== BOTTONI ========== */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Bottone
                type="submit"
                disabled={caricamento}
                className="w-full sm:flex-1"
              >
                {caricamento ? 'Creare...' : 'Creează Programare'}
              </Bottone>
              
              <Bottone
                type="button"
                variante="secondary"
                onClick={() => router.back()}
                className="w-full sm:w-auto"
              >
                Anulare
              </Bottone>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
