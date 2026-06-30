import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import Loader from '../components/common/Loader';
import { useCart } from '../context/CartContext';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem, removeItem, cartItems } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTenure, setSelectedTenure] = useState(null);
  const [error, setError] = useState('');
  const [qty, setQty] = useState(1);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  useEffect(() => {
    setLoading(true);
    api
      .get(`/products/${id}`)
      .then((res) => {
        setProduct(res.data);
        if (res.data.tenurePricing?.length) {
          setSelectedTenure(res.data.tenurePricing[0].months);
        }
      })
      .catch(() => setError('This product could not be found.'))
      .finally(() => setLoading(false));
  }, [id]);

  const inCart = cartItems?.some((item) => item.productId === product?.id);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 2500);
  };

  const handleAddToCart = () => {
    addItem(product, selectedTenure, qty);
    showToast('Added to cart', 'success');
  };

  const handleRemove = () => {
    removeItem(product.id);
    showToast('Removed from cart', 'danger');
  };

  const handleRentNow = () => {
    if (!inCart) addItem(product, selectedTenure, qty);
    navigate('/cart');
  };

  const changeQty = (delta) => {
    const next = qty + delta;
    if (next < 1 || next > product.availableUnits) return;
    setQty(next);
  };

  if (loading) return <Loader label="Loading product..." />;
  if (error || !product) {
    return (
      <div className="container py-5 text-center">
        <p className="text-danger">{error || 'Product not found.'}</p>
        <Link to="/products" className="btn btn-primary">Back to catalog</Link>
      </div>
    );
  }

  const selectedPricing = product.tenurePricing?.find((t) => t.months === selectedTenure);
  const inStock = product.availableUnits > 0;
  const dueAtCheckout =
    selectedPricing
      ? (parseFloat(selectedPricing.monthlyRent) + parseFloat(product.securityDeposit)).toFixed(2)
      : null;

  return (
    <div className="container py-4" style={{ position: 'relative' }}>

      {/* Toast */}
      {toast.show && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1050,
            background: 'var(--bs-body-bg)',
            border: '1px solid var(--bs-border-color)',
            borderRadius: 8,
            padding: '10px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
            fontSize: 14,
            whiteSpace: 'nowrap',
          }}
        >
          {toast.type === 'success' ? (
            <i className="bi bi-check-circle-fill text-success" />
          ) : (
            <i className="bi bi-trash-fill text-danger" />
          )}
          {toast.message}
        </div>
      )}

      {/* Breadcrumb */}
      <nav className="small text-secondary mb-3">
        <Link to="/products" className="text-secondary">Catalog</Link> /{' '}
        <Link
          to={`/products?category=${product.category}`}
          className="text-secondary text-capitalize"
        >
          {product.category}
        </Link>{' '}
        / <span className="text-dark">{product.name}</span>
      </nav>

      <div className="row g-4">

        {/* Image */}
        <div className="col-12 col-md-6">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="img-fluid rounded-4 w-100"
            style={{ maxHeight: 420, objectFit: 'cover' }}
          />
        </div>

        {/* Details */}
        <div className="col-12 col-md-6 d-flex flex-column gap-3">

          {/* Title & stock */}
          <div>
            <span className="text-uppercase text-secondary small fw-semibold">
              {product.subCategory?.replace(/_/g, ' ')}
            </span>
            <h2 className="mb-2">{product.name}</h2>
            <span
              className={`badge rounded-pill ${
                inStock ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'
              }`}
            >
              {inStock ? `${product.availableUnits} units available` : 'Out of stock'}
            </span>
          </div>

          <p className="text-secondary mb-0">{product.description}</p>

          {/* Tenure selector */}
          <div className="border rounded-3 p-3">
            <div className="fw-semibold small mb-2">Choose rental tenure</div>
            <div className="d-flex flex-wrap gap-2 mb-3">
              {product.tenurePricing?.map((t) => (
                <button
                  key={t.months}
                  className={`btn btn-sm ${
                    selectedTenure === t.months ? 'btn-primary' : 'btn-outline-primary'
                  }`}
                  onClick={() => setSelectedTenure(t.months)}
                >
                  {t.months} months
                </button>
              ))}
            </div>

            {selectedPricing && (
              <div className="row g-2">
                <div className="col-6">
                  <div className="bg-light rounded-3 p-2 text-center">
                    <div className="text-secondary small">Monthly rent</div>
                    <div className="fw-semibold">₹{selectedPricing.monthlyRent}</div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="bg-light rounded-3 p-2 text-center">
                    <div className="text-secondary small">Security deposit</div>
                    <div className="fw-semibold">₹{product.securityDeposit}</div>
                  </div>
                </div>
                <div className="col-12">
                  <div className="d-flex justify-content-between align-items-center pt-2 border-top mt-1">
                    <span className="text-secondary small">Due at checkout</span>
                    <span className="fw-semibold text-primary">₹{dueAtCheckout}</span>
                  </div>
                  <div className="text-muted" style={{ fontSize: 11 }}>
                    1st month + security deposit
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quantity */}
          <div className="d-flex align-items-center gap-3">
            <span className="text-secondary small">Quantity</span>
            <div className="d-flex align-items-center gap-2">
              <button
                className="btn btn-sm btn-outline-secondary"
                style={{ width: 32, height: 32, padding: 0 }}
                onClick={() => changeQty(-1)}
                disabled={qty <= 1}
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="fw-semibold" style={{ minWidth: 24, textAlign: 'center' }}>
                {qty}
              </span>
              <button
                className="btn btn-sm btn-outline-secondary"
                style={{ width: 32, height: 32, padding: 0 }}
                onClick={() => changeQty(1)}
                disabled={qty >= product.availableUnits}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="d-flex flex-wrap gap-2">
            {!inCart ? (
              <button
                className="btn btn-primary btn-lg flex-fill"
                disabled={!inStock}
                onClick={handleAddToCart}
              >
                <i className="bi bi-cart-plus me-2" />
                Add to cart
              </button>
            ) : (
              <button
                className="btn btn-outline-danger btn-lg flex-fill"
                onClick={handleRemove}
              >
                <i className="bi bi-trash me-2" />
                Remove from cart
              </button>
            )}

            <button
              className="btn btn-outline-primary btn-lg flex-fill"
              disabled={!inStock}
              onClick={handleRentNow}
            >
              <i className="bi bi-bolt me-2" />
              Rent now
            </button>
          </div>

          {/* In-cart confirmation strip */}
          {inCart && (
            <div className="d-flex align-items-center gap-2 bg-success-subtle text-success rounded-3 px-3 py-2 small">
              <i className="bi bi-check-circle-fill" />
              <span>
                {qty} {qty > 1 ? 'units' : 'unit'} · {selectedTenure}-month plan ·{' '}
                ₹{selectedPricing ? (parseFloat(selectedPricing.monthlyRent) * qty).toFixed(2) : '—'}/month
              </span>
              <button
                className="btn btn-link btn-sm text-success ms-auto p-0"
                onClick={() => navigate('/cart')}
              >
                View cart →
              </button>
            </div>
          )}

          {/* Trust badges */}
          <div className="row g-2 pt-2 border-top">
            <div className="col-4 text-center">
              <i className="bi bi-truck text-primary" style={{ fontSize: 20 }} />
              <div className="small text-secondary mt-1">Free delivery</div>
            </div>
            <div className="col-4 text-center">
              <i className="bi bi-tools text-primary" style={{ fontSize: 20 }} />
              <div className="small text-secondary mt-1">Free maintenance</div>
            </div>
            <div className="col-4 text-center">
              <i className="bi bi-arrow-repeat text-primary" style={{ fontSize: 20 }} />
              <div className="small text-secondary mt-1">Easy return</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}