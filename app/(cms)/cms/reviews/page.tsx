'use client';

import { useState, useEffect, useCallback } from 'react';
import webservice from '@/utils/webservice';
import Card from '@/componenti/interfaccia/Card';
import Bottone from '@/componenti/interfaccia/Bottone';
import Messaggio from '@/componenti/comuni/Messaggio';
import Caricamento from '@/componenti/comuni/Caricamento';
import Modal from '@/componenti/comuni/Modal';
import Input from '@/componenti/interfaccia/Input';
import ImageUploader from '@/componenti/cms/ImageUploader';
import {
  Star, ThumbsUp, EyeOff, Reply, Trash2, MessageSquare,
  Search, Plus, Edit3, Sparkles, CheckCircle, XCircle,
  GripVertical, ArrowUp, ArrowDown, ExternalLink,
} from 'lucide-react';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type TReview = {
  _id: string;
  customerName: string;
  customerEmail?: string;
  usernameInstagram?: string;
  avatar?: string;
  rating: number;
  comment: string;
  reply?: string;
  replyAt?: string;
  status: string;
  serviceName: string;
  serviceId: string;
  source: string;
  images: string[];
  verified: boolean;
  featured: boolean;
  reviewDate: string;
  ordine: number;
  createdAt: string;
};

type TFormData = {
  customerName: string;
  customerEmail: string;
  usernameInstagram: string;
  avatar: string;
  rating: number;
  comment: string;
  serviceId: string;
  serviceName: string;
  source: string;
  images: string[];
  verified: boolean;
  featured: boolean;
  status: string;
  reviewDate: string;
};

const STATI = [
  { value: '', label: 'Toate' },
  { value: 'bozza', label: 'Boză' },
  { value: 'approvata', label: 'Aprobată' },
  { value: 'nascosta', label: 'Ascunsă' },
];

const SURSE = [
  { value: '', label: 'Toate sursele' },
  { value: 'Direct', label: 'Directă' },
  { value: 'Instagram', label: 'Instagram' },
  { value: 'WhatsApp', label: 'WhatsApp' },
  { value: 'Google', label: 'Google' },
  { value: 'Facebook', label: 'Facebook' },
];

const VALUTAZIONI = [
  { value: 0, label: 'Toate ratingurile' },
  { value: 5, label: '⭐ 5 stele' },
  { value: 4, label: '⭐⭐⭐⭐ 4+' },
  { value: 3, label: '⭐⭐⭐ 3+' },
];

