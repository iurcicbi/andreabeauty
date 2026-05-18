# Single Page Navigation - Documentazione

## Panoramica
Il sito è stato trasformato in una **Single Page Application (SPA)** dove tutte le sezioni principali sono contenute nella homepage e accessibili tramite **anchor links** nel menu di navigazione.

## Struttura della Homepage

### Sezioni Disponibili

1. **#home** - Hero Section
   - Logo centrale/header
   - Titolo e sottotitolo personalizzabili
   - CTA buttons (Prenota, Contatti)
   - Informazioni rapide (telefono, indirizzo)

2. **#services** - Sezione Servizi
   - Griglia di servizi con prezzi e durate
   - Descrizioni personalizzabili
   - Link diretto alla prenotazione

3. **#about** - Chi Siamo
   - Storia e missione dell'azienda
   - Statistiche (anni esperienza, clienti, ecc.)
   - Immagine/placeholder team

4. **#orari** - Orari di Apertura (opzionale)
   - Tabella orari settimanali
   - Mostra solo se configurato nelle impostazioni

5. **#contact** - Contatti
   - Informazioni complete (telefono, email, indirizzo, WhatsApp)
   - Social media links
   - Placeholder per mappa Google

6. **Reviews** - Recensioni Clienti (opzionale)
   - Mostra solo se ci sono recensioni nel database
   - Griglia responsive di testimonianze

## Menu di Navigazione

### Desktop
```
Home | Servizi | Chi Siamo | Contatti | [PRENOTA ORA]
```

### Mobile
Menu hamburger con le stesse voci

### Comportamento
- Tutti i link usano anchor navigation (`href="#section"`)
- Smooth scroll automatico
- Offset automatico per navbar fissa (120px desktop, 100px mobile)
- Chiusura automatica menu mobile dopo click

## URL Examples

```
https://mesamis.md/              → Homepage (Hero)
https://mesamis.md/#home         → Hero Section
https://mesamis.md/#services     → Sezione Servizi
https://mesamis.md/#about        → Chi Siamo
https://mesamis.md/#contact      → Contatti
https://mesamis.md/booking       → Pagina Prenotazione (separata)
```

## Configurazione

### Mostrare/Nascondere Sezioni

Le sezioni possono essere controllate tramite le impostazioni nel CMS:

```javascript
funzionalita: {
  mostraOrari: true/false,      // Mostra sezione orari
  mostraServizi: true/false,    // Mostra sezione servizi
  mostraSocial: true/false,     // Mostra social media
  mostraContatti: true/false    // Mostra info contatti
}
```

### Personalizzare Testi

Tutti i testi sono personalizzabili tramite `testiHomepage` nelle impostazioni:

```javascript
testiHomepage: {
  titoloHero: "BEAUTY SALON",
  sottotitoloHero: "Il tuo stile, la nostra passione",
  badgeHero: "Premium Beauty Salon",
  testoCtaPrimario: "PRENOTA APPUNTAMENTO",
  testoCtaSecondario: "DOVE SIAMO",
  titoloServizi: "I NOSTRI SERVIZI",
  sottotitoloServizi: "Qualità e professionalità",
  titoloOrari: "ORARI DI APERTURA",
  sottotitoloOrari: "Siamo qui per te",
  titoloCtaFinale: "PRONTO PER IL TUO NUOVO LOOK?",
  sottotitoloCtaFinale: "Prenota ora il tuo appuntamento"
}
```

## Caratteristiche Tecniche

### Smooth Scroll
- Implementato via CSS `scroll-behavior: smooth`
- Offset automatico per navbar fissa
- Funziona su tutti i browser moderni

### Performance
- Tutte le sezioni caricate in una singola pagina
- Nessun reload tra sezioni
- Navigazione istantanea
- Ottimizzato per mobile

### Responsive Design
- Layout mobile-first
- Menu hamburger su mobile
- Griglie responsive per servizi e recensioni
- Touch-friendly (target minimi 44x44px)

## Modifiche ai File

### File Modificati

1. **app/page.tsx**
   - Aggiunta sezione "Chi Siamo" (#about)
   - Aggiunta sezione "Contatti" (#contact)
   - Aggiornato menu con anchor links
   - Aggiunto footer con link rapidi
   - Rinominato id sezione servizi da #servizi a #services

2. **app/globals.css**
   - Aggiunto offset per scroll con navbar fissa
   - Mantenuto smooth scroll esistente

## Pagine Separate Mantenute

Alcune pagine rimangono separate per funzionalità specifiche:

- `/booking` - Sistema di prenotazione
- `/login` - Login CMS
- `/register` - Registrazione
- `/cms/*` - Pannello amministrazione

## Best Practices

### SEO
- Usa meta tags appropriati per la homepage
- Ogni sezione ha heading semantici (h2, h3)
- Struttura HTML semantica

### Accessibilità
- Link con testo descrittivo
- Contrasti colori WCAG compliant
- Navigazione da tastiera supportata

### UX
- Feedback visivo su hover/click
- Transizioni fluide
- Indicatori di scroll
- Menu mobile intuitivo

## Prossimi Passi Consigliati

1. **Integrare Google Maps**
   - Sostituire placeholder nella sezione contatti
   - Usare iframe o Google Maps API

2. **Aggiungere Animazioni**
   - Scroll animations (fade-in, slide-up)
   - Parallax effects (opzionale)

3. **Ottimizzare Immagini**
   - Aggiungere immagini reali per "Chi Siamo"
   - Ottimizzare logo e immagini servizi

4. **Analytics**
   - Tracciare scroll depth
   - Monitorare click su anchor links
   - Heatmap delle sezioni più visitate

## Supporto Browser

- ✅ Chrome/Edge (moderni)
- ✅ Firefox (moderni)
- ✅ Safari (iOS 13+)
- ✅ Mobile browsers (iOS/Android)

## Note Tecniche

- React 18 con Next.js 14
- Client component (`'use client'`)
- TypeScript per type safety
- Tailwind CSS per styling
- Responsive design mobile-first
