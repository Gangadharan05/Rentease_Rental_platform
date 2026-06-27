import { Link } from 'react-router-dom';

export default function CategoryCard({ icon, label, category, subCategory }) {
  const params = new URLSearchParams();
  if (category) params.set('category', category);
  if (subCategory) params.set('subCategory', subCategory);

  return (
    <Link to={`/products?${params.toString()}`} className="text-decoration-none text-reset">
      <div className="re-category-card">
        <div className="re-category-icon">
          <i className={`bi ${icon}`} />
        </div>
        <div className="fw-semibold">{label}</div>
      </div>
    </Link>
  );
}
