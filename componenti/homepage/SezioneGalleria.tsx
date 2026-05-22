'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

export default function SezioneGalleria({ config, bgIndex = 0 }: { config: any; bgIndex?: number }) {
  const [selezionata, setSelezionata] = useState<number | null>(null);
  const [espansa, setEspansa] = useState(false);

  const badge = config.badge || 'ARHIVĂ VIZUALĂ';
  const titolo = config.titolo || 'Arta Tenului Impecabil';
  const sottotitolo = config.sottotitolo || '';
  const layout = config.layout || 'grid-custom';
  const immagini: { url: string; didascalia: string; alt: string }[] = config.immagini || [];
  const mostraPulsantePortfolio = config.mostraPulsantePortfolio !== false;
  const testoPulsantePortfolio = config.testoPulsantePortfolio || 'VEZI TOT PORTOFOLIUL';
  const testoNascondiPortfolio = config.testoNascondiPortfolio || 'ASCUNDE PORTOFOLIUL';

  if (!immagini.length) return null;

  // Colore di background alternato
  const colorePrimario = config.colorePrimario || '#FFF8F0';
  const coloreSecondario = config.coloreSecondario || '#F5EEE1';
  const bgColor = config.coloreSfondo || (bgIndex % 2 === 0 ? colorePrimario : coloreSecondario);

  const isCustom = layout === 'grid-custom' && immagini.length >= 5;
  const limiteIniziale = isCustom ? 5 : 6;

  const gridClass =
    layout === 'grid-2'
      ? 'md:grid-cols-2'
      : layout === 'grid-4'
        ? 'md:grid-cols-2 lg:grid-cols-4'
        : layout === 'masonry'
          ? 'masonry md:columns-3'
          : 'md:grid-cols-2 lg:grid-cols-3';

  return (
    <section id="gallery" className="py-20 md:py-32" style={{ backgroundColor: bgColor }}>
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">

        {/* Header - visibile solo su desktop */}
        <div className="hidden md:flex flex-row justify-between items-end mb-12 md:mb-16 gap-4">
          <div className="flex-1">
            <div className="mb-3">
              <span className="text-xs tracking-[0.15em] uppercase text-[#7f756d] font-semibold" style={{ fontFamily: 'Manrope, sans-serif' }}>
                {badge}
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl text-[#1e1b14] leading-tight" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 600, lineHeight: 1.1 }}>
              {titolo}
            </h2>
            {sottotitolo && (
              <p className="text-lg text-[#4d453e] mt-3" style={{ fontFamily: 'Manrope, sans-serif' }}>
                {sottotitolo}
              </p>
            )}
          </div>
          {mostraPulsantePortfolio && (
            <button
              onClick={() => setEspansa(!espansa)}
              className="shrink-0 px-8 py-3 border border-[#1e1b14] text-[#1e1b14] text-xs tracking-[0.1em] uppercase hover:bg-[#1e1b14] hover:text-white transition-all font-semibold whitespace-nowrap"
              style={{ fontFamily: 'Manrope, sans-serif' }}
            >
              {espansa ? testoNascondiPortfolio : testoPulsantePortfolio}
            </button>
          )}
        </div>

        {/* Galleria */}
        {isCustom ? (
          // Layout custom: immagine grande sinistra + griglia 2x2 destra, stessa altezza
          // Usiamo aspect-ratio sull'immagine grande e le piccole si adattano
          <div className="hidden md:flex gap-4" style={{ height: '780px' }}>
            {/* Immagine grande sinistra */}
            <button
              onClick={() => setSelezionata(0)}
              className="group relative overflow-hidden cursor-pointer flex-1"
            >
              <img
                src={immagini[0].url}
                alt={immagini[0].alt || immagini[0].didascalia || 'Gallery 1'}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {immagini[0].didascalia && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                  <p className="text-white text-sm" style={{ fontFamily: 'Manrope, sans-serif' }}>
                    {immagini[0].didascalia}
                  </p>
                </div>
              )}
            </button>

            {/* Griglia 2x2 destra: stessa altezza totale */}
            <div className="grid grid-cols-2 gap-4 flex-1">
              {immagini.slice(1, 5).map((img, i) => (
                <button
                  key={i + 1}
                  onClick={() => setSelezionata(i + 1)}
                  className="group relative overflow-hidden cursor-pointer"
                >
                  <img
                    src={img.url}
                    alt={img.alt || img.didascalia || `Gallery ${i + 2}`}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {img.didascalia && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                      <p className="text-white text-xs" style={{ fontFamily: 'Manrope, sans-serif' }}>
                        {img.didascalia}
                      </p>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className={`grid grid-cols-1 ${gridClass} gap-4 max-w-6xl mx-auto`}>
            {immagini.slice(0, espansa ? immagini.length : limiteIniziale).map((img, i) => (
              <button
                key={i}
                onClick={() => setSelezionata(i)}
                className="group relative overflow-hidden aspect-square cursor-pointer"
              >
                <img
                  src={img.url}
                  alt={img.alt || img.didascalia || `Gallery ${i + 1}`}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {img.didascalia && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <p className="text-white text-sm" style={{ fontFamily: 'Manrope, sans-serif' }}>
                      {img.didascalia}
                    </p>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Mobile: header con freccia + scroll orizzontale */}
        {isCustom && (
          <div className="md:hidden">
            {/* Header mobile */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="mb-2">
                  <span className="text-xs tracking-[0.15em] uppercase text-[#7f756d] font-semibold" style={{ fontFamily: 'Manrope, sans-serif' }}>
                    {badge}
                  </span>
                </div>
                <h2 className="text-3xl text-[#1e1b14] leading-tight" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 600 }}>
                  {titolo}
                </h2>
              </div>
              <span className="text-2xl text-[#1e1b14] mt-6">→</span>
            </div>

            {/* Scroll orizzontale immagini */}
            <div className="flex gap-3 overflow-x-auto scrollbar-hide" style={{ scrollSnapType: 'x mandatory' }}>
              {immagini.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelezionata(i)}
                  className="group relative overflow-hidden cursor-pointer shrink-0"
                  style={{ width: '75vw', aspectRatio: '3/4', scrollSnapAlign: 'start' }}
                >
                  <img
                    src={img.url}
                    alt={img.alt || img.didascalia || `Gallery ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Expanded images for custom layout */}
        {isCustom && espansa && immagini.length > 5 && (
          <div className="mt-4 grid grid-cols-3 gap-4">
            {immagini.slice(5).map((img, i) => (
              <button
                key={i + 5}
                onClick={() => setSelezionata(i + 5)}
                className="group relative overflow-hidden aspect-square cursor-pointer"
              >
                <img
                  src={img.url}
                  alt={img.alt || img.didascalia || `Gallery ${i + 6}`}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {img.didascalia && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <p className="text-white text-sm" style={{ fontFamily: 'Manrope, sans-serif' }}>
                      {img.didascalia}
                    </p>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
        </div>{/* max-w-7xl */}
      </div>

      {/* Lightbox */}
      {selezionata !== null && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4" onClick={() => setSelezionata(null)}>
          <button
            onClick={() => setSelezionata(null)}
            className="absolute top-6 right-6 text-white/80 hover:text-white z-10 transition-colors"
          >
            <X className="w-8 h-8" />
          </button>
          <div className="max-w-5xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <img
              src={immagini[selezionata].url}
              alt={immagini[selezionata].alt || immagini[selezionata].didascalia || ''}
              className="max-w-full max-h-[80vh] object-contain"
            />
            {immagini[selezionata].didascalia && (
              <p className="text-white/90 text-center mt-6 text-lg" style={{ fontFamily: 'Manrope, sans-serif' }}>
                {immagini[selezionata].didascalia}
              </p>
            )}
          </div>
          {immagini.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); setSelezionata((selezionata - 1 + immagini.length) % immagini.length); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white text-5xl transition-colors w-12 h-12 flex items-center justify-center"
              >
                ‹
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setSelezionata((selezionata + 1) % immagini.length); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white text-5xl transition-colors w-12 h-12 flex items-center justify-center"
              >
                ›
              </button>
            </>
          )}
        </div>
      )}
    </section>
  );
}
