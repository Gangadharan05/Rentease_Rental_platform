import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Checkout() {
  const { items, getMonthlyRent, totalMonthly, totalDeposit, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [serviceAreas, setServiceAreas] = useState([]);
  const [form, setForm] = useState({
    deliveryDate: '',
    deliveryAddress: user?.address || '',
    deliveryCity: user?.city || '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/service-areas').then((res) => setServiceAreas(res.data)).catch(() => setServiceAreas([]));
  }, []);

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().slice(0, 10);

  if (items.length === 0) {
    return (
      <div className="container py-5 text-center">
        <p className="text-secondary">Your cart is empty, so there's nothing to check out.</p>
        <Link to="/products" className="btn btn-primary">Browse products</Link>
      </div>
    );
  }

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const payload = {
        items: items.map((i) => ({ productId: i.productId, tenureMonths: i.tenureMonths })),
        deliveryDate: form.deliveryDate,
        deliveryAddress: form.deliveryAddress,
        deliveryCity: form.deliveryCity,
      };
      await api.post('/rentals', payload);
      clearCart();
      navigate('/my-rentals', { state: { justOrdered: true } });
    } catch (err) {
      setError(err.response?.data?.message || 'Could not place the order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container py-4">
      <h3 className="mb-4">Checkout</h3>
      <div className="row g-4">
        <div className="col-12 col-lg-7">
          <form className="re-product-card p-4" onSubmit={handleSubmit}>
            <h6 className="mb-3">Delivery details</h6>

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="mb-3">
              <label className="form-label">Delivery city</label>
              <select
                name="deliveryCity"
                className="form-select"
                value={form.deliveryCity}
                onChange={handleChange}
                required
              >
                <option value="">Select a city</option>
                {serviceAreas.map((a) => (
                  <option value={a.city} key={a.id}>{a.city}</option>
                ))}
              </select>
              <div className="form-text">We currently deliver only within listed service areas.</div>
            </div>

            <div className="mb-3">
              <label className="form-label">Delivery address</label>
              <textarea
                name="deliveryAddress"
                className="form-control"
                rows="3"
                value={form.deliveryAddress}
                onChange={handleChange}
                placeholder="House/flat no., street, locality"
                required
              />
            </div>

            <div className="mb-4">
              <label className="form-label">Preferred delivery date</label>
              <input
                type="date"
                name="deliveryDate"
                className="form-control"
                min={minDateStr}
                value={form.deliveryDate}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="btn btn-accent btn-lg w-100" disabled={submitting}>
              {submitting ? 'Placing order...' : 'Confirm rental order'}
            </button>
          </form>
        </div>

        <div className="col-12 col-lg-5">
          <div className="re-product-card p-4">
            <h6 className="mb-3">Order summary</h6>
            {items.map((i) => (
              <div className="d-flex justify-content-between small mb-2" key={i.productId}>
                <span>{i.name} ({i.tenureMonths} mo)</span>
                <span>₹{getMonthlyRent(i)}/mo</span>
              </div>
            ))}
            <hr />
            <div className="d-flex justify-content-between mb-2">
              <span className="text-secondary">First month rent</span>
              <span>₹{totalMonthly.toFixed(2)}</span>
            </div>
            <div className="d-flex justify-content-between mb-3">
              <span className="text-secondary">Security deposit</span>
              <span>₹{totalDeposit.toFixed(2)}</span>
            </div>
            <hr />
            <div className="d-flex justify-content-between fw-semibold fs-5">
              <span>Total</span>
              <span>₹{(totalMonthly + totalDeposit).toFixed(2)}</span>
            </div>
            <p className="small text-secondary mt-3 mb-0">
              Payment integration is not yet enabled in this build — placing the order reserves
              your items and schedules delivery.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
