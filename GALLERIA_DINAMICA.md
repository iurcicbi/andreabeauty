# Galleria Dinamica - Documentazione Completa

## 🎨 Panoramica

La sezione galleria è completamente dinamica e gestibile dal CMS. Supporta diversi layout, incluso un layout personalizzato elegante con 1 immagine grande e 4 piccole in griglia.

## ✨ Caratteristiche

### Layout Disponibili

1. **Layout Personalizzato (grid-custom)** - *Consigliato*
   - 1 immagine grande a sinistra (aspect ratio 3:4)
   - 4 immagini piccole a destra in griglia 2x2 (aspect ratio 1:1)
   - Design elegante e moderno
   - Richiede almeno 5 immagini

2. **Grid 2 Colonne (grid-2)**
   - Griglia semplice a 2 colonne
   - Tutte le immagini hanno la stessa dimensione

3. **Grid 3 Colonne (grid-3)**
   - Griglia a 3 colonne
   - Layout classico

4. **Grid 4 Colonne (grid-4)**
   - Griglia a 4 colonne
   - Ideale per molte immagini

5. **Masonry (masonry)**
   - Layout a colonne con altezze variabili
   - Effetto Pinterest

### Elementi Configurabili

- **Badge**: Testo piccolo sopra il titolo (es. "ARHIVĂ VIZUALĂ")
- **Titolo**: Titolo principale della sezione
- **Sottotitolo**: Descrizione opzionale sotto il titolo
- **Layout**: Scegli tra i 5 layout disponibili
- **Immagini**: Aggiungi/rimuovi immagini con:
  - URL immagine (caricabile tramite ImageUploader)
  - Didascalia (visibile al passaggio del mouse)
  - Alt Text (per SEO)
- **Pulsante Portfolio**:
  - Mostra/nascondi pulsante "Vedi tutto"
  - Testo personalizzabile
  - URL personalizzabile
- **Colore Sfondo**: Personalizza il colore o usa l'alternanza automatica
- **Menu**: Mostra/nascondi nel menu di navigazione

## 🎯 Come Utilizzare

### Dal CMS

1. **Vai a** `/cms/homepage`
2. **Scorri fino alla sezione "Galleria"**
3. **Configura i campi**:
   - Badge: "ARHIVĂ VIZUALĂ"
   - Titolo: "Arta Tenului Impecabil"
   - Sottotitolo: (opzionale)
   - Layout: Scegli "Layout Personalizzato" per il design elegante

4. **Aggiungi Immagini**:
   - Clicca "Aggiungi Immagine"
   - Carica l'immagine tramite ImageUploader
   - Aggiungi didascalia (opzionale)
   - Aggiungi Alt Text per SEO
   - Ripeti per tutte le immagini

5. **Configura Pulsante Portfolio** (opzionale):
   - Attiva "Mostra pulsante 'Vedi tutto'"
   - Testo: "VEZI TOT PORTOFOLIUL"
   - URL: "/portfolio" o link esterno

6. **Salva le modifiche**

### Layout Personalizzato - Best Practices

Per ottenere il miglior risultato con il layout personalizzato:

1. **Prima immagine** (grande):
   - Usa un'immagine verticale o quadrata
   - Risoluzione consigliata: 800x1000px o superiore
   - Sarà visualizzata in formato 3:4

2. **Immagini 2-5** (piccole):
   - Usa immagini quadrate
   - Risoluzione consigliata: 600x600px o superiore
   - Saranno visualizzate in formato 1:1

3. **Immagini successive** (se presenti):
   - Non verranno visualizzate nel layout personalizzato
   - Considera di usare un layout diverso o limitare a 5 immagini

## 🎨 Stile e Design

### Colori

- **Background**: Personalizzabile o alternato automaticamente
- **Testo Badge**: #7f756d (grigio caldo)
- **Titolo**: #1e1b14 (nero caldo)
- **Sottotitolo**: #4d453e (grigio scuro)
- **Hover Overlay**: Gradiente nero con opacità

### Tipografia

- **Badge**: Manrope, uppercase, tracking largo
- **Titolo**: Playfair Display, serif, grande
- **Sottotitolo**: Manrope, sans-serif
- **Didascalie**: Manrope, sans-serif

### Animazioni

- **Hover Immagini**: Scale 1.05, durata 700ms
- **Hover Overlay**: Fade in/out, durata 300ms
- **Lightbox**: Fade in/out con backdrop blur

## 🖼️ Lightbox

Quando clicchi su un'immagine, si apre un lightbox con:

- **Immagine a schermo intero**
- **Didascalia** (se presente)
- **Navigazione** con frecce sinistra/destra
- **Chiusura** con X o clic fuori dall'immagine
- **Background**: Nero con opacità 95%

### Controlli Lightbox

