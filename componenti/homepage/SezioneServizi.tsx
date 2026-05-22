'use client';

import Link from 'next/link';
import { formattaPrezzo } from '@/utils/helpers';

interface Servizio {
  _id: string;
  nome: string;
  durata: number;
  prezzo: number;
  descrizione?: string;
  icona?: string;
  testoBottone?: string;
}

export default function SezioneServizi({
  servizi,
  config,
  bgIndex = 0,
}: {
  servizi: Servizio[];
  config: any;
  bgIndex?: number;
}) {
  const badge = config.badge || 'RITUALURILE NOASTRE';
  const titolo = config.titolo || 'Meniu Curat';
  const sottotitolo = config.sottotitolo || '';
  const descrizione = config.descrizione || '';
  const mostraPrezzi = config.mostraPrezziFrontend !== false && config.mostraPrezzi !== false;
  const mostraDurata = config.mostraDurata !== false;
  const stileCard = config.stileCard || 'classic';
  const layout = config.layoutGriglia || 'grid-3';

  // Colore di background alternato
  const colorePrimario = config.colorePrimario || '#FFF8F0';
  const coloreSecondario = config.coloreSecondario || '#F5EEE1';
  const bgColor = config.coloreSfondo || (bgIndex % 2 === 0 ? colorePrimario : coloreSecondario);

  const colClass = layout === 'grid-2' ? 'md:grid-cols-2' : layout === 'grid-4' ? 'md:grid-cols-4' : 'md:grid-cols-3';

  const getIcona = (tipo?: string) => {
    switch(tipo) {
      case 'brush':
        return (
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
          </svg>
        );
      case 'heart':
        return (
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"/>
          </svg>
        );
      case 'camera':
        return (
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"/>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"/>
          </svg>
        );
      case 'sparkles':
        return (
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"/>
          </svg>
        );
      case 'flower':
        return (
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971z"/>
          </svg>
        );
      case 'graduation':
        return (
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5"/>
          </svg>
        );
      default:
        return (
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
          </svg>
        );
    }
  };

  const renderCard = (servizio: Servizio, index: number) => {
    switch (stileCard) {
      case 'minimal':
        return (
          <div className={`p-6 flex items-center justify-between border-b border-[#d0c5ba]/30 last:border-b-0 md:border md:rounded-lg md:shadow-sm hover:shadow-md transition-shadow h-full bg-[#FFF8F0] md:bg-white`}>
            <div className="min-w-0 flex-1">
              <h3 className="text-xl text-[#1e1b14]" style={{ fontFamily: 'Playfair Display, serif' }}>{servizio.nome}</h3>
              {servizio.descrizione && (
                <p className="text-sm text-[#4d453e] mt-1 line-clamp-2">{servizio.descrizione}</p>
              )}
            </div>
            {mostraPrezzi && (
              <div className="text-lg text-[#6b5c4a] font-medium whitespace-nowrap ml-4 shrink-0">{formattaPrezzo(servizio.prezzo)}</div>
            )}
          </div>
        );

      case 'exploreaza':
        return (
          <Link
            href={`/servizi/${servizio._id}`}
            className={`group relative block overflow-hidden md:rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 h-full bg-[#FFF8F0] md:bg-white`}
          >
            <div className="p-8 flex flex-col h-full">
              <div className="text-[#6b5c4a] mb-6 group-hover:scale-110 transition-transform duration-300">
                {getIcona(servizio.icona)}
              </div>
              <h3 className="text-xl text-[#1e1b14] mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>{servizio.nome}</h3>
              <div className="flex-1">
                {servizio.descrizione && (
                  <p className="text-sm text-[#4d453e] leading-relaxed mb-6 line-clamp-3">{servizio.descrizione}</p>
                )}
              </div>
              <div className="flex items-center justify-between mt-auto">
                {mostraPrezzi && (
                  <span className="text-lg text-[#E0B2B7]">{formattaPrezzo(servizio.prezzo)}</span>
                )}
                <span className="text-xs tracking-[0.1em] uppercase text-[#6b5c4a] group-hover:text-[#E0B2B7] transition-colors border-b border-transparent group-hover:border-[#E0B2B7]">
                  {servizio.testoBottone || 'EXPLOREAZĂ'} →
                </span>
              </div>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-0.5 bg-[#E0B2B7] scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
          </Link>
        );

      default: // classic
        return (
          <div className={`p-8 md:rounded-lg md:shadow-sm hover:shadow-lg transition-shadow md:border md:border-transparent flex flex-col h-full bg-[#FFF8F0] md:bg-[#FFF8F0]`}>
            <div className="text-[#6b5c4a] mb-6">
              {getIcona(servizio.icona)}
            </div>
            <h3 className="text-xl text-[#1e1b14] mb-4 leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
              {servizio.nome}
            </h3>
            <div className="flex-1">
              {servizio.descrizione && (
                <p className="text-sm text-[#4d453e] mb-6 leading-relaxed">{servizio.descrizione}</p>
              )}
            </div>
            <div className="flex items-center justify-between mt-auto">
              {/* <Link
                href={`/servizi/${servizio._id}`}
                className="text-xs tracking-[0.1em] uppercase text-[#6b5c4a] font-semibold border-b border-[#6b5c4a] hover:text-[#534434] hover:border-[#534434] transition-colors"
              >
                {servizio.testoBottone || 'EXPLOREAZĂ'}
              </Link> */}
              {mostraPrezzi && (
                <span className="text-lg">{formattaPrezzo(servizio.prezzo)}</span>
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <section id="services" className="py-20 md:py-32" style={{ backgroundColor: bgColor }}>
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <div className="mb-4">
            <span className="text-xs tracking-[0.15em] uppercase text-[#7f756d] font-semibold">
              {badge}
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl text-[#1e1b14] mb-4" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 600, lineHeight: 1.1 }}>
            {titolo}
          </h2>
          {sottotitolo && (
            <p className="text-lg md:text-xl text-[#4d453e] mt-4">
              {sottotitolo}
            </p>
          )}
          {descrizione && (
            <p className="text-base text-[#4d453e] mt-4 max-w-2xl mx-auto">
              {descrizione}
            </p>
          )}
        </div>

        {servizi.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-[#7f756d]">
              Nessun servizio disponibile al momento
            </p>
          </div>
        ) : (
          <div className={`grid grid-cols-1 ${colClass} gap-4 md:gap-6 mx-auto auto-rows-fr`}>
            {servizi.map((servizio, index) => (
              <div key={servizio._id} className="h-full">
                {renderCard(servizio, index)}
              </div>
            ))}
          </div>
        )}
        </div>{/* max-w-7xl */}
      </div>
    </section>
  );
}
