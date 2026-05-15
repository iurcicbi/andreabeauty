/**
 * ============================================================================
 * PAGINA CMS: GESTIONE DISPONIBILITÀ TEAM
 * ============================================================================
 * 
 * FUNZIONALITÀ:
 * - Visualizza tutti gli specialisti del team
 * - Gestisce ferie, malattie, assenze per ogni specialista
 * - Aggiunta rapida periodo di assenza
 * - Attiva/Disattiva specialista
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

interface Specialist {
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
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [specialistSelezionato, setSpecialistSelezionato] = useState<string | null>(null);
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
    loadSpecialists();
  }, []);

  const loadSpecialists = async () => {
    try {
      setCaricamento(true);
      const risposta = await webservice.get('/api/specialist/list');
      setSpecialists(risposta.dati);
    } catch (err) {
      setErrore('Eroare la încărcarea specialiștilor');
    } finally {
      setCaricamento(false);
    }
  };

  const handleApriModal = (specialistId: string) => {
    setSpecialistSelezionato(specialistId);
    setMostraModal(true);
    setNuovaAssenza({
      dataInizio: '',
      dataFine: '',
      motivo: 'Ferie',
      tuttoIlGiorno: true,
    });
  };

  const handleAggiungiAssenza = async () => {
    if (!specialistSelezionato || !nuovaAssenza.dataInizio || !nuovaAssenza.dataFine) {
      setErrore('Completează toate câmpurile obligatorii');
      return;
    }

    const dataInizio = new Date(nuovaAssenza.dataInizio);
    const dataFine = new Date(nuovaAssenza.dataFine);

    if (dataFine < dataInizio) {
      setErrore('Data de sfârșit trebuie să fie după data de început');
      return;
    }

    const giorni = Math.ceil((dataFine.getTime() - dataInizio.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    if (giorni > 90) {
      setErrore('Perioadă prea lungă (max 90 zile)');
      return;
    }

    try {
      setSalvando(true);

      const specialist = specialists.find(b => b._id === specialistSelezionato);
      if (!specialist) return;

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

      await webservice.put(`/api/specialist/${specialistSelezionato}/availability`, {
        giorniChiusura: [...specialist.giorniChiusura, ...nuoveAssenze],
      });

      setSuccesso(`Adăugate ${giorni} zile libere pentru ${specialist.utente.nome} ${specialist.utente.cognome}`);
      setMostraModal(false);
      loadSpecialists();
    } catch (err: any) {
      setErrore(err.response?.data?.errore || 'Errore durante l\'aggiunta');
    } finally {
      setSalvando(false);
    }
  };

  const handleRimuoviAssenza = async (specialistId: string, index: number) => {
    try {
      const specialist = specialists.find(b => b._id === specialistId);
      if (!specialist) return;

      const nuoveAssenze = specialist.giorniChiusura.filter((_, i) => i !== index);

      await webservice.put(`/api/specialist/${specialistId}/availability`, {
        giorniChiusura: nuoveAssenze,
      });

      setSuccesso('Absență eliminată');
      loadSpecialists();
    } catch (err: any) {
      setErrore(err.response?.data?.errore || 'Error removing absence');
    }
  };

  const handleToggleAttivo = async (specialistId: string, attivo: boolean) => {
    try {
      await webservice.put(`/api/specialist/${specialistId}/availability`, {
        attivo: !attivo,
      });

      setSuccesso(attivo ? 'Specialist dezactivat' : 'Specialist activat');
      loadSpecialists();
    } catch (err: any) {
      setErrore(err.response?.data?.errore || 'Eroare la actualizarea specialistului');
    }
  };

  if (caricamento) return <Caricamento />;

  const attivi = specialists.filter(b => b.attivo);
  const inattivi = specialists.filter(b => !b.attivo);

  return (
    <div className="container mx-auto px-3 md:px-4 py-4 md:py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 md:mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Gestionare Disponibilitate Echipă</h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">
            Gestionați concedii, concedii medicale și disponibilitatea pentru toți specialiștii
          </p>
        </div>
      </div>

      {errore && <Messaggio tipo="errore" messaggio={errore} onChiudi={() => setErrore('')} />}
      {successo && <Messaggio tipo="successo" messaggio={successo} onChiudi={() => setSuccesso('')} />}

      {/* STATISTICHE RAPIDE */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-6">
        <Card>
          <div className="text-center">
            <Users className="w-10 h-10 mx-auto mb-2 text-primary-600" />
            <div className="text-3xl font-bold text-primary-600">{specialists.length}</div>
            <div className="text-sm text-gray-600">Total Specialiști</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <UserCheck className="w-10 h-10 mx-auto mb-2 text-green-600" />
            <div className="text-3xl font-bold text-green-600">{attivi.length}</div>
            <div className="text-sm text-gray-600">Activi</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <UserX className="w-10 h-10 mx-auto mb-2 text-red-600" />
            <div className="text-3xl font-bold text-red-600">{inattivi.length}</div>
            <div className="text-sm text-gray-600">Indisponibili</div>
          </div>
        </Card>
      </div>

      {attivi.length > 0 && (
        <Card titolo="Specialiști Activi" className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-primary-600" />
            <span className="font-semibold">Specialiști Activi</span>
          </div>
          <div className="space-y-4">
            {attivi.map((specialist) => (
              <SpecialistCard
                key={specialist._id}
                specialist={specialist}
                onAggiungiAssenza={handleApriModal}
                onRimuoviAssenza={handleRimuoviAssenza}
                onToggleAttivo={handleToggleAttivo}
              />
            ))}
          </div>
        </Card>
      )}

      {inattivi.length > 0 && (
        <Card titolo={
          <span className="flex items-center gap-2">
            <Ban className="w-5 h-5" />
            Specialiști Indisponibili
          </span>
        } className="mb-6">
          <div className="space-y-4">
            {inattivi.map((specialist) => (
              <SpecialistCard
                key={specialist._id}
                specialist={specialist}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-lg p-4 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Adaugă Perioadă de Absență</h3>
            
            <div className="space-y-4">
              <div>
                  <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Data Început
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
                    Data Sfârșit
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
                    Motiv
                  </label>
                  <select
                    value={nuovaAssenza.motivo}
                    onChange={(e) => setNuovaAssenza({ ...nuovaAssenza, motivo: e.target.value })}
                    className="border rounded px-3 py-2 w-full"
                  >
                    <option value="Ferie">Concediu</option>
                    <option value="Malattia">Boală</option>
                    <option value="Permesso">Permisie</option>
                    <option value="Formazione">Formare</option>
                    <option value="Altro">Altele</option>
                  </select>
              </div>

              {nuovaAssenza.dataInizio && nuovaAssenza.dataFine && (
                <div className="bg-blue-50 p-3 rounded text-sm text-blue-800 flex items-center gap-2">
                  <BarChart className="w-4 h-4" />
                  Vor fi adăugate {Math.ceil((new Date(nuovaAssenza.dataFine).getTime() - new Date(nuovaAssenza.dataInizio).getTime()) / (1000 * 60 * 60 * 24)) + 1} zile de absență
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <Bottone onClick={handleAggiungiAssenza} disabled={salvando} className="w-full sm:flex-1 flex items-center justify-center gap-2">
                {salvando ? (
                  'Salvare...'
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Confirmă
                  </>
                )}
              </Bottone>
              <button
                onClick={() => setMostraModal(false)}
                className="w-full sm:flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 text-center"
              >
                Anulare
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SpecialistCard({
  specialist,
  onAggiungiAssenza,
  onRimuoviAssenza,
  onToggleAttivo,
}: {
  specialist: Specialist;
  onAggiungiAssenza: (id: string) => void;
  onRimuoviAssenza: (id: string, index: number) => void;
  onToggleAttivo: (id: string, attivo: boolean) => void;
}) {
  const [espanso, setEspanso] = useState(false);

  const oggi = new Date();
  oggi.setHours(0, 0, 0, 0);
  
  const futureAbsences = specialist.giorniChiusura
    .filter(a => new Date(a.data) >= oggi)
    .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());

  const pastAbsences = specialist.giorniChiusura
    .filter(a => new Date(a.data) < oggi)
    .length;

  return (
    <div className={`border rounded-lg p-4 ${specialist.attivo ? 'bg-white' : 'bg-gray-50'}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            specialist.attivo ? 'bg-green-100' : 'bg-gray-200'
          }`}>
            {specialist.attivo ? (
              <User className="w-6 h-6 text-green-600" />
            ) : (
              <Ban className="w-6 h-6 text-gray-500" />
            )}
          </div>
          
          <div className="flex-1">
            <h3 className="font-semibold text-lg">
              {specialist.utente.nome} {specialist.utente.cognome}
            </h3>
            <p className="text-sm text-gray-600">{specialist.utente.email}</p>
            <div className="flex gap-3 mt-1">
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {futureAbsences.length} absențe viitoare
              </span>
              {pastAbsences > 0 && (
                <span className="text-xs text-gray-400">
                  ({pastAbsences} trecute)
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => onAggiungiAssenza(specialist._id)}
            className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-xs sm:text-sm font-medium flex items-center gap-1"
            title="Adaugă absență"
          >
            <Plus className="w-3 h-3" />
            <span className="hidden sm:inline">Absență</span>
          </button>
          
          <button
            onClick={() => onToggleAttivo(specialist._id, specialist.attivo)}
            className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium flex items-center gap-1 ${
              specialist.attivo
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
            title={specialist.attivo ? 'Dezactivează' : 'Activează'}
          >
            {specialist.attivo ? (
              <>
                <Ban className="w-3 h-3" />
                <span className="hidden sm:inline">Dezactivează</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-3 h-3" />
                <span className="hidden sm:inline">Activează</span>
              </>
            )}
          </button>

          {futureAbsences.length > 0 && (
            <button
              onClick={() => setEspanso(!espanso)}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
            >
              {espanso ? '▲' : '▼'}
            </button>
          )}
        </div>
      </div>

      {espanso && futureAbsences.length > 0 && (
        <div className="mt-4 pt-4 border-t space-y-2">
          <h4 className="font-medium text-sm text-gray-700 mb-2">Absențe Viitoare:</h4>
          {futureAbsences.map((assenza, index) => {
            const dataAssenza = new Date(assenza.data);
            const originalIndex = specialist.giorniChiusura.findIndex(a => a.data === assenza.data);
            
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
                  onClick={() => onRimuoviAssenza(specialist._id, originalIndex)}
                  className="text-red-600 hover:text-red-800 text-sm px-2 flex items-center"
                  title="Elimină"
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
