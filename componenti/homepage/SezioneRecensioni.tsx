'use client';

import { useState, useEffect } from 'react';
import webservice from '@/utils/webservice';
import { Star, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import ImagePreview from '@/componenti/comuni/ImagePreview';

type TRecensione = {
  _id: string;
  nomeCliente: string;
  usernameInstagram?: string;
  avatar?: string;
  valutazione: number;
  descrizione: string;
  servizio: string;
  source: string;
  images: string[];
  verified: boolean;
  featured: boolean;
};

export default function SezioneRecensioni({ config, bgIndex = 0 }: { config: any; bgIndex?: number }) {
  const [reviews, setReviews] = useState<TRecensione[]>([]);
  const [carouselIdx, setCarouselIdx] = useState(0);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [previewIndex, setPreviewIndex] = useState(0);

  useEffect(() => { caricaRecensioni(); }, []);

  const caricaRecensioni = async () => {
    try {
      const max = config.numeroMassimo || 6;
      const featuredParam = config.arataInEvidenta ? '&featured=true' : '';
      const risposta = await webservice.get(`/api/reviews?limit=${max}${featuredParam}`);
      setReviews(risposta.dati || []);
    } catch {}
  };

  const openPreview = (images: string[], idx: number) => {
    if (!images.length) return;
    setPreviewImages(images);
    setPreviewIndex(idx);
  };

  const closePreview = () => { setPreviewImages([]); setPreviewIndex(0); };
  const prevImage = () => setPreviewIndex((i) => (i > 0 ? i - 1 : previewImages.length - 1));
  const nextImage = () => setPreviewIndex((i) => (i < previewImages.length - 1 ? i + 1 : 0));

  const preview = previewImages.length > 0 && (
    <ImagePreview images={previewImages} index={previewIndex} onClose={closePreview} onPrev={prevImage} onNext={nextImage} />
  );

  if (!reviews.length) return null;

  const badge = config.badge || 'EXPERIENȚE';
  const titolo = config.titolo || 'Perspective Comune asupra Eleganței';
  const mostraNome = config.mostraNome !== false;
  const mostraServizio = config.mostraServizio !== false;
  const mostraStelle = config.mostraStelle === true;
  const numeroColonne = config.numeroColonne || 2;
  const layout = config.layout || 'classic';
  const colorePrimario = config.colorePrimario || '#FFF8F0';
  const coloreSecondario = config.coloreSecondario || '#F5EEE1';
  const bgColor = config.coloreSfondo || (bgIndex % 2 === 0 ? colorePrimario : coloreSecondario);

  const reviewsVisibili = layout === 'carousel' ? reviews : reviews.slice(0, numeroColonne === 1 ? 1 : 4);

  const QuoteIcon = () => (
    <svg className="w-8 h-8 md:w-10 md:h-10 text-[#7f756d] mb-4" viewBox="0 0 48 48" fill="currentColor">
      <path d="M22 34v-12q0-2.5 1.125-4.675Q24.25 15.15 26.5 13.4 28.75 11.65 32 11v4.15q-2.85 1.35-4.425 3.375Q26 20.55 26 23h4v11Zm-14 0v-12q0-2.5 1.125-4.675Q10.25 15.15 12.5 13.4 14.75 11.65 18 11v4.15q-2.85 1.35-4.425 3.375Q12 20.55 12 23h4v11Z"/>
    </svg>
  );

  const renderClassicCard = (r: TRecensione, delay = 100) => (
    <div style={{ animationDelay: `${delay}ms` }} className="transition-all duration-500 flex flex-col justify-between h-full">
      {/* Parte alta: icona + citazione */}
      <div>
        <QuoteIcon />
        <p className="text-base md:text-lg font-light italic leading-relaxed mb-6 text-[#6B5C4A]">
          &ldquo;{r.descrizione}&rdquo;
        </p>
      </div>

      {/* Parte bassa fissa: nome — servizio in maiuscolo */}
      <div>
        <span
          className="text-xs tracking-[0.15em] uppercase font-semibold text-[#1e1b14] flex items-center gap-1.5"
          style={{ fontFamily: 'Manrope, sans-serif' }}
        >
          {mostraNome && `— ${r.nomeCliente}`}
          {mostraNome && mostraServizio && r.servizio && ', '}
          {mostraServizio && r.servizio}
          {r.verified && <CheckCircle className="w-3.5 h-3.5 text-blue-500 shrink-0" />}
        </span>
        {mostraStelle && <div className="flex gap-0.5 mt-3">{renderStars(r.valutazione)}</div>}
      </div>
    </div>
  );

  const renderSocialCard = (r: TRecensione) => (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
      {r.images.length > 0 && (
        <button type="button" onClick={() => openPreview(r.images, 0)} className="w-full p-0 border-0 bg-transparent cursor-pointer block">
          <div className="aspect-square overflow-hidden">
            <img src={r.images[0]} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
          </div>
        </button>
      )}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          {r.avatar ? (
            <img src={r.avatar} alt="" className="w-8 h-8 rounded-full object-cover ring-2 ring-gray-200" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-xs font-bold">
              {r.nomeCliente.charAt(0)}
            </div>
          )}
          <div>
            <p className="text-sm font-semibold">{r.nomeCliente}</p>
            {r.usernameInstagram && <p className="text-xs text-gray-400">@{r.usernameInstagram}</p>}
          </div>
          {r.verified && <CheckCircle className="w-4 h-4 text-blue-500 ml-auto" />}
        </div>
        {mostraStelle && <div className="flex gap-0.5 mb-2">{renderStars(r.valutazione)}</div>}
        <p className="text-sm text-gray-700 leading-relaxed">{r.descrizione}</p>
        <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
          <span>{r.source}</span>
          {r.servizio && <span>• {r.servizio}</span>}
        </div>
      </div>
    </div>
  );

  const renderStars = (n: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-3.5 h-3.5 ${i < n ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
    ));

  const renderWhatsAppBubble = (r: TRecensione) => (
    <div className="flex flex-col items-start">
      <div className="flex items-center gap-2 mb-1.5">
        {r.avatar ? (
          <img src={r.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-xs font-bold">
            {r.nomeCliente.charAt(0)}
          </div>
        )}
        <span className="text-sm font-semibold">{r.nomeCliente}</span>
        {r.verified && <CheckCircle className="w-3.5 h-3.5 text-blue-500" />}
      </div>
      <div className="bg-white rounded-2xl rounded-tl-sm shadow-sm border border-gray-100 p-4 max-w-md">
        {mostraStelle && <div className="flex gap-0.5 mb-1.5">{renderStars(r.valutazione)}</div>}
        <p className="text-sm text-gray-800 leading-relaxed">{r.descrizione}</p>
        {r.images.length > 0 && (
          <button type="button" onClick={() => openPreview(r.images, 0)} className="w-full p-0 border-0 bg-transparent cursor-pointer mt-2">
            <div className="rounded-xl overflow-hidden">
              <img src={r.images[0]} alt="" className="w-full max-h-48 object-cover hover:opacity-90 transition-opacity" />
            </div>
          </button>
        )}
      </div>
      <span className="text-[10px] text-gray-400 mt-1 ml-1">{r.source} • {r.servizio}</span>
    </div>
  );

  const renderStarsRow = (r: TRecensione) => (
    <div className="flex items-center gap-3 py-3 px-4 bg-white/60 rounded-xl border border-white/40">
      {r.images.length > 0 && (
        <button type="button" onClick={() => openPreview(r.images, 0)} className="p-0 border-0 bg-transparent cursor-pointer shrink-0">
          <img src={r.images[0]} alt="" className="w-12 h-12 rounded-lg object-cover border hover:opacity-80 transition-opacity" />
        </button>
      )}
      <div className="flex gap-0.5 shrink-0">
        {Array.from({ length: 5 }, (_, i) => (
          <Star key={i} className={`w-3.5 h-3.5 ${i < r.valutazione ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
        ))}
      </div>
      <p className="text-sm text-gray-700 italic flex-1 min-w-0 truncate">&ldquo;{r.descrizione}&rdquo;</p>
      <span className="text-xs text-gray-500 font-medium shrink-0 flex items-center gap-1">— {r.nomeCliente}{r.verified && <CheckCircle className="w-3 h-3 text-blue-500" />}</span>
    </div>
  );

  const sezione = (content: React.ReactNode) => (
    <>
      <section
        id="reviews"
        className="py-20 md:py-32"
        style={{ backgroundColor: bgColor }}
      >
        {content}
      </section>
      {preview}
    </>
  );

  if (layout === 'carousel') {
    return sezione(
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs tracking-[0.15em] uppercase text-[#7f756d] font-semibold block mb-4">{badge}</span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl text-[#1e1b14] leading-tight" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 600, lineHeight: 1.1 }}>{titolo}</h2>
        </div>
        <div className="relative max-w-2xl mx-auto">
          <div className="overflow-hidden">
            <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${carouselIdx * 100}%)` }}>
              {reviewsVisibili.map((r, i) => (
                <div key={i} className="min-w-full px-4">{renderSocialCard(r)}</div>
              ))}
            </div>
          </div>
          {reviewsVisibili.length > 1 && (
            <div className="flex justify-center gap-3 mt-6">
              <button onClick={() => setCarouselIdx(Math.max(0, carouselIdx - 1))} disabled={carouselIdx === 0} className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center disabled:opacity-30 hover:shadow-md transition-shadow">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={() => setCarouselIdx(Math.min(reviewsVisibili.length - 1, carouselIdx + 1))} disabled={carouselIdx === reviewsVisibili.length - 1} className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center disabled:opacity-30 hover:shadow-md transition-shadow">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
          <div className="flex justify-center gap-2 mt-4">
            {reviewsVisibili.map((_, i) => (
              <button key={i} onClick={() => setCarouselIdx(i)} className={`w-2 h-2 rounded-full transition-all ${i === carouselIdx ? 'bg-[#1e1b14] w-6' : 'bg-gray-300'}`} />
            ))}
          </div>
        </div>
        </div>{/* max-w-7xl */}
      </div>
    );
  }

  if (layout === 'social') {
    return sezione(
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs tracking-[0.15em] uppercase text-[#7f756d] font-semibold block mb-4">{badge}</span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl text-[#1e1b14] leading-tight" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 600, lineHeight: 1.1 }}>{titolo}</h2>
        </div>
        <div className={`grid grid-cols-1 ${numeroColonne === 2 ? 'md:grid-cols-2 lg:grid-cols-3' : 'md:grid-cols-2'} gap-6 max-w-5xl mx-auto`}>
          {reviewsVisibili.map((r, i) => <div key={i}>{renderSocialCard(r)}</div>)}
        </div>
        </div>{/* max-w-7xl */}
      </div>
    );
  }

  if (layout === 'whatsapp') {
    return sezione(
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs tracking-[0.15em] uppercase text-[#7f756d] font-semibold block mb-4">{badge}</span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl text-[#1e1b14] leading-tight" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 600, lineHeight: 1.1 }}>{titolo}</h2>
        </div>
        <div className="max-w-xl mx-auto space-y-6">
          {reviewsVisibili.map((r, i) => <div key={i}>{renderWhatsAppBubble(r)}</div>)}
        </div>
        </div>{/* max-w-7xl */}
      </div>
    );
  }

  if (layout === 'compact') {
    return sezione(
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <span className="text-xs tracking-[0.15em] uppercase text-[#7f756d] font-semibold block mb-4">{badge}</span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl text-[#1e1b14] leading-tight" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 600, lineHeight: 1.1 }}>{titolo}</h2>
        </div>
        <div className="max-w-3xl mx-auto space-y-3">
          {reviewsVisibili.map((r, i) => <div key={i}>{renderStarsRow(r)}</div>)}
        </div>
        </div>{/* max-w-7xl */}
      </div>
    );
  }

  // Default: classic — matches the provided design
  return sezione(
    <div className="container mx-auto px-4">
      <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row gap-8 md:gap-16">
        <div className="md:w-1/3">
          <span className="text-[11px] tracking-[0.15em] uppercase text-[#7f756d] font-semibold block mb-4">{badge}</span>
          <h2 className="text-4xl md:text-5xl text-[#1e1b14]  leading-tight" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 600, lineHeight: 1.1 }}>{titolo}</h2>
        </div>
        <div className="md:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 auto-rows-fr">
          {reviewsVisibili.map((r, i) => (
            <div key={i} className="h-full">{renderClassicCard(r, i * 100 + 100)}</div>
          ))}
        </div>
      </div>
      </div>{/* max-w-7xl */}
    </div>
  );
}
