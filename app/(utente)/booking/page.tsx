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

interface Specialist {
  _id: string;
  nome: string;
  cognome: string;
  giorniSede?: string[];
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

type Step = 'locatie' | 'servizio' | 'specialist' | 'data' | 'ora' | 'conferma';

export default function PrenotazionePage() {
  const router = useRouter();
  
  // Stati principali
  const [step, setStep] = useState<Step>('locatie');
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [servizi, setServizi] = useState<Servizio[]>([]);
  const [selectedSpecialist, setSelectedSpecialist] = useState<Specialist | null>(null);
  const [servizioSelezionato, setServizioSelezionato] = useState<Servizio | null>(null);
  const [dataSelezionata, setDataSelezionata] = useState<Date | null>(null);
  const [oraSelezionata, setOraSelezionata] = useState('');
  const [note, setNote] = useState('');
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherData, setVoucherData] = useState<any>(null);
  const [voucherError, setVoucherError] = useState('');
  
  // Dati cliente
  const [nomeCliente, setNomeCliente] = useState('');
  const [cognomeCliente, setCognomeCliente] = useState('');
  const [telefonoCliente, setTelefonoCliente] = useState('');
  
  // Stati calendario
  const [mese, setMese] = useState(new Date().getMonth());
  const [anno, setAnno] = useState(new Date().getFullYear());
  const [slotOrari, setSlotOrari] = useState<SlotOrario[]>([]);
  const [specialistClosures, setSpecialistClosures] = useState<GiornoChiusura[]>([]);

  // Stati sede e postazione
  const [sediPubbliche, setSediPubbliche] = useState<any[]>([]);
  const [sediDisponibili, setSediDisponibili] = useState<any[]>([]);
  const [sedeSelezionata, setSedeSelezionata] = useState<any>(null);
  const [postazioneSelezionata, setPostazioneSelezionata] = useState<string>('');
  
  // Stati UI
  const [caricamento, setCaricamento] = useState(true);
  const [caricamentoSlot, setCaricamentoSlot] = useState(false);
  const [caricamentoSpecialisti, setCaricamentoSpecialisti] = useState(false);
  const [errore, setErrore] = useState('');
  
  // Impostazioni frontend
  const [logo, setLogo] = useState<string>('');
  const [logoAlt, setLogoAlt] = useState<string>('');
  const [nomeAzienda, setNomeAzienda] = useState<string>('');
  const [testiPrenotazione, setTestiPrenotazione] = useState({
    titoloPagina: 'BOOK APPOINTMENT',
    sottotitoloPagina: 'Simple, fast, professional',
    stepServizio: 'CHOOSE YOUR SERVICE',
    stepSpecialist: 'CHOOSE YOUR SPECIALIST',
    stepData: 'CHOOSE THE DATE',
    stepOrario: 'CHOOSE THE TIME',
    stepConferma: 'CONFIRM BOOKING'
  });

