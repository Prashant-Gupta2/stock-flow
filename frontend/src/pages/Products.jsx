
import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Package, X } from "lucide-react";
import api from "../services/api";

function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    sku: "",
    quantity: "",
    price: "",
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/api/products");
      const data = response.data?.data ?? response.data;

      setProducts(Array.isArray(data) ? data : data.products ?? []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load products."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();

    return products.filter((product) =>
      [product.name, product.sku]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term))
    );
  }, [products, search]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (
      !form.name.trim() ||
      !form.sku.trim() ||
      form.quantity === "" ||
      form.price === ""
    ) {
      setError("Please fill in all fields.");
      return;
    }

    if (
      !Number.isInteger(Number(form.quantity)) ||
      Number(form.quantity) < 0 ||
      !Number.isFinite(Number(form.price)) ||
      Number(form.price) < 0
    ) {
      setError("Enter a valid quantity and price.");
      return;
    }

    try {
      setSaving(true);

      await api.post("/api/products", {
        name: form.name.trim(),
        sku: form.sku.trim(),
        quantity: Number(form.quantity),
        price: Number(form.price),
      });

      setForm({ name: "", sku: "", quantity: "", price: "" });
      setShowForm(false);
      await fetchProducts();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to add product."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="products-page">
      <header className="page-header">
        <div>
          <p className="page-eyebrow">INVENTORY</p>
          <h1>Products</h1>
          <p className="page-description">
            Manage the products in your store.
          </p>
        </div>

        <button
          className="add-product-button"
          onClick={() => {
            setError("");
            setShowForm(true);
          }}
        >
          <Plus size={18} />
          Add Product
        </button>
      </header>

      {error && <p className="error-message">{error}</p>}

      {showForm && (
        <div className="product-form-card">
          <div className="form-card-header">
            <h2>Add New Product</h2>
            <button
              type="button"
              className="icon-button"
              aria-label="Close form"
              onClick={() => setShowForm(false)}
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="product-form-grid">
              <label>
                Product Name
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Wireless Mouse"
                  required
                />
              </label>

              <label>
                SKU
                <input
                  name="sku"
                  value={form.sku}
                  onChange={handleChange}
                  placeholder="e.g. WM-001"
                  required
                />
              </label>

              <label>
                Quantity
                <input
                  name="quantity"
                  type="number"
                  min="0"
                  step="1"
                  value={form.quantity}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Price
                <input
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={handleChange}
                  required
                />
              </label>
            </div>

            <button
              className="add-product-button"
              type="submit"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Product"}
            </button>
          </form>
        </div>
      )}

      <div className="products-table-card">
        <div className="products-toolbar">
          <h2>All Products</h2>

          <div className="search-box">
            <Search size={18} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name or SKU..."
              aria-label="Search products"
            />
          </div>
        </div>

        {loading ? (
          <p className="table-message">Loading products...</p>
        ) : filteredProducts.length === 0 ? (
          <div className="empty-products">
            <Package size={36} />
            <h3>No products found</h3>
            <p>Add a product or try a different search.</p>
          </div>
        ) : (
          <div className="table-scroll">
            <table className="products-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Stock Status</th>
                </tr>
              </thead>

              <tbody>
                {filteredProducts.map((product) => {
                  const quantity = Number(product.quantity ?? 0);

                  const status =
                    quantity === 0
                      ? "Out of stock"
                      : quantity <= 5
                      ? "Low stock"
                      : "In stock";

                  return (
                    <tr key={product.id}>
                      <td className="product-name">
                        {product.name}
                      </td>
                      <td>{product.sku || "—"}</td>
                      <td>{quantity}</td>
                      <td>
                        {Number(product.price ?? 0).toLocaleString(
                          "en-IN",
                          {
                            style: "currency",
                            currency: "INR",
                          }
                        )}
                      </td>
                      <td>
                        <span
                          className={`stock-badge ${
                            quantity === 0
                              ? "out"
                              : quantity <= 5
                              ? "low"
                              : "in"
                          }`}
                        >
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

export default Products;
