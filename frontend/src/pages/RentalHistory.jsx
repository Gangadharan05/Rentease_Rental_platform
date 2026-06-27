import { useEffect, useState } from 'react';
import api from '../api/axios';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import StatusBadge from '../components/common/StatusBadge';

export default function RentalHistory() {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    api
      .get('/rentals/my')
      .then((res) => setRentals(res.data))
      .catch(() => setRentals([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = statusFilter ? rentals.filter((r) => r.status === statusFilter) : rentals;

  if (loading) return <Loader label="Loading rental history..." />;

  return (
    <div className="container py-4">
      <h3 className="mb-4">Rental history</h3>

      <div className="d-flex flex-wrap gap-2 mb-4">
        {['', 'pending', 'confirmed', 'delivered', 'active', 'return_requested', 'completed', 'cancelled'].map(
          (s) => (
            <button
              key={s || 'all'}
              className={`btn btn-sm ${statusFilter === s ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setStatusFilter(s)}
            >
              {s === '' ? 'All' : s.replace(/_/g, ' ')}
            </button>
          )
        )}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="bi-clock-history" title="Nothing here yet" message="No rentals match this filter." />
      ) : (
        <div className="table-responsive re-product-card p-2">
          <table className="table align-middle mb-0">
            <thead>
              <tr>
                <th>Product</th>
                <th>Tenure</th>
                <th>Monthly rent</th>
                <th>Delivery</th>
                <th>End date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td>{r.product?.name}</td>
                  <td>{r.tenureMonths} mo</td>
                  <td>₹{r.monthlyRent}</td>
                  <td>{r.deliveryDate}</td>
                  <td>{r.endDate}</td>
                  <td><StatusBadge status={r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
