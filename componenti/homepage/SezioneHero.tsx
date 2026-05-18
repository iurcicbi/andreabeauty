'use client';

import Link from 'next/link';

interface SezioneHeroProps {
  impostazioni: any;
  sezioneConfig?: any;
}

export default function SezioneHero({ impostazioni, sezioneConfig }: SezioneHeroProps) {
  const config = sezioneConfig || {};
  
  const titolo = config.titolo || impostazioni?.testiHomepage?.titoloHero || impostazioni?.nomeAzienda || 'BEAUTY SALON';
  const sottotitolo = config.sottotitolo || impostazioni?.testiHomepage?.sottotitoloHero || impostazioni?.tagline || 'Il tuo stile, la nostra passione';
  const badge = config.badge || impostazioni?.testiHomepage?.badgeHero || 'Premium Beauty Salon';
  const ctaPrimario = config.testoCtaPrimario || impostazioni?.testiHomepage?.testoCtaPrimario || 'PRENOTA APPUNTAMENTO';
  const ctaSecondario = config.testoCtaSecondario || impostazioni?.testiHomepage?.testoCtaSecondario || 'DOVE SIAMO';
  const mostraLogo = config.mostraLogo !== false;
  const mostraInfoRapide = config.mostraInfoRapide !== false;
  const backgroundImage = config.immagineBackground;

  return (
    <section 
      id="home" 
      className="relative min-h-screen flex items-center justify-center pt-20"
      style={backgroundImage ? {
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      } : undefined}
    >
      {/* Background Pattern */}
      {!backgroundImage && (
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, white 2px, white 4px)',
          }}></div>
        </div>
      )}

      {/* Overlay scuro se c'è immagine di sfondo */}
      {backgroundImage && (
        <div className="absolute inset-0 bg-black/50"></div>
      )}

      <div className="container mx-auto px-4 text-center relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Logo Centrale (se disponibile e abilitato) */}
          {mostraLogo && (impostazioni?.logoCentrale || impostazioni?.logo) && (
            <div className="mb-8 flex justify-center">
              <img 
                src={impostazioni.logoCentrale || impostazioni.logo} 
                alt={impostazioni.logoAlt || impostazioni.nomeAzienda}
                className="h-32 md:h-48 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}

          {/* Badge */}
          <div className="inline-block mb-8">
            <div className="px-6 py-2 border border-white/30 backdrop-blur-sm">
              <span className="text-sm tracking-widest uppercase text-white/80">
                {badge}
              </span>
            </div>
          </div>

          {/* Main Title - mostra solo se non c'è logo centrale */}
          {!(mostraLogo && impostazioni?.logoCentrale) && (
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 tracking-tighter">
              {titolo}
            </h1>
          )}

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-white/60 mb-12 font-light tracking-wide">
            {sottotitolo}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/booking"
              className="group relative px-8 py-4 bg-white text-black font-bold text-lg overflow-hidden transition-all hover:scale-105 w-full sm:w-auto"
            >
              <span className="relative z-10">
                {ctaPrimario}
              </span>
              <div className="absolute inset-0 bg-black transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
              <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white z-20">
                {ctaPrimario} →
              </span>
            </Link>

            <a
              href="#contact"
              className="px-8 py-4 border-2 border-white text-white font-bold text-lg hover:bg-white hover:text-black transition-all w-full sm:w-auto"
            >
              {ctaSecondario}
            </a>
          </div>

          {/* Info rapide */}
          {mostraInfoRapide && (impostazioni?.telefono || impostazioni?.indirizzo) && (
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 text-white/60">
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
                  {impostazioni?.telefono && <span className="hidden sm:block">|</span>}
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

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
          <div className="w-1 h-3 bg-white/50 rounded-full"></div>
        </div>
      </div>
    </section>
  );
}
