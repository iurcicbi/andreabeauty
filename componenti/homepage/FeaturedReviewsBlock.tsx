'use client';

import { useState, useEffect } from 'react';
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
  servizioId?: string;
};

export default function FeaturedReviewsBlock({ serviceId, limit = 4 }: { serviceId?: string; limit?: number }) {
  const [reviews, setReviews] = useState<TFeaturedReview[]>([]);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        let url = `/api/reviews?featured=true&limit=${limit}`;
        if (serviceId) url += `&serviceId=${serviceId}`;
        const res = await webservice.get(url);
        setReviews(res.dati || []);
      } catch {}
    };
    fetchFeatured();
  }, [serviceId, limit]);

  if (!reviews.length) return null;

  return (
    <div className="bg-gradient-to-r from-amber-50 via-white to-amber-50 border border-amber-100 rounded-xl p-6 my-8">
      <div className="flex items-center gap-2 mb-4">
        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
        <span className="text-sm font-semibold text-gray-700">Recenzii în evidență</span>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {reviews.map((r) => (
          <div key={r._id} className="flex items-start gap-3">
            <div className="flex flex-col items-center gap-0.5 mt-0.5 shrink-0">
              {r.avatar ? (
                <img src={r.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 text-xs font-bold">
                  {r.nomeCliente.charAt(0)}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">{r.nomeCliente}</span>
                {r.verified && <CheckCircle className="w-3 h-3 text-blue-500" />}
              </div>
              <div className="flex gap-0.5 my-0.5">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star key={i} className={`w-3.5 h-3.5 ${i < r.valutazione ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
                ))}
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">&ldquo;{r.descrizione}&rdquo;</p>
              {r.servizio && <p className="text-xs text-gray-400 mt-0.5">{r.servizio}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
