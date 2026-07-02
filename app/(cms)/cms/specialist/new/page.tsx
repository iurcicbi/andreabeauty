'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import webservice from '@/utils/webservice';
import Card from '@/componenti/interfaccia/Card';
import Bottone from '@/componenti/interfaccia/Bottone';
import Input from '@/componenti/interfaccia/Input';
import Messaggio from '@/componenti/comuni/Messaggio';
import Caricamento from '@/componenti/comuni/Caricamento';
import { Plus, CheckCircle } from 'lucide-react';

interface Servizio {
  _id: string;
  nome: string;
  categoria: string;
  durata: number;
  prezzo: number;
}

export default function NewSpecialistPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    nome: '',
    cognome: '',
    email: '',
    password: '',
    telefono: '',
    biografia: '',
  });

  const [serviziDisponibili, setServiziDisponibili] = useState<Servizio[]>([]);
  const [specializzazioni, setSpecializzazioni] = useState<string[]>([]);

  const [caricamento, setCaricamento] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [errore, setErrore] = useState('');
  const [successo, setSuccesso] = useState('');

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const risposta = await webservice.get('/api/services');
      setServiziDisponibili(risposta.dati);
    } catch (err) {
      setErrore('Eroare la încărcarea serviciilor');
    } finally {
      setCaricamento(false);
    }
  };

  const handleToggleSpecializzazione = (id: string) => {
    setSpecializzazioni(prev =>
      prev.includes(id)
        ? prev.filter(s => s !== id)
        : [...prev, id]
    );
  };

  const handleCreateSpecialist = async () => {
    if (!formData.nome || !formData.cognome || !formData.email || !formData.password || !formData.telefono) {
      setErrore('Toate câmpurile obligatorii trebuie completate');
      return;
    }

    try {
      setSalvando(true);
      setErrore('');

      await webservice.post('/api/specialist/manage', {
        ...formData,
        specializzazioni,
      });

      setSuccesso('Specialist creat cu succes!');
      setTimeout(() => {
        router.push('/cms/specialist');
      }, 1500);
    } catch (err: any) {
      const messaggio = err.response?.data?.errore || 'Eroare la crearea specialistului';
      setErrore(messaggio);
    } finally {
      setSalvando(false);
    }
  };

  if (caricamento) return <Caricamento />;

  return (
    <div className="container mx-auto px-4 py-8 pb-24">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 md:mb-8">
        <h1 className="text-2xl md:text-4xl font-bold flex items-center gap-2 md:gap-3">
          <Plus className="w-5 h-5 md:w-8 md:h-8" />
          Specialist Nou
        </h1>
        <Bottone onClick={() => router.push('/cms/specialist')} variante="secondary" className="w-full sm:w-auto">
          ← Înapoi la listă
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
            label="Parolă"
            type="password"
            value={formData.password}
            onChange={(v) => setFormData({ ...formData, password: v })}
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
              Selectează serviciile pe care specialistul le poate efectua
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

      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <Bottone onClick={handleCreateSpecialist} disabled={salvando} className="w-full sm:w-auto flex items-center gap-2 justify-center">
          {salvando ? (
            'Se creează...'
          ) : (
            <>
              <CheckCircle className="w-4 h-4" />
              Creează Specialist
            </>
          )}
        </Bottone>
        <Bottone onClick={() => router.push('/cms/specialist')} variante="secondary" className="w-full sm:w-auto">
          Anulare
        </Bottone>
      </div>
    </div>
  );
}
