'use client';

import { useState, useEffect } from 'react';
import webservice from '@/utils/webservice';
import Card from '@/componenti/interfaccia/Card';
import Bottone from '@/componenti/interfaccia/Bottone';
import Input from '@/componenti/interfaccia/Input';
import Messaggio from '@/componenti/comuni/Messaggio';
import Caricamento from '@/componenti/comuni/Caricamento';
import { Save } from 'lucide-react';

export default function ProfiloPage() {
  const [ruolo, setRuolo] = useState<string>('');
  const [caricamento, setCaricamento] = useState(true);
  const [errore, setErrore] = useState('');
  const [successo, setSuccesso] = useState('');

  // Admin fields
  const [nome, setNome] = useState('');
  const [cognome, setCognome] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');

  // Specialist fields
  const [profilo, setProfilo] = useState<any>(null);
  const [biografia, setBiografia] = useState('');
  const [specializzazioni, setSpecializzazioni] = useState<string[]>([]);
  const [nuovaSpecializzazione, setNuovaSpecializzazione] = useState('');

  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    const utenteStr = localStorage.getItem('utente');
    if (utenteStr) {
      try {
        const utente = JSON.parse(utenteStr);
        setRuolo(utente.ruolo || '');
      } catch {}
    }
    incarcaProfilo();
  }, []);

  const incarcaProfilo = async () => {
    try {
      setCaricamento(true);
      const utenteStr = localStorage.getItem('utente');
      if (!utenteStr) return;
      const utente = JSON.parse(utenteStr);

      if (utente.ruolo === 'admin') {
        setNome(utente.nome || '');
        setCognome(utente.cognome || '');
        setEmail(utente.email || '');
        setTelefono(utente.telefono || '');
      } else {
        const risposta = await webservice.get('/api/specialist/profile?includeUtente=true');
        setProfilo(risposta.dati);
        setNome(risposta.dati.utente.nome);
        setCognome(risposta.dati.utente.cognome);
        setEmail(risposta.dati.utente.email);
        setTelefono(risposta.dati.telefono || '');
        setBiografia(risposta.dati.biografia || '');
        setSpecializzazioni(risposta.dati.specializzazioni || []);
      }
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
      setSuccesso('');

      const utenteStr = localStorage.getItem('utente');
      if (!utenteStr) return;
      const utente = JSON.parse(utenteStr);

      if (utente.ruolo === 'admin') {
        const data: any = { nome, cognome, email, telefono };
        if (password) data.password = password;
        await webservice.put(`/api/users/manage/${utente.id || utente._id}`, data);
        const utenteAggiornato = { ...utente, nome, cognome, email, telefono };
        localStorage.setItem('utente', JSON.stringify(utenteAggiornato));
      } else {
        await webservice.put('/api/specialist/profile', {
          biografia, specializzazioni, telefono,
        });
      }

      setSuccesso('Profil actualizat cu succes!');
      setPassword('');
    } catch (err: any) {
      setErrore(err.response?.data?.errore || 'Erroare la salvare');
    } finally {
      setSalvando(false);
    }
  };

  const ruoloColori: Record<string, string> = {
    admin: 'bg-purple-100 text-purple-800',
    specialist: 'bg-blue-100 text-blue-800',
    utente: 'bg-gray-100 text-gray-800',
  };
  const ruoloLabel: Record<string, string> = {
    admin: 'Admin',
    specialist: 'Specialist',
    utente: 'Utilizator',
  };

  if (caricamento) return <Caricamento />;

  return (
    <div className="container mx-auto px-3 md:px-4 pb-24 md:pb-0 py-4 md:py-8">
      <div className="flex items-center gap-4 mb-4 md:mb-8">
        <h1 className="text-2xl md:text-4xl font-bold">Profilul Meu</h1>
        {ruolo && (
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${ruoloColori[ruolo] || 'bg-gray-100 text-gray-800'}`}>
            {ruoloLabel[ruolo] || ruolo}
          </span>
        )}
      </div>

      {errore && <Messaggio tipo="errore" messaggio={errore} onChiudi={() => setErrore('')} />}
      {successo && <Messaggio tipo="successo" messaggio={successo} onChiudi={() => setSuccesso('')} />}

      {/* Account Info */}
      <Card titolo="Informații Cont">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Nume" value={nome} onChange={setNome} />
            <Input label="Prenume" value={cognome} onChange={setCognome} />
          </div>
          <Input label="Email" type="email" value={email} onChange={setEmail} />
          <Input label="Telefon" type="tel" value={telefono} onChange={setTelefono} />
          <Input
            label="Parolă nouă (lasă gol pentru a păstra cea actuală)"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="Parolă nouă"
          />
        </div>
      </Card>

      {/* Specialist-only sections */}
      {ruolo !== 'admin' && (
        <>
          {/* Professional Info */}
          <Card titolo="Informații Profesionale" className="mt-6">
            <div className="space-y-4">
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

          {/* Specializations */}
          <Card titolo="Specializări" className="mt-6">
            <div className="space-y-4">
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

          {/* Statistics */}
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
        </>
      )}

      {/* Save Button */}
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
