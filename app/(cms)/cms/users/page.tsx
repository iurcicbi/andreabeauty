'use client';

import { useState, useEffect } from 'react';
import webservice from '@/utils/webservice';
import Card from '@/componenti/interfaccia/Card';
import Bottone from '@/componenti/interfaccia/Bottone';
import Input from '@/componenti/interfaccia/Input';
import Messaggio from '@/componenti/comuni/Messaggio';
import Caricamento from '@/componenti/comuni/Caricamento';
import { Pencil, Trash2, X, CheckCircle, XCircle, Search } from 'lucide-react';

interface User {
  _id: string;
  nome: string;
  cognome: string;
  email: string;
  telefono: string;
  ruolo: 'utente' | 'specialist' | 'admin' | 'barber';
  attivo: boolean;
}

const ruoloColori: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-800',
  specialist: 'bg-blue-100 text-blue-800',
  barber: 'bg-green-100 text-green-800',
  utente: 'bg-gray-100 text-gray-800',
};

const ruoloLabel: Record<string, string> = {
  admin: 'Admin',
  specialist: 'Specialist',
  utente: 'Utilizator',
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [caricamento, setCaricamento] = useState(true);
  const [errore, setErrore] = useState('');
  const [successo, setSuccesso] = useState('');
  const [filtroRuolo, setFiltroRuolo] = useState('');

  const [editUser, setEditUser] = useState<User | null>(null);
  const [editNome, setEditNome] = useState('');
  const [editCognome, setEditCognome] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editTelefono, setEditTelefono] = useState('');
  const [editRuolo, setEditRuolo] = useState('');
  const [editAttivo, setEditAttivo] = useState(true);
  const [editPassword, setEditPassword] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const incarcaUsers = async () => {
    try {
      setCaricamento(true);
      const params = filtroRuolo ? `?ruolo=${filtroRuolo}` : '';
      const res = await webservice.get(`/api/users/manage${params}`);
      setUsers(res.dati);
    } catch (err) {
      setErrore('Eroare la încărcarea utilizatorilor');
    } finally {
      setCaricamento(false);
    }
  };

  useEffect(() => {
    incarcaUsers();
  }, [filtroRuolo]);

  const openEdit = (user: User) => {
    setEditUser(user);
    setEditNome(user.nome);
    setEditCognome(user.cognome);
    setEditEmail(user.email);
    setEditTelefono(user.telefono || '');
    setEditRuolo(user.ruolo);
    setEditAttivo(user.attivo);
    setEditPassword('');
  };

  const closeEdit = () => {
    setEditUser(null);
    setEditPassword('');
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setSalvando(true);
      await webservice.delete(`/api/users/manage/${deleteId}`);
      setSuccesso('Utilizator dezactivat cu succes!');
      setDeleteId(null);
      incarcaUsers();
    } catch (err: any) {
      setErrore(err.response?.data?.errore || 'Erroare la ștergere');
    } finally {
      setSalvando(false);
    }
  };

  const handleSave = async () => {
    if (!editUser) return;
    try {
      setSalvando(true);
      setErrore('');
      const data: any = {
        nome: editNome,
        cognome: editCognome,
        email: editEmail,
        telefono: editTelefono,
        ruolo: editRuolo,
        attivo: editAttivo,
      };
      if (editPassword) data.password = editPassword;

      await webservice.put(`/api/users/manage/${editUser._id}`, data);
      setSuccesso('Utilizator actualizat cu succes!');
      closeEdit();
      incarcaUsers();
    } catch (err: any) {
      setErrore(err.response?.data?.errore || 'Erroare la salvare');
    } finally {
      setSalvando(false);
    }
  };

  const stats = {
    total: users.length,
    admin: users.filter(u => u.ruolo === 'admin').length,
    specialist: users.filter(u => u.ruolo === 'specialist' || u.ruolo === 'barber').length,
    utente: users.filter(u => u.ruolo === 'utente').length,
    attivi: users.filter(u => u.attivo).length,
  };

  if (caricamento) return <Caricamento />;

  return (
    <div className="container mx-auto px-3 md:px-4 pb-24 md:pb-0 py-4 md:py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-2xl md:text-4xl font-bold">Utilizatori</h1>
      </div>

      {errore && <Messaggio tipo="errore" messaggio={errore} onChiudi={() => setErrore('')} />}
      {successo && <Messaggio tipo="successo" messaggio={successo} onChiudi={() => setSuccesso('')} />}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <p className="text-sm text-purple-600">Admin</p>
          <p className="text-2xl font-bold text-purple-800">{stats.admin}</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-600">Specialiști</p>
          <p className="text-2xl font-bold text-blue-800">{stats.specialist}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">Utilizatori</p>
          <p className="text-2xl font-bold text-gray-800">{stats.utente}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <p className="text-sm text-green-600">Activi</p>
          <p className="text-2xl font-bold text-green-800">{stats.attivi}</p>
        </div>
      </div>

      {/* Filter */}
      <Card className="mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <Search className="w-5 h-5 text-gray-400" />
          <select
            value={filtroRuolo}
            onChange={(e) => setFiltroRuolo(e.target.value)}
            className="input-field w-auto"
          >
            <option value="">Toate rolurile</option>
            <option value="admin">Admin</option>
            <option value="specialist">Specialist</option>
          <option value="utente">Utilizator</option>
          </select>
        </div>
      </Card>

      {/* Users Table */}
      <Card>
        {users.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Niciun utilizator găsit</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Nume</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Email</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Telefon</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Rol</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">Status</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-600">Acțiuni</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <p className="font-medium">{user.nome} {user.cognome}</p>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{user.email}</td>
                    <td className="py-3 px-4 text-gray-600">{user.telefono}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${ruoloColori[user.ruolo] || 'bg-gray-100 text-gray-800'}`}>
                        {ruoloLabel[user.ruolo] || user.ruolo}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {user.attivo ? (
                        <span className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="w-4 h-4" /> Activ
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-red-600">
                          <XCircle className="w-4 h-4" /> Inactiv
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Bottone
                          variante="secondary"
                          dimensione="small"
                          onClick={() => openEdit(user)}
                          title="Editează"
                        >
                          <Pencil className="w-4 h-4" />
                        </Bottone>
                        <Bottone
                          variante="danger"
                          dimensione="small"
                          onClick={() => setDeleteId(user._id)}
                          title="Dezactivează"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Bottone>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-sm">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-2">Confirmă ștergerea</h2>
              <p className="text-gray-600 mb-6">
                Ești sigur că vrei să dezactivezi acest utilizator? Acesta nu va mai putea accesa platforma.
              </p>
              <div className="flex gap-3">
                <Bottone variante="secondary" onClick={() => setDeleteId(null)} className="flex-1">
                  Anulează
                </Bottone>
                <Bottone variante="danger" onClick={handleDelete} disabled={salvando} className="flex-1">
                  {salvando ? 'Se șterge...' : 'Șterge'}
                </Bottone>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold">Editează Utilizator</h2>
              <button onClick={closeEdit} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input label="Nume" value={editNome} onChange={setEditNome} />
                <Input label="Prenume" value={editCognome} onChange={setEditCognome} />
              </div>
              <Input label="Email" type="email" value={editEmail} onChange={setEditEmail} />
              <Input label="Telefon" type="tel" value={editTelefono} onChange={setEditTelefono} />

              <div className="mb-4">
                <label className="label">Rol</label>
                <select
                  value={editRuolo}
                  onChange={(e) => setEditRuolo(e.target.value)}
                  className="input-field"
                >
                  <option value="utente">Utilizator</option>
                  <option value="specialist">Specialist</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="label">Status</label>
                <div className="flex gap-4 mt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="attivo"
                      checked={editAttivo}
                      onChange={() => setEditAttivo(true)}
                      className="w-4 h-4"
                    />
                    <span className="text-green-600 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" /> Activ
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="attivo"
                      checked={!editAttivo}
                      onChange={() => setEditAttivo(false)}
                      className="w-4 h-4"
                    />
                    <span className="text-red-600 flex items-center gap-1">
                      <XCircle className="w-4 h-4" /> Inactiv
                    </span>
                  </label>
                </div>
              </div>

              <Input
                label="Parolă nouă (lasă gol pentru a păstra cea actuală)"
                type="password"
                value={editPassword}
                onChange={setEditPassword}
                placeholder="Parolă nouă"
              />

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <Bottone variante="secondary" onClick={closeEdit} className="flex-1">
                  Anulează
                </Bottone>
                <Bottone onClick={handleSave} disabled={salvando} className="flex-1">
                  {salvando ? 'Salvare...' : 'Salvează'}
                </Bottone>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
