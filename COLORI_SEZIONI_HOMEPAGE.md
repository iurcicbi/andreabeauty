# Gestione Colori Sezioni Homepage

## Funzionalità Implementata

È ora possibile decidere dal CMS il colore di background per ogni sezione della homepage. Il sistema offre due modalità:

### 1. Colori Alternati Automatici (Default)
- **Colore Primario**: Utilizzato per le sezioni con indice pari (0, 2, 4, ...)
- **Colore Secondario**: Utilizzato per le sezioni con indice dispari (1, 3, 5, ...)

### 2. Colore Personalizzato per Sezione
Ogni sezione può avere un colore di sfondo personalizzato che sovrascrive l'alternanza automatica.

## Come Utilizzare

### Dal CMS (app/(cms)/cms/homepage/page.tsx)

1. **Impostare i Colori Globali**
   - Nella sezione "Colori Sezioni" in alto
   - Imposta il **Colore Primario** (es. #FFF8F0)
   - Imposta il **Colore Secondario** (es. #F5EEE1)
   - Questi colori verranno alternati automaticamente tra le sezioni

2. **Personalizzare il Colore di una Sezione Specifica**
   - Apri la sezione che vuoi personalizzare
   - Scorri fino in fondo alla configurazione della sezione
   - Nel campo "Colore sfondo (lascia vuoto per alternato)"
   - Inserisci un codice colore esadecimale (es. #FFF8F0)
   - Se lasci vuoto, verrà usato il colore alternato automatico

## Sezioni Supportate

Tutte le sezioni della homepage supportano questa funzionalità:

- ✅ **Hero** - Sezione principale con logo e CTA
- ✅ **Servizi** - Griglia dei servizi
- ✅ **Chi Siamo (About)** - Storia e presentazione
- ✅ **Orari** - Orari di apertura
- ✅ **Recensioni** - Testimonianze clienti
- ✅ **Contatti** - Informazioni di contatto
- ✅ **CTA Finale** - Call-to-action finale
- ✅ **Galleria** - Galleria immagini

## Logica di Funzionamento

Per ogni sezione, il colore di background viene determinato in questo ordine:

1. Se `coloreSfondo` è impostato → usa quel colore
2. Altrimenti, se `bgIndex` è pari → usa `colorePrimario`
3. Altrimenti → usa `coloreSecondario`

```typescript
const bgColor = config.coloreSfondo || 
  (bgIndex % 2 === 0 ? colorePrimario : coloreSecondario);
```

## Modifiche Tecniche

### File Modificati

1. **models/Impostazioni.ts**
   - Aggiunto campo `coloreSfondo: string` a tutte le sezioni nell'interfaccia TypeScript
   - Aggiunto campo `coloreSfondo: { type: String, default: '' }` nello schema Mongoose

2. **app/(cms)/cms/homepage/page.tsx**
   - Già presente l'interfaccia per gestire i colori globali
   - Già presente il campo per il colore personalizzato in ogni sezione

3. **Componenti Sezioni** (già implementati correttamente)
   - `componenti/homepage/SezioneHero.tsx`
   - `componenti/homepage/SezioneServizi.tsx`
   - `componenti/homepage/SezioneAbout.tsx`
   - `componenti/homepage/SezioneOrari.tsx`
   - `componenti/homepage/SezioneRecensioni.tsx`
   - `componenti/homepage/SezioneContatti.tsx`
   - `componenti/homepage/SezioneCtaFinale.tsx`
   - `componenti/homepage/SezioneGalleria.tsx`

## Esempi di Utilizzo

### Esempio 1: Alternanza Automatica
```
Colore Primario: #FFF8F0
Colore Secondario: #F5EEE1

Risultato:
- Hero (indice 0) → #FFF8F0
- Servizi (indice 1) → #F5EEE1
- About (indice 2) → #FFF8F0
- Orari (indice 3) → #F5EEE1
```

### Esempio 2: Colore Personalizzato
```
Colore Primario: #FFF8F0
Colore Secondario: #F5EEE1
Hero.coloreSfondo: #E8D5C4

Risultato:
- Hero (indice 0) → #E8D5C4 (personalizzato)
- Servizi (indice 1) → #F5EEE1
- About (indice 2) → #FFF8F0
```

## Note

- I colori devono essere in formato esadecimale (es. #FFF8F0)
- Se una sezione ha un'immagine di sfondo, il colore potrebbe non essere visibile
- Il campo `coloreSfondo` è opzionale per tutte le sezioni
- I valori di default garantiscono un'esperienza visiva coerente anche senza configurazione

## Compatibilità

- ✅ Compatibile con tutte le sezioni esistenti
- ✅ Retrocompatibile: se il campo non è impostato, usa l'alternanza automatica
- ✅ Nessuna modifica richiesta al database esistente (campo opzionale con default vuoto)
