'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import webservice from '@/utils/webservice';
import Card from '@/componenti/interfaccia/Card';
import Bottone from '@/componenti/interfaccia/Bottone';
import Input from '@/componenti/interfaccia/Input';
import Messaggio from '@/componenti/comuni/Messaggio';
import Caricamento from '@/componenti/comuni/Caricamento';
import { Edit3, CheckCircle } from 'lucide-react';

interface Servizio {
  _id: string;
  nome: string;
  categoria: string;
  durata: number;
  prezzo: number;
}

interface Postazione {
  nome: string;
  descrizione?: string;
  attivo: boolean;
}

interface Sede {
  _id: string;
  nome: string;
  indirizzo: string;
  citta: string;
  postazioni: Postazione[];
  attivo?: boolean;
}

interface GiornoOrario {
  aperto: boolean;
  oraInizio?: string;
  oraFine?: string;
  pausa?: { oraInizio: string; oraFine: string };
  sede?: string;
  postazione?: string;
  sedeMattina?: string;
  postazioneMattina?: string;
  sedePomeriggio?: string;
  postazionePomeriggio?: string;
}

interface Specialist {
  _id: string;
  utente: {
    nome: string;
    cognome: string;
    email: string;
    telefono: string;
  };
  biografia: string;
  specializzazioni: Servizio[];
  orariSettimanali: Record<string, GiornoOrario>;
}

const GIORNI = ['lunedi', 'martedi', 'mercoledi', 'giovedi', 'venerdi', 'sabato', 'domenica'];
const NOMI_GIORNI: Record<string, string> = {
  lunedi: 'Luni', martedi: 'Marți', mercoledi: 'Miercuri',
  giovedi: 'Joi', venerdi: 'Vineri', sabato: 'Sâmbătă', domenica: 'Duminică',
};

