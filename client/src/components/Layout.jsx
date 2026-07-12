import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Truck,
  Users,
  Route,
  Wrench,
  Fuel,
  BarChart3,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/vehicles', label: 'Vehicles', icon: Truck },
  { to: '/drivers', label: 'Drivers', icon: Users },
  { to: '/trips', label: 'Trips', icon: Route },
  { to: '/maintenance', label: 'Maintenance', icon: Wrench },
  { to: '/fuel-expenses', label: 'Fuel & Expenses', icon: Fuel },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
];

function initials(name = '') {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function SidebarContent({ onNavigate }) {
  return (
    <>
      <div className="px-5 pb-5 pt-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500 text-navy-950">
            <Route size={18} strokeWidth={2.5} />
          </div>
          <div>
            <p className="font-display text-[15px] font-semibold leading-none text-white">FleetNova</p>
            <p className="mt-1 text-[11px] font-medium tracking-wide text-navy-600/90">FLEET OPERATIONS</p>
          </div>
        </div>
      </div>
      <div className="route-rule mx-5 text-navy-700" />
      <nav className="flex-1 space-y-1 px-3 py-5">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg border-l-2 px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'border-amber-500 bg-navy-800 text-white'
                  : 'border-transparent text-navy-600 hover:bg-navy-800/60 hover:text-paper-100'
              }`
            }
          >
            <Icon size={17} strokeWidth={2} />
            {label}
          </NavLink>
        ))}
      </nav>
    </>
  );
}

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const currentLabel =
    NAV_ITEMS.find((n) => (n.end ? location.pathname === n.to : location.pathname.startsWith(n.to)))?.label ||
    'FleetNova';

  return (
    <div className="flex h-screen overflow-hidden bg-paper-50">
      {/* Desktop sidebar */}
      <aside className="hidden w-60 flex-shrink-0 flex-col bg-navy-950 md:flex">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-navy-950/60" onClick={() => setMobileOpen(false)} />
          <aside className="relative flex h-full w-64 flex-col bg-navy-950 shadow-xl">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-4 rounded-md p-1 text-navy-600 hover:text-white"
            >
              <X size={20} />
            </button>
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 flex-shrink-0 items-center justify-between border-b border-paper-200 bg-white px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              className="rounded-md p-1.5 text-ink-700 hover:bg-paper-100 md:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={20} />
            </button>
            <h1 className="font-display text-lg font-semibold text-ink-900">{currentLabel}</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold leading-none text-ink-900">{user?.name}</p>
              <p className="mt-1 text-xs font-medium text-ink-500">{user?.role}</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-900 text-xs font-semibold text-white">
              {initials(user?.name)}
            </div>
            <button
              onClick={logout}
              className="btn-ghost !px-2.5 !py-2"
              title="Log out"
              aria-label="Log out"
            >
              <LogOut size={17} />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
