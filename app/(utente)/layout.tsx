import Header from '@/componenti/layout/Header';
import Footer from '@/componenti/layout/Footer';

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
    </>
  );
}
