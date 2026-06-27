import { NavLink, Outlet } from 'react-router-dom';

const LINKS = [
  { to: '/admin', label: 'Overview', icon: 'bi-speedometer2', end: true },
  { to: '/admin/products', label: 'Products', icon: 'bi-box-seam' },
  { to: '/admin/rentals', label: 'Rentals', icon: 'bi-receipt' },
  { to: '/admin/maintenance', label: 'Maintenance', icon: 'bi-tools' },
  { to: '/admin/service-areas', label: 'Service Areas', icon: 'bi-geo-alt' },
];

export default function AdminLayout() {
  return (
    <div className="re-admin-shell">
      <aside className="re-admin-sidebar py-3">
        <nav className="nav flex-column">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) => `nav-link d-flex align-items-center gap-2 ${isActive ? 'active' : ''}`}
            >
              <i className={`bi ${l.icon}`} />
              {l.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="re-admin-main">
        <Outlet />
      </main>
    </div>
  );
}
