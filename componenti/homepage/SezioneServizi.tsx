'use client';

import Link from 'next/link';
import { formattaPrezzo } from '@/utils/helpers';

interface Servizio {
  _id: string;
  nome: string;
  durata: number;
  prezzo: number;
  descrizione?: string;
}

export default function SezioneServizi({
  servizi,
  config,
}: {
  servizi: Servizio[];
  config: any;
}) {
  const titolo = config.titolo || 'I NOSTRI SERVIZI';
  const sottotitolo = config.sottotitolo || 'Qualità e professionalità';
  const descrizione = config.descrizione || '';
  const mostraPrezzi = config.mostraPrezzi !== false;
  const mostraDurata = config.mostraDurata !== false;
  const layoutGriglia = config.layoutGriglia || 'grid-3';

  const gridClass =
    layoutGriglia === 'grid-2'
      ? 'md:grid-cols-2'
      : layoutGriglia === 'grid-4'
        ? 'md:grid-cols-2 lg:grid-cols-4'
        : 'md:grid-cols-2 lg:grid-cols-3';

  return (
    <section id="services" className="py-20 md:py-32 bg-white text-black">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">{titolo}</h2>
          <p className="text-xl text-black/60">{sottotitolo}</p>
          {descrizione && <p className="text-lg text-black/50 mt-4 max-w-2xl mx-auto">{descrizione}</p>}
        </div>
        {servizi.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-black/60">Nessun servizio disponibile al momento</p>
          </div>
        ) : (
          <div className={`grid grid-cols-1 ${gridClass} gap-8 max-w-6xl mx-auto`}>
            {servizi.map((servizio) => (
              <div key={servizio._id} className="group relative overflow-hidden bg-black text-white p-8 hover:scale-105 transition-transform">
                <svg className="w-16 h-16 mb-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                </svg>
                <h3 className="text-2xl font-bold mb-4 uppercase">{servizio.nome}</h3>
                {servizio.descrizione && <p className="text-white/70 mb-6">{servizio.descrizione}</p>}
                <div className="flex items-center justify-between mb-6">
                  {mostraDurata && (
                    <div className="flex items-center gap-2 text-white/70">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                      </svg>
                      <span>{servizio.durata} min</span>
                    </div>
                  )}
                  {mostraPrezzi && <div className="text-2xl font-bold">{formattaPrezzo(servizio.prezzo)}</div>}
                </div>
                <div className="h-1 w-20 bg-white"></div>
              </div>
            ))}
          </div>
        )}
        <div className="text-center mt-12">
          <Link href="/booking" className="inline-block px-8 py-4 bg-black text-white font-bold text-lg hover:bg-black/90 transition-all">
            PRENOTA ORA →
          </Link>
        </div>
      </div>
    </section>
  );
}
