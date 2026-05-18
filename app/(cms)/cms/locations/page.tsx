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
import { Plus, Edit3, X, Building, MapPin } from 'lucide-react';

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
  });
  const [postazioni, setPostazioni] = useState<Postazione[]>([]);
  const [seSalveaza, setSeSalveaza] = useState(false);

  const [confirmareDeschisa, setConfirmareDeschisa] = useState(false);
  const [sediuDeSters, setSediuDeSters] = useState<string | null>(null);

  useEffect(() => {
    incarcaSedii();
  }, []);

  const incarcaSedii = async () => {
    try {
      setIncarcare(true);
      const raspuns = await webservice.get('/api/sedi');
      setSedi(raspuns.dati || []);
    } catch (err: any) {
      setEroare('Eroare la încărcarea locațiilor');
    } finally {
      setIncarcare(false);
    }
  };

  const deschideModalNou = () => {
    setSediuInEditare(null);
    setFormData({ nome: '', indirizzo: '', citta: '', cap: '', provincia: '', telefono: '' });
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

      const payload = {
        ...formData,
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

  const confirmaStergerea = async () => {
    if (!sediuDeSters) return;
    try {
      await webservice.delete(`/api/sedi/${sediuDeSters}`);
      setSucces('Locație dezactivată cu succes');
      setConfirmareDeschisa(false);
      setSediuDeSters(null);
      incarcaSedii();
    } catch (err: any) {
      setEroare(err.response?.data?.eroare || 'Eroare la ștergerea locației');
    }
  };

  if (incarcare) return <Caricamento />;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 md:mb-8">
        <h1 className="text-2xl md:text-4xl font-bold flex items-center gap-2 md:gap-3">
          <Building className="w-5 h-5 md:w-8 md:h-8" />
          Locații
        </h1>
        <Bottone onClick={deschideModalNou} className="w-full sm:w-auto flex items-center gap-2 justify-center">
          <Plus className="w-4 h-4" />
          Adaugă Locație
        </Bottone>
      </div>

      {eroare && <Messaggio tipo="eroare" messaggio={eroare} onChiudi={() => setEroare('')} />}
      {succes && <Messaggio tipo="succes" messaggio={succes} onChiudi={() => setSucces('')} />}

      {sedi.length === 0 ? (
        <div className="bg-gray-50 rounded-xl p-12 text-center">
          <Building className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-xl font-semibold text-gray-600 mb-2">Nicio locație încă</p>
          <p className="text-gray-500 mb-6">Adaugă prima locație pentru a gestiona posturile de lucru și programările</p>
          <Bottone onClick={deschideModalNou}>
            <Plus className="w-4 h-4" />
            Adaugă Locație
          </Bottone>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {sedi.map((sediu) => (
            <Card key={sediu._id} className={!sediu.attivo ? 'opacity-60' : ''}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Building className="w-5 h-5 text-primary-600" />
                    {sediu.nome}
                  </h3>
                  <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                    <MapPin className="w-4 h-4" />
                    {sediu.indirizzo}, {sediu.citta}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => deschideModalEditare(sediu)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  {sediu.attivo && (
                    <button
                      onClick={() => {
                        setSediuDeSters(sediu._id);
                        setConfirmareDeschisa(true);
                      }}
                      className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {sediu.telefono && (
                <p className="text-sm text-gray-600 mb-3">Tel: {sediu.telefono}</p>
              )}

              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">
                  Posturi ({sediu.postazioni?.filter(p => p.attivo).length || 0} active)
                </p>
                <div className="flex flex-wrap gap-2">
                  {sediu.postazioni?.filter(p => p.attivo).map((p, i) => (
                    <span key={i} className="bg-primary-100 text-primary-700 text-xs font-medium px-2.5 py-1 rounded-full">
                      {p.nome}
                    </span>
                  ))}
                  {(!sediu.postazioni || sediu.postazioni.length === 0) && (
                    <span className="text-xs text-gray-400">Niciun post definit</span>
                  )}
                </div>
              </div>

              {!sediu.attivo && (
                <div className="mt-4 bg-yellow-50 text-yellow-700 text-xs font-medium px-3 py-1.5 rounded">
                  Inactiv
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

        <Modal
          isOpen={modalDeschisa}
          onClose={() => setModalDeschisa(false)}
          title={sediuInEditare ? 'Editează Locația' : 'Locație Nouă'}
          size="xl"
        >
          <div>

            <div className="space-y-4">
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

              <Input
                label="Adresă *"
                value={formData.indirizzo}
                onChange={(v) => setFormData({ ...formData, indirizzo: v })}
                placeholder="de ex. Strada Victoriei 123"
                required
              />

              <div className="grid md:grid-cols-3 gap-4">
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

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-3">
                  <label className="font-semibold">Posturi de Lucru</label>
                  <button
                    onClick={adaugaPost}
                    className="text-sm text-primary-600 hover:text-primary-800 font-medium flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Adaugă Post
                  </button>
                </div>

                {postazioni.length === 0 && (
                  <p className="text-sm text-gray-400 mb-3">Nu s-au adăugat posturi încă. Adăugați cel puțin un post de lucru.</p>
                )}

                <div className="space-y-2">
                  {postazioni.map((p, index) => (
                    <div key={index} className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg">
                      <input
                        type="text"
                        value={p.nome}
                        onChange={(e) => actualizeazaPost(index, 'nome', e.target.value)}
                        placeholder="Nume post (de ex. Post 1, Post A)"
                        className="flex-1 border rounded px-3 py-2 text-sm"
                      />
                      <input
                        type="text"
                        value={p.descrizione || ''}
                        onChange={(e) => actualizeazaPost(index, 'descrizione', e.target.value)}
                        placeholder="Descriere opțională"
                        className="flex-1 border rounded px-3 py-2 text-sm"
                      />
                      <label className="flex items-center gap-1 text-sm cursor-pointer whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={p.attivo}
                          onChange={(e) => actualizeazaPost(index, 'attivo', e.target.checked)}
                        />
                        Activ
                      </label>
                      <button
                        onClick={() => stergePost(index)}
                        className="p-2 hover:bg-red-50 text-red-600 rounded-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <Bottone onClick={() => setModalDeschisa(false)} variante="secondary">
                Anulează
              </Bottone>
              <Bottone onClick={handleSalvare} disabled={seSalveaza}>
                {seSalveaza ? 'Se salvează...' : sediuInEditare ? 'Salvează Modificările' : 'Creează Locația'}
              </Bottone>
            </div>
          </div>
        </Modal>

        <ModalConferma
          isOpen={confirmareDeschisa}
          onClose={() => { setConfirmareDeschisa(false); setSediuDeSters(null); }}
          onConfirm={confirmaStergerea}
          titolo="Dezactivezi Locația?"
          messaggio="Aceasta va dezactiva locația. Programările deja făcute vor rămâne."
          tipo="danger"
          testoConferma="Dezactivează"
          testoAnnulla="Anulează"
        />
    </div>
  );
}
