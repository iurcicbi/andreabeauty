// componenti/cms/Sidebar.tsx
/**
 * ============================================
 * COMPONENTE SIDEBAR CMS
 * ============================================
 * Questo componente crea la barra laterale (menu di sinistra)
 * per il pannello di controllo del barbiere.
 * 
 * COSA FA:
 * - Mostra tutti i link del CMS (Dashboard, Appuntamenti, Servizi, Orari, Profilo)
 * - Si può allargare/restringere cliccando il pulsante
 * - Evidenzia la pagina corrente
 * - Mostra il nome dell'utente loggato
 * - Ha il pulsante per fare logout
 * - Mostra il logo dinamico dalle impostazioni
 */

// 'use client' è necessario perché questo componente:
// 1. Usa useState (gestisce stati)
// 2. Usa usePathname (legge l'URL)
// 3. Ha interazioni utente (click)
'use client';

// ============================================
// IMPORT DEI MODULI NECESSARI
// ============================================
import Link from 'next/link';        // Crea link per navigare senza ricaricare la pagina
import { usePathname } from 'next/navigation'; // Legge l'URL corrente (es. /cms/appointments)
import { useState, useEffect } from 'react';    // Crea variabili che possono cambiare (es. sidebar aperta/chiusa)
import webservice from '@/utils/webservice'; // Per caricare le impostazioni
import { 
  BarChart3, 
  Calendar, 
  Scissors, 
  Users, 
  Clock, 
  Palette, 
  User,
  MessageSquare,
  Gift,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Building,
  MapPin
} from 'lucide-react';

// ============================================
// TYPESCRIPT: DEFINIZIONE DELLE PROPRIETÀ
// ============================================
// Questo è TypeScript - definisce quali dati può ricevere questo componente
interface SidebarProps {
  utente: {                          // L'oggetto utente deve avere:
    nome: string;                    // - nome (obbligatorio)
    email?: string;                  // - email (opzionale, per questo il ?)
  };
  onLogout: () => void;              // La funzione da chiamare quando si fa logout
}

// ============================================
// DATI DEL MENU (LISTA DI TUTTI I LINK)
// ============================================
// Questa è una costante che contiene tutti i link del menu
// Ogni elemento ha:
// - href: il percorso della pagina (dove porta il link)
// - label: il testo da mostrare
// - icon: il componente icona da mostrare
const menuItems = [
  { href: '/cms/dashboard', label: 'Panou de control', icon: BarChart3 },
  { href: '/cms/appointments', label: 'Programări', icon: Calendar },
  { href: '/cms/services', label: 'Servicii', icon: Scissors },
  { href: '/cms/specialist', label: 'Specialiști', icon: Users },
  { href: '/cms/locations', label: 'Locații', icon: MapPin },
  { href: '/cms/reviews', label: 'Recenzii', icon: MessageSquare },
  { href: '/cms/vouchers', label: 'Vouchere', icon: Gift },
  { href: '/cms/hours', label: 'Orar', icon: Clock },
  { href: '/cms/appearance', label: 'Aspect', icon: Palette },
  { href: '/cms/profile', label: 'Profil', icon: User },
];

