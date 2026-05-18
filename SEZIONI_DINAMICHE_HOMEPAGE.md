# Sistema Sezioni Dinamiche Homepage

## Panoramica

Il sistema di **sezioni dinamiche** permette di personalizzare completamente la homepage del sito tramite il pannello CMS, senza dover modificare il codice.

## Caratteristiche Principali

### ✅ Completamente Dinamico
- **Testi personalizzabili**: Ogni titolo, sottotitolo, descrizione può essere modificato
- **Immagini configurabili**: Background, loghi, immagini sezioni
- **Visibilità controllabile**: Attiva/disattiva ogni sezione
- **Ordine personalizzabile**: Riordina le sezioni come preferisci
- **Layout flessibile**: Scegli il layout della griglia servizi (2, 3 o 4 colonne)

### 🎨 Sezioni Disponibili

1. **Hero Section** (#home)
   - Titolo e sottotitolo
   - Badge personalizzato
   - 2 CTA buttons configurabili
   - Immagine background opzionale
   - Toggle logo e info rapide

2. **Servizi** (#services)
   - Titolo e sottotitolo
   - Layout griglia (2/3/4 colonne)
   - Toggle prezzi e durata
   - Immagine background opzionale

3. **Chi Siamo** (#about)
   - Titolo, sottotitolo e descrizione
   - Immagine personalizzabile
   - 3 statistiche configurabili (valore + label)

4. **Orari** (#orari)
   - Titolo e sottotitolo
   - Usa gli orari configurati in "Impostazioni"

5. **Recensioni** (#recensioni)
   - Titolo e sottotitolo
   - Numero massimo recensioni da mostrare
   - Mostra solo se ci sono recensioni

6. **Contatti** (#contact)
   - Titolo e sottotitolo
   - Toggle mappa Google
   - URL iframe mappa personalizzabile
   - Toggle social media

7. **CTA Finale** (#cta-finale)
   - Titolo e sottotitolo
   - Testo pulsante personalizzabile
   - Immagine background opzionale

## Come Usare il CMS

### Accesso
1. Login al CMS: `/login`
2. Menu laterale → **Homepage**

### Gestione Sezioni

#### Attivare/Disattivare
- Click sull'icona occhio (👁️) per attivare/disattivare una sezione
- Le sezioni disattivate non vengono mostrate sul sito

#### Riordinare
- Usa le frecce ▲▼ per cambiare l'ordine di visualizzazione
- L'ordine parte da 1 (primo) in su

#### Espandere/Comprimere
- Click sulla freccia ▶▼ per espandere/comprimere i campi di una sezione

#### Modificare Contenuti
- Compila i campi desiderati
- Lascia vuoto per usare i valori di default
- Click su **"Salva Tutte le Modifiche"** per applicare

### Campi Speciali

#### Immagini
- Inserisci URL completo: `https://example.com/image.jpg`
- Supporta immagini esterne o caricate su CDN
- Lascia vuoto per usare placeholder/pattern di default

#### Mappa Google
1. Vai su Google Maps
2. Cerca la tua posizione
3. Click su "Condividi" → "Incorpora una mappa"
4. Copia l'URL dall'attributo `src` dell'iframe
5. Incolla nel campo "URL Mappa Google"

#### Statistiche (Chi Siamo)
- **Valore**: Es. "10+", "5K+", "100%"
- **Label**: Es. "Anni Esperienza", "Clienti Felici"

## Struttura Dati

### Modello Database (Mongoose)

```typescript
sezioniHomepage: {
  hero: {
    attiva: Boolean,
    ordine: Number,
    titolo: String,
    sottotitolo: String,
    badge: String,
    testoCtaPrimario: String,
    testoCtaSecondario: String,
    immagineBackground: String,
    mostraLogo: Boolean,
    mostraInfoRapide: Boolean
  },
  servizi: {
    attiva: Boolean,
    ordine: Number,
    titolo: String,
    sottotitolo: String,
    descrizione: String,
    immagineBackground: String,
    layoutGriglia: 'grid-2' | 'grid-3' | 'grid-4',
    mostraPrezzi: Boolean,
    mostraDurata: Boolean
  },
  about: {
    attiva: Boolean,
    ordine: Number,
    titolo: String,
    sottotitolo: String,
    descrizione: String,
    immagine: String,
    statistiche: {
      anni: { valore: String, label: String },
      clienti: { valore: String, label: String },
      qualita: { valore: String, label: String }
    }
  },
  // ... altre sezioni
}
```

### API Endpoint

**GET /api/settings**
- Restituisce tutte le impostazioni incluse le sezioni homepage

**PUT /api/settings**
- Aggiorna le impostazioni
- Body: oggetto con i campi da aggiornare

```javascript
// Esempio richiesta
await fetch('/api/settings', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sezioniHomepage: {
      hero: {
        titolo: 'NUOVO TITOLO',
        attiva: true
      }
    }
  })
});
```

## File Modificati

### Backend
- **models/Impostazioni.ts**
  - Aggiunto campo `sezioniHomepage` con tutte le configurazioni
  - Mantenuto `testiHomepage` per retrocompatibilità

### Frontend
- **app/page.tsx**
  - Aggiornata interfaccia `ImpostazioniFrontend`
  - Aggiunto sistema di ordinamento sezioni
  - Fallback ai vecchi dati se `sezioniHomepage` non esiste

- **componenti/homepage/SezioneHero.tsx**
  - Componente modulare per Hero Section
  - Supporta configurazione dinamica

### CMS
- **app/(cms)/cms/homepage/page.tsx**
  - Nuova pagina gestione homepage
  - Form completo per tutte le sezioni
  - Toggle visibilità e riordinamento

- **app/(cms)/cms/layout.tsx**
  - Aggiunto link "Homepage" al menu

## Compatibilità e Migrazione

### Retrocompatibilità
Il sistema è **completamente retrocompatibile**:

```typescript
// Se sezioniHomepage non esiste, usa testiHomepage
const titolo = impostazioni?.sezioniHomepage?.hero?.titolo || 
               impostazioni?.testiHomepage?.titoloHero || 
               'DEFAULT';
```

### Migrazione Automatica
Non è necessaria migrazione. Il sistema:
1. Controlla se `sezioniHomepage` esiste
2. Se non esiste, usa i vecchi campi `testiHomepage`
3. Quando salvi dal nuovo CMS, crea automaticamente `sezioniHomepage`

## Best Practices

### Testi
- **Titoli**: MAIUSCOLO, brevi, impattanti
- **Sottotitoli**: Sentence case, descrittivi
- **Descrizioni**: Max 2-3 righe, chiare e concise

### Immagini
- **Formato**: JPG/PNG/WebP
- **Dimensioni consigliate**:
  - Hero background: 1920x1080px
  - About image: 800x800px
  - Logo: 400x200px (trasparente PNG)
- **Peso**: Max 500KB per immagine
- **Ottimizzazione**: Usa TinyPNG o simili

### Performance
- Attiva solo le sezioni necessarie
- Usa immagini ottimizzate
- Limita il numero di recensioni mostrate (max 6-9)

### SEO
- Compila tutti i titoli e sottotitoli
- Usa keywords rilevanti
- Mantieni testi unici e originali

## Esempi d'Uso

### Esempio 1: Salone Elegante Minimalista
```javascript
{
  hero: {
    attiva: true,
    ordine: 1,
    titolo: "ELEGANZA SENZA TEMPO",
    sottotitolo: "Dove lo stile incontra la perfezione",
    badge: "Luxury Beauty Salon",
    mostraLogo: true,
    immagineBackground: "https://..."
  },
  servizi: {
    attiva: true,
    ordine: 2,
    layoutGriglia: "grid-3",
    mostraPrezzi: false  // Nasconde prezzi per look premium
  },
  about: {
    attiva: true,
    ordine: 3,
    statistiche: {
      anni: { valore: "15+", label: "Anni di Eccellenza" },
      clienti: { valore: "10K+", label: "Clienti VIP" },
      qualita: { valore: "★★★★★", label: "Recensioni" }
    }
  }
}
```

### Esempio 2: Salone Moderno e Giovane
```javascript
{
  hero: {
    titolo: "IL TUO NUOVO LOOK TI ASPETTA",
    sottotitolo: "Stile, colore, personalità",
    badge: "Modern Beauty Lab",
    testoCtaPrimario: "PRENOTA ORA",
    testoCtaSecondario: "SCOPRI DI PIÙ"
  },
  servizi: {
    layoutGriglia: "grid-4",  // Più servizi visibili
    mostraPrezzi: true,
    mostraDurata: true
  },
  recensioni: {
    attiva: true,
    numeroMassimo: 9  // Mostra più recensioni
  }
}
```

### Esempio 3: Focus su Prenotazioni
```javascript
{
  // Disattiva sezioni non essenziali
  about: { attiva: false },
  orari: { attiva: false },
  
  // Enfatizza CTA
  hero: {
    ordine: 1,
    testoCtaPrimario: "PRENOTA SUBITO - SCONTO 20%"
  },
  servizi: {
    ordine: 2
  },
  ctaFinale: {
    ordine: 3,
    titolo: "OFFERTA LIMITATA",
    sottotitolo: "Prenota oggi e ricevi il 20% di sconto",
    testoPulsante: "APPROFITTA DELL'OFFERTA"
  }
}
```

## Troubleshooting

### Le modifiche non si vedono
1. Verifica di aver cliccato "Salva"
2. Ricarica la homepage (Ctrl+F5)
3. Controlla che la sezione sia attiva (occhio aperto)

### Immagine non si carica
1. Verifica che l'URL sia corretto e pubblico
2. Controlla che l'immagine sia accessibile (apri URL in browser)
3. Usa HTTPS, non HTTP

### Sezione non appare
1. Verifica che `attiva` sia `true`
2. Controlla l'ordine (non deve essere duplicato)
3. Per recensioni: verifica che ci siano recensioni nel database

### Testi non aggiornati
1. Svuota cache browser
2. Verifica che il salvataggio sia andato a buon fine
3. Controlla console browser per errori

## Sviluppi Futuri

### Pianificati
- [ ] Upload immagini direttamente dal CMS
- [ ] Preview live delle modifiche
- [ ] Template predefiniti
- [ ] A/B testing sezioni
- [ ] Analytics per sezione
- [ ] Sezioni personalizzate (drag & drop)

### In Considerazione
- [ ] Multilingua per sezioni
- [ ] Animazioni configurabili
- [ ] Video background
- [ ] Countdown timer per offerte
- [ ] Form contatti personalizzabile

## Supporto

Per problemi o domande:
1. Controlla questa documentazione
2. Verifica i log del browser (F12 → Console)
3. Contatta il supporto tecnico

---

**Versione**: 1.0.0  
**Ultimo aggiornamento**: 2026-05-17  
**Compatibilità**: Next.js 14+, React 18+
