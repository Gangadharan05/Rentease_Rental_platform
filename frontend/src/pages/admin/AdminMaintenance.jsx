import { useEffect, useState } from 'react';
import api from '../../api/axios';
import Loader from '../../components/common/Loader';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';

const STATUSES = ['open', 'in_progress', 'resolved'];

export default function AdminMaintenance() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [editing, setEditing] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchRequests = () => {
    setLoading(true);
    const params = statusFilter ? { status: statusFilter } : {};
    api.get('/maintenance', { params }).then((res) => setRequests(res.data)).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const openEdit = (r) => {
    setEditing(r);
    setNewStatus(r.status);
    setNotes(r.resolutionNotes || '');
  };

  const save = async () => {
    setSaving(true);
    try {
      await api.put(`/maintenance/${editing.id}`, { status: newStatus, resolutionNotes: notes });
      setEditing(null);
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not update this request.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader label="Loading maintenance requests..." />;

  return (
    <div>
      <h3 className="mb-4">Maintenance requests</h3>

      <div className="d-flex flex-wrap gap-2 mb-4">
        <button
          className={`btn btn-sm ${statusFilter === '' ? 'btn-primary' : 'btn-outline-secondary'}`}
          onClick={() => setStatusFilter('')}
        >
          All
        </button>
        {STATUSES.map((s) => (
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
              <th>Issue</th>
              <th>Raised</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <tr key={r.id}>
                <td>
                  <div>{r.user?.name}</div>
                  <div className="small text-secondary">{r.user?.email}</div>
                </td>
                <td>{r.rental?.product?.name}</td>
                <td style={{ maxWidth: 260 }}>{r.issueDescription}</td>
                <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                <td><StatusBadge status={r.status} /></td>
                <td className="text-end">
                  <button className="btn btn-sm btn-outline-secondary" onClick={() => openEdit(r)}>
                    Update
                  </button>
                </td>
              </tr>
            ))}
            {requests.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center text-secondary py-4">No requests match this filter.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal
        show={!!editing}
        onClose={() => setEditing(null)}
        title="Update maintenance request"
        footer={
          <>
            <button className="btn btn-light" onClick={() => setEditing(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={save} disabled={saving}>
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </>
        }
      >
        <p className="small text-secondary">{editing?.issueDescription}</p>
        <div className="mb-3">
          <label className="form-label">Status</label>
          <select className="form-select" value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
            {STATUSES.map((s) => (
              <option value={s} key={s}>{s.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="form-label">Resolution notes</label>
          <textarea
            className="form-control"
            rows="3"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="What was done to resolve this?"
          />
        </div>
      </Modal>
    </div>
  );
}
