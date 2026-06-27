import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../api/axios';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';

const ACTIVE_STATUSES = ['pending', 'confirmed', 'delivered', 'active', 'return_requested'];

export default function MyRentals() {
  const location = useLocation();
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [maintenanceModal, setMaintenanceModal] = useState(null); // rental object or null
  const [extendModal, setExtendModal] = useState(null);
  const [issueText, setIssueText] = useState('');
  const [extendMonths, setExtendMonths] = useState(3);
  const [actionError, setActionError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [banner, setBanner] = useState(location.state?.justOrdered ? 'Your order was placed! We will confirm delivery shortly.' : '');

  const fetchRentals = () => {
    setLoading(true);
    api
      .get('/rentals/my')
      .then((res) => setRentals(res.data.filter((r) => ACTIVE_STATUSES.includes(r.status))))
      .catch(() => setRentals([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRentals();
  }, []);

  const submitMaintenance = async () => {
    if (!issueText.trim()) return;
    setActionLoading(true);
    setActionError('');
    try {
      await api.post('/maintenance', { rentalId: maintenanceModal.id, issueDescription: issueText });
      setMaintenanceModal(null);
      setIssueText('');
      setBanner('Maintenance request submitted. Our team will reach out soon.');
    } catch (err) {
      setActionError(err.response?.data?.message || 'Could not submit the request.');
    } finally {
      setActionLoading(false);
    }
  };

  const submitExtend = async () => {
    setActionLoading(true);
    setActionError('');
    try {
      await api.post(`/rentals/${extendModal.id}/extend`, { additionalMonths: Number(extendMonths) });
      setExtendModal(null);
      fetchRentals();
      setBanner('Rental extended successfully.');
    } catch (err) {
      setActionError(err.response?.data?.message || 'Could not extend this rental.');
    } finally {
      setActionLoading(false);
    }
  };

  const requestReturn = async (rental) => {
    if (!window.confirm(`Request pickup/return for ${rental.product.name}?`)) return;
    try {
      await api.post(`/rentals/${rental.id}/return`);
      fetchRentals();
      setBanner('Return requested. We will schedule a pickup soon.');
    } catch (err) {
      setBanner(err.response?.data?.message || 'Could not request return.');
    }
  };

  if (loading) return <Loader label="Loading your rentals..." />;

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="mb-0">My active rentals</h3>
        <Link to="/rental-history" className="btn btn-outline-primary btn-sm">
          View rental history
        </Link>
      </div>

      {banner && (
        <div className="alert alert-success d-flex justify-content-between align-items-start">
          <span>{banner}</span>
          <button className="btn-close" onClick={() => setBanner('')} />
        </div>
      )}

      {rentals.length === 0 ? (
        <EmptyState
          icon="bi-box-seam"
          title="No active rentals"
          message="Once you rent a product, it will show up here for you to manage."
          action={<Link to="/products" className="btn btn-primary">Browse products</Link>}
        />
      ) : (
        <div className="d-flex flex-column gap-3">
          {rentals.map((r) => (
            <div className="re-product-card p-3" key={r.id} style={{ flexDirection: 'row' }}>
              <img
                src={r.product?.imageUrl}
                alt={r.product?.name}
                style={{ width: 110, height: 90, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }}
              />
              <div className="ms-3 flex-fill">
                <div className="d-flex flex-wrap justify-content-between align-items-start gap-2">
                  <div>
                    <h6 className="mb-1">{r.product?.name}</h6>
                    <div className="small text-secondary">
                      {r.tenureMonths} months · ₹{r.monthlyRent}/mo · Ends {r.endDate}
                    </div>
                  </div>
                  <StatusBadge status={r.status} />
                </div>
                <div className="small text-secondary mt-2">
                  Delivering to {r.deliveryAddress}, {r.deliveryCity} on {r.deliveryDate}
                </div>
                <div className="d-flex flex-wrap gap-2 mt-3">
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => setMaintenanceModal(r)}
                  >
                    <i className="bi bi-tools me-1" />Request maintenance
                  </button>
                  {r.status !== 'return_requested' && (
                    <>
                      <button className="btn btn-sm btn-outline-secondary" onClick={() => setExtendModal(r)}>
                        <i className="bi bi-calendar-plus me-1" />Extend tenure
                      </button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => requestReturn(r)}>
                        <i className="bi bi-box-arrow-left me-1" />Request return
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        show={!!maintenanceModal}
        onClose={() => setMaintenanceModal(null)}
        title={`Maintenance request - ${maintenanceModal?.product?.name || ''}`}
        footer={
          <>
            <button className="btn btn-light" onClick={() => setMaintenanceModal(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={submitMaintenance} disabled={actionLoading}>
              {actionLoading ? 'Submitting...' : 'Submit request'}
            </button>
          </>
        }
      >
        {actionError && <div className="alert alert-danger">{actionError}</div>}
        <label className="form-label">Describe the issue</label>
        <textarea
          className="form-control"
          rows="4"
          value={issueText}
          onChange={(e) => setIssueText(e.target.value)}
          placeholder="e.g. The washing machine isn't draining properly"
        />
      </Modal>

      <Modal
        show={!!extendModal}
        onClose={() => setExtendModal(null)}
        title={`Extend rental - ${extendModal?.product?.name || ''}`}
        footer={
          <>
            <button className="btn btn-light" onClick={() => setExtendModal(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={submitExtend} disabled={actionLoading}>
              {actionLoading ? 'Extending...' : 'Confirm extension'}
            </button>
          </>
        }
      >
        {actionError && <div className="alert alert-danger">{actionError}</div>}
        <label className="form-label">Additional months</label>
        <select className="form-select" value={extendMonths} onChange={(e) => setExtendMonths(e.target.value)}>
          {[1, 2, 3, 6, 12].map((m) => (
            <option value={m} key={m}>{m} month{m > 1 ? 's' : ''}</option>
          ))}
        </select>
      </Modal>
    </div>
  );
}
