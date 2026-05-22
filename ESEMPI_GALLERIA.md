# 📸 Esempi Pratici - Galleria Dinamica

## 🎯 Esempio Completo: Beauty Salon

### Configurazione CMS

```javascript
{
  // Sezione Header
  "badge": "ARHIVĂ VIZUALĂ",
  "titolo": "Arta Tenului Impecabil",
  "sottotitolo": "", // Lascia vuoto per design minimalista
  
  // Layout
  "layout": "grid-custom", // Layout personalizzato elegante
  
  // Pulsante Portfolio
  "mostraPulsantePortfolio": true,
  "testoPulsantePortfolio": "VEZI TOT PORTOFOLIUL",
  "urlPulsantePortfolio": "/portfolio",
  
  // Immagini (minimo 5 per layout personalizzato)
  "immagini": [
    {
      "url": "/uploads/gallery/makeup-completo.jpg",
      "didascalia": "Makeup natural pentru zi",
      "alt": "Makeup natural elegant pentru zi"
    },
    {
      "url": "/uploads/gallery/pensule.jpg",
      "didascalia": "Pensule profesionale",
      "alt": "Set pensule makeup profesionale"
    },
    {
      "url": "/uploads/gallery/occhi.jpg",
      "didascalia": "Detaliu machiaj ochi",
      "alt": "Close-up machiaj ochi cu eyeliner"
    },
    {
      "url": "/uploads/gallery/prodotti.jpg",
      "didascalia": "Produse cosmetice premium",
      "alt": "Produse cosmetice de calitate"
    },
    {
      "url": "/uploads/gallery/labbra.jpg",
      "didascalia": "Ruj mat elegant",
      "alt": "Detaliu buze cu ruj mat"
    }
  ],
  
  // Colore sfondo (opzionale)
  "coloreSfondo": "" // Lascia vuoto per alternanza automatica
}
```

### Risultato Visivo

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│  ARHIVĂ VIZUALĂ                    [VEZI TOT PORTOFOLIUL] │
│                                                            │
│  Arta Tenului Impecabil                                   │
│                                                            │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌─────────────────┐  ┌──────────┬──────────┐            │
│  │                 │  │          │          │            │
│  │                 │  │  Pensule │  Occhi   │            │
│  │  Makeup         │  │          │          │            │
│  │  Completo       │  ├──────────┼──────────┤            │
│  │  (Grande)       │  │          │          │            │
│  │                 │  │ Prodotti │  Labbra  │            │
│  │                 │  │          │          │            │
│  └─────────────────┘  └──────────┴──────────┘            │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

## 🎨 Varianti di Layout

### 1. Layout Personalizzato (Consigliato)

**Quando usare:**
- Hai 5 immagini di qualità
- Vuoi un design elegante e moderno
- Hai 1 immagine principale da evidenziare

**Esempio:**
```
Immagine 1 (grande): Foto principale del lavoro
Immagini 2-5 (piccole): Dettagli, close-up, varianti
```

### 2. Grid 3 Colonne (Classico)

**Quando usare:**
- Hai molte immagini (6+)
- Vuoi dare uguale importanza a tutte
- Design più tradizionale

**Esempio:**
```
┌──────┬──────┬──────┐
│ IMG1 │ IMG2 │ IMG3 │
├──────┼──────┼──────┤
│ IMG4 │ IMG5 │ IMG6 │
├──────┼──────┼──────┤
│ IMG7 │ IMG8 │ IMG9 │
└──────┴──────┴──────┘
```

### 3. Grid 2 Colonne (Minimalista)

**Quando usare:**
- Hai poche immagini (4-6)
- Vuoi immagini più grandi
- Design pulito e semplice

**Esempio:**
```
┌───────────┬───────────┐
│   IMG1    │   IMG2    │
├───────────┼───────────┤
│   IMG3    │   IMG4    │
└───────────┴───────────┘
```

### 4. Grid 4 Colonne (Compatto)

**Quando usare:**
- Hai molte immagini (12+)
- Vuoi mostrare varietà
- Spazio limitato

**Esempio:**
```
┌─────┬─────┬─────┬─────┐
│ IM1 │ IM2 │ IM3 │ IM4 │
├─────┼─────┼─────┼─────┤
│ IM5 │ IM6 │ IM7 │ IM8 │
└─────┴─────┴─────┴─────┘
```

### 5. Masonry (Pinterest Style)

**Quando usare:**
- Hai immagini di dimensioni diverse
- Vuoi un look dinamico
- Design creativo

**Esempio:**
```
┌────┬────┬────┐
│ I1 │ I3 │ I5 │
│    ├────┤    │
│    │ I4 │    │
├────┤    ├────┤
│ I2 │    │ I6 │
│    │    │    │
└────┴────┴────┘
```

## 💡 Best Practices

### Dimensioni Immagini Consigliate

#### Layout Personalizzato
```
Immagine 1 (grande):
- Larghezza: 800-1200px
- Altezza: 1000-1600px
- Aspect ratio: 3:4
- Formato: JPG/WebP
- Peso: < 500KB

Immagini 2-5 (piccole):
- Larghezza: 600-800px
- Altezza: 600-800px
- Aspect ratio: 1:1
- Formato: JPG/WebP
- Peso: < 300KB
```

#### Grid Standard
```
Tutte le immagini:
- Larghezza: 800-1000px
- Altezza: 800-1000px
- Aspect ratio: 1:1
- Formato: JPG/WebP
- Peso: < 400KB
```

### Ottimizzazione Immagini

**Prima di caricare:**
1. Ridimensiona alle dimensioni consigliate
2. Comprimi con strumenti come TinyPNG
3. Converti in WebP se possibile
4. Mantieni qualità 80-85%

