
import { useEffect, useState } from "react";
import { Settings as SettingsIcon, Save, RefreshCw } from "lucide-react";
import api from "../services/api";

const INITIAL_SETTINGS = {
  organizationName: "",
  email: "",
  lowStockThreshold: 5,
};

function Settings() {
  const [form, setForm] = useState({ ...INITIAL_SETTINGS });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/api/settings");
        const data = response.data?.data ?? response.data;

        setForm({
          organizationName: data.organizationName ?? data.name ?? "",
          email: response.data.settings.email ?? "",
          lowStockThreshold: String(data.lowStockThreshold ?? 5),
        });
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Could not load settings. Check your backend endpoint."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setSuccess("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const threshold = Number(form.lowStockThreshold);

    if (!form.organizationName.trim()) {
      setError("Store name is required.");
      return;
    }

    if (!Number.isInteger(threshold) || threshold < 0) {
      setError("Low-stock threshold must be a non-negative whole number.");
      return;
    }

    try {
      setSaving(true);

      await api.put("/api/settings", {
        organizationName: form.organizationName.trim(),
        lowStockThreshold: threshold,
      });

      setSuccess("Settings saved successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not save settings. Verify your backend route and fields."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="settings-message">
        <RefreshCw size={20} />
        Loading settings...
      </div>
    );
  }

  return (
    <section className="settings-page">
      <header className="page-header">
        <div>
          <p className="page-eyebrow">WORKSPACE</p>
          <h1>Organization Settings</h1>
          <p className="page-description">
            Manage your store details and inventory preferences.
          </p>
        </div>
      </header>

      {error && (
        <div className="settings-alert error" role="alert">
          {error}
        </div>
      )}

      {success && (
        <div className="settings-alert success" role="status">
          {success}
        </div>
      )}

      <form className="settings-card" onSubmit={handleSubmit}>
        <div className="settings-card-heading">
          <div className="settings-heading-icon">
            <SettingsIcon size={21} />
          </div>
          <div>
            <h2>Store Information</h2>
            <p>Update your organization details.</p>
          </div>
        </div>

        <div className="settings-fields">
          <label>
            Store / Organization Name
            <input
              name="organizationName"
              value={form.organizationName}
              onChange={handleChange}
              placeholder="Enter your store name"
              maxLength={150}
              required
            />
          </label>

          <label>
            Account Email
            <input
              type="email"
              value={form.email}
              readOnly
              aria-describedby="email-note"
            />
            <span id="email-note" className="settings-help">
              Your account email is read-only on this page.
            </span>
          </label>

          <label>
            Default Low-Stock Threshold
            <input
              type="number"
              name="lowStockThreshold"
              min="0"
              step="1"
              value={form.lowStockThreshold}
              onChange={handleChange}
              required
            />
            <span className="settings-help">
              Used as the default threshold for inventory alerts.
            </span>
          </label>
        </div>

        <div className="settings-footer">
          <button
            type="submit"
            className="add-product-button"
            disabled={saving}
          >
            <Save size={17} />
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </form>
    </section>
  );
}

export default Settings;
