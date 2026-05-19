'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import webservice from '@/utils/webservice';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [caricamento, setCaricamento] = useState(false);
  const [errore, setErrore] = useState('');
  const [mostraPassword, setMostraPassword] = useState(false);
  const [animato, setAnimato] = useState(false);

  useEffect(() => {
    setAnimato(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrore('Introdu email și parola');
      return;
    }
    try {
      setCaricamento(true);
      setErrore('');
      const risposta = await webservice.post('/api/auth/login', { email, password });
      if (risposta.successo) {
        localStorage.setItem('token', risposta.dati.token);
        localStorage.setItem('utente', JSON.stringify(risposta.dati.utente));
        if (['admin', 'specialist', 'barber'].includes(risposta.dati.utente.ruolo)) {
          router.push('/cms/dashboard');
        } else {
          router.push('/booking');
        }
      } else {
        setErrore(risposta.errore || 'Email sau parolă incorectă');
      }
    } catch {
      setErrore('Email sau parolă incorectă');
    } finally {
      setCaricamento(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf7f2] relative overflow-hidden flex items-center justify-center px-4">
      {/* Decorative top-right corner */}
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#e8dccc] rounded-full blur-3xl opacity-40" />
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#e8dccc] rounded-full blur-3xl opacity-30" />
      <div className="absolute top-1/3 left-1/4 w-2 h-2 bg-[#c9a96e] rounded-full opacity-30" />
      <div className="absolute top-1/4 right-1/3 w-1.5 h-1.5 bg-[#c9a96e] rounded-full opacity-20" />
      <div className="absolute bottom-1/3 right-1/4 w-3 h-3 bg-[#c9a96e] rounded-full opacity-20" />

      <div className={`w-full max-w-md relative transition-all duration-700 ${animato ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        {/* Brand */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/80 backdrop-blur-sm rounded-full mb-6 shadow-sm border border-[#e8dccc]">
            <svg className="w-9 h-9 text-[#c9a96e]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
              <path d="M12 8v8M8 12h8"/>
            </svg>
          </div>
          <h1 className="text-3xl font-light text-[#4a4a4a] tracking-[0.15em] uppercase">Beauty Salon</h1>
          <p className="text-[#8a8a7a] mt-2 text-sm tracking-wide">Acces în contul tău</p>
        </div>

        {/* Login Card */}
        <div className="relative bg-white/70 backdrop-blur-xl border border-[#e8dccc]/60 rounded-2xl p-8 shadow-lg shadow-[#c9a96e]/5">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/60 to-transparent pointer-events-none" />

          {errore && (
            <div className="relative mb-6 flex items-center gap-3 px-4 py-3 bg-[#f5e6e0] border border-[#d4a89a]/40 rounded-xl text-sm text-[#8a4a3a]">
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span className="flex-1">{errore}</span>
              <button onClick={() => setErrore('')} className="text-[#8a4a3a]/50 hover:text-[#8a4a3a]">×</button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="relative space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#6a6a5a] mb-1.5 tracking-wide">Email</label>
              <div className="relative">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#c9a96e]/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nume@exemplu.com"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white/80 border border-[#e0d8c8] rounded-xl text-[#4a4a4a] placeholder-[#c9a96e]/40 focus:outline-none focus:border-[#c9a96e] focus:ring-1 focus:ring-[#c9a96e]/20 transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#6a6a5a] mb-1.5 tracking-wide">Parolă</label>
              <div className="relative">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#c9a96e]/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input
                  type={mostraPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-12 py-3 bg-white/80 border border-[#e0d8c8] rounded-xl text-[#4a4a4a] placeholder-[#c9a96e]/40 focus:outline-none focus:border-[#c9a96e] focus:ring-1 focus:ring-[#c9a96e]/20 transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setMostraPassword(!mostraPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#c9a96e]/50 hover:text-[#c9a96e] transition-colors"
                >
                  {mostraPassword ? (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={caricamento}
              className="w-full py-3.5 bg-[#c9a96e] text-white font-medium tracking-wider rounded-xl hover:bg-[#b8975a] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2 shadow-sm"
            >
              {caricamento ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Se încarcă...
                </>
              ) : (
                'Intră în cont'
              )}
            </button>
          </form>

          <div className="relative mt-8 text-center">
            <p className="text-[#8a8a7a] text-sm">
              Nu ai cont?{' '}
              <Link href="/register" className="text-[#c9a96e] hover:text-[#b8975a] font-medium transition-colors">
                Creează unul
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="inline-flex items-center gap-1.5 text-[#8a8a7a] hover:text-[#c9a96e] transition-colors text-sm">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
            Înapoi la homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
