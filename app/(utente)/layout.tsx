import Footer from '@/componenti/layout/Footer';

export default function UtenteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <Footer />
    </>
  );
}
