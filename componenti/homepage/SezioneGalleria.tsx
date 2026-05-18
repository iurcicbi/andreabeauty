'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

export default function SezioneGalleria({ config }: { config: any }) {
  const [selezionata, setSelezionata] = useState<number | null>(null);

  const titolo = config.titolo || 'GALLERIA';
  const sottotitolo = config.sottotitolo || 'I nostri lavori';
  const layout = config.layout || 'grid-3';
  const immagini: { url: string; didascalia: string; alt: string }[] = config.immagini || [];

  if (!immagini.length) return null;

  const gridClass =
    layout === 'grid-2'
      ? 'md:grid-cols-2'
      : layout === 'grid-4'
        ? 'md:grid-cols-2 lg:grid-cols-4'
        : layout === 'masonry'
          ? 'masonry md:columns-3'
          : 'md:grid-cols-2 lg:grid-cols-3';

  return (
    <section id="gallery" className="py-20 md:py-32 bg-black text-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">{titolo}</h2>
          <p className="text-xl text-white/60">{sottotitolo}</p>
        </div>

        <div className={`grid grid-cols-1 ${gridClass} gap-4 max-w-6xl mx-auto`}>
          {immagini.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelezionata(i)}
              className="group relative overflow-hidden aspect-square cursor-pointer"
            >
              <img
                src={img.url}
                alt={img.alt || img.didascalia || `Gallery ${i + 1}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              {img.didascalia && (
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all flex items-end p-4">
                  <p className="text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    {img.didascalia}
                  </p>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {selezionata !== null && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4" onClick={() => setSelezionata(null)}>
          <button
            onClick={() => setSelezionata(null)}
            className="absolute top-6 right-6 text-white/80 hover:text-white z-10"
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
              <p className="text-white/80 text-center mt-4">{immagini[selezionata].didascalia}</p>
            )}
          </div>
          {immagini.length > 1 && (
            <>
              <button
                onClick={() => setSelezionata((selezionata - 1 + immagini.length) % immagini.length)}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white text-4xl"
              >
                ‹
              </button>
              <button
                onClick={() => setSelezionata((selezionata + 1) % immagini.length)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white text-4xl"
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
