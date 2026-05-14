/**
 * COMPONENTE: CARICAMENTO
 * 
 * Indicatore di caricamento (spinner).
 */

export default function Caricamento() {
  return (
    <div className="flex justify-center items-center p-8">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  );
}
