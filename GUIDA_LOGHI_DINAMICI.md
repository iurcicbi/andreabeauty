# 🎨 Guida Loghi Dinamici

## Panoramica

Il sistema ora supporta **tre loghi diversi** gestibili dinamicamente dal pannello CMS:

1. **Logo Header/Footer** - Mostrato nella navigazione e nel footer
2. **Logo Centrale Homepage** - Logo grande al centro della homepage (opzionale)
3. **Logo Sidebar CMS** - Logo nella sidebar del pannello amministrativo

## Come Configurare i Loghi

### 1. Accedi al Pannello CMS

Vai su `/cms/frontend` nel pannello amministrativo.

### 2. Sezione Loghi

Troverai tre sezioni separate:

#### Logo Header e Footer
- Questo logo appare nella barra di navigazione di tutte le pagine pubbliche
- Appare anche nel footer del sito
- **Campo obbligatorio**: Testo alternativo (per accessibilità)

#### Logo Centrale Homepage (Opzionale)
- Logo grande mostrato al centro della homepage
- Se non specificato, viene usato il logo principale
- Ideale per un logo più elaborato o di dimensioni maggiori

#### Logo Sidebar CMS
- Logo mostrato nella sidebar del pannello amministrativo
- Se non specificato, viene usato il logo principale
- Consigliato: logo più compatto o versione semplificata

### 3. Caricamento Loghi

Per ogni logo puoi:

**Opzione A: Carica File**
- Clicca sull'area di upload
- Seleziona un'immagine dal tuo dispositivo
- Formati supportati: JPG, PNG, GIF, WEBP, SVG
- Dimensione massima: 10MB

**Opzione B: Inserisci URL**
- Incolla l'URL di un'immagine già online
- Esempio: `https://esempio.com/logo.png`

### 4. Anteprima

Dopo il caricamento, vedrai un'anteprima del logo.
Puoi rimuoverlo cliccando sul pulsante "🗑️ Rimuovi logo".

### 5. Salva

Clicca su "💾 Salva Impostazioni" per applicare le modifiche.

## Dove Vengono Mostrati i Loghi

### Logo Header/Footer
- ✅ Homepage (barra di navigazione)
- ✅ Pagina Contatti (barra di navigazione)
- ✅ Pagina Prenotazione (barra di navigazione)
- ✅ Footer (tutte le pagine pubbliche)

### Logo Centrale Homepage
- ✅ Homepage (sezione hero centrale)
- Se presente, sostituisce il titolo testuale

### Logo Sidebar CMS
- ✅ Sidebar del pannello CMS
- Visibile in tutte le pagine amministrative

## Comportamento Automatico

### Fallback Intelligente
Se un logo specifico non è configurato:
- **Logo Centrale** → usa il Logo Header/Footer
- **Logo CMS** → usa il Logo Header/Footer
- Se nessun logo è presente → mostra icona di default

### Gestione Errori
Se un'immagine non si carica:
- Il logo viene nascosto automaticamente
- Viene mostrata l'icona di default
- Nessun errore visibile all'utente

## Consigli per le Dimensioni

### Logo Header/Footer
- Altezza consigliata: 40-60px
- Formato: orizzontale o quadrato
- Sfondo: trasparente (PNG/SVG)

### Logo Centrale Homepage
- Altezza consigliata: 150-250px
- Formato: qualsiasi
- Può essere più elaborato

### Logo Sidebar CMS
- Altezza consigliata: 30-50px
- Formato: compatto, orizzontale
- Sfondo: trasparente

## Accessibilità

Il sistema include automaticamente:
- Attributi `alt` per screen reader
- Gestione errori di caricamento
- Fallback testuali quando necessario

## Modifiche Tecniche

### File Modificati

1. **models/Impostazioni.js**
   - Aggiunti campi: `logoCentrale`, `logoCMS`, `logoAlt`

2. **app/(cms)/cms/frontend/page.tsx**
   - Interfaccia per gestire i tre loghi
   - Upload separato per ogni logo

3. **componenti/cms/Sidebar.tsx**
   - Carica e mostra il logo CMS dinamico
   - Fallback al logo principale

4. **componenti/layout/Footer.tsx**
   - Usa il logo principale con alt text

5. **app/page.tsx**
   - Mostra logo centrale se disponibile
   - Fallback al logo principale

6. **app/(utente)/contatti/page.tsx**
   - Header con logo dinamico

7. **app/(utente)/prenotazione/page.tsx**
   - Header con logo dinamico

## API Utilizzate

Tutti i componenti caricano le impostazioni da:
```
GET /api/impostazioni
```

Risposta include:
```json
{
  "logo": "url-logo-principale",
  "logoAlt": "testo-alternativo",
  "logoCentrale": "url-logo-centrale",
  "logoCMS": "url-logo-cms",
  "nomeAzienda": "Nome Azienda"
}
```

## Supporto

Per problemi o domande, verifica:
1. I file sono stati caricati correttamente
2. Gli URL sono accessibili
3. Le immagini rispettano i limiti di dimensione
4. Il formato è supportato
