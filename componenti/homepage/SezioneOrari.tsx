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
  bgIndex = 0,
}: {
  config: any;
  orariApertura?: Record<string, string>;
  bgIndex?: number;
}) {
  if (!orariApertura) return null;

  const titolo = config.titolo || 'ORARI DI APERTURA';
  const sottotitolo = config.sottotitolo || 'Siamo qui per te';
  const descrizione = config.descrizione || '';
  
  // Colore di background alternato
  const colorePrimario = config.colorePrimario || '#FFF8F0';
  const coloreSecondario = config.coloreSecondario || '#F5EEE1';
  const bgColor = config.coloreSfondo || (bgIndex % 2 === 0 ? colorePrimario : coloreSecondario);

  return (
    <section id="hours" className="py-20 md:py-32 text-[#4A3035]" style={{ backgroundColor: bgColor }}>
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl mb-4 tracking-tight">{titolo}</h2>
          <p className="text-xl text-[#A07078] mb-4">{sottotitolo}</p>
          {descrizione && <p className="text-[#A07078]/80 mb-12">{descrizione}</p>}

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
                    isToday ? 'bg-[#E0B2B7] text-white' : 'border border-[#E0B2B7]/30 bg-white'
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
