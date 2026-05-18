'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import webservice from '@/utils/webservice';
import Bottone from '@/componenti/interfaccia/Bottone';
import Messaggio from '@/componenti/comuni/Messaggio';
import Caricamento from '@/componenti/comuni/Caricamento';
import { Star, CheckCircle } from 'lucide-react';

function ContenutoReview() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [errore, setErrore] = useState('');
  const [successo, setSuccesso] = useState('');
  const [validando, setValidando] = useState(true);
  const [invalid, setInvalid] = useState(false);

  useEffect(() => {
    if (!token) {
      setInvalid(true);
      setValidando(false);
      return;
    }
    setValidando(false);
  }, [token]);

  const handleSubmit = async () => {
    if (rating === 0) {
      setErrore('Vă rugăm să selectați o evaluare');
      return;
    }
    if (!comment.trim()) {
      setErrore('Vă rugăm să scrieți un comentariu');
      return;
    }

    try {
      setSalvando(true);
      setErrore('');

      await webservice.post('/api/reviews', {
        token,
        rating,
        comment: comment.trim(),
      });

      setSuccesso('Mulțumim pentru recenzie!');
      setTimeout(() => router.push('/'), 3000);
    } catch (err: any) {
      setErrore(err.response?.data?.errore || 'Eroare la trimiterea recenziei');
    } finally {
      setSalvando(false);
    }
  };

  if (validando) return <Caricamento />;

  if (invalid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Link invalid</h1>
          <p className="text-gray-600 mb-6">Acest link de recenzie nu este valid sau a expirat.</p>
          <Bottone onClick={() => router.push('/')}>Mergi la pagina principală</Bottone>
        </div>
      </div>
    );
  }

  if (successo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">{successo}</h1>
          <p className="text-gray-600">Veți fi redirecționat în scurt timp...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Evaluați experiența dvs.</h1>
          <p className="text-gray-600">Spuneți-ne cum a fost serviciul</p>
        </div>

        {errore && <Messaggio tipo="errore" messaggio={errore} onChiudi={() => setErrore('')} />}

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Evaluare</label>
          <div className="flex items-center gap-1 justify-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
                className="p-1 transition-colors"
              >
                <Star
                  className={`w-10 h-10 ${
                    (hover || rating) >= star
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Comentariu</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Descrieți experiența dvs..."
            className="input-field w-full"
            rows={5}
            maxLength={1000}
          />
          <p className="text-xs text-gray-400 mt-1">{comment.length}/1000</p>
        </div>

        <Bottone onClick={handleSubmit} disabled={salvando} className="w-full">
          {salvando ? 'Se trimite...' : 'Trimite recenzia'}
        </Bottone>
      </div>
    </div>
  );
}

export default function ReviewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>}>
      <ContenutoReview />
    </Suspense>
  );
}