function SortableReviewCard({
  review,
  onEdit,
  onDelete,
  onToggleFeature,
  onToggleStatus,
  onToggleApprova,
  onToggleHide,
}: {
  review: TReview;
  onEdit: (r: TReview) => void;
  onDelete: (id: string) => void;
  onToggleFeature: (r: TReview) => void;
  onToggleStatus: (r: TReview) => void;
  onToggleApprova: (r: TReview) => void;
  onToggleHide: (r: TReview) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: review._id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const renderStars = (n: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-3.5 h-3.5 ${i < n ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
    ));

  const badgeStatus = (s: string) => {
    switch (s) {
      case 'approvata':
      case 'approved': return 'bg-green-100 text-green-800';
      case 'nascosta':
      case 'rejected': return 'bg-gray-100 text-gray-500';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const labelStatus = (s: string) => {
    switch (s) {
      case 'approvata':
      case 'approved': return 'Aprobată';
      case 'nascosta':
      case 'rejected': return 'Ascunsă';
      default: return 'Boză';
    }
  };

  const iconSource = (s: string) => {
    switch (s) {
      case 'Instagram': return <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>;
      default: return null;
    }
  };

  return (
    <div ref={setNodeRef} style={style} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <button {...attributes} {...listeners} className="mt-1 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing shrink-0">
          <GripVertical className="w-5 h-5" />
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                {review.avatar ? (
                  <img src={review.avatar} alt="" className="w-7 h-7 rounded-full object-cover" />
                ) : null}
                <h3 className="font-semibold text-sm truncate">{review.customerName}</h3>
                {review.usernameInstagram && (
                  <span className="text-xs text-gray-400">@{review.usernameInstagram}</span>
                )}
                {review.verified && (
                  <CheckCircle className="w-3.5 h-3.5 text-blue-500" />
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                {renderStars(review.rating)}
                {review.serviceName && (
                  <span className="text-xs text-gray-400">{review.serviceName}</span>
                )}
                <span className="text-xs text-gray-400 flex items-center gap-0.5">
                  {iconSource(review.source)}{review.source}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${badgeStatus(review.status)}`}>
                {labelStatus(review.status)}
              </span>
            </div>
          </div>

          <p className="text-sm text-gray-700 leading-relaxed mb-2 line-clamp-2">{review.comment}</p>

          {review.images.length > 0 && (
            <div className="flex gap-1 mb-2 flex-wrap">
              {review.images.map((url, i) => (
                <img key={i} src={url} alt="" className="w-12 h-12 object-cover rounded-lg border" />
              ))}
            </div>
          )}

          {review.featured && (
            <div className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded mb-2 w-fit">
              <Sparkles className="w-3 h-3" /> În evidență
            </div>
          )}

          <div className="flex flex-wrap gap-1.5 pt-2 border-t">
            {review.status !== 'approvata' && review.status !== 'approved' && (
              <Bottone onClick={() => onToggleApprova(review)} dimensione="small" className="text-xs flex items-center gap-1">
                <ThumbsUp className="w-3 h-3" /> Aprobă
              </Bottone>
            )}
            {review.status !== 'nascosta' && review.status !== 'rejected' && (
              <Bottone onClick={() => onToggleHide(review)} dimensione="small" variante="secondary" className="text-xs flex items-center gap-1">
                <EyeOff className="w-3 h-3" /> Ascunde
              </Bottone>
            )}
            <Bottone onClick={() => onToggleFeature(review)} dimensione="small" variante="secondary" className={`text-xs flex items-center gap-1 ${review.featured ? 'text-amber-600' : ''}`}>
              <Sparkles className="w-3 h-3" /> {review.featured ? 'Scoate evidența' : 'Evidență'}
            </Bottone>
            <Bottone onClick={() => onEdit(review)} dimensione="small" variante="secondary" className="text-xs flex items-center gap-1">
              <Edit3 className="w-3 h-3" /> Editează
            </Bottone>
            <Bottone onClick={() => onDelete(review._id)} dimensione="small" variante="secondary" className="text-xs flex items-center gap-1 text-red-600">
              <Trash2 className="w-3 h-3" /> Șterge
            </Bottone>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<TReview[]>([]);
  const [servicii, setServicii] = useState<any[]>([]);
  const [caricamento, setCaricamento] = useState(true);
  const [errore, setErrore] = useState('');
  const [successo, setSuccesso] = useState('');
  const [searchText, setSearchText] = useState('');
  const [filtruStatus, setFiltruStatus] = useState('');
  const [filtruServiciu, setFiltruServiciu] = useState('');
  const [filtruRating, setFiltruRating] = useState(0);
  const [filtruSursa, setFiltruSursa] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [modalAdauga, setModalAdauga] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<TFormData>({
    customerName: '', customerEmail: '', usernameInstagram: '', avatar: '',
    rating: 5, comment: '', serviceId: '', serviceName: '', source: 'Direct',
    images: [], verified: false, featured: false, status: 'bozza',
    reviewDate: new Date().toISOString().split('T')[0],
  });
  const [salvando, setSalvando] = useState(false);
  const [modalDeleteId, setModalDeleteId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchText), 300);
    return () => clearTimeout(timer);
  }, [searchText]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setCaricamento(true);
      const [revRes, servRes] = await Promise.all([
        webservice.get('/api/reviews/manage'),
        webservice.get('/api/services/cms'),
      ]);
      setReviews(revRes.dati || []);
      setServicii(servRes.dati?.servicii || []);
    } catch {
      setErrore('Eroare la încărcarea datelor');
    } finally {
      setCaricamento(false);
    }
  };

  const reviewsFiltrate = reviews.filter((r) => {
    if (filtruStatus && r.status !== filtruStatus) return false;
    if (filtruServiciu && r.serviceId !== filtruServiciu && r.serviceName !== filtruServiciu) return false;
    if (filtruRating && r.rating < filtruRating) return false;
    if (filtruSursa && r.source !== filtruSursa) return false;
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      if (
        !r.customerName.toLowerCase().includes(q) &&
        !(r.usernameInstagram || '').toLowerCase().includes(q) &&
        !r.comment.toLowerCase().includes(q)
      ) return false;
    }
    return true;
  });

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIdx = reviews.findIndex((r) => r._id === active.id);
    const newIdx = reviews.findIndex((r) => r._id === over.id);
    if (oldIdx === -1 || newIdx === -1) return;

    const reordered = arrayMove(reviews, oldIdx, newIdx);
    setReviews(reordered);

    try {
      await webservice.put('/api/reviews/manage/reorder', {
        orderedIds: reordered.map((r) => r._id),
      });
    } catch {
      loadData();
    }
  };

  const openCreate = () => {
    setEditId(null);
    setForm({
      customerName: '', customerEmail: '', usernameInstagram: '', avatar: '',
      rating: 5, comment: '', serviceId: '', serviceName: '', source: 'Direct',
      images: [], verified: false, featured: false, status: 'bozza',
      reviewDate: new Date().toISOString().split('T')[0],
    });
    setModalAdauga(true);
  };

  const openEdit = (review: TReview) => {
    setEditId(review._id);
    setForm({
      customerName: review.customerName,
      customerEmail: review.customerEmail || '',
      usernameInstagram: review.usernameInstagram || '',
      avatar: review.avatar || '',
      rating: review.rating,
      comment: review.comment,
      serviceId: review.serviceId || '',
      serviceName: review.serviceName || '',
      source: review.source || 'Direct',
      images: review.images || [],
      verified: review.verified || false,
      featured: review.featured || false,
      status: review.status,
      reviewDate: review.reviewDate ? review.reviewDate.split('T')[0] : new Date().toISOString().split('T')[0],
    });
    setModalAdauga(true);
  };

  const handleSalva = async () => {
    if (!form.customerName.trim() || !form.comment.trim()) {
      setErrore('Numele clientului și comentariul sunt obligatorii');
      return;
    }
    try {
      setSalvando(true);
      const payload = { ...form, reviewDate: new Date(form.reviewDate).toISOString() };

      if (editId) {
        await webservice.put(`/api/reviews/manage/${editId}`, payload);
        setSuccesso('Recenzie actualizată');
      } else {
        await webservice.post('/api/reviews/manage', payload);
        setSuccesso('Recenzie creată');
      }

      setModalAdauga(false);
      loadData();
    } catch (err: any) {
      setErrore(err.response?.data?.errore || 'Eroare la salvare');
    } finally {
      setSalvando(false);
    }
  };

  const handleDelete = async () => {
    if (!modalDeleteId) return;
    try {
      await webservice.delete(`/api/reviews/manage/${modalDeleteId}`);
      setSuccesso('Recenzie ștearsă');
      setModalDeleteId(null);
      loadData();
    } catch {
      setErrore('Eroare la ștergere');
    }
  };

  const handleToggleFeature = async (review: TReview) => {
    try {
      await webservice.put(`/api/reviews/manage/${review._id}`, { featured: !review.featured });
      setSuccesso(review.featured ? 'Scos din evidență' : 'Pus în evidență');
      loadData();
    } catch {
      setErrore('Eroare la actualizare');
    }
  };

  const handleToggleApprova = async (review: TReview) => {
    try {
      await webservice.put(`/api/reviews/manage/${review._id}`, { status: 'approvata' });
      setSuccesso('Recenzie aprobată');
      loadData();
    } catch {
      setErrore('Eroare la aprobare');
    }
  };

  const handleToggleHide = async (review: TReview) => {
    try {
      await webservice.put(`/api/reviews/manage/${review._id}`, { status: 'nascosta' });
      setSuccesso('Recenzie ascunsă');
      loadData();
    } catch {
      setErrore('Eroare la ascundere');
    }
  };

  const handleAddImage = (url: string) => {
    setForm((prev) => ({ ...prev, images: [...prev.images, url] }));
  };

  const handleRemoveImage = (idx: number) => {
    setForm((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
  };

  if (caricamento) return <Caricamento />;

  return (
    <div className="container mx-auto px-4 py-8 pb-24">
      {errore && <Messaggio tipo="errore" messaggio={errore} onChiudi={() => setErrore('')} />}
      {successo && <Messaggio tipo="successo" messaggio={successo} onChiudi={() => setSuccesso('')} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 md:mb-6">
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
          <MessageSquare className="w-6 h-6 md:w-7 md:h-7" />
          Recenzii
        </h1>
        <Bottone onClick={openCreate} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Adaugă Recenzie
        </Bottone>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Caută după nume, Instagram sau comentariu..."
            className="input-field pl-9 w-full"
          />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <select value={filtruStatus} onChange={(e) => setFiltruStatus(e.target.value)} className="input-field text-sm">
            {STATI.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <select value={filtruServiciu} onChange={(e) => setFiltruServiciu(e.target.value)} className="input-field text-sm">
            <option value="">Toate serviciile</option>
            {servicii.map((s: any) => <option key={s._id} value={s._id}>{s.nume || s.nome}</option>)}
          </select>
          <select value={filtruRating} onChange={(e) => setFiltruRating(Number(e.target.value))} className="input-field text-sm">
            {VALUTAZIONI.map((v) => <option key={v.value} value={v.value}>{v.label}</option>)}
          </select>
          <select value={filtruSursa} onChange={(e) => setFiltruSursa(e.target.value)} className="input-field text-sm">
            {SURSE.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total', value: reviews.length, color: 'bg-gray-50 text-gray-700' },
          { label: 'Aprobate', value: reviews.filter((r) => r.status === 'approvata').length, color: 'bg-green-50 text-green-700' },
          { label: 'În evidență', value: reviews.filter((r) => r.featured).length, color: 'bg-amber-50 text-amber-700' },
          { label: 'Boză', value: reviews.filter((r) => r.status === 'bozza').length, color: 'bg-yellow-50 text-yellow-700' },
        ].map((stat) => (
          <div key={stat.label} className={`rounded-xl p-3 text-center ${stat.color}`}>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-xs font-medium">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Review List */}
      {reviewsFiltrate.length === 0 ? (
        <Card>
          <p className="text-center py-8 text-gray-500">Nu există recenzii care să corespundă filtrelor</p>
        </Card>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={reviewsFiltrate.map((r) => r._id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {reviewsFiltrate.map((review) => (
                <SortableReviewCard
                  key={review._id}
                  review={review}
                  onEdit={openEdit}
                  onDelete={(id) => setModalDeleteId(id)}
                  onToggleFeature={handleToggleFeature}
                  onToggleStatus={() => {}}
                  onToggleApprova={handleToggleApprova}
                  onToggleHide={handleToggleHide}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Create/Edit Modal */}
      <Modal isOpen={modalAdauga} onClose={() => setModalAdauga(false)} title={editId ? 'Editează Recenzie' : 'Adaugă Recenzie'} size="xl">
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Nume Client" value={form.customerName} onChange={(v) => setForm({ ...form, customerName: v })} required />
            <Input label="Email" value={form.customerEmail} onChange={(v) => setForm({ ...form, customerEmail: v })} type="email" />
            <Input label="Username Instagram" value={form.usernameInstagram} onChange={(v) => setForm({ ...form, usernameInstagram: v })} />
            <div>
              <label className="label">Rating</label>
              <div className="flex gap-1 mt-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} type="button" onClick={() => setForm({ ...form, rating: n })}>
                    <Star className={`w-7 h-7 ${n <= form.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
                  </button>
                ))}
              </div>
            </div>
            <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} className="input-field">
              {SURSE.filter((s) => s.value).map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="input-field">
              <option value="bozza">Boză</option>
              <option value="approvata">Aprobată</option>
              <option value="nascosta">Ascunsă</option>
            </select>
            <div>
              <label className="label">Serviciu</label>
              <select value={form.serviceId} onChange={(e) => {
                const s = servicii.find((s: any) => s._id === e.target.value);
                setForm({ ...form, serviceId: e.target.value, serviceName: s?.nume || s?.nome || '' });
              }} className="input-field">
                <option value="">Fără serviciu</option>
                {servicii.map((s: any) => <option key={s._id} value={s._id}>{s.nume || s.nome}</option>)}
              </select>
            </div>
            <Input label="Data Recenziei" type="date" value={form.reviewDate} onChange={(v) => setForm({ ...form, reviewDate: v })} />
          </div>

          <div>
            <label className="label">Comentariu</label>
            <textarea
              value={form.comment}
              onChange={(e) => setForm({ ...form, comment: e.target.value })}
              className="input-field w-full"
              rows={3}
              required
            />
          </div>

          <div>
            <Input label="Avatar URL" value={form.avatar} onChange={(v) => setForm({ ...form, avatar: v })} placeholder="URL imagine profil..." />
          </div>

          <div>
            <label className="label">Screenshot-uri / Imagini</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {form.images.map((url, i) => (
                <div key={i} className="relative group">
                  <img src={url} alt="" className="w-20 h-20 object-cover rounded-lg border" />
                  <button
                    onClick={() => handleRemoveImage(i)}
                    className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <ImageUploader
              value=""
              onChange={(url: string) => url && handleAddImage(url)}
              folder="recenzii"
            />
          </div>

          <div className="flex flex-wrap gap-4 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.verified}
                onChange={(e) => setForm({ ...form, verified: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-sm">Recenzie verificată</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-sm">În evidență</span>
            </label>
          </div>

          {/* Live Preview */}
          {form.customerName && form.comment && (
            <div className="border-t pt-4">
              <label className="label mb-2">Previzualizare</label>
              <div className="bg-gray-50 rounded-xl p-4 border">
                <div className="flex items-center gap-2 mb-2">
                  {form.avatar && <img src={form.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />}
                  <div>
                    <p className="font-semibold text-sm">{form.customerName}</p>
                    {form.usernameInstagram && <p className="text-xs text-gray-400">@{form.usernameInstagram}</p>}
                  </div>
                </div>
                <div className="flex gap-0.5 mb-2">
                  {Array.from({ length: form.rating }, (_, i) => <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />)}
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">&ldquo;{form.comment}&rdquo;</p>
                {form.serviceName && <p className="text-xs text-gray-400 mt-1">{form.serviceName}</p>}
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                  <span>{form.source}</span>
                  {form.verified && <span className="flex items-center gap-0.5 text-blue-500"><CheckCircle className="w-3 h-3" /> Verificată</span>}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <Bottone onClick={() => setModalAdauga(false)} variante="secondary">Anulare</Bottone>
          <Bottone onClick={handleSalva} disabled={salvando}>
            {salvando ? 'Salvare...' : editId ? 'Actualizează' : 'Creează Recenzie'}
          </Bottone>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <Modal isOpen={!!modalDeleteId} onClose={() => setModalDeleteId(null)} title="Șterge Recenzia" size="sm">
        <p className="text-gray-700 mb-6">Ești sigur că vrei să ștergi această recenzie? Acțiunea este ireversibilă.</p>
        <div className="flex justify-end gap-3">
          <Bottone onClick={() => setModalDeleteId(null)} variante="secondary">Anulare</Bottone>
          <Bottone onClick={handleDelete} variante="danger">Șterge</Bottone>
        </div>
      </Modal>
    </div>
  );
}
