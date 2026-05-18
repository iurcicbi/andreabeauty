'use client';

import { useState, useEffect } from 'react';
import webservice from '@/utils/webservice';

export default function SezioneRecensioni({ config }: { config: any }) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [indice, setIndice] = useState(0);

  useEffect(() => {
    caricaRecensioni();
  }, []);

  const caricaRecensioni = async () => {
    try {
      const max = config.numeroMassimo || 6;
      const risposta = await webservice.get(`/api/reviews?limit=${max}`);
      setReviews(risposta.dati || []);
    } catch {}
  };

  if (!reviews.length) return null;

  const titolo = config.titolo || 'Cosa dicono i nostri clienti';
  const sottotitolo = config.sottotitolo || 'Le tue opinioni contano';

  const current = reviews[indice];

  return (
    <section id="reviews" className="py-20 md:py-32 bg-white text-black">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">{titolo}</h2>
          <p className="text-xl text-black/60 mb-16">{sottotitolo}</p>

          {current && (
            <div className="relative">
              <svg className="w-16 h-16 mx-auto mb-8 text-black/10" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11 3H5.52c-.26 0-.52.1-.71.29a1 1 0 0 0-.29.71V11a1 1 0 0 0 1 1h4.48a1 1 0 0 0 1-1V7.41a1 1 0 0 0-1-1h-2.5c.21-1.2 1.03-2.07 2.5-2.41V3zm10 0h-5.52c-.26 0-.52.1-.71.29a1 1 0 0 0-.29.71V11a1 1 0 0 0 1 1h4.48a1 1 0 0 0 1-1V7.41a1 1 0 0 0-1-1h-2.5c.21-1.2 1.03-2.07 2.5-2.41V3z"/>
              </svg>
              <p className="text-2xl text-black/80 italic leading-relaxed mb-8">
                &ldquo;{current.descrizione}&rdquo;
              </p>
              <div className="flex items-center justify-center gap-4">
                <div className="flex">
                  {Array.from({ length: current.valutazione || 5 }).map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  ))}
                </div>
                <span className="text-black/60 font-medium">
                  — {current.nomeCliente || current.cliente}
                </span>
              </div>
            </div>
          )}

          {reviews.length > 1 && (
            <div className="flex justify-center gap-2 mt-12">
              {reviews.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndice(i)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    i === indice ? 'bg-black scale-125' : 'bg-black/20'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
