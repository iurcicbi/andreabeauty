'use client';

export default function SezioneContatti({
  config,
  impostazioni,
}: {
  config: any;
  impostazioni: any;
}) {
  const titolo = config.titolo || 'CONTATTACI';
  const sottotitolo = config.sottotitolo || 'Siamo qui per te';
  const descrizione = config.descrizione || '';
  const mostraMappa = config.mostraMappa !== false;
  const mostraSocial = config.mostraSocial !== false;
  const urlMappa = config.urlMappa || '';
  const social = impostazioni?.social || {};

  return (
    <section id="contact" className="py-20 md:py-32 bg-white text-black">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">{titolo}</h2>
          <p className="text-xl text-black/60 mb-4">{sottotitolo}</p>
          {descrizione && <p className="text-black/50 mb-12 max-w-2xl mx-auto">{descrizione}</p>}
        </div>

        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          <div className="space-y-6">
            {impostazioni?.telefono && (
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-black text-white flex items-center justify-center rounded-full shrink-0">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                </div>
                <div className="text-left">
                  <div className="text-sm text-black/50 uppercase tracking-wider">Telefono</div>
                  <a href={`tel:${impostazioni.telefono}`} className="font-medium hover:underline">{impostazioni.telefono}</a>
                </div>
              </div>
            )}
            {impostazioni?.email && (
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-black text-white flex items-center justify-center rounded-full shrink-0">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </div>
                <div className="text-left">
                  <div className="text-sm text-black/50 uppercase tracking-wider">Email</div>
                  <a href={`mailto:${impostazioni.email}`} className="font-medium hover:underline">{impostazioni.email}</a>
                </div>
              </div>
            )}
            {impostazioni?.indirizzo && (
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-black text-white flex items-center justify-center rounded-full shrink-0">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                </div>
                <div className="text-left">
                  <div className="text-sm text-black/50 uppercase tracking-wider">Indirizzo</div>
                  <span className="font-medium">{impostazioni.indirizzo}{impostazioni.citta ? `, ${impostazioni.citta}` : ''}</span>
                </div>
              </div>
            )}
            {mostraSocial && (
              <div className="flex gap-4 pt-4">
                {social.instagram && (
                  <a href={social.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 border border-black/20 rounded-full flex items-center justify-center hover:bg-black hover:text-white transition-all">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                  </a>
                )}
                {social.facebook && (
                  <a href={social.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 border border-black/20 rounded-full flex items-center justify-center hover:bg-black hover:text-white transition-all">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3V2z"/></svg>
                  </a>
                )}
                {social.tiktok && (
                  <a href={social.tiktok} target="_blank" rel="noopener noreferrer" className="w-10 h-10 border border-black/20 rounded-full flex items-center justify-center hover:bg-black hover:text-white transition-all">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M9 12a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm0 6a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"/><path d="M21 12h-4a5 5 0 0 1-5-5V3h-2v5a7 7 0 0 0 7 7h4v-3z"/></svg>
                  </a>
                )}
                {social.whatsapp && (
                  <a href={social.whatsapp} target="_blank" rel="noopener noreferrer" className="w-10 h-10 border border-black/20 rounded-full flex items-center justify-center hover:bg-black hover:text-white transition-all">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                  </a>
                )}
              </div>
            )}
          </div>

          {mostraMappa && urlMappa && (
            <div className="h-80 rounded-lg overflow-hidden border border-black/10">
              <iframe src={urlMappa} width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
