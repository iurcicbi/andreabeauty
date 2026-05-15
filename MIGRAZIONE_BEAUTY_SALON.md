# Guida Migrazione da Barbershop a Beauty Salon

## Panoramica

Questa guida descrive la trasformazione del sistema da barbershop (dove tutti i barber possono fare tutti i servizi) a beauty salon (dove ogni specialista ha competenze specifiche tramite relazioni many-to-many).

## Modifiche Principali

### 1. Database - Nuovi Schemi

#### Schema Specialista (`utils/mongo/schemi/Specialista.ts`)
- Sostituisce il concetto di "Barber"
- Collection: `specialisti`
- Campi principali:
  - `utente`: ObjectId (riferimento a users)
  - `biografia`: string
  - `descrizioneCompetenze`: string (nuovo campo specifico per beauty)
  - `orariSettimanali`: object (invariato)
  - `giorniChiusura`: array (invariato)
  - `impostazioni`: object (invariato)
  - `attivo`: boolean

#### Schema SpecialistaServizio (`utils/mongo/schemi/SpecialistaServizio.ts`)
- **NUOVO** - Tabella pivot per relazione many-to-many
- Collection: `specialisti_servizi`
- Campi:
  - `specialista`: ObjectId (ref: specialisti)
  - `servizio`: ObjectId (ref: services)
  - `attivo`: boolean
  - `note`: string (opzionale)
- Indici:
  - Compound unique: `(specialista, servizio)`
  - Index su `specialista`
  - Index su `servizio`

#### Schema Appuntamento (aggiornato)
- Aggiunto campo `specialista`: ObjectId (ref: specialisti)
- Mantenuto campo `barber` per retrocompatibilità
- Aggiornato enum `cancelledBy`: include 'specialista'

### 2. API Backend

#### Nuove API Specialisti

**GET /api/specialisti**
- Lista specialisti con filtro opzionale per servizio
- Query params:
  - `servizioId`: filtra specialisti che possono fare quel servizio
  - `attivi`: true/false (default: true)
- Response: array di specialisti con servizi associati

**GET /api/specialisti/[id]**
- Dettagli completi specialista
- Include servizi associati popolati

**PUT /api/specialisti/[id]**
- Aggiorna dati specialista
- Body: biografia, descrizioneCompetenze, telefono, orariSettimanali, giorniChiusura, impostazioni, attivo

**DELETE /api/specialisti/[id]**
- Elimina specialista
- Elimina automaticamente tutte le associazioni servizi

**GET /api/specialisti/[id]/disponibilita**
- Calcola slot orari disponibili
- Query params: `data` (YYYY-MM-DD), `durata` (minuti)
- Logica identica a quella dei barber

**GET /api/specialisti/[id]/servizi**
- Lista servizi associati allo specialista

**POST /api/specialisti/[id]/servizi**
- Associa servizio allo specialista
- Body: `servizioId`, `note` (opzionale)

**DELETE /api/specialisti/[id]/servizi?servizioId=xxx**
- Rimuove associazione servizio-specialista

#### Nuove API Servizi

**GET /api/servizi/[id]/specialisti**
- Lista specialisti che possono eseguire il servizio
- Filtra solo specialisti attivi
- Response: array di specialisti con dati completi

### 3. Frontend - Nuovo Flusso di Prenotazione

#### Flusso Vecchio (Barbershop)
1. Scegli Barber
2. Scegli Servizio
3. Scegli Data
4. Scegli Ora
5. Conferma

#### Flusso Nuovo (Beauty Salon)
1. **Scegli Servizio** ← INVERTITO
2. **Scegli Specialista** (filtrato per servizio) ← INVERTITO
3. Scegli Data
4. Scegli Ora
5. Conferma

#### Componente Prenotazione
- File originale: `app/(utente)/prenotazione/page.tsx` (mantieni per retrocompatibilità)
- Nuovo file: Crea `app/(utente)/prenotazione-beauty/page.tsx` con nuovo flusso

#### Modifiche UI Necessarie
1. **Step 1 - Servizi**:
   - Mostra tutti i servizi attivi
   - Card con nome, descrizione, durata, prezzo, categoria
   - Click su servizio → carica specialisti per quel servizio

