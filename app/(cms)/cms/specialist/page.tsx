'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import webservice from '@/utils/webservice';
import Card from '@/componenti/interfaccia/Card';
import Bottone from '@/componenti/interfaccia/Bottone';
import Messaggio from '@/componenti/comuni/Messaggio';
import Caricamento from '@/componenti/comuni/Caricamento';
import { Plus, Edit3, CheckCircle, XCircle, UserCheck, UserX } from 'lucide-react';

interface Servizio {
  _id: string;
  nome: string;
}

interface Specialist {
  _id: string;
  utente: {
    nome: string;
    cognome: string;
    email: string;
    telefono: string;
    attivo: boolean;
  };
  biografia: string;
  specializzazioni: Servizio[];
  attivo: boolean;
}

export default function SpecialistListPage() {
  const router = useRouter();
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [caricamento, setCaricamento] = useState(true);
  const [errore, setErrore] = useState('');
  const [successo, setSuccesso] = useState('');

  useEffect(() => {
    loadSpecialists();
  }, []);

  const loadSpecialists = async () => {
    try {
      setCaricamento(true);
      const risposta = await webservice.get('/api/specialist/manage');
      setSpecialists(risposta.dati);
    } catch (err) {
      setErrore('Eroare la încărcarea specialiștilor');
    } finally {
      setCaricamento(false);
    }
  };

  const handleToggleActive = async (specialist: Specialist) => {
    try {
      await webservice.put(`/api/specialist/manage/${specialist._id}`, {
        attivo: !specialist.attivo,
      });
      setSuccesso(`Specialist ${!specialist.attivo ? 'activat' : 'dezactivat'}`);
      loadSpecialists();
    } catch (err: any) {
      const messaggio = err.response?.data?.errore || 'Eroare la actualizarea specialistului';
      setErrore(messaggio);
    }
  };

  if (caricamento) return <Caricamento />;

  const activeSpecialists = specialists.filter(b => b.attivo);
  const inactiveSpecialists = specialists.filter(b => !b.attivo);

  return (
    <div className="container mx-auto px-2 md:px-4 py-4 md:py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 md:gap-4 mb-4 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-4xl font-bold">Specialiști</h1>
          <p className="text-sm md:text-base text-gray-600 mt-1 md:mt-2">
            Total: {specialists.length} | Activi: {activeSpecialists.length} | Inactivi: {inactiveSpecialists.length}
          </p>
        </div>
        <Bottone onClick={() => router.push('/cms/specialist/new')} dimensione="small" className="w-full sm:w-auto flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" />
          Specialist Nou
        </Bottone>
      </div>

      {errore && <Messaggio tipo="errore" messaggio={errore} onChiudi={() => setErrore('')} />}
      {successo && <Messaggio tipo="successo" messaggio={successo} onChiudi={() => setSuccesso('')} />}

      {activeSpecialists.length > 0 && (
        <div className="mb-6 md:mb-8">
          <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-green-600" />
            Specialiști Activi
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {activeSpecialists.map((specialist) => (
              <Card key={specialist._id}>
                <div className="space-y-2 md:space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-lg md:text-2xl font-bold flex-shrink-0">
                      {specialist.utente.nome[0]}{specialist.utente.cognome[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base md:text-xl font-bold truncate">
                        {specialist.utente.nome} {specialist.utente.cognome}
                      </h3>
                      <p className="text-xs md:text-sm text-gray-600 truncate">{specialist.utente.email}</p>
                    </div>
                  </div>

                  {specialist.specializzazioni && specialist.specializzazioni.length > 0 && (
                    <div>
                      <p className="text-xs md:text-sm font-semibold text-gray-700 mb-1">Specializări:</p>
                      <div className="flex flex-wrap gap-1">
                        {specialist.specializzazioni.slice(0, 3).map((spec, i) => (
                          <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                            {spec.nome}
                          </span>
                        ))}
                        {specialist.specializzazioni.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                            +{specialist.specializzazioni.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-2 pt-2 md:pt-3 border-t">
                    <Bottone
                      onClick={() => router.push(`/cms/specialist/${specialist._id}`)}
                      dimensione="small"
                      className="flex-1 text-xs md:text-sm flex items-center justify-center gap-1"
                    >
                      <Edit3 className="w-3 h-3" />
                      Editare
                    </Bottone>
                    <Bottone
                      onClick={() => handleToggleActive(specialist)}
                      dimensione="small"
                      variante="secondary"
                      className="flex-1 text-xs md:text-sm flex items-center justify-center gap-1"
                    >
                      <XCircle className="w-3 h-3" />
                      Dezactivare
                    </Bottone>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {inactiveSpecialists.length > 0 && (
        <div>
          <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 flex items-center gap-2">
            <UserX className="w-6 h-6 text-red-600" />
            Specialiști Inactivi
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {inactiveSpecialists.map((specialist) => (
              <Card key={specialist._id} className="opacity-60">
                <div className="space-y-2 md:space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gray-400 flex items-center justify-center text-white text-lg md:text-2xl font-bold flex-shrink-0">
                      {specialist.utente.nome[0]}{specialist.utente.cognome[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base md:text-xl font-bold truncate">
                        {specialist.utente.nome} {specialist.utente.cognome}
                      </h3>
                      <p className="text-xs md:text-sm text-gray-600 truncate">{specialist.utente.email}</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 pt-2 md:pt-3 border-t">
                    <Bottone
                      onClick={() => router.push(`/cms/specialist/${specialist._id}`)}
                      dimensione="small"
                      className="flex-1 text-xs md:text-sm flex items-center justify-center gap-1"
                    >
                      <Edit3 className="w-3 h-3" />
                      Editare
                    </Bottone>
                    <Bottone
                      onClick={() => handleToggleActive(specialist)}
                      dimensione="small"
                      variante="secondary"
                      className="flex-1 text-xs md:text-sm flex items-center justify-center gap-1"
                    >
                      <CheckCircle className="w-3 h-3" />
                      Reactivare
                    </Bottone>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {specialists.length === 0 && (
        <Card>
          <p className="text-center py-8 text-gray-600 text-sm md:text-base">
            Nu există specialiști încă. Creează primul specialist!
          </p>
        </Card>
      )}
    </div>
  );
}
