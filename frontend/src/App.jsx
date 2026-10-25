
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./components/DasgboardLayout";

function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome to your StockFlow workspace.</p>
    </div>
  );
}

function Products() {
  return (
    <div>
      <h1>Products</h1>
      <p>Manage your store inventory here.</p>
    </div>
  );
}

function SettingsPage() {
  return (
    <div>
      <h1>Organization Settings</h1>
      <p>Manage your store information here.</p>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Navigate to="/dashboard" replace />}
        />

        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route
              path="/dashboard"
              element={<Dashboard />}
            />
            <Route
              path="/products"
              element={<Products />}
            />
            <Route
              path="/settings"
              element={<SettingsPage />}
            />
          </Route>
        </Route>

        <Route
          path="*"
          element={<Navigate to="/dashboard" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
