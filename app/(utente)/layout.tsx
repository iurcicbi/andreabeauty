import Header from '@/componenti/layout/Header';
import Footer from '@/componenti/layout/Footer';
import CookieConsent from '@/componenti/layout/CookieConsent';

export default function UtenteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      {children}
      <Footer />
      <CookieConsent />
    </>
  );
}
