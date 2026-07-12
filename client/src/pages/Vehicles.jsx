import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Pencil, Trash2, Truck } from 'lucide-react';
import { vehicleApi, apiErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext.jsx';
import { PageHeader, Spinner, EmptyState, ErrorNote } from '../components/UI.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import Modal from '../components/Modal.jsx';
import Toast, { useToast } from '../components/Toast.jsx';
import { validateForm, isRequired, isPositiveNumber } from '../utils/validators';

const STATUS_OPTIONS = ['Available', 'On Trip', 'In Shop', 'Retired'];
const TYPE_OPTIONS = ['Truck', 'Mini Truck', 'Van', 'Pickup'];

const EMPTY_FORM = {
  registrationNumber: '', name: '', type: 'Truck', maxLoadCapacity: '',
  odometer: '', acquisitionCost: '', region: '', status: 'Available',
};

export default function Vehicles() {
  const { user } = useAuth();
  const canManage = user?.role === 'FleetManager';
  const { toast, showToast } = useToast();

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const { data } = await vehicleApi.getAll();
      setVehicles(data);
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not load vehicles.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    return vehicles.filter((v) => {
      const matchesStatus = statusFilter === 'All' || v.status === statusFilter;
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        v.name?.toLowerCase().includes(q) ||
        v.registrationNumber?.toLowerCase().includes(q) ||
        v.region?.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [vehicles, search, statusFilter]);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setFormError('');
    setModalOpen(true);
  }

  function openEdit(vehicle) {
    setEditing(vehicle);
    setForm({
      registrationNumber: vehicle.registrationNumber,
      name: vehicle.name,
      type: vehicle.type,
      maxLoadCapacity: vehicle.maxLoadCapacity,
      odometer: vehicle.odometer,
      acquisitionCost: vehicle.acquisitionCost,
      region: vehicle.region,
      status: vehicle.status,
    });
    setFormErrors({});
    setFormError('');
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const rules = {
      registrationNumber: [[isRequired, 'Registration number is required']],
      name: [[isRequired, 'Vehicle name is required']],
      region: [[isRequired, 'Region is required']],
      maxLoadCapacity: [[isPositiveNumber, 'Enter a valid load capacity']],
      odometer: [[(v) => v === '' || Number(v) >= 0, 'Enter a valid odometer reading']],
      acquisitionCost: [[isPositiveNumber, 'Enter a valid acquisition cost']],
    };
    const nextErrors = validateForm(form, rules);
    setFormErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const payload = {
      ...form,
      maxLoadCapacity: Number(form.maxLoadCapacity),
      odometer: Number(form.odometer) || 0,
      acquisitionCost: Number(form.acquisitionCost),
    };

    setSaving(true);
    setFormError('');
    try {
      if (editing) {
        await vehicleApi.update(editing.id, payload);
        showToast('Vehicle updated');
      } else {
        await vehicleApi.create(payload);
        showToast('Vehicle added to fleet');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      setFormError(apiErrorMessage(err, 'Could not save vehicle.'));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await vehicleApi.remove(deleteTarget.id);
      showToast('Vehicle removed');
      setDeleteTarget(null);
      load();
    } catch (err) {
      showToast(apiErrorMessage(err, 'Could not delete vehicle.'), 'error');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Vehicle registry"
        subtitle={`${vehicles.length} vehicles across the fleet`}
        action={
          canManage && (
            <button className="btn-accent" onClick={openCreate}>
              <Plus size={16} /> Add vehicle
            </button>
          )
        }
      />
      <ErrorNote message={error} />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" />
          <input
            className="field-input pl-9"
            placeholder="Search name, plate, region…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {['All', ...STATUS_OPTIONS].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                statusFilter === s
                  ? 'border-navy-900 bg-navy-900 text-white'
                  : 'border-paper-200 bg-white text-ink-700 hover:border-navy-700'
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
        <EmptyState
          title="No vehicles match"
          subtitle="Try a different search term or status filter."
        />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-paper-200 text-xs uppercase tracking-wide text-ink-500">
                <th className="px-4 py-3 font-semibold">Vehicle</th>
                <th className="px-4 py-3 font-semibold">Plate</th>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold">Region</th>
                <th className="px-4 py-3 font-semibold">Load cap.</th>
                <th className="px-4 py-3 font-semibold">Odometer</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                {canManage && <th className="px-4 py-3 font-semibold text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map((v) => (
                <tr key={v.id} className="border-b border-paper-100 last:border-0 hover:bg-paper-50/60">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-paper-100 text-ink-700">
                        <Truck size={15} />
                      </div>
                      <span className="font-medium text-ink-900">{v.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3"><span className="plate">{v.registrationNumber}</span></td>
                  <td className="px-4 py-3 text-ink-700">{v.type}</td>
                  <td className="px-4 py-3 text-ink-700">{v.region}</td>
                  <td className="px-4 py-3 font-mono text-xs text-ink-700">{v.maxLoadCapacity?.toLocaleString('en-IN')} kg</td>
                  <td className="px-4 py-3 font-mono text-xs text-ink-700">{v.odometer?.toLocaleString('en-IN')} km</td>
                  <td className="px-4 py-3"><StatusBadge status={v.status} /></td>
                  {canManage && (
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => openEdit(v)} className="rounded-md p-1.5 text-ink-500 hover:bg-paper-100 hover:text-navy-900" aria-label="Edit">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => setDeleteTarget(v)} className="rounded-md p-1.5 text-ink-500 hover:bg-signal-rust/10 hover:text-signal-rust" aria-label="Delete">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit vehicle' : 'Add vehicle'}>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <ErrorNote message={formError} />
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="field-label">Vehicle name</label>
              <input className="field-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Tata Prima" />
              {formErrors.name && <p className="mt-1 text-xs font-medium text-signal-rust">{formErrors.name}</p>}
            </div>
            <div className="col-span-2">
              <label className="field-label">Registration number</label>
              <input className="field-input" value={form.registrationNumber} onChange={(e) => setForm({ ...form, registrationNumber: e.target.value.toUpperCase() })} placeholder="GJ01AB1001" />
              {formErrors.registrationNumber && <p className="mt-1 text-xs font-medium text-signal-rust">{formErrors.registrationNumber}</p>}
            </div>
            <div>
              <label className="field-label">Type</label>
              <select className="field-input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {TYPE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="field-label">Region</label>
              <input className="field-input" value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} placeholder="Ahmedabad" />
              {formErrors.region && <p className="mt-1 text-xs font-medium text-signal-rust">{formErrors.region}</p>}
            </div>
            <div>
              <label className="field-label">Max load (kg)</label>
              <input type="number" className="field-input" value={form.maxLoadCapacity} onChange={(e) => setForm({ ...form, maxLoadCapacity: e.target.value })} />
              {formErrors.maxLoadCapacity && <p className="mt-1 text-xs font-medium text-signal-rust">{formErrors.maxLoadCapacity}</p>}
            </div>
            <div>
              <label className="field-label">Odometer (km)</label>
              <input type="number" className="field-input" value={form.odometer} onChange={(e) => setForm({ ...form, odometer: e.target.value })} />
              {formErrors.odometer && <p className="mt-1 text-xs font-medium text-signal-rust">{formErrors.odometer}</p>}
            </div>
            <div>
              <label className="field-label">Acquisition cost (₹)</label>
              <input type="number" className="field-input" value={form.acquisitionCost} onChange={(e) => setForm({ ...form, acquisitionCost: e.target.value })} />
              {formErrors.acquisitionCost && <p className="mt-1 text-xs font-medium text-signal-rust">{formErrors.acquisitionCost}</p>}
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
              {saving ? 'Saving…' : editing ? 'Save changes' : 'Add vehicle'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Remove vehicle" width="max-w-sm">
        <p className="text-sm text-ink-700">
          Remove <span className="font-semibold text-ink-900">{deleteTarget?.name}</span> ({deleteTarget?.registrationNumber}) from the fleet? This can't be undone.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button className="btn-ghost" onClick={() => setDeleteTarget(null)}>Cancel</button>
          <button className="btn-danger" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Removing…' : 'Remove vehicle'}
          </button>
        </div>
      </Modal>

      <Toast toast={toast} />
    </div>
  );
}
