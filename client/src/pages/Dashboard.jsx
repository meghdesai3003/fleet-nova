import React, { useEffect, useMemo, useState } from 'react';
import { Truck, Users, Route as RouteIcon, Gauge } from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from 'recharts';
import { vehicleApi, driverApi, tripApi, reportApi, apiErrorMessage } from '../services/api';
import { PageHeader, StatCard, Spinner, ErrorNote, EmptyState } from '../components/UI.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { formatCurrency } from '../utils/validators';

const STATUS_COLORS = {
  Available: '#128A7E',
  'On Trip': '#2874C9',
  'In Shop': '#EFA512',
  Retired: '#6B7686',
};

export default function Dashboard() {
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError('');
      try {
        const [v, d, t, r] = await Promise.all([
          vehicleApi.getAll(),
          driverApi.getAll(),
          tripApi.getAll(),
          reportApi.getReports(),
        ]);
        setVehicles(v.data);
        setDrivers(d.data);
        setTrips(t.data);
        setReport(r.data);
      } catch (err) {
        setError(apiErrorMessage(err, 'Could not load dashboard data.'));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const vehicleStatusData = useMemo(() => {
    const counts = {};
    vehicles.forEach((v) => {
      counts[v.status] = (counts[v.status] || 0) + 1;
    });
    return Object.entries(counts).map(([status, value]) => ({ name: status, value }));
  }, [vehicles]);

  const revenueVsCost = useMemo(() => {
    if (!report) return [];
    return report.vehicles
      .filter((v) => v.revenue > 0 || v.operationalCost > 0)
      .slice(0, 8)
      .map((v) => ({
        name: v.vehicleName?.split(' ').slice(0, 2).join(' '),
        Revenue: v.revenue,
        Cost: v.operationalCost,
      }));
  }, [report]);

  const activeTripsCount = trips.filter((t) => t.status === 'Dispatched').length;
  const availableDrivers = drivers.filter((d) => d.status === 'Available').length;
  const recentTrips = [...trips].slice(-6).reverse();

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader
        title="Fleet overview"
        subtitle="A live snapshot of vehicles, drivers, and trips across every region."
      />
      <ErrorNote message={error} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total vehicles" value={vehicles.length} icon={Truck} accent="navy" />
        <StatCard label="Drivers available" value={availableDrivers} icon={Users} accent="teal" hint={`of ${drivers.length} total`} />
        <StatCard label="Trips in progress" value={activeTripsCount} icon={RouteIcon} accent="sky" />
        <StatCard label="Fleet utilization" value={report?.fleetUtilization ?? '—'} icon={Gauge} accent="amber" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-5">
        <div className="card p-5 xl:col-span-2">
          <h3 className="font-display text-sm font-semibold text-ink-900">Vehicle status mix</h3>
          <p className="text-xs text-ink-500">Where every vehicle stands right now</p>
          {vehicleStatusData.length === 0 ? (
            <EmptyState title="No vehicles yet" />
          ) : (
            <div className="mt-2 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={vehicleStatusData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
                    {vehicleStatusData.map((entry) => (
                      <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#6B7686'} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12, fontFamily: 'Inter' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1.5">
            {vehicleStatusData.map((s) => (
              <div key={s.name} className="flex items-center gap-1.5 text-xs text-ink-700">
                <span className="h-2 w-2 rounded-full" style={{ background: STATUS_COLORS[s.name] || '#6B7686' }} />
                {s.name} <span className="font-mono text-ink-500">({s.value})</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5 xl:col-span-3">
          <h3 className="font-display text-sm font-semibold text-ink-900">Revenue vs. operational cost</h3>
          <p className="text-xs text-ink-500">Per vehicle, from completed trips</p>
          {revenueVsCost.length === 0 ? (
            <EmptyState title="No completed trips yet" subtitle="Revenue and cost figures appear once trips are marked complete." />
          ) : (
            <div className="mt-3 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueVsCost}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E5DC" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fontFamily: 'Inter' }} stroke="#647085" />
                  <YAxis tick={{ fontSize: 11, fontFamily: 'JetBrains Mono' }} stroke="#647085" />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, fontSize: 12, fontFamily: 'Inter' }}
                    formatter={(value) => formatCurrency(value)}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="Revenue" fill="#128A7E" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Cost" fill="#EFA512" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <div className="card mt-4 p-5">
        <h3 className="font-display text-sm font-semibold text-ink-900">Recent trips</h3>
        {recentTrips.length === 0 ? (
          <EmptyState title="No trips logged yet" />
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-paper-200 text-xs uppercase tracking-wide text-ink-500">
                  <th className="pb-2 pr-4 font-semibold">Route</th>
                  <th className="pb-2 pr-4 font-semibold">Vehicle</th>
                  <th className="pb-2 pr-4 font-semibold">Cargo</th>
                  <th className="pb-2 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentTrips.map((t) => (
                  <tr key={t.id} className="border-b border-paper-100 last:border-0">
                    <td className="py-2.5 pr-4 font-medium text-ink-900">{t.source} → {t.destination}</td>
                    <td className="py-2.5 pr-4 font-mono text-xs text-ink-500">{t.vehicleId}</td>
                    <td className="py-2.5 pr-4 font-mono text-xs text-ink-700">{t.cargoWeight?.toLocaleString('en-IN')} kg</td>
                    <td className="py-2.5"><StatusBadge status={t.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
