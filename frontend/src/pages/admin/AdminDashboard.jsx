import { useEffect, useState } from 'react';
import api from '../../api/axios';
import Loader from '../../components/common/Loader';

export default function AdminDashboard() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/reports').then((res) => setReport(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader label="Crunching the numbers..." />;
  if (!report) return <p className="text-danger">Could not load reports.</p>;

  const cards = [
    { label: 'Active rentals', value: report.activeRentalsCount, icon: 'bi-receipt' },
    { label: 'Monthly recurring revenue', value: `₹${report.monthlyRecurringRevenue}`, icon: 'bi-graph-up-arrow' },
    { label: 'Product utilization rate', value: `${report.productUtilizationRate}%`, icon: 'bi-pie-chart' },
    { label: 'Customer retention rate', value: `${report.customerRetentionRate}%`, icon: 'bi-people' },
    { label: 'Avg. maintenance resolution', value: `${report.avgMaintenanceResolutionHours} hrs`, icon: 'bi-clock-history' },
    { label: 'Open maintenance requests', value: report.openMaintenanceCount, icon: 'bi-exclamation-circle' },
    { label: 'Total customers', value: report.totalUsers, icon: 'bi-person-circle' },
    { label: 'Catalog products', value: report.totalProducts, icon: 'bi-box-seam' },
  ];

  return (
    <div>
      <h3 className="mb-1">Dashboard overview</h3>
      <p className="text-secondary mb-4">Key metrics across the rental platform.</p>

      <div className="row g-3 mb-4">
        {cards.map((c) => (
          <div className="col-12 col-sm-6 col-lg-3" key={c.label}>
            <div className="re-kpi-card">
              <i className={`bi ${c.icon} mb-2 d-block`} style={{ fontSize: '1.3rem', color: 'var(--re-accent)' }} />
              <div className="re-kpi-value">{c.value}</div>
              <div className="re-kpi-label">{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="re-product-card p-4">
        <h6 className="mb-3">Inventory snapshot</h6>
        <div className="row g-3 text-center">
          <div className="col-4">
            <div className="re-kpi-value">{report.totalUnits}</div>
            <div className="re-kpi-label">Total units</div>
          </div>
          <div className="col-4">
            <div className="re-kpi-value">{report.rentedUnits}</div>
            <div className="re-kpi-label">Currently rented</div>
          </div>
          <div className="col-4">
            <div className="re-kpi-value">{report.availableUnits}</div>
            <div className="re-kpi-label">Available</div>
          </div>
        </div>
      </div>
    </div>
  );
}
