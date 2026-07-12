import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Fuel, Receipt, Calculator } from 'lucide-react';
import { fuelExpenseApi, vehicleApi, apiErrorMessage } from '../services/api';
import { PageHeader, Spinner, EmptyState, ErrorNote } from '../components/UI.jsx';
import Modal from '../components/Modal.jsx';
import Toast, { useToast } from '../components/Toast.jsx';
import { validateForm, isRequired, isPositiveNumber, formatCurrency, formatDate } from '../utils/validators';

const EXPENSE_TYPES = ['Toll', 'Parking', 'Food', 'Permit', 'Fine', 'Other'];

const EMPTY_FUEL = { vehicleId: '', liters: '', cost: '', date: '' };
const EMPTY_EXPENSE = { vehicleId: '', type: 'Toll', amount: '', date: '' };

export default function FuelExpenses() {
  const { toast, showToast } = useToast();

  const [tab, setTab] = useState('fuel');
  const [fuelLogs, setFuelLogs] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [fuelModalOpen, setFuelModalOpen] = useState(false);
  const [fuelForm, setFuelForm] = useState(EMPTY_FUEL);
  const [fuelErrors, setFuelErrors] = useState({});
  const [fuelError, setFuelError] = useState('');
  const [savingFuel, setSavingFuel] = useState(false);

  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [expenseForm, setExpenseForm] = useState(EMPTY_EXPENSE);
  const [expenseErrors, setExpenseErrors] = useState({});
  const [expenseError, setExpenseError] = useState('');
  const [savingExpense, setSavingExpense] = useState(false);

  const [costVehicleId, setCostVehicleId] = useState('');
  const [costResult, setCostResult] = useState(null);
  const [costLoading, setCostLoading] = useState(false);
  const [costError, setCostError] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const [f, e, v] = await Promise.all([
        fuelExpenseApi.getFuelLogs(),
        fuelExpenseApi.getExpenses(),
        vehicleApi.getAll(),
      ]);
      setFuelLogs(f.data);
      setExpenses(e.data);
      setVehicles(v.data);
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not load fuel and expense data.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const vehicleById = useMemo(() => Object.fromEntries(vehicles.map((v) => [v.id, v])), [vehicles]);

  async function handleFuelSubmit(e) {
    e.preventDefault();
    const rules = {
      vehicleId: [[isRequired, 'Select a vehicle']],
      liters: [[isPositiveNumber, 'Enter valid liters']],
      cost: [[isPositiveNumber, 'Enter a valid cost']],
      date: [[isRequired, 'Date is required']],
    };
    const nextErrors = validateForm(fuelForm, rules);
    setFuelErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSavingFuel(true);
    setFuelError('');
    try {
      await fuelExpenseApi.createFuelLog({ ...fuelForm, liters: Number(fuelForm.liters), cost: Number(fuelForm.cost) });
      showToast('Fuel log recorded');
      setFuelModalOpen(false);
      setFuelForm(EMPTY_FUEL);
      load();
    } catch (err) {
      setFuelError(apiErrorMessage(err, 'Could not save fuel log.'));
    } finally {
      setSavingFuel(false);
    }
  }

  async function handleExpenseSubmit(e) {
    e.preventDefault();
    const rules = {
      vehicleId: [[isRequired, 'Select a vehicle']],
      amount: [[isPositiveNumber, 'Enter a valid amount']],
      date: [[isRequired, 'Date is required']],
    };
    const nextErrors = validateForm(expenseForm, rules);
    setExpenseErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSavingExpense(true);
    setExpenseError('');
    try {
      await fuelExpenseApi.createExpense({ ...expenseForm, amount: Number(expenseForm.amount) });
      showToast('Expense recorded');
      setExpenseModalOpen(false);
      setExpenseForm(EMPTY_EXPENSE);
      load();
    } catch (err) {
      setExpenseError(apiErrorMessage(err, 'Could not save expense.'));
    } finally {
      setSavingExpense(false);
    }
  }

  async function handleCostLookup(e) {
    e.preventDefault();
    if (!costVehicleId) {
      setCostError('Select a vehicle first.');
      return;
    }
    setCostLoading(true);
    setCostError('');
    setCostResult(null);
    try {
      const { data } = await fuelExpenseApi.getOperationalCost(costVehicleId);
      setCostResult(data);
    } catch (err) {
      setCostError(apiErrorMessage(err, 'Could not calculate operational cost.'));
    } finally {
      setCostLoading(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Fuel & expenses"
        subtitle="Fuel purchases, on-road expenses, and per-vehicle operational cost"
      />
      <ErrorNote message={error} />

      <div className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="card p-4 lg:col-span-1">
          <div className="mb-3 flex items-center gap-2 text-ink-900">
            <Calculator size={16} className="text-amber-600" />
            <h3 className="font-display text-sm font-semibold">Operational cost lookup</h3>
          </div>
          <form onSubmit={handleCostLookup} className="space-y-3">
            <select className="field-input" value={costVehicleId} onChange={(e) => setCostVehicleId(e.target.value)}>
              <option value="">Select vehicle…</option>
              {vehicles.map((v) => <option key={v.id} value={v.id}>{v.name} · {v.registrationNumber}</option>)}
            </select>
            <button type="submit" disabled={costLoading} className="btn-primary w-full">
              {costLoading ? 'Calculating…' : 'Calculate cost'}
            </button>
          </form>
          <ErrorNote message={costError} />
          {costResult && (
            <div className="mt-4 space-y-2 rounded-lg border border-paper-200 bg-paper-50 p-3.5">
              <div className="flex justify-between text-sm">
                <span className="text-ink-500">Fuel cost</span>
                <span className="font-mono font-medium text-ink-900">{formatCurrency(costResult.fuelCost)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-ink-500">Maintenance cost</span>
                <span className="font-mono font-medium text-ink-900">{formatCurrency(costResult.maintenanceCost)}</span>
              </div>
              <div className="route-rule text-paper-200" />
              <div className="flex justify-between text-sm font-semibold">
                <span className="text-ink-900">Total operational cost</span>
                <span className="font-mono text-amber-600">{formatCurrency(costResult.totalOperationalCost)}</span>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          <div className="mb-3 inline-flex rounded-lg border border-paper-200 bg-white p-1">
            <button
              onClick={() => setTab('fuel')}
              className={`flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-sm font-semibold transition-colors ${tab === 'fuel' ? 'bg-navy-900 text-white' : 'text-ink-700 hover:bg-paper-100'}`}
            >
              <Fuel size={14} /> Fuel logs
            </button>
            <button
              onClick={() => setTab('expenses')}
              className={`flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-sm font-semibold transition-colors ${tab === 'expenses' ? 'bg-navy-900 text-white' : 'text-ink-700 hover:bg-paper-100'}`}
            >
              <Receipt size={14} /> Expenses
            </button>
          </div>

          {loading ? (
            <Spinner />
          ) : tab === 'fuel' ? (
            <div className="card overflow-hidden">
              <div className="flex items-center justify-between border-b border-paper-200 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">{fuelLogs.length} fuel logs</p>
                <button className="btn-accent !py-1.5 text-xs" onClick={() => { setFuelForm(EMPTY_FUEL); setFuelErrors({}); setFuelError(''); setFuelModalOpen(true); }}>
                  <Plus size={14} /> Add fuel log
                </button>
              </div>
              {fuelLogs.length === 0 ? (
                <EmptyState title="No fuel logs yet" />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-paper-200 text-xs uppercase tracking-wide text-ink-500">
                        <th className="px-4 py-2.5 font-semibold">Vehicle</th>
                        <th className="px-4 py-2.5 font-semibold">Liters</th>
                        <th className="px-4 py-2.5 font-semibold">Cost</th>
                        <th className="px-4 py-2.5 font-semibold">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...fuelLogs].reverse().map((f) => (
                        <tr key={f.id} className="border-b border-paper-100 last:border-0">
                          <td className="px-4 py-2.5 font-medium text-ink-900">{vehicleById[f.vehicleId]?.name || f.vehicleId}</td>
                          <td className="px-4 py-2.5 font-mono text-xs text-ink-700">{f.liters} L</td>
                          <td className="px-4 py-2.5 font-mono text-xs text-ink-700">{formatCurrency(f.cost)}</td>
                          <td className="px-4 py-2.5 font-mono text-xs text-ink-700">{formatDate(f.date)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <div className="card overflow-hidden">
              <div className="flex items-center justify-between border-b border-paper-200 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">{expenses.length} expenses</p>
                <button className="btn-accent !py-1.5 text-xs" onClick={() => { setExpenseForm(EMPTY_EXPENSE); setExpenseErrors({}); setExpenseError(''); setExpenseModalOpen(true); }}>
                  <Plus size={14} /> Add expense
                </button>
              </div>
              {expenses.length === 0 ? (
                <EmptyState title="No expenses yet" />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-paper-200 text-xs uppercase tracking-wide text-ink-500">
                        <th className="px-4 py-2.5 font-semibold">Vehicle</th>
                        <th className="px-4 py-2.5 font-semibold">Type</th>
                        <th className="px-4 py-2.5 font-semibold">Amount</th>
                        <th className="px-4 py-2.5 font-semibold">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...expenses].reverse().map((ex) => (
                        <tr key={ex.id} className="border-b border-paper-100 last:border-0">
                          <td className="px-4 py-2.5 font-medium text-ink-900">{vehicleById[ex.vehicleId]?.name || ex.vehicleId}</td>
                          <td className="px-4 py-2.5 text-ink-700">{ex.type}</td>
                          <td className="px-4 py-2.5 font-mono text-xs text-ink-700">{formatCurrency(ex.amount)}</td>
                          <td className="px-4 py-2.5 font-mono text-xs text-ink-700">{formatDate(ex.date)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Modal open={fuelModalOpen} onClose={() => setFuelModalOpen(false)} title="Add fuel log">
        <form onSubmit={handleFuelSubmit} className="space-y-4" noValidate>
          <ErrorNote message={fuelError} />
          <div>
            <label className="field-label">Vehicle</label>
            <select className="field-input" value={fuelForm.vehicleId} onChange={(e) => setFuelForm({ ...fuelForm, vehicleId: e.target.value })}>
              <option value="">Select vehicle…</option>
              {vehicles.map((v) => <option key={v.id} value={v.id}>{v.name} · {v.registrationNumber}</option>)}
            </select>
            {fuelErrors.vehicleId && <p className="mt-1 text-xs font-medium text-signal-rust">{fuelErrors.vehicleId}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="field-label">Liters</label>
              <input type="number" className="field-input" value={fuelForm.liters} onChange={(e) => setFuelForm({ ...fuelForm, liters: e.target.value })} />
              {fuelErrors.liters && <p className="mt-1 text-xs font-medium text-signal-rust">{fuelErrors.liters}</p>}
            </div>
            <div>
              <label className="field-label">Cost (₹)</label>
              <input type="number" className="field-input" value={fuelForm.cost} onChange={(e) => setFuelForm({ ...fuelForm, cost: e.target.value })} />
              {fuelErrors.cost && <p className="mt-1 text-xs font-medium text-signal-rust">{fuelErrors.cost}</p>}
            </div>
          </div>
          <div>
            <label className="field-label">Date</label>
            <input type="date" className="field-input" value={fuelForm.date} onChange={(e) => setFuelForm({ ...fuelForm, date: e.target.value })} />
            {fuelErrors.date && <p className="mt-1 text-xs font-medium text-signal-rust">{fuelErrors.date}</p>}
          </div>
          <div className="flex justify-end gap-2 border-t border-paper-200 pt-4">
            <button type="button" className="btn-ghost" onClick={() => setFuelModalOpen(false)}>Cancel</button>
            <button type="submit" disabled={savingFuel} className="btn-primary">{savingFuel ? 'Saving…' : 'Add fuel log'}</button>
          </div>
        </form>
      </Modal>

      <Modal open={expenseModalOpen} onClose={() => setExpenseModalOpen(false)} title="Add expense">
        <form onSubmit={handleExpenseSubmit} className="space-y-4" noValidate>
          <ErrorNote message={expenseError} />
          <div>
            <label className="field-label">Vehicle</label>
            <select className="field-input" value={expenseForm.vehicleId} onChange={(e) => setExpenseForm({ ...expenseForm, vehicleId: e.target.value })}>
              <option value="">Select vehicle…</option>
              {vehicles.map((v) => <option key={v.id} value={v.id}>{v.name} · {v.registrationNumber}</option>)}
            </select>
            {expenseErrors.vehicleId && <p className="mt-1 text-xs font-medium text-signal-rust">{expenseErrors.vehicleId}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="field-label">Type</label>
              <select className="field-input" value={expenseForm.type} onChange={(e) => setExpenseForm({ ...expenseForm, type: e.target.value })}>
                {EXPENSE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="field-label">Amount (₹)</label>
              <input type="number" className="field-input" value={expenseForm.amount} onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })} />
              {expenseErrors.amount && <p className="mt-1 text-xs font-medium text-signal-rust">{expenseErrors.amount}</p>}
            </div>
          </div>
          <div>
            <label className="field-label">Date</label>
            <input type="date" className="field-input" value={expenseForm.date} onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })} />
            {expenseErrors.date && <p className="mt-1 text-xs font-medium text-signal-rust">{expenseErrors.date}</p>}
          </div>
          <div className="flex justify-end gap-2 border-t border-paper-200 pt-4">
            <button type="button" className="btn-ghost" onClick={() => setExpenseModalOpen(false)}>Cancel</button>
            <button type="submit" disabled={savingExpense} className="btn-primary">{savingExpense ? 'Saving…' : 'Add expense'}</button>
          </div>
        </form>
      </Modal>

      <Toast toast={toast} />
    </div>
  );
}
