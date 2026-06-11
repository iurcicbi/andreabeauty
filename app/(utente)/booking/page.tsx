'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import webservice from '@/utils/webservice';
import Messaggio from '@/componenti/comuni/Messaggio';
import Caricamento from '@/componenti/comuni/Caricamento';
import { formattaPrezzo } from '@/utils/helpers';
import FeaturedReviewsBlock from '@/componenti/homepage/FeaturedReviewsBlock';

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
  biografia?: string;
  servizi?: { nome: string; categoria: string }[];
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

const STEP_ORDINE: Step[] = ['locatie', 'servizio', 'specialist', 'data', 'ora', 'conferma'];

const LABEL_STEP: Record<Step, string> = {
  locatie: 'Locație',
  servizio: 'Serviciu',
  specialist: 'Specialist',
  data: 'Dată & Oră',
  ora: 'Dată & Oră',
  conferma: 'Confirmare',
};

export default function PrenotazionePage() {
  const router = useRouter();

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

  const [nomeCompleto, setNomeCompleto] = useState('');
  const [telefonoCliente, setTelefonoCliente] = useState('');
  const [prefissoTelefono, setPrefissoTelefono] = useState('+39');
  const [emailCliente, setEmailCliente] = useState('');

  const [mese, setMese] = useState(new Date().getMonth());
  const [anno, setAnno] = useState(new Date().getFullYear());
  const [slotOrari, setSlotOrari] = useState<SlotOrario[]>([]);
  const [specialistClosures, setSpecialistClosures] = useState<GiornoChiusura[]>([]);

  const [sediPubbliche, setSediPubbliche] = useState<any[]>([]);
  const [sediDisponibili, setSediDisponibili] = useState<any[]>([]);
  const [sedeSelezionata, setSedeSelezionata] = useState<any>(null);
  const [postazioneSelezionata, setPostazioneSelezionata] = useState<string>('');

  const [caricamento, setCaricamento] = useState(true);
  const [caricamentoSlot, setCaricamentoSlot] = useState(false);
  const [caricamentoSpecialisti, setCaricamentoSpecialisti] = useState(false);
  const [errore, setErrore] = useState('');
  const [mostraPrezzi, setMostraPrezzi] = useState(true);
  const [descrizioniAperte, setDescrizioniAperte] = useState<Set<string>>(new Set());

  const toggleDescrizione = useCallback((id: string) => {
    setDescrizioniAperte(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const [testiPrenotazione, setTestiPrenotazione] = useState({
    titoloPagina: 'Programare Online',
    sottotitoloPagina: 'Rezervă-ți momentul de răsfăț în universul nostru dedicat frumuseții autentice. Urmează pașii de mai jos pentru a selecta experiența dorită.',
    stepLocatie: 'Alege Locația',
    stepServizio: 'Selectează Serviciul',
    stepSpecialist: 'Alege Specialistul',
    stepData: 'Selectează Data',
    stepOrario: 'Alege Ora',
    stepConferma: 'Confirmare Programare'
  });

  const nomiMesi = ['Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie',
    'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie'];

  const dateToLocalString = (data: Date): string => {
    const anno = data.getFullYear();
    const mese = String(data.getMonth() + 1).padStart(2, '0');
    const giorno = String(data.getDate()).padStart(2, '0');
    return `${anno}-${mese}-${giorno}`;
  };

  useEffect(() => {
    caricaDati();
    caricaTestiPrenotazione();
  }, []);

  const caricaTestiPrenotazione = async () => {
    try {
      const risposta = await webservice.get('/api/settings');
      if (risposta.dati?.testiPrenotazione) {
        setTestiPrenotazione(prev => ({ ...prev, ...risposta.dati.testiPrenotazione }));
      }
      setMostraPrezzi(risposta.dati?.funzionalita?.mostraPrezziFrontend !== false);
    } catch { }
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
    } catch {
      setErrore('Eroare la încărcarea datelor');
    } finally {
      setCaricamento(false);
    }
  };

  const caricaSpecialistiPerServizio = async (serviceId: string) => {
    try {
      setCaricamentoSpecialisti(true);
      webservice.clearCache();
      const params: any = {};
      if (sedeSelezionata?._id) params.sedeId = sedeSelezionata._id;
      const risposta = await webservice.get(`/api/services/${serviceId}/specialists`, { params });
      setSpecialists(risposta.dati || []);
    } catch {
      setSpecialists([]);
    } finally {
      setCaricamentoSpecialisti(false);
    }
  };

  const caricaSlotOrari = async (data: Date) => {
    if (!selectedSpecialist || !servizioSelezionato) return;
    const specialistId = selectedSpecialist._id;
    const durata = servizioSelezionato.durata;
    const sedeId = sedeSelezionata?._id;
    try {
      setCaricamentoSlot(true);
      setSediDisponibili([]);
      setSedeSelezionata(null);
      setPostazioneSelezionata('');
      const dataStr = dateToLocalString(data);
      const paramsAva: any = {
        specialistId,
        data: dataStr,
        durata,
      };
      if (sedeId) paramsAva.sedeId = sedeId;
      const risposta = await webservice.get('/api/appointments/availability', { params: paramsAva });
      setSlotOrari(risposta.dati.slot || []);
      setSediDisponibili(risposta.dati.sediDisponibili || []);
      if (sedeId && risposta.dati.sediDisponibili) {
        const sedeAgg = risposta.dati.sediDisponibili.find((s: any) => s._id === sedeId);
        if (sedeAgg) setSedeSelezionata(sedeAgg);
      }
    } catch {
      setSlotOrari([]);
      setSediDisponibili([]);
    } finally {
      setCaricamentoSlot(false);
    }
  };

  const loadSpecialistClosures = async (specialistId: string) => {
    try {
      const risposta = await webservice.get(`/api/specialist/${specialistId}`);
      setSpecialistClosures(risposta.dati?.giorniChiusura || []);
    } catch {
      setSpecialistClosures([]);
    }
  };

  const scrollToSection = (_sectionId?: string) => {
    setTimeout(() => {
      const stickyBar = document.querySelector<HTMLElement>('.sticky');
      if (stickyBar) {
        // Scroll più in alto per mostrare meglio gli step indicator
        // Sottrai un offset aggiuntivo (es. 100px) per mostrare la barra degli step
        const offset = 100;
        const top = Math.max(0, stickyBar.offsetTop - offset);
        if (window.scrollY > top + 10 || window.scrollY < top - 10) {
          window.scrollTo({ top, behavior: 'smooth' });
        }
      }
    }, 50);
  };

  const handleSelezionaSede = (sede: any) => {
    setSedeSelezionata(sede);
    setPostazioneSelezionata(
      sede.postazioni?.filter((p: any) => p.attivo).length === 1
        ? sede.postazioni.find((p: any) => p.attivo)?.nome || ''
        : ''
    );
    setServizioSelezionato(null);
    setSelectedSpecialist(null);
    setDataSelezionata(null);
    setOraSelezionata('');
    setSpecialists([]);
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

  const normalizzaTelefono = (telefono: string, prefisso: string): string => {
    let numeroPulito = telefono.replace(/[\s\-\(\)\.]/g, '');
    if (numeroPulito.startsWith('+')) return numeroPulito;
    return prefisso + numeroPulito;
  };

  const handleConferma = async () => {
    if (!selectedSpecialist || !servizioSelezionato || !dataSelezionata || !oraSelezionata) {
      setErrore('Date lipsă pentru programare');
      return;
    }
    if (!nomeCompleto.trim() || !telefonoCliente.trim() || !emailCliente.trim()) {
      setErrore('Numele, telefonul și emailul sunt obligatorii');
      return;
    }
    try {
      setCaricamento(true);
      setErrore('');
      const dataStr = dateToLocalString(dataSelezionata);
      const telefonoNormalizzato = normalizzaTelefono(telefonoCliente.trim(), prefissoTelefono);
      const partiNome = nomeCompleto.trim().split(/\s+/);
      const payload: any = {
        specialistaId: selectedSpecialist._id,
        servizioId: servizioSelezionato._id,
        data: dataStr,
        oraInizio: oraSelezionata,
        note,
        clienteNome: partiNome[0] || '',
        clienteCognome: partiNome.slice(1).join(' ') || '',
        clienteTelefono: telefonoNormalizzato,
        clienteEmail: emailCliente.trim(),
      };
      if (voucherData) payload.voucherCode = voucherCode;
      if (sedeSelezionata) payload.sedeId = sedeSelezionata._id;
      if (postazioneSelezionata) payload.postazione = postazioneSelezionata;

      await webservice.post('/api/appointments', payload);

      const params = new URLSearchParams({
        specialist: `${selectedSpecialist.nome} ${selectedSpecialist.cognome}`,
        servizio: servizioSelezionato.nome,
        data: dataStr,
        ora: oraSelezionata,
        prezzo: `€${servizioSelezionato.prezzo.toFixed(2)}`,
      });
      if (sedeSelezionata) params.set('sede', sedeSelezionata.nome);
      if (postazioneSelezionata) params.set('postazione', postazioneSelezionata);

      router.push(`/booking/success?${params.toString()}`);
    } catch (err: any) {
      const messaggio = err.response?.data?.errore || 'Eroare la programare';
      const params = new URLSearchParams({ errore: messaggio });
      router.push(`/booking/error?${params.toString()}`);
    } finally {
      setCaricamento(false);
    }
  };

  const valideazaVoucher = async () => {
    if (!voucherCode.trim()) { setVoucherError(''); setVoucherData(null); return; }
    if (!servizioSelezionato) { setVoucherError('Selectează mai întâi un serviciu'); return; }
    try {
      setVoucherError('');
      const res = await webservice.post('/api/vouchers', { code: voucherCode, serviceId: servizioSelezionato._id });
      setVoucherData(res.dati);
    } catch (err: any) {
      setVoucherData(null);
      setVoucherError(err.response?.data?.errore || 'Voucher invalid');
    }
  };

  useEffect(() => {
    if (voucherCode.trim() && voucherData) { setVoucherData(null); setVoucherError(''); }
  }, [servizioSelezionato?._id]);

  const isDisponibile = (data: Date): { disponibile: boolean; motivo?: string } => {
    const oggi = new Date();
    oggi.setHours(0, 0, 0, 0);
    if (data < oggi) return { disponibile: false, motivo: 'Trecut' };
    const giornoSettimana = data.getDay();
    if (giornoSettimana === 0) return { disponibile: false, motivo: 'Închis' };
    const dataStr = dateToLocalString(data);
    const chiusura = specialistClosures.find((c) => {
      const dataChiusura = typeof c.data === 'string' ? c.data.split('T')[0] : dateToLocalString(new Date(c.data));
      return dataChiusura === dataStr;
    });
    if (chiusura) return { disponibile: false, motivo: chiusura.motivo };
    return { disponibile: true };
  };

  const calcProgres = () => Math.round((STEP_ORDINE.indexOf(step) / (STEP_ORDINE.length - 1)) * 100);

  if (caricamento && servizi.length === 0) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <Caricamento />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface pt-12 text-on-surface">
      {/* Page Header */}
      <header className="pt-20 pb-2 md:pb-4 px-container-padding-mobile md:px-container-padding-desktop max-w-[1440px] mx-auto">
        <div className="text-center mb-3 md:mb-6">
          <h1 className="font-headline-md text-headline-md mb-2 text-on-surface">
            {testiPrenotazione.titoloPagina}
          </h1>
          <p className="hidden md:block font-body-md text-on-surface-variant max-w-xl mx-auto">
            {testiPrenotazione.sottotitoloPagina}
          </p>
        </div>
      </header>

      {/* Sticky Progress Bar */}
      <div className="sticky top-0 z-20 bg-surface border-b border-outline-variant/20 shadow-sm">
        <div className="px-container-padding-mobile md:px-container-padding-desktop max-w-[1440px] mx-auto py-2 md:py-3">
          {/* Mobile View - Step loading line */}
          <div className="md:hidden">
            <div className="flex justify-between items-center mb-2">
              <div className="flex-1">
                <div className="font-label-caps text-[10px] tracking-[0.25em] uppercase text-on-surface-variant/60 mb-1">
                  PASUL {STEP_ORDINE.indexOf(step) + 1} DIN {STEP_ORDINE.length}
                </div>
                <div className="font-label-caps text-[13px] uppercase tracking-wider text-on-surface font-semibold">
                  {LABEL_STEP[step]}
                </div>
              </div>
              {step !== 'locatie' && (
                <button
                  onClick={() => {
                    const currentIndex = STEP_ORDINE.indexOf(step);
                    if (currentIndex > 0) {
                      const prevStep = STEP_ORDINE[currentIndex - 1];
                      setStep(prevStep);
                      scrollToSection(`step-${prevStep}`);
                    }
                  }}
                  className="flex items-center gap-1 text-on-surface-variant hover:text-primary transition-colors ml-4"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                  </svg>
                </button>
              )}
            </div>
            {/* Step progress line */}
            <div className="h-1 bg-outline-variant/15 rounded-full overflow-hidden">
              <div
                className="h-full bg-on-surface transition-all duration-700 ease-out rounded-full"
                style={{ width: `${calcProgres()}%` }}
              />
            </div>
          </div>

          {/* Desktop View - Show all steps */}
          <div className="hidden md:block">
            <div className="flex flex-row justify-between items-center max-w-6xl mx-auto">
              {STEP_ORDINE.map((s, i) => {
                const stepIdx = STEP_ORDINE.indexOf(step);
                const isActive = s === step;
                const isCompleted = stepIdx > i;
                return (
                  <div
                    key={s}
                    className={`flex items-center gap-3 py-1 px-3 transition-all duration-500 ${
                      isActive
                        ? 'text-primary'
                        : isCompleted
                        ? 'text-on-surface-variant/50'
                        : 'text-on-surface-variant/30'
                    }`}
                  >
                    <span className={`flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-bold font-label-caps transition-all ${
                      isActive
                        ? 'bg-primary text-on-primary'
                        : isCompleted
                        ? 'bg-on-surface-variant/20 text-on-surface-variant'
                        : 'bg-outline-variant/20 text-on-surface-variant/40'
                    }`}>
                      {isCompleted ? (
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                      ) : (
                        i + 1
                      )}
                    </span>
                    <span className={`font-label-caps text-[11px] uppercase tracking-widest transition-all ${
                      isActive ? 'font-semibold' : ''
                    }`}>
                      {LABEL_STEP[s]}
                    </span>
                  </div>
                );
              })}
            </div>
            {/* Progress fill bar */}
            <div className="max-w-6xl mx-auto mt-2 h-1 bg-outline-variant/15 rounded-full overflow-hidden">
              <div
                className="h-full bg-on-surface transition-all duration-700 ease-out rounded-full"
                style={{ width: `${calcProgres()}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {errore && (
        <div className="max-w-4xl mx-auto mt-4 mb-2 px-container-padding-mobile md:px-container-padding-desktop">
          <Messaggio tipo="errore" messaggio={errore} onChiudi={() => setErrore('')} />
        </div>
      )}

      {/* STEP 1: LOCATION */}
      {step === 'locatie' && (
        <section id="step-locatie" className="scroll-mt-0 px-container-padding-mobile md:px-container-padding-desktop py-3 md:py-gutter bg-surface-bright">
          <div className="max-w-6xl mx-auto">
          <div className="mb-2 md:mb-6 hidden md:block">
            <span className="font-label-caps text-[10px] tracking-[0.25em] uppercase text-on-surface-variant/50">
              PASUL 01 — {testiPrenotazione.stepLocatie || 'Locație'}
            </span>
          </div>
          <div className="flex justify-between items-start mb-2 md:mb-12">
            <div className="flex-1">
              <p className="hidden md:block font-label-caps text-label-caps text-primary mb-2 uppercase">Selectează locația</p>
              <h2 className="font-display-lg text-display-lg-mobile md:text-display-lg mb-1 md:mb-6">
                {testiPrenotazione.stepLocatie || 'Alege Locația'}
              </h2>
              <p className="hidden md:block font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
                Alege locația preferată pentru programarea ta.
              </p>
            </div>
          </div>
          {sediPubbliche.length === 0 ? (
            <div className="max-w-md mx-auto text-center py-8 md:py-16">
              <svg className="w-12 h-12 text-outline-variant mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/><line x1="4" y1="4" x2="20" y2="20"/></svg>
              <p className="font-body-md text-on-surface-variant">Nu există locații disponibile</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-gutter">
              {sediPubbliche.map((sede: any) => (
                <div
                  key={sede._id}
                  onClick={() => handleSelezionaSede(sede)}
                  className="location-card group cursor-pointer border border-outline-variant/50 transition-all duration-500 bg-surface-container-lowest hover:border-primary/60"
                >
                  {(sede.coordinate?.lat && sede.coordinate?.lng) ? (
                    <div className="aspect-[3/1] md:aspect-[16/9] overflow-hidden relative bg-surface-variant">
                      <iframe
                        src={`https://www.google.com/maps?q=${sede.coordinate.lat},${sede.coordinate.lng}&z=15&output=embed`}
                        className="w-full h-full pointer-events-none"
                        style={{ filter: 'grayscale(0.3) sepia(0.1)' }}
                        loading="lazy"
                        title={sede.nome}
                      />
                      {sede.eticheta && (
                        <div className="absolute top-4 right-4 bg-surface/90 px-3 py-1 text-[10px] font-label-caps uppercase tracking-widest text-primary border border-outline-variant">
                          {sede.eticheta}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="pt-2 md:pt-8 px-3 md:px-6">
                      {sede.eticheta && (
                        <span className="inline-block mb-2 md:mb-4 bg-surface-variant px-2 md:px-3 py-1 text-[10px] font-label-caps uppercase tracking-widest text-primary">
                          {sede.eticheta}
                        </span>
                      )}
                    </div>
                  )}
                  <div className={(sede.coordinate?.lat && sede.coordinate?.lng) ? 'px-3 md:px-6 pb-3 md:pb-6' : 'px-3 md:px-6 pb-2 md:pb-8'}>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-body-lg md:font-headline-sm text-body-lg md:text-headline-sm text-on-surface">{sede.nome}</h3>
                      {sede.eticheta && !(sede.coordinate?.lat && sede.coordinate?.lng) && (
                        <span className="md:hidden shrink-0 bg-surface-variant px-2 py-0.5 text-[10px] font-label-caps uppercase tracking-widest text-primary">
                          {sede.eticheta}
                        </span>
                      )}
                    </div>
                    {sede.descriere && (
                      <p className="hidden md:block font-body-md text-on-surface-variant mb-4">{sede.descriere}</p>
                    )}
                    <div className="flex items-center gap-1.5 md:gap-2 text-on-surface-variant mt-1 md:mt-2">
                      <svg className="w-3.5 h-3.5 md:w-[18px] md:h-[18px] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                      <span className="text-label-sm md:text-label-md font-label-sm md:font-label-md">
                        {sede.indirizzo}{sede.citta ? `, ${sede.citta}` : ''}
                      </span>
                    </div>
                    {sede.orar && (
                      <div className="flex items-center gap-1.5 md:gap-2 text-on-surface-variant mt-1">
                        <svg className="w-3.5 h-3.5 md:w-[18px] md:h-[18px] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        <span className="text-label-sm md:text-label-md font-label-sm md:font-label-md">{sede.orar}</span>
                      </div>
                    )}
                    <div className="hidden md:block mt-5 pt-4 border-t border-outline-variant/20">
                      <span className="text-[10px] font-label-caps uppercase tracking-widest text-primary/70 group-hover:text-primary transition-colors">
                        Selectează
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Next button disabled - user must select */}
          <div className="mt-3 md:mt-12 flex justify-center">
            <button
              disabled
              className="group flex items-center gap-4 bg-primary text-on-primary px-10 py-4 font-label-caps text-label-caps uppercase tracking-widest transition-all duration-300 hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Pasul următor
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>
          </div>
        </section>
      )}

      {/* STEP 2: SERVICE */}
      {step === 'servizio' && (
        <section id="step-servizio" className="scroll-mt-0 px-container-padding-mobile md:px-container-padding-desktop py-4 md:py-gutter bg-surface-bright">
          <div className="max-w-6xl mx-auto">
            <div className="mb-6 hidden md:block">
              <span className="font-label-caps text-[10px] tracking-[0.25em] uppercase text-on-surface-variant/50">
                PASUL 02 — {LABEL_STEP.servizio}
              </span>
            </div>

            <div className="flex justify-between items-start mb-4 md:mb-12">
              <div className="flex-1">
                <span className="hidden md:block font-label-caps text-label-caps text-primary uppercase tracking-[0.2em] mb-4">
                  {sedeSelezionata?.nome || 'Personalized Beauty'}
                </span>
                <h2 className=" font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface mb-4">
                  {testiPrenotazione.stepServizio}
                </h2>
                <p className="hidden md:block font-body-lg text-body-lg text-on-surface-variant max-w-xl">
                  Selectează experiența de înfrumusețare dorită pentru sesiunea ta personalizată.
                </p>
              </div>
              <button
                onClick={() => { setStep('locatie'); scrollToSection('step-locatie'); }}
                className="hidden md:flex items-center gap-2 font-label-caps text-label-caps text-on-surface-variant hover:text-primary transition-colors shrink-0 ml-8"
              >
                <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                Înapoi
              </button>
            </div>

            {/* Selected location badge */}
            {sedeSelezionata && (
              <div className="hidden md:flex items-center gap-2 mb-8 text-label-md font-label-md text-on-surface-variant">
                <svg className="w-[18px] h-[18px] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                <span>{sedeSelezionata.nome} · {sedeSelezionata.indirizzo}</span>
                <button
                  onClick={() => { setStep('locatie'); scrollToSection('step-locatie'); }}
                  className="text-primary underline ml-2"
                >
                  Schimbă
                </button>
              </div>
            )}

            {servizi.length === 0 ? (
              <div className="text-center py-16">
                <svg className="w-12 h-12 text-outline-variant mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22c3.314 0 6-2.686 6-6 0-3.314-2.686-6-6-6-3.314 0-6 2.686-6 6 0 3.314 2.686 6 6 6z"/><path d="M12 10V2"/><path d="M8 6h8"/></svg>
                <p className="font-body-md text-on-surface-variant">Nu există servicii disponibile</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-gutter">
                {servizi.map((servizio) => {
                  const isHighlighted = servizio.prezzo >= 500;
                  return (
                    <div
                      key={servizio._id}
                      onClick={() => handleSelezionaServizio(servizio)}
                      className={`group relative border p-4 md:p-8 flex flex-col justify-between transition-all duration-500 cursor-pointer ${
                        isHighlighted
                          ? 'bg-surface-container-high border-outline/20 hover:border-primary'
                          : 'bg-surface-container-low border-outline/20 hover:border-primary'
                      }`}
                    >
                      <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                      </div>
                      {isHighlighted && (
                        <div className="absolute top-0 right-0 p-4">
                          <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                        </div>
                      )}
                      <div>
                        <h3 className="font-headline-md text-headline-md text-on-surface mb-1 md:mb-2">{servizio.nome}</h3>
                        <p className="font-label-md text-label-md text-on-surface-variant flex items-center gap-1.5 mb-3 md:mb-4">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                          {servizio.durata} min
                        </p>
                        {servizio.descrizione && (
                          <DescrizioneConDetalii
                            descrizione={servizio.descrizione}
                            isAperta={descrizioniAperte.has(servizio._id)}
                            onToggle={() => toggleDescrizione(servizio._id)}
                          />
                        )}
                      </div>
                      <div className="flex justify-between items-center pt-4 md:pt-6 border-t border-outline/10">
                        <span className="font-label-md text-label-md font-bold text-on-surface">
                          {mostraPrezzi ? formattaPrezzo(servizio.prezzo) : ''}
                        </span>
                        <span className="font-label-caps text-label-caps text-primary border-b border-primary/40 group-hover:border-primary transition-all uppercase cursor-pointer">
                          Selectează
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {servizioSelezionato && (
              <div className="mt-12 flex justify-end">
                <button
                  onClick={async () => {
                    await caricaSpecialistiPerServizio(servizioSelezionato._id);
                    setStep('specialist');
                    scrollToSection('step-specialist');
                  }}
                  className="bg-inverse-surface text-inverse-on-surface px-12 py-3 font-label-caps text-label-caps uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-on-surface/5"
                >
                  Continuă
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* STEP 3: SPECIALIST */}
      {step === 'specialist' && servizioSelezionato && (
        <section id="step-specialist" className="scroll-mt-0 px-container-padding-mobile md:px-container-padding-desktop py-3 md:py-gutter bg-surface-bright">
          <div className="max-w-6xl mx-auto">
          <div className="mb-6 hidden md:block">
            <span className="font-label-caps text-[10px] tracking-[0.25em] uppercase text-on-surface-variant/50">
              PASUL 03 — {LABEL_STEP.specialist}
            </span>
          </div>
          <div className="flex justify-between items-start mb-1 md:mb-12">
            <div className="flex-1">
              <p className="hidden md:block font-label-caps text-label-caps text-primary mb-2 uppercase">Găsește expertul potrivit</p>
              <h2 className="font-display-lg text-display-lg-mobile md:text-display-lg mb-6">{testiPrenotazione.stepSpecialist}</h2>
              <p className="hidden md:block font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
                Fiecare specialist din echipa noastră aduce un amestec unic de rigoare tehnică și viziune artistică.
                Selectați persoana care rezonează cel mai bine cu aspirațiile dumneavoastră estetice.
              </p>
              {/* Selected service badge */}
              <div className="hidden md:flex items-center gap-2 mt-4 text-label-md font-label-md text-on-surface-variant">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22c3.314 0 6-2.686 6-6 0-3.314-2.686-6-6-6-3.314 0-6 2.686-6 6 0 3.314 2.686 6 6 6z"/><path d="M12 10V2"/><path d="M8 6h8"/></svg>
                <span>{servizioSelezionato.nome}</span>
              </div>
            </div>
            <button
              onClick={() => { setStep('servizio'); scrollToSection('step-servizio'); }}
              className="hidden md:flex items-center gap-2 font-label-caps text-label-caps text-on-surface-variant hover:text-primary transition-colors shrink-0 ml-8"
            >
              <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              Înapoi
            </button>
          </div>

          {caricamentoSpecialisti ? (
            <div className="text-center py-16">
              <Caricamento />
              <p className="font-body-md text-on-surface-variant mt-4">Se încarcă specialiștii...</p>
            </div>
          ) : specialists.length === 0 ? (
            <div className="text-center py-16">
              <svg className="w-14 h-14 text-outline-variant" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="7" r="4"/><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><line x1="3" y1="3" x2="21" y2="21"/></svg>
              <p className="font-body-md text-on-surface-variant">Nu există specialiști disponibili</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
                {specialists.map((specialist) => {
                  const specializare = specialist.servizi?.[0]?.nome;
                  return (
                  <div
                    key={specialist._id}
                    className="specialist-card group bg-surface-container-low border border-outline/20 p-3 md:p-6 flex flex-row gap-3 md:gap-5 items-start"
                  >
                    <div className="relative w-16 md:w-24 aspect-square shrink-0 overflow-hidden bg-surface-variant rounded-full md:rounded-none">
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-8 h-8 md:w-12 md:h-12 text-outline-variant" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="7" r="4"/><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/></svg>
                      </div>
                      <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-label-caps text-[10px] md:text-label-caps text-primary bg-primary-container/30 px-2 md:px-3 py-0.5 md:py-1 rounded-full">Specialist</span>
                      <h4 className="font-headline-sm text-[16px] md:text-headline-sm mt-1 md:mt-2 leading-tight">
                        {specialist.nome} {specialist.cognome}
                      </h4>
                      {specializare && (
                        <p className="font-label-md text-[13px] md:text-label-md text-on-surface-variant mt-0.5 md:mt-1">
                          {specializare}
                        </p>
                      )}
                      {specialist.biografia && (
                        <p className="font-body-md text-[13px] md:text-body-md text-on-surface-variant/70 mt-1 md:mt-2 line-clamp-2 leading-relaxed">
                          {specialist.biografia}
                        </p>
                      )}
                      {specialist.giorniSede && specialist.giorniSede.length > 0 && (
                        <p className="font-body-md text-[11px] text-on-surface-variant/50 mt-1">
                          {specialist.giorniSede.join(', ')}
                        </p>
                      )}
                      <button
                        onClick={() => handleSelectSpecialist(specialist)}
                        className="w-full md:w-auto bg-[#6b5c4a] text-white px-4 md:px-6 py-1.5 md:py-2.5 font-label-caps text-[10px] md:text-label-caps hover:bg-[#333028] transition-colors mt-2 md:mt-3"
                      >
                        Selectează
                      </button>
                    </div>
                  </div>
                  );
                })}
              </div>

              {/* All specialists option */}
              {/* <div className="mt-gutter specialist-card bg-surface-container-high border-dashed border-2 border-outline/30 p-8 flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-6">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-full border border-primary flex items-center justify-center">
                    <svg className="w-10 h-10 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l1.09 4.23L17 4l-2.09 3.91L19 10l-4.09 1.09L17 15l-3.91-2.09L12 17l-1.09-4.23L7 15l2.09-3.91L5 10l4.09-1.09L7 5l3.91 2.09L12 2z"/></svg>
                  </div>
                  <div>
                    <h5 className="font-headline-sm text-[20px]">Oricare Specialist Disponibil</h5>
                    <p className="font-body-md text-body-md text-on-surface-variant">
                      Vom găsi cel mai bun slot orar pentru tine cu primul artist disponibil.
                    </p>
                  </div>
                </div>
                {specialists.length > 0 && (
                  <button
                    onClick={() => handleSelectSpecialist(specialists[0])}
                    className="bg-secondary text-on-secondary px-8 py-3 font-label-caps text-label-caps hover:bg-primary transition-colors"
                  >
                    Sunt Flexibil(ă)
                  </button>
                )}
              </div> */}
            </>
          )}

          <div className="pb-gutter"></div>
          </div>
        </section>
      )}

      {/* STEP 4: DATE */}
      {step === 'data' && servizioSelezionato && (
        <section id="step-data" className="scroll-mt-0 px-container-padding-mobile md:px-container-padding-desktop py-3 md:py-gutter bg-surface-bright">
          <div className="max-w-6xl mx-auto">

          <div className="mb-6 hidden md:block">
            <span className="font-label-caps text-[10px] tracking-[0.25em] uppercase text-on-surface-variant/50">
              PASUL 04 — {LABEL_STEP.data}
            </span>
          </div>
          <div className="flex justify-between items-start mb-1 md:mb-section-gap/2">
            <header className="max-w-2xl">
              <h2 className="font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface mb-base">
                {testiPrenotazione.stepData}
              </h2>
              <p className="hidden md:block font-body-lg text-body-lg text-on-surface-variant">
                Alege momentul perfect pentru ritualul tău. Te rugăm să selectezi o zi disponibilă din calendar.
              </p>
            </header>
            <button
              onClick={() => { setStep('specialist'); scrollToSection('step-specialist'); }}
              className="hidden md:flex items-center gap-2 font-label-caps text-label-caps text-on-surface-variant hover:text-primary transition-colors shrink-0 ml-8"
            >
              <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              Înapoi
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
            {/* Calendar Column */}
            <div className="lg:col-span-7 bg-surface-container-low p-base md:p-gutter">
              <div className="flex items-center justify-between mb-gutter">
                <h3 className="font-headline-sm text-headline-sm text-primary">
                  {nomiMesi[mese]} {anno}
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => { if (mese === 0) { setMese(11); setAnno(anno - 1); } else { setMese(mese - 1); } }}
                    className="p-2 hover:bg-surface-variant rounded-full transition-colors"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
                  </button>
                  <button
                    onClick={() => { if (mese === 11) { setMese(0); setAnno(anno + 1); } else { setMese(mese + 1); } }}
                    className="p-2 hover:bg-surface-variant rounded-full transition-colors"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                  </button>
                </div>
              </div>

              <CalendarioPrenotazione
                mese={mese}
                anno={anno}
                onSelezionaData={handleSelezionaData}
                isDisponibile={isDisponibile}
                nomiMesi={nomiMesi}
              />

              {/* <div className="flex items-center gap-4 mt-gutter border-t border-outline/10 pt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary"></div>
                  <span className="font-label-md text-label-md text-on-surface-variant">Selectat</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-surface-container-highest"></div>
                  <span className="font-label-md text-label-md text-on-surface-variant">Disponibil</span>
                </div>
              </div> */}
            </div>

            {/* Desktop Summary */}
            <div className="hidden lg:block lg:col-span-5">
              <div className="bg-surface p-base md:p-gutter border border-outline/20 sticky top-4">
                <h4 className="font-headline-sm text-headline-sm mb-gutter">Rezumat</h4>
                <div className="space-y-4">
                  <div>
                    <p className="font-label-md text-label-md text-on-surface-variant">Specialist</p>
                    <p className="font-body-md text-body-md font-bold">{selectedSpecialist?.nome} {selectedSpecialist?.cognome}</p>
                  </div>
                  <div>
                    <p className="font-label-md text-label-md text-on-surface-variant">Serviciu</p>
                    <p className="font-body-md text-body-md font-bold">{servizioSelezionato.nome}</p>
                  </div>
                  {sedeSelezionata && (
                    <div>
                      <p className="font-label-md text-label-md text-on-surface-variant">Locație</p>
                      <p className="font-body-md text-body-md font-bold">{sedeSelezionata.nome}</p>
                    </div>
                  )}
                  <div className="flex justify-between pt-4 border-t border-outline/10">
                    <span className="font-label-md text-label-md text-on-surface-variant">Durată</span>
                    <span className="font-body-md text-body-md font-bold">{servizioSelezionato.durata} min</span>
                  </div>
                  {mostraPrezzi && (
                    <div className="flex justify-between">
                      <span className="font-label-md text-label-md text-on-surface-variant">Preț</span>
                      <span className="font-headline-sm text-headline-sm">{formattaPrezzo(servizioSelezionato.prezzo)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="pb-gutter"></div>
          </div>
        </section>
      )}

      {/* STEP 4b: TIME */}
      {step === 'ora' && dataSelezionata && (
        <section id="step-ora" className="scroll-mt-0 px-container-padding-mobile md:px-container-padding-desktop py-3 md:py-gutter bg-surface-bright">
          <div className="max-w-6xl mx-auto">
          <div className="mb-6 hidden md:block">
            <span className="font-label-caps text-[10px] tracking-[0.25em] uppercase text-on-surface-variant/50">
              PASUL 05 — {LABEL_STEP.ora}
            </span>
          </div>
          <div className="flex justify-between items-start mb-1 md:mb-section-gap/2">
            <header className="max-w-2xl">
              <h2 className="font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface mb-base">
                {testiPrenotazione.stepOrario}
              </h2>
              <p className="hidden md:block font-body-lg text-body-lg text-on-surface-variant">
                Alege momentul perfect pentru ritualul tău de înfrumusețare.
              </p>
            </header>
            <button
              onClick={() => { setStep('data'); scrollToSection('step-data'); }}
              className="hidden md:flex items-center gap-2 font-label-caps text-label-caps text-on-surface-variant hover:text-primary transition-colors shrink-0 ml-8"
            >
              <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              Înapoi
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
            <div className="lg:col-span-7">
              {/* Date badge */}
              <div className="bg-surface-container-low p-gutter mb-gutter">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  <span className="font-body-md text-body-md">
                    {dataSelezionata.toLocaleDateString('ro-RO', {
                      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                    })}
                  </span>
                  <button
                    onClick={() => { setStep('data'); scrollToSection('step-data'); }}
                    className="font-label-caps text-label-caps text-primary underline ml-auto"
                  >
                    Schimbă
                  </button>
                </div>
              </div>

              {/* Location info */}
              {/* {sedeSelezionata && (
                <div className="bg-surface-container-low p-gutter mb-gutter">
                  <div className="flex items-center gap-3">
<svg className="w-[18px] h-[18px] text-primary shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    <span className="font-body-md text-body-md">{sedeSelezionata.nome} · {sedeSelezionata.indirizzo}</span>
                  </div>
                </div>
              )} */}

              {/* Station selection */}
              {sedeSelezionata?.postazioni?.length > 0 && (
                <div className="mb-gutter">
                  <h3 className="font-label-caps text-label-caps text-primary mb-3">POSTAȚIE</h3>
                  <div className="flex flex-wrap gap-3">
                    {sedeSelezionata.postazioni
                      .filter((p: any) => p.attivo !== false)
                      .map((p: any) => (
                        <button
                          key={p.nome}
                          onClick={() => !p.occupato && setPostazioneSelezionata(p.nome)}
                          disabled={p.occupato}
                          className={`px-4 py-3 font-label-md text-label-md transition-all ${
                            postazioneSelezionata === p.nome
                              ? 'bg-primary text-on-primary'
                              : p.occupato
                              ? 'bg-surface-container-highest text-on-surface-variant/30 cursor-not-allowed line-through'
                              : 'bg-surface-container-low border border-outline/20 hover:border-primary text-on-surface'
                          }`}
                        >
                          {p.nome}
                        </button>
                      ))}
                  </div>
                </div>
              )}

              {/* Time slots */}
              {caricamentoSlot ? (
                <div className="text-center py-12">
                  <Caricamento />
                  <p className="font-body-md text-on-surface-variant mt-4">Se încarcă orele...</p>
                </div>
              ) : slotOrari.length > 0 ? (
                <div>
                  {(sediDisponibili.length > 0 || (sedeSelezionata && sedeSelezionata.postazioni?.length > 0)) && (
                    <div className="border-t border-outline/10 my-gutter"></div>
                  )}
                  <h3 className="font-label-caps text-label-caps text-primary mb-3">ORĂ</h3>
                  <div className="space-y-gutter">
                    {/* Group by time of day */}
                    {(() => {
                      const morning = slotOrari.filter(s => parseInt(s.ora) < 12);
                      const afternoon = slotOrari.filter(s => parseInt(s.ora) >= 12 && parseInt(s.ora) < 17);
                      const evening = slotOrari.filter(s => parseInt(s.ora) >= 17);
                      const groups: [string, SlotOrario[]][] = [];
                      if (morning.length) groups.push(['Dimineață', morning]);
                      if (afternoon.length) groups.push(['După-amiază', afternoon]);
                      if (evening.length) groups.push(['Seară', evening]);
                      return groups.map(([label, slots]) => (
                        <div key={label}>
                          <span className="font-label-md text-label-md text-on-surface-variant opacity-60 mb-2 block">{label}</span>
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                            {slots.map((slot) => (
                              <button
                                key={slot.ora}
                                onClick={() => slot.disponibile && handleSelezionaOra(slot.ora)}
                                disabled={!slot.disponibile}
                                className={`py-3 font-label-md text-label-md transition-all ${
                                  slot.disponibile
                                    ? 'bg-surface-container-low border border-outline/20 hover:border-primary text-on-surface cursor-pointer'
                                    : 'bg-surface-container-highest text-on-surface-variant/30 cursor-not-allowed'
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
                </div>
              ) : (
                <div className="text-center py-12 bg-surface-container-low">
                  <svg className="w-[18px] h-[18px] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  <p className="font-body-md text-body-md text-on-surface-variant mb-4">Nu există ore disponibile</p>
                  <button
                    onClick={() => { setStep('data'); scrollToSection('step-data'); }}
                    className="px-6 py-3 bg-primary text-on-primary font-label-caps text-label-caps"
                  >
                    Alege altă dată
                  </button>
                </div>
              )}
            </div>

            {/* Desktop Summary */}
            <div className="hidden lg:block lg:col-span-5">
              <div className="bg-surface p-base md:p-gutter border border-outline/20 sticky top-4">
                <h4 className="font-headline-sm text-headline-sm mb-gutter">Rezumat</h4>
                <div className="space-y-4">
                  <div>
                    <p className="font-label-md text-label-md text-on-surface-variant">Specialist</p>
                    <p className="font-body-md text-body-md font-bold">{selectedSpecialist?.nome} {selectedSpecialist?.cognome}</p>
                  </div>
                  <div>
                    <p className="font-label-md text-label-md text-on-surface-variant">Serviciu</p>
                    <p className="font-body-md text-body-md font-bold">{servizioSelezionato?.nome}</p>
                  </div>
                  <div>
                    <p className="font-label-md text-label-md text-on-surface-variant">Data</p>
                    <p className="font-body-md text-body-md font-bold">
                      {dataSelezionata.toLocaleDateString('ro-RO')}
                    </p>
                  </div>
                  {sedeSelezionata && (
                    <div>
                      <p className="font-label-md text-label-md text-on-surface-variant">Locație</p>
                      <p className="font-body-md text-body-md font-bold">{sedeSelezionata.nome}</p>
                      {postazioneSelezionata && (
                        <p className="font-label-md text-label-md text-on-surface-variant mt-1">Postație: {postazioneSelezionata}</p>
                      )}
                    </div>
                  )}
                  {mostraPrezzi && (
                    <div className="flex justify-between pt-4 border-t border-outline/10">
                      <span className="font-label-md text-label-md text-on-surface-variant">Total</span>
                      <span className="font-headline-sm text-headline-sm">{formattaPrezzo(servizioSelezionato?.prezzo || 0)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="pb-gutter"></div>
          </div>
        </section>
      )}

      {/* STEP 5: CONFIRM */}
      {step === 'conferma' && (
        <section id="step-conferma" className="scroll-mt-0 px-container-padding-mobile md:px-container-padding-desktop py-3 md:py-gutter bg-surface-bright">
          <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-start mb-1 md:mb-12">
              <div className="flex-1">
                <h1 className="hidden md:block font-display-lg text-display-lg mb-4 text-on-surface">
                  {testiPrenotazione.stepConferma || 'Finalizare Programare'}
                </h1>
                <p className="hidden md:block font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
                  Te rugăm să verifici detaliile de mai jos și să completezi informațiile de contact pentru a confirma locul tău în atelierul nostru.
                </p>
              </div>
              <button
                onClick={() => { setStep('ora'); scrollToSection('step-ora'); }}
                className="hidden md:flex items-center gap-2 font-label-caps text-label-caps text-on-surface-variant hover:text-primary transition-colors shrink-0 ml-8"
              >
                <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                Înapoi
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter items-start">
              {/* Booking Summary Card */}
              <div className="md:col-span-5 flex flex-col gap-gutter">
                <div className="bg-surface-container-low p-3 md:p-5 border border-outline/10">
                  <h3 className="font-label-caps text-[11px] md:text-label-caps mb-2 md:mb-4 text-primary">Rezumat Rezervare</h3>
                  <ul className="flex flex-col gap-2 md:gap-4">
                    <li className="flex items-start gap-3">
                      <svg className="w-4 h-4 md:w-5 md:h-5 text-primary mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                      <div>
                        <p className="font-label-caps text-[9px] md:text-[10px] text-on-surface-variant opacity-60">LOCAȚIE</p>
                        <p className="font-body-md text-[13px] md:text-body-md font-medium">{sedeSelezionata?.nume || sedeSelezionata?.nome || '—'}{sedeSelezionata?.indirizzo ? `, ${sedeSelezionata.indirizzo}` : ''}</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg className="w-4 h-4 md:w-5 md:h-5 text-primary mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                      <div>
                        <p className="font-label-caps text-[9px] md:text-[10px] text-on-surface-variant opacity-60">SERVICIU</p>
                        <p className="font-body-md text-[13px] md:text-body-md font-medium">{servizioSelezionato?.nome || '—'}</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg className="w-4 h-4 md:w-5 md:h-5 text-primary mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                      <div>
                        <p className="font-label-caps text-[9px] md:text-[10px] text-on-surface-variant opacity-60">SPECIALIST</p>
                        <p className="font-body-md text-[13px] md:text-body-md font-medium">{selectedSpecialist?.nome} {selectedSpecialist?.cognome}</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg className="w-4 h-4 md:w-5 md:h-5 text-primary mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                      <div>
                        <p className="font-label-caps text-[9px] md:text-[10px] text-on-surface-variant opacity-60">DATA ȘI ORA</p>
                        <p className="font-body-md text-[13px] md:text-body-md font-medium">
                          {dataSelezionata?.toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' })} la ora {oraSelezionata}
                        </p>
                      </div>
                    </li>
                  </ul>
                  {mostraPrezzi && (
                    <div className="mt-3 md:mt-5 pt-3 md:pt-5 border-t border-outline/20 flex justify-between items-end">
                      <div>
                        <p className="font-label-caps text-[9px] md:text-[10px] text-on-surface-variant opacity-60">TOTAL DE PLATĂ</p>
                        <p className="font-headline-sm text-[16px] md:text-headline-sm text-primary">
                          {voucherData && voucherData.type === 'free' ? 'GRATUIT' : formattaPrezzo(servizioSelezionato?.prezzo || 0)}
                        </p>
                      </div>
                      <div className="text-[9px] md:text-[10px] text-on-surface-variant font-label-caps opacity-50">TVA INCLUS</div>
                    </div>
                  )}
                </div>


              </div>

              {/* Contact Form */}
              <div className="md:col-span-7">
                <div className="flex flex-col gap-5 md:gap-10">
                  <div>
                    <h3 className="font-headline-sm text-[16px] md:text-headline-sm mb-2 md:mb-4">Date Contact</h3>
                  </div>

                  <div className="flex flex-col gap-4 md:gap-7">
                    {/* Name Input */}
                    <div className="group">
                      <label className="font-label-caps text-label-caps text-on-surface-variant mb-1 md:mb-2 block group-focus-within:text-primary transition-colors" htmlFor="booking-name">
                        Nume Complet <span className="text-error">*</span>
                      </label>
                      <input
                        id="booking-name"
                        type="text"
                        value={nomeCompleto}
                        onChange={(e) => setNomeCompleto(e.target.value)}
                        placeholder="Ex: Maria Ionescu"
                        className="w-full bg-transparent border-t-0 border-x-0 border-b border-outline-variant focus:border-primary px-0 py-2 md:py-3 text-body-md md:text-body-lg font-body-md md:font-body-lg placeholder:text-outline/40 transition-all outline-none"
                        required
                      />
                    </div>

                    {/* Phone Input */}
                    <div className="group">
                      <label className="font-label-caps text-label-caps text-on-surface-variant mb-1 md:mb-2 block group-focus-within:text-primary transition-colors" htmlFor="booking-phone">
                        Număr de Telefon <span className="text-error">*</span>
                      </label>
                      <div className="flex gap-2">
                        <select
                          value={prefissoTelefono}
                          onChange={(e) => setPrefissoTelefono(e.target.value)}
                          className="shrink-0 bg-transparent border-b border-outline-variant focus:border-primary px-1 py-2 md:py-3 text-body-md md:text-body-lg font-body-md md:font-body-lg outline-none transition-all"
                        >
                          <option value="+39">🇮🇹 +39</option>
                          <option value="+40">🇷🇴 +40</option>
                          <option value="+373">🇲🇩 +373</option>
                          <option value="+1">🇺🇸 +1</option>
                          <option value="+44">🇬🇧 +44</option>
                          <option value="+33">🇫🇷 +33</option>
                          <option value="+34">🇪🇸 +34</option>
                          <option value="+49">🇩🇪 +49</option>
                          <option value="+43">🇦🇹 +43</option>
                          <option value="+41">🇨🇭 +41</option>
                          <option value="+48">🇵🇱 +48</option>
                          <option value="+7">🇷🇺 +7</option>
                        </select>
                        <input
                          id="booking-phone"
                          type="tel"
                          value={telefonoCliente}
                          onChange={(e) => setTelefonoCliente(e.target.value)}
                          placeholder="7xx xxx xxx"
                          className="flex-1 bg-transparent border-t-0 border-x-0 border-b border-outline-variant focus:border-primary px-0 py-2 md:py-3 text-body-md md:text-body-lg font-body-md md:font-body-lg placeholder:text-outline/40 transition-all outline-none"
                          required
                        />
                      </div>
                    </div>

                    {/* Email Input */}
                    <div className="group">
                      <label className="font-label-caps text-label-caps text-on-surface-variant mb-1 md:mb-2 block group-focus-within:text-primary transition-colors" htmlFor="booking-email">
                        Adresă de Email <span className="text-error">*</span>
                      </label>
                      <input
                        id="booking-email"
                        type="email"
                        value={emailCliente}
                        onChange={(e) => setEmailCliente(e.target.value)}
                        placeholder="nume@exemplu.ro"
                        className="w-full bg-transparent border-t-0 border-x-0 border-b border-outline-variant focus:border-primary px-0 py-2 md:py-3 text-body-md md:text-body-lg font-body-md md:font-body-lg placeholder:text-outline/40 transition-all outline-none"
                        required
                      />
                    </div>

                    {/* Message Optional */}
                    <div className="group">
                      <label className="font-label-caps text-label-caps text-on-surface-variant mb-1 md:mb-2 block group-focus-within:text-primary transition-colors" htmlFor="booking-notes">
                        Note adiționale (Opțional)
                      </label>
                      <textarea
                        id="booking-notes"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Mențiuni speciale pentru specialist..."
                        className="w-full bg-transparent border-t-0 border-x-0 border-b border-outline-variant focus:border-primary px-0 py-2 md:py-3 text-body-md font-body-md placeholder:text-outline/40 transition-all resize-none outline-none"
                        rows={1}
                      />
                    </div>
                  </div>

                  {/* Voucher */}
                  <div>
                    <h3 className="font-headline-sm text-headline-sm mb-2 md:mb-4">Cod Voucher</h3>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={voucherCode}
                        onChange={(e) => { setVoucherCode(e.target.value.toUpperCase()); setVoucherData(null); setVoucherError(''); }}
                        placeholder="Introdu codul voucherului"
                        className="flex-1 bg-transparent border-b border-outline-variant focus:border-primary px-0 py-2 md:py-3 text-body-md font-body-md placeholder:text-outline/40 transition-all outline-none"
                      />
                      <button
                        onClick={valideazaVoucher}
                        className="px-5 md:px-6 py-2 md:py-3 bg-primary text-on-primary font-label-caps text-[11px] md:text-label-caps hover:opacity-90 transition-all"
                      >
                        Aplică
                      </button>
                    </div>
                    {voucherError && <p className="text-error font-label-md text-label-md mt-1 md:mt-2">{voucherError}</p>}
                    {voucherData && (
                      <p className="text-primary font-label-md text-label-md mt-1 md:mt-2">
                        Voucher aplicat: {voucherData.type === 'percentage' ? `${voucherData.value}% reducere` : voucherData.type === 'fixed' ? `€${voucherData.value} reducere` : 'GRATUIT'}
                      </p>
                    )}
                  </div>

                  {/* Submit */}
                  <div className="flex flex-col gap-2 md:gap-4 mt-2 md:mt-4">
                    <label className="flex items-start gap-2 md:gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        className="mt-1 border-outline text-primary focus:ring-primary rounded-sm transition-all"
                        required
                      />
                      <span className="font-label-md text-[12px] md:text-label-md text-on-surface-variant group-hover:text-on-surface">
                        Accept <a className="underline" href="#">Termenii și Condițiile</a> și Politica de Confidențialitate a salonului.
                      </span>
                    </label>
                    <button
                      onClick={handleConferma}
                      disabled={caricamento || !nomeCompleto.trim() || !telefonoCliente.trim() || !emailCliente.trim()}
                      className="w-full bg-[#6b5c4a] text-white py-4 md:py-6 font-label-caps text-label-caps tracking-[0.2em] hover:bg-[#333028] transition-all duration-500 quiet-luxury-shadow active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {caricamento ? 'PROGRAMARE...' : 'Confirmă Programarea'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* <div className="mt-16">
              <FeaturedReviewsBlock limit={2} />
            </div> */}
          </div>
        </section>
      )}

      {/* Atmospheric decorative elements */}
      <div className="fixed bottom-0 left-0 w-64 h-64 opacity-5 pointer-events-none hidden lg:block">
        <div className="w-full h-full bg-gradient-to-tr from-primary/30 to-transparent blur-3xl"></div>
      </div>
    </div>
  );
}

// ============================================================================
// CALENDAR COMPONENT
// ============================================================================
function CalendarioPrenotazione({ mese, anno, onSelezionaData, isDisponibile, nomiMesi }: any) {
  const giorniSettimana = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  const oggi = new Date();
  oggi.setHours(0, 0, 0, 0);

  const generaCalendario = () => {
    const primoGiorno = new Date(anno, mese, 1);
    const ultimoGiorno = new Date(anno, mese + 1, 0);
    const giorni: (Date | null)[] = [];

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

  return (
    <>
      {/* Day headers */}
      <div className="grid grid-cols-7 mb-2">
        {giorniSettimana.map((giorno) => (
          <div key={giorno} className="text-center font-label-caps text-label-caps text-on-surface-variant pb-4">
            {giorno}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7">
        {giorni.map((data, index) => {
          if (!data) {
            return <div key={`empty-${index}`} className="text-center py-4" />;
          }

          const risultato = isDisponibile(data);
          const disponibile = risultato.disponibile;
          const isToday = data.getTime() === oggi.getTime();
          const isSelected = false; // We track selected differently

          return (
            <button
              key={index}
              onClick={() => disponibile && onSelezionaData(data)}
              disabled={!disponibile}
              className={`text-center py-4 font-body-md text-body-md transition-all ${
                isToday ? 'ring-1 ring-primary' : ''
              } ${
                disponibile
                  ? 'text-on-surface-variant cursor-pointer hover:bg-surface-variant'
                  : 'text-on-surface-variant/30 cursor-not-allowed'
              }`}
            >
              {data.getDate()}
            </button>
          );
        })}
      </div>
    </>
  );
}

function DescrizioneConDetalii({ descrizione, isAperta, onToggle }: { descrizione: string; isAperta: boolean; onToggle: () => void }) {
  const [haOverflow, setHaOverflow] = useState(false);
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (el) {
      setHaOverflow(el.scrollHeight > el.clientHeight);
    }
  }, [descrizione]);

  return (
    <div className="mb-6">
      <p
        ref={ref}
        className={`font-body-md text-body-md text-on-surface-variant ${isAperta ? '' : 'line-clamp-2'}`}
      >
        {descrizione}
      </p>
      {(haOverflow || isAperta) && (
        <button
          onClick={(e) => { e.stopPropagation(); onToggle(); }}
          className="mt-1 font-label-caps text-label-caps text-primary hover:opacity-80 transition-opacity uppercase tracking-wider"
        >
          {isAperta ? 'Mai puțin' : 'Detalii'}
        </button>
      )}
    </div>
  );
}
