# Guida alle Impostazioni Dinamiche

## Panoramica

Il sito è ora completamente dinamico al 100%. Ogni elemento visibile (logo, testi, colori, contatti, orari) può essere configurato dal pannello CMS senza toccare il codice.

## Cosa è stato implementato

### 1. Modello Impostazioni (`models/Impostazioni.js`)

Un modello MongoDB completo che gestisce:

- **Branding**: Logo, favicon, nome azienda, tagline, descrizione
- **Contatti**: Telefono, email, WhatsApp, indirizzo completo
- **Orari di apertura**: Per ogni giorno della settimana
- **Social Media**: Facebook, Instagram, Twitter, LinkedIn, TikTok, YouTube
- **Testi Homepage**: Tutti i testi della homepage sono configurabili
- **Testi Prenotazione**: Titoli e sottotitoli della pagina prenotazione
- **Tema**: Colori primari, secondari e accento
- **SEO**: Title, description, keywords, Open Graph image
- **Funzionalità**: Toggle per mostrare/nascondere sezioni

### 2. API Impostazioni (`app/api/impostazioni/route.ts`)

- **GET**: Recupera tutte le impostazioni
- **PUT**: Aggiorna le impostazioni (solo admin)

### 3. Pagina CMS Impostazioni (`app/(cms)/cms/impostazioni/page.tsx`)

Interfaccia completa con 7 tab:

1. **Generale**: Logo, nome azienda, tagline, descrizione
2. **Contatti**: Telefono, email, WhatsApp, indirizzo completo
3. **Orari**: Orari di apertura per ogni giorno
4. **Testi**: Tutti i testi della homepage e prenotazione
5. **Social**: Link ai profili social
6. **SEO**: Metadati per i motori di ricerca
7. **Avanzate**: Toggle per abilitare/disabilitare funzionalità

### 4. Homepage Dinamica (`app/page.tsx`)

Tutti gli elementi sono ora dinamici:

- Logo (con fallback a icona SVG)
- Nome azienda e tagline
- Badge hero
- Titoli e sottotitoli di tutte le sezioni
- Testi dei pulsanti CTA
- Informazioni di contatto
- Orari di apertura
- Servizi (con toggle per mostrare/nascondere)

### 5. Pagina Prenotazione Dinamica (`app/(utente)/prenotazione/page.tsx`)

- Logo nella navbar
- Titolo e sottotitolo pagina
- Titoli di tutti gli step (Barber, Servizio, Data, Orario, Conferma)

### 6. Layout Dinamico (`app/layout.tsx`)

- Metadati SEO dinamici (title, description, keywords)
- Favicon dinamico
- Open Graph image

## Come usare

### Accesso alle Impostazioni

1. Accedi al CMS
2. Clicca su "Impostazioni" nella sidebar (icona ⚙️)
3. Naviga tra le tab per configurare ogni aspetto

### Configurazione Logo

1. Vai su **Generale**
2. Inserisci l'URL del logo nel campo "Logo URL"
3. Il logo apparirà automaticamente in:
   - Homepage (navbar)
   - Pagina prenotazione (navbar)
   - Favicon (se configurato)

### Configurazione Testi

1. Vai su **Testi**
2. Configura i testi della homepage:
   - Badge Hero (es. "Premium Barbershop")
   - Titolo Hero (lascia vuoto per usare il nome azienda)
   - Sottotitolo Hero (lascia vuoto per usare la tagline)
   - Testi dei pulsanti CTA
   - Titoli delle sezioni

3. Configura i testi della prenotazione:
   - Titolo pagina
   - Sottotitolo pagina
   - Titoli degli step

### Configurazione Contatti

1. Vai su **Contatti**
2. Inserisci:
   - Telefono (verrà mostrato nella homepage)
   - Email
   - WhatsApp
   - Indirizzo completo (via, città, CAP, provincia)

### Configurazione Orari

1. Vai su **Orari**
2. Per ogni giorno inserisci:
   - Orario (es. "09:00 - 19:00")
   - Oppure "Chiuso" per i giorni di chiusura

### Configurazione Social

1. Vai su **Social**
2. Inserisci gli URL completi dei profili social
3. I link appariranno automaticamente dove configurato

### Configurazione SEO

1. Vai su **SEO**
2. Configura:
   - Titolo pagina (appare nel tab del browser)
   - Descrizione meta (per i motori di ricerca)
   - Keywords (separate da virgola)
   - Immagine Open Graph (per condivisioni social)

### Funzionalità Avanzate

1. Vai su **Avanzate**
2. Abilita/disabilita:
   - Mostra orari di apertura
   - Mostra sezione servizi
   - Mostra link social
   - Mostra informazioni di contatto
   - Abilita sistema prenotazioni

## Struttura Dati

### Esempio di oggetto Impostazioni

```javascript
{
  // Branding
  logo: "https://esempio.com/logo.png",
  logoAlt: "Logo Barbershop",
  nomeAzienda: "Barbershop Premium",
  tagline: "Il tuo stile, la nostra passione",
  
  // Contatti
  telefono: "+39 123 456 7890",
  email: "info@barbershop.com",
  indirizzo: "Via Roma 123",
  citta: "Milano",
  
  // Orari
  orariApertura: {
    lunedi: "09:00 - 19:00",
    martedi: "09:00 - 19:00",
    // ...
    domenica: "Chiuso"
  },
  
  // Testi Homepage
  testiHomepage: {
    badgeHero: "Premium Barbershop",
    titoloHero: "", // vuoto = usa nomeAzienda
    sottotitoloHero: "", // vuoto = usa tagline
    testoCtaPrimario: "PRENOTA APPUNTAMENTO",
    testoCtaSecondario: "DOVE SIAMO",
    // ...
  },
  
  // Funzionalità
  funzionalita: {
    mostraOrari: true,
    mostraServizi: true,
    mostraSocial: true,
    mostraContatti: true,
    abilitaPrenotazioni: true
  }
}
```

## API Endpoints

### GET /api/impostazioni
Recupera tutte le impostazioni

```javascript
const risposta = await fetch('/api/impostazioni');
const { dati } = await risposta.json();
```

### PUT /api/impostazioni
Aggiorna le impostazioni

```javascript
await fetch('/api/impostazioni', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(impostazioni)
});
```

## Note Importanti

1. **Fallback**: Se le impostazioni non sono disponibili, il sito usa valori di default
2. **Logo**: Se non configurato, viene mostrata un'icona SVG di default
3. **Testi vuoti**: Se un testo è vuoto, viene usato il valore di default
4. **Singleton**: Esiste sempre un solo documento di impostazioni nel database
5. **Cache**: Le impostazioni vengono caricate una volta per pagina

## Prossimi Passi

Per estendere ulteriormente il sistema:

1. Aggiungere upload immagini diretto (invece di URL)
2. Aggiungere editor WYSIWYG per testi lunghi
3. Aggiungere preview in tempo reale
4. Aggiungere gestione multilingua
5. Aggiungere temi predefiniti
6. Aggiungere backup/restore delle impostazioni