- **Freccia Sinistra**: Immagine precedente
- **Freccia Destra**: Immagine successiva
- **X (in alto a destra)**: Chiudi lightbox
- **Clic fuori dall'immagine**: Chiudi lightbox
- **ESC**: (da implementare se necessario)

## 📱 Responsive

### Mobile
- Layout personalizzato: 1 colonna, immagini impilate
- Griglia: 1 colonna
- Pulsante portfolio: Full width

### Tablet (md)
- Layout personalizzato: 2 colonne (1 grande + griglia 2x2)
- Griglia: 2 colonne
- Pulsante portfolio: Auto width

### Desktop (lg)
- Layout personalizzato: 2 colonne ottimizzate
- Griglia: 3-4 colonne (a seconda del layout scelto)
- Pulsante portfolio: Auto width

## 🔧 Struttura Tecnica

### File Modificati

1. **componenti/homepage/SezioneGalleria.tsx**
   - Componente React completamente riscritto
   - Supporto per layout personalizzato
   - Lightbox migliorato
   - Stile elegante e moderno

2. **models/Impostazioni.ts**
   - Aggiunto campo `badge`
   - Aggiunto campo `mostraPulsantePortfolio`
   - Aggiunto campo `testoPulsantePortfolio`
   - Aggiunto campo `urlPulsantePortfolio`
   - Aggiunto layout `grid-custom`

3. **app/(cms)/cms/homepage/page.tsx**
   - Interfaccia CMS migliorata
   - Indicatori visivi per layout personalizzato
   - Gestione pulsante portfolio
   - Validazione e feedback

### Props Componente

```typescript
interface SezioneGalleriaProps {
  config: {
    badge?: string;
    titolo?: string;
    sottotitolo?: string;
    layout?: 'grid-2' | 'grid-3' | 'grid-4' | 'grid-custom' | 'masonry';
    immagini?: Array<{
      url: string;
      didascalia: string;
      alt: string;
    }>;
    mostraPulsantePortfolio?: boolean;
    testoPulsantePortfolio?: string;
    urlPulsantePortfolio?: string;
    coloreSfondo?: string;
    colorePrimario?: string;
    coloreSecondario?: string;
  };
  bgIndex?: number;
}
```

## 📊 Esempi di Configurazione

### Esempio 1: Layout Personalizzato Elegante

```json
{
  "badge": "ARHIVĂ VIZUALĂ",
  "titolo": "Arta Tenului Impecabil",
  "sottotitolo": "",
  "layout": "grid-custom",
  "immagini": [
    {
      "url": "/uploads/gallery/makeup-1.jpg",
      "didascalia": "Makeup natural pentru zi",
      "alt": "Makeup natural elegant"
    },
    {
      "url": "/uploads/gallery/makeup-2.jpg",
      "didascalia": "Pensule profesionale",
      "alt": "Set pensule makeup"
    },
    // ... altre 3 immagini
  ],
  "mostraPulsantePortfolio": true,
  "testoPulsantePortfolio": "VEZI TOT PORTOFOLIUL",
  "urlPulsantePortfolio": "/portfolio"
}
```

### Esempio 2: Griglia Classica

```json
{
  "badge": "GALLERIA",
  "titolo": "I Nostri Lavori",
  "sottotitolo": "Scopri le nostre creazioni",
  "layout": "grid-3",
  "immagini": [
    // ... array di immagini
  ],
  "mostraPulsantePortfolio": false
}
```

## 🚀 Funzionalità Future (Opzionali)

- [ ] Filtri per categoria
- [ ] Caricamento lazy delle immagini
- [ ] Zoom immagini nel lightbox
- [ ] Condivisione social
- [ ] Download immagini
- [ ] Slideshow automatico
- [ ] Integrazione con Instagram

## 📝 Note

- Le immagini vengono caricate nella cartella `/uploads/gallery/`
- Il lightbox supporta la navigazione con tastiera (frecce)
- Le didascalie sono opzionali ma consigliate per l'accessibilità
- L'Alt Text è importante per SEO e accessibilità
- Il layout personalizzato è ottimizzato per 5 immagini esatte

## 🎯 SEO e Accessibilità

- ✅ Alt text per tutte le immagini
- ✅ Semantic HTML (section, button)
- ✅ ARIA labels (da implementare se necessario)
- ✅ Keyboard navigation nel lightbox
- ✅ Focus management
- ✅ Responsive images

## 🐛 Troubleshooting

### Le immagini non si caricano
- Verifica che l'URL sia corretto
- Controlla i permessi della cartella uploads
- Verifica la dimensione del file (max 5MB consigliato)

### Il layout personalizzato non funziona
- Assicurati di avere almeno 5 immagini
- Verifica che il layout sia impostato su "grid-custom"
- Controlla la console per errori

### Il lightbox non si apre
- Verifica che JavaScript sia abilitato
- Controlla la console per errori
- Assicurati che le immagini abbiano URL validi
