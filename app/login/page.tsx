/**
 * PAGINA: LOGIN
 * 
 * Permette agli utenti di effettuare il login.
 * Dopo il login, reindirizza alla dashboard appropriata.
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

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [caricamento, setCaricamento] = useState(false);
  const [errore, setErrore] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setErrore('Inserisci email e password');
      return;
    }

    try {
      setCaricamento(true);
      setErrore('');

      const risposta = await webservice.post('/api/autenticazione/login', {
        email,
        password,
      });

      if (risposta.successo) {
        // Salva token e dati utente
        localStorage.setItem('token', risposta.dati.token);
        localStorage.setItem('utente', JSON.stringify(risposta.dati.utente));

        // Redirect in base al ruolo
        if (risposta.dati.utente.ruolo === 'barber') {
          router.push('/cms/cruscotto');
        } else {
          router.push('/prenotazione');
        }
      } else {
        setErrore(risposta.errore || 'Errore durante il login');
      }
    } catch (err: any) {
      const messaggio = err.response?.data?.errore || 'Errore durante il login';
      setErrore(messaggio);
    } finally {
      setCaricamento(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Barber Shop</h1>
          <p className="text-gray-400">Accedi al tuo account</p>
        </div>

        <Card>
          {errore && (
            <Messaggio tipo="errore" messaggio={errore} onChiudi={() => setErrore('')} />
          )}

          <form onSubmit={handleSubmit}>
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="tua@email.com"
              required
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="••••••••"
              required
            />

            <Bottone
              type="submit"
              disabled={caricamento}
              className="w-full"
            >
              {caricamento ? 'Accesso in corso...' : 'Accedi'}
            </Bottone>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Non hai un account?{' '}
              <Link href="/registrazione" className="text-primary-600 hover:text-primary-700 font-semibold">
                Registrati
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
