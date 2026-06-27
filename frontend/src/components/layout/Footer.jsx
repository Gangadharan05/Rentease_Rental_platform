export default function Footer() {
  return (
    <footer className="re-footer mt-auto py-4">
      <div className="container">
        <div className="row gy-3">
          <div className="col-12 col-md-5">
            <div className="d-flex align-items-center gap-2 fw-bold fs-5 text-white mb-2">
              <span className="re-brand-mark" aria-hidden="true" />
              RentEase
            </div>
            <p className="small mb-0 opacity-75">
              Rent furniture and appliances by the month. Move freely, live comfortably, and skip
              the upfront cost of ownership.
            </p>
          </div>
          <div className="col-6 col-md-3">
            <h6 className="text-white mb-2">Browse</h6>
            <ul className="list-unstyled small d-flex flex-column gap-1">
              <li><a href="/products?category=furniture">Furniture</a></li>
              <li><a href="/products?category=appliance">Appliances</a></li>
              <li><a href="/products">All products</a></li>
            </ul>
          </div>
          <div className="col-6 col-md-4">
            <h6 className="text-white mb-2">Support</h6>
            <ul className="list-unstyled small d-flex flex-column gap-1">
              <li><a href="/my-rentals">Manage rentals</a></li>
              <li><a href="/rental-history">Rental history</a></li>
            </ul>
          </div>
        </div>
        <hr className="border-light opacity-25 my-3" />
        <p className="small mb-0 opacity-75 text-center">
          &copy; {new Date().getFullYear()} RentEase. Built for renters who'd rather not buy.
        </p>
      </div>
    </footer>
  );
}
