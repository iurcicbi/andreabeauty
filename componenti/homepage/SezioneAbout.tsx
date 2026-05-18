'use client';

export default function SezioneAbout({ config }: { config: any }) {
  const titolo = config.titolo || 'CHI SIAMO';
  const sottotitolo = config.sottotitolo || 'La nostra storia';
  const descrizione = config.descrizione || '';
  const immagine = config.immagine || '';
  const statistiche = config.statistiche || {};

  return (
    <section id="about" className="py-20 md:py-32 bg-black text-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">{titolo}</h2>
            <p className="text-xl text-white/60 mb-8">{sottotitolo}</p>
          </div>

          {immagine && (
            <div className="mb-12">
              <img src={immagine} alt={titolo} className="w-full h-80 object-cover rounded-lg" />
            </div>
          )}

          {descrizione && (
            <p className="text-lg text-white/80 leading-relaxed text-center mb-16">{descrizione}</p>
          )}

          {(statistiche?.anni?.valore || statistiche?.clienti?.valore || statistiche?.qualita?.valore) && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              {statistiche.anni?.valore && (
                <div className="p-8 border border-white/20 rounded-lg">
                  <div className="text-5xl font-bold text-white mb-2">{statistiche.anni.valore}</div>
                  <div className="text-white/60">{statistiche.anni.label || 'Anni Esperienza'}</div>
                </div>
              )}
              {statistiche.clienti?.valore && (
                <div className="p-8 border border-white/20 rounded-lg">
                  <div className="text-5xl font-bold text-white mb-2">{statistiche.clienti.valore}</div>
                  <div className="text-white/60">{statistiche.clienti.label || 'Clienti Felici'}</div>
                </div>
              )}
              {statistiche.qualita?.valore && (
                <div className="p-8 border border-white/20 rounded-lg">
                  <div className="text-5xl font-bold text-white mb-2">{statistiche.qualita.valore}</div>
                  <div className="text-white/60">{statistiche.qualita.label || 'Professionalità'}</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