// ============================================
// COMPONENTE PRINCIPALE
// ============================================
// export default significa che questo è il componente principale del file
// Sidebar è il nome del componente
// { utente, onLogout } sono le proprietà che riceve dal componente genitore
export default function Sidebar({ utente, onLogout }: SidebarProps) {
  
  // ============================================
  // HOOKS (funzioni speciali di React)
  // ============================================
  
  // usePathname() legge l'URL corrente
  // Esempio: se siamo su /cms/appointments, pathname sarà "/cms/appointments"
  // Questo serve per capire quale link evidenziare
  const pathname = usePathname();
  
  // useState crea una variabile che può cambiare
  // sidebarAperta è il valore attuale (inizialmente true)
  // setSidebarAperta è la funzione per cambiare il valore
  // Quando sidebarAperta è true -> sidebar larga (w-64)
  // Quando sidebarAperta è false -> sidebar stretta (w-20)
  const [sidebarAperta, setSidebarAperta] = useState(true);
  
  // Stato per il logo dinamico
  const [logoCMS, setLogoCMS] = useState<string>('');
  const [nomeAzienda, setNomeAzienda] = useState<string>('Beauty Salon CMS');
  
  // Stato per menu attivo immediato
  const [menuAttivo, setMenuAttivo] = useState(pathname);

  // Carica le impostazioni al mount del componente
  useEffect(() => {
    caricaImpostazioni();
  }, []);

  // Effect per aggiornare menu attivo immediatamente
  useEffect(() => {
    setMenuAttivo(pathname);
  }, [pathname]);

  // Funzione per gestire click menu con feedback immediato
  const handleMenuClick = (href: string) => {
    setMenuAttivo(href);
  };

  const caricaImpostazioni = async () => {
    try {
      const risposta = await webservice.get('/api/settings');
      console.log('📦 Sidebar - Impostazioni caricate:', risposta.dati);
      if (risposta.dati) {
        // Usa logoCMS se disponibile, altrimenti logo principale
        const logoUrl = risposta.dati.logoCMS || risposta.dati.logo || '';
        const nome = risposta.dati.nomeAzienda || 'Beauty Salon CMS';
        console.log('Sidebar - Logo CMS:', logoUrl);
        console.log('Sidebar - Nome Azienda:', nome);
        
        // Salva in cache per evitare ricaricamenti
        sessionStorage.setItem('logoCMS', logoUrl);
        sessionStorage.setItem('nomeAzienda', nome);
        
        setLogoCMS(logoUrl);
        setNomeAzienda(nome);
      }
    } catch (err) {
      console.error('Sidebar - Errore caricamento impostazioni:', err);
    }
  };

  // ============================================
  // RENDERING DEL COMPONENTE (cosa mostrare)
  // ============================================
  // return contiene quello che verrà visualizzato
  return (
    // <aside> è un tag HTML che rappresenta una sezione laterale
    // Le classi CSS (className) sono di Tailwind CSS
    <aside 
      className={`
        bg-white                   // Sfondo bianco
        border-r border-gray-200   // Bordo destro grigio
        transition-all duration-300 // Animazione quando si apre/chiude (0.3 secondi)
        ${sidebarAperta ? 'w-64' : 'w-20'} // Se aperta: larghezza 256px, se chiusa: 80px
      `}
    >
      {/* 
        ============================================
        CONTENITORE PRINCIPALE (flex colonna)
        ============================================
        h-full: altezza 100% del genitore
        flex flex-col: organizza i figli in colonna (uno sotto l'altro)
      */}
      <div className="h-full flex flex-col">
        
        {/* 
          ============================================
          SEZIONE 1: LOGO E PULSANTE TOGGLE
          ============================================
          Questa è la parte in alto della sidebar
          border-b: bordo sotto per separare dal menu
          flex items-center justify-between: allinea gli elementi orizzontalmente
        */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          
          {/* 
            Link è il componente di Next.js per navigare
            href="/cms/dashboard": dove porta il link

  href="/cms/dashboard" 
            className={`flex items-center gap-2 ${!sidebarAperta && 'hidden'}`}
          >
            {logoCMS ? (
              <img 
                src={logoCMS} 
                alt={nomeAzienda}
                className="h-10 object-contain max-w-full"
                loading="lazy"
                onError={(e) => {
                  // Se il logo non si carica, nascondilo e mostra il fallback
                  e.currentTarget.style.display = 'none';
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    const fallback = document.createElement('div');
                    fallback.className = 'flex items-center gap-2';
                    const svgContainer = document.createElement('div');
                    svgContainer.className = 'w-6 h-6 bg-primary-600 rounded flex items-center justify-center';
                    svgContainer.innerHTML = '<svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18"/><path d="M5 21V7l8-4v18"/><path d="M19 21V11l-6-4"/></svg>';
                    const textSpan = document.createElement('span');
                    textSpan.className = 'font-bold text-gray-800';
                    textSpan.textContent = nomeAzienda;
                    fallback.appendChild(svgContainer);
                    fallback.appendChild(textSpan);
                    parent.appendChild(fallback);
                  }
                }}
              />
            ) : (
              <>
                <Building className="w-6 h-6 text-primary-600" />
                <span className="font-bold text-gray-800">{nomeAzienda}</span>
              </>
            )}
          </Link>
          
          {/* 
            Pulsante per aprire/chiudere la sidebar
            onClick: quando viene cliccato, cambia sidebarAperta da true a false o viceversa
            !sidebarAperta inverte il valore
          */}
          <button
            onClick={() => setSidebarAperta(!sidebarAperta)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label={sidebarAperta ? 'Închide bara laterală' : 'Deschide bara laterală'} // Pentru accesibilitate
          >
            {sidebarAperta ? (
              <ChevronLeft className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* 
          ============================================
          SEZIONE 2: MENU ITEMS (TUTTI I LINK)
          ============================================
          <nav>: tag HTML per la navigazione
          flex-1: occupa tutto lo spazio disponibile
          p-4: padding di 16px
          space-y-2: spazio verticale di 8px tra gli elementi
        */}
        <nav className="flex-1 p-4 space-y-2">
          
          {/* 
            menuItems.map() - cicla su tutti gli elementi del menu
            Per ogni elemento crea un Link
            key={item.href}: identificatore unico per React (necessario nei cicli)
          */}
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                onClick={() => handleMenuClick(item.href)}
                className={`
                  menu-item
                  flex items-center        // Allinea orizzontalmente
                  px-4 py-3                // Padding orizzontale 16px, verticale 12px
                  rounded-lg                // Angoli arrotondati
                  transition-colors         // Animazione cambio colore
                  group                     // Per gestire hover sui figli
                  ${menuAttivo === item.href  // Se l'URL corrente MATCHA con questo link
                    ? 'bg-primary-100 text-primary-700 font-semibold' // Stile ATTIVO
                    : 'text-gray-600 hover:bg-gray-100'              // Stile NORMALE
                  }
                `}
              >
                {/* Icona del menu */}
                <IconComponent className="w-5 h-5" />
                
                {/* 
                  TESTO DEL LINK
                  Se sidebarAperta è true, mostra il testo
                */}
                {sidebarAperta && (
                  <span className="ml-3">{item.label}</span>
                )}
                
                {/* 
                  TOOLTIP (quando sidebar è chiusa)
                  Se sidebarAperta è false, mostra un tooltip al passaggio del mouse
                  absolute: posizionato in modo assoluto
                  opacity-0: invisibile di default
                  group-hover:opacity-100: diventa visibile quando si passa col mouse sul gruppo
                  pointer-events-none: non interferisce con i click
                  z-50: si sovrappone ad altri elementi
                */}
                {!sidebarAperta && (
                  <div className="absolute left-16 bg-gray-800 text-white px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* 
          ============================================
          SEZIONE 3: PROFILO E LOGOUT
          ============================================
          border-t: bordo sopra per separare dal menu
          space-y-2: spazio verticale tra gli elementi
        */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          
          {/* 
            INFORMAZIONI UTENTE
            Mostra solo se sidebarAperta è true
          */}
          {sidebarAperta && (
            <div className="px-4 py-2 text-gray-600">
              <div className="text-sm">Salut,</div>
              <div className="font-semibold truncate">{utente.nome}</div>
              {utente.email && sidebarAperta && (
                <div className="text-xs text-gray-500 truncate">{utente.email}</div>
              )}
            </div>
          )}
          
          {/* 
            PULSANTE LOGOUT
            onClick: chiama la funzione onLogout ricevuta dal genitore
            w-full: larghezza 100%
            justify-center: centra il contenuto se sidebar è chiusa
          */}
          <button
            onClick={onLogout}
            className={`
              flex items-center
              w-full px-4 py-3
              rounded-lg
              text-red-600 hover:bg-red-50
              transition-colors
              group
              ${!sidebarAperta && 'justify-center'}
            `}
          >
            <LogOut className="w-5 h-5" />
            {sidebarAperta && <span className="ml-3">Deconectare</span>}
            
            {/* Tooltip pentru deconectare când bara laterală este închisă */}
            {!sidebarAperta && (
              <div className="absolute left-16 bg-gray-800 text-white px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                Deconectare
              </div>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}