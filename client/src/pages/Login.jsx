import React, { useState } from 'react';
import { Route, Truck, Users, Wrench, Fuel, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { isRequired, isValidEmail } from '../utils/validators';

const DEMO_ACCOUNTS = [
  { email: 'admin@fleetnova.com', password: 'fleet@123', role: 'Admin' },
  { email: 'manager@fleetnova.com', password: 'fleet@123', role: 'Fleet Manager' },
  { email: 'dispatcher@fleetnova.com', password: 'fleet@123', role: 'Dispatcher' },
];

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    const nextErrors = {};
    if (!isRequired(email) || !isValidEmail(email)) nextErrors.email = 'Enter a valid email address';
    if (!isRequired(password)) nextErrors.password = 'Enter your password';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (!result.success) {
      setSubmitError(result.message);
    }
  };

  return (
    <div className="flex min-h-screen bg-paper-50">
      {/* Brand panel */}
      <div className="relative hidden w-[44%] flex-col justify-between overflow-hidden bg-navy-950 px-10 py-10 text-white lg:flex">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500 text-navy-950">
            <Route size={18} strokeWidth={2.5} />
          </div>
          <span className="font-display text-[15px] font-semibold">FleetNova</span>
        </div>

        <div>
          <p className="font-display text-3xl font-semibold leading-tight">
            Every truck, trip and<br />rupee — on one route.
          </p>
          <div className="route-rule my-6 w-24 text-amber-500" />
          <p className="max-w-sm text-sm leading-relaxed text-navy-600">
            Track your fleet from dispatch to delivery: vehicle status, driver licensing, maintenance
            windows, and operational cost, all in real time.
          </p>

          <div className="mt-9 grid grid-cols-2 gap-3">
            {[
              { icon: Truck, label: 'Vehicle registry' },
              { icon: Users, label: 'Driver compliance' },
              { icon: Wrench, label: 'Maintenance cycles' },
              { icon: Fuel, label: 'Fuel & expenses' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 rounded-lg border border-navy-700 bg-navy-900/60 px-3 py-2.5">
                <Icon size={15} className="text-amber-500" />
                <span className="text-xs font-medium text-navy-600 text-white/80">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-navy-600">TransitOps · Fleet operations platform</p>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <div className="mb-4 flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500 text-navy-950">
                <Route size={18} strokeWidth={2.5} />
              </div>
              <span className="font-display text-[15px] font-semibold text-ink-900">FleetNova</span>
            </div>
          </div>

          <h1 className="font-display text-2xl font-semibold text-ink-900">Welcome back</h1>
          <p className="mt-1.5 text-sm text-ink-500">Sign in to your fleet operations dashboard.</p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-4" noValidate>
            {submitError && (
              <div className="rounded-lg border border-signal-rust/20 bg-signal-rust/5 px-3.5 py-2.5 text-sm font-medium text-signal-rust">
                {submitError}
              </div>
            )}

            <div>
              <label className="field-label" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                className="field-input"
                placeholder="you@fleetnova.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {errors.email && <p className="mt-1.5 text-xs font-medium text-signal-rust">{errors.email}</p>}
            </div>

            <div>
              <label className="field-label" htmlFor="password">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className="field-input pr-10"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-500 hover:text-ink-900"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="mt-1.5 text-xs font-medium text-signal-rust">{errors.password}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-accent w-full !py-2.5">
              {loading ? 'Signing in…' : 'Sign in'}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          <div className="mt-7 rounded-lg border border-paper-200 bg-white p-3.5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-500">Quick fill · demo accounts</p>
            <div className="flex flex-wrap gap-1.5">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => { setEmail(acc.email); setPassword(acc.password); }}
                  className="rounded-md border border-paper-200 bg-paper-50 px-2.5 py-1.5 text-xs font-medium text-ink-700 hover:border-navy-700 hover:text-ink-900"
                >
                  {acc.role}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-ink-500">Clicks fill both email & password — just hit <strong>Sign in</strong>.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
