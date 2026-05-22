'use client';

type Sede = {
  nome: string;
  indirizzo: string;
  cap?: string;
  citta?: string;
  telefono?: string;
  email?: string;
  urlMappa?: string;
  programma?: { giorno: string; orario: string; chiuso?: boolean }[];
};

export default function SezioneContatti({
  config,
  impostazioni,
  bgIndex = 0,
}: {
  config: any;
  impostazioni: any;
  bgIndex?: number;
}) {
  const titolo = config.titolo || 'Contactați-ne';
  const descrizione = config.descrizione || '';
  const labelInquiries = config.labelInquiries || 'GENERAL INQUIRIES';
  const emailGenerale = config.emailGenerale || impostazioni?.email || '';
  const telefonoGenerale = config.telefonoGenerale || impostazioni?.telefono || '';
  const testoLink = config.testoLink || '';
  const urlLink = config.urlLink || '#';
  const sedi: Sede[] = config.sedi || [];

  const colorePrimario = config.colorePrimario || '#FFF8F0';
  const coloreSecondario = config.coloreSecondario || '#F5EEE1';
  const bgColor = config.coloreSfondo || (bgIndex % 2 === 0 ? colorePrimario : coloreSecondario);

  const PinIcon = () => (
    <svg className="w-5 h-5 text-[#7f756d]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0z" />
    </svg>
  );

  return (
    <>
      {/* ── PARTE SUPERIORE: titolo + email/telefono ── */}
      <section id="contact" className="py-20 md:py-28" style={{ backgroundColor: bgColor }}>
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-end">

              {/* Sinistra: titolo + descrizione */}
              <div>
                <h2
                  className="text-4xl md:text-5xl text-[#1e1b14] mb-6 leading-tight"
                  style={{ fontFamily: 'Playfair Display, serif', fontWeight: 600, lineHeight: 1.1 }}
                >
                  {titolo}
                </h2>
                {descrizione && (
                  <p
                    className="text-[#4d453e] text-sm leading-relaxed max-w-md"
                    style={{ fontFamily: 'Manrope, sans-serif', lineHeight: 1.75 }}
                  >
                    {descrizione}
                  </p>
                )}
              </div>

              {/* Destra: label + email + telefono, allineati in basso a destra */}
              {(emailGenerale || telefonoGenerale) && (
                <div className="flex justify-start md:justify-end">
                  <div className="flex flex-col gap-3 text-left md:text-right">
                    {labelInquiries && (
                      <span
                        className="text-[10px] tracking-[0.2em] uppercase text-[#7f756d] font-semibold"
                        style={{ fontFamily: 'Manrope, sans-serif' }}
                      >
                        {labelInquiries}
                      </span>
                    )}
                    {emailGenerale && (
                      <a
                        href={`mailto:${emailGenerale}`}
                        className="text-2xl md:text-3xl text-[#1e1b14] hover:opacity-70 transition-opacity"
                        style={{ fontFamily: 'Playfair Display, serif', fontWeight: 500 }}
                      >
                        {emailGenerale}
                      </a>
                    )}
                    {telefonoGenerale && (
                      <a
                        href={`tel:${telefonoGenerale}`}
                        className="text-base text-[#4d453e] hover:opacity-70 transition-opacity"
                        style={{ fontFamily: 'Manrope, sans-serif' }}
                      >
                        {telefonoGenerale}
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── PARTE LOCAZIONI: sezione separata, sfondo bianco fisso ── */}
      {sedi.length > 0 && (
        <section className="py-20 md:py-28 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-7xl mx-auto">

              {/* Header: titolo + linea + link */}
              <div className="flex flex-col md:flex-row justify-between items-baseline mb-16 gap-4">
                <h3
                  className="text-4xl md:text-5xl text-[#1e1b14] mb-6 leading-tight"
                  style={{ fontFamily: 'Playfair Display, serif', fontWeight: 600, lineHeight: 1.1 }}
                >
                  Locațiile Studio
                </h3>
                <div className="h-px flex-grow mx-8 bg-[#d0c5ba]/30 hidden md:block" />
                {testoLink && (
                  <a
                    href={urlLink}
                    className="text-[10px] tracking-[0.2em] uppercase text-[#7f756d] font-semibold hover:text-[#1e1b14] transition-colors shrink-0"
                    style={{ fontFamily: 'Manrope, sans-serif' }}
                  >
                    {testoLink}
                  </a>
                )}
              </div>

              {/* Card sedi */}
              <div className={`grid grid-cols-1 ${sedi.length === 1 ? 'max-w-xl' : 'md:grid-cols-2'} gap-6`}>
                {sedi.map((sede, idx) => (
                  <div key={idx} className="border border-[#d0c5ba]/30 p-10">
                    {/* Nome + pin */}
                    <div className="flex justify-between items-start mb-8">
                      <h4
                        className="text-3xl text-[#1e1b14]"
                        style={{ fontFamily: 'Playfair Display, serif', fontWeight: 600 }}
                      >
                        {sede.nome}
                      </h4>
                      {sede.urlMappa ? (
                        <a href={sede.urlMappa} target="_blank" rel="noopener noreferrer" className="text-[#7f756d] hover:text-[#1e1b14] transition-colors">
                          <PinIcon />
                        </a>
                      ) : (
                        <span className="text-[#7f756d]"><PinIcon /></span>
                      )}
                    </div>

                    <div className="space-y-8">
                      {/* Indirizzo */}
                      {(sede.indirizzo || sede.citta) && (
                        <div>
                          <p className="text-[10px] tracking-[0.15em] uppercase text-[#7f756d] font-semibold mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
                            ADRESĂ
                          </p>
                          <p className="text-[#4d453e] text-sm leading-relaxed" style={{ fontFamily: 'Manrope, sans-serif' }}>
                            {sede.indirizzo && <span>{sede.indirizzo}<br /></span>}
                            {(sede.cap || sede.citta) && <span>{[sede.cap, sede.citta].filter(Boolean).join(', ')}</span>}
                          </p>
                        </div>
                      )}

                      {/* Telefono + Email */}
                      {(sede.telefono || sede.email) && (
                        <div className="grid grid-cols-2 gap-4">
                          {sede.telefono && (
                            <div>
                              <p className="text-[10px] tracking-[0.15em] uppercase text-[#7f756d] font-semibold mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>TELEFON</p>
                              <a href={`tel:${sede.telefono}`} className="text-[#4d453e] text-sm hover:underline" style={{ fontFamily: 'Manrope, sans-serif' }}>{sede.telefono}</a>
                            </div>
                          )}
                          {sede.email && (
                            <div>
                              <p className="text-[10px] tracking-[0.15em] uppercase text-[#7f756d] font-semibold mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>EMAIL</p>
                              <a href={`mailto:${sede.email}`} className="text-[#4d453e] text-sm hover:underline" style={{ fontFamily: 'Manrope, sans-serif' }}>{sede.email}</a>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Programma */}
                      {sede.programma && sede.programma.length > 0 && (
                        <div className="pt-8 border-t border-[#d0c5ba]/20">
                          <p className="text-[10px] tracking-[0.15em] uppercase text-[#7f756d] font-semibold mb-4" style={{ fontFamily: 'Manrope, sans-serif' }}>PROGRAM</p>
                          <div className="space-y-2">
                            {sede.programma.map((riga, i) => (
                              <div
                                key={i}
                                className={`flex justify-between text-sm ${riga.chiuso ? 'text-[#b0a89e]' : 'text-[#4d453e]'}`}
                                style={{ fontFamily: 'Manrope, sans-serif' }}
                              >
                                <span>{riga.giorno}</span>
                                <span>{riga.chiuso ? 'Închis' : riga.orario}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </section>
      )}
    </>
  );
}
