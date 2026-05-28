'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import webservice from '@/utils/webservice';
import Card from '@/componenti/interfaccia/Card';
import Bottone from '@/componenti/interfaccia/Bottone';
import Input from '@/componenti/interfaccia/Input';
import Messaggio from '@/componenti/comuni/Messaggio';
import Caricamento from '@/componenti/comuni/Caricamento';
import Modal from '@/componenti/comuni/Modal';
import ModalConferma from '@/componenti/comuni/ModalConferma';
import { Plus, Edit3, X, Building, MapPin, Power, PowerOff, Map } from 'lucide-react';

interface Postazione {
  nome: string;
  descrizione?: string;
  attivo: boolean;
}

interface Sede {
  _id: string;
  nome: string;
  indirizzo: string;
  citta: string;
  cap?: string;
  provincia?: string;
  telefono?: string;
  coordinate?: { lat: number; lng: number };
  postazioni: Postazione[];
  attivo: boolean;
}

export default function LocatiiPage() {
  const router = useRouter();
  const [sedi, setSedi] = useState<Sede[]>([]);
  const [incarcare, setIncarcare] = useState(true);
  const [eroare, setEroare] = useState('');
  const [succes, setSucces] = useState('');

  const [modalDeschisa, setModalDeschisa] = useState(false);
  const [sediuInEditare, setSediuInEditare] = useState<Sede | null>(null);

  const [formData, setFormData] = useState({
    nome: '',
    indirizzo: '',
    citta: '',
    cap: '',
    provincia: '',
    telefono: '',
    latitudine: '',
    longitudine: '',
  });
  const [postazioni, setPostazioni] = useState<Postazione[]>([]);
  const [seSalveaza, setSeSalveaza] = useState(false);

  const [confirmareDeschisa, setConfirmareDeschisa] = useState(false);
  const [sediuDeSters, setSediuDeSters] = useState<Sede | null>(null);

  useEffect(() => {
    incarcaSedii();
  }, []);

  const incarcaSedii = async () => {
    try {
      setIncarcare(true);
      const raspuns = await webservice.get('/api/sedi');
      setSedi(raspuns.dati || []);
    } catch {
      setEroare('Eroare la încărcarea locațiilor');
    } finally {
      setIncarcare(false);
    }
  };

  const deschideModalNou = () => {
    setSediuInEditare(null);
    setFormData({ nome: '', indirizzo: '', citta: '', cap: '', provincia: '', telefono: '', latitudine: '', longitudine: '' });
    setPostazioni([]);
    setModalDeschisa(true);
  };

  const deschideModalEditare = (sediu: Sede) => {
    setSediuInEditare(sediu);
    setFormData({
      nome: sediu.nome,
      indirizzo: sediu.indirizzo,
      citta: sediu.citta,
      cap: sediu.cap || '',
      provincia: sediu.provincia || '',
      telefono: sediu.telefono || '',
      latitudine: sediu.coordinate?.lat?.toString() || '',
      longitudine: sediu.coordinate?.lng?.toString() || '',
    });
    setPostazioni(sediu.postazioni || []);
    setModalDeschisa(true);
  };

  const adaugaPost = () => {
    setPostazioni([...postazioni, { nome: '', descrizione: '', attivo: true }]);
  };

  const stergePost = (index: number) => {
    setPostazioni(postazioni.filter((_, i) => i !== index));
  };

  const actualizeazaPost = (index: number, camp: string, valoare: any) => {
    const noi = [...postazioni];
    (noi[index] as any)[camp] = valoare;
    setPostazioni(noi);
  };

  const handleSalvare = async () => {
    if (!formData.nome || !formData.indirizzo || !formData.citta) {
      setEroare('Numele, adresa și orașul sunt obligatorii');
      return;
    }
    const posturiValide = postazioni.filter(p => p.nome.trim());
    if (posturiValide.length === 0) {
      setEroare('Adăugați cel puțin un post de lucru');
      return;
    }
    try {
      setSeSalveaza(true);
      setEroare('');
      const coordLat = parseFloat(formData.latitudine);
      const coordLng = parseFloat(formData.longitudine);
      const payload: any = {
        nome: formData.nome,
        indirizzo: formData.indirizzo,
        citta: formData.citta,
        cap: formData.cap,
        provincia: formData.provincia,
        telefono: formData.telefono,
        coordinate: (!isNaN(coordLat) && !isNaN(coordLng)) ? { lat: coordLat, lng: coordLng } : undefined,
        postazioni: posturiValide.map(p => ({ ...p, nome: p.nome.trim() })),
      };
      if (sediuInEditare) {
        await webservice.put(`/api/sedi/${sediuInEditare._id}`, payload);
        setSucces('Locație actualizată cu succes');
      } else {
        await webservice.post('/api/sedi', payload);
        setSucces('Locație creată cu succes');
      }
      setModalDeschisa(false);
      incarcaSedii();
    } catch (err: any) {
      setEroare(err.response?.data?.eroare || 'Eroare la salvarea locației');
    } finally {
      setSeSalveaza(false);
    }
  };

  const toggleStareSedi = async (sediu: Sede) => {
    try {
      setEroare('');
      const payload = { attivo: !sediu.attivo };
      await webservice.put(`/api/sedi/${sediu._id}`, payload);
      setSucces(sediu.attivo ? 'Locație dezactivată' : 'Locație reactivată');
      incarcaSedii();
    } catch (err: any) {
      setEroare(err.response?.data?.eroare || 'Eroare la modificarea stării');
    }
  };

  const deschideConfirmareStergere = (sediu: Sede) => {
    setSediuDeSters(sediu);
    setConfirmareDeschisa(true);
  };

  const confirmaStergerea = async () => {
    if (!sediuDeSters) return;
    try {
      await webservice.delete(`/api/sedi/${sediuDeSters._id}`);
      setSucces(`Locația "${sediuDeSters.nome}" a fost dezactivată`);
      setConfirmareDeschisa(false);
      setSediuDeSters(null);
      incarcaSedii();
    } catch (err: any) {
      setEroare(err.response?.data?.eroare || 'Eroare la dezactivare');
    }
  };

  if (incarcare) return <Caricamento />;

  const sediActive = sedi.filter(s => s.attivo);
  const sediInactive = sedi.filter(s => !s.attivo);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Building className="w-6 h-6 text-primary-600" />
            Locații
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {sedi.length} locații • {sediActive.length} active
          </p>
        </div>
        <Bottone onClick={deschideModalNou} className="w-full sm:w-auto flex items-center gap-2 justify-center">
          <Plus className="w-4 h-4" />
          Adaugă Locație
        </Bottone>
      </div>

      {eroare && <Messaggio tipo="errore" messaggio={eroare} onChiudi={() => setEroare('')} />}
      {succes && <Messaggio tipo="successo" messaggio={succes} onChiudi={() => setSucces('')} />}

      {/* Empty state */}
      {sedi.length === 0 ? (
        <div className="bg-gray-50 rounded-xl p-16 text-center border-2 border-dashed border-gray-200">
          <Building className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-xl font-semibold text-gray-600 mb-2">Nicio locație încă</p>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Adaugă prima locație pentru a gestiona posturile de lucru și programările
          </p>
          <Bottone onClick={deschideModalNou}>
            <Plus className="w-4 h-4" />
            Adaugă Locație
          </Bottone>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Active locations */}
          {sediActive.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Active ({sediActive.length})
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {sediActive.map((sediu) => (
                  <SediCard
                    key={sediu._id}
                    sediu={sediu}
                    onEdit={() => deschideModalEditare(sediu)}
                    onToggleStare={() => toggleStareSedi(sediu)}
                    onSterge={() => deschideConfirmareStergere(sediu)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Inactive locations */}
          {sediInactive.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Inactive ({sediInactive.length})
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {sediInactive.map((sediu) => (
                  <SediCard
                    key={sediu._id}
                    sediu={sediu}
                    onEdit={() => deschideModalEditare(sediu)}
                    onToggleStare={() => toggleStareSedi(sediu)}
                    onSterge={() => {}}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal form */}
      <Modal
        isOpen={modalDeschisa}
        onClose={() => setModalDeschisa(false)}
        title={sediuInEditare ? 'Editează Locația' : 'Locație Nouă'}
        size="xl"
      >
        <div className="space-y-5">
          {/* Basic info */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Informații de Bază</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="Nume *"
                value={formData.nome}
                onChange={(v) => setFormData({ ...formData, nome: v })}
                placeholder="de ex. Locația Centrală"
                required
              />
              <Input
                label="Oraș *"
                value={formData.citta}
                onChange={(v) => setFormData({ ...formData, citta: v })}
                placeholder="de ex. București"
                required
              />
            </div>
            <div className="mt-4">
              <Input
                label="Adresă *"
                value={formData.indirizzo}
                onChange={(v) => setFormData({ ...formData, indirizzo: v })}
                placeholder="de ex. Strada Victoriei 123"
                required
              />
            </div>
            <div className="grid md:grid-cols-3 gap-4 mt-4">
              <Input
                label="Cod Poștal"
                value={formData.cap || ''}
                onChange={(v) => setFormData({ ...formData, cap: v })}
                placeholder="de ex. 010101"
              />
              <Input
                label="Județ"
                value={formData.provincia || ''}
                onChange={(v) => setFormData({ ...formData, provincia: v })}
                placeholder="de ex. Ilfov"
              />
              <Input
                label="Telefon"
                value={formData.telefono || ''}
                onChange={(v) => setFormData({ ...formData, telefono: v })}
                placeholder="de ex. +40 21 1234567"
              />
            </div>
          </div>

          {/* Map coordinates */}
          <div className="pt-4 border-t">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
              <span className="flex items-center gap-2">
                <Map className="w-4 h-4" />
                Coordonate Hartă
              </span>
            </h3>
            <p className="text-xs text-gray-400 mb-3">
              Adaugă coordonatele GPS pentru a afișa harta în pagina de programare. Poți găsi coordonatele pe Google Maps.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                  label="Latitudine"
                  value={formData.latitudine || ''}
                  onChange={(v) => setFormData({ ...formData, latitudine: v })}
                  placeholder="de ex. 44.4268"
                  type="number"
                />
                <Input
                  label="Longitudine"
                  value={formData.longitudine || ''}
                  onChange={(v) => setFormData({ ...formData, longitudine: v })}
                  placeholder="de ex. 26.1025"
                  type="number"
                />
            </div>
            {formData.latitudine && formData.longitudine && (
              <div className="mt-3 aspect-[21/9] bg-gray-100 rounded-lg overflow-hidden border">
                <iframe
                  src={`https://www.google.com/maps?q=${formData.latitudine},${formData.longitudine}&z=15&output=embed`}
                  className="w-full h-full pointer-events-none"
                  title="Previzualizare hartă"
                />
              </div>
            )}
          </div>

          {/* Workstations */}
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                Posturi de Lucru
              </h3>
              <button
                onClick={adaugaPost}
                className="text-sm bg-primary-50 text-primary-700 hover:bg-primary-100 font-medium px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Adaugă Post
              </button>
            </div>

            {postazioni.length === 0 && (
              <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
                <p className="text-sm text-gray-400">Nu s-au adăugat posturi încă.</p>
                <p className="text-xs text-gray-300 mt-1">Adăugați cel puțin un post de lucru pentru a putea salva locația.</p>
              </div>
            )}

            <div className="space-y-2">
              {postazioni.map((p, index) => (
                <div key={index} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-2">
                    <input
                      type="text"
                      value={p.nome}
                      onChange={(e) => actualizeazaPost(index, 'nome', e.target.value)}
                      placeholder="Nume post (de ex. Post 1)"
                      className="md:col-span-2 border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      value={p.descrizione || ''}
                      onChange={(e) => actualizeazaPost(index, 'descrizione', e.target.value)}
                      placeholder="Descriere opțională"
                      className="md:col-span-2 border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <label className="flex items-center gap-2 text-sm cursor-pointer px-2 py-2 bg-white rounded border border-gray-100">
                      <input
                        type="checkbox"
                        checked={p.attivo}
                        onChange={(e) => actualizeazaPost(index, 'attivo', e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-gray-600 text-xs font-medium">Activ</span>
                    </label>
                  </div>
                  <button
                    onClick={() => stergePost(index)}
                    className="p-2 hover:bg-red-50 text-red-400 hover:text-red-600 rounded-lg transition-colors shrink-0"
                    title="Șterge postul"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-8 pt-4 border-t">
          <Bottone onClick={() => setModalDeschisa(false)} variante="secondary">
            Anulează
          </Bottone>
          <Bottone onClick={handleSalvare} disabled={seSalveaza}>
            {seSalveaza
              ? 'Se salvează...'
              : sediuInEditare
                ? 'Salvează Modificările'
                : 'Creează Locația'
            }
          </Bottone>
        </div>
      </Modal>

      {/* Confirm deactivation modal */}
      <ModalConferma
        isOpen={confirmareDeschisa}
        onClose={() => { setConfirmareDeschisa(false); setSediuDeSters(null); }}
        onConfirm={confirmaStergerea}
        titolo={`Dezactivează Locația`}
        messaggio={`Ești sigur că vrei să dezactivezi locația "${sediuDeSters?.nome}"? Locația nu va mai fi disponibilă pentru programări noi, dar programările existente rămân valabile. Poți reactiva oricând locația din panoul de control.`}
        tipo="danger"
        testoConferma="Da, Dezactivează"
        testoAnnulla="Anulează"
      />
    </div>
  );
}

// ============================================================================
// Location Card Component
// ============================================================================
function SediCard({
  sediu,
  onEdit,
  onToggleStare,
  onSterge,
}: {
  sediu: Sede;
  onEdit: () => void;
  onToggleStare: () => void;
  onSterge: () => void;
}) {
  const posturiActive = sediu.postazioni?.filter(p => p.attivo).length || 0;
  const posturiTotal = sediu.postazioni?.length || 0;

  return (
    <Card className={`relative overflow-hidden ${!sediu.attivo ? 'opacity-70' : ''}`}>
      {/* Status bar at top */}
      <div className={`h-1 ${sediu.attivo ? 'bg-primary-500' : 'bg-gray-300'}`} />

      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Building className={`w-5 h-5 shrink-0 ${sediu.attivo ? 'text-primary-600' : 'text-gray-400'}`} />
              <h3 className="text-lg font-bold truncate">{sediu.nome}</h3>
              {!sediu.attivo && (
                <span className="bg-gray-100 text-gray-500 text-xs font-medium px-2 py-0.5 rounded-full shrink-0">
                  Inactiv
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{sediu.indirizzo}, {sediu.citta}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 ml-4 shrink-0">
            {sediu.attivo ? (
              <>
                <button
                  onClick={onEdit}
                  className="p-2 hover:bg-blue-50 text-gray-500 hover:text-blue-600 rounded-lg transition-colors"
                  title="Editează locația"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </>
            ) : (
              <button
                onClick={onEdit}
                className="p-2 hover:bg-blue-50 text-gray-500 hover:text-blue-600 rounded-lg transition-colors"
                title="Editează locația"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {sediu.telefono && (
          <p className="text-sm text-gray-600 mt-3">
            <span className="text-gray-400">Tel:</span> {sediu.telefono}
          </p>
        )}

        {/* Map coordinates badge */}
        {sediu.coordinate?.lat && sediu.coordinate?.lng && (
          <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-400">
            <Map className="w-3 h-3" />
            <span>{sediu.coordinate.lat.toFixed(4)}, {sediu.coordinate.lng.toFixed(4)}</span>
          </div>
        )}

        {/* Workstations */}
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Posturi de Lucru
            </span>
            <span className="text-xs text-gray-400">
              {posturiActive} / {posturiTotal} active
            </span>
          </div>
          {posturiActive > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {sediu.postazioni?.filter(p => p.attivo).map((p, i) => (
                <span key={i} className="bg-primary-50 text-primary-700 text-xs font-medium px-2.5 py-1 rounded-md">
                  {p.nome}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 italic">Niciun post activ</p>
          )}
        </div>

        {/* Footer actions */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
          {sediu.attivo ? (
            <button
              onClick={onToggleStare}
              className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <PowerOff className="w-3.5 h-3.5" />
              Dezactivează
            </button>
          ) : (
            <button
              onClick={onToggleStare}
              className="text-xs text-green-600 hover:text-green-800 hover:bg-green-50 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Power className="w-3.5 h-3.5" />
              Activează
            </button>
          )}
        </div>
      </div>
    </Card>
  );
}