**Strumenti consigliati:**
- [TinyPNG](https://tinypng.com/) - Compressione
- [Squoosh](https://squoosh.app/) - Conversione WebP
- Photoshop - Esporta per Web
- GIMP - Esporta ottimizzato

### Didascalie Efficaci

**Buone didascalie:**
- ✅ "Makeup natural pentru zi"
- ✅ "Pensule profesionale din păr natural"
- ✅ "Detaliu machiaj ochi cu eyeliner"
- ✅ "Ruj mat în nuanță nude"

**Didascalie da evitare:**
- ❌ "Foto 1"
- ❌ "IMG_1234"
- ❌ "Clicca qui"
- ❌ Troppo lunghe (>50 caratteri)

### Alt Text per SEO

**Buoni alt text:**
- ✅ "Makeup natural elegant pentru zi"
- ✅ "Set pensule makeup profesionale"
- ✅ "Close-up machiaj ochi cu eyeliner"
- ✅ "Produse cosmetice premium pentru ten"

**Alt text da evitare:**
- ❌ "Immagine"
- ❌ "Foto"
- ❌ Keyword stuffing
- ❌ Troppo generici

## 🎯 Casi d'Uso Specifici

### Beauty Salon / Makeup Artist

```javascript
{
  "badge": "PORTFOLIO",
  "titolo": "Transformări Spectaculoase",
  "layout": "grid-custom",
  "immagini": [
    "Before/After principale",
    "Makeup de seară",
    "Makeup de zi",
    "Makeup mireasa",
    "Makeup artistic"
  ]
}
```

### Fotografo

```javascript
{
  "badge": "RECENT WORK",
  "titolo": "Latest Projects",
  "layout": "masonry",
  "immagini": [
    "Ritratto principale",
    "Paesaggio",
    "Street photography",
    "Matrimonio",
    "Eventi",
    "Fashion"
  ]
}
```

### Ristorante

```javascript
{
  "badge": "I NOSTRI PIATTI",
  "titolo": "Cucina Italiana Autentica",
  "layout": "grid-3",
  "immagini": [
    "Piatto signature",
    "Antipasti",
    "Primi piatti",
    "Secondi",
    "Dolci",
    "Vini"
  ]
}
```

### Parrucchiere

```javascript
{
  "badge": "HAIR GALLERY",
  "titolo": "Stile e Creatività",
  "layout": "grid-custom",
  "immagini": [
    "Taglio principale",
    "Colore",
    "Styling",
    "Acconciature",
    "Trattamenti"
  ]
}
```

## 📱 Responsive Preview

### Desktop (1920px)
```
┌──────────────────────────────────────────────────┐
│  BADGE                        [PULSANTE]         │
│  Titolo Grande                                   │
├──────────────────────────────────────────────────┤
│  ┌────────────┐  ┌─────┬─────┐                  │
│  │            │  │  2  │  3  │                  │
│  │     1      │  ├─────┼─────┤                  │
│  │   Grande   │  │  4  │  5  │                  │
│  └────────────┘  └─────┴─────┘                  │
└──────────────────────────────────────────────────┘
```

### Tablet (768px)
```
┌────────────────────────────┐
│  BADGE        [PULSANTE]   │
│  Titolo                    │
├────────────────────────────┤
│  ┌──────┐  ┌────┬────┐    │
│  │      │  │ 2  │ 3  │    │
│  │  1   │  ├────┼────┤    │
│  │      │  │ 4  │ 5  │    │
│  └──────┘  └────┴────┘    │
└────────────────────────────┘
```

### Mobile (375px)
```
┌──────────────┐
│  BADGE       │
│  Titolo      │
│ [PULSANTE]   │
├──────────────┤
│              │
│      1       │
│              │
├──────────────┤
│   2  │   3   │
├──────┼───────┤
│   4  │   5   │
└──────────────┘
```

## 🎨 Personalizzazione Colori

### Esempio 1: Toni Caldi
```javascript
{
  "coloreSfondo": "#FFF8F0", // Beige chiaro
  // Badge: #7f756d (grigio caldo)
  // Titolo: #1e1b14 (nero caldo)
}
```

### Esempio 2: Toni Freddi
```javascript
{
  "coloreSfondo": "#F0F4F8", // Azzurro chiaro
  // Badge: #6b7280 (grigio freddo)
  // Titolo: #1f2937 (nero freddo)
}
```

### Esempio 3: Neutro
```javascript
{
  "coloreSfondo": "#FFFFFF", // Bianco
  // Badge: #6b7280 (grigio)
  // Titolo: #111827 (nero)
}
```

## ✅ Checklist Pre-Pubblicazione

Prima di pubblicare la galleria, verifica:

- [ ] Almeno 5 immagini caricate (per layout personalizzato)
- [ ] Tutte le immagini hanno Alt Text
- [ ] Didascalie aggiunte (opzionale ma consigliato)
- [ ] Immagini ottimizzate (< 500KB)
- [ ] Badge e titolo configurati
- [ ] Pulsante portfolio configurato (se necessario)
- [ ] Layout scelto appropriato
- [ ] Colore sfondo impostato (o lasciato alternato)
- [ ] Testato su mobile
- [ ] Testato su tablet
- [ ] Testato su desktop
- [ ] Lightbox funzionante
- [ ] Navigazione frecce funzionante

## 🚀 Vai Live!

Una volta completata la checklist:

1. Salva le modifiche nel CMS
2. Vai alla homepage
3. Scorri fino alla sezione galleria
4. Verifica che tutto sia perfetto
5. Condividi con i tuoi clienti! 🎉

---

**Hai domenti?** Consulta `GALLERIA_DINAMICA.md` per la documentazione completa.