2. **Step 2 - Specialisti**:
   - Chiamata: `GET /api/servizi/[servizioId]/specialisti`
   - Mostra solo specialisti abilitati per il servizio selezionato
   - Card con nome, biografia, badge dei servizi offerti
   - Click su specialista → carica giorniChiusura

3. **Step 3 - Data**:
   - Calendario con giorni disponibili
   - Disabilita date passate, domeniche, giorniChiusura dello specialista

4. **Step 4 - Ora**:
   - Chiamata: `GET /api/specialisti/[specialistaId]/disponibilita?data=xxx&durata=xxx`
   - Mostra slot orari disponibili

5. **Step 5 - Conferma**:
   - Form dati cliente
   - Riepilogo completo
   - POST `/api/appuntamenti` con `specialistaId` invece di `barberId`

### 4. CMS - Gestione Associazioni

#### Pagina Specialisti (da creare)
- Lista specialisti con badge servizi associati
- Pulsante "Gestisci Servizi" per ogni specialista
- Modal per aggiungere/rimuovere servizi

#### Pagina Servizi (da aggiornare)
- Mostra numero specialisti associati
- Link per vedere quali specialisti possono fare il servizio

#### Componente Gestione Associazioni
```tsx
// Esempio struttura
<SpecialistaServiziManager 
  specialistaId={id}
  serviziAssociati={servizi}
  onAggiungi={(servizioId) => POST /api/specialisti/[id]/servizi}
  onRimuovi={(servizioId) => DELETE /api/specialisti/[id]/servizi}
/>
```

## Piano di Migrazione

### Fase 1: Preparazione Database
1. ✅ Creare schema `Specialista`
2. ✅ Creare schema `SpecialistaServizio`
3. ✅ Aggiornare schema `Appuntamento`
4. Migrare dati esistenti da `barbers` a `specialisti`
5. Creare associazioni iniziali (tutti gli specialisti → tutti i servizi per retrocompatibilità)

### Fase 2: Backend API
1. ✅ Implementare API `/api/specialisti`
2. ✅ Implementare API `/api/specialisti/[id]`
3. ✅ Implementare API `/api/specialisti/[id]/disponibilita`
4. ✅ Implementare API `/api/specialisti/[id]/servizi`
5. ✅ Implementare API `/api/servizi/[id]/specialisti`
6. Aggiornare API `/api/appuntamenti` per supportare `specialistaId`

### Fase 3: Frontend Prenotazione
1. Creare nuovo componente `app/(utente)/prenotazione-beauty/page.tsx`
2. Implementare Step 1: Selezione Servizio
3. Implementare Step 2: Selezione Specialista (filtrato)
4. Implementare Step 3: Selezione Data
5. Implementare Step 4: Selezione Ora
6. Implementare Step 5: Conferma
7. Testare flusso completo

### Fase 4: CMS
1. Creare pagina `/cms/specialisti`
2. Creare componente gestione associazioni
3. Aggiornare pagina `/cms/servizi` con info specialisti
4. Aggiornare pagina `/cms/appuntamenti` per mostrare specialista

### Fase 5: Testing e Deploy
1. Test end-to-end flusso prenotazione
2. Test gestione associazioni nel CMS
3. Verifica disponibilità corretta
4. Deploy graduale (feature flag?)

## Script di Migrazione Dati

