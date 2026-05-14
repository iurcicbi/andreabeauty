/**
 * PAGINA: AGGIUNGI NUOVO BARBER
 * URL: /cms/barber/nuovo
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import webservice from '@/utils/webservice';
import Card from '@/componenti/interfaccia/Card';
import Bottone from '@/componenti/interfaccia/Bottone';
import Input from '@/componenti/interfaccia/Input';
import Messaggio from '@/componenti/comuni/Messaggio';
import { Plus, CheckCircle } from 'lucide-react';

export default function NuovoBarberPage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    nome: '',
    cognome: '',
    email: '',
    password: '',
    telefono: '',
    biografia: '',
  });
  
  const [specializzazioni, setSpecializzazioni] = useState<string[]>([]);
  const [nuovaSpecializzazione, setNuovaSpecializzazione] = useState('');
  
  const [salvando, setSalvando] = useState(false);
  const [errore, setErrore] = useState('');
  const [successo, setSuccesso] = useState('');

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

  const handleCreaBarber = async () => {
    if (!formData.nome || !formData.cognome || !formData.email || !formData.password || !formData.telefono) {
      setErrore('Tutti i campi obbligatori devono essere compilati');
      return;
    }

    try {
      setSalvando(true);
      setErrore('');

      await webservice.post('/api/barber/gestione', {
        ...formData,
        specializzazioni,
      });

      setSuccesso('Barber creato con successo!');
      setTimeout(() => {
        router.push('/cms/barber');
      }, 1500);
    } catch (err: any) {
      const messaggio = err.response?.data?.errore || 'Errore durante la creazione';
      setErrore(messaggio);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold flex items-center gap-3">
          <Plus className="w-8 h-8" />
          Nuovo Barber
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
            label="Password"
            type="password"
            value={formData.password}
            onChange={(v) => setFormData({ ...formData, password: v })}
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
        <Bottone onClick={handleCreaBarber} disabled={salvando} className="flex items-center gap-2">
          {salvando ? (
            'Creazione...'
          ) : (
            <>
              <CheckCircle className="w-4 h-4" />
              Crea Barber
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
