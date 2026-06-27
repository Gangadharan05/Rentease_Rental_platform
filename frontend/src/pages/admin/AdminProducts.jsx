import { useEffect, useState } from 'react';
import api from '../../api/axios';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';

const TENURE_CHOICES = [1, 3, 6, 9, 12];
const SUBCATEGORY_BY_CATEGORY = {
  furniture: ['bed', 'sofa', 'table', 'other'],
  appliance: ['fridge', 'washing_machine', 'tv', 'other'],
};

const EMPTY_FORM = {
  name: '',
  category: 'furniture',
  subCategory: 'bed',
  description: '',
  imageUrl: '',
  baseMonthlyRent: '',
  securityDeposit: '',
  tenureOptions: [3, 6, 12],
  totalUnits: 1,
  status: 'active',
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchProducts = () => {
    setLoading(true);
    api.get('/products', { params: { _all: true } })
      .then((res) => setProducts(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError('');
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      category: p.category,
      subCategory: p.subCategory,
      description: p.description || '',
      imageUrl: p.imageUrl || '',
      baseMonthlyRent: p.baseMonthlyRent,
      securityDeposit: p.securityDeposit,
      tenureOptions: p.tenureOptions,
      totalUnits: p.totalUnits,
      status: p.status,
    });
    setError('');
    setShowModal(true);
  };

  const toggleTenure = (months) => {
    setForm((f) => ({
      ...f,
      tenureOptions: f.tenureOptions.includes(months)
        ? f.tenureOptions.filter((m) => m !== months)
        : [...f.tenureOptions, months].sort((a, b) => a - b),
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({
      ...f,
      [name]: value,
      ...(name === 'category' ? { subCategory: SUBCATEGORY_BY_CATEGORY[value][0] } : {}),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.tenureOptions.length === 0) {
      setError('Select at least one tenure option.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, form);
      } else {
        await api.post('/products', form);
      }
      setShowModal(false);
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save the product.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (p) => {
    if (!window.confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/products/${p.id}`);
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not delete this product.');
    }
  };

  if (loading) return <Loader label="Loading inventory..." />;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h3 className="mb-0">Products</h3>
        <button className="btn btn-primary" onClick={openCreate}>
          <i className="bi bi-plus-lg me-1" />Add product
        </button>
      </div>

      <div className="table-responsive re-product-card p-2">
        <table className="table align-middle mb-0">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Rent/mo</th>
              <th>Deposit</th>
              <th>Tenures</th>
              <th>Units</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td className="text-capitalize">{p.category} · {p.subCategory.replace(/_/g, ' ')}</td>
                <td>₹{p.baseMonthlyRent}</td>
                <td>₹{p.securityDeposit}</td>
                <td>{p.tenureOptions.join(', ')} mo</td>
                <td>{p.availableUnits}/{p.totalUnits}</td>
                <td>
                  <span className={`badge ${p.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                    {p.status}
                  </span>
                </td>
                <td className="text-end">
                  <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => openEdit(p)}>
                    Edit
                  </button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(p)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan="8" className="text-center text-secondary py-4">
                  No products yet. Add your first one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        title={editingId ? 'Edit product' : 'Add product'}
        footer={
          <>
            <button className="btn btn-light" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
              {saving ? 'Saving...' : 'Save product'}
            </button>
          </>
        }
      >
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Product name</label>
            <input name="name" className="form-control" value={form.name} onChange={handleChange} required />
          </div>
          <div className="row g-2 mb-3">
            <div className="col-6">
              <label className="form-label">Category</label>
              <select name="category" className="form-select" value={form.category} onChange={handleChange}>
                <option value="furniture">Furniture</option>
                <option value="appliance">Appliance</option>
              </select>
            </div>
            <div className="col-6">
              <label className="form-label">Type</label>
              <select name="subCategory" className="form-select" value={form.subCategory} onChange={handleChange}>
                {SUBCATEGORY_BY_CATEGORY[form.category].map((sc) => (
                  <option value={sc} key={sc}>{sc.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mb-3">
            <label className="form-label">Description</label>
            <textarea name="description" className="form-control" rows="2" value={form.description} onChange={handleChange} />
          </div>
          <div className="mb-3">
            <label className="form-label">Image URL</label>
            <input name="imageUrl" className="form-control" value={form.imageUrl} onChange={handleChange} placeholder="https://..." />
          </div>
          <div className="row g-2 mb-3">
            <div className="col-6">
              <label className="form-label">Base monthly rent (₹)</label>
              <input
                type="number" min="0" step="1" name="baseMonthlyRent" className="form-control"
                value={form.baseMonthlyRent} onChange={handleChange} required
              />
            </div>
            <div className="col-6">
              <label className="form-label">Security deposit (₹)</label>
              <input
                type="number" min="0" step="1" name="securityDeposit" className="form-control"
                value={form.securityDeposit} onChange={handleChange} required
              />
            </div>
          </div>
          <div className="mb-3">
            <label className="form-label">Tenure options (months)</label>
            <div className="d-flex flex-wrap gap-2">
              {TENURE_CHOICES.map((m) => (
                <button
                  type="button"
                  key={m}
                  className={`btn btn-sm ${form.tenureOptions.includes(m) ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => toggleTenure(m)}
                >
                  {m} mo
                </button>
              ))}
            </div>
          </div>
          <div className="row g-2">
            <div className="col-6">
              <label className="form-label">Total units</label>
              <input
                type="number" min="0" name="totalUnits" className="form-control"
                value={form.totalUnits} onChange={handleChange}
              />
            </div>
            <div className="col-6">
              <label className="form-label">Status</label>
              <select name="status" className="form-select" value={form.status} onChange={handleChange}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
