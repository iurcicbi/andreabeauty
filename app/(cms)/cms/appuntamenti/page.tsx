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
  FileText 
} from 'lucide-react';

interface Appuntamento {
  _id: string;
  utente: { nome: string; cognome: string; telefono: string; email?: string; };
  barber: { nome: string; cognome: string; };
  servizio: { nome: string; durata: number; prezzo: number; };
  data: string;
  oraInizio: string;
  oraFine: string;
  stato: string;
  note?: string;
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
    // Imposta di default la data di oggi
    const oggi = new Date().toISOString().split('T')[0];
    setDataInizio(oggi);
    setDataFine(oggi);
    caricaAppuntamenti();
  }, []);

  useEffect(() => {
    applicaFiltri();
  }, [appuntamenti, ricerca, filtroStato, dataInizio, dataFine]);

  const caricaAppuntamenti = async () => {
    try {
      setCaricamento(true);
      const risposta = await webservice.get('/api/appuntamenti');
      setAppuntamenti(risposta.dati);
    } catch (err) {
      setErrore('Errore caricamento appuntamenti');
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
      await webservice.patch(`/api/appuntamenti/${id}`, { stato: nuovoStato });
      setSuccesso('Stato aggiornato');
      caricaAppuntamenti();
      setTimeout(() => setSuccesso(''), 3000);
    } catch (err) {
      setErrore('Errore aggiornamento stato');
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
      case 'in_attesa': return 'In Attesa';
      case 'confermato': return 'Confermato';
      case 'completato': return 'Completato';
      case 'cancellato': return 'Cancellato';
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
          <h1 className="text-2xl md:text-4xl font-bold mb-1 md:mb-2">Gestione Appuntamenti</h1>
          <div className="text-sm md:text-base text-gray-600">
            <p>
              {appuntamentiFiltrati.length} di {appuntamenti.length} appuntamenti
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
              <p className="text-xs text-orange-600 mt-1">
                💡 Suggerimento: Usa i filtri data per vedere appuntamenti specifici
              </p>
            )}
          </div>
        </div>
        <Bottone onClick={() => router.push('/cms/appuntamenti/nuovo')} dimensione="small" className="w-full sm:w-auto flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" />
          Nuovo
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
      />

      {/* Lista Appuntamenti - Mobile Optimized */}
      {appuntamentiFiltrati.length === 0 ? (
        <Card>
          <div className="text-center py-8 md:py-12">
            <Calendar className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-lg md:text-xl text-gray-600 mb-2">
              {appuntamenti.length === 0 
                ? 'Nessun appuntamento' 
                : 'Nessun risultato per i filtri selezionati'}
            </p>
            {appuntamenti.length === 0 && (
              <Bottone 
                onClick={() => router.push('/cms/appuntamenti/nuovo')}
                className="mt-4"
                dimensione="small"
              >
                Crea il primo appuntamento
              </Bottone>
            )}
          </div>
        </Card>
      ) : (
        <div className="space-y-3 md:space-y-4">
          {appuntamentiFiltrati.map((app) => (
            <Card key={app._id} className="hover:shadow-lg transition-shadow">
              {/* Mobile: Layout verticale, Desktop: Layout orizzontale */}
              <div className="grid grid-cols-1 md:grid-cols-6 gap-3 md:gap-4 items-start md:items-center">
                {/* Orario */}
                <div className="flex md:block items-center gap-3 md:gap-0">
                  <div>
                    <p className="text-xs md:text-sm text-gray-600 mb-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Data e Ora
                    </p>
                    <p className="text-xl md:text-2xl font-bold text-primary-600">{app.oraInizio}</p>
                    <p className="text-xs md:text-sm text-gray-600">
                      {new Date(app.data).toLocaleDateString('it-IT', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short'
                      })}
                    </p>
                    <p className="text-xs text-gray-500">Fine: {app.oraFine}</p>
                  </div>
                </div>

                {/* Barber */}
                <div>
                  <p className="text-xs md:text-sm text-gray-600 mb-1 flex items-center gap-1">
                    <Scissors className="w-3 h-3" />
                    Barber
                  </p>
                  <p className="font-semibold text-sm md:text-lg">
                    {app.barber?.nome} {app.barber?.cognome}
                  </p>
                </div>

                {/* Cliente */}
                <div>
                  <p className="text-xs md:text-sm text-gray-600 mb-1 flex items-center gap-1">
                    <User className="w-3 h-3" />
                    Cliente
                  </p>
                  <p className="font-semibold text-sm md:text-lg">
                    {app.utente.nome} {app.utente.cognome}
                  </p>
                  <p className="text-xs md:text-sm text-gray-600 flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {app.utente.telefono}
                  </p>
                  {app.utente.email && (
                    <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {app.utente.email}
                    </p>
                  )}
                </div>

                {/* Servizio */}
                <div>
                  <p className="text-xs md:text-sm text-gray-600 mb-1 flex items-center gap-1">
                    <Scissors className="w-3 h-3" />
                    Servizio
                  </p>
                  <p className="font-semibold text-sm md:text-base">{app.servizio.nome}</p>
                  <p className="text-xs md:text-sm text-gray-600 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {app.servizio.durata} min
                  </p>
                  <p className="text-xs md:text-sm font-semibold text-primary-600">
                    {formattaPrezzo(app.servizio.prezzo)}
                  </p>
                </div>

                {/* Stato */}
                <div>
                  <p className="text-xs md:text-sm text-gray-600 mb-2">Stato</p>
                  <span className={`inline-block px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium border ${getStatoColore(app.stato)}`}>
                    {getStatoLabel(app.stato)}
                  </span>
                </div>

                {/* Azioni - Mobile: Full width buttons */}
                <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto">
                  <Bottone
                    onClick={() => router.push(`/cms/appuntamenti/${app._id}`)}
                    dimensione="small"
                    className="flex-1 md:flex-none md:w-full text-xs md:text-sm flex items-center justify-center gap-1"
                  >
                    <Edit3 className="w-3 h-3" />
                    Modifica
                  </Bottone>
                  
                  {app.stato === 'in_attesa' && (
                    <Bottone
                      onClick={() => cambiaStato(app._id, 'confermato')}
                      dimensione="small"
                      variante="success"
                      className="flex-1 md:flex-none md:w-full text-xs md:text-sm flex items-center justify-center gap-1"
                    >
                      <CheckCircle className="w-3 h-3" />
                      Conferma
                    </Bottone>
                  )}
                  
                  {app.stato === 'confermato' && (
                    <Bottone
                      onClick={() => cambiaStato(app._id, 'completato')}
                      dimensione="small"
                      variante="success"
                      className="flex-1 md:flex-none md:w-full text-xs md:text-sm flex items-center justify-center gap-1"
                    >
                      <CheckCircle className="w-3 h-3" />
                      Completa
                    </Bottone>
                  )}
                </div>
              </div>

              {/* Note */}
              {app.note && (
                <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t">
                  <p className="text-xs md:text-sm text-gray-600 flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    Note:
                  </p>
                  <p className="text-xs md:text-sm">{app.note}</p>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
