/**
 * PAGINA: MODIFICA BARBER
 * URL: /cms/barber/[id]
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import webservice from '@/utils/webservice';
import Card from '@/componenti/interfaccia/Card';
import Bottone from '@/componenti/interfaccia/Bottone';
import Input from '@/componenti/interfaccia/Input';
import Messaggio from '@/componenti/comuni/Messaggio';
import Caricamento from '@/componenti/comuni/Caricamento';
import { Edit3, CheckCircle, Plus } from 'lucide-react';

interface Barber {
  _id: string;
  utente: {
    nome: string;
    cognome: string;
    email: string;
    telefono: string;
  };
  biografia: string;
  specializzazioni: string[];
}

export default function ModificaBarberPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [barber, setBarber] = useState<Barber | null>(null);
  
  const [formData, setFormData] = useState({
    nome: '',
    cognome: '',
    email: '',
    telefono: '',
    biografia: '',
  });
  
  const [specializzazioni, setSpecializzazioni] = useState<string[]>([]);
  const [nuovaSpecializzazione, setNuovaSpecializzazione] = useState('');
  
  const [caricamento, setCaricamento] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [errore, setErrore] = useState('');
  const [successo, setSuccesso] = useState('');

  useEffect(() => {
    caricaBarber();
  }, []);

  const caricaBarber = async () => {
    try {
      setCaricamento(true);
      const risposta = await webservice.get(`/api/barber/gestione/${params.id}`);
      setBarber(risposta.dati);
      setFormData({
        nome: risposta.dati.utente.nome,
        cognome: risposta.dati.utente.cognome,
        email: risposta.dati.utente.email,
        telefono: risposta.dati.utente.telefono,
        biografia: risposta.dati.biografia || '',
      });
      setSpecializzazioni(risposta.dati.specializzazioni || []);
    } catch (err) {
      setErrore('Errore nel caricamento del barber');
    } finally {
      setCaricamento(false);
    }
  };

  const handleAggiungiSpecializzazione = () => {
    if (!nuovaSpecializzazione.trim()) return;
    if (specializzazioni.includes(nuovaSpecializzazione.trim())) {
      setErrore('Specializzazione già presente');
      return;
    }
    setSpecializzazioni([...specializzazioni, nuovaSpecializzazione.trim()]);
    setNuovaSpecializzazione('');
  };

  const handleRimuoviSpecializzazione = (spec: string) => {
    setSpecializzazioni(specializzazioni.filter(s => s !== spec));
  };

  const handleSalvaModifiche = async () => {
    try {
      setSalvando(true);
      setErrore('');

      await webservice.put(`/api/barber/gestione/${params.id}`, {
        nome: formData.nome,
        cognome: formData.cognome,
        email: formData.email,
        telefono: formData.telefono,
        biografia: formData.biografia,
        specializzazioni,
      });

      setSuccesso('Barber aggiornato con successo!');
      setTimeout(() => {
        router.push('/cms/barber');
      }, 1500);
    } catch (err: any) {
      const messaggio = err.response?.data?.errore || 'Errore durante l\'aggiornamento';
      setErrore(messaggio);
    } finally {
      setSalvando(false);
    }
  };

  if (caricamento) return <Caricamento />;
  if (!barber) return <div>Barber non trovato</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold flex items-center gap-3">
          <Edit3 className="w-8 h-8" />
          Modifica: {barber.utente.nome} {barber.utente.cognome}
        </h1>
        <Bottone onClick={() => router.push('/cms/barber')} variante="secondary">
          ← Torna alla Lista
        </Bottone>
      </div>

      {errore && <Messaggio tipo="errore" messaggio={errore} onChiudi={() => setErrore('')} />}
      {successo && <Messaggio tipo="successo" messaggio={successo} onChiudi={() => setSuccesso('')} />}

      <Card titolo="Dati Personali">
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Nome"
              value={formData.nome}
              onChange={(v) => setFormData({ ...formData, nome: v })}
              required
            />
            <Input
              label="Cognome"
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
            label="Telefono"
            type="tel"
            value={formData.telefono}
            onChange={(v) => setFormData({ ...formData, telefono: v })}
            required
          />
        </div>
      </Card>

      <Card titolo="Informazioni Professionali" className="mt-6">
        <div className="space-y-4">
          <div>
            <label className="label">Biografia</label>
            <textarea
              value={formData.biografia}
              onChange={(e) => setFormData({ ...formData, biografia: e.target.value })}
              placeholder="Racconta qualcosa sul barber..."
              className="input-field"
              rows={4}
            />
          </div>

          <div>
            <label className="label">Specializzazioni</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={nuovaSpecializzazione}
                onChange={(e) => setNuovaSpecializzazione(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAggiungiSpecializzazione()}
                placeholder="Es: Taglio classico, Barba..."
                className="input-field flex-1"
              />
              <Bottone onClick={handleAggiungiSpecializzazione}>
                Aggiungi
              </Bottone>
            </div>

            {specializzazioni.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {specializzazioni.map((spec, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-3 py-1 bg-blue-100 rounded-full"
                  >
                    <span>{spec}</span>
                    <button
                      onClick={() => handleRimuoviSpecializzazione(spec)}
                      className="text-red-600 hover:text-red-800 font-bold"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>

      <div className="mt-6 flex gap-3">
        <Bottone onClick={handleSalvaModifiche} disabled={salvando} className="flex items-center gap-2">
          {salvando ? (
            'Salvataggio...'
          ) : (
            <>
              <CheckCircle className="w-4 h-4" />
              Salva Modifiche
            </>
          )}
        </Bottone>
        <Bottone onClick={() => router.push('/cms/barber')} variante="secondary">
          Annulla
        </Bottone>
      </div>
    </div>
  );
}