  const nomiMesi = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

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
      const risposta = await webservice.get('/api/settings');
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
      console.log('Settings not available');
    }
  };

  const caricaDati = async () => {
    try {
      setCaricamento(true);
      const [servRes, sediRes] = await Promise.all([
        webservice.get('/api/services'),
        webservice.get('/api/public/sedi'),
      ]);
      const serviziAttivi = servRes.dati.filter((s: Servizio) => s.attivo !== false);
      setServizi(serviziAttivi);
      setSediPubbliche(sediRes.dati || []);
    } catch (err: any) {
      setErrore('Error loading data');
    } finally {
      setCaricamento(false);
    }
  };

  const caricaSpecialistiPerServizio = async (serviceId: string) => {
    try {
      setCaricamentoSpecialisti(true);
      const params: any = {};
      if (sedeSelezionata?._id) params.sedeId = sedeSelezionata._id;
      const risposta = await webservice.get(`/api/services/${serviceId}/specialists`, { params });
      setSpecialists(risposta.dati || []);
    } catch (err) {
      setSpecialists([]);
    } finally {
      setCaricamentoSpecialisti(false);
    }
  };

  const caricaSlotOrari = async (data: Date) => {
    if (!selectedSpecialist || !servizioSelezionato) return;

    try {
      setCaricamentoSlot(true);
      setSediDisponibili([]);
      setSedeSelezionata(null);
      setPostazioneSelezionata('');
      const dataStr = dateToLocalString(data);
      const paramsAva: any = {
        specialistId: selectedSpecialist._id,
        data: dataStr,
        durata: servizioSelezionato.durata,
      };
      if (sedeSelezionata?._id) paramsAva.sedeId = sedeSelezionata._id;
      const risposta = await webservice.get('/api/appointments/availability', { params: paramsAva });
      setSlotOrari(risposta.dati.slot || []);
      setSediDisponibili(risposta.dati.sediDisponibili || []);

      if (sedeSelezionata && risposta.dati.sediDisponibili) {
        const sedeAgg = risposta.dati.sediDisponibili.find(
          (s: any) => s._id === sedeSelezionata._id
        );
        if (sedeAgg) {
          setSedeSelezionata(sedeAgg);
        }
      }
    } catch (err) {
      setSlotOrari([]);
      setSediDisponibili([]);
    } finally {
      setCaricamentoSlot(false);
    }
  };

  const loadSpecialistClosures = async (specialistId: string) => {
    try {
      const risposta = await webservice.get(`/api/specialist/${specialistId}`);
      if (risposta.dati?.giorniChiusura) {
        setSpecialistClosures(risposta.dati.giorniChiusura);
      } else {
        setSpecialistClosures([]);
      }
    } catch {
      setSpecialistClosures([]);
    }
  };

  const scrollToSection = (sectionId: string) => {
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        const offset = 100;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }, 100);
  };

  const handleSelezionaSede = (sede: any) => {
    setSedeSelezionata(sede);
    setPostazioneSelezionata(
      sede.postazioni?.filter((p: any) => p.attivo).length === 1
        ? sede.postazioni.find((p: any) => p.attivo)?.nome || ''
        : ''
    );
    setStep('servizio');
    scrollToSection('step-servizio');
  };

  const handleSelezionaServizio = async (servizio: Servizio) => {
    setServizioSelezionato(servizio);
    setSelectedSpecialist(null);
    setDataSelezionata(null);
    setOraSelezionata('');
    await caricaSpecialistiPerServizio(servizio._id);
    setStep('specialist');
    scrollToSection('step-specialist');
  };

  const handleSelectSpecialist = async (specialist: Specialist) => {
    setSelectedSpecialist(specialist);
    await loadSpecialistClosures(specialist._id);
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
    let numeroPulito = telefono.replace(/[\s\-\(\)\.]/g, '');
    
    if (numeroPulito.startsWith('+39')) {
      return numeroPulito;
    }
    
    if (numeroPulito.startsWith('39') && numeroPulito.length >= 12) {
      return '+' + numeroPulito;
    }
    
    if (numeroPulito.startsWith('3') && numeroPulito.length >= 10) {
      return '+39' + numeroPulito;
    }
    
    if (numeroPulito.startsWith('0') && numeroPulito.length >= 10) {
      return '+39' + numeroPulito.substring(1);
    }
    
    return '+39' + numeroPulito;
  };

  const handleConferma = async () => {
    if (!selectedSpecialist || !servizioSelezionato || !dataSelezionata || !oraSelezionata) {
      setErrore('Missing data for booking');
      return;
    }

    if (!nomeCliente.trim() || !cognomeCliente.trim() || !telefonoCliente.trim()) {
      setErrore('Name, surname and phone are required');
      return;
    }

    try {
      setCaricamento(true);
      setErrore('');

      const dataStr = dateToLocalString(dataSelezionata);

      const telefonoNormalizzato = normalizzaTelefono(telefonoCliente.trim());

      const payload: any = {
        specialistaId: selectedSpecialist._id,
        servizioId: servizioSelezionato._id,
        data: dataStr,
        oraInizio: oraSelezionata,
        note,
        clienteNome: nomeCliente.trim(),
        clienteCognome: cognomeCliente.trim(),
        clienteTelefono: telefonoNormalizzato,
      };

      if (voucherData) {
        payload.voucherCode = voucherCode;
      }

      if (sedeSelezionata) {
        payload.sedeId = sedeSelezionata._id;
      }
      if (postazioneSelezionata) {
        payload.postazione = postazioneSelezionata;
      }

      await webservice.post('/api/appointments', payload);

      const params = new URLSearchParams({
        specialist: `${selectedSpecialist.nome} ${selectedSpecialist.cognome}`,
        servizio: servizioSelezionato.nome,
        data: dataStr,
        ora: oraSelezionata,
        prezzo: `€${servizioSelezionato.prezzo.toFixed(2)}`,
      });

      if (sedeSelezionata) {
        params.set('sede', sedeSelezionata.nome);
      }
      if (postazioneSelezionata) {
        params.set('postazione', postazioneSelezionata);
      }

      router.push(`/booking/success?${params.toString()}`);
    } catch (err: any) {
      const messaggio = err.response?.data?.errore || 'Error during booking';
      const params = new URLSearchParams({ errore: messaggio });
      router.push(`/booking/error?${params.toString()}`);
    } finally {
      setCaricamento(false);
    }
  };

  const valideazaVoucher = async () => {
    if (!voucherCode.trim()) {
      setVoucherError('');
      setVoucherData(null);
      return;
    }
    if (!servizioSelezionato) {
      setVoucherError('Selectează mai întâi un serviciu');
      return;
    }
    try {
      setVoucherError('');
      const res = await webservice.post('/api/vouchers', {
        code: voucherCode,
        serviceId: servizioSelezionato._id,
      });
      setVoucherData(res.dati);
    } catch (err: any) {
      setVoucherData(null);
      setVoucherError(err.response?.data?.errore || 'Voucher invalid');
    }
  };

  // Re-validate voucher when service changes
  useEffect(() => {
    if (voucherCode.trim() && voucherData) {
      setVoucherData(null);
      setVoucherError('');
    }
  }, [servizioSelezionato?._id]);

  const isDisponibile = (data: Date): { disponibile: boolean; motivo?: string } => {
    const oggi = new Date();
    oggi.setHours(0, 0, 0, 0);
    
    if (data < oggi) {
      return { disponibile: false, motivo: 'Past date' };
    }
    
    const giornoSettimana = data.getDay();
    if (giornoSettimana === 0) {
      return { disponibile: false, motivo: 'Closed' };
    }
    
    const dataStr = dateToLocalString(data);
    
    const chiusura = specialistClosures.find((c) => {
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

  if (caricamento && servizi.length === 0) {
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
              <Link href="/contact" className="text-white/80 hover:text-white transition-colors font-medium">Contacts</Link>
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
              { key: 'locatie', label: 'Location', icon: (
                <svg className="w-4 h-4 md:w-5 md:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              )},
              { key: 'servizio', label: 'Service', icon: (
                <svg className="w-4 h-4 md:w-5 md:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                </svg>
              )},
              { key: 'specialist', label: 'Specialist', icon: (
                <svg className="w-4 h-4 md:w-5 md:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              )},
              { key: 'data', label: 'Date', icon: (
                <svg className="w-4 h-4 md:w-5 md:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              )},
              { key: 'ora', label: 'Time', icon: (
                <svg className="w-4 h-4 md:w-5 md:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              )},
              { key: 'conferma', label: 'Confirm', icon: (
                <svg className="w-4 h-4 md:w-5 md:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              )},
            ].map((s, index) => (
              <div key={s.key} className="flex flex-col items-center flex-1">
                <div className={`w-8 h-8 md:w-12 md:h-12 border-2 flex items-center justify-center font-bold transition-all ${
                  step === s.key 
                    ? 'bg-white text-black border-white scale-110' 
                    : ['locatie', 'servizio', 'specialist', 'data', 'ora', 'conferma'].indexOf(step) > index
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
                width: `${(['locatie', 'servizio', 'specialist', 'data', 'ora', 'conferma'].indexOf(step) + 1) * 16.67}%` 
              }}
            />
          </div>
        </div>

        {errore && <div className="max-w-4xl mx-auto mb-6"><Messaggio tipo="errore" messaggio={errore} onChiudi={() => setErrore('')} /></div>}

        {/* STEP 1: LOCATION */}
        {step === 'locatie' && (
          <div id="step-locatie" className="max-w-4xl mx-auto">
            <h2 className="text-xl md:text-3xl font-bold mb-4 md:mb-8 text-center tracking-tight">
              CHOOSE YOUR LOCATION
            </h2>

            {sediPubbliche.length === 0 ? (
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 md:p-12 text-center">
                <svg className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 text-white/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                <p className="text-lg md:text-xl text-white/60">No locations available</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                {sediPubbliche.map((sede: any) => (
                  <div
                    key={sede._id}
                    onClick={() => handleSelezionaSede(sede)}
                    className="bg-white/5 backdrop-blur-sm border border-white/10 p-5 md:p-8 hover:bg-white/10 transition-all cursor-pointer group"
                  >
                    <svg className="w-10 h-10 md:w-14 md:h-14 mx-auto mb-3 md:mb-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                    <h3 className="text-lg md:text-xl font-bold mb-1 text-center">{sede.nome}</h3>
                    <p className="text-sm text-white/60 text-center">{sede.indirizzo}</p>
                    {sede.citta && <p className="text-sm text-white/60 text-center">{sede.citta}</p>}
                    <div className="mt-3 text-center">
                      <span className="text-xs text-white/40">
                        {sede.postazioni?.filter((p: any) => p.attivo).length || 0} stations
                      </span>
                    </div>
                    <button className="w-full mt-3 md:mt-4 bg-white text-black py-2.5 md:py-3 font-bold hover:bg-white/90 transition-all text-xs md:text-base">
                      SELECT →
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 2: SERVIZIO */}
        {step === 'servizio' && (
          <div id="step-servizio" className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-4 md:mb-8">
              <h2 className="text-xl md:text-3xl font-bold tracking-tight">
                {testiPrenotazione.stepServizio}
              </h2>
              <button
                onClick={() => { setStep('locatie'); scrollToSection('step-locatie'); }}
                className="text-white/70 hover:text-white font-medium text-xs md:text-base"
              >
                ← Back
              </button>
            </div>
            
            {sedeSelezionata && (
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-3 md:p-4 mb-4 md:mb-8">
                <p className="text-center text-sm md:text-base">
                  <span className="text-white/60">Location:</span>{' '}
                  <span className="font-bold">{sedeSelezionata.nome}</span>
                  {sedeSelezionata.indirizzo && (
                    <span className="text-white/40 ml-2">· {sedeSelezionata.indirizzo}, {sedeSelezionata.citta}</span>
                  )}
                </p>
              </div>
            )}

            {servizi.length === 0 ? (
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 md:p-12 text-center">
                <svg className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 text-white/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="8" y1="15" x2="16" y2="15"/>
                  <line x1="9" y1="9" x2="9.01" y2="9"/>
                  <line x1="15" y1="9" x2="15.01" y2="9"/>
                </svg>
                <p className="text-lg md:text-xl text-white/60">No services available</p>
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
                      SELECT →
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 2: SPECIALIST */}
        {step === 'specialist' && servizioSelezionato && (
          <div id="step-specialist" className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-4 md:mb-8">
              <h2 className="text-xl md:text-3xl font-bold tracking-tight">{testiPrenotazione.stepSpecialist}</h2>
              <button
                onClick={() => {
                  setStep('servizio');
                  scrollToSection('step-servizio');
                }}
                className="text-white/70 hover:text-white font-medium text-xs md:text-base"
              >
                ← Back
              </button>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-3 md:p-4 mb-4 md:mb-8">
              <p className="text-center text-sm md:text-base">
                <span className="text-white/60">Location:</span>{' '}
                <span className="font-bold">{sedeSelezionata?.nome}</span>
                <span className="mx-2 text-white/20">·</span>
                <span className="text-white/60">Service:</span>{' '}
                <span className="font-bold">{servizioSelezionato.nome}</span>
              </p>
            </div>

            {caricamentoSpecialisti ? (
              <div className="text-center py-8 md:py-12">
                <Caricamento />
                <p className="text-white/60 mt-4 text-sm md:text-base">Loading specialists...</p>
              </div>
            ) : specialists.length === 0 ? (
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 md:p-12 text-center">
                <svg className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 text-white/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="8" y1="15" x2="16" y2="15"/>
                  <line x1="9" y1="9" x2="9.01" y2="9"/>
                  <line x1="15" y1="9" x2="15.01" y2="9"/>
                </svg>
                <p className="text-lg md:text-xl text-white/60">No specialists available</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                {specialists.map((specialist) => (
                  <div
                    key={specialist._id}
                    onClick={() => handleSelectSpecialist(specialist)}
                    className="bg-white/5 backdrop-blur-sm border border-white/10 p-5 md:p-8 hover:bg-white/10 transition-all cursor-pointer group"
                  >
                    <svg className="w-14 h-14 md:w-20 md:h-20 mx-auto mb-3 md:mb-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                    <h3 className="text-lg md:text-xl font-bold mb-1 text-center tracking-tight">
                      {specialist.nome} {specialist.cognome}
                    </h3>
                    {specialist.giorniSede && specialist.giorniSede.length > 0 && (
                      <p className="text-xs text-white/50 text-center mb-3">
                        Disponibil: {specialist.giorniSede.join(', ')}
                      </p>
                    )}
                    <button className="w-full bg-white text-black py-2.5 md:py-3 font-bold hover:bg-white/90 transition-all text-sm md:text-base">
                      SELECT →
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
                  setStep('specialist');
                  scrollToSection('step-specialist');
                }}
                className="text-white/70 hover:text-white font-medium text-xs md:text-base"
              >
                ← Back
              </button>
            </div>

            {/* Riepilogo compatto su mobile - sopra il calendario */}
            <div className="lg:hidden bg-white/5 backdrop-blur-sm border border-white/10 p-3 mb-4">
              <div className="flex items-center justify-between text-sm">
                <div>
                  <span className="text-white/60">{selectedSpecialist?.nome}</span>
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
                <h3 className="text-xl font-bold mb-6 tracking-tight">SUMMARY</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-white/60 mb-1">Specialist</p>
                    <p className="font-bold">{selectedSpecialist?.nome} {selectedSpecialist?.cognome}</p>
                  </div>
                  <div>
                    <p className="text-sm text-white/60 mb-1">Service</p>
                    <p className="font-bold">{servizioSelezionato.nome}</p>
                  </div>
                  <div className="flex justify-between pt-4 border-t border-white/10">
                    <span className="text-white/60">Duration</span>
                    <span className="font-bold">{servizioSelezionato.durata} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Price</span>
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
                ← Back
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

                {/* Location info */}
                {sedeSelezionata && (
                  <div className="mb-4 md:mb-6 bg-white/10 p-3 md:p-4">
                    <div className="flex items-center gap-2 text-sm md:text-base">
                      <svg className="w-4 h-4 md:w-5 md:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                        <circle cx="12" cy="10" r="3"/>
                      </svg>
                      <span className="text-white/60">Location:</span>
                      <span className="font-bold">{sedeSelezionata.nome}</span>
                      <span className="text-white/40 ml-2 text-xs">{sedeSelezionata.indirizzo}</span>
                    </div>
                  </div>
                )}

                {/* Station selection */}
                {sedeSelezionata?.postazioni?.length > 0 && (
                  <div className="mb-4 md:mb-6">
                    <h3 className="text-sm md:text-base font-bold mb-2 md:mb-3 tracking-tight">STATION</h3>
                    <div className="flex flex-wrap gap-2 md:gap-3">
                      {sedeSelezionata.postazioni
                        .filter((p: any) => p.attivo !== false)
                        .map((p: any) => (
                        <button
                          key={p.nome}
                          onClick={() => !p.occupato && setPostazioneSelezionata(p.nome)}
                          disabled={p.occupato}
                          className={`px-3 py-2 md:px-4 md:py-3 font-bold text-xs md:text-sm transition-all ${
                            postazioneSelezionata === p.nome
                              ? 'bg-white text-black'
                              : p.occupato
                              ? 'bg-white/10 text-white/30 cursor-not-allowed line-through'
                              : 'bg-white/5 text-white/80 border border-white/20 hover:bg-white/10'
                          }`}
                        >
                          {p.nome}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {caricamentoSlot ? (
                  <div className="text-center py-8 md:py-12">
                    <Caricamento />
                    <p className="text-white/60 mt-4 text-sm md:text-base">Loading times...</p>
                  </div>
                ) : slotOrari.length > 0 ? (
                  <>
                    {/* Show separator if sede/postazione section was shown */}
                    {(sediDisponibili.length > 0 || (sedeSelezionata && sedeSelezionata.postazioni?.length > 0)) && (
                      <div className="border-t border-white/10 my-4 md:my-6"></div>
                    )}
                    <h3 className="text-sm md:text-base font-bold mb-2 md:mb-3 tracking-tight">TIME</h3>
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
                  </>
                ) : (
                  <div className="text-center py-8 md:py-12">
                    <svg className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 text-white/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="8" y1="15" x2="16" y2="15"/>
                      <line x1="9" y1="9" x2="9.01" y2="9"/>
                      <line x1="15" y1="9" x2="15.01" y2="9"/>
                    </svg>
                    <p className="text-lg md:text-xl text-white/60 mb-4 md:mb-6">No times available</p>
                    <button
                      onClick={() => {
                        setStep('data');
                        scrollToSection('step-data');
                      }}
                      className="px-4 md:px-6 py-2.5 md:py-3 bg-white text-black font-bold hover:bg-white/90 text-sm md:text-base"
                    >
                      Choose another date
                    </button>
                  </div>
                )}
              </div>

              {/* Riepilogo desktop */}
              <div className="hidden lg:block bg-white/5 backdrop-blur-sm border border-white/10 p-6 lg:sticky lg:top-4 h-fit">
                <h3 className="text-xl font-bold mb-6 tracking-tight">SUMMARY</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-white/60 mb-1">Specialist</p>
                    <p className="font-bold">{selectedSpecialist?.nome} {selectedSpecialist?.cognome}</p>
                  </div>
                  <div>
                    <p className="text-sm text-white/60 mb-1">Service</p>
                    <p className="font-bold">{servizioSelezionato?.nome}</p>
                  </div>
                  <div>
                    <p className="text-sm text-white/60 mb-1">Date</p>
                    <p className="font-bold">{dataSelezionata.toLocaleDateString('it-IT')}</p>
                  </div>
                  {sedeSelezionata && (
                    <div>
                      <p className="text-sm text-white/60 mb-1">Location</p>
                      <p className="font-bold">{sedeSelezionata.nome}</p>
                      {postazioneSelezionata && (
                        <p className="text-sm text-white/60">Station: {postazioneSelezionata}</p>
                      )}
                    </div>
                  )}
                  <div className="flex justify-between pt-4 border-t border-white/10">
                    <span className="text-white/60">Total</span>
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
                <h3 className="text-xl md:text-2xl font-bold mb-1 md:mb-2">ALMOST DONE!</h3>
                <p className="text-sm md:text-lg text-black/60">Enter your details to complete</p>
              </div>

              <div className="p-4 md:p-8">
                <div className="mb-5 md:mb-8">
                  <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4 tracking-tight">YOUR DETAILS</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    <div>
                      <label className="block text-xs md:text-sm font-bold mb-1.5 md:mb-2">
                        Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={nomeCliente}
                        onChange={(e) => setNomeCliente(e.target.value)}
                        placeholder="Your name"
                        className="w-full bg-white/10 border border-white/20 px-3 md:px-4 py-2.5 md:py-3 focus:border-white focus:outline-none text-white text-sm md:text-base"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs md:text-sm font-bold mb-1.5 md:mb-2">
                        Surname <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={cognomeCliente}
                        onChange={(e) => setCognomeCliente(e.target.value)}
                        placeholder="Your surname"
                        className="w-full bg-white/10 border border-white/20 px-3 md:px-4 py-2.5 md:py-3 focus:border-white focus:outline-none text-white text-sm md:text-base"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs md:text-sm font-bold mb-1.5 md:mb-2">
                        Phone <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={telefonoCliente}
                        onChange={(e) => setTelefonoCliente(e.target.value)}
                        placeholder="333-1234567 or +39-333-1234567"
                        className="w-full bg-white/10 border border-white/20 px-3 md:px-4 py-2.5 md:py-3 focus:border-white focus:outline-none text-white text-sm md:text-base"
                        required
                      />
                      <p className="text-[10px] md:text-xs text-white/60 mt-1">
                        Enter your phone number (will be automatically converted to international format +39)
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 p-4 md:p-6 mb-4 md:mb-6">
                  <h3 className="text-base md:text-xl font-bold mb-3 md:mb-4 tracking-tight">SUMMARY</h3>
                  <div className="space-y-2.5 md:space-y-4">
                    <div className="flex justify-between items-center text-sm md:text-base">
                      <span className="text-white/60">Specialist</span>
                      <span className="font-bold text-right">{selectedSpecialist?.nome} {selectedSpecialist?.cognome}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm md:text-base">
                      <span className="text-white/60">Service</span>
                      <span className="font-bold text-right">{servizioSelezionato?.nome}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm md:text-base">
                      <span className="text-white/60">Date</span>
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
                      <span className="text-white/60">Time</span>
                      <span className="font-bold">{oraSelezionata}</span>
                    </div>
                    {sedeSelezionata && (
                      <div className="flex justify-between items-center text-sm md:text-base">
                        <span className="text-white/60">Location</span>
                        <span className="font-bold text-right">{sedeSelezionata.nome}</span>
                      </div>
                    )}
                    {postazioneSelezionata && (
                      <div className="flex justify-between items-center text-sm md:text-base">
                        <span className="text-white/60">Station</span>
                        <span className="font-bold">{postazioneSelezionata}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-sm md:text-base">
                      <span className="text-white/60">Duration</span>
                      <span className="font-bold">{servizioSelezionato?.durata} min</span>
                    </div>
                    <div className="flex justify-between items-center pt-3 md:pt-4 border-t border-white/20">
                      <span className="text-white/60 font-bold text-base md:text-lg">Total</span>
                      <span className="font-bold text-2xl md:text-3xl">
                        {voucherData && voucherData.type === 'free'
                          ? 'FREE'
                          : formattaPrezzo(
                              servizioSelezionato?.prezzo || 0 -
                              (voucherData?.type === 'fixed' ? voucherData.value : 0) -
                              (voucherData?.type === 'percentage' ? (servizioSelezionato?.prezzo || 0) * voucherData.value / 100 : 0)
                            )}
                      </span>
                    </div>
                    {voucherData && (
                      <div className="flex justify-between items-center text-sm pt-2">
                        <span className="text-green-400">
                          {voucherData.type === 'percentage' ? `-${voucherData.value}%` :
                           voucherData.type === 'fixed' ? `-€${voucherData.value}` : 'FREE'}
                        </span>
                        <span className="text-green-400">
                          {voucherData.customerName}{voucherData.customerSurname ? ` ${voucherData.customerSurname}` : ''}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-xs md:text-sm font-bold mb-1.5">Voucher code</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={voucherCode}
                      onChange={(e) => { setVoucherCode(e.target.value.toUpperCase()); setVoucherData(null); setVoucherError(''); }}
                      placeholder="Enter voucher code"
                      className="flex-1 bg-white/10 border border-white/20 px-3 md:px-4 py-2.5 focus:border-white focus:outline-none text-white text-sm"
                    />
                    <button
                      onClick={valideazaVoucher}
                      className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white font-bold text-sm"
                    >
                      Apply
                    </button>
                  </div>
                  {voucherError && <p className="text-red-400 text-xs mt-1">{voucherError}</p>}
                  {voucherData && <p className="text-green-400 text-xs mt-1">Voucher applied: {voucherData.type === 'percentage' ? `${voucherData.value}% off` : voucherData.type === 'fixed' ? `€${voucherData.value} off` : 'FREE'}</p>}
                </div>

                <div className="mb-4 md:mb-6">
                  <label className="block text-xs md:text-sm font-bold mb-1.5 md:mb-2">Notes (optional)</label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Any special requests..."
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
                    ← BACK
                  </button>
                  <button
                    onClick={handleConferma}
                    disabled={caricamento || !nomeCliente.trim() || !cognomeCliente.trim() || !telefonoCliente.trim()}
                    className="flex-1 px-4 md:px-6 py-3 md:py-4 bg-white text-black font-bold text-sm md:text-lg hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {caricamento ? (
                      'BOOKING...'
                    ) : (
                      <>
                        <svg className="w-4 h-4 md:w-5 md:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        CONFIRM
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
  const giorniSettimana = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const giorniSettimanaBrevi = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

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
          <span className="hidden sm:inline">Click on an available day to see times</span>
          <span className="sm:hidden">Select an available day</span>
        </p>
      </div>
    </div>
  );
}
