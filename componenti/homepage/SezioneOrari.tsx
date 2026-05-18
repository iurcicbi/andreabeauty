'use client';

const GIORNI: Record<string, string> = {
  lunedi: 'Lunedì',
  martedi: 'Martedì',
  mercoledi: 'Mercoledì',
  giovedi: 'Giovedì',
  venerdi: 'Venerdì',
  sabato: 'Sabato',
  domenica: 'Domenica',
};

export default function SezioneOrari({
  config,
  orariApertura,
}: {
  config: any;
  orariApertura?: Record<string, string>;
}) {
  if (!orariApertura) return null;

  const titolo = config.titolo || 'ORARI DI APERTURA';
  const sottotitolo = config.sottotitolo || 'Siamo qui per te';
  const descrizione = config.descrizione || '';

  return (
    <section id="hours" className="py-20 md:py-32 bg-black text-white">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">{titolo}</h2>
          <p className="text-xl text-white/60 mb-4">{sottotitolo}</p>
          {descrizione && <p className="text-white/50 mb-12">{descrizione}</p>}

          <div className="space-y-3">
            {Object.entries(GIORNI).map(([key, label]) => {
              const orario = orariApertura[key];
              if (!orario) return null;
              const today = new Date().toLocaleDateString('it-IT', { weekday: 'long' });
              const isToday = label.toLowerCase().startsWith(today.toLowerCase().slice(0, 3));

              return (
                <div
                  key={key}
                  className={`flex justify-between items-center px-6 py-3 rounded-lg ${
                    isToday ? 'bg-white text-black font-bold' : 'border border-white/20'
                  }`}
                >
                  <span>{label}</span>
                  <span>{orario}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
