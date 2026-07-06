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
import { useEffect, useState, useRef } from 'react';
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
  ChevronUp,
  ChevronDown,
  MessageSquare,
  Gift,
  MapPin
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
  const [menuMobileAperto, setMenuMobileAperto] = useState(false);
  const [profiloMenuAperto, setProfiloMenuAperto] = useState(false);

  const profiloRef = useRef<HTMLDivElement>(null);

  // Chiudi profilo menu al click fuori
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (profiloRef.current && !profiloRef.current.contains(e.target as Node)) {
        setProfiloMenuAperto(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

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

  // Chiudi menu mobile al cambio pagina
  useEffect(() => {
    setMenuMobileAperto(false);
  }, [pathname]);

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
    { href: '/cms/locations', label: 'Locații', icon: MapPin },
    { href: '/cms/reviews', label: 'Recenzii', icon: MessageSquare },
    { href: '/cms/vouchers', label: 'Vouchere', icon: Gift },
    { href: '/cms/services', label: 'Servicii', icon: Scissors },
    { href: '/cms/homepage', label: 'Homepage', icon: LayoutDashboard },
    { href: '/cms/hours', label: 'Orar', icon: Clock },
    { href: '/cms/availability', label: 'Disponibilitate echipă', icon: Users },
    ...(utente?.ruolo === 'admin' ? [{ href: '/cms/users', label: 'Utilizatori', icon: Users }] : []),
    { href: '/cms/appearance', label: 'Aspect', icon: Settings },
    { href: '/cms/profile', label: 'Profil', icon: User },
  ];

  // ============================================
  // RENDERING PRINCIPALE - MOBILE FIRST
  // ============================================
  return (
    <div className="min-h-screen bg-[#faf7f2] flex flex-col md:flex-row">
      
      {/* ========================================
          SIDEBAR - MOBILE: BOTTOM NAV, DESKTOP: SIDEBAR
          ======================================== */}
      
      {/* DESKTOP SIDEBAR (nascosta su mobile) */}
      <aside 
        className={`
          hidden md:block
          fixed left-0 top-0 h-screen
          bg-white/95 backdrop-blur-sm
          border-r border-[#e8dccc]    
          transition-all duration-300  
          z-40
          ${sidebarAperta ? 'w-64' : 'w-20'}
        `}
      >
        <div className="h-full flex flex-col">
          
          {/* Logo e Toggle */}
          <div className="p-4 border-b border-[#e8dccc]/80 flex items-center justify-between">
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
                  <Scissors className="w-6 h-6 text-[#c9a96e]" />
                  <span className="font-bold text-[#4a4a4a]">{nomeAzienda}</span>
                </>
              )}
            </Link>
            
            <button
              onClick={() => setSidebarAperta(!sidebarAperta)}
              className="p-2 rounded-lg hover:bg-[#f0ebe2] transition-colors"
              aria-label={sidebarAperta ? 'Închide bara laterală' : 'Deschide bara laterală'}
            >
              {sidebarAperta ? (
                <ChevronLeft className="w-5 h-5 text-[#8a8a7a]" />
              ) : (
                <ChevronRight className="w-5 h-5 text-[#8a8a7a]" />
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
                        ? 'bg-[#c9a96e]/10 text-[#8a6a3a] font-semibold'  
                        : 'text-[#6a6a5a] hover:bg-[#f0ebe2]'                
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
                      bg-[#4a4a4a] text-white   
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
          <div className="p-4 border-t border-[#e8dccc]/80 space-y-2">
            {sidebarAperta && (
              <div className="px-4 py-2 text-[#6a6a5a]">
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
                text-red-500 hover:bg-red-50  
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
                  bg-[#4a4a4a] text-white
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

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 safe-area-bottom">
        {menuMobileAperto ? (
          <div className="bg-white border-t border-[#e8dccc] shadow-[0_-4px_20px_rgba(0,0,0,0.08)] rounded-t-xl">
            <button
              onClick={() => setMenuMobileAperto(false)}
              className="w-full flex items-center justify-center gap-2 py-3 text-xs font-medium text-gray-400 hover:text-gray-600 active:text-gray-800 transition-colors"
            >
              <ChevronDown className="w-4 h-4" />
              Comprimă meniul
            </button>
            <div className="grid grid-cols-4 gap-1 px-2 pb-4 pt-1">
              {menuItems.filter(item => item.href !== '/cms/profile').map((item) => {
                const IconComponent = item.icon;
                const attivo = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuMobileAperto(false)}
                    className={`
                      flex flex-col items-center justify-center
                      py-2 px-0.5 rounded-lg
                      transition-all active:scale-95
                      ${attivo
                        ? 'bg-[#c9a96e]/15 text-[#8a6a3a] font-semibold'
                        : 'text-[#6a6a5a]'
                      }
                    `}
                  >
                    <IconComponent className={`w-[18px] h-[18px] mb-1 ${attivo ? 'text-[#8a6a3a]' : 'text-gray-400'}`} />
                    <span className="text-[9px] text-center leading-tight">
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        ) : (
          <button
            onClick={() => setMenuMobileAperto(true)}
            className="w-full bg-white/90 backdrop-blur-md border-t border-[#e8dccc] shadow-[0_-2px_10px_rgba(0,0,0,0.05)] active:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3 px-5 py-2.5">
              <div className="flex items-center gap-2 text-[#8a6a3a]">
                {(() => {
                  const item = menuItems.find(i => i.href === pathname);
                  if (!item) return <span className="text-sm text-gray-500">Meniu</span>;
                  const IconComponent = item.icon;
                  return <><IconComponent className="w-5 h-5" /><span className="font-semibold text-sm">{item.label}</span></>;
                })()}
              </div>
              <div className="ml-auto flex items-center gap-1 text-xs text-gray-400">
                <ChevronUp className="w-4 h-4" />
                Meniu
              </div>
            </div>
          </button>
        )}
      </nav>

      {/* ========================================
          AREA CONTENUTO PRINCIPALE
          ======================================== */}
      <div className={`flex-1 flex flex-col md:pb-0 ${sidebarAperta ? 'md:ml-64' : 'md:ml-20'}`}>
        
        {/* HEADER */}
        <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-[#e8dccc]/60 sticky top-0 z-40">
          <div className="px-4 py-3 md:px-6 md:py-4 flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-lg md:text-xl font-semibold text-[#4a4a4a] truncate">
                {menuItems.find(item => item.href === pathname)?.label || 'CMS'}
              </h1>
            </div>
            
            <div className="md:hidden relative" ref={profiloRef}>
              <button
                onClick={() => setProfiloMenuAperto(!profiloMenuAperto)}
                className="flex items-center gap-1.5 text-sm text-[#6a6a5a] hover:text-[#8a6a3a] transition-colors active:bg-gray-50 rounded-lg px-2 py-1.5"
              >
                <span className="truncate max-w-[80px]">{utente?.nome}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${profiloMenuAperto ? 'rotate-180' : ''}`} />
              </button>
              {profiloMenuAperto && (
                <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50">
                  <Link
                    href="/cms/profile"
                    onClick={() => setProfiloMenuAperto(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <User className="w-4 h-4 text-gray-400" />
                    Profilul meu
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Deconectare
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}