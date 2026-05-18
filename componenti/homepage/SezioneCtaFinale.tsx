'use client';

import Link from 'next/link';

export default function SezioneCtaFinale({ config }: { config: any }) {
  const titolo = config.titolo || 'PRONTO PER IL TUO NUOVO LOOK?';
  const sottotitolo = config.sottotitolo || 'Prenota ora';
  const testoPulsante = config.testoPulsante || 'PRENOTA SUBITO';

  return (
    <section className="py-20 md:py-32 bg-black text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">{titolo}</h2>
        <p className="text-xl text-white/60 mb-12 max-w-2xl mx-auto">{sottotitolo}</p>
        <Link href="/booking" className="inline-block px-12 py-5 bg-white text-black font-bold text-xl hover:scale-105 transition-transform">
          {testoPulsante}
        </Link>
      </div>
    </section>
  );
}
