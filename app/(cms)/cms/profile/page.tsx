/**
 * ============================================================================
 * PAGINA CMS: PROFILO SPECIALIST
 * ============================================================================
 * 
 * FUNZIONALITÀ:
 * - Visualizza e modifica informazioni personali
 * - Gestisce biografia
 * - Gestisce specializzazioni
 * - Gestisce telefono di contatto
 * ============================================================================
 */

'use client';

import { useState, useEffect } from 'react';
import webservice from '@/utils/webservice';
import Card from '@/componenti/interfaccia/Card';
import Bottone from '@/componenti/interfaccia/Bottone';
import Input from '@/componenti/interfaccia/Input';
import Messaggio from '@/componenti/comuni/Messaggio';
import Caricamento from '@/componenti/comuni/Caricamento';

interface Profilo {
  utente: {
    nome: string;
    cognome: string;
    email: string;
  };
  biografia: string;
  specializzazioni: string[];
  telefono: string;
}

export default function ProfiloPage() {
  const [profilo, setProfilo] = useState<Profilo | null>(null);
  const [biografia, setBiografia] = useState('');
  const [specializzazioni, setSpecializzazioni] = useState<string[]>([]);
  const [telefono, setTelefono] = useState('');
  const [nuovaSpecializzazione, setNuovaSpecializzazione] = useState('');
  
  const [caricamento, setCaricamento] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [errore, setErrore] = useState('');
  const [successo, setSuccesso] = useState('');

  useEffect(() => {
    caricaProfilo();
  }, []);

  const caricaProfilo = async () => {
    try {
      setCaricamento(true);
      // Richiede i dati utente per visualizzare nome, cognome, email
      const risposta = await webservice.get('/api/specialist/profile?includeUtente=true');
      
      setProfilo(risposta.dati);
      setBiografia(risposta.dati.biografia || '');
      setSpecializzazioni(risposta.dati.specializzazioni || []);
      setTelefono(risposta.dati.telefono || '');
    } catch (err) {
      setErrore('Eroare la încărcarea profilului');
    } finally {
      setCaricamento(false);
    }
  };

  const handleAggiungiSpecializzazione = () => {
    if (!nuovaSpecializzazione.trim()) {
      setErrore('Introdu o specializare');
      return;
    }

    if (specializzazioni.includes(nuovaSpecializzazione.trim())) {
      setErrore('Specializarea există deja');
      return;
    }

    setSpecializzazioni([...specializzazioni, nuovaSpecializzazione.trim()]);
    setNuovaSpecializzazione('');
    setSuccesso('Specializare adăugată');
  };

  const handleRimuoviSpecializzazione = (index: number) => {
    setSpecializzazioni(specializzazioni.filter((_, i) => i !== index));
    setSuccesso('Specializare eliminată');
  };

  const handleSalva = async () => {
    try {
      setSalvando(true);
      setErrore('');

      await webservice.put('/api/specialist/profile', {
        biografia,
        specializzazioni,
        telefono,
      });

      setSuccesso('Profil actualizat cu succes!');
      caricaProfilo();
    } catch (err: any) {
      const messaggio = err.response?.data?.errore || 'Errore durante il salvataggio';
      setErrore(messaggio);
    } finally {
      setSalvando(false);
    }
  };

  if (caricamento) return <Caricamento />;

  return (
    <div className="container mx-auto px-3 md:px-4 py-4 md:py-8">
      <h1 className="text-2xl md:text-4xl font-bold mb-4 md:mb-8">Profilul Meu</h1>

      {errore && <Messaggio tipo="errore" messaggio={errore} onChiudi={() => setErrore('')} />}
      {successo && <Messaggio tipo="successo" messaggio={successo} onChiudi={() => setSuccesso('')} />}

      {/* INFORMAZIONI ACCOUNT */}
      <Card titolo="Informații Cont">
        <div className="space-y-3">
          <div>
            <label className="label">Nume Complet</label>
            <p className="text-lg font-medium">
              {profilo?.utente.nome} {profilo?.utente.cognome}
            </p>
          </div>
          <div>
            <label className="label">Email</label>
            <p className="text-lg">{profilo?.utente.email}</p>
          </div>
          <p className="text-sm text-gray-600 mt-4">
            Pentru a modifica numele și emailul, contactează administratorul
          </p>
        </div>
      </Card>

      {/* INFORMAZIONI PROFESSIONALI */}
      <Card titolo="Informații Profesionale" className="mt-6">
        <div className="space-y-4">
          <Input
            label="Telefon"
            type="tel"
            value={telefono}
            onChange={setTelefono}
            placeholder="Ex: 0712345678"
          />

          <div>
            <label className="label">Biografie</label>
            <textarea
              value={biografia}
              onChange={(e) => setBiografia(e.target.value)}
              placeholder="Povestește ceva despre tine, experiența și stilul tău..."
              className="input-field"
              rows={6}
            />
            <p className="text-sm text-gray-600 mt-1">
              Această biografie va fi vizibilă clienților
            </p>
          </div>
        </div>
      </Card>

      {/* SPECIALIZZAZIONI */}
      <Card titolo="Specializări" className="mt-6">
        <div className="space-y-4">
          {/* Lista specializzazioni */}
          {specializzazioni.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {specializzazioni.map((spec, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-primary-100 text-primary-800 px-3 py-2 rounded-full"
                >
                  <span>{spec}</span>
                  <button
                    onClick={() => handleRimuoviSpecializzazione(index)}
                    className="text-primary-600 hover:text-primary-800 font-bold"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Form nuova specializzazione */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1">
              <Input
                label="Adaugă Specializare"
                value={nuovaSpecializzazione}
                onChange={setNuovaSpecializzazione}
                placeholder="Ex: Tunsoare clasică, Barbă, Colorație"
              />
            </div>
            <div className="flex items-end">
              <Bottone onClick={handleAggiungiSpecializzazione} className="w-full sm:w-auto">
                Adaugă
              </Bottone>
            </div>
          </div>

          <div className="bg-blue-50 p-3 rounded">
            <p className="text-sm text-blue-800">
              💡 <strong>Sugestii:</strong> Tunsoare clasică, Tunsoare modernă, Barbă, 
              Bărbierit tradițional, Colorație, Tratamente păr, Styling
            </p>
          </div>
        </div>
      </Card>

      {/* STATISTICHE */}
      <Card titolo="Statistici" className="mt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          <div className="bg-gray-50 p-4 rounded">
            <p className="text-sm text-gray-600">Programări Totale</p>
            <p className="text-3xl font-bold text-primary-600">-</p>
            <p className="text-xs text-gray-500 mt-1">Disponibil în curând</p>
          </div>
          <div className="bg-gray-50 p-4 rounded">
            <p className="text-sm text-gray-600">Clienți Deserviți</p>
            <p className="text-3xl font-bold text-primary-600">-</p>
            <p className="text-xs text-gray-500 mt-1">Disponibil în curând</p>
          </div>
          <div className="bg-gray-50 p-4 rounded">
            <p className="text-sm text-gray-600">Evaluare Medie</p>
            <p className="text-3xl font-bold text-primary-600">-</p>
            <p className="text-xs text-gray-500 mt-1">Disponibil în curând</p>
          </div>
        </div>
      </Card>

      {/* BOTTONE SALVA */}
      <div className="mt-8">
        <Bottone
          onClick={handleSalva}
          disabled={salvando}
          className="w-full md:w-auto"
        >
          {salvando ? 'Salvare...' : 'Salvează Modificări'}
        </Bottone>
      </div>
    </div>
  );
}

