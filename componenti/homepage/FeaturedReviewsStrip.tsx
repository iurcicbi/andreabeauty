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
};

export default function FeaturedReviewsStrip({ limit = 3 }: { limit?: number }) {
  const [reviews, setReviews] = useState<TFeaturedReview[]>([]);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await webservice.get(`/api/reviews?featured=true&limit=${limit}`);
        setReviews(res.dati || []);
      } catch {}
    };
    fetchFeatured();
  }, [limit]);

  if (!reviews.length) return null;

  return (
    <div className="bg-gradient-to-r from-amber-50 via-white to-amber-50 border-y border-amber-100">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
          {reviews.map((r) => (
            <div key={r._id} className="flex items-center gap-3">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star key={i} className={`w-3.5 h-3.5 ${i < r.valutazione ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
                ))}
              </div>
              <p className="text-sm text-gray-700 italic max-w-xs truncate">
                &ldquo;{r.descrizione}&rdquo;
              </p>
              <div className="flex items-center gap-1 shrink-0">
                {r.avatar && <img src={r.avatar} alt="" className="w-5 h-5 rounded-full object-cover" />}
                <span className="text-xs font-medium text-gray-600">{r.nomeCliente}</span>
                {r.verified && <CheckCircle className="w-3 h-3 text-blue-500" />}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
