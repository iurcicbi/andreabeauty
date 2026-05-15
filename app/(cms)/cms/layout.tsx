/**
 * ============================================
 * LAYOUT CMS - PANNELLO DI CONTROLLO BARBIERE
 * ============================================
 * 
 * QUESTO FILE È UN LAYOUT DI NEXT.JS
 * Un layout è un componente che avvolge TUTTE le pagine di una sezione.
 * In questo caso, avvolge tutte le pagine che iniziano con /cms/
 * 
 * FUNZIONI PRINCIPALI:
 * 1. Protegge le route (solo barbieri autenticati possono entrare)
 * 2. Fornisce una sidebar di navigazione fissa
 * 3. Gestisce autenticazione e logout
 * 4. Mostra il contenuto delle pagine figlie
 */

'use client';
// ⚠️ DIRETTIVA FONDAMENTALE: 'use client'
// In Next.js 13+ i componenti sono SERVER COMPONENTS di default
// Mettiamo 'use client' perché QUESTO COMPONENTE:
// - Usa useState (gestione stato lato client)
// - Usa useEffect (effetti collaterali nel browser)
// - Usa localStorage (API del browser)
// - Usa useRouter e usePathname (hook di navigazione)
// - Ha interattività (click sul toggle sidebar)

// ============================================
// IMPORT DEI MODULI
// ============================================
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Caricamento from '@/componenti/comuni/Caricamento';
import { 
  LayoutDashboard, 
  Calendar, 
  Scissors, 
  Clock, 
  Users, 
  Settings, 
  User, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Gift
} from 'lucide-react';

