import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Send, CheckCheck, XCircle, MapPin, Trash2 } from 'lucide-react';
import { tripApi, vehicleApi, driverApi, apiErrorMessage } from '../services/api';
import { PageHeader, Spinner, EmptyState, ErrorNote } from '../components/UI.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import Modal from '../components/Modal.jsx';
import Toast, { useToast } from '../components/Toast.jsx';
import { validateForm, isRequired, isPositiveNumber, isNonNegativeNumber, formatCurrency } from '../utils/validators';

const STATUS_OPTIONS = ['Draft', 'Dispatched', 'Completed', 'Cancelled'];

const EMPTY_FORM = {
  source: '', destination: '', vehicleId: '', driverId: '',
  cargoWeight: '', plannedDistance: '', freightRevenue: '',
};

export default function Trips() {
  const { toast, showToast } = useToast();

  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const [completeTarget, setCompleteTarget] = useState(null);
  const [completeForm, setCompleteForm] = useState({ finalOdometer: '', fuelConsumed: '' });
  const [completeError, setCompleteError] = useState('');
  const [completing, setCompleting] = useState(false);

  const [actioningId, setActioningId] = useState(null);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const [t, v, d] = await Promise.all([tripApi.getAll(), vehicleApi.getAll(), driverApi.getAll()]);
      setTrips(t.data);
      setVehicles(v.data);
      setDrivers(d.data);
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not load trips.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const vehicleById = useMemo(() => Object.fromEntries(vehicles.map((v) => [v.id, v])), [vehicles]);
  const driverById = useMemo(() => Object.fromEntries(drivers.map((d) => [d.id, d])), [drivers]);

  const filtered = useMemo(() => {
    return trips.filter((t) => {
      const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
      const q = search.trim().toLowerCase();
      const matchesSearch = !q || t.source?.toLowerCase().includes(q) || t.destination?.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [trips, search, statusFilter]);

  function openCreate() {
    setForm(EMPTY_FORM);
    setFormErrors({});
    setFormError('');
    setCreateOpen(true);
  }

  async function handleCreate(e) {
    e.preventDefault();
    const rules = {
      source: [[isRequired, 'Origin is required']],
      destination: [[isRequired, 'Destination is required']],
      vehicleId: [[isRequired, 'Select a vehicle']],
      driverId: [[isRequired, 'Select a driver']],
      cargoWeight: [[isPositiveNumber, 'Enter a valid cargo weight']],
      plannedDistance: [[isPositiveNumber, 'Enter a valid distance']],
      freightRevenue: [[(v) => v === '' || isNonNegativeNumber(v), 'Enter a valid amount']],
    };
    const nextErrors = validateForm(form, rules);
    setFormErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    setFormError('');
    try {
      await tripApi.create({
        ...form,
        cargoWeight: Number(form.cargoWeight),
        plannedDistance: Number(form.plannedDistance),
        freightRevenue: Number(form.freightRevenue) || 0,
      });
      showToast('Trip created as Draft');
      setCreateOpen(false);
      load();
    } catch (err) {
      setFormError(apiErrorMessage(err, 'Could not create trip.'));
    } finally {
      setSaving(false);
    }
  }

  async function handleDispatch(trip) {
    setActioningId(trip.id);
    try {
      await tripApi.dispatch(trip.id);
      showToast(`Trip ${trip.source} → ${trip.destination} dispatched`);
      load();
    } catch (err) {
      showToast(apiErrorMessage(err, 'Could not dispatch trip.'), 'error');
    } finally {
      setActioningId(null);
    }
  }

  async function handleCancel(trip) {
    setActioningId(trip.id);
    try {
      await tripApi.cancel(trip.id);
      showToast('Trip cancelled');
      load();
    } catch (err) {
      showToast(apiErrorMessage(err, 'Could not cancel trip.'), 'error');
    } finally {
      setActioningId(null);
    }
  }

  async function handleDelete(trip) {
    setActioningId(trip.id);
    try {
      await tripApi.remove(trip.id);
      showToast('Draft trip deleted');
      load();
    } catch (err) {
      showToast(apiErrorMessage(err, 'Could not delete trip.'), 'error');
    } finally {
      setActioningId(null);
    }
  }

  function openComplete(trip) {
    setCompleteTarget(trip);
    setCompleteForm({ finalOdometer: vehicleById[trip.vehicleId]?.odometer || '', fuelConsumed: '' });
    setCompleteError('');
  }

  async function handleComplete(e) {
    e.preventDefault();
    if (!isNonNegativeNumber(completeForm.finalOdometer) || !isNonNegativeNumber(completeForm.fuelConsumed)) {
      setCompleteError('Enter valid, non-negative numbers for both fields.');
      return;
    }
    setCompleting(true);
    setCompleteError('');
    try {
      await tripApi.complete(completeTarget.id, {
        finalOdometer: Number(completeForm.finalOdometer),
        fuelConsumed: Number(completeForm.fuelConsumed),
      });
      showToast('Trip marked complete');
      setCompleteTarget(null);
      load();
    } catch (err) {
      setCompleteError(apiErrorMessage(err, 'Could not complete trip.'));
    } finally {
      setCompleting(false);
    }
  }

  const availableVehicles = vehicles.filter((v) => v.status === 'Available');
  const availableDrivers = drivers.filter((d) => d.status === 'Available');

  return (
    <div>
      <PageHeader
        title="Trips"
        subtitle={`${trips.length} trips · Draft → Dispatched → Completed / Cancelled`}
        action={
          <button className="btn-accent" onClick={openCreate}>
            <Plus size={16} /> New trip
          </button>
        }
      />
      <ErrorNote message={error} />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" />
          <input className="field-input pl-9" placeholder="Search source or destination…" value={search} onChange={(e) => setSearch(e.target.value)} />
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
        <EmptyState title="No trips match" subtitle="Try a different search term or status filter." />
      ) : (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {filtered.map((t) => (
            <div key={t.id} className="card p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 font-medium text-ink-900">
                  <MapPin size={15} className="text-amber-600" />
                  {t.source} <span className="text-ink-500">→</span> {t.destination}
                </div>
                <StatusBadge status={t.status} />
              </div>
              <div className="route-rule my-3 text-paper-200" />
              <div className="grid grid-cols-2 gap-y-1.5 text-xs text-ink-700">
                <span className="text-ink-500">Vehicle</span>
                <span className="font-mono">{vehicleById[t.vehicleId]?.registrationNumber || t.vehicleId}</span>
                <span className="text-ink-500">Driver</span>
                <span>{driverById[t.driverId]?.name || t.driverId}</span>
                <span className="text-ink-500">Cargo</span>
                <span className="font-mono">{t.cargoWeight?.toLocaleString('en-IN')} kg</span>
                <span className="text-ink-500">Distance</span>
                <span className="font-mono">{t.plannedDistance} km</span>
                {t.freightRevenue > 0 && (
                  <>
                    <span className="text-ink-500">Revenue</span>
                    <span className="font-mono">{formatCurrency(t.freightRevenue)}</span>
                  </>
                )}
                {t.status === 'Completed' && (
                  <>
                    <span className="text-ink-500">Fuel used</span>
                    <span className="font-mono">{t.fuelConsumed} L</span>
                  </>
                )}
              </div>

              {(t.status === 'Draft' || t.status === 'Dispatched') && (
                <div className="mt-4 flex gap-2 border-t border-paper-200 pt-3">
                  {t.status === 'Draft' && (
                    <>
                      <button onClick={() => handleDispatch(t)} disabled={actioningId === t.id} className="btn-primary !py-1.5 text-xs">
                        <Send size={13} /> Dispatch
                      </button>
                      <button onClick={() => handleDelete(t)} disabled={actioningId === t.id} className="btn-danger !py-1.5 text-xs">
                        <Trash2 size={13} /> Delete
                      </button>
                    </>
                  )}
                  {t.status === 'Dispatched' && (
                    <>
                      <button onClick={() => openComplete(t)} className="btn-primary !py-1.5 text-xs">
                        <CheckCheck size={13} /> Complete
                      </button>
                      <button onClick={() => handleCancel(t)} disabled={actioningId === t.id} className="btn-danger !py-1.5 text-xs">
                        <XCircle size={13} /> Cancel
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create trip" width="max-w-xl">
        <form onSubmit={handleCreate} className="space-y-4" noValidate>
          <ErrorNote message={formError} />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="field-label">Origin</label>
              <input className="field-input" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} placeholder="Ahmedabad" />
              {formErrors.source && <p className="mt-1 text-xs font-medium text-signal-rust">{formErrors.source}</p>}
            </div>
            <div>
              <label className="field-label">Destination</label>
              <input className="field-input" value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} placeholder="Surat" />
              {formErrors.destination && <p className="mt-1 text-xs font-medium text-signal-rust">{formErrors.destination}</p>}
            </div>
            <div>
              <label className="field-label">Vehicle</label>
              <select className="field-input" value={form.vehicleId} onChange={(e) => setForm({ ...form, vehicleId: e.target.value })}>
                <option value="">Select vehicle…</option>
                {availableVehicles.map((v) => (
                  <option key={v.id} value={v.id}>{v.name} · {v.registrationNumber}</option>
                ))}
              </select>
              {formErrors.vehicleId && <p className="mt-1 text-xs font-medium text-signal-rust">{formErrors.vehicleId}</p>}
              {availableVehicles.length === 0 && <p className="mt-1 text-xs text-ink-500">No vehicles currently available.</p>}
            </div>
            <div>
              <label className="field-label">Driver</label>
              <select className="field-input" value={form.driverId} onChange={(e) => setForm({ ...form, driverId: e.target.value })}>
                <option value="">Select driver…</option>
                {availableDrivers.map((d) => (
                  <option key={d.id} value={d.id}>{d.name} · {d.licenseCategory}</option>
                ))}
              </select>
              {formErrors.driverId && <p className="mt-1 text-xs font-medium text-signal-rust">{formErrors.driverId}</p>}
              {availableDrivers.length === 0 && <p className="mt-1 text-xs text-ink-500">No drivers currently available.</p>}
            </div>
            <div>
              <label className="field-label">Cargo weight (kg)</label>
              <input type="number" className="field-input" value={form.cargoWeight} onChange={(e) => setForm({ ...form, cargoWeight: e.target.value })} />
              {formErrors.cargoWeight && <p className="mt-1 text-xs font-medium text-signal-rust">{formErrors.cargoWeight}</p>}
            </div>
            <div>
              <label className="field-label">Planned distance (km)</label>
              <input type="number" className="field-input" value={form.plannedDistance} onChange={(e) => setForm({ ...form, plannedDistance: e.target.value })} />
              {formErrors.plannedDistance && <p className="mt-1 text-xs font-medium text-signal-rust">{formErrors.plannedDistance}</p>}
            </div>
            <div className="col-span-2">
              <label className="field-label">Freight revenue (₹, optional)</label>
              <input type="number" className="field-input" value={form.freightRevenue} onChange={(e) => setForm({ ...form, freightRevenue: e.target.value })} placeholder="Amount billed to customer" />
              {formErrors.freightRevenue && <p className="mt-1 text-xs font-medium text-signal-rust">{formErrors.freightRevenue}</p>}
            </div>
          </div>
          <div className="flex justify-end gap-2 border-t border-paper-200 pt-4">
            <button type="button" className="btn-ghost" onClick={() => setCreateOpen(false)}>Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Creating…' : 'Create trip'}</button>
          </div>
        </form>
      </Modal>

      <Modal open={!!completeTarget} onClose={() => setCompleteTarget(null)} title="Complete trip" width="max-w-sm">
        <form onSubmit={handleComplete} className="space-y-4" noValidate>
          <ErrorNote message={completeError} />
          <p className="text-sm text-ink-700">
            {completeTarget?.source} → {completeTarget?.destination}
          </p>
          <div>
            <label className="field-label">Final odometer (km)</label>
            <input type="number" className="field-input" value={completeForm.finalOdometer} onChange={(e) => setCompleteForm({ ...completeForm, finalOdometer: e.target.value })} />
          </div>
          <div>
            <label className="field-label">Fuel consumed (L)</label>
            <input type="number" className="field-input" value={completeForm.fuelConsumed} onChange={(e) => setCompleteForm({ ...completeForm, fuelConsumed: e.target.value })} />
          </div>
          <div className="flex justify-end gap-2 border-t border-paper-200 pt-4">
            <button type="button" className="btn-ghost" onClick={() => setCompleteTarget(null)}>Cancel</button>
            <button type="submit" disabled={completing} className="btn-primary">{completing ? 'Saving…' : 'Mark complete'}</button>
          </div>
        </form>
      </Modal>

      <Toast toast={toast} />
    </div>
  );
}
