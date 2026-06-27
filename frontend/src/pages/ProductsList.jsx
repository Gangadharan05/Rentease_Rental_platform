import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import ProductCard from '../components/products/ProductCard';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';

const SUBCATEGORIES = {
  furniture: ['bed', 'sofa', 'table'],
  appliance: ['fridge', 'washing_machine', 'tv'],
};

export default function ProductsList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');

  const category = searchParams.get('category') || '';
  const subCategory = searchParams.get('subCategory') || '';

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (category) params.category = category;
    if (subCategory) params.subCategory = subCategory;
    if (searchParams.get('search')) params.search = searchParams.get('search');

    api
      .get('/products', { params })
      .then((res) => setProducts(res.data))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [category, subCategory, searchParams]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key === 'category') next.delete('subCategory');
    setSearchParams(next);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateParam('search', search);
  };

  return (
    <div className="container py-4">
      <div className="row g-4">
        <aside className="col-12 col-lg-3">
          <div className="re-product-card p-3">
            <h6 className="mb-3">Search</h6>
            <form onSubmit={handleSearchSubmit} className="mb-4">
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search products"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <button className="btn btn-primary" type="submit">
                  <i className="bi bi-search" />
                </button>
              </div>
            </form>

            <h6 className="mb-2">Category</h6>
            <div className="d-flex flex-column gap-1 mb-4">
              {['', 'furniture', 'appliance'].map((c) => (
                <button
                  key={c || 'all'}
                  className={`btn btn-sm text-start ${category === c ? 'btn-primary' : 'btn-light'}`}
                  onClick={() => updateParam('category', c)}
                >
                  {c === '' ? 'All categories' : c.charAt(0).toUpperCase() + c.slice(1)}
                </button>
              ))}
            </div>

            {category && SUBCATEGORIES[category] && (
              <>
                <h6 className="mb-2">Type</h6>
                <div className="d-flex flex-column gap-1">
                  <button
                    className={`btn btn-sm text-start ${!subCategory ? 'btn-primary' : 'btn-light'}`}
                    onClick={() => updateParam('subCategory', '')}
                  >
                    All {category}
                  </button>
                  {SUBCATEGORIES[category].map((sc) => (
                    <button
                      key={sc}
                      className={`btn btn-sm text-start ${subCategory === sc ? 'btn-primary' : 'btn-light'}`}
                      onClick={() => updateParam('subCategory', sc)}
                    >
                      {sc.replace(/_/g, ' ')}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </aside>

        <div className="col-12 col-lg-9">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="mb-0">
              {category ? category.charAt(0).toUpperCase() + category.slice(1) : 'All products'}
            </h4>
            <span className="text-secondary small">{products.length} results</span>
          </div>

          {loading ? (
            <Loader label="Loading catalog..." />
          ) : products.length === 0 ? (
            <EmptyState
              icon="bi-search"
              title="No products found"
              message="Try a different category or search term."
            />
          ) : (
            <div className="row g-3">
              {products.map((p) => (
                <ProductCard product={p} key={p.id} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
