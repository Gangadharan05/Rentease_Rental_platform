import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import EmptyState from '../components/common/EmptyState';

export default function Cart() {
  const { items, updateTenure, removeItem, getMonthlyRent, totalMonthly, totalDeposit } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="container py-5">
        <EmptyState
          icon="bi-cart3"
          title="Your cart is empty"
          message="Browse the catalog and add furniture or appliances to get started."
          action={
            <Link to="/products" className="btn btn-primary">
              Browse products
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h3 className="mb-4">Your cart</h3>
      <div className="row g-4">
        <div className="col-12 col-lg-8">
          <div className="d-flex flex-column gap-3">
            {items.map((item) => (
              <div className="re-product-card flex-row p-3" key={item.productId} style={{ flexDirection: 'row' }}>
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  style={{ width: 110, height: 90, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }}
                />
                <div className="ms-3 flex-fill">
                  <div className="d-flex justify-content-between">
                    <h6 className="mb-1">{item.name}</h6>
                    <button
                      className="btn btn-sm btn-link text-danger p-0"
                      onClick={() => removeItem(item.productId)}
                    >
                      Remove
                    </button>
                  </div>
                  <div className="d-flex flex-wrap gap-2 align-items-center mt-2">
                    <span className="small text-secondary">Tenure:</span>
                    {item.tenurePricing.map((t) => (
                      <button
                        key={t.months}
                        className={`btn btn-sm ${item.tenureMonths === t.months ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => updateTenure(item.productId, t.months)}
                      >
                        {t.months} mo
                      </button>
                    ))}
                  </div>
                  <div className="mt-2 small">
                    <span className="re-price">₹{getMonthlyRent(item)}/mo</span>
                    <span className="text-secondary"> · Deposit ₹{item.securityDeposit}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="col-12 col-lg-4">
          <div className="re-product-card p-4">
            <h6 className="mb-3">Order summary</h6>
            <div className="d-flex justify-content-between mb-2">
              <span className="text-secondary">Monthly rent (1st month)</span>
              <span>₹{totalMonthly.toFixed(2)}</span>
            </div>
            <div className="d-flex justify-content-between mb-3">
              <span className="text-secondary">Security deposit</span>
              <span>₹{totalDeposit.toFixed(2)}</span>
            </div>
            <hr />
            <div className="d-flex justify-content-between mb-4 fw-semibold">
              <span>Total due at checkout</span>
              <span>₹{(totalMonthly + totalDeposit).toFixed(2)}</span>
            </div>
            <button className="btn btn-accent w-100 btn-lg" onClick={() => navigate('/checkout')}>
              Proceed to checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
