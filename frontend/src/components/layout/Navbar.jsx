import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  const close = () => setExpanded(false);

  const handleLogout = () => {
    logout();
    close();
    navigate('/');
  };

  const linkClass = ({ isActive }) => `nav-link re-nav-link ${isActive ? 'active' : ''}`;

  return (
    <nav className="navbar navbar-expand-lg re-navbar sticky-top py-2">
      <div className="container">
        <NavLink to="/" className="re-brand" onClick={close}>
          <span className="re-brand-mark" aria-hidden="true" />
          RentEase
        </NavLink>

        <button
          className="navbar-toggler border-0"
          type="button"
          aria-label="Toggle navigation"
          onClick={() => setExpanded((e) => !e)}
        >
          <i className="bi bi-list" style={{ fontSize: '1.6rem' }} />
        </button>

        <div className={`collapse navbar-collapse ${expanded ? 'show' : ''}`}>
          <ul className="navbar-nav mx-lg-auto my-2 my-lg-0 gap-1">
            <li className="nav-item">
              <NavLink to="/products" className={linkClass} onClick={close}>
                Browse
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/products?category=furniture" className={linkClass} onClick={close}>
                Furniture
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/products?category=appliance" className={linkClass} onClick={close}>
                Appliances
              </NavLink>
            </li>
            {isAuthenticated && !isAdmin && (
              <li className="nav-item">
                <NavLink to="/my-rentals" className={linkClass} onClick={close}>
                  My Rentals
                </NavLink>
              </li>
            )}
            {isAdmin && (
              <li className="nav-item">
                <NavLink to="/admin" className={linkClass} onClick={close}>
                  Admin Dashboard
                </NavLink>
              </li>
            )}
          </ul>

          <div className="d-flex align-items-center gap-2 flex-wrap">
            {!isAdmin && (
              <Link to="/cart" className="btn btn-outline-primary position-relative" onClick={close}>
                <i className="bi bi-cart3 me-1" />
                Cart
                {totalItems > 0 && (
                  <span className="position-absolute re-cart-badge badge rounded-pill bg-danger">
                    {totalItems}
                  </span>
                )}
              </Link>
            )}

            {isAuthenticated ? (
              <div className="dropdown">
                <button
                  className="btn btn-light dropdown-toggle d-flex align-items-center gap-2"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i className="bi bi-person-circle" />
                  <span className="d-none d-sm-inline">{user.name?.split(' ')[0]}</span>
                </button>
                <ul className="dropdown-menu dropdown-menu-end">
                  {!isAdmin && (
                    <>
                      <li>
                        <NavLink className="dropdown-item" to="/my-rentals" onClick={close}>
                          My Rentals
                        </NavLink>
                      </li>
                      <li>
                        <NavLink className="dropdown-item" to="/rental-history" onClick={close}>
                          Rental History
                        </NavLink>
                      </li>
                      <li>
                        <hr className="dropdown-divider" />
                      </li>
                    </>
                  )}
                  <li>
                    <button className="dropdown-item text-danger" onClick={handleLogout}>
                      Log out
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline-primary" onClick={close}>
                  Log in
                </Link>
                <Link to="/register" className="btn btn-primary" onClick={close}>
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
