'use client';

type Pilastro = {
  titolo: string;
  descrizione: string;
  icona: 'science' | 'spa' | 'architecture' | 'star' | 'favorite' | 'brush' | 'diamond';
};

const IconaPilastro = ({ tipo }: { tipo: Pilastro['icona'] }) => {
  switch (tipo) {
    case 'science':
      return (
        <svg className="w-6 h-6 shrink-0 text-[#6b5c4a]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15M14.25 3.104c.251.023.501.05.75.082M19.8 15a2.25 2.25 0 0 1 .45 1.317C20.25 17.733 18.988 19 17.25 19H6.75C5.012 19 3.75 17.733 3.75 16.317a2.25 2.25 0 0 1 .45-1.317L9 9.75" />
        </svg>
      );
    case 'spa':
      return (
        <svg className="w-6 h-6 shrink-0 text-[#6b5c4a]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-1.54-.39-2.99-1.07-4.26M12 3c1.54 0 2.99.39 4.26 1.07M12 3v9m0 0 4.26-4.26" />
        </svg>
      );
    case 'architecture':
      return (
        <svg className="w-6 h-6 shrink-0 text-[#6b5c4a]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
        </svg>
      );
    case 'star':
      return (
        <svg className="w-6 h-6 shrink-0 text-[#6b5c4a]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
        </svg>
      );
    case 'favorite':
      return (
        <svg className="w-6 h-6 shrink-0 text-[#6b5c4a]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
        </svg>
      );
    case 'brush':
      return (
        <svg className="w-6 h-6 shrink-0 text-[#6b5c4a]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42" />
        </svg>
      );
    case 'diamond':
    default:
      return (
        <svg className="w-6 h-6 shrink-0 text-[#6b5c4a]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
        </svg>
      );
  }
};

export default function SezioneFilosofia({ config, bgIndex = 0 }: { config: any; bgIndex?: number }) {
  const badge = config.badge || 'ATELIER & FILOSOFIA';
  const titolo = config.titolo || 'Dincolo de Suprafață';
  const immagine = config.immagine || '';
  const pilastri: Pilastro[] = config.pilastri || [
    { titolo: 'Fundament Științific', descrizione: 'Inspirată de \'Cosmetica Medicală\', abordarea noastră prioritizează sănătatea pielii ca fundament suprem pentru orice aplicație artistică.', icona: 'science' },
    { titolo: 'Aură Holistică', descrizione: 'Nu aplicăm doar produse; cultivăm o esență. Fiecare tratament este o experiență meditativă de lux și îngrijire.', icona: 'spa' },
    { titolo: 'Precizie Intenționată', descrizione: 'Precizia este limbajul nostru. Fiecare mișcare este calculată pentru a îmbunătăți armonia structurală și simetria facială.', icona: 'architecture' },
  ];

  const colorePrimario = config.colorePrimario || '#FFF8F0';
  const coloreSecondario = config.coloreSecondario || '#F5EEE1';
  const bgColor = config.coloreSfondo || (bgIndex % 2 === 0 ? colorePrimario : coloreSecondario);

  return (
    <section id="filosofia" className="md:py-32 relative overflow-hidden" style={{ backgroundColor: bgColor }}>

      {/* ── MOBILE LAYOUT ── */}
      <div className="md:hidden relative">
        {/* Immagine full-width senza margini */}
        <div className="relative w-full">
          {immagine ? (
            <img
              src={immagine}
              alt={titolo}
              className="w-full h-auto object-cover"
            />
          ) : (
            <div className="w-full aspect-[3/4] bg-[#e9e2d5] flex items-center justify-center">
              <span className="text-[#7f756d] text-sm">Immagine non disponibile</span>
            </div>
          )}
        </div>

        {/* Box contenuto sovrapposto sull'immagine */}
        <div className="relative -mt-32 mx-4 bg-white p-8 shadow-lg">
          {/* Titolo centrato */}
          <h2
            className="text-4xl text-[#1e1b14] mb-3 leading-tight text-center"
            style={{ fontFamily: 'Playfair Display, serif', fontWeight: 600, lineHeight: 1.1, letterSpacing: '-0.02em' }}
          >
            {titolo}
          </h2>

          {/* Badge come sottotitolo centrato */}
          <p
            className="text-sm text-[#7f756d] text-center mb-12"
            style={{ fontFamily: 'Manrope, sans-serif' }}
          >
            {badge}
          </p>

          {/* Pilastri centrati verticalmente */}
          <div className="space-y-12">
            {pilastri.map((p, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                {/* Icona in box quadrato */}
                <div
                  className="w-14 h-14 flex items-center justify-center rounded-xl mb-4"
                  style={{ backgroundColor: '#f0ebe4' }}
                >
                  <IconaPilastro tipo={p.icona} />
                </div>
                <h4
                  className="text-2xl text-[#1e1b14] mb-2"
                  style={{ fontFamily: 'Playfair Display, serif', fontWeight: 500 }}
                >
                  {p.titolo}
                </h4>
                <p
                  className="text-[#4d453e] text-sm leading-relaxed max-w-xs"
                  style={{ fontFamily: 'Manrope, sans-serif', lineHeight: 1.6 }}
                >
                  {p.descrizione}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Spazio sotto il box */}
        <div className="h-8"></div>
      </div>

      {/* ── DESKTOP LAYOUT ── */}
      <div className="hidden md:block container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* Blocco decorativo destra */}
          <div
            className="absolute right-0 top-1/2 -translate-y-1/2 w-1/3 h-full -z-10"
            style={{ backgroundColor: '#e9e2d5', opacity: 0.4 }}
          />

          <div className="grid grid-cols-12 gap-6 items-center">

            {/* Colonna sinistra: badge + titolo + pilastri */}
            <div className="col-span-6">
              <span
                className="text-xs tracking-[0.15em] uppercase text-[#7f756d] font-semibold block mb-4"
                style={{ fontFamily: 'Manrope, sans-serif' }}
              >
                {badge}
              </span>
              <h2
                className="text-5xl lg:text-6xl text-[#1e1b14] mb-10 leading-tight"
                style={{ fontFamily: 'Playfair Display, serif', fontWeight: 600, lineHeight: 1.1, letterSpacing: '-0.02em' }}
              >
                {titolo}
              </h2>

              <div className="space-y-8">
                {pilastri.map((p, i) => (
                  <div key={i} className="flex gap-6">
                    <div className="mt-0.5">
                      <IconaPilastro tipo={p.icona} />
                    </div>
                    <div>
                      <h4
                        className="text-xl text-[#1e1b14] mb-2"
                        style={{ fontFamily: 'Playfair Display, serif', fontWeight: 500 }}
                      >
                        {p.titolo}
                      </h4>
                      <p
                        className="text-[#4d453e] text-base leading-relaxed"
                        style={{ fontFamily: 'Manrope, sans-serif', lineHeight: 1.6 }}
                      >
                        {p.descrizione}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Colonna destra: immagine con bordo */}
            {immagine && (
              <div className="col-span-5 col-start-8">
                <div className="aspect-[3/4] overflow-hidden border border-[#d0c5ba] p-2" style={{ backgroundColor: '#fff8f0' }}>
                  <img
                    src={immagine}
                    alt={titolo}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </section>
  );
}
