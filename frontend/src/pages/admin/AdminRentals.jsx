import { useEffect, useState } from 'react';
import api from '../../api/axios';
import Loader from '../../components/common/Loader';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';

const STATUS_FLOW = ['pending', 'confirmed', 'delivered', 'active', 'return_requested', 'completed', 'cancelled'];

export default function AdminRentals() {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [editing, setEditing] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [damageNotes, setDamageNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchRentals = () => {
    setLoading(true);
    const params = statusFilter ? { status: statusFilter } : {};
    api.get('/rentals', { params }).then((res) => setRentals(res.data)).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRentals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const openEdit = (r) => {
    setEditing(r);
    setNewStatus(r.status);
    setDamageNotes(r.damageNotes || '');
  };

  const saveStatus = async () => {
    setSaving(true);
    try {
      await api.put(`/rentals/${editing.id}/status`, { status: newStatus, damageNotes });
      setEditing(null);
      fetchRentals();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not update rental.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader label="Loading rentals..." />;

  return (
    <div>
      <h3 className="mb-4">Rentals</h3>

      <div className="d-flex flex-wrap gap-2 mb-4">
        <button
          className={`btn btn-sm ${statusFilter === '' ? 'btn-primary' : 'btn-outline-secondary'}`}
          onClick={() => setStatusFilter('')}
        >
          All
        </button>
        {STATUS_FLOW.map((s) => (
          <button
            key={s}
            className={`btn btn-sm ${statusFilter === s ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => setStatusFilter(s)}
          >
            {s.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      <div className="table-responsive re-product-card p-2">
        <table className="table align-middle mb-0">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Product</th>
              <th>Tenure</th>
              <th>Delivery</th>
              <th>End date</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rentals.map((r) => (
              <tr key={r.id}>
                <td>
                  <div>{r.user?.name}</div>
                  <div className="small text-secondary">{r.user?.email}</div>
                </td>
                <td>{r.product?.name}</td>
                <td>{r.tenureMonths} mo</td>
                <td>{r.deliveryDate} · {r.deliveryCity}</td>
                <td>{r.endDate}</td>
                <td><StatusBadge status={r.status} /></td>
                <td className="text-end">
                  <button className="btn btn-sm btn-outline-secondary" onClick={() => openEdit(r)}>
                    Update
                  </button>
                </td>
              </tr>
            ))}
            {rentals.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center text-secondary py-4">No rentals match this filter.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal
        show={!!editing}
        onClose={() => setEditing(null)}
        title={`Update rental - ${editing?.product?.name || ''}`}
        footer={
          <>
            <button className="btn btn-light" onClick={() => setEditing(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={saveStatus} disabled={saving}>
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </>
        }
      >
        <div className="mb-3">
          <label className="form-label">Status</label>
          <select className="form-select" value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
            {STATUS_FLOW.map((s) => (
              <option value={s} key={s}>{s.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="form-label">Damage / return notes (optional)</label>
          <textarea
            className="form-control"
            rows="3"
            value={damageNotes}
            onChange={(e) => setDamageNotes(e.target.value)}
            placeholder="Record any damage found on pickup"
          />
        </div>
      </Modal>
    </div>
  );
}
