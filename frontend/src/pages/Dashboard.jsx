
import { useCallback, useEffect, useState } from "react";
import {
  Package,
  AlertTriangle,
  XCircle,
  Boxes,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import api from "../services/api";

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/api/dashboard");
      const responseData = response.data?.data ?? response.data;
      const summary = responseData?.summary ?? responseData ?? {};

      setStats({
        ...summary,
        lowStockProducts:
          summary.lowStockProducts ??
          summary.lowStockCount ??
          responseData?.lowStockItems?.length ??
          0,
      });
    } catch (err) {
      console.error("Dashboard API error:", err);
      console.error("Backend response:", err.response?.data);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load dashboard statistics."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

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

  const chartData = cards.map((card) => ({
    name: card.title,
    value: Number(card.value) || 0,
    color: {
      blue: "#4f46e5",
      orange: "#f59e0b",
      red: "#ef4444",
      green: "#10b981",
    }[card.color],
  }));

  if (loading) {
    return (
      <div className="dashboard-message">
        <RefreshCw className="loading-icon" size={24} />
        <p>Loading your inventory dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-message">
        <p className="error-message">{error}</p>
        <button
          className="retry-button"
          type="button"
          onClick={fetchDashboard}
        >
          <RefreshCw size={16} />
          Retry
        </button>
      </div>
    );
  }

  return (
    <section className="dashboard-page">
      <header className="page-header">
        <div>
          <p className="page-eyebrow">STOCKFLOW ANALYTICS</p>
          <h1>Dashboard</h1>
          <p className="page-description">
            Monitor your store inventory at a glance.
          </p>
        </div>

        <button
          className="retry-button"
          type="button"
          onClick={fetchDashboard}
          disabled={loading}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </header>

      <div className="stats-grid">
        {cards.map((card) => {
          const Icon = card.icon;
          const value = Number(card.value);

          return (
            <article
              className={`stat-card ${card.color}`}
              key={card.title}
            >
              <div className={`stat-icon ${card.color}`}>
                <Icon size={23} />
              </div>

              <div className="stat-info">
                <p className="stat-title">{card.title}</p>
                <h2 className="stat-value">
                  {Number.isFinite(value)
                    ? value.toLocaleString()
                    : "—"}
                </h2>
                <span className="stat-caption">
                  Current inventory
                </span>
              </div>
            </article>
          );
        })}
      </div>

      <section className="chart-card">
        <div className="chart-header">
          <div className="chart-heading-icon">
            <TrendingUp size={21} />
          </div>
          <div>
            <h2>Inventory Overview</h2>
            <p>Compare your current inventory statistics</p>
          </div>
        </div>

        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 15, right: 12, left: -15, bottom: 5 }}
              barCategoryGap="30%"
            >
              <CartesianGrid
                strokeDasharray="4 4"
                vertical={false}
                stroke="#e9edf5"
              />

              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 12 }}
                interval={0}
              />

              <YAxis
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 12 }}
              />

              <Tooltip
                cursor={{ fill: "#f1f5f9", radius: 8 }}
                contentStyle={{
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
                  padding: "12px 16px",
                }}
                formatter={(value) => [
                  Number(value).toLocaleString(),
                  "Count",
                ]}
              />

              <Bar
                dataKey="value"
                name="Inventory"
                radius={[7, 7, 0, 0]}
                maxBarSize={64}
                isAnimationActive
              >
                {chartData.map((item) => (
                  <rect key={item.name} fill={item.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="dashboard-welcome">
        <div className="welcome-icon">
          <Package size={28} />
        </div>
        <div>
          <h2>Your inventory, in one place</h2>
          <p>
            Manage products, update stock quantities, and identify
            items that need restocking.
          </p>
        </div>
      </section>
    </section>
  );
}

export default Dashboard;
