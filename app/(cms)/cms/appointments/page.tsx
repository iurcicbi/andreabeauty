/**
 * ============================================================================
 * PAGINA CMS: GESTIONE APPUNTAMENTI COMPLETA
 * ============================================================================
 * 
 * FUNZIONALITÀ:
 * - Lista appuntamenti con filtri
 * - Ricerca per nome cliente o telefono
 * - Filtro per stato
 * - Filtro per data
 * - Azioni rapide (conferma, completa, modifica)
 * - Navigazione a pagina modifica con ID
 * ============================================================================
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import webservice from '@/utils/webservice';
import Card from '@/componenti/interfaccia/Card';
import Bottone from '@/componenti/interfaccia/Bottone';
import Input from '@/componenti/interfaccia/Input';
import Caricamento from '@/componenti/comuni/Caricamento';
import Messaggio from '@/componenti/comuni/Messaggio';
import { formattaPrezzo } from '@/utils/helpers';
import FiltriAppuntamenti from '@/componenti/cms/FiltriAppuntamenti';
import { 
  Plus, 
  Calendar, 
  Scissors, 
  User, 
  Phone, 
  Mail, 
  Clock, 
  Edit3, 
  CheckCircle, 
  FileText,
  MapPin 
} from 'lucide-react';

interface Appuntamento {
  _id: string;
  utente: { nome: string; cognome: string; telefono: string; email?: string; };
  specialista: { utente: { nome: string; cognome: string; } };
  servizio: { nome: string; durata: number; prezzo: number; };
  data: string;
  oraInizio: string;
  oraFine: string;
  stato: string;
  note?: string;
  voucherCode?: string;
  voucher?: { type: string; value: number };
  prezzoFinale?: number;
  sede?: { nome: string; citta: string; };
  postazione?: string;
}

export default function AppuntamentiPage() {
  const router = useRouter();
  const [appuntamenti, setAppuntamenti] = useState<Appuntamento[]>([]);
  const [appuntamentiFiltrati, setAppuntamentiFiltrati] = useState<Appuntamento[]>([]);
  
  // Filtri
  const [ricerca, setRicerca] = useState('');
  const [filtroStato, setFiltroStato] = useState('tutti');
  const [dataInizio, setDataInizio] = useState('');
  const [dataFine, setDataFine] = useState('');
  
  const [caricamento, setCaricamento] = useState(true);
  const [errore, setErrore] = useState('');
  const [successo, setSuccesso] = useState('');

  useEffect(() => {
    caricaAppuntamenti();
  }, []);

  useEffect(() => {
    applicaFiltri();
  }, [appuntamenti, ricerca, filtroStato, dataInizio, dataFine]);

  const caricaAppuntamenti = async () => {
    try {
      setCaricamento(true);
      const risposta = await webservice.get('/api/appointments');
      setAppuntamenti(risposta.dati);
    } catch (err) {
      setErrore('Eroare la încărcarea programărilor');
    } finally {
      setCaricamento(false);
    }
  };

  const applicaFiltri = () => {
    let risultato = [...appuntamenti];

    // Filtro ricerca (nome, cognome, telefono)
    if (ricerca) {
      const ricercaLower = ricerca.toLowerCase();
      risultato = risultato.filter(app => 
        app.utente.nome.toLowerCase().includes(ricercaLower) ||
        app.utente.cognome.toLowerCase().includes(ricercaLower) ||
        app.utente.telefono.includes(ricerca)
      );
    }

    // Filtro stato
    if (filtroStato !== 'tutti') {
      risultato = risultato.filter(app => app.stato === filtroStato);
    }

    // Filtro range di date
    if (dataInizio || dataFine) {
      risultato = risultato.filter(app => {
        const dataApp = app.data.split('T')[0];
        
        // Se solo data inizio è impostata
        if (dataInizio && !dataFine) {
          return dataApp >= dataInizio;
        }
        
        // Se solo data fine è impostata
        if (!dataInizio && dataFine) {
          return dataApp <= dataFine;
        }
        
        // Se entrambe le date sono impostate
        if (dataInizio && dataFine) {
          return dataApp >= dataInizio && dataApp <= dataFine;
        }
        
        return true;
      });
    }

    setAppuntamentiFiltrati(risultato);
  };

  const cambiaStato = async (id: string, nuovoStato: string) => {
    try {
      await webservice.patch(`/api/appointments/${id}`, { stato: nuovoStato });
      setSuccesso('Stare actualizată');
      caricaAppuntamenti();
      setTimeout(() => setSuccesso(''), 3000);
    } catch (err) {
      setErrore('Eroare la actualizarea stării');
    }
  };

  const getStatoColore = (stato: string) => {
    switch (stato) {
      case 'confermato':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'in_attesa':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'completato':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'cancellato':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatoLabel = (stato: string) => {
    switch (stato) {
      case 'in_attesa': return 'În așteptare';
      case 'confermato': return 'Confirmată';
      case 'completato': return 'Completată';
      case 'cancellato': return 'Anulată';
      default: return stato;
    }
  };

  if (caricamento) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Caricamento />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-2 md:px-4 py-4 md:py-8">
      {/* Header - Mobile Optimized */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 md:gap-4 mb-4 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-4xl font-bold mb-1 md:mb-2">Gestionare Programări</h1>
          <div className="text-sm md:text-base text-gray-600">
            <p>
              {appuntamentiFiltrati.length} din {appuntamenti.length} programări
              {(dataInizio || dataFine) && (
                <span className="ml-2">
                  {dataInizio && dataFine && dataInizio === dataFine 
                    ? `• ${new Date(dataInizio).toLocaleDateString('it-IT')}`
                    : dataInizio && dataFine
                    ? `• ${new Date(dataInizio).toLocaleDateString('it-IT')} - ${new Date(dataFine).toLocaleDateString('it-IT')}`
                    : dataInizio
                    ? `• dal ${new Date(dataInizio).toLocaleDateString('it-IT')}`
                    : `• fino al ${new Date(dataFine).toLocaleDateString('it-IT')}`
                  }
                </span>
              )}
            </p>
            {!dataInizio && !dataFine && (
              <p className="text-xs text-green-600 mt-1">
                Sugestie: Folosește filtrele de dată pentru a vedea programări specifice
              </p>
            )}
          </div>
        </div>
        <Bottone onClick={() => router.push('/cms/appointments/new')} dimensione="small" className="w-full sm:w-auto flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" />
          Nouă
        </Bottone>
      </div>

      {errore && <Messaggio tipo="errore" messaggio={errore} onChiudi={() => setErrore('')} />}
      {successo && <Messaggio tipo="successo" messaggio={successo} onChiudi={() => setSuccesso('')} />}

      {/* Filtri - Mobile Optimized */}
      <FiltriAppuntamenti
        ricerca={ricerca}
        setRicerca={setRicerca}
        filtroStato={filtroStato}
        setFiltroStato={setFiltroStato}
        dataInizio={dataInizio}
        setDataInizio={setDataInizio}
        dataFine={dataFine}
        setDataFine={setDataFine}
        onReset={() => {
          setRicerca('');
          setFiltroStato('tutti');
          setDataInizio('');
          setDataFine('');
        }}
        onSearch={applicaFiltri}
      />

      {/* Lista Appuntamenti - Mobile Optimized */}
      {appuntamentiFiltrati.length === 0 ? (
        <Card>
          <div className="text-center py-8 md:py-12">
            <Calendar className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-lg md:text-xl text-gray-600 mb-2">
              {appuntamenti.length === 0 
                ? 'Nu există programări' 
                : 'Nici un rezultat pentru filtrele selectate'}
            </p>
            {appuntamenti.length === 0 && (
              <Bottone 
onClick={() => router.push('/cms/appointments/new')}
                className="mt-4"
                dimensione="small"
              >
                Creează prima programare
              </Bottone>
            )}
          </div>
        </Card>
      ) : (
        <div className="space-y-3 md:space-y-4">
          {appuntamentiFiltrati.map((app) => (
            <Card key={app._id} className="hover:shadow-lg transition-shadow p-3 md:p-4">
              {/* Mobile */}
              <div className="flex flex-col md:hidden gap-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-primary-600">{app.oraInizio}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(app.data).toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border ${getStatoColore(app.stato)}`}>
                    {getStatoLabel(app.stato)}
                  </span>
                </div>
                <div className="text-xs space-y-0.5">
                  <div className="flex justify-between"><span className="text-gray-400">Client</span><span className="font-medium">{app.utente.nome} {app.utente.cognome}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Specialist</span><span className="font-medium">{app.specialista?.utente?.nome} {app.specialista?.utente?.cognome}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Serviciu</span><span className="font-medium">{app.servizio?.nome || '—'} · {formattaPrezzo(app.servizio?.prezzo || 0)}{app.prezzoFinale !== undefined && <span className="text-green-600 font-bold ml-1">→ {formattaPrezzo(app.prezzoFinale)}</span>}</span></div>
                  {app.sede && <div className="flex justify-between"><span className="text-gray-400">Locație</span><span className="font-medium">{app.sede.nome}{app.postazione ? ` · ${app.postazione}` : ''}</span></div>}
                  {app.voucherCode && <div className="flex justify-between"><span className="text-gray-400">🎟 Voucher</span><span className="text-green-700 font-medium">{app.voucherCode}</span></div>}
                </div>
                {app.note && <p className="text-xs text-gray-400">📝 {app.note}</p>}
                <div className="flex gap-1.5">
                  <Bottone onClick={() => router.push(`/cms/appointments/${app._id}`)} dimensione="small" className="flex-1 text-xs py-1"><Edit3 className="w-3 h-3 inline" /> Editare</Bottone>
                  {app.stato === 'in_attesa' && <Bottone onClick={() => cambiaStato(app._id, 'confermato')} dimensione="small" variante="primary" className="flex-1 text-xs py-1"><CheckCircle className="w-3 h-3 inline" /> Confirmă</Bottone>}
                  {app.stato === 'confermato' && <Bottone onClick={() => cambiaStato(app._id, 'completato')} dimensione="small" variante="primary" className="flex-1 text-xs py-1"><CheckCircle className="w-3 h-3 inline" /> Completează</Bottone>}
                </div>
              </div>

              {/* Desktop: come prima */}
              <div className="hidden md:grid md:grid-cols-6 gap-4 items-center">
                <div>
                  <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Calendar className="w-3 h-3" />Data și Ora</p>
                  <p className="text-xl font-bold text-primary-600">{app.oraInizio}</p>
                  <p className="text-xs text-gray-600">{new Date(app.data).toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
                  <p className="text-xs text-gray-400">Sfârșit: {app.oraFine}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Scissors className="w-3 h-3" />Specialist</p>
                  <p className="font-semibold">{app.specialista?.utente?.nome} {app.specialista?.utente?.cognome}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><User className="w-3 h-3" />Client</p>
                  <p className="font-semibold">{app.utente.nome} {app.utente.cognome}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1"><Phone className="w-3 h-3" />{app.utente.telefono}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Scissors className="w-3 h-3" />Serviciu</p>
                  <p className="font-semibold">{app.servizio?.nome || '—'}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1"><Clock className="w-3 h-3" />{app.servizio?.durata} min</p>
                  <p className="text-xs font-semibold text-primary-600">{formattaPrezzo(app.servizio?.prezzo || 0)}</p>
                  {app.prezzoFinale !== undefined && <p className="text-xs text-green-600 font-bold">→ {formattaPrezzo(app.prezzoFinale)}</p>}
                  {app.voucherCode && <p className="text-xs text-green-600 font-medium mt-1">🎟 {app.voucherCode}</p>}
                  {app.sede && <p className="text-xs text-gray-500 mt-1 flex items-center gap-1"><MapPin className="w-3 h-3" />{app.sede.nome}{app.postazione ? ` · ${app.postazione}` : ''}</p>}
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Stare</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${getStatoColore(app.stato)}`}>{getStatoLabel(app.stato)}</span>
                </div>
                <div className="flex flex-col gap-2">
                  <Bottone onClick={() => router.push(`/cms/appointments/${app._id}`)} dimensione="small" className="w-full text-xs flex items-center justify-center gap-1"><Edit3 className="w-3 h-3" />Editare</Bottone>
                  {app.stato === 'in_attesa' && <Bottone onClick={() => cambiaStato(app._id, 'confermato')} dimensione="small" variante="primary" className="w-full text-xs flex items-center justify-center gap-1"><CheckCircle className="w-3 h-3" />Confirmă</Bottone>}
                  {app.stato === 'confermato' && <Bottone onClick={() => cambiaStato(app._id, 'completato')} dimensione="small" variante="primary" className="w-full text-xs flex items-center justify-center gap-1"><CheckCircle className="w-3 h-3" />Completează</Bottone>}
                </div>
              </div>
              {app.note && <p className="hidden md:block text-xs text-gray-500 mt-2 pt-2 border-t"><FileText className="w-3 h-3 inline" /> {app.note}</p>}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
