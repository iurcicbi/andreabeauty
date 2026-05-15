/**
 * MODELLO IMPOSTAZIONI GLOBALI
 * 
 * Gestisce tutte le impostazioni dinamiche del sito:
 * - Logo e branding
 * - Informazioni azienda
 * - Contatti
 * - Orari
 * - Colori e stili
 * - Testi e contenuti
 */

import mongoose, { Schema, Model, Document } from 'mongoose';

// Interfaccia per il documento
export interface IImpostazioni extends Document {
  // BRANDING
  logo: string;
  logoAlt: string;
  logoCentrale: string;
  logoCMS: string;
  favicon: string;
  
  // INFORMAZIONI AZIENDA
  nomeAzienda: string;
  tagline: string;
  descrizione: string;
  
  // CONTATTI
  telefono: string;
  email: string;
  whatsapp: string;
  
  // INDIRIZZO
  indirizzo: string;
  citta: string;
  cap: string;
  provincia: string;
  paese: string;
  coordinate: {
    lat?: number;
    lng?: number;
  };
  
  // ORARI DI APERTURA
  orariApertura: {
    lunedi: string;
    martedi: string;
    mercoledi: string;
    giovedi: string;
    venerdi: string;
    sabato: string;
    domenica: string;
  };
  
  // SOCIAL MEDIA
  social: {
    facebook: string;
    instagram: string;
    twitter: string;
    linkedin: string;
    tiktok: string;
    youtube: string;
  };
  
  // TESTI HOMEPAGE
  testiHomepage: {
    titoloHero: string;
    sottotitoloHero: string;
    badgeHero: string;
    testoCtaPrimario: string;
    testoCtaSecondario: string;
    titoloServizi: string;
    sottotitoloServizi: string;
    titoloOrari: string;
    sottotitoloOrari: string;
    titoloCtaFinale: string;
    sottotitoloCtaFinale: string;
  };
  
  // TESTI PRENOTAZIONE
  testiPrenotazione: {
    titoloPagina: string;
    sottotitoloPagina: string;
    stepSpecialist: string;
    stepServizio: string;
    stepData: string;
    stepOrario: string;
    stepConferma: string;
  };
  
  // COLORI E STILI
  tema: {
    colorePrimario: string;
    coloreSecondario: string;
    coloreAccento: string;
    fontPrimario: string;
    fontSecondario: string;
  };
  
  // SEO
  seo: {
    titoloPagina: string;
    descrizioneMeta: string;
    keywords: string;
    ogImage: string;
  };
  
  // IMMAGINI
  immagini: {
    heroBackground: string;
    serviziBackground: string;
    aboutImage: string;
  };
  
  // FUNZIONALITÀ
  funzionalita: {
    mostraOrari: boolean;
    mostraServizi: boolean;
    mostraSocial: boolean;
    mostraContatti: boolean;
    abilitaPrenotazioni: boolean;
    richiestaConfermaEmail: boolean;
    oreAnticipo: number; // ore prima dell'appuntamento per inviare richiesta conferma
  };
  
  // METADATA
  ultimaModifica: Date;
  modificatoDa: string;
}

// Interfaccia per i metodi statici
export interface IImpostazioniModel extends Model<IImpostazioni> {
  getImpostazioni(): Promise<IImpostazioni>;
  aggiornaImpostazioni(dati: Partial<IImpostazioni>): Promise<IImpostazioni>;
}

