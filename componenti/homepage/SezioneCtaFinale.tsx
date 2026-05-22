'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import webservice from '@/utils/webservice';
import { Star, CheckCircle } from 'lucide-react';

type TFeaturedReview = {
  _id: string;
  nomeCliente: string;
  valutazione: number;
  descrizione: string;
  servizio: string;
  avatar?: string;
  verified?: boolean;
};

export default function SezioneCtaFinale({ config, bgIndex = 0 }: { config: any; bgIndex?: number }) {
  const [featuredReviews, setFeaturedReviews] = useState<TFeaturedReview[]>([]);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await webservice.get('/api/reviews?featured=true&limit=2');
        setFeaturedReviews(res.dati || []);
      } catch {}
    };
    fetchFeatured();
  }, []);

  const titolo = config.titolo || 'PRONTO PER IL TUO NUOVO LOOK?';
  const sottotitolo = config.sottotitolo || 'Prenota ora';
  const testoPulsante = config.testoPulsante || 'PRENOTA SUBITO';
  
  const colorePrimario = config.colorePrimario || '#FFF8F0';
  const coloreSecondario = config.coloreSecondario || '#F5EEE1';
  const bgColor = config.coloreSfondo || (bgIndex % 2 === 0 ? colorePrimario : coloreSecondario);

  return (
    <section className="py-20 md:py-32" style={{ backgroundColor: bgColor }}>
      <div className="container mx-auto px-4 text-center">
        {featuredReviews.length > 0 && (
          <div className="mb-10 max-w-2xl mx-auto">
            <div className="flex flex-wrap justify-center gap-6">
              {featuredReviews.map((r) => (
                <div key={r._id} className="flex items-center gap-3 bg-white/60 rounded-xl px-4 py-3 shadow-sm">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < r.valutazione ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <p className="text-sm text-gray-700 italic max-w-xs truncate">&ldquo;{r.descrizione}&rdquo;</p>
                  <div className="flex items-center gap-1 shrink-0">
                    {r.avatar && <img src={r.avatar} alt="" className="w-5 h-5 rounded-full object-cover" />}
                    <span className="text-xs font-medium text-gray-600">{r.nomeCliente}</span>
                    {r.verified && <CheckCircle className="w-3.5 h-3.5 text-blue-500" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <h2 className="text-3xl md:text-4xl mb-6 tracking-tight">{titolo}</h2>
        <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto">{sottotitolo}</p>
        <Link href="/booking" className="inline-block px-12 py-5 bg-white text-[#4A3035] text-lg hover:scale-105 transition-transform shadow-lg">
          {testoPulsante}
        </Link>
      </div>
    </section>
  );
}
