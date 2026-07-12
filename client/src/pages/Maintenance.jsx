import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Wrench, CheckCircle2 } from 'lucide-react';
import { maintenanceApi, vehicleApi, apiErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext.jsx';
import { PageHeader, Spinner, EmptyState, ErrorNote } from '../components/UI.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import Modal from '../components/Modal.jsx';
import Toast, { useToast } from '../components/Toast.jsx';
import { validateForm, isRequired, isPositiveNumber, formatCurrency, formatDate } from '../utils/validators';

const EMPTY_FORM = { vehicleId: '', type: '', date: '', cost: '' };

export default function Maintenance() {
  const { user } = useAuth();
  const canManage = user?.role === 'FleetManager';
  const { toast, showToast } = useToast();

  const [records, setRecords] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [closingId, setClosingId] = useState(null);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const [m, v] = await Promise.all([maintenanceApi.getAll(), vehicleApi.getAll()]);
      setRecords(m.data);
      setVehicles(v.data);
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not load maintenance records.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const vehicleById = useMemo(() => Object.fromEntries(vehicles.map((v) => [v.id, v])), [vehicles]);

  const filtered = useMemo(() => {
    if (statusFilter === 'All') return records;
    return records.filter((r) => r.status === statusFilter);
  }, [records, statusFilter]);

  function openCreate() {
    setForm(EMPTY_FORM);
    setFormErrors({});
    setFormError('');
    setCreateOpen(true);
  }

  async function handleCreate(e) {
    e.preventDefault();
    const rules = {
      vehicleId: [[isRequired, 'Select a vehicle']],
      type: [[isRequired, 'Describe the service type']],
      date: [[isRequired, 'Date is required']],
      cost: [[isPositiveNumber, 'Enter a valid cost']],
    };
    const nextErrors = validateForm(form, rules);
    setFormErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    setFormError('');
    try {
      await maintenanceApi.create({ ...form, cost: Number(form.cost) });
      showToast('Maintenance logged — vehicle moved to In Shop');
      setCreateOpen(false);
      load();
    } catch (err) {
      setFormError(apiErrorMessage(err, 'Could not log maintenance.'));
    } finally {
      setSaving(false);
    }
  }

  async function handleClose(record) {
    setClosingId(record.id);
    try {
      await maintenanceApi.close(record.id);
      showToast('Maintenance closed — vehicle back to Available');
      load();
    } catch (err) {
      showToast(apiErrorMessage(err, 'Could not close maintenance record.'), 'error');
    } finally {
      setClosingId(null);
    }
  }

  return (
    <div>
      <PageHeader
        title="Maintenance"
        subtitle={`${records.length} records · logging active work switches a vehicle to In Shop`}
        action={
          canManage && (
            <button className="btn-accent" onClick={openCreate}>
              <Plus size={16} /> Log maintenance
            </button>
          )
        }
      />
      <ErrorNote message={error} />

      <div className="mb-4 flex flex-wrap gap-1.5">
        {['All', 'Active', 'Closed'].map((s) => (
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

      {loading ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <EmptyState title="No maintenance records" subtitle="Logged service work will show up here." />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-paper-200 text-xs uppercase tracking-wide text-ink-500">
                <th className="px-4 py-3 font-semibold">Vehicle</th>
                <th className="px-4 py-3 font-semibold">Service type</th>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Cost</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                {canManage && <th className="px-4 py-3 font-semibold text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-paper-100 last:border-0 hover:bg-paper-50/60">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-paper-100 text-ink-700">
                        <Wrench size={14} />
                      </div>
                      <div>
                        <p className="font-medium text-ink-900">{vehicleById[r.vehicleId]?.name || r.vehicleId}</p>
                        <p className="font-mono text-[11px] text-ink-500">{vehicleById[r.vehicleId]?.registrationNumber}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-ink-700">{r.type}</td>
                  <td className="px-4 py-3 font-mono text-xs text-ink-700">{formatDate(r.date)}</td>
                  <td className="px-4 py-3 font-mono text-xs text-ink-700">{formatCurrency(r.cost)}</td>
                  <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                  {canManage && (
                    <td className="px-4 py-3 text-right">
                      {r.status === 'Active' && (
                        <button
                          onClick={() => handleClose(r)}
                          disabled={closingId === r.id}
                          className="btn-ghost !py-1.5 text-xs"
                        >
                          <CheckCircle2 size={13} /> Close
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Log maintenance">
        <form onSubmit={handleCreate} className="space-y-4" noValidate>
          <ErrorNote message={formError} />
          <div>
            <label className="field-label">Vehicle</label>
            <select className="field-input" value={form.vehicleId} onChange={(e) => setForm({ ...form, vehicleId: e.target.value })}>
              <option value="">Select vehicle…</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>{v.name} · {v.registrationNumber}</option>
              ))}
            </select>
            {formErrors.vehicleId && <p className="mt-1 text-xs font-medium text-signal-rust">{formErrors.vehicleId}</p>}
          </div>
          <div>
            <label className="field-label">Service type</label>
            <input className="field-input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} placeholder="Engine Service, Brake Replacement…" />
            {formErrors.type && <p className="mt-1 text-xs font-medium text-signal-rust">{formErrors.type}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="field-label">Date</label>
              <input type="date" className="field-input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              {formErrors.date && <p className="mt-1 text-xs font-medium text-signal-rust">{formErrors.date}</p>}
            </div>
            <div>
              <label className="field-label">Cost (₹)</label>
              <input type="number" className="field-input" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} />
              {formErrors.cost && <p className="mt-1 text-xs font-medium text-signal-rust">{formErrors.cost}</p>}
            </div>
          </div>
          <div className="flex justify-end gap-2 border-t border-paper-200 pt-4">
            <button type="button" className="btn-ghost" onClick={() => setCreateOpen(false)}>Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Logging…' : 'Log maintenance'}</button>
          </div>
        </form>
      </Modal>

      <Toast toast={toast} />
    </div>
  );
}
