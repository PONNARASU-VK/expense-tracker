import { useState } from "react";
import Auth from "./components/Auth.jsx";
import Dashboard from "./components/Dashboard.jsx";
import { api } from "./api.js";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));

  const logout = async () => {
    try { await api("/auth/logout/", { method: "POST" }); } catch { /* ignore */ }
    localStorage.removeItem("token");
    setToken(null);
  };

  return token ? <Dashboard onLogout={logout} /> : <Auth onLogin={setToken} />;
}