const ImpostazioniSchema = new Schema<IImpostazioni, IImpostazioniModel>({
  // BRANDING
  logo: {
    type: String,
    default: '',
  },
  logoAlt: {
    type: String,
    default: '',
  },
  logoCentrale: {
    type: String,
    default: '',
  },
  logoCMS: {
    type: String,
    default: '',
  },
  favicon: {
    type: String,
    default: '',
  },
  
  // INFORMAZIONI AZIENDA
  nomeAzienda: {
    type: String,
    required: true,
    default: 'Beauty Salon'
  },
  tagline: {
    type: String,
    default: 'Il tuo stile, la nostra passione'
  },
  descrizione: {
    type: String,
    default: 'Beauty salon booking portal'
  },
  
  // CONTATTI
  telefono: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    default: ''
  },
  whatsapp: {
    type: String,
    default: ''
  },
  
  // INDIRIZZO
  indirizzo: {
    type: String,
    default: ''
  },
  citta: {
    type: String,
    default: ''
  },
  cap: {
    type: String,
    default: ''
  },
  provincia: {
    type: String,
    default: ''
  },
  paese: {
    type: String,
    default: 'Italia'
  },
  coordinate: {
    lat: { type: Number },
    lng: { type: Number }
  },
  
  // ORARI DI APERTURA
  orariApertura: {
    lunedi: { type: String, default: '09:00 - 19:00' },
    martedi: { type: String, default: '09:00 - 19:00' },
    mercoledi: { type: String, default: '09:00 - 19:00' },
    giovedi: { type: String, default: '09:00 - 19:00' },
    venerdi: { type: String, default: '09:00 - 19:00' },
    sabato: { type: String, default: '09:00 - 18:00' },
    domenica: { type: String, default: 'Chiuso' }
  },
  
  // SOCIAL MEDIA
  social: {
    facebook: { type: String, default: '' },
    instagram: { type: String, default: '' },
    twitter: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    tiktok: { type: String, default: '' },
    youtube: { type: String, default: '' }
  },
  
  // TESTI HOMEPAGE
  testiHomepage: {
    titoloHero: { type: String, default: '' },
    sottotitoloHero: { type: String, default: '' },
    badgeHero: { type: String,     default: 'Premium Beauty Salon' },
    testoCtaPrimario: { type: String, default: 'PRENOTA APPUNTAMENTO' },
    testoCtaSecondario: { type: String, default: 'DOVE SIAMO' },
    titoloServizi: { type: String, default: 'I NOSTRI SERVIZI' },
    sottotitoloServizi: { type: String,     default: 'Quality and professionalism for your perfect look' },
    titoloOrari: { type: String, default: 'ORARI DI APERTURA' },
    sottotitoloOrari: { type: String,     default: 'We are here for you' },
    titoloCtaFinale: { type: String,     default: 'READY FOR YOUR NEW LOOK?' },
    sottotitoloCtaFinale: { type: String,     default: 'Book your appointment now and trust our professionals' }
  },
  
  // TESTI PRENOTAZIONE
  testiPrenotazione: {
    titoloPagina: { type: String, default: 'PRENOTA APPUNTAMENTO' },
    sottotitoloPagina: { type: String, default: 'Semplice, veloce, professionale' },
    stepSpecialist: { type: String,     default: 'CHOOSE YOUR SPECIALIST' },
    stepServizio: { type: String, default: 'SCEGLI IL SERVIZIO' },
    stepData: { type: String, default: 'SCEGLI LA DATA' },
    stepOrario: { type: String, default: 'SCEGLI L\'ORARIO' },
    stepConferma: { type: String, default: 'CONFERMA PRENOTAZIONE' }
  },
  
  // COLORI E STILI
  tema: {
    colorePrimario: { type: String, default: '#000000' },
    coloreSecondario: { type: String, default: '#FFFFFF' },
    coloreAccento: { type: String, default: '#FFFFFF' },
    fontPrimario: { type: String, default: 'system-ui' },
    fontSecondario: { type: String, default: 'system-ui' }
  },
  
  // SEO
  seo: {
    titoloPagina: { type: String,     default: 'Beauty Salon - Book your appointment' },
    descrizioneMeta: { type: String, default: 'Portale di prenotazione per il tuo beauty salon di fiducia' },
    keywords: { type: String, default: 'beauty salon, makeup, aesthetic, skincare, booking' },
    ogImage: { type: String, default: '' }
  },
  
  // IMMAGINI
  immagini: {
    heroBackground: { type: String, default: '' },
    serviziBackground: { type: String, default: '' },
    aboutImage: { type: String, default: '' }
  },
  
  // FUNZIONALITÀ
  funzionalita: {
    mostraOrari: { type: Boolean, default: true },
    mostraServizi: { type: Boolean, default: true },
    mostraSocial: { type: Boolean, default: true },
    mostraContatti: { type: Boolean, default: true },
    abilitaPrenotazioni: { type: Boolean, default: true },
    richiestaConfermaEmail: { type: Boolean, default: false },
    oreAnticipo: { type: Number, default: 24 } // default 24 ore prima
  },
  
  // METADATA
  ultimaModifica: {
    type: Date,
    default: Date.now
  },
  modificatoDa: {
    type: String,
    default: 'Sistema'
  }
}, {
  timestamps: true
});

// Metodi statici
ImpostazioniSchema.statics.getImpostazioni = async function() {
  let impostazioni = await this.findOne();
  if (!impostazioni) {
    impostazioni = await this.create({});
  }
  return impostazioni;
};

ImpostazioniSchema.statics.aggiornaImpostazioni = async function(dati: Partial<IImpostazioni>) {
  let impostazioni = await this.findOne();
  if (!impostazioni) {
    impostazioni = await this.create(dati);
  } else {
    Object.assign(impostazioni, dati);
    impostazioni.ultimaModifica = new Date();
    await impostazioni.save();
  }
  return impostazioni;
};

const Impostazioni = (mongoose.models.Impostazioni as IImpostazioniModel) || 
  mongoose.model<IImpostazioni, IImpostazioniModel>('Impostazioni', ImpostazioniSchema);

export default Impostazioni;