```javascript
// scripts/migra-barber-a-specialisti.js
// Esegui questo script per migrare i dati esistenti

const mongoose = require('mongoose');
const Barber = require('./utils/mongo/schemi/Barber');
const Specialista = require('./utils/mongo/schemi/Specialista');
const SpecialistaServizio = require('./utils/mongo/schemi/SpecialistaServizio');
const Servizio = require('./utils/mongo/schemi/Servizio');
const Appuntamento = require('./utils/mongo/schemi/Appuntamento');

async function migraDati() {
  try {
    console.log('🚀 Inizio migrazione da Barber a Specialisti...');
    
    // 1. Copia tutti i barber come specialisti
    const barbers = await Barber.find({});
    console.log(`📋 Trovati ${barbers.length} barber da migrare`);
    
    const mappaBarberSpecialista = new Map();
    
    for (const barber of barbers) {
      const specialista = await Specialista.create({
        utente: barber.utente,
        biografia: barber.biografia,
        descrizioneCompetenze: barber.specializzazioni?.join(', ') || '',
        telefono: barber.telefono,
        orariSettimanali: barber.orariSettimanali,
        giorniChiusura: barber.giorniChiusura,
        impostazioni: barber.impostazioni,
        attivo: barber.attivo,
      });
      
      mappaBarberSpecialista.set(barber._id.toString(), specialista._id);
      console.log(`✅ Migrato barber ${barber._id} → specialista ${specialista._id}`);
    }
    
    // 2. Associa tutti gli specialisti a tutti i servizi (retrocompatibilità)
    const servizi = await Servizio.find({ attivo: true });
    console.log(`📋 Trovati ${servizi.length} servizi attivi`);
    
    let associazioniCreate = 0;
    for (const [barberId, specialistaId] of mappaBarberSpecialista) {
      for (const servizio of servizi) {
        await SpecialistaServizio.create({
          specialista: specialistaId,
          servizio: servizio._id,
          attivo: true,
          note: 'Migrazione automatica da sistema barber',
        });
        associazioniCreate++;
      }
    }
    console.log(`✅ Create ${associazioniCreate} associazioni specialista-servizio`);
    
    // 3. Aggiorna appuntamenti esistenti
    const appuntamenti = await Appuntamento.find({ barber: { $exists: true } });
    console.log(`📋 Trovati ${appuntamenti.length} appuntamenti da aggiornare`);
    
    let appuntamentiAggiornati = 0;
    for (const app of appuntamenti) {
      const specialistaId = mappaBarberSpecialista.get(app.barber.toString());
      if (specialistaId) {
        await Appuntamento.updateOne(
          { _id: app._id },
          { $set: { specialista: specialistaId } }
        );
        appuntamentiAggiornati++;
      }
    }
    console.log(`✅ Aggiornati ${appuntamentiAggiornati} appuntamenti`);
    
    console.log('🎉 Migrazione completata con successo!');
    console.log(`
📊 Riepilogo:
- Specialisti creati: ${mappaBarberSpecialista.size}
- Associazioni create: ${associazioniCreate}
- Appuntamenti aggiornati: ${appuntamentiAggiornati}
    `);
    
  } catch (error) {
    console.error('❌ Errore durante la migrazione:', error);
    throw error;
  }
}

// Esegui migrazione
migraDati()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
```

## Retrocompatibilità

### API Barber (mantenere temporaneamente)
- Mantieni `/api/barber` come alias di `/api/specialisti`
- Aggiungi deprecation warning nei log
- Pianifica rimozione in versione futura

### Frontend
- Mantieni `/prenotazione` per utenti che hanno link salvati
- Aggiungi redirect automatico a `/prenotazione-beauty` dopo X mesi
- Mostra banner informativo sulla nuova esperienza

### Database
- Campo `barber` in Appuntamento mantenuto per query storiche
- Nuovi appuntamenti usano solo `specialista`
- Collection `barbers` può essere mantenuta per backup

## Checklist Finale

- [ ] Schemi database creati
- [ ] Script migrazione dati eseguito
- [ ] API specialisti testate
- [ ] API servizi/specialisti testata
- [ ] Nuovo frontend prenotazione funzionante
- [ ] CMS gestione associazioni implementato
- [ ] Test end-to-end completati
- [ ] Documentazione aggiornata
- [ ] Deploy in produzione
- [ ] Monitoraggio errori attivo

## Note Importanti

1. **Indici Database**: Assicurati che gli indici su `specialisti_servizi` siano creati correttamente per performance ottimali

2. **Validazione**: Quando un utente prenota, verifica sempre che l'associazione specialista-servizio esista e sia attiva

3. **Cache**: Considera di cachare le query `GET /api/servizi/[id]/specialisti` per ridurre carico database

4. **Notifiche**: Aggiorna i template WhatsApp/Email per usare "specialista" invece di "barber"

5. **Analytics**: Traccia quali servizi sono più richiesti e quali specialisti sono più prenotati

## Supporto

Per domande o problemi durante la migrazione, consulta:
- Documentazione API: `/docs/api`
- Schema database: `/docs/database`
- Issue tracker: GitHub Issues
