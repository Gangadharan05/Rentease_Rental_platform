import { Link } from 'react-router-dom';

export default function ProductCard({ product }) {
  const cheapestTenure = product.tenurePricing?.length
    ? [...product.tenurePricing].sort((a, b) => a.monthlyRent - b.monthlyRent)[0]
    : null;
  const inStock = product.availableUnits > 0;

  return (
    <div className="col-12 col-sm-6 col-md-4 col-lg-3">
      <Link to={`/products/${product.id}`} className="text-decoration-none text-reset">
        <div className="re-product-card">
          <img src={product.imageUrl} alt={product.name} loading="lazy" />
          <div className="card-body p-3">
            <div className="d-flex justify-content-between align-items-start mb-1">
              <span className="text-uppercase text-secondary small fw-semibold">
                {product.subCategory.replace(/_/g, ' ')}
              </span>
              <span
                className={`re-stock-pill ${inStock ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}
              >
                {inStock ? `${product.availableUnits} left` : 'Out of stock'}
              </span>
            </div>
            <h6 className="mb-2">{product.name}</h6>
            <div className="mt-auto">
              {cheapestTenure && (
                <div className="re-price-sub mb-1">From</div>
              )}
              {cheapestTenure && (
                <div>
                  <span className="re-price">₹{cheapestTenure.monthlyRent}</span>
                  <span className="re-price-sub">/mo</span>
                </div>
              )}
              <div className="re-price-sub">Deposit ₹{product.securityDeposit}</div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
