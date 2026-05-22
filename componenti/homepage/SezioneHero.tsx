'use client';

import Link from 'next/link';

interface SezioneHeroProps {
  impostazioni: any;
  sezioneConfig?: any;
  bgIndex?: number;
}

export default function SezioneHero({ impostazioni, sezioneConfig, bgIndex = 0 }: SezioneHeroProps) {
  const config = sezioneConfig || {};
  
  // Colore di background alternato (solo se non c'è immagine di sfondo)
  const colorePrimario = sezioneConfig?.colorePrimario || '#FFF8F0';
  const coloreSecondario = sezioneConfig?.coloreSecondario || '#F5EEE1';
  const bgColor = sezioneConfig?.coloreSfondo || (bgIndex % 2 === 0 ? colorePrimario : coloreSecondario);
  
  const titolo = config.titolo || impostazioni?.testiHomepage?.titoloHero || impostazioni?.nomeAzienda || 'BEAUTY SALON';
  const sottotitolo = config.sottotitolo || impostazioni?.testiHomepage?.sottotitoloHero || impostazioni?.tagline || '';
  const badge = config.badge || impostazioni?.testiHomepage?.badgeHero || 'Premium Beauty Salon';
  const ctaPrimario = config.testoCtaPrimario || impostazioni?.testiHomepage?.testoCtaPrimario || 'PRENOTA APPUNTAMENTO';
  const ctaSecondario = config.testoCtaSecondario || impostazioni?.testiHomepage?.testoCtaSecondario || 'DOVE SIAMO';
  const mostraLogo = config.mostraLogo !== false;
  const mostraInfoRapide = config.mostraInfoRapide !== false;
  const backgroundImage = config.immagineBackground;
  const urlCtaPrimario = config.urlCtaPrimario || '/booking';
  const urlCtaSecondario = config.urlCtaSecondario || '#contact';

  return (
    <section 
      id="home" 
      className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden"
    >
      <style>{`
        .hero-bg-img {
          object-fit: cover;
          object-position: 85% 15%;
        }
        @media (min-width: 768px) {
          .hero-bg-img {
            object-position: 50% 50%;
          }
        }
      `}</style>
      {backgroundImage ? (
        <div className="absolute inset-0">
          <img
            src={backgroundImage}
            alt=""
            className="hero-bg-img w-full h-full"
          />
          {/* Overlay desktop: leggero */}
          <div className="hidden md:block absolute inset-0 bg-black/5" />
          {/* Sfumatura mobile: dal basso verso l'alto, dal colore bgColor a trasparente */}
          <div
            className="md:hidden absolute inset-0"
            style={{
              background: `linear-gradient(to top, ${bgColor} 40%, ${bgColor}cc 55%, ${bgColor}66 70%, transparent 100%)`
            }}
          />
        </div>
      ) : (
        <>
          <div className="absolute inset-0" style={{ backgroundColor: bgColor }} />
          <div className="absolute inset-0 opacity-[0.04]">
            <div className="absolute inset-0" style={{
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #4A3035 2px, #4A3035 4px)',
            }}></div>
          </div>
        </>
      )}

      <div className="container mx-auto px-4 text-center relative z-10">
        <div className="max-w-4xl mx-auto">
          {mostraLogo && (impostazioni?.logoCentrale || impostazioni?.logo) && (
            <div className="mb-2 hidden md:flex justify-center">
              <img 
                src={impostazioni.logoCentrale || impostazioni.logo} 
                alt={impostazioni.logoAlt || impostazioni.nomeAzienda}
                className="h-32 md:h-64 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}

          {/* Box contenuto: su mobile senza sfondo, su desktop trasparente */}
          <div className="md:bg-transparent md:p-0 md:backdrop-blur-none px-4 py-6 md:rounded-none">
            <div className="inline-block mb-8">
              <div className={`px-6 py-2 border backdrop-blur-sm ${
                backgroundImage
                  ? 'border-[#6b5c4a] text-[#6b5c4a]'
                  : 'border-[#E0B2B7]/40 text-[#C49098]'
              }`}>
                <span className="text-sm tracking-widest uppercase">
                  {badge}
                </span>
              </div>
            </div>

            <h1 className={`text-3xl md:text-4xl lg:text-5xl mb-6 font-serif tracking-tighter ${
                backgroundImage ? 'text-black/70' : 'text-[#4A3035]'
              }`}>
                {titolo}
            </h1>

            <p className={`text-xl md:text-2xl mb-12 font-serif tracking-wide ${
              backgroundImage ? 'text-black/80' : 'text-[#A07078]'
            }`}>
              {sottotitolo}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href={urlCtaPrimario}
                className="group relative px-8 py-[10px] text-black/80 border-[1px] border-[#6b5c4a] text-lg overflow-hidden transition-all hover:scale-105 w-full sm:w-auto"
              >
                <span className="relative text-sm tracking-widest uppercase">
                  {ctaPrimario}
                </span>
                <div className="absolute inset-0 bg-[#6b5c4a] transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                <span className="absolute text-sm tracking-widest uppercase inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white z-20">
                  {ctaPrimario} →
                </span>
              </Link>

              <a
                href={urlCtaSecondario}
                className={`px-8 py-4 tracking-widest uppercase text-sm bg-[#6b5c4a] transition-all w-full sm:w-auto ${
                  backgroundImage
                    ? 'border-white text-white hover:bg-white hover:text-black'
                    : 'border-[#E0B2B7] text-[#E0B2B7] hover:bg-[#E0B2B7] hover:text-white'
                }`}
              >
                {ctaSecondario}
              </a>
            </div>
          </div>

          {mostraInfoRapide && (impostazioni?.telefono || impostazioni?.indirizzo) && (
            <div className={`mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 ${
              backgroundImage ? 'text-white/70' : 'text-[#A07078]'
            }`}>
              {impostazioni?.telefono && (
                <a href={`tel:${impostazioni.telefono}`} className="flex items-center gap-2 hover:text-white transition-colors">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                  <span>{impostazioni.telefono}</span>
                </a>
              )}
              {impostazioni?.indirizzo && impostazioni?.citta && (
                <>
                  {impostazioni?.telefono && <span className="hidden sm:block opacity-50">|</span>}
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                    <span>{impostazioni.indirizzo}, {impostazioni.citta}</span>
                  </span>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
