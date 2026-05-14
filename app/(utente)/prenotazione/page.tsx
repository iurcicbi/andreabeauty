/**
 * PAGINA PRENOTAZIONE - DESIGN NERO/BIANCO MODERNO
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import webservice from '@/utils/webservice';
import Messaggio from '@/componenti/comuni/Messaggio';
import Caricamento from '@/componenti/comuni/Caricamento';
import { formattaPrezzo } from '@/utils/helpers';

interface Servizio {
  _id: string;
  nome: string;
  durata: number;
  prezzo: number;
  descrizione?: string;
  categoria?: string;
  attivo?: boolean;
}

interface Barber {
  _id: string;
  nome: string;
  cognome: string;
}

interface SlotOrario {
  ora: string;
  disponibile: boolean;
}

interface GiornoChiusura {
  data: Date | string;
  motivo: string;
  tuttoIlGiorno: boolean;
  oraInizio?: string;
  oraFine?: string;
}

type Step = 'barber' | 'servizio' | 'data' | 'ora' | 'conferma';

export default function PrenotazionePage() {
  const router = useRouter();
  
  // Stati principali
  const [step, setStep] = useState<Step>('barber');
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [servizi, setServizi] = useState<Servizio[]>([]);
  const [barberSelezionato, setBarberSelezionato] = useState<Barber | null>(null);
  const [servizioSelezionato, setServizioSelezionato] = useState<Servizio | null>(null);
  const [dataSelezionata, setDataSelezionata] = useState<Date | null>(null);
  const [oraSelezionata, setOraSelezionata] = useState('');
  const [note, setNote] = useState('');
  
  // Dati cliente
  const [nomeCliente, setNomeCliente] = useState('');
  const [cognomeCliente, setCognomeCliente] = useState('');
  const [telefonoCliente, setTelefonoCliente] = useState('');
  
  // Stati calendario
  const [mese, setMese] = useState(new Date().getMonth());
  const [anno, setAnno] = useState(new Date().getFullYear());
  const [slotOrari, setSlotOrari] = useState<SlotOrario[]>([]);
  const [chiusureBarber, setChiusureBarber] = useState<GiornoChiusura[]>([]);
  
  // Stati UI
  const [caricamento, setCaricamento] = useState(true);
  const [caricamentoSlot, setCaricamentoSlot] = useState(false);
  const [errore, setErrore] = useState('');
  
  // Impostazioni frontend
  const [logo, setLogo] = useState<string>('');
  const [logoAlt, setLogoAlt] = useState<string>('');
  const [nomeAzienda, setNomeAzienda] = useState<string>('');
  const [testiPrenotazione, setTestiPrenotazione] = useState({
    titoloPagina: 'PRENOTA APPUNTAMENTO',
    sottotitoloPagina: 'Semplice, veloce, professionale',
    stepBarber: 'SCEGLI IL TUO BARBER',
    stepServizio: 'SCEGLI IL SERVIZIO',
    stepData: 'SCEGLI LA DATA',
    stepOrario: 'SCEGLI L\'ORARIO',
    stepConferma: 'CONFERMA PRENOTAZIONE'
  });

  const nomiMesi = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
    'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];

  const dateToLocalString = (data: Date): string => {
    const anno = data.getFullYear();
    const mese = String(data.getMonth() + 1).padStart(2, '0');
    const giorno = String(data.getDate()).padStart(2, '0');
    return `${anno}-${mese}-${giorno}`;
  };

  useEffect(() => {
    caricaDati();
    caricaImpostazioniLogo();
  }, []);

  const caricaImpostazioniLogo = async () => {
    try {
      const risposta = await webservice.get('/api/impostazioni');
      if (risposta.dati?.logo) {
        setLogo(risposta.dati.logo);
      }
      if (risposta.dati?.logoAlt) {
        setLogoAlt(risposta.dati.logoAlt);
      }
      if (risposta.dati?.nomeAzienda) {
        setNomeAzienda(risposta.dati.nomeAzienda);
      }
      if (risposta.dati?.testiPrenotazione) {
        setTestiPrenotazione(prev => ({
          ...prev,
          ...risposta.dati.testiPrenotazione
        }));
      }
    } catch (err) {
      console.log('Impostazioni non disponibili');
    }
  };

  const caricaDati = async () => {
    try {
      setCaricamento(true);
      const rispostaBarbers = await webservice.get('/api/barber');
      const barbersAttivi = rispostaBarbers.dati.filter((b: any) => b);
      setBarbers(barbersAttivi);
      
      const rispostaServizi = await webservice.get('/api/servizi');
      const serviziAttivi = rispostaServizi.dati.filter((s: Servizio) => s.attivo !== false);
      setServizi(serviziAttivi);
    } catch (err: any) {
      setErrore('Errore nel caricamento dei dati');
    } finally {
      setCaricamento(false);
    }
  };

  const caricaSlotOrari = async (data: Date) => {
    if (!barberSelezionato || !servizioSelezionato) return;

    try {
      setCaricamentoSlot(true);
      const dataStr = dateToLocalString(data);
      const risposta = await webservice.get('/api/appuntamenti/disponibilita', {
        params: {
          barberId: barberSelezionato._id,
          data: dataStr,
          durata: servizioSelezionato.durata,
        },
      });
      setSlotOrari(risposta.dati.slot || []);
    } catch (err) {
      setSlotOrari([]);
    } finally {
      setCaricamentoSlot(false);
    }
  };

  const caricaChiusureBarber = async (barberId: string) => {
    try {
      const risposta = await webservice.get(`/api/barber/${barberId}`);
      if (risposta.dati?.giorniChiusura) {
        setChiusureBarber(risposta.dati.giorniChiusura);
      } else {
        setChiusureBarber([]);
      }
    } catch (err: any) {
      setChiusureBarber([]);
    }
  };

  const scrollToSection = (sectionId: string) => {
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        const offset = 100; // Offset per la navbar fissa
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }, 100);
  };

  const handleSelezionaBarber = async (barber: Barber) => {
    setBarberSelezionato(barber);
    await caricaChiusureBarber(barber._id);
    setStep('servizio');
    scrollToSection('step-servizio');
  };

  const handleSelezionaServizio = (servizio: Servizio) => {
    setServizioSelezionato(servizio);
    setStep('data');
    scrollToSection('step-data');
  };

  const handleSelezionaData = (data: Date) => {
    setDataSelezionata(data);
    setOraSelezionata('');
    caricaSlotOrari(data);
    setStep('ora');
    scrollToSection('step-ora');
  };

  const handleSelezionaOra = (ora: string) => {
    setOraSelezionata(ora);
    setStep('conferma');
    scrollToSection('step-conferma');
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

  const handleConferma = async () => {
    if (!barberSelezionato || !servizioSelezionato || !dataSelezionata || !oraSelezionata) {
      setErrore('Dati mancanti per la prenotazione');
      return;
    }

    if (!nomeCliente.trim() || !cognomeCliente.trim() || !telefonoCliente.trim()) {
      setErrore('Nome, cognome e telefono sono obbligatori');
      return;
    }

    try {
      setCaricamento(true);
      setErrore('');

      const dataStr = dateToLocalString(dataSelezionata);

      // Normalizza il numero di telefono in formato internazionale
      const telefonoNormalizzato = normalizzaTelefono(telefonoCliente.trim());

      await webservice.post('/api/appuntamenti', {
        barberId: barberSelezionato._id,
        servizioId: servizioSelezionato._id,
        data: dataStr,
        oraInizio: oraSelezionata,
        note,
        clienteNome: nomeCliente.trim(),
        clienteCognome: cognomeCliente.trim(),
        clienteTelefono: telefonoNormalizzato,
      });

      const params = new URLSearchParams({
        barber: `${barberSelezionato.nome} ${barberSelezionato.cognome}`,
        servizio: servizioSelezionato.nome,
        data: dataStr,
        ora: oraSelezionata,
        prezzo: `€${servizioSelezionato.prezzo.toFixed(2)}`,
      });

      router.push(`/prenotazione/successo?${params.toString()}`);
    } catch (err: any) {
      const messaggio = err.response?.data?.errore || 'Errore durante la prenotazione';
      const params = new URLSearchParams({ errore: messaggio });
      router.push(`/prenotazione/errore?${params.toString()}`);
    } finally {
      setCaricamento(false);
    }
  };

  const isDisponibile = (data: Date): { disponibile: boolean; motivo?: string } => {
    const oggi = new Date();
    oggi.setHours(0, 0, 0, 0);
    
    if (data < oggi) {
      return { disponibile: false, motivo: 'Data passata' };
    }
    
    const giornoSettimana = data.getDay();
    if (giornoSettimana === 0) {
      return { disponibile: false, motivo: 'Chiuso' };
    }
    
    const dataStr = dateToLocalString(data);
    
    const chiusura = chiusureBarber.find((c) => {
      let dataChiusura: string;
      
      if (typeof c.data === 'string') {
        dataChiusura = c.data.split('T')[0];
      } else {
        dataChiusura = dateToLocalString(new Date(c.data));
      }
      
      return dataChiusura === dataStr;
    });
    
    if (chiusura) {
      return { disponibile: false, motivo: chiusura.motivo };
    }
    
    return { disponibile: true };
  };

  if (caricamento && barbers.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Caricamento />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              {logo ? (
                <img 
                  src={logo} 
                  alt={logoAlt || nomeAzienda || "Logo"}
                  className="h-10 md:h-12 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <svg className="w-8 h-8 md:w-10 md:h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                  <path d="M12 8v8M8 12h8"/>
                </svg>
              )}
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-white/80 hover:text-white transition-colors font-medium">Home</Link>
              <Link href="/contatti" className="text-white/80 hover:text-white transition-colors font-medium">Contatti</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="bg-white text-black py-6 md:py-16 pt-24 md:pt-36">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl md:text-5xl font-bold mb-2 tracking-tight">
            {testiPrenotazione.titoloPagina}
          </h1>
          <p className="text-sm md:text-xl text-black/60">{testiPrenotazione.sottotitoloPagina}</p>
        </div>
      </div>

      <div className="container mx-auto px-3 md:px-4 py-6 md:py-16 max-w-7xl">
        {/* Progress Bar */}
        <div className="max-w-4xl mx-auto mb-6 md:mb-12">
          <div className="flex items-center justify-between mb-2 md:mb-4">
            {[
              { key: 'barber', label: 'Barber', icon: (
                <svg className="w-4 h-4 md:w-5 md:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              )},
              { key: 'servizio', label: 'Servizio', icon: (
                <svg className="w-4 h-4 md:w-5 md:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                </svg>
              )},
              { key: 'data', label: 'Data', icon: (
                <svg className="w-4 h-4 md:w-5 md:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              )},
              { key: 'ora', label: 'Orario', icon: (
                <svg className="w-4 h-4 md:w-5 md:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              )},
              { key: 'conferma', label: 'Conferma', icon: (
                <svg className="w-4 h-4 md:w-5 md:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              )},
            ].map((s, index) => (
              <div key={s.key} className="flex flex-col items-center flex-1">
                <div className={`w-8 h-8 md:w-12 md:h-12 border-2 flex items-center justify-center font-bold transition-all ${
                  step === s.key 
                    ? 'bg-white text-black border-white scale-110' 
                    : ['barber', 'servizio', 'data', 'ora', 'conferma'].indexOf(step) > index
                    ? 'bg-white/20 text-white border-white/20'
                    : 'bg-transparent text-white/40 border-white/20'
                }`}>
                  {s.icon}
                </div>
                <span className={`text-[10px] md:text-sm mt-1 md:mt-2 font-medium ${
                  step === s.key ? 'text-white' : 'text-white/40'
                }`}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
          <div className="relative h-1 bg-white/10">
            <div 
              className="absolute h-full bg-white transition-all duration-500"
              style={{ 
                width: `${(['barber', 'servizio', 'data', 'ora', 'conferma'].indexOf(step) + 1) * 20}%` 
              }}
            />
          </div>
        </div>

        {errore && <div className="max-w-4xl mx-auto mb-6"><Messaggio tipo="errore" messaggio={errore} onChiudi={() => setErrore('')} /></div>}

        {/* STEP 1: BARBER */}
        {step === 'barber' && (
          <div id="step-barber" className="max-w-6xl mx-auto">
            <h2 className="text-xl md:text-3xl font-bold mb-4 md:mb-8 text-center tracking-tight">
              {testiPrenotazione.stepBarber}
            </h2>
            {barbers.length === 0 ? (
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 md:p-12 text-center">
                <svg className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 text-white/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="8" y1="15" x2="16" y2="15"/>
                  <line x1="9" y1="9" x2="9.01" y2="9"/>
                  <line x1="15" y1="9" x2="15.01" y2="9"/>
                </svg>
                <p className="text-lg md:text-xl text-white/60">Nessun barber disponibile</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                {barbers.map((barber) => (
                  <div
                    key={barber._id}
                    onClick={() => handleSelezionaBarber(barber)}
                    className="bg-white/5 backdrop-blur-sm border border-white/10 p-5 md:p-8 hover:bg-white/10 transition-all cursor-pointer group"
                  >
                    <svg className="w-14 h-14 md:w-20 md:h-20 mx-auto mb-3 md:mb-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                    <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4 text-center tracking-tight">
                      {barber.nome} {barber.cognome}
                    </h3>
                    <button className="w-full bg-white text-black py-2.5 md:py-3 font-bold hover:bg-white/90 transition-all text-sm md:text-base">
                      SELEZIONA →
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 2: SERVIZIO */}
        {step === 'servizio' && barberSelezionato && (
          <div id="step-servizio" className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-4 md:mb-8">
              <h2 className="text-xl md:text-3xl font-bold tracking-tight">{testiPrenotazione.stepServizio}</h2>
              <button
                onClick={() => {
                  setStep('barber');
                  scrollToSection('step-barber');
                }}
                className="text-white/70 hover:text-white font-medium text-xs md:text-base"
              >
                ← Indietro
              </button>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-3 md:p-4 mb-4 md:mb-8">
              <p className="text-center text-sm md:text-base">
                <span className="text-white/60">Barber:</span>{' '}
                <span className="font-bold">{barberSelezionato.nome} {barberSelezionato.cognome}</span>
              </p>
            </div>

            {servizi.length === 0 ? (
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 md:p-12 text-center">
                <svg className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 text-white/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="8" y1="15" x2="16" y2="15"/>
                  <line x1="9" y1="9" x2="9.01" y2="9"/>
                  <line x1="15" y1="9" x2="15.01" y2="9"/>
                </svg>
                <p className="text-lg md:text-xl text-white/60">Nessun servizio disponibile</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                {servizi.map((servizio) => (
                  <div
                    key={servizio._id}
                    onClick={() => handleSelezionaServizio(servizio)}
                    className="bg-white/5 backdrop-blur-sm border border-white/10 p-4 md:p-6 hover:bg-white/10 transition-all cursor-pointer flex flex-col"
                  >
                    <div className="flex items-start justify-between mb-3 md:mb-4">
                      <h3 className="text-base md:text-xl font-bold flex-1 leading-tight">{servizio.nome}</h3>
                      <svg className="w-5 h-5 md:w-8 md:h-8 flex-shrink-0 ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                      </svg>
                    </div>
                    {servizio.descrizione && (
                      <p className="text-xs md:text-sm text-white/60 mb-3 md:mb-4 line-clamp-2 flex-grow">{servizio.descrizione}</p>
                    )}
                    <div className="flex items-center justify-between pt-3 md:pt-4 border-t border-white/10">
                      <div className="flex items-center gap-1 md:gap-2 text-white/60 text-xs md:text-sm">
                        <svg className="w-3 h-3 md:w-4 md:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"/>
                          <polyline points="12 6 12 12 16 14"/>
                        </svg>
                        <span>{servizio.durata} min</span>
                      </div>
                      <div className="text-lg md:text-2xl font-bold">
                        {formattaPrezzo(servizio.prezzo)}
                      </div>
                    </div>
                    <button className="w-full mt-3 md:mt-4 bg-white text-black py-2.5 md:py-3 font-bold hover:bg-white/90 transition-all text-xs md:text-base">
                      SELEZIONA →
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 3: DATA */}
        {step === 'data' && servizioSelezionato && (
          <div id="step-data" className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-4 md:mb-8">
              <h2 className="text-xl md:text-3xl font-bold tracking-tight">{testiPrenotazione.stepData}</h2>
              <button
                onClick={() => {
                  setStep('servizio');
                  scrollToSection('step-servizio');
                }}
                className="text-white/70 hover:text-white font-medium text-xs md:text-base"
              >
                ← Indietro
              </button>
            </div>

            {/* Riepilogo compatto su mobile - sopra il calendario */}
            <div className="lg:hidden bg-white/5 backdrop-blur-sm border border-white/10 p-3 mb-4">
              <div className="flex items-center justify-between text-sm">
                <div>
                  <span className="text-white/60">{barberSelezionato?.nome}</span>
                  <span className="mx-2">•</span>
                  <span className="text-white/60">{servizioSelezionato.nome}</span>
                </div>
                <span className="font-bold">{formattaPrezzo(servizioSelezionato.prezzo)}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
              <div className="lg:col-span-2">
                <CalendarioPrenotazione
                  mese={mese}
                  anno={anno}
                  onMesePrecedente={() => {
                    if (mese === 0) { setMese(11); setAnno(anno - 1); } else { setMese(mese - 1); }
                  }}
                  onMeseSuccessivo={() => {
                    if (mese === 11) { setMese(0); setAnno(anno + 1); } else { setMese(mese + 1); }
                  }}
                  onSelezionaData={handleSelezionaData}
                  isDisponibile={isDisponibile}
                  nomiMesi={nomiMesi}
                />
              </div>

              {/* Riepilogo desktop */}
              <div className="hidden lg:block bg-white/5 backdrop-blur-sm border border-white/10 p-6 lg:sticky lg:top-4 h-fit">
                <h3 className="text-xl font-bold mb-6 tracking-tight">RIEPILOGO</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-white/60 mb-1">Barber</p>
                    <p className="font-bold">{barberSelezionato?.nome} {barberSelezionato?.cognome}</p>
                  </div>
                  <div>
                    <p className="text-sm text-white/60 mb-1">Servizio</p>
                    <p className="font-bold">{servizioSelezionato.nome}</p>
                  </div>
                  <div className="flex justify-between pt-4 border-t border-white/10">
                    <span className="text-white/60">Durata</span>
                    <span className="font-bold">{servizioSelezionato.durata} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Prezzo</span>
                    <span className="font-bold text-xl">{formattaPrezzo(servizioSelezionato.prezzo)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: ORA */}
        {step === 'ora' && dataSelezionata && (
          <div id="step-ora" className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-4 md:mb-8">
              <h2 className="text-xl md:text-3xl font-bold tracking-tight">{testiPrenotazione.stepOrario}</h2>
              <button
                onClick={() => {
                  setStep('data');
                  setDataSelezionata(null);
                  scrollToSection('step-data');
                }}
                className="text-white/70 hover:text-white font-medium text-xs md:text-base"
              >
                ← Indietro
              </button>
            </div>

            {/* Riepilogo compatto su mobile */}
            <div className="lg:hidden bg-white/5 backdrop-blur-sm border border-white/10 p-3 mb-4">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="text-white/60">{servizioSelezionato?.nome}</span>
                  <span className="mx-1.5">•</span>
                  <span className="text-white/60">{dataSelezionata.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })}</span>
                </div>
                <span className="font-bold">{formattaPrezzo(servizioSelezionato?.prezzo || 0)}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
              <div className="lg:col-span-2 bg-white/5 backdrop-blur-sm border border-white/10 p-4 md:p-8">
                <div className="bg-white/10 p-3 md:p-4 mb-4 md:mb-6">
                  <p className="text-center font-medium flex items-center justify-center gap-2 text-sm md:text-base">
                    <svg className="w-4 h-4 md:w-5 md:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    <span className="hidden sm:inline">
                      {dataSelezionata.toLocaleDateString('it-IT', {
                        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                      })}
                    </span>
                    <span className="sm:hidden">
                      {dataSelezionata.toLocaleDateString('it-IT', {
                        day: 'numeric', month: 'long'
                      })}
                    </span>
                  </p>
                </div>

                {caricamentoSlot ? (
                  <div className="text-center py-8 md:py-12">
                    <Caricamento />
                    <p className="text-white/60 mt-4 text-sm md:text-base">Caricamento orari...</p>
                  </div>
                ) : slotOrari.length > 0 ? (
                  <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2 md:gap-3">
                    {slotOrari.map((slot) => (
                      <button
                        key={slot.ora}
                        onClick={() => slot.disponibile && handleSelezionaOra(slot.ora)}
                        disabled={!slot.disponibile}
                        className={`py-3 md:py-4 px-1 md:px-2 font-bold text-sm md:text-lg transition-all ${
                          slot.disponibile
                            ? 'bg-white text-black hover:bg-white/90 cursor-pointer'
                            : 'bg-white/10 text-white/40 cursor-not-allowed'
                        }`}
                      >
                        {slot.ora}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 md:py-12">
                    <svg className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 text-white/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="8" y1="15" x2="16" y2="15"/>
                      <line x1="9" y1="9" x2="9.01" y2="9"/>
                      <line x1="15" y1="9" x2="15.01" y2="9"/>
                    </svg>
                    <p className="text-lg md:text-xl text-white/60 mb-4 md:mb-6">Nessun orario disponibile</p>
                    <button
                      onClick={() => {
                        setStep('data');
                        scrollToSection('step-data');
                      }}
                      className="px-4 md:px-6 py-2.5 md:py-3 bg-white text-black font-bold hover:bg-white/90 text-sm md:text-base"
                    >
                      Scegli un'altra data
                    </button>
                  </div>
                )}
              </div>

              {/* Riepilogo desktop */}
              <div className="hidden lg:block bg-white/5 backdrop-blur-sm border border-white/10 p-6 lg:sticky lg:top-4 h-fit">
                <h3 className="text-xl font-bold mb-6 tracking-tight">RIEPILOGO</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-white/60 mb-1">Barber</p>
                    <p className="font-bold">{barberSelezionato?.nome} {barberSelezionato?.cognome}</p>
                  </div>
                  <div>
                    <p className="text-sm text-white/60 mb-1">Servizio</p>
                    <p className="font-bold">{servizioSelezionato?.nome}</p>
                  </div>
                  <div>
                    <p className="text-sm text-white/60 mb-1">Data</p>
                    <p className="font-bold">{dataSelezionata.toLocaleDateString('it-IT')}</p>
                  </div>
                  <div className="flex justify-between pt-4 border-t border-white/10">
                    <span className="text-white/60">Totale</span>
                    <span className="font-bold text-xl">{formattaPrezzo(servizioSelezionato?.prezzo || 0)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: CONFERMA */}
        {step === 'conferma' && (
          <div id="step-conferma" className="max-w-3xl mx-auto">
            <h2 className="text-xl md:text-3xl font-bold mb-4 md:mb-8 text-center tracking-tight">
              {testiPrenotazione.stepConferma}
            </h2>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 overflow-hidden">
              <div className="bg-white text-black p-5 md:p-8 text-center">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-black text-white mx-auto mb-3 md:mb-4 flex items-center justify-center">
                  <svg className="w-10 h-10 md:w-12 md:h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <h3 className="text-xl md:text-2xl font-bold mb-1 md:mb-2">QUASI FATTO!</h3>
                <p className="text-sm md:text-lg text-black/60">Inserisci i tuoi dati per completare</p>
              </div>

              <div className="p-4 md:p-8">
                <div className="mb-5 md:mb-8">
                  <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4 tracking-tight">I TUOI DATI</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    <div>
                      <label className="block text-xs md:text-sm font-bold mb-1.5 md:mb-2">
                        Nome <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={nomeCliente}
                        onChange={(e) => setNomeCliente(e.target.value)}
                        placeholder="Il tuo nome"
                        className="w-full bg-white/10 border border-white/20 px-3 md:px-4 py-2.5 md:py-3 focus:border-white focus:outline-none text-white text-sm md:text-base"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs md:text-sm font-bold mb-1.5 md:mb-2">
                        Cognome <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={cognomeCliente}
                        onChange={(e) => setCognomeCliente(e.target.value)}
                        placeholder="Il tuo cognome"
                        className="w-full bg-white/10 border border-white/20 px-3 md:px-4 py-2.5 md:py-3 focus:border-white focus:outline-none text-white text-sm md:text-base"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs md:text-sm font-bold mb-1.5 md:mb-2">
                        Telefono <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={telefonoCliente}
                        onChange={(e) => setTelefonoCliente(e.target.value)}
                        placeholder="333-1234567 o +39-333-1234567"
                        className="w-full bg-white/10 border border-white/20 px-3 md:px-4 py-2.5 md:py-3 focus:border-white focus:outline-none text-white text-sm md:text-base"
                        required
                      />
                      <p className="text-[10px] md:text-xs text-white/60 mt-1">
                        Inserisci il tuo numero di telefono (verrà automaticamente convertito in formato internazionale +39)
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 p-4 md:p-6 mb-4 md:mb-6">
                  <h3 className="text-base md:text-xl font-bold mb-3 md:mb-4 tracking-tight">RIEPILOGO</h3>
                  <div className="space-y-2.5 md:space-y-4">
                    <div className="flex justify-between items-center text-sm md:text-base">
                      <span className="text-white/60">Barber</span>
                      <span className="font-bold text-right">{barberSelezionato?.nome} {barberSelezionato?.cognome}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm md:text-base">
                      <span className="text-white/60">Servizio</span>
                      <span className="font-bold text-right">{servizioSelezionato?.nome}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm md:text-base">
                      <span className="text-white/60">Data</span>
                      <span className="font-bold text-right">
                        <span className="hidden sm:inline">
                          {dataSelezionata?.toLocaleDateString('it-IT', {
                            weekday: 'long', day: 'numeric', month: 'long'
                          })}
                        </span>
                        <span className="sm:hidden">
                          {dataSelezionata?.toLocaleDateString('it-IT', {
                            day: 'numeric', month: 'short'
                          })}
                        </span>
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm md:text-base">
                      <span className="text-white/60">Orario</span>
                      <span className="font-bold">{oraSelezionata}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm md:text-base">
                      <span className="text-white/60">Durata</span>
                      <span className="font-bold">{servizioSelezionato?.durata} min</span>
                    </div>
                    <div className="flex justify-between items-center pt-3 md:pt-4 border-t border-white/20">
                      <span className="text-white/60 font-bold text-base md:text-lg">Totale</span>
                      <span className="font-bold text-2xl md:text-3xl">{formattaPrezzo(servizioSelezionato?.prezzo || 0)}</span>
                    </div>
                  </div>
                </div>

                <div className="mb-4 md:mb-6">
                  <label className="block text-xs md:text-sm font-bold mb-1.5 md:mb-2">Note (opzionale)</label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Eventuali richieste particolari..."
                    className="w-full bg-white/10 border border-white/20 px-3 md:px-4 py-2.5 md:py-3 focus:border-white focus:outline-none text-white text-sm md:text-base"
                    rows={2}
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                  <button
                    onClick={() => {
                      setStep('ora');
                      scrollToSection('step-ora');
                    }}
                    className="flex-1 px-4 md:px-6 py-3 md:py-4 border-2 border-white/20 hover:bg-white/10 font-bold text-sm md:text-lg"
                  >
                    ← INDIETRO
                  </button>
                  <button
                    onClick={handleConferma}
                    disabled={caricamento || !nomeCliente.trim() || !cognomeCliente.trim() || !telefonoCliente.trim()}
                    className="flex-1 px-4 md:px-6 py-3 md:py-4 bg-white text-black font-bold text-sm md:text-lg hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {caricamento ? (
                      'PRENOTAZIONE...'
                    ) : (
                      <>
                        <svg className="w-4 h-4 md:w-5 md:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        CONFERMA
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENTE CALENDARIO
// ============================================================================
function CalendarioPrenotazione({ mese, anno, onMesePrecedente, onMeseSuccessivo, onSelezionaData, isDisponibile, nomiMesi }: any) {
  const giorniSettimana = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
  const giorniSettimanaBrevi = ['L', 'M', 'M', 'G', 'V', 'S', 'D'];

  const generaCalendario = () => {
    const primoGiorno = new Date(anno, mese, 1);
    const ultimoGiorno = new Date(anno, mese + 1, 0);
    const giorni = [];

    let primoGiornoSettimana = primoGiorno.getDay();
    primoGiornoSettimana = primoGiornoSettimana === 0 ? 6 : primoGiornoSettimana - 1;

    for (let i = 0; i < primoGiornoSettimana; i++) {
      giorni.push(null);
    }

    for (let giorno = 1; giorno <= ultimoGiorno.getDate(); giorno++) {
      giorni.push(new Date(anno, mese, giorno));
    }

    return giorni;
  };

  const giorni = generaCalendario();
  const oggi = new Date();
  oggi.setHours(0, 0, 0, 0);

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-4 md:p-8">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <button
          onClick={onMesePrecedente}
          className="w-10 h-10 md:w-12 md:h-12 bg-white/10 hover:bg-white/20 flex items-center justify-center font-bold text-lg md:text-xl"
        >
          ←
        </button>
        <h3 className="text-lg md:text-2xl font-bold tracking-tight">
          {nomiMesi[mese]} {anno}
        </h3>
        <button
          onClick={onMeseSuccessivo}
          className="w-10 h-10 md:w-12 md:h-12 bg-white/10 hover:bg-white/20 flex items-center justify-center font-bold text-lg md:text-xl"
        >
          →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 md:gap-2 mb-1 md:mb-2">
        {giorniSettimana.map((giorno, index) => (
          <div key={giorno} className="text-center font-bold py-1 md:py-2 text-white/60">
            <span className="hidden sm:inline text-xs md:text-sm">{giorno}</span>
            <span className="sm:hidden text-[10px]">{giorniSettimanaBrevi[index]}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 md:gap-2">
        {giorni.map((data, index) => {
          if (!data) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          const risultato = isDisponibile(data);
          const disponibile = risultato.disponibile;
          const isToday = data.getTime() === oggi.getTime();

          return (
            <div key={index} className="relative group">
              <button
                onClick={() => disponibile && onSelezionaData(data)}
                disabled={!disponibile}
                className={`w-full aspect-square font-bold text-sm md:text-lg transition-all ${
                  isToday ? 'ring-1 md:ring-2 ring-white/50' : ''
                } ${
                  disponibile
                    ? 'bg-white text-black hover:bg-white/90 cursor-pointer'
                    : 'bg-white/10 text-white/40 cursor-not-allowed'
                }`}
              >
                {data.getDate()}
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-4 md:mt-6 bg-white/10 p-3 md:p-4">
        <p className="text-xs md:text-sm text-center text-white/70 flex items-center justify-center gap-1.5 md:gap-2">
          <svg className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="16" x2="12" y2="12"/>
            <line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
          <span className="hidden sm:inline">Clicca su un giorno disponibile per vedere gli orari</span>
          <span className="sm:hidden">Seleziona un giorno disponibile</span>
        </p>
      </div>
    </div>
  );
}
