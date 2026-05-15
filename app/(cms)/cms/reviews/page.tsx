'use client';

import { useState, useEffect } from 'react';
import webservice from '@/utils/webservice';
import Card from '@/componenti/interfaccia/Card';
import Bottone from '@/componenti/interfaccia/Bottone';
import Messaggio from '@/componenti/comuni/Messaggio';
import Caricamento from '@/componenti/comuni/Caricamento';
import { Star, ThumbsUp, ThumbsDown, Reply, Trash2, MessageSquare } from 'lucide-react';

interface Review {
  _id: string;
  customerName: string;
  customerEmail?: string;
  rating: number;
  comment: string;
  reply?: string;
  replyAt?: string;
  status: string;
  specialistName: string;
  serviceName: string;
  createdAt: string;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [caricamento, setCaricamento] = useState(true);
  const [errore, setErrore] = useState('');
  const [successo, setSuccesso] = useState('');
  const [filtruStatus, setFiltruStatus] = useState<string>('');
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  useEffect(() => {
    loadReviews();
  }, [filtruStatus]);

  const loadReviews = async () => {
    try {
      setCaricamento(true);
      const params = filtruStatus ? `?status=${filtruStatus}` : '';
      const risposta = await webservice.get(`/api/reviews/manage${params}`);
      setReviews(risposta.dati);
    } catch (err) {
      setErrore('Eroare la încărcarea recenziilor');
    } finally {
      setCaricamento(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await webservice.put(`/api/reviews/manage/${id}`, { status: 'approved' });
      setSuccesso('Recenzie aprobată');
      loadReviews();
    } catch (err: any) {
      setErrore(err.response?.data?.errore || 'Eroare');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await webservice.put(`/api/reviews/manage/${id}`, { status: 'rejected' });
      setSuccesso('Recenzie respinsă');
      loadReviews();
    } catch (err: any) {
      setErrore(err.response?.data?.errore || 'Eroare');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Sigur doriți să ștergeți această recenzie?')) return;
    try {
      await webservice.delete(`/api/reviews/manage/${id}`);
      setSuccesso('Recenzie ștearsă');
      loadReviews();
    } catch (err: any) {
      setErrore(err.response?.data?.errore || 'Eroare');
    }
  };

  const handleReply = async (id: string) => {
    if (!replyText[id]?.trim()) return;
    try {
      await webservice.put(`/api/reviews/manage/${id}`, { reply: replyText[id] });
      setSuccesso('Răspuns salvat');
      setReplyText(prev => ({ ...prev, [id]: '' }));
      setReplyingTo(null);
      loadReviews();
    } catch (err: any) {
      setErrore(err.response?.data?.errore || 'Eroare');
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
    ));
  };

  const getBadge = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'Aprobată';
      case 'rejected': return 'Respinsă';
      default: return 'În așteptare';
    }
  };

  if (caricamento) return <Caricamento />;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 md:mb-6">
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
          <MessageSquare className="w-6 h-6 md:w-7 md:h-7" />
          Recenzii
        </h1>
      </div>

      {errore && <Messaggio tipo="errore" messaggio={errore} onChiudi={() => setErrore('')} />}
      {successo && <Messaggio tipo="successo" messaggio={successo} onChiudi={() => setSuccesso('')} />}

      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {['', 'pending', 'approved', 'rejected'].map((s) => (
          <button
            key={s}
            onClick={() => setFiltruStatus(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filtruStatus === s
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {s === '' ? 'Toate' : s === 'pending' ? 'În așteptare' : s === 'approved' ? 'Aprobate' : 'Respinse'}
          </button>
        ))}
      </div>

      {reviews.length === 0 ? (
        <Card>
          <p className="text-center py-8 text-gray-500">Nu există recenzii</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <Card key={review._id} className="p-3 md:p-4">
              <div className="space-y-2 md:space-y-3">
                {/* Header: nume + status + data */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-sm md:text-base truncate">{review.customerName}</h3>
                    <p className="text-xs text-gray-400 truncate">{review.serviceName}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      {renderStars(review.rating)}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getBadge(review.status)}`}>
                      {getStatusText(review.status)}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(review.createdAt).toLocaleDateString('ro-RO')}
                    </span>
                  </div>
                </div>

                {/* Comentariu */}
                <p className="text-sm text-gray-700 leading-relaxed">{review.comment}</p>

                {/* Răspuns */}
                {review.reply && (
                  <div className="ml-2 md:ml-4 pl-3 border-l-2 border-primary-200 bg-primary-50 p-2 md:p-3 rounded text-sm">
                    <p className="text-xs font-semibold text-primary-700 mb-0.5">Răspuns:</p>
                    <p className="text-gray-700">{review.reply}</p>
                  </div>
                )}

                {/* Butoane */}
                <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-1.5 pt-2 border-t">
                  {review.status !== 'approved' && (
                    <Bottone onClick={() => handleApprove(review._id)} dimensione="small" className="text-xs flex items-center justify-center gap-1">
                      <ThumbsUp className="w-3 h-3" /> Aprobă
                    </Bottone>
                  )}
                  {review.status !== 'rejected' && (
                    <Bottone onClick={() => handleReject(review._id)} dimensione="small" variante="secondary" className="text-xs flex items-center justify-center gap-1">
                      <ThumbsDown className="w-3 h-3" /> Respinge
                    </Bottone>
                  )}
                  <Bottone
                    onClick={() => setReplyingTo(replyingTo === review._id ? null : review._id)}
                    dimensione="small"
                    variante="secondary"
                    className="text-xs flex items-center justify-center gap-1"
                  >
                    <Reply className="w-3 h-3" /> Răspunde
                  </Bottone>
                  <Bottone onClick={() => handleDelete(review._id)} dimensione="small" variante="secondary" className="text-xs flex items-center justify-center gap-1 text-red-600">
                    <Trash2 className="w-3 h-3" /> Șterge
                  </Bottone>
                </div>

                {/* Reply form */}
                {replyingTo === review._id && (
                  <div className="space-y-2 pt-1">
                    <textarea
                      value={replyText[review._id] || ''}
                      onChange={(e) => setReplyText(prev => ({ ...prev, [review._id]: e.target.value }))}
                      placeholder="Scrieți răspunsul dvs..."
                      className="input-field w-full text-sm"
                      rows={3}
                    />
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Bottone onClick={() => handleReply(review._id)} dimensione="small" className="w-full sm:w-auto text-sm">
                        Trimite răspunsul
                      </Bottone>
                      <Bottone onClick={() => setReplyingTo(null)} dimensione="small" variante="secondary" className="w-full sm:w-auto text-sm">
                        Anulare
                      </Bottone>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