// ============================================
// COMPONENTE PRINCIPALE
// ============================================
export default function CMSLayout({
  children,  // children è una PROP SPECIALE: contiene tutto ciò che questo layout avvolge
}: {
  children: React.ReactNode;  // ReactNode = qualsiasi cosa React possa renderizzare
}) {
  // ============================================
  // HOOK DI NEXT.JS
  // ============================================
  const router = useRouter();      // Per fare redirect: router.push('/login')
  const pathname = usePathname();  // Contiene l'URL corrente: es. "/cms/appointments"

  // ============================================
  // STATI DEL COMPONENTE (useState)
  // ============================================
  // Ogni volta che queste variabili cambiano, il componente si RENDERIZZA di nuovo
  const [autenticato, setAutenticato] = useState(false);
  // autenticato: true/false - l'utente è loggato e autorizzato?
  // setAutenticato: funzione per cambiare questo stato

  const [caricamento, setCaricamento] = useState(true);
  // caricamento: true mentre controlliamo l'autenticazione
  // setCaricamento: quando finiamo il controllo, impostiamo a false

  const [utente, setUtente] = useState<any>(null);
  // utente: contiene i dati dell'utente (nome, email, ruolo)
  // any: TypeScript, significa "qualsiasi tipo" (non ideale per produzione)
  // null: inizialmente nessun utente

  const [sidebarAperta, setSidebarAperta] = useState(true);
  // sidebarAperta: true = sidebar larga, false = sidebar stretta
  // setSidebarAperta: funzione per cambiare la larghezza

  const [logoCMS, setLogoCMS] = useState<string>('');
  const [nomeAzienda, setNomeAzienda] = useState<string>('Beauty Salon CMS');
  
  // ============================================
  // EFFECT: VERIFICA AUTENTICAZIONE ALL'AVVIO
  // ============================================
  useEffect(() => {
    // useEffect con array vuoto [] = si esegue UNA SOLA VOLTA quando il componente viene montato
    verificaAutenticazione();
    // Carica sempre le impostazioni per avere i dati aggiornati
    caricaImpostazioni();
    
    // Listener per aggiornare quando la pagina diventa visibile
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        caricaImpostazioni();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);  // [] = nessuna dipendenza, esegui solo all'avvio

  // ============================================
  // FUNZIONE: CARICA IMPOSTAZIONI DINAMICHE (CON CACHE)
  // ============================================
  const caricaImpostazioni = async () => {
    try {
      const response = await fetch('/api/settings');
      const data = await response.json();
      console.log('📦 Layout CMS - Impostazioni caricate:', data.dati);
      if (data.dati) {
        // Usa logoCMS se disponibile, altrimenti logo principale
        const logoUrl = data.dati.logoCMS || data.dati.logo || '';
        const nome = data.dati.nomeAzienda || 'Beauty Salon CMS';
        console.log('Layout CMS - Logo CMS:', logoUrl);
        console.log('Layout CMS - Nome Azienda:', nome);
        
        // Salva in cache per evitare ricaricamenti
        sessionStorage.setItem('logoCMS', logoUrl);
        sessionStorage.setItem('nomeAzienda', nome);
        
        setLogoCMS(logoUrl);
        setNomeAzienda(nome);
      }
    } catch (err) {
      console.error('Layout CMS - Errore caricamento impostazioni:', err);
    }
  };

  // ============================================
  // FUNZIONE: VERIFICA AUTENTICAZIONE
  // ============================================
  const verificaAutenticazione = () => {
    // localStorage: database nel browser che persiste anche dopo il refresh
    // Quando l'utente fa login, salviamo token e dati qui
    
    // Legge il token dal localStorage
    const token = localStorage.getItem('token');
    // Legge i dati utente (in formato JSON stringa)
    const utenteStr = localStorage.getItem('utente');

    // CASO 1: NON AUTENTICATO
    // Se manca token O mancano dati utente
    if (!token || !utenteStr) {
      // Redirect alla pagina di login
      router.push('/login');
      return;  // Esce dalla funzione, non esegue il resto
    }

    // Se arriviamo qui, significa che token e utenteStr esistono
    try {
      // Converte la stringa JSON in un oggetto JavaScript
      // Esempio: '{"nome":"Mario"}' diventa { nome: "Mario" }
      const utenteData = JSON.parse(utenteStr);
      
      if (utenteData.ruolo !== 'admin' && utenteData.ruolo !== 'specialist' && utenteData.ruolo !== 'barber') {
        router.push('/');
        return;
      }

      // CASO 3: TUTTO OK
      // Salva i dati utente nello stato
      setUtente(utenteData);
      // Imposta autenticato a true
      setAutenticato(true);
    } catch (err) {
      // CASO 4: ERRORE NEL PARSING JSON
      // Se JSON.parse fallisce (es. formato non valido)
      console.error('Errore parsing utente:', err);
      router.push('/login');
    } finally {
      // FINALLY si esegue SEMPRE, successo o errore che sia
      // Toglie lo schermo di caricamento
      setCaricamento(false);
    }
  };

  // ============================================
  // FUNZIONE: LOGOUT
  // ============================================
  const handleLogout = () => {
    // Rimuove i dati dal localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('utente');
    // Redirect al login
    router.push('/login');
  };

  // ============================================
  // RENDERING CONDIZIONALE - PARTE 1
  // ============================================
  // Se sta ancora caricando, mostra solo lo spinner
  if (caricamento) {
    return (
      // min-h-screen: altezza minima = tutta la finestra
      // flex items-center justify-center: centra il contenuto
      <div className="min-h-screen flex items-center justify-center">
        <Caricamento />  {/* Componente spinner */}
      </div>
    );
  }

  // Se non è autenticato, non mostra nulla (il redirect è già stato fatto)
  if (!autenticato) {
    return null;  // null = non renderizza nulla
  }

  const menuItems = [
    { href: '/cms/dashboard', label: 'Panou de control', icon: LayoutDashboard },
    { href: '/cms/appointments', label: 'Programări', icon: Calendar },
    { href: '/cms/specialist', label: 'Specialiști', icon: Scissors },
    { href: '/cms/reviews', label: 'Recenzii', icon: MessageSquare },
    { href: '/cms/vouchers', label: 'Vouchere', icon: Gift },
    { href: '/cms/services', label: 'Servicii', icon: Scissors },
    { href: '/cms/hours', label: 'Orar', icon: Clock },
    { href: '/cms/availability', label: 'Disponibilitate echipă', icon: Users },
    { href: '/cms/appearance', label: 'Aspect', icon: Settings },
    { href: '/cms/profile', label: 'Profil', icon: User },
  ];

  // ============================================
  // RENDERING PRINCIPALE - MOBILE FIRST
  // ============================================
  return (
    // Layout responsive: mobile = colonna, desktop = sidebar + contenuto
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      
      {/* ========================================
          SIDEBAR - MOBILE: BOTTOM NAV, DESKTOP: SIDEBAR
          ======================================== */}
      
      {/* DESKTOP SIDEBAR (nascosta su mobile) */}
      <aside 
        className={`
          hidden md:block
          bg-white                    
          border-r border-gray-200    
          transition-all duration-300  
          ${sidebarAperta ? 'w-64' : 'w-20'}
        `}
      >
        <div className="h-full flex flex-col">
          
          {/* Logo e Toggle */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <Link 
              href="/cms/dashboard" 
              className={`flex items-center gap-2 ${!sidebarAperta && 'hidden'}`}
            >
              {logoCMS ? (
                <img 
                  src={logoCMS} 
                  alt={nomeAzienda}
                  className="h-36 object-contain max-w-full"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <>
                  <Scissors className="w-6 h-6 text-primary-600" />
                  <span className="font-bold text-gray-800">{nomeAzienda}</span>
                </>
              )}
            </Link>
            
            <button
              onClick={() => setSidebarAperta(!sidebarAperta)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label={sidebarAperta ? 'Închide bara laterală' : 'Deschide bara laterală'}
            >
              {sidebarAperta ? (
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-600" />
              )}
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    menu-item
                    flex items-center        
                    px-4 py-3                
                    rounded-lg                
                    transition-colors         
                    group                     
                    ${
                      pathname === item.href  
                        ? 'bg-primary-100 text-primary-700 font-semibold'  
                        : 'text-gray-600 hover:bg-gray-100'                
                    }
                  `}
                >
                  <IconComponent className="w-5 h-5" />
                  
                  {sidebarAperta && (
                    <span className="ml-3">{item.label}</span>
                  )}
                  
                  {!sidebarAperta && (
                    <div className="
                      absolute left-16          
                      bg-gray-800 text-white    
                      px-2 py-1 rounded         
                      text-sm                    
                      opacity-0                  
                      group-hover:opacity-100    
                      transition-opacity         
                      pointer-events-none        
                      whitespace-nowrap          
                      z-50
                    ">
                      {item.label}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Profilo e Logout */}
          <div className="p-4 border-t border-gray-200 space-y-2">
            {sidebarAperta && (
              <div className="px-4 py-2 text-gray-600">
                <div className="text-sm">Salut,</div>
                <div className="font-semibold truncate">{utente?.nome}</div>
              </div>
            )}
            
            <button
              onClick={handleLogout}
              className={`
                flex items-center        
                w-full                    
                px-4 py-3                 
                rounded-lg                 
                text-red-600 hover:bg-red-50  
                transition-colors          
                group
                ${!sidebarAperta && 'justify-center'}
              `}
            >
              <LogOut className="w-5 h-5" />
              {sidebarAperta && <span className="ml-3">Deconectare</span>}
              
              {!sidebarAperta && (
                <div className="
                  absolute left-16
                  bg-gray-800 text-white
                  px-2 py-1 rounded
                  text-sm
                  opacity-0 group-hover:opacity-100
                  transition-opacity
                  pointer-events-none
                  z-50
                ">
                  Deconectare
                </div>
              )}
            </button>
          </div>
        </div>
      </aside>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-bottom">
        <div className="grid grid-cols-4 gap-1 p-2">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  menu-item
                  flex flex-col items-center justify-center
                  py-2 px-1 rounded-lg
                  transition-colors
                  ${
                    pathname === item.href
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 active:bg-gray-100'
                  }
                `}
              >
                <IconComponent className="w-5 h-5 mb-1" />
                <span className="text-[10px] font-medium text-center leading-tight">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* ========================================
          AREA CONTENUTO PRINCIPALE
          ======================================== */}
      <div className="flex-1 flex flex-col md:pb-0">
        
        {/* HEADER */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
          <div className="px-4 py-3 md:px-6 md:py-4 flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-lg md:text-xl font-semibold text-gray-800 truncate">
                {menuItems.find(item => item.href === pathname)?.label || 'CMS'}
              </h1>
            </div>
            
            <div className="md:hidden flex items-center gap-2">
              <span className="text-sm text-gray-600 truncate max-w-[100px]">
                {utente?.nome}
              </span>
              <button
                onClick={handleLogout}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                aria-label="Deconectare"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {children}
          <div className="h-48 md:h-0" />
        </main>
      </div>
    </div>
  );
}