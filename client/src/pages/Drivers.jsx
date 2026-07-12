import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Pencil, Trash2, ShieldAlert, Contact } from 'lucide-react';
import { driverApi, apiErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext.jsx';
import { PageHeader, Spinner, EmptyState, ErrorNote } from '../components/UI.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import Modal from '../components/Modal.jsx';
import Toast, { useToast } from '../components/Toast.jsx';
import { validateForm, isRequired } from '../utils/validators';
import { formatDate } from '../utils/validators';

const STATUS_OPTIONS = ['Available', 'On Trip', 'Off Duty', 'Suspended'];
const LICENSE_OPTIONS = ['LMV', 'HMV'];

const EMPTY_FORM = {
  name: '', licenseNumber: '', licenseCategory: 'HMV', licenseExpiryDate: '',
  contactNumber: '', safetyScore: '', status: 'Available',
};

function isExpired(dateStr) {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
}

function isExpiringSoon(dateStr) {
  if (!dateStr) return false;
  const days = (new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24);
  return days >= 0 && days <= 60;
}

export default function Drivers() {
  const { user } = useAuth();
  const canManage = user?.role === 'Admin' || user?.role === 'FleetManager';
  const { toast, showToast } = useToast();

  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const { data } = await driverApi.getAll();
      setDrivers(data);
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not load drivers.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    return drivers.filter((d) => {
      const matchesStatus = statusFilter === 'All' || d.status === statusFilter;
      const q = search.trim().toLowerCase();
      const matchesSearch = !q || d.name?.toLowerCase().includes(q) || d.licenseNumber?.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [drivers, search, statusFilter]);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setFormError('');
    setModalOpen(true);
  }

  function openEdit(driver) {
    setEditing(driver);
    setForm({
      name: driver.name,
      licenseNumber: driver.licenseNumber,
      licenseCategory: driver.licenseCategory,
      licenseExpiryDate: driver.licenseExpiryDate?.slice(0, 10) || '',
      contactNumber: driver.contactNumber,
      safetyScore: driver.safetyScore,
      status: driver.status,
    });
    setFormErrors({});
    setFormError('');
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const rules = {
      name: [[isRequired, 'Name is required']],
      licenseNumber: [[isRequired, 'License number is required']],
      licenseExpiryDate: [[isRequired, 'License expiry date is required']],
      contactNumber: [[(v) => /^\d{10}$/.test(v || ''), 'Enter a valid 10-digit phone number']],
      safetyScore: [[(v) => Number(v) >= 0 && Number(v) <= 100, 'Score must be between 0 and 100']],
    };
    const nextErrors = validateForm(form, rules);
    setFormErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const payload = { ...form, safetyScore: Number(form.safetyScore) };
    setSaving(true);
    setFormError('');
    try {
      if (editing) {
        await driverApi.update(editing.id, payload);
        showToast('Driver profile updated');
      } else {
        await driverApi.create(payload);
        showToast('Driver added');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      setFormError(apiErrorMessage(err, 'Could not save driver.'));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await driverApi.remove(deleteTarget.id);
      showToast('Driver removed');
      setDeleteTarget(null);
      load();
    } catch (err) {
      showToast(apiErrorMessage(err, 'Could not delete driver.'), 'error');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Drivers"
        subtitle={`${drivers.length} drivers on record`}
        action={
          canManage && (
            <button className="btn-accent" onClick={openCreate}>
              <Plus size={16} /> Add driver
            </button>
          )
        }
      />
      <ErrorNote message={error} />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" />
          <input className="field-input pl-9" placeholder="Search name or license…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {['All', ...STATUS_OPTIONS].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                statusFilter === s ? 'border-navy-900 bg-navy-900 text-white' : 'border-paper-200 bg-white text-ink-700 hover:border-navy-700'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <EmptyState title="No drivers match" subtitle="Try a different search term or status filter." />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-paper-200 text-xs uppercase tracking-wide text-ink-500">
                <th className="px-4 py-3 font-semibold">Driver</th>
                <th className="px-4 py-3 font-semibold">License</th>
                <th className="px-4 py-3 font-semibold">Expiry</th>
                <th className="px-4 py-3 font-semibold">Contact</th>
                <th className="px-4 py-3 font-semibold">Safety score</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                {canManage && <th className="px-4 py-3 font-semibold text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => {
                const expired = isExpired(d.licenseExpiryDate);
                const soon = !expired && isExpiringSoon(d.licenseExpiryDate);
                return (
                  <tr key={d.id} className="border-b border-paper-100 last:border-0 hover:bg-paper-50/60">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-paper-100 text-ink-700">
                          <Contact size={15} />
                        </div>
                        <span className="font-medium text-ink-900">{d.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="plate">{d.licenseNumber}</span>
                      <span className="ml-2 text-xs text-ink-500">{d.licenseCategory}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {(expired || soon) && <ShieldAlert size={14} className={expired ? 'text-signal-rust' : 'text-amber-600'} />}
                        <span className={`font-mono text-xs ${expired ? 'font-semibold text-signal-rust' : soon ? 'font-semibold text-amber-600' : 'text-ink-700'}`}>
                          {formatDate(d.licenseExpiryDate)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-ink-700">{d.contactNumber}</td>
                    <td className="px-4 py-3">
                      <span className={`font-mono text-sm font-semibold ${d.safetyScore >= 90 ? 'text-signal-teal' : d.safetyScore >= 80 ? 'text-amber-600' : 'text-signal-rust'}`}>
                        {d.safetyScore}
                      </span>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={d.status} /></td>
                    {canManage && (
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => openEdit(d)} className="rounded-md p-1.5 text-ink-500 hover:bg-paper-100 hover:text-navy-900" aria-label="Edit">
                            <Pencil size={15} />
                          </button>
                          <button onClick={() => setDeleteTarget(d)} className="rounded-md p-1.5 text-ink-500 hover:bg-signal-rust/10 hover:text-signal-rust" aria-label="Delete">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit driver' : 'Add driver'}>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <ErrorNote message={formError} />
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="field-label">Full name</label>
              <input className="field-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              {formErrors.name && <p className="mt-1 text-xs font-medium text-signal-rust">{formErrors.name}</p>}
            </div>
            <div>
              <label className="field-label">License number</label>
              <input className="field-input" value={form.licenseNumber} onChange={(e) => setForm({ ...form, licenseNumber: e.target.value.toUpperCase() })} />
              {formErrors.licenseNumber && <p className="mt-1 text-xs font-medium text-signal-rust">{formErrors.licenseNumber}</p>}
            </div>
            <div>
              <label className="field-label">Category</label>
              <select className="field-input" value={form.licenseCategory} onChange={(e) => setForm({ ...form, licenseCategory: e.target.value })}>
                {LICENSE_OPTIONS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="field-label">License expiry</label>
              <input type="date" className="field-input" value={form.licenseExpiryDate} onChange={(e) => setForm({ ...form, licenseExpiryDate: e.target.value })} />
              {formErrors.licenseExpiryDate && <p className="mt-1 text-xs font-medium text-signal-rust">{formErrors.licenseExpiryDate}</p>}
            </div>
            <div>
              <label className="field-label">Contact number</label>
              <input className="field-input" value={form.contactNumber} onChange={(e) => setForm({ ...form, contactNumber: e.target.value })} placeholder="10-digit number" />
              {formErrors.contactNumber && <p className="mt-1 text-xs font-medium text-signal-rust">{formErrors.contactNumber}</p>}
            </div>
            <div>
              <label className="field-label">Safety score (0–100)</label>
              <input type="number" min="0" max="100" className="field-input" value={form.safetyScore} onChange={(e) => setForm({ ...form, safetyScore: e.target.value })} />
              {formErrors.safetyScore && <p className="mt-1 text-xs font-medium text-signal-rust">{formErrors.safetyScore}</p>}
            </div>
            {editing && (
              <div>
                <label className="field-label">Status</label>
                <select className="field-input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2 border-t border-paper-200 pt-4">
            <button type="button" className="btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving…' : editing ? 'Save changes' : 'Add driver'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Remove driver" width="max-w-sm">
        <p className="text-sm text-ink-700">
          Remove <span className="font-semibold text-ink-900">{deleteTarget?.name}</span> from your driver roster? This can't be undone.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button className="btn-ghost" onClick={() => setDeleteTarget(null)}>Cancel</button>
          <button className="btn-danger" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Removing…' : 'Remove driver'}
          </button>
        </div>
      </Modal>

      <Toast toast={toast} />
    </div>
  );
}
