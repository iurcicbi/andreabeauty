/**
 * WEBSERVICE CENTRALIZZATO
 * 
 * Gestisce tutte le chiamate HTTP dell'applicazione.
 * Versione JavaScript per compatibilità.
 */

import axios from 'axios';

// Configurazione base URL dall'ambiente
axios.defaults.baseURL = process.env.NEXT_PUBLIC_BASE_URL_API || 'http://localhost:3000';
axios.defaults.timeout = 10 * 1000; // Ridotto a 10 secondi per navigazione più veloce
axios.defaults.headers.post['Content-Type'] = 'application/json; charset=utf-8';

// Cache per richieste GET
const requestCache = new Map();
const CACHE_DURATION = 2 * 60 * 1000; // 2 minuti

// Istanza per upload file
const uploadLink = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL_API || 'http://localhost:3000',
  timeout: 120 * 1000,
});

// Configurazione per upload
const uploadConfig = {
  headers: {
    'content-type': 'multipart/form-data; boundary=----WebKitFormBoundaryqTqJIxvkWFYqvP5s'
  }
};

/**
 * INTERCEPTOR RICHIESTE
 * Aggiunge automaticamente il token JWT
 */
axios.interceptors.request.use(
  (config) => {
    // Recupera il token dal localStorage (solo nel browser)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🌐 ${config.method?.toUpperCase()} ${config.url}`);
    }

    return config;
  },
  (error) => {
    console.error('❌ Errore nella richiesta:', error);
    return Promise.reject(error);
  }
);

/**
 * INTERCEPTOR RISPOSTE
 * Gestisce errori comuni
 */
axios.interceptors.response.use(
  (response) => {
    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ Risposta ${response.status} da ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    if (error.response) {
      const status = error.response.status;

      switch (status) {
        case 401:
          // Non autenticato - rimuovi token e redirect al login
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            if (!window.location.pathname.includes('/login')) {
              window.location.href = '/login';
            }
          }
          console.error('❌ 401: Non autenticato');
          break;

        case 403:
          console.error('❌ 403: Accesso negato');
          break;

        case 404:
          console.error('❌ 404: Risorsa non trovata');
          break;

        case 500:
          console.error('❌ 500: Errore del server');
          break;

        default:
          console.error(`❌ Errore ${status}:`, error.response.data);
      }
    } else if (error.request) {
      console.error('❌ Nessuna risposta dal server:', error.message);
    } else {
      console.error('❌ Errore nella richiesta:', error.message);
    }

    return Promise.reject(error);
  }
);

/**
 * Gestione successo HTTP
 */
const successHTTP = (res) => {
  return res;
};

/**
 * Gestione errore HTTP
 */
const errorHTTP = (err) => {
  return { error: true, ...err.response };
};

/**
 * REQUEST WEB SERVICE
 * Funzione principale per chiamate API
 */
export function requestWebService(link, dati, headers) {
  return axios.post(link, dati || {}, headers || {})
    .then(function (response) {
      return successHTTP(response);
    })
    .catch(function (error) {
      return errorHTTP(error);
    });
}

/**
 * REQUEST UPLOAD
 * Per upload di file
 */
export function requestUpload(link, dati) {
  return uploadLink.post(link, dati, uploadConfig)
    .then(function (response) {
      return successHTTP(response);
    })
    .catch(function (error) {
      return errorHTTP(error);
    });
}

/**
 * ENDPOINTS AUTENTICAZIONE
 */
export const AUTH_LOGIN = "/api/auth/login";
export const AUTH_LOGOUT = "/api/auth/logout";
export const AUTH_REGISTER = "/api/auth/register";

/**
 * METODI HTTP STANDARD
 */
const webservice = {
  /**
   * GET - Recupera dati (con cache)
   */
  get: async (url, config = {}) => {
    // Controlla cache per richieste GET
    const cacheKey = `${url}${JSON.stringify(config)}`;
    const cached = requestCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log(`📦 Cache hit per ${url}`);
      return cached.data;
    }

    const response = await axios.get(url, config);
    
    // Salva in cache solo se la risposta è ok
    if (response.status === 200) {
      requestCache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now()
      });
    }
    
    return response.data;
  },

  /**
   * POST - Crea nuovi dati (invalida cache)
   */
  post: async (url, data, config) => {
    const response = await axios.post(url, data, config);
    
    // Invalida cache correlata
    requestCache.clear();
    
    return response.data;
  },

  /**
   * PUT - Aggiorna dati esistenti (completo, invalida cache)
   */
  put: async (url, data, config) => {
    const response = await axios.put(url, data, config);
    
    // Invalida cache correlata
    requestCache.clear();
    
    return response.data;
  },

  /**
   * PATCH - Aggiorna dati esistenti (parziale, invalida cache)
   */
  patch: async (url, data, config) => {
    const response = await axios.patch(url, data, config);
    
    // Invalida cache correlata
    requestCache.clear();
    
    return response.data;
  },

  /**
   * DELETE - Elimina dati (invalida cache)
   */
  delete: async (url, config) => {
    const response = await axios.delete(url, config);
    
    // Invalida cache correlata
    requestCache.clear();
    
    return response.data;
  },

  /**
   * Pulisce manualmente la cache
   */
  clearCache: () => {
    requestCache.clear();
  }
};

export default webservice;
