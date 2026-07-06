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

const dateToLocalString = (data: Date): string => {
  const anno = data.getFullYear();
  const mese = String(data.getMonth() + 1).padStart(2, '0');
  const giorno = String(data.getDate()).padStart(2, '0');
  return `${anno}-${mese}-${giorno}`;
};

const nomiMesi = ['Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie',
  'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie'];

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
  const [slotOrari, setSlotOrari] = useState<{ ora: string; disponibile: boolean }[]>([]);
  const [oraSelezionata, setOraSelezionata] = useState('');

  // STATO: Calendario
  const [mese, setMese] = useState(new Date().getMonth());
  const [anno, setAnno] = useState(new Date().getFullYear());
  const [specialistClosures, setSpecialistClosures] = useState<any[]>([]);

  // STATO: Note
  const [note, setNote] = useState('');

  // STATO: UI
  const [caricamento, setCaricamento] = useState(false);
  const [caricamentoSlot, setCaricamentoSlot] = useState(false);
  const [errore, setErrore] = useState('');
  const [successo, setSuccesso] = useState('');
  const [specialistaId, setSpecialistaId] = useState('');
  const [caricamentoSpecialista, setCaricamentoSpecialista] = useState(true);

  // Carica clienti, servizi e profilo specialista all'avvio
  useEffect(() => {
    caricaClienti();
    caricaServizi();
    caricaProfiloSpecialista();
  }, []);

  // Carica slot disponibili quando cambiano data, servizio o profilo specialista
  useEffect(() => {
    if (data && servizioSelezionato && specialistaId) {
      caricaSlotDisponibili();
    }
  }, [data, servizioSelezionato, specialistaId]);

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

  const caricaProfiloSpecialista = async () => {
    try {
      const risposta = await webservice.get('/api/specialist/profile');
      if (risposta.dati && risposta.dati._id) {
        setSpecialistaId(risposta.dati._id);
        setSpecialistClosures(risposta.dati.giorniChiusura || []);
      }
    } catch (err) {
      console.error('Errore caricamento profilo specialista:', err);
    } finally {
      setCaricamentoSpecialista(false);
    }
  };

  const isDisponibile = (giorno: Date): boolean => {
    const oggi = new Date();
    oggi.setHours(0, 0, 0, 0);
    if (giorno < oggi) return false;
    if (giorno.getDay() === 0) return false;
    const dataStr = dateToLocalString(giorno);
    const chiusura = specialistClosures.find((c: any) => {
      const dataChiusura = typeof c.data === 'string' ? c.data.split('T')[0] : dateToLocalString(new Date(c.data));
      return dataChiusura === dataStr;
    });
    if (chiusura) return false;
    return true;
  };

  const handleSelezionaData = (giorno: Date) => {
    const dataStr = dateToLocalString(giorno);
    setData(dataStr);
    setOraSelezionata('');
  };

  const caricaSlotDisponibili = async () => {
    try {
      setCaricamentoSlot(true);
      if (!specialistaId) return;

      const servizio = servizi.find(s => s._id === servizioSelezionato);
      if (!servizio) return;

      const risposta = await webservice.get('/api/appointments/availability', {
        params: {
          specialistId: specialistaId,
          data: data,
          durata: servizio.durata,
        },
      });

      setSlotOrari(risposta.dati.slot || []);
      setOraSelezionata('');
    } catch (err) {
      console.error('Errore caricamento slot:', err);
      setSlotOrari([]);
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

      if (!specialistaId) {
        setErrore('Profilul specialistului nu a fost găsit');
        return;
      }

      // Prepara dati appuntamento
      const datiAppuntamento: any = {
        specialistaId: specialistaId,
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
      const messaggio = err.response?.data?.errore || 'Eroare în timpul creării';
      setErrore(messaggio);
    } finally {
      setCaricamento(false);
    }
  };

  const servizioCorrente = servizi.find(s => s._id === servizioSelezionato);

  return (
    <div className="container mx-auto px-4 py-8 pb-24">
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

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-800">{nomiMesi[mese]} {anno}</h4>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => { if (mese === 0) { setMese(11); setAnno(anno - 1); } else { setMese(mese - 1); } }}
                      className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => { if (mese === 11) { setMese(0); setAnno(anno + 1); } else { setMese(mese + 1); } }}
                      className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 mb-2">
                  {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((g) => (
                    <div key={g} className="text-center text-xs font-semibold text-gray-500 pb-3">{g}</div>
                  ))}
                </div>

                <div className="grid grid-cols-7">
                  {(() => {
                    const primoGiorno = new Date(anno, mese, 1);
                    const ultimoGiorno = new Date(anno, mese + 1, 0);
                    const giorni: (Date | null)[] = [];
                    let primoGiornoSettimana = primoGiorno.getDay();
                    primoGiornoSettimana = primoGiornoSettimana === 0 ? 6 : primoGiornoSettimana - 1;
                    for (let i = 0; i < primoGiornoSettimana; i++) giorni.push(null);
                    for (let giorno = 1; giorno <= ultimoGiorno.getDate(); giorno++) giorni.push(new Date(anno, mese, giorno));
                    return giorni;
                  })().map((giorno, index) => {
                    if (!giorno) return <div key={`e-${index}`} className="text-center py-3" />;

                    const disponibile = isDisponibile(giorno);
                    const dataStr = dateToLocalString(giorno);
                    const isSelected = data === dataStr;
                    const oggi = new Date();
                    oggi.setHours(0, 0, 0, 0);
                    const isToday = giorno.getTime() === oggi.getTime();

                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => disponibile && handleSelezionaData(giorno)}
                        disabled={!disponibile}
                        className={`text-center py-3 text-sm transition-all ${
                          isToday ? 'ring-1 ring-primary-500' : ''
                        } ${
                          isSelected
                            ? 'bg-primary-600 text-white font-bold rounded-lg'
                            : disponibile
                            ? 'text-gray-700 cursor-pointer hover:bg-gray-200 rounded-lg'
                            : 'text-gray-300 cursor-not-allowed'
                        }`}
                      >
                        {giorno.getDate()}
                      </button>
                    );
                  })}
                </div>
              </div>

              {data && (
                <p className="text-sm text-gray-500 mt-2">
                  Selectat: {new Date(data + 'T12:00').toLocaleDateString('ro-RO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              )}
            </div>

            {/* ========== SELEZIONE ORARIO ========== */}
            {data && servizioSelezionato && (
              <div className="mb-6">
                <h3 className="text-lg font-bold mb-4">4. Oră</h3>
                
                {caricamentoSlot ? (
                  <p className="text-gray-600">Se încarcă sloturile disponibile...</p>
                ) : slotOrari.length > 0 ? (
                  <div className="space-y-4">
                    {(() => {
                      const morning = slotOrari.filter(s => parseInt(s.ora) < 12);
                      const afternoon = slotOrari.filter(s => parseInt(s.ora) >= 12 && parseInt(s.ora) < 17);
                      const evening = slotOrari.filter(s => parseInt(s.ora) >= 17);
                      const groups: [string, typeof slotOrari][] = [];
                      if (morning.length) groups.push(['Dimineață', morning]);
                      if (afternoon.length) groups.push(['După-amiază', afternoon]);
                      if (evening.length) groups.push(['Seară', evening]);
                      return groups.map(([label, slots]) => (
                        <div key={label}>
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">{label}</span>
                          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                            {slots.map((slot) => (
                              <button
                                key={slot.ora}
                                type="button"
                                onClick={() => slot.disponibile && setOraSelezionata(slot.ora)}
                                disabled={!slot.disponibile}
                                className={`p-3 rounded-lg border-2 transition-colors ${
                                  oraSelezionata === slot.ora
                                    ? 'border-primary-600 bg-primary-100 text-primary-700 font-semibold'
                                    : slot.disponibile
                                    ? 'border-gray-300 hover:border-primary-400 text-gray-700 cursor-pointer'
                                    : 'border-gray-200 bg-gray-100 text-gray-300 cursor-not-allowed line-through'
                                }`}
                              >
                                {slot.ora}
                              </button>
                            ))}
                          </div>
                        </div>
                      ));
                    })()}
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
                <p><strong>Serviciu:</strong> {servizioCorrente.nome}</p>
                <p><strong>Durată:</strong> {servizioCorrente.durata} minute</p>
                <p><strong>Preț:</strong> {formattaPrezzo(servizioCorrente.prezzo)}</p>
                <p><strong>Data:</strong> {new Date(data).toLocaleDateString('ro-RO')}</p>
                <p><strong>Oră:</strong> {oraSelezionata}</p>
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
