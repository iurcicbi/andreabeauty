'use client';

import Link from 'next/link';

export default function SezioneAbout({ config, bgIndex = 0 }: { config: any; bgIndex?: number }) {
  const badge = config.badge || '';
  const nomeFondatore = config.nomeFondatore || '';
  const ruoloFondatore = config.ruoloFondatore || '';
  const descrizione = config.descrizione || '';
  const immagine = config.immagine || '';
  const urlCta = config.urlCta || '/booking';
  const testoCta = config.testoCta || '';
  
  // Colore di background alternato
  const colorePrimario = config.colorePrimario || '#FFF8F0';
  const coloreSecondario = config.coloreSecondario || '#F5EEE1';
  const bgColor = config.coloreSfondo || (bgIndex % 2 === 0 ? colorePrimario : coloreSecondario);
  
  // Dettagli con icone (arrivano dal CMS, solo le icone SVG sono hardcoded)
  const dettagli = config.dettagli || [];

  // Icone SVG
  const getIcona = (tipo: string) => {
    switch(tipo) {
      case 'diploma':
        return (
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 14l9-5-9-5-9 5 9 5z"/>
            <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 14v7"/>
          </svg>
        );
      case 'book':
        return (
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
          </svg>
        );
      case 'brush':
        return (
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <section id="about" className="py-20 md:py-32" style={{ backgroundColor: bgColor }}>
      {/* Layout Mobile */}
      <div className="md:hidden relative">
        {/* Immagine full-width senza margini */}
        <div className="relative w-full">
          {immagine ? (
            <img
              src={immagine}
              alt={nomeFondatore}
              className="w-full h-auto object-cover"
            />
          ) : (
            <div className="w-full aspect-[3/4] bg-[#e9e2d5] flex items-center justify-center">
              <span className="text-[#7f756d] text-sm">Immagine non disponibile</span>
            </div>
          )}
        </div>

        {/* Box contenuto sovrapposto all'immagine */}
        <div className="relative -mt-32 mx-4 bg-white p-6 shadow-lg">
          {badge && (
            <div className="mb-4">
              <span className="text-[10px] tracking-[0.1em] uppercase text-[#7f756d] font-semibold">
                {badge}
              </span>
            </div>
          )}

          {(nomeFondatore || ruoloFondatore) && (
            <h2 className="text-2xl text-[#1e1b14] mb-4 font-serif leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
              {nomeFondatore}{nomeFondatore && ruoloFondatore ? ' – ' : ''}{ruoloFondatore}
            </h2>
          )}

          {descrizione && (
            <p className="text-[#4d453e] leading-relaxed mb-6 text-sm" style={{ fontFamily: 'Manrope, sans-serif' }}>
              {descrizione}
            </p>
          )}

          {/* Dettagli con icone */}
          {dettagli.length > 0 && (
          <div className="space-y-5 mb-6">
            {dettagli.map((dettaglio: any, index: number) => (
              <div key={index} className="flex items-start gap-3">
                <div className="text-[#6b5c4a] mt-0.5 shrink-0 w-5 h-5">
                  {getIcona(dettaglio.icona)}
                </div>
                <div>
                  <h3 className="text-[10px] tracking-[0.1em] uppercase text-[#7f756d] mb-1 font-semibold" style={{ fontFamily: 'Manrope, sans-serif' }}>
                    {dettaglio.titolo}
                  </h3>
                  <p className="text-[#4d453e] text-xs leading-relaxed" style={{ fontFamily: 'Manrope, sans-serif' }}>
                    {dettaglio.descrizione}
                  </p>
                </div>
              </div>
            ))}
          </div>
          )}

          {/* CTA */}
          {testoCta && (
            <div>
              <Link
                href={urlCta}
                className="block w-full text-center px-8 py-3 bg-[#6b5c4a] text-white text-xs tracking-[0.1em] uppercase hover:bg-[#534434] transition-colors font-semibold"
                style={{ fontFamily: 'Manrope, sans-serif' }}
              >
                {testoCta}
              </Link>
            </div>
          )}
        </div>

        {/* Spazio sotto il box */}
        <div className="h-8"></div>
      </div>

      {/* Layout Desktop */}
      <div className="hidden md:block container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-start">
            {/* Immagine a sinistra */}
            <div className="relative">
              {immagine ? (
                <div className="relative overflow-hidden">
                  <img
                    src={immagine}
                    alt={nomeFondatore}
                    className="w-full h-auto object-cover"
                  />
                </div>
              ) : (
                <div className="w-full aspect-[3/4] bg-[#e9e2d5] flex items-center justify-center">
                  <span className="text-[#7f756d] text-sm">Immagine non disponibile</span>
                </div>
              )}
            </div>

            {/* Contenuto a destra */}
            <div className="flex flex-col justify-start">
              {badge && (
                <div className="mb-4">
                  <span className="text-xs tracking-[0.15em] uppercase text-[#7f756d] font-semibold" style={{ fontFamily: 'Manrope, sans-serif' }}>
                    {badge}
                  </span>
                </div>
              )}

              {(nomeFondatore || ruoloFondatore) && (
                <h2 className="text-4xl lg:text-5xl xl:text-6xl text-[#1e1b14] mb-4 leading-tight" style={{ fontFamily: 'Playfair Display, serif', fontWeight: 600, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
                  {nomeFondatore}{nomeFondatore && ruoloFondatore ? ' – ' : ''}{ruoloFondatore && <><br className="hidden lg:block" />{ruoloFondatore}</>}
                </h2>
              )}

              {descrizione && (
                <p className="text-[#4d453e] leading-relaxed mb-12 text-base lg:text-lg" style={{ fontFamily: 'Manrope, sans-serif', lineHeight: 1.6 }}>
                  {descrizione}
                </p>
              )}

              {dettagli.length > 0 && (
              <div className="space-y-6 mb-8">
                {dettagli.map((dettaglio: any, index: number) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="text-[#6b5c4a] mt-1 shrink-0">
                      {getIcona(dettaglio.icona)}
                    </div>
                    <div>
                      <h3 className="text-xs tracking-[0.1em] uppercase text-[#7f756d] mb-2 font-semibold" style={{ fontFamily: 'Manrope, sans-serif' }}>
                        {dettaglio.titolo}
                      </h3>
                      <p className="text-[#4d453e] text-sm leading-relaxed" style={{ fontFamily: 'Manrope, sans-serif', lineHeight: 1.6 }}>
                        {dettaglio.descrizione}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              )}

              {/* CTA */}
              {testoCta && (
                <div>
                  <Link
                    href={urlCta}
                    className="inline-block px-10 py-4 bg-[#6b5c4a] text-white text-sm tracking-[0.1em] uppercase hover:bg-[#534434] transition-colors font-semibold rounded"
                    style={{ fontFamily: 'Manrope, sans-serif' }}
                  >
                    {testoCta}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
