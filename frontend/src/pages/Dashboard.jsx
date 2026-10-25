
import { useEffect, useState } from "react";
import {
  Package,
  AlertTriangle,
  XCircle,
  Boxes,
  RefreshCw,
} from "lucide-react";
import api from "../services/api";

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/api/dashboard");

        // Support common API response formats.
        const data = response.data?.data ?? response.data;
        setStats(data);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load dashboard statistics."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return <div className="dashboard-message">Loading dashboard...</div>;
  }

  if (error) {
    return (
      <div className="dashboard-message">
        <p className="error-message">{error}</p>
        <button
          className="retry-button"
          onClick={() => window.location.reload()}
        >
          <RefreshCw size={16} /> Retry
        </button>
      </div>
    );
  }

  const cards = [
    {
      title: "Total Products",
      value: stats?.totalProducts ?? stats?.productCount ?? 0,
      icon: Package,
      color: "blue",
    },
    {
      title: "Low Stock",
      value: stats?.lowStockProducts ?? stats?.lowStockCount ?? 0,
      icon: AlertTriangle,
      color: "orange",
    },
    {
      title: "Out of Stock",
      value: stats?.outOfStockProducts ?? stats?.outOfStockCount ?? 0,
      icon: XCircle,
      color: "red",
    },
    {
      title: "Total Units",
      value: stats?.totalUnits ?? stats?.totalStock ?? 0,
      icon: Boxes,
      color: "green",
    },
  ];

  return (
    <section className="dashboard-page">
      <header className="page-header">
        <div>
          <p className="page-eyebrow">OVERVIEW</p>
          <h1>Dashboard</h1>
          <p className="page-description">
            Monitor your store inventory at a glance.
          </p>
        </div>

        <button
          className="retry-button"
          onClick={() => window.location.reload()}
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </header>

      <div className="stats-grid">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <article className="stat-card" key={card.title}>
              <div className={`stat-icon ${card.color}`}>
                <Icon size={22} />
              </div>

              <div>
                <p className="stat-title">{card.title}</p>
                <h2 className="stat-value">
                  {Number(card.value).toLocaleString()}
                </h2>
              </div>
            </article>
          );
        })}
      </div>

      <section className="dashboard-welcome">
        <div>
          <h2>Your inventory, in one place</h2>
          <p>
            Use Products to add items, update quantities, and
            keep track of your store stock.
          </p>
        </div>
        <Package size={38} />
      </section>
    </section>
  );
}

export default Dashboard;
