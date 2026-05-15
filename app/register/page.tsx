/**
 * PAGINA: REGISTRAZIONE
 * 
 * Permette agli utenti di creare un nuovo account.
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import webservice from '@/utils/webservice';
import Card from '@/componenti/interfaccia/Card';
import Bottone from '@/componenti/interfaccia/Bottone';
import Input from '@/componenti/interfaccia/Input';
import Messaggio from '@/componenti/comuni/Messaggio';

export default function RegistrazionePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nome: '',
    cognome: '',
    email: '',
    password: '',
    confermaPassword: '',
    telefono: '',
  });
  const [caricamento, setCaricamento] = useState(false);
  const [errore, setErrore] = useState('');

  const handleChange = (campo: string, valore: string) => {
    setFormData(prev => ({ ...prev, [campo]: valore }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validazioni
    if (formData.password !== formData.confermaPassword) {
      setErrore('Le password non coincidono');
      return;
    }

    if (formData.password.length < 6) {
      setErrore('La password deve avere almeno 6 caratteri');
      return;
    }

    try {
      setCaricamento(true);
      setErrore('');

      const risposta = await webservice.post('/api/auth/register', {
        nome: formData.nome,
        cognome: formData.cognome,
        email: formData.email,
        password: formData.password,
        telefono: formData.telefono,
      });

      if (risposta.successo) {
        // Salva token e dati utente
        localStorage.setItem('token', risposta.dati.token);
        localStorage.setItem('utente', JSON.stringify(risposta.dati.utente));

        // Redirect alla prenotazione
        router.push('/booking');
      } else {
        setErrore(risposta.errore || 'Errore durante la registrazione');
      }
    } catch (err: any) {
      const messaggio = err.response?.data?.errore || 'Errore durante la registrazione';
      setErrore(messaggio);
    } finally {
      setCaricamento(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Beauty Salon</h1>
          <p className="text-gray-400">Crea il tuo account</p>
        </div>

        <Card>
          {errore && (
            <Messaggio tipo="errore" messaggio={errore} onChiudi={() => setErrore('')} />
          )}

          <form onSubmit={handleSubmit}>
            <Input
              label="Nome"
              type="text"
              value={formData.nome}
              onChange={(v) => handleChange('nome', v)}
              placeholder="Mario"
              required
            />

            <Input
              label="Cognome"
              type="text"
              value={formData.cognome}
              onChange={(v) => handleChange('cognome', v)}
              placeholder="Rossi"
              required
            />

            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(v) => handleChange('email', v)}
              placeholder="tua@email.com"
              required
            />

            <Input
              label="Telefono"
              type="tel"
              value={formData.telefono}
              onChange={(v) => handleChange('telefono', v)}
              placeholder="1234567890"
              required
            />

            <Input
              label="Password"
              type="password"
              value={formData.password}
              onChange={(v) => handleChange('password', v)}
              placeholder="••••••••"
              required
            />

            <Input
              label="Conferma Password"
              type="password"
              value={formData.confermaPassword}
              onChange={(v) => handleChange('confermaPassword', v)}
              placeholder="••••••••"
              required
            />

            <Bottone
              type="submit"
              disabled={caricamento}
              className="w-full"
            >
              {caricamento ? 'Registrazione in corso...' : 'Registrati'}
            </Bottone>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Hai già un account?{' '}
              <Link href="/login" className="text-primary-600 hover:text-primary-700 font-semibold">
                Accedi
              </Link>
            </p>
          </div>
        </Card>

        <div className="mt-6 text-center">
          <Link href="/" className="text-gray-400 hover:text-white transition-colors">
            ← Torna alla home
          </Link>
        </div>
      </div>
    </div>
  );
}
