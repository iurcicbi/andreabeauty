/**
 * ============================================================================
 * PAGINA CMS: GESTIONE DISPONIBILITÀ TEAM BARBER
 * ============================================================================
 * 
 * FUNZIONALITÀ:
 * - Visualizza tutti i barber del team
 * - Gestisce ferie, malattie, assenze per ogni barber
 * - Aggiunta rapida periodo di assenza
 * - Attiva/Disattiva barber
 * ============================================================================
 */

'use client';

import { useState, useEffect } from 'react';
import webservice from '@/utils/webservice';
import Card from '@/componenti/interfaccia/Card';
import Bottone from '@/componenti/interfaccia/Bottone';
import Messaggio from '@/componenti/comuni/Messaggio';
import Caricamento from '@/componenti/comuni/Caricamento';
import { 
  Users, 
  UserCheck, 
  Calendar, 
  Tag, 
  Plus, 
  Trash2, 
  CheckCircle, 
  XCircle,
  UserX,
  BarChart,
  User,
  Ban
} from 'lucide-react';

interface GiornoChiusura {
  data: string;
  motivo: string;
  tuttoIlGiorno: boolean;
  oraInizio?: string;
  oraFine?: string;
}

interface Barber {
  _id: string;
  utente: {
    nome: string;
    cognome: string;
    email: string;
  };
  giorniChiusura: GiornoChiusura[];
  attivo: boolean;
}

