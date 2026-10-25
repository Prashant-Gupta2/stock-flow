
import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Package,
  X,
  Pencil,
  Trash2,
  RefreshCw,
} from "lucide-react";
import api from "../services/api";

const EMPTY_FORM = {
  name: "",
  sku: "",
  description: "",
  quantity: "0",
  costPrice: "",
  sellingPrice: "",
  lowStockThreshold: "5",
};

function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ ...EMPTY_FORM });

  // Fetch products from the backend.
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/api/products");
      const data = response.data?.data ?? response.data;

      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.products)
        ? data.products
        : [];

      setProducts(list);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load products. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Search by product name, SKU, or description.
  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return products;

    return products.filter((product) =>
      [product.name, product.sku, product.description]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(term)
        )
    );
  }, [products, search]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const openAddForm = () => {
    setError("");
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setShowForm(true);
  };

  const handleEdit = (product) => {
    setError("");

    setForm({
      name: product.name || "",
      sku: product.sku || "",
      description: product.description || "",
      quantity: String(product.quantity ?? 0),
      costPrice:
        product.costPrice == null ? "" : String(product.costPrice),
      sellingPrice:
        product.sellingPrice == null
          ? ""
          : String(product.sellingPrice),
      lowStockThreshold:
        product.lowStockThreshold == null
          ? "5"
          : String(product.lowStockThreshold),
    });

    setEditingId(product.id);
    setShowForm(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.name.trim() || !form.sku.trim()) {
      setError("Product name and SKU are required.");
      return;
    }

    const quantity = Number(form.quantity);
    const threshold =
      form.lowStockThreshold === ""
        ? null
        : Number(form.lowStockThreshold);

    const costPrice =
      form.costPrice === "" ? null : Number(form.costPrice);

    const sellingPrice =
      form.sellingPrice === ""
        ? null
        : Number(form.sellingPrice);

    if (
      form.quantity === "" ||
      !Number.isInteger(quantity) ||
      quantity < 0
    ) {
      setError("Quantity must be a non-negative whole number.");
      return;
    }

    if (
      threshold !== null &&
      (!Number.isInteger(threshold) || threshold < 0)
    ) {
      setError("Low-stock threshold must be a non-negative whole number.");
      return;
    }

    if (
      [costPrice, sellingPrice].some(
        (value) =>
          value !== null &&
          (!Number.isFinite(value) || value < 0)
      )
    ) {
      setError("Prices must be valid non-negative numbers.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      sku: form.sku.trim(),
      description: form.description.trim() || null,
      quantity,
      costPrice,
      sellingPrice,
      lowStockThreshold: threshold,
    };

    try {
      setSaving(true);

      if (editingId !== null) {
        await api.put(`/api/products/${editingId}`, payload);
      } else {
        await api.post("/api/products", payload);
      }

      setShowForm(false);
      setEditingId(null);
      setForm({ ...EMPTY_FORM });

      await fetchProducts();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          `Failed to ${editingId !== null ? "update" : "add"} product.`
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (product) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.name}"?`
    );

    if (!confirmed) return;

    try {
      setError("");
      setDeletingId(product.id);

      await api.delete(`/api/products/${product.id}`);

      setProducts((previous) =>
        previous.filter((item) => item.id !== product.id)
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to delete product. Please try again."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const formatCurrency = (value) => {
    if (value == null || value === "") return "—";

    return Number(value).toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    });
  };

  const getStockStatus = (product) => {
    const quantity = Number(product.quantity ?? 0);
    const threshold = Number(product.lowStockThreshold ?? 5);

    if (quantity === 0) {
      return { label: "Out of stock", className: "out" };
    }

    if (quantity <= threshold) {
      return { label: "Low stock", className: "low" };
    }

    return { label: "In stock", className: "in" };
  };

  return (
    <section className="products-page">
      <header className="page-header">
        <div>
          <p className="page-eyebrow">INVENTORY</p>
          <h1>Products</h1>
          <p className="page-description">
            Manage your store products and stock levels.
          </p>
        </div>

        <button
          type="button"
          className="add-product-button"
          onClick={openAddForm}
        >
          <Plus size={18} />
          Add Product
        </button>
      </header>

      {error && (
        <div className="products-error" role="alert">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError("")}
            aria-label="Dismiss error"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {showForm && (
        <section className="product-form-card">
          <div className="form-card-header">
            <div>
              <h2>
                {editingId !== null ? "Edit Product" : "Add New Product"}
              </h2>
              <p className="form-subtitle">
                Enter the product details below.
              </p>
            </div>

            <button
              type="button"
              className="icon-button"
              aria-label="Close form"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
                setForm({ ...EMPTY_FORM });
                setError("");
              }}
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="product-form-grid">
              <label>
                Product Name *
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Wireless Mouse"
                  maxLength={150}
                  required
                />
              </label>

              <label>
                SKU *
                <input
                  name="sku"
                  value={form.sku}
                  onChange={handleChange}
                  placeholder="e.g. WM-001"
                  maxLength={100}
                  required
                />
              </label>

              <label className="full-width-field">
                Description
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe your product"
                  rows={3}
                />
              </label>

              <label>
                Quantity *
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
                Low Stock Threshold
                <input
                  name="lowStockThreshold"
                  type="number"
                  min="0"
                  step="1"
                  value={form.lowStockThreshold}
                  onChange={handleChange}
                />
              </label>

              <label>
                Cost Price (₹)
                <input
                  name="costPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.costPrice}
                  onChange={handleChange}
                  placeholder="0.00"
                />
              </label>

              <label>
                Selling Price (₹)
                <input
                  name="sellingPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.sellingPrice}
                  onChange={handleChange}
                  placeholder="0.00"
                />
              </label>
            </div>

            <div className="product-form-actions">
              <button
                type="button"
                className="cancel-button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setForm({ ...EMPTY_FORM });
                  setError("");
                }}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="add-product-button"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingId !== null
                  ? "Update Product"
                  : "Save Product"}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="products-table-card">
        <div className="products-toolbar">
          <div>
            <h2>All Products</h2>
            <p className="products-count">
              {products.length} product{products.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="search-box">
            <Search size={18} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, SKU, description..."
              aria-label="Search products"
            />
          </div>
        </div>

        {loading ? (
          <div className="table-message">
            <RefreshCw size={20} />
            <p>Loading products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="empty-products">
            <Package size={38} />
            <h3>
              {search ? "No matching products" : "No products yet"}
            </h3>
            <p>
              {search
                ? "Try another search term."
                : "Add your first product to start tracking inventory."}
            </p>
          </div>
        ) : (
          <div className="table-scroll">
            <table className="products-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Quantity</th>
                  <th>Cost Price</th>
                  <th>Selling Price</th>
                  <th>Stock Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredProducts.map((product) => {
                  const status = getStockStatus(product);

                  return (
                    <tr key={product.id}>
                      <td>
                        <div className="product-name">
                          {product.name}
                        </div>
                        {product.description && (
                          <div className="product-description">
                            {product.description}
                          </div>
                        )}
                      </td>

                      <td>{product.sku}</td>
                      <td>{Number(product.quantity ?? 0)}</td>
                      <td>{formatCurrency(product.costPrice)}</td>
                      <td>{formatCurrency(product.sellingPrice)}</td>

                      <td>
                        <span className={`stock-badge ${status.className}`}>
                          {status.label}
                        </span>
                      </td>

                      <td>
                        <div className="product-actions">
                          <button
                            type="button"
                            className="edit-button"
                            onClick={() => handleEdit(product)}
                            aria-label={`Edit ${product.name}`}
                            title="Edit product"
                          >
                            <Pencil size={15} />
                            Edit
                          </button>

                          <button
                            type="button"
                            className="delete-button"
                            onClick={() => handleDelete(product)}
                            disabled={deletingId === product.id}
                            aria-label={`Delete ${product.name}`}
                            title="Delete product"
                          >
                            <Trash2 size={15} />
                            {deletingId === product.id
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  );
}

export default Products;
