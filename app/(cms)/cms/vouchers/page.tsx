'use client';

import { useState, useEffect } from 'react';
import webservice from '@/utils/webservice';
import Card from '@/componenti/interfaccia/Card';
import Bottone from '@/componenti/interfaccia/Bottone';
import Input from '@/componenti/interfaccia/Input';
import Messaggio from '@/componenti/comuni/Messaggio';
import Caricamento from '@/componenti/comuni/Caricamento';
import { Plus, Gift, Trash2, Copy } from 'lucide-react';

interface Serviciu {
  _id: string;
  nome: string;
  categoria?: string;
  durata?: number;
  prezzo?: number;
}

interface Voucher {
  _id: string;
  code: string;
  customerName: string;
  customerSurname?: string;
  customerPhone?: string;
  customerEmail?: string;
  type: string;
  value: number;
  appliesToAll: boolean;
  services: Serviciu[];
  status: string;
  expiresAt?: string;
  usedAt?: string;
  notes?: string;
}

export default function VouchersPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [servicii, setServicii] = useState<Serviciu[]>([]);
  const [caricamento, setCaricamento] = useState(true);
  const [errore, setErrore] = useState('');
  const [successo, setSuccesso] = useState('');
  const [filtruStatus, setFiltruStatus] = useState('');
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    code: '',
    customerName: '',
    customerSurname: '',
    customerPhone: '',
    customerEmail: '',
    type: 'percentage',
    value: '',
    serviceMode: 'all',
    selectedServices: [] as string[],
    expiresAt: '',
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, [filtruStatus]);

  const loadServices = async () => {
    try {
      const res = await webservice.get('/api/services');
      setServicii(res.dati || []);
    } catch (err) {
      console.error('Error loading services:', err);
    }
  };

  const loadData = async () => {
    try {
      setCaricamento(true);
      const params = filtruStatus ? `?status=${filtruStatus}` : '';
      const [voucherRes, servicesRes] = await Promise.all([
        webservice.get(`/api/vouchers/manage${params}`),
        webservice.get('/api/services'),
      ]);
      setVouchers(voucherRes.dati);
      setServicii(servicesRes.dati);
    } catch (err) {
      setErrore('Eroare la încărcare');
    } finally {
      setCaricamento(false);
    }
  };

  const handleCreate = async () => {
    if (!form.customerName || !form.type || !form.value) {
      setErrore('Completați câmpurile obligatorii');
      return;
    }

    try {
      await webservice.post('/api/vouchers/manage', {
        code: form.code || undefined,
        customerName: form.customerName,
        customerSurname: form.customerSurname || undefined,
        customerPhone: form.customerPhone || undefined,
        customerEmail: form.customerEmail || undefined,
        type: form.type,
        value: parseFloat(form.value),
        appliesToAll: form.serviceMode === 'all',
        services: form.serviceMode === 'all' ? [] : form.selectedServices,
        expiresAt: form.expiresAt || undefined,
        notes: form.notes || undefined,
      });

      setSuccesso('Voucher creat cu succes!');
      setShowModal(false);
      setForm({ code: '', customerName: '', customerSurname: '', customerPhone: '', customerEmail: '', type: 'percentage', value: '', serviceMode: 'all', selectedServices: [], expiresAt: '', notes: '' });
      loadData();
    } catch (err: any) {
      setErrore(err.response?.data?.errore || 'Eroare la creare');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Sigur doriți să ștergeți acest voucher?')) return;
    try {
      await webservice.delete(`/api/vouchers/manage/${id}`);
      setSuccesso('Voucher șters');
      loadData();
    } catch (err: any) {
      setErrore(err.response?.data?.errore || 'Eroare');
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setSuccesso('Cod copiat: ' + code);
  };

  const toggleService = (id: string) => {
    setForm(prev => ({
      ...prev,
      selectedServices: prev.selectedServices.includes(id)
        ? prev.selectedServices.filter(s => s !== id)
        : [...prev.selectedServices, id]
    }));
  };

  const getTypeLabel = (v: Voucher) => {
    switch (v.type) {
      case 'percentage': return `${v.value}% reducere`;
      case 'fixed': return `${v.value} Lei reducere`;
      case 'free': return 'Gratuit';
      default: return v.type;
    }
  };

  const getServiceLabel = (v: Voucher) => {
    if (v.appliesToAll) return 'Orice serviciu';
    if (v.services?.length > 0) return v.services.map(s => s.nome).join(', ');
    return 'Niciun serviciu';
  };

  const getStatusBadge = (s: string) => {
    switch (s) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'used': return 'bg-gray-100 text-gray-600';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100';
    }
  };

  if (caricamento) return <Caricamento />;

  return (
    <div className="py-8 pb-24">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 md:mb-6">
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
          <Gift className="w-6 h-6 md:w-7 md:h-7" />
          Vouchere
        </h1>
        <Bottone onClick={() => { loadServices(); setShowModal(true); }} className="w-full sm:w-auto flex items-center gap-2 justify-center">
          <Plus className="w-4 h-4" /> Voucher nou
        </Bottone>
      </div>

      {errore && <Messaggio tipo="errore" messaggio={errore} onChiudi={() => setErrore('')} />}
      {successo && <Messaggio tipo="successo" messaggio={successo} onChiudi={() => setSuccesso('')} />}

      <div className="flex gap-2 mb-6 flex-wrap overflow-x-auto pb-1">
        {['', 'active', 'used', 'expired'].map((s) => (
          <button
            key={s}
            onClick={() => setFiltruStatus(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filtruStatus === s ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {s === '' ? 'Toate' : s === 'active' ? 'Active' : s === 'used' ? 'Folosite' : 'Expirate'}
          </button>
        ))}
      </div>

      {vouchers.length === 0 ? (
        <Card><p className="text-center py-8 text-gray-500">Nu există vouchere</p></Card>
      ) : (
        <div className="space-y-3">
          {vouchers.map((v) => (
            <Card key={v._id}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center flex-wrap gap-2 mb-1">
                    <span className="text-base md:text-lg font-bold tracking-wider">{v.code}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusBadge(v.status)}`}>
                      {v.status === 'active' ? 'Activ' : v.status === 'used' ? 'Folosit' : 'Expirat'}
                    </span>
                  </div>
                  <p className="font-medium truncate text-sm md:text-base">
                    {v.customerName}{v.customerSurname ? ` ${v.customerSurname}` : ''}
                  </p>
                  <p className="text-xs md:text-sm text-gray-500">{getTypeLabel(v)}</p>
                  <p className="text-xs text-gray-400 truncate">{getServiceLabel(v)}</p>
                  {v.usedAt && <p className="text-xs text-gray-400">Folosit: {new Date(v.usedAt).toLocaleDateString('ro-RO')}</p>}
                  {v.expiresAt && <p className="text-xs text-gray-400">Expiră: {new Date(v.expiresAt).toLocaleDateString('ro-RO')}</p>}
                </div>
                <div className="flex gap-2 sm:ml-4">
                  <Bottone onClick={() => copyCode(v.code)} dimensione="small" variante="secondary" title="Copiază codul">
                    <Copy className="w-3 h-3" />
                  </Bottone>
                  <Bottone onClick={() => handleDelete(v._id)} dimensione="small" variante="secondary" className="text-red-600">
                    <Trash2 className="w-3 h-3" />
                  </Bottone>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl p-4 sm:p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Voucher nou</h2>

            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input label="Prenume" value={form.customerName} onChange={(v) => setForm({ ...form, customerName: v })} required />
                <Input label="Nume" value={form.customerSurname} onChange={(v) => setForm({ ...form, customerSurname: v })} />
              </div>
              <Input label="Telefon" value={form.customerPhone} onChange={(v) => setForm({ ...form, customerPhone: v })} />
              <Input label="Email" value={form.customerEmail} onChange={(v) => setForm({ ...form, customerEmail: v })} />

              <div>
                <label className="block text-sm font-medium mb-1">Tip voucher</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="input-field w-full"
                >
                  <option value="percentage">Procent (%)</option>
                  <option value="fixed">Sumă fixă (Lei)</option>
                  <option value="free">Gratuit</option>
                </select>
              </div>

              <Input
                label={form.type === 'percentage' ? 'Procent (1-100)' : form.type === 'fixed' ? 'Sumă (Lei)' : 'Valoare'}
                type="number"
                value={form.value}
                onChange={(v) => setForm({ ...form, value: v })}
                required
              />

              <div>
                <label className="block text-sm font-medium mb-1">Aplicabil pentru</label>
                <div className="flex gap-2 mb-2">
                  {[
                    { value: 'all', label: 'Orice serviciu' },
                    { value: 'specific', label: 'Servicii specifice' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setForm({ ...form, serviceMode: opt.value, selectedServices: [] })}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        form.serviceMode === opt.value
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {form.serviceMode === 'specific' && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">
                      {servicii.length > 0
                        ? `${servicii.length} servicii disponibile — selectate ${form.selectedServices.length}`
                        : 'Se încarcă serviciile...'}
                    </p>
                    <div className="max-h-48 overflow-y-auto border rounded-lg p-2 space-y-1 bg-gray-50">
                      {servicii.length === 0 ? (
                        <p className="text-sm text-gray-400 p-2">Nu există servicii încă</p>
                      ) : (
                        servicii.map((s) => (
                          <label
                            key={s._id}
                            className={`flex items-start gap-3 px-3 py-2 rounded cursor-pointer transition-colors ${
                              form.selectedServices.includes(s._id)
                                ? 'bg-primary-100 text-primary-800'
                                : 'hover:bg-gray-100'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={form.selectedServices.includes(s._id)}
                              onChange={() => toggleService(s._id)}
                              className="w-4 h-4 mt-1"
                            />
                            <div className="flex-1 min-w-0">
                              <span className="text-sm font-medium block">{s.nome}</span>
                              <span className="text-xs text-gray-500">
                                {s.categoria && `${s.categoria} · `}
                                {s.durata && `${s.durata}min · `}
                                {s.prezzo !== undefined && `€${s.prezzo}`}
                              </span>
                            </div>
                          </label>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <Input label="Cod (opțional - generat automat)" value={form.code} onChange={(v) => setForm({ ...form, code: v })} />
              <Input label="Expiră la (opțional)" type="date" value={form.expiresAt} onChange={(v) => setForm({ ...form, expiresAt: v })} />

              <div>
                <label className="block text-sm font-medium mb-1">Note</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="input-field w-full"
                  rows={2}
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <Bottone onClick={handleCreate} className="w-full sm:flex-1">Creează voucher</Bottone>
              <Bottone onClick={() => setShowModal(false)} variante="secondary" className="w-full sm:flex-1">Anulare</Bottone>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