export default function DisponibilitaPage() {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [barberSelezionato, setBarberSelezionato] = useState<string | null>(null);
  const [mostraModal, setMostraModal] = useState(false);
  
  const [nuovaAssenza, setNuovaAssenza] = useState({
    dataInizio: '',
    dataFine: '',
    motivo: 'Ferie',
    tuttoIlGiorno: true,
  });
  
  const [caricamento, setCaricamento] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [errore, setErrore] = useState('');
  const [successo, setSuccesso] = useState('');

  useEffect(() => {
    caricaBarbers();
  }, []);

  const caricaBarbers = async () => {
    try {
      setCaricamento(true);
      const risposta = await webservice.get('/api/barber/lista');
      setBarbers(risposta.dati);
    } catch (err) {
      setErrore('Errore nel caricamento dei barber');
    } finally {
      setCaricamento(false);
    }
  };

  const handleApriModal = (barberId: string) => {
    setBarberSelezionato(barberId);
    setMostraModal(true);
    setNuovaAssenza({
      dataInizio: '',
      dataFine: '',
      motivo: 'Ferie',
      tuttoIlGiorno: true,
    });
  };

  const handleAggiungiAssenza = async () => {
    if (!barberSelezionato || !nuovaAssenza.dataInizio || !nuovaAssenza.dataFine) {
      setErrore('Compila tutti i campi obbligatori');
      return;
    }

    const dataInizio = new Date(nuovaAssenza.dataInizio);
    const dataFine = new Date(nuovaAssenza.dataFine);

    if (dataFine < dataInizio) {
      setErrore('La data fine deve essere dopo la data inizio');
      return;
    }

    const giorni = Math.ceil((dataFine.getTime() - dataInizio.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    if (giorni > 90) {
      setErrore('Periodo troppo lungo (max 90 giorni)');
      return;
    }

    try {
      setSalvando(true);

      // Trova il barber
      const barber = barbers.find(b => b._id === barberSelezionato);
      if (!barber) return;

      // Crea array di assenze per ogni giorno
      const nuoveAssenze: GiornoChiusura[] = [];
      const dataCorrente = new Date(dataInizio);

      while (dataCorrente <= dataFine) {
        nuoveAssenze.push({
          data: dataCorrente.toISOString().split('T')[0],
          motivo: nuovaAssenza.motivo,
          tuttoIlGiorno: nuovaAssenza.tuttoIlGiorno,
        });
        dataCorrente.setDate(dataCorrente.getDate() + 1);
      }

      // Aggiorna il barber
      await webservice.put(`/api/barber/${barberSelezionato}/disponibilita`, {
        giorniChiusura: [...barber.giorniChiusura, ...nuoveAssenze],
      });

      setSuccesso(`Aggiunti ${giorni} giorni di assenza per ${barber.utente.nome} ${barber.utente.cognome}`);
      setMostraModal(false);
      caricaBarbers();
    } catch (err: any) {
      setErrore(err.response?.data?.errore || 'Errore durante l\'aggiunta');
    } finally {
      setSalvando(false);
    }
  };

  const handleRimuoviAssenza = async (barberId: string, index: number) => {
    try {
      const barber = barbers.find(b => b._id === barberId);
      if (!barber) return;

      const nuoveAssenze = barber.giorniChiusura.filter((_, i) => i !== index);

      await webservice.put(`/api/barber/${barberId}/disponibilita`, {
        giorniChiusura: nuoveAssenze,
      });

      setSuccesso('Assenza rimossa');
      caricaBarbers();
    } catch (err: any) {
      setErrore(err.response?.data?.errore || 'Errore durante la rimozione');
    }
  };

  const handleToggleAttivo = async (barberId: string, attivo: boolean) => {
    try {
      await webservice.put(`/api/barber/${barberId}/disponibilita`, {
        attivo: !attivo,
      });

      setSuccesso(attivo ? 'Barber disattivato' : 'Barber attivato');
      caricaBarbers();
    } catch (err: any) {
      setErrore(err.response?.data?.errore || 'Errore durante l\'aggiornamento');
    }
  };

  if (caricamento) return <Caricamento />;

  const barberAttivi = barbers.filter(b => b.attivo);
  const barberInattivi = barbers.filter(b => !b.attivo);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Gestione Disponibilità Team</h1>
          <p className="text-gray-600 mt-1">
            Gestisci ferie, malattie e disponibilità di tutti i barber
          </p>
        </div>
      </div>

      {errore && <Messaggio tipo="errore" messaggio={errore} onChiudi={() => setErrore('')} />}
      {successo && <Messaggio tipo="successo" messaggio={successo} onChiudi={() => setSuccesso('')} />}

      {/* STATISTICHE RAPIDE */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <Card>
          <div className="text-center">
            <Users className="w-10 h-10 mx-auto mb-2 text-primary-600" />
            <div className="text-3xl font-bold text-primary-600">{barbers.length}</div>
            <div className="text-sm text-gray-600">Barber Totali</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <UserCheck className="w-10 h-10 mx-auto mb-2 text-green-600" />
            <div className="text-3xl font-bold text-green-600">{barberAttivi.length}</div>
            <div className="text-sm text-gray-600">Attivi</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <UserX className="w-10 h-10 mx-auto mb-2 text-red-600" />
            <div className="text-3xl font-bold text-red-600">{barberInattivi.length}</div>
            <div className="text-sm text-gray-600">Non Disponibili</div>
          </div>
        </Card>
      </div>

      {/* LISTA BARBER ATTIVI */}
      {barberAttivi.length > 0 && (
        <Card titolo="Barber Attivi" className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-primary-600" />
            <span className="font-semibold">Barber Attivi</span>
          </div>
          <div className="space-y-4">
            {barberAttivi.map((barber) => (
              <BarberCard
                key={barber._id}
                barber={barber}
                onAggiungiAssenza={handleApriModal}
                onRimuoviAssenza={handleRimuoviAssenza}
                onToggleAttivo={handleToggleAttivo}
              />
            ))}
          </div>
        </Card>
      )}

      {/* LISTA BARBER INATTIVI */}
      {barberInattivi.length > 0 && (
        <Card titolo={
          <span className="flex items-center gap-2">
            <Ban className="w-5 h-5" />
            Barber Non Disponibili
          </span>
        } className="mb-6">
          <div className="space-y-4">
            {barberInattivi.map((barber) => (
              <BarberCard
                key={barber._id}
                barber={barber}
                onAggiungiAssenza={handleApriModal}
                onRimuoviAssenza={handleRimuoviAssenza}
                onToggleAttivo={handleToggleAttivo}
              />
            ))}
          </div>
        </Card>
      )}

      {/* MODAL AGGIUNTA ASSENZA */}
      {mostraModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Aggiungi Periodo di Assenza</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Data Inizio
                </label>
                <input
                  type="date"
                  value={nuovaAssenza.dataInizio}
                  onChange={(e) => setNuovaAssenza({ ...nuovaAssenza, dataInizio: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="border rounded px-3 py-2 w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Data Fine
                </label>
                <input
                  type="date"
                  value={nuovaAssenza.dataFine}
                  onChange={(e) => setNuovaAssenza({ ...nuovaAssenza, dataFine: e.target.value })}
                  min={nuovaAssenza.dataInizio || new Date().toISOString().split('T')[0]}
                  className="border rounded px-3 py-2 w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                  <Tag className="w-4 h-4" />
                  Motivo
                </label>
                <select
                  value={nuovaAssenza.motivo}
                  onChange={(e) => setNuovaAssenza({ ...nuovaAssenza, motivo: e.target.value })}
                  className="border rounded px-3 py-2 w-full"
                >
                  <option value="Ferie">Ferie</option>
                  <option value="Malattia">Malattia</option>
                  <option value="Permesso">Permesso</option>
                  <option value="Formazione">Formazione</option>
                  <option value="Altro">Altro</option>
                </select>
              </div>

              {nuovaAssenza.dataInizio && nuovaAssenza.dataFine && (
                <div className="bg-blue-50 p-3 rounded text-sm text-blue-800 flex items-center gap-2">
                  <BarChart className="w-4 h-4" />
                  Verranno aggiunti {Math.ceil((new Date(nuovaAssenza.dataFine).getTime() - new Date(nuovaAssenza.dataInizio).getTime()) / (1000 * 60 * 60 * 24)) + 1} giorni di assenza
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <Bottone onClick={handleAggiungiAssenza} disabled={salvando} className="flex-1 flex items-center justify-center gap-2">
                {salvando ? (
                  'Salvataggio...'
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Conferma
                  </>
                )}
              </Bottone>
              <button
                onClick={() => setMostraModal(false)}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Annulla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Componente Card per singolo barber
function BarberCard({
  barber,
  onAggiungiAssenza,
  onRimuoviAssenza,
  onToggleAttivo,
}: {
  barber: Barber;
  onAggiungiAssenza: (id: string) => void;
  onRimuoviAssenza: (id: string, index: number) => void;
  onToggleAttivo: (id: string, attivo: boolean) => void;
}) {
  const [espanso, setEspanso] = useState(false);

  // Filtra assenze future
  const oggi = new Date();
  oggi.setHours(0, 0, 0, 0);
  
  const assenzeFuture = barber.giorniChiusura
    .filter(a => new Date(a.data) >= oggi)
    .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());

  const assenzePassate = barber.giorniChiusura
    .filter(a => new Date(a.data) < oggi)
    .length;

  return (
    <div className={`border rounded-lg p-4 ${barber.attivo ? 'bg-white' : 'bg-gray-50'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            barber.attivo ? 'bg-green-100' : 'bg-gray-200'
          }`}>
            {barber.attivo ? (
              <User className="w-6 h-6 text-green-600" />
            ) : (
              <Ban className="w-6 h-6 text-gray-500" />
            )}
          </div>
          
          <div className="flex-1">
            <h3 className="font-semibold text-lg">
              {barber.utente.nome} {barber.utente.cognome}
            </h3>
            <p className="text-sm text-gray-600">{barber.utente.email}</p>
            <div className="flex gap-3 mt-1">
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {assenzeFuture.length} assenze future
              </span>
              {assenzePassate > 0 && (
                <span className="text-xs text-gray-400">
                  ({assenzePassate} passate)
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onAggiungiAssenza(barber._id)}
            className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm font-medium flex items-center gap-1"
            title="Aggiungi assenza"
          >
            <Plus className="w-3 h-3" />
            Assenza
          </button>
          
          <button
            onClick={() => onToggleAttivo(barber._id, barber.attivo)}
            className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1 ${
              barber.attivo
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
            title={barber.attivo ? 'Disattiva' : 'Attiva'}
          >
            {barber.attivo ? (
              <>
                <Ban className="w-3 h-3" />
                Disattiva
              </>
            ) : (
              <>
                <CheckCircle className="w-3 h-3" />
                Attiva
              </>
            )}
          </button>

          {assenzeFuture.length > 0 && (
            <button
              onClick={() => setEspanso(!espanso)}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
            >
              {espanso ? '▲' : '▼'}
            </button>
          )}
        </div>
      </div>

      {/* LISTA ASSENZE ESPANSA */}
      {espanso && assenzeFuture.length > 0 && (
        <div className="mt-4 pt-4 border-t space-y-2">
          <h4 className="font-medium text-sm text-gray-700 mb-2">Assenze Future:</h4>
          {assenzeFuture.map((assenza, index) => {
            const dataAssenza = new Date(assenza.data);
            const originalIndex = barber.giorniChiusura.findIndex(a => a.data === assenza.data);
            
            return (
              <div key={index} className="flex items-center justify-between bg-amber-50 p-2 rounded">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-600" />
                  <div>
                    <p className="text-sm font-medium">
                      {dataAssenza.toLocaleDateString('it-IT', { 
                        weekday: 'short', 
                        day: 'numeric', 
                        month: 'short' 
                      })}
                    </p>
                    <p className="text-xs text-gray-600">{assenza.motivo}</p>
                  </div>
                </div>
                <button
                  onClick={() => onRimuoviAssenza(barber._id, originalIndex)}
                  className="text-red-600 hover:text-red-800 text-sm px-2 flex items-center"
                  title="Rimuovi"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
