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
  
  // SEZIONI DINAMICHE HOMEPAGE
  sezioniHomepage: {
    colorePrimario: string;
    coloreSecondario: string;
    hero: {
      attiva: boolean;
      ordine: number;
      titolo: string;
      sottotitolo: string;
      badge: string;
      testoCtaPrimario: string;
      urlCtaPrimario: string;
      testoCtaSecondario: string;
      urlCtaSecondario: string;
      immagineBackground: string;
      mostraLogo: boolean;
      mostraInfoRapide: boolean;
      coloreSfondo: string;
    };
    servizi: {
      attiva: boolean;
      mostraNelMenu: boolean;
      nomeMenu: string;
      ordine: number;
      titolo: string;
      sottotitolo: string;
      descrizione: string;
      badge: string;
      immagineBackground: string;
      layoutGriglia: 'grid-2' | 'grid-3' | 'grid-4';
      stileCard: 'classic' | 'minimal' | 'exploreaza';
      mostraPrezzi: boolean;
      mostraDurata: boolean;
      serviziSelezionati: string[];
      coloreSfondo: string;
    };
    about: {
      attiva: boolean;
      mostraNelMenu: boolean;
      nomeMenu: string;
      ordine: number;
      titolo: string;
      sottotitolo: string;
      descrizione: string;
      immagine: string;
      nomeFondatore: string;
      ruoloFondatore: string;
      testoCta: string;
      urlCta: string;
      dettagli: {
        titolo: string;
        descrizione: string;
        icona: string;
      }[];
      statistiche: {
        anni: { valore: string; label: string; };
        clienti: { valore: string; label: string; };
        qualita: { valore: string; label: string; };
      };
      coloreSfondo: string;
    };
    orari: {
      attiva: boolean;
      mostraNelMenu: boolean;
      nomeMenu: string;
      ordine: number;
      titolo: string;
      sottotitolo: string;
      descrizione: string;
      coloreSfondo: string;
    };
    recensioni: {
      attiva: boolean;
      mostraNelMenu: boolean;
      nomeMenu: string;
      ordine: number;
      badge: string;
      titolo: string;
      sottotitolo: string;
      numeroMassimo: number;
      mostraNome: boolean;
      mostraServizio: boolean;
      mostraStelle: boolean;
      numeroColonne: number;
      layout: 'classic' | 'social' | 'whatsapp' | 'carousel' | 'compact';
      arataInEvidenta: boolean;
      coloreSfondo: string;
    };
    contatti: {
      attiva: boolean;
      mostraNelMenu: boolean;
      nomeMenu: string;
      ordine: number;
      titolo: string;
      badge: string;
      testoLink: string;
      urlLink: string;
      descrizione: string;
      emailGenerale: string;
      telefonoGenerale: string;
      labelInquiries: string;
      mostraMappa: boolean;
      urlMappa: string;
      mostraSocial: boolean;
      coloreSfondo: string;
      mostraLocazioni: boolean;
      sediDaCollezione: string[];
      sedi: {
        nome: string;
        indirizzo: string;
        cap: string;
        citta: string;
        telefono: string;
        email: string;
        urlMappa: string;
        programma: {
          giorno: string;
          orario: string;
          chiuso: boolean;
        }[];
      }[];
    };
    ctaFinale: {
      attiva: boolean;
      mostraNelMenu: boolean;
      nomeMenu: string;
      ordine: number;
      titolo: string;
      sottotitolo: string;
      testoPulsante: string;
      immagineBackground: string;
      coloreSfondo: string;
    };
    galleria: {
      attiva: boolean;      mostraNelMenu: boolean;
      nomeMenu: string;
      ordine: number;
      badge: string;
      titolo: string;
      sottotitolo: string;
      layout: 'grid-2' | 'grid-3' | 'grid-4' | 'grid-custom' | 'masonry';
      immagini: {
        url: string;
        didascalia: string;
        alt: string;
      }[];
      mostraPulsantePortfolio: boolean;
      testoPulsantePortfolio: string;
      testoNascondiPortfolio: string;
      urlPulsantePortfolio: string;
      coloreSfondo: string;
    };
    filosofia: {
      attiva: boolean;
      mostraNelMenu: boolean;
      nomeMenu: string;
      ordine: number;
      badge: string;
      titolo: string;
      immagine: string;
      coloreSfondo: string;
      pilastri: {
        titolo: string;
        descrizione: string;
        icona: string;
      }[];
    };
  };
  
  // TESTI HOMEPAGE (deprecato - mantenuto per compatibilità)
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
    stepLocatie: string;
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
    mostraPrezziFrontend: boolean;
    richiestaConfermaEmail: boolean;
    oreAnticipo: number; // ore prima dell'appuntamento per inviare richiesta conferma
  };
  
  // LEGAL
  linkPrivacyPolicy: string;
  linkCookiePolicy: string;

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
  
  // SEZIONI DINAMICHE HOMEPAGE
  sezioniHomepage: {
    colorePrimario: { type: String, default: '#FFF8F0' },
    coloreSecondario: { type: String, default: '#F5EEE1' },
    hero: {
      attiva: { type: Boolean, default: true },
      ordine: { type: Number, default: 1 },
      titolo: { type: String, default: '' },
      sottotitolo: { type: String, default: '' },
      badge: { type: String, default: 'Premium Beauty Salon' },
      testoCtaPrimario: { type: String, default: 'PRENOTA APPUNTAMENTO' },
      urlCtaPrimario: { type: String, default: '/booking' },
      testoCtaSecondario: { type: String, default: 'DOVE SIAMO' },
      urlCtaSecondario: { type: String, default: '#contact' },
      immagineBackground: { type: String, default: '' },
      mostraLogo: { type: Boolean, default: true },
      mostraInfoRapide: { type: Boolean, default: true },
      coloreSfondo: { type: String, default: '' }
    },
    servizi: {
      attiva: { type: Boolean, default: true },
      mostraNelMenu: { type: Boolean, default: true },
      nomeMenu: { type: String, default: 'Servizi' },
      ordine: { type: Number, default: 2 },
      titolo: { type: String, default: 'I NOSTRI SERVIZI' },
      sottotitolo: { type: String, default: 'Qualità e professionalità per il tuo look perfetto' },
      descrizione: { type: String, default: '' },
      immagineBackground: { type: String, default: '' },
      layoutGriglia: { type: String, enum: ['grid-2', 'grid-3', 'grid-4'], default: 'grid-3' },
      stileCard: { type: String, enum: ['classic', 'minimal', 'exploreaza'], default: 'classic' },
      badge: { type: String, default: 'I NOSTRI SERVIZI' },
      mostraPrezzi: { type: Boolean, default: true },
      mostraDurata: { type: Boolean, default: true },
      serviziSelezionati: { type: [String], default: [] },
      coloreSfondo: { type: String, default: '' }
    },
    about: {
      attiva: { type: Boolean, default: true },
      mostraNelMenu: { type: Boolean, default: true },
      nomeMenu: { type: String, default: 'Chi Siamo' },
      ordine: { type: Number, default: 3 },
      titolo: { type: String, default: 'CHI SIAMO' },
      sottotitolo: { type: String, default: 'La nostra storia, la tua bellezza' },
      descrizione: { type: String, default: 'Siamo un team di professionisti appassionati, dedicati a far emergere la bellezza unica di ogni cliente. Con anni di esperienza nel settore, offriamo servizi di alta qualità in un ambiente elegante e accogliente.' },
      immagine: { type: String, default: '' },
      nomeFondatore: { type: String, default: '' },
      ruoloFondatore: { type: String, default: 'Founder & Makeup Artist' },
      testoCta: { type: String, default: '' },
      urlCta: { type: String, default: '/booking' },
      dettagli: { type: [{ titolo: String, descrizione: String, icona: String }], default: [] },
      statistiche: {
        anni: {
          valore: { type: String, default: '10+' },
          label: { type: String, default: 'Anni Esperienza' }
        },
        clienti: {
          valore: { type: String, default: '5K+' },
          label: { type: String, default: 'Clienti Felici' }
        },
        qualita: {
          valore: { type: String, default: '100%' },
          label: { type: String, default: 'Professionalità' }
        }
      },
      coloreSfondo: { type: String, default: '' }
    },
    orari: {
      attiva: { type: Boolean, default: true },
      mostraNelMenu: { type: Boolean, default: true },
      nomeMenu: { type: String, default: 'Orari' },
      ordine: { type: Number, default: 4 },
      titolo: { type: String, default: 'ORARI DI APERTURA' },
      sottotitolo: { type: String, default: 'Siamo qui per te' },
      descrizione: { type: String, default: '' },
      coloreSfondo: { type: String, default: '' }
    },
    recensioni: {
      attiva: { type: Boolean, default: true },
      mostraNelMenu: { type: Boolean, default: true },
      nomeMenu: { type: String, default: 'Recenzii' },
      ordine: { type: Number, default: 5 },
      badge: { type: String, default: 'EXPERIENȚE' },
      titolo: { type: String, default: 'Perspective Comune asupra Eleganței' },
      sottotitolo: { type: String, default: '' },
      numeroMassimo: { type: Number, default: 6 },
      mostraNome: { type: Boolean, default: true },
      mostraServizio: { type: Boolean, default: true },
      mostraStelle: { type: Boolean, default: false },
      numeroColonne: { type: Number, default: 2 },
      layout: { type: String, enum: ['classic', 'social', 'whatsapp', 'carousel', 'compact'], default: 'classic' },
      arataInEvidenta: { type: Boolean, default: false },
      coloreSfondo: { type: String, default: '' }
    },
    contatti: {
      attiva: { type: Boolean, default: true },
      mostraNelMenu: { type: Boolean, default: true },
      nomeMenu: { type: String, default: 'Contatti' },
      ordine: { type: Number, default: 6 },
      titolo: { type: String, default: 'Contactați-ne' },
      descrizione: { type: String, default: '' },
      labelInquiries: { type: String, default: 'GENERAL INQUIRIES' },
      emailGenerale: { type: String, default: '' },
      telefonoGenerale: { type: String, default: '' },
      testoLink: { type: String, default: 'EXPLORE THE SPACES' },
      urlLink: { type: String, default: '' },
      mostraLocazioni: { type: Boolean, default: false },
      coloreSfondo: { type: String, default: '' },
      sediDaCollezione: { type: [String], default: [] },
      sedi: [{
        nome: { type: String, default: '' },
        indirizzo: { type: String, default: '' },
        cap: { type: String, default: '' },
        citta: { type: String, default: '' },
        telefono: { type: String, default: '' },
        email: { type: String, default: '' },
        urlMappa: { type: String, default: '' },
        programma: [{
          giorno: { type: String, default: '' },
          orario: { type: String, default: '' },
          chiuso: { type: Boolean, default: false },
        }],
      }],
    },
    ctaFinale: {
      attiva: { type: Boolean, default: true },
      mostraNelMenu: { type: Boolean, default: true },
      nomeMenu: { type: String, default: '' },
      ordine: { type: Number, default: 7 },
      titolo: { type: String, default: 'PRONTO PER IL TUO NUOVO LOOK?' },
      sottotitolo: { type: String, default: 'Prenota ora il tuo appuntamento e affidati ai nostri professionisti' },
      testoPulsante: { type: String, default: 'PRENOTA SUBITO' },
      immagineBackground: { type: String, default: '' },
      coloreSfondo: { type: String, default: '' }
    },
    galleria: {
      attiva: { type: Boolean, default: true },
      mostraNelMenu: { type: Boolean, default: true },
      nomeMenu: { type: String, default: 'Galleria' },
      ordine: { type: Number, default: 8 },
      badge: { type: String, default: 'ARHIVĂ VIZUALĂ' },
      titolo: { type: String, default: 'Arta Tenului Impecabil' },
      sottotitolo: { type: String, default: '' },
      layout: { type: String, enum: ['grid-2', 'grid-3', 'grid-4', 'grid-custom', 'masonry'], default: 'grid-custom' },
      immagini: [{
        url: { type: String, default: '' },
        didascalia: { type: String, default: '' },
        alt: { type: String, default: '' }
      }],
      mostraPulsantePortfolio: { type: Boolean, default: true },
      testoPulsantePortfolio: { type: String, default: 'VEZI TOT PORTOFOLIUL' },
      testoNascondiPortfolio: { type: String, default: 'ASCUNDE PORTOFOLIUL' },
      urlPulsantePortfolio: { type: String, default: '/portfolio' },
      coloreSfondo: { type: String, default: '' }
    },
    filosofia: {
      attiva: { type: Boolean, default: false },
      mostraNelMenu: { type: Boolean, default: false },
      nomeMenu: { type: String, default: 'Filosofia' },
      ordine: { type: Number, default: 9 },
      badge: { type: String, default: 'ATELIER & FILOSOFIA' },
      titolo: { type: String, default: 'Dincolo de Suprafață' },
      immagine: { type: String, default: '' },
      coloreSfondo: { type: String, default: '' },
      pilastri: {
        type: [{
          titolo: { type: String, default: '' },
          descrizione: { type: String, default: '' },
          icona: { type: String, default: 'diamond' },
        }],
        default: [
          { titolo: 'Fundament Științific', descrizione: 'Inspirată de \'Cosmetica Medicală\', abordarea noastră prioritizează sănătatea pielii ca fundament suprem pentru orice aplicație artistică.', icona: 'science' },
          { titolo: 'Aură Holistică', descrizione: 'Nu aplicăm doar produse; cultivăm o esență. Fiecare tratament este o experiență meditativă de lux și îngrijire.', icona: 'spa' },
          { titolo: 'Precizie Intenționată', descrizione: 'Precizia este limbajul nostru. Fiecare mișcare este calculată pentru a îmbunătăți armonia structurală și simetria facială.', icona: 'architecture' },
        ]
      }
    }
  },
  
  // TESTI HOMEPAGE (deprecato - mantenuto per compatibilità)
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
    stepLocatie: { type: String, default: 'Alege Locația' },
    stepSpecialist: { type: String, default: 'CHOOSE YOUR SPECIALIST' },
    stepServizio: { type: String, default: 'Alege Serviciul' },
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
    mostraPrezziFrontend: { type: Boolean, default: true },
    richiestaConfermaEmail: { type: Boolean, default: false },
    oreAnticipo: { type: Number, default: 24 } // default 24 ore prima
  },
  
  // LEGAL
  linkPrivacyPolicy: {
    type: String,
    default: ''
  },
  linkCookiePolicy: {
    type: String,
    default: ''
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
