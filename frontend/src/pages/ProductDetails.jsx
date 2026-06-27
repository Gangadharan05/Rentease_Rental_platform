import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import Loader from '../components/common/Loader';
import { useCart } from '../context/CartContext';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTenure, setSelectedTenure] = useState(null);
  const [error, setError] = useState('');
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/products/${id}`)
      .then((res) => {
        setProduct(res.data);
        if (res.data.tenurePricing?.length) {
          setSelectedTenure(res.data.tenurePricing[0].months);
        }
      })
      .catch(() => setError('This product could not be found.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loader label="Loading product..." />;
  if (error || !product) {
    return (
      <div className="container py-5 text-center">
        <p className="text-danger">{error || 'Product not found.'}</p>
        <Link to="/products" className="btn btn-primary">Back to catalog</Link>
      </div>
    );
  }

  const selectedPricing = product.tenurePricing.find((t) => t.months === selectedTenure);
  const inStock = product.availableUnits > 0;

  const handleAddToCart = () => {
    addItem(product, selectedTenure);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="container py-4">
      <nav className="small text-secondary mb-3">
        <Link to="/products" className="text-secondary">Catalog</Link> /{' '}
        <Link to={`/products?category=${product.category}`} className="text-secondary text-capitalize">
          {product.category}
        </Link>{' '}
        / <span className="text-dark">{product.name}</span>
      </nav>

      <div className="row g-4">
        <div className="col-12 col-md-6">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="img-fluid rounded-4 w-100"
            style={{ maxHeight: 420, objectFit: 'cover' }}
          />
        </div>

        <div className="col-12 col-md-6">
          <span className="text-uppercase text-secondary small fw-semibold">
            {product.subCategory.replace(/_/g, ' ')}
          </span>
          <h2 className="mb-2">{product.name}</h2>
          <span className={`re-stock-pill ${inStock ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>
            {inStock ? `${product.availableUnits} units available` : 'Out of stock'}
          </span>
          <p className="text-secondary mt-3">{product.description}</p>

          <div className="re-product-card p-3 mb-3">
            <h6 className="mb-3">Choose a rental tenure</h6>
            <div className="d-flex flex-wrap gap-2 mb-3">
              {product.tenurePricing.map((t) => (
                <button
                  key={t.months}
                  className={`btn btn-sm ${selectedTenure === t.months ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setSelectedTenure(t.months)}
                >
                  {t.months} months
                </button>
              ))}
            </div>

            {selectedPricing && (
              <div className="row g-2">
                <div className="col-6">
                  <div className="text-secondary small">Monthly rent</div>
                  <div className="re-price">₹{selectedPricing.monthlyRent}</div>
                </div>
                <div className="col-6">
                  <div className="text-secondary small">Security deposit</div>
                  <div className="re-price">₹{product.securityDeposit}</div>
                </div>
                <div className="col-12">
                  <div className="text-secondary small">Due at checkout (1st month + deposit)</div>
                  <div className="fw-semibold">
                    ₹{(parseFloat(selectedPricing.monthlyRent) + parseFloat(product.securityDeposit)).toFixed(2)}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="d-flex flex-wrap gap-2">
            <button className="btn   btn-accent btn-lg flex-fill" disabled={!inStock} onClick={handleAddToCart}>
              <i className="bi bi-cart-plus me-1" />
              {added ? 'Added to cart!' : 'Add to cart'} 
            </button>
            <button
              className="btn btn-outline-primary  btn-lg flex-fill"
              disabled={!inStock}
              onClick={() => {
                addItem(product, selectedTenure);
                navigate('/cart');
              }}
            >
              Rent now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
