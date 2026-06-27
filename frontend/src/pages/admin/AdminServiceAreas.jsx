import { useEffect, useState } from 'react';
import api from '../../api/axios';
import Loader from '../../components/common/Loader';

export default function AdminServiceAreas() {
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCity, setNewCity] = useState('');
  const [error, setError] = useState('');

  const fetchAreas = () => {
    setLoading(true);
    api.get('/service-areas/all').then((res) => setAreas(res.data)).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAreas();
  }, []);

  const addCity = async (e) => {
    e.preventDefault();
    if (!newCity.trim()) return;
    setError('');
    try {
      await api.post('/service-areas', { city: newCity.trim() });
      setNewCity('');
      fetchAreas();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not add this city.');
    }
  };

  const toggleActive = async (area) => {
    await api.put(`/service-areas/${area.id}`, { isActive: !area.isActive });
    fetchAreas();
  };

  const removeArea = async (area) => {
    if (!window.confirm(`Remove ${area.city} from service areas?`)) return;
    await api.delete(`/service-areas/${area.id}`);
    fetchAreas();
  };

  if (loading) return <Loader label="Loading service areas..." />;

  return (
    <div>
      <h3 className="mb-4">Service areas</h3>
      <p className="text-secondary">
        Customers can only schedule delivery to cities listed here. Deactivate a city to pause
        deliveries without deleting its history.
      </p>

      <form className="re-product-card p-3 mb-4 d-flex gap-2 flex-wrap" onSubmit={addCity}>
        <input
          className="form-control"
          style={{ maxWidth: 260 }}
          placeholder="Add a new city, e.g. Kochi"
          value={newCity}
          onChange={(e) => setNewCity(e.target.value)}
        />
        <button className="btn btn-primary" type="submit">
          <i className="bi bi-plus-lg me-1" />Add city
        </button>
      </form>
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="table-responsive re-product-card p-2">
        <table className="table align-middle mb-0">
          <thead>
            <tr>
              <th>City</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {areas.map((a) => (
              <tr key={a.id}>
                <td>{a.city}</td>
                <td>
                  <span className={`badge ${a.isActive ? 'bg-success' : 'bg-secondary'}`}>
                    {a.isActive ? 'Active' : 'Paused'}
                  </span>
                </td>
                <td className="text-end">
                  <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => toggleActive(a)}>
                    {a.isActive ? 'Pause' : 'Activate'}
                  </button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => removeArea(a)}>
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