export default function EditSpecialistPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [specialist, setSpecialist] = useState<Specialist | null>(null);

  const [formData, setFormData] = useState({
    nome: '',
    cognome: '',
    email: '',
    telefono: '',
    biografia: '',
  });

  const [serviziDisponibili, setServiziDisponibili] = useState<Servizio[]>([]);
  const [specializzazioni, setSpecializzazioni] = useState<string[]>([]);
  const [sedi, setSedi] = useState<Sede[]>([]);
  const [orariSettimanali, setOrariSettimanali] = useState<Record<string, GiornoOrario>>({});

  const [caricamento, setCaricamento] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [errore, setErrore] = useState('');
  const [successo, setSuccesso] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setCaricamento(true);
      const [specialistRes, serviziRes, sediRes] = await Promise.all([
        webservice.get(`/api/specialist/manage/${params.id}`),
        webservice.get('/api/services'),
        webservice.get('/api/sedi'),
      ]);
      setSpecialist(specialistRes.dati);
      setServiziDisponibili(serviziRes.dati);
      setSedi(sediRes.dati || []);
      setOrariSettimanali(specialistRes.dati.orariSettimanali || {});
      setFormData({
        nome: specialistRes.dati.utente.nome,
        cognome: specialistRes.dati.utente.cognome,
        email: specialistRes.dati.utente.email,
        telefono: specialistRes.dati.utente.telefono,
        biografia: specialistRes.dati.biografia || '',
      });
      setSpecializzazioni(
        (specialistRes.dati.specializzazioni || []).map((s: Servizio) => s._id)
      );
    } catch (err) {
      setErrore('Eroare la încărcarea datelor');
    } finally {
      setCaricamento(false);
    }
  };

  const aggiornaGiorno = (giorno: string, campo: string, valore: any) => {
    setOrariSettimanali(prev => ({
      ...prev,
      [giorno]: { ...prev[giorno], [campo]: valore },
    }));
  };

  const handleToggleSpecializzazione = (id: string) => {
    setSpecializzazioni(prev =>
      prev.includes(id)
        ? prev.filter(s => s !== id)
        : [...prev, id]
    );
  };

  const handleSave = async () => {
    try {
      setSalvando(true);
      setErrore('');

      await webservice.put(`/api/specialist/manage/${params.id}`, {
        nome: formData.nome,
        cognome: formData.cognome,
        email: formData.email,
        telefono: formData.telefono,
        biografia: formData.biografia,
        specializzazioni,
        orariSettimanali,
      });

      setSuccesso('Specialist actualizat cu succes!');
      setTimeout(() => {
        router.push('/cms/specialist');
      }, 1500);
    } catch (err: any) {
      const messaggio = err.response?.data?.errore || 'Eroare la actualizarea specialistului';
      setErrore(messaggio);
    } finally {
      setSalvando(false);
    }
  };

  if (caricamento) return <Caricamento />;
  if (!specialist) return <div>Specialist negăsit</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 md:mb-8">
          <h1 className="text-2xl md:text-4xl font-bold flex items-center gap-2 md:gap-3">
            <Edit3 className="w-5 h-5 md:w-8 md:h-8" />
            Editează: {specialist.utente.nome} {specialist.utente.cognome}
          </h1>
          <Bottone onClick={() => router.push('/cms/specialist')} variante="secondary" className="w-full sm:w-auto">
            ← Înapoi
          </Bottone>
      </div>

      {errore && <Messaggio tipo="errore" messaggio={errore} onChiudi={() => setErrore('')} />}
      {successo && <Messaggio tipo="successo" messaggio={successo} onChiudi={() => setSuccesso('')} />}

      <Card titolo="Informații Personale">
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Prenume"
              value={formData.nome}
              onChange={(v) => setFormData({ ...formData, nome: v })}
              required
            />
            <Input
              label="Nume"
              value={formData.cognome}
              onChange={(v) => setFormData({ ...formData, cognome: v })}
              required
            />
          </div>

          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(v) => setFormData({ ...formData, email: v })}
            required
          />

          <Input
            label="Telefon"
            type="tel"
            value={formData.telefono}
            onChange={(v) => setFormData({ ...formData, telefono: v })}
            required
          />
        </div>
      </Card>

      <Card titolo="Informații Profesionale" className="mt-6">
        <div className="space-y-4">
          <div>
            <label className="label">Biografie</label>
            <textarea
              value={formData.biografia}
              onChange={(e) => setFormData({ ...formData, biografia: e.target.value })}
              placeholder="Spune-ne despre specialist..."
              className="input-field"
              rows={4}
            />
          </div>

          <div>
            <label className="label">Specializări</label>
            <p className="text-sm text-gray-500 mb-2">
              Selectează serviciile pe care le poate efectua
            </p>
            {serviziDisponibili.length === 0 ? (
              <p className="text-sm text-gray-400">Nu există servicii disponibile</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto border rounded-lg p-3">
                {serviziDisponibili.map((servizio) => (
                  <label
                    key={servizio._id}
                    className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={specializzazioni.includes(servizio._id)}
                      onChange={() => handleToggleSpecializzazione(servizio._id)}
                      className="w-4 h-4"
                    />
                    <div className="flex-1">
                      <span className="font-medium">{servizio.nome}</span>
                      <span className="text-sm text-gray-500 ml-2">
                        ({servizio.categoria})
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {servizio.durata}min · €{servizio.prezzo}
                    </span>
                  </label>
                ))}
              </div>
            )}
            <p className="text-xs text-gray-400 mt-1">
              Selectate: {specializzazioni.length} servicii
            </p>
          </div>
        </div>
      </Card>

      {sedi.length > 0 && (
        <Card titolo="Locație" className="mt-6">
          <p className="text-sm text-gray-500 mb-4">
            Alege locația și stația pentru fiecare zi în care specialistul lucrează.
          </p>
          <div className="space-y-3">
            {GIORNI.map((giorno) => {
              const orario = orariSettimanali[giorno] || { aperto: false };
              if (!orario.aperto) return null;

              return (
                <div key={giorno} className="border rounded-lg p-4">
                  <h4 className="font-semibold text-base mb-3">{NOMI_GIORNI[giorno]}</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={orario.sede || ''}
                      onChange={(e) => {
                        const val = e.target.value || undefined;
                        aggiornaGiorno(giorno, 'sede', val);
                        if (!val) aggiornaGiorno(giorno, 'postazione', undefined);
                      }}
                      className="border rounded px-3 py-2 text-sm"
                    >
                      <option value="">Fără locație</option>
                      {sedi.filter(s => s.attivo !== false).map(s => (
                        <option key={s._id} value={s._id}>{s.nome}</option>
                      ))}
                    </select>
                    <select
                      value={orario.postazione || ''}
                      onChange={(e) => aggiornaGiorno(giorno, 'postazione', e.target.value || undefined)}
                      className="border rounded px-3 py-2 text-sm"
                    >
                      <option value="">Fără stație</option>
                      {sedi
                        .find(s => s._id === orario.sede)
                        ?.postazioni?.filter(p => p.attivo)
                        .map(p => (
                          <option key={p.nome} value={p.nome}>{p.nome}</option>
                        ))}
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Bottone onClick={handleSave} disabled={salvando} className="w-full sm:w-auto flex items-center gap-2 justify-center">
          {salvando ? (
            'Se salvează...'
          ) : (
            <>
              <CheckCircle className="w-4 h-4" />
              Salvează
            </>
          )}
        </Bottone>
        <Bottone onClick={() => router.push('/cms/specialist')} variante="secondary" className="w-full sm:w-auto">
          Anulează
        </Bottone>
      </div>
    </div>
  );
}
