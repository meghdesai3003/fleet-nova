import React, { useEffect, useMemo, useState } from 'react';
import { Gauge, TrendingUp } from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  RadialBarChart, RadialBar, PolarAngleAxis,
} from 'recharts';
import { reportApi, apiErrorMessage } from '../services/api';
import { PageHeader, Spinner, EmptyState, ErrorNote } from '../components/UI.jsx';
import { formatCurrency } from '../utils/validators';

export default function Reports() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError('');
      try {
        const { data } = await reportApi.getReports();
        setReport(data);
      } catch (err) {
        setError(apiErrorMessage(err, 'Could not load reports.'));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const efficiencyData = useMemo(() => {
    if (!report) return [];
    return report.vehicles
      .filter((v) => v.fuelEfficiency !== null)
      .map((v) => ({ name: v.vehicleName?.split(' ').slice(0, 2).join(' '), efficiency: Number(v.fuelEfficiency) }))
      .sort((a, b) => b.efficiency - a.efficiency);
  }, [report]);

  const utilizationValue = report ? parseFloat(report.fleetUtilization) : 0;

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader title="Reports" subtitle="Fuel efficiency, revenue, cost, and ROI across the fleet" />
      <ErrorNote message={error} />

      {!report ? (
        <EmptyState title="No report data available" />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="card p-5 lg:col-span-1">
              <div className="mb-1 flex items-center gap-2 text-ink-900">
                <Gauge size={16} className="text-amber-600" />
                <h3 className="font-display text-sm font-semibold">Fleet utilization</h3>
              </div>
              <p className="mb-2 text-xs text-ink-500">Share of vehicles currently on trip</p>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart
                    innerRadius="70%"
                    outerRadius="100%"
                    data={[{ name: 'Utilization', value: utilizationValue, fill: '#EFA512' }]}
                    startAngle={90}
                    endAngle={-270}
                  >
                    <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                    <RadialBar background dataKey="value" cornerRadius={8} />
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
              <p className="-mt-24 text-center font-mono text-3xl font-semibold text-ink-900">{report.fleetUtilization}</p>
            </div>

            <div className="card p-5 lg:col-span-2">
              <div className="mb-1 flex items-center gap-2 text-ink-900">
                <TrendingUp size={16} className="text-amber-600" />
                <h3 className="font-display text-sm font-semibold">Fuel efficiency by vehicle</h3>
              </div>
              <p className="mb-2 text-xs text-ink-500">Kilometers per liter, completed trips only</p>
              {efficiencyData.length === 0 ? (
                <EmptyState title="No efficiency data yet" subtitle="Complete a trip with fuel consumption logged to see this chart." />
              ) : (
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={efficiencyData} layout="vertical" margin={{ left: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E5DC" />
                      <XAxis type="number" tick={{ fontSize: 11, fontFamily: 'JetBrains Mono' }} stroke="#647085" />
                      <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11, fontFamily: 'Inter' }} stroke="#647085" />
                      <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12, fontFamily: 'Inter' }} formatter={(v) => [`${v} km/L`, 'Efficiency']} />
                      <Bar dataKey="efficiency" fill="#2874C9" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          <div className="card mt-4 overflow-x-auto">
            <div className="border-b border-paper-200 px-4 py-3">
              <h3 className="font-display text-sm font-semibold text-ink-900">Vehicle economics</h3>
              <p className="text-xs text-ink-500">Revenue, cost, and return on acquisition cost, per vehicle</p>
            </div>
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-paper-200 text-xs uppercase tracking-wide text-ink-500">
                  <th className="px-4 py-2.5 font-semibold">Vehicle</th>
                  <th className="px-4 py-2.5 font-semibold">Efficiency</th>
                  <th className="px-4 py-2.5 font-semibold">Revenue</th>
                  <th className="px-4 py-2.5 font-semibold">Operational cost</th>
                  <th className="px-4 py-2.5 font-semibold">ROI</th>
                </tr>
              </thead>
              <tbody>
                {report.vehicles.map((v) => (
                  <tr key={v.vehicleId} className="border-b border-paper-100 last:border-0">
                    <td className="px-4 py-2.5 font-medium text-ink-900">{v.vehicleName}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-ink-700">{v.fuelEfficiency ? `${v.fuelEfficiency} km/L` : '—'}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-ink-700">{formatCurrency(v.revenue)}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-ink-700">{formatCurrency(v.operationalCost)}</td>
                    <td className={`px-4 py-2.5 font-mono text-xs font-semibold ${v.roi > 0 ? 'text-signal-teal' : v.roi < 0 ? 'text-signal-rust' : 'text-ink-500'}`}>
                      {v.roi !== null ? `${(v.roi * 100).toFixed(2)}%` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
