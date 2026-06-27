import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import CategoryCard from '../components/products/CategoryCard';
import ProductCard from '../components/products/ProductCard';
import Loader from '../components/common/Loader';

const CATEGORIES = [
  { icon: 'bi-house-door', label: 'Beds', category: 'furniture', subCategory: 'bed' },
  { icon: 'bi-square', label: 'Sofas', category: 'furniture', subCategory: 'sofa' },
  { icon: 'bi-table', label: 'Tables', category: 'furniture', subCategory: 'table' },
  { icon: 'bi-snow', label: 'Fridges', category: 'appliance', subCategory: 'fridge' },
  { icon: 'bi-droplet', label: 'Washing Machines', category: 'appliance', subCategory: 'washing_machine' },
  { icon: 'bi-tv', label: 'TVs', category: 'appliance', subCategory: 'tv' },
];

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/products')
      .then((res) => setProducts(res.data.slice(0, 8)))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <section className="re-hero py-5 mb-5">
        <div className="container py-3 py-md-4">
          <div className="row align-items-center g-4">
            <div className="col-12 col-lg-7">
              <span className="badge bg-white text-success-emphasis mb-3 px-3 py-2 rounded-pill">
                Furnish your home without buying a thing
              </span>
              <h1 className="font-display mb-3">
                Rent furniture &amp; appliances, by the month — not the lifetime.
              </h1>
              <p className="lead mb-4">
                Affordable monthly plans, free delivery scheduling, and easy returns when you
                relocate. Built for renters who move often and own less.
              </p>
              <div className="d-flex flex-wrap gap-2">
                <Link to="/products" className="btn btn-accent btn-lg px-4">
                  Browse catalog
                </Link>
                <Link to="/products?category=appliance" className="btn btn-outline-light btn-lg px-4">
                  Shop appliances
                </Link>
              </div>
            </div>
            <div className="col-12 col-lg-5">
              <div className="row g-3">
                <div className="col-6">
                  <div className="re-hero-stat">
                    <div className="fs-4 fw-bold">Zero</div>
                    <div className="small">upfront purchase cost</div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="re-hero-stat">
                    <div className="fs-4 fw-bold">3-12 mo</div>
                    <div className="small">flexible tenure plans</div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="re-hero-stat">
                    <div className="fs-4 fw-bold">Free</div>
                    <div className="small">delivery scheduling</div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="re-hero-stat">
                    <div className="fs-4 fw-bold">On-call</div>
                    <div className="small">maintenance support</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container mb-5">
        <p className="re-section-eyebrow mb-1">Shop by category</p>
        <h3 className="mb-4">What do you need this month?</h3>
        <div className="row g-3">
          {CATEGORIES.map((c) => (
            <div className="col-6 col-md-4 col-lg-2" key={c.label}>
              <CategoryCard {...c} />
            </div>
          ))}
        </div>
      </section>

      <section className="container mb-5">
        <div className="d-flex justify-content-between align-items-end mb-4">
          <div>
            <p className="re-section-eyebrow mb-1">Popular right now</p>
            <h3 className="mb-0">Featured rentals</h3>
          </div>
          <Link to="/products" className="btn btn-outline-primary">
            View all
          </Link>
        </div>

        {loading ? (
          <Loader label="Fetching products..." />
        ) : products.length === 0 ? (
          <p className="text-secondary">No products available yet. Check back soon.</p>
        ) : (
          <div className="row g-3">
            {products.map((p) => (
              <ProductCard product={p} key={p.id} />
            ))}
          </div>
        )}
      </section>

      <section className="container mb-5">
        <div className="row g-3">
          <div className="col-12 col-md-4">
            <div className="re-category-card text-start h-100">
              <i className="bi bi-truck fs-3 mb-2 d-block" style={{ color: 'var(--re-primary)' }} />
              <h6>Schedule delivery on your terms</h6>
              <p className="small text-secondary mb-0">
                Pick a delivery date and address at checkout; reschedule or extend anytime from
                your dashboard.
              </p>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="re-category-card text-start h-100">
              <i className="bi bi-tools fs-3 mb-2 d-block" style={{ color: 'var(--re-primary)' }} />
              <h6>Maintenance, handled</h6>
              <p className="small text-secondary mb-0">
                Raise a support request straight from any active rental and track it through to
                resolution.
              </p>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="re-category-card text-start h-100">
              <i className="bi bi-arrow-repeat fs-3 mb-2 d-block" style={{ color: 'var(--re-primary)' }} />
              <h6>Built for relocation</h6>
              <p className="small text-secondary mb-0">
                Moving cities? End your tenure, hand the item back, and start fresh wherever you
                land.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
