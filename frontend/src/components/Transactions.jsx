import { useEffect, useState } from "react";
import { api, errText } from "../api.js";
import { CATEGORIES, money } from "../constants.js";

const today = () => new Date().toISOString().slice(0, 10);
const blank = () => ({ type: "expense", amount: "", category: "Food", description: "", date: today() });
const field = "rounded-lg border border-emerald-900/20 bg-white px-3 py-2";

export default function Transactions({ month, onChange }) {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(blank());
  const [editId, setEditId] = useState(null);
  const [filters, setFilters] = useState({ search: "", type: "", category: "" });
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);

  // Search + filters (small delay so we don't call the API on every keystroke)
  useEffect(() => {
    const params = new URLSearchParams({ month });
    Object.entries(filters).forEach(([k, v]) => v && params.set(k, v));
    const t = setTimeout(() => api(`/transactions/?${params}`).then(setItems), 250);
    return () => clearTimeout(t);
  }, [month, filters, reload]);

  const refresh = () => { setReload((r) => r + 1); onChange(); };

  const save = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (editId) await api(`/transactions/${editId}/`, { method: "PUT", body: form });
      else await api("/transactions/", { method: "POST", body: form });
      setForm(blank());
      setEditId(null);
      refresh();
    } catch (err) {
      setError(errText(err));
    }
  };

  const edit = (t) => {
    setEditId(t.id);
    setForm({ type: t.type, amount: t.amount, category: t.category, description: t.description, date: t.date });
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this transaction?")) return;
    await api(`/transactions/${id}/`, { method: "DELETE" });
    refresh();
  };

  return (
    <section className="space-y-5">
      <h2 className="font-semibold">Transactions</h2>

      <div className="grid sm:grid-cols-3 gap-3">
        <input className={field} placeholder="Search description or category" aria-label="Search"
          value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
        <select className={field} aria-label="Filter by type" value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
          <option value="">All types</option><option value="income">Income</option><option value="expense">Expense</option>
        </select>
        <select className={field} aria-label="Filter by category" value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
          <option value="">All categories</option>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-emerald-900/70">Nothing found for this month. Add a transaction below.</p>
      ) : (
        <ul className="divide-y divide-emerald-900/10 bg-white rounded-xl border border-emerald-900/10">
          {items.map((t) => (
            <li key={t.id} className="slide-in flex items-center justify-between gap-3 p-3 hover:bg-emerald-50 transition">
              <div className="min-w-0">
                <p className="font-medium truncate">{t.description || t.category}</p>
                <p className="text-xs text-emerald-900/70">{t.category} · {t.date}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className={`font-semibold ${t.type === "income" ? "text-[#0f6b4f]" : "text-orange-700"}`}>
                  {t.type === "income" ? "+" : "−"}{money(t.amount)}
                </span>
                <button onClick={() => edit(t)} className="text-sm underline">Edit</button>
                <button onClick={() => remove(t.id)} className="text-sm underline text-red-700">Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={save} className="grid sm:grid-cols-6 gap-3 bg-white rounded-xl p-4 border border-emerald-900/10">
        <h3 className="sm:col-span-6 font-medium">{editId ? "Edit transaction" : "Add a transaction"}</h3>
        <select className={field} aria-label="Type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
          <option value="expense">Expense</option><option value="income">Income</option>
        </select>
        <input className={field} type="number" min="0.01" step="0.01" required placeholder="Amount" aria-label="Amount"
          value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
        <select className={field} aria-label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <input className={`${field} sm:col-span-2`} maxLength={200} placeholder="Description (optional)" aria-label="Description"
          value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <input className={field} type="date" required aria-label="Date" value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })} />
        {error && <p role="alert" className="sm:col-span-6 text-sm text-red-700">{error}</p>}
        <div className="sm:col-span-6 flex gap-3">
          <button className="rounded-lg bg-[#0f6b4f] text-white px-5 py-2 hover:bg-[#0b5740] active:scale-[.98] transition">
            {editId ? "Save changes" : "Add transaction"}
          </button>
          {editId && (
            <button type="button" className="rounded-lg border border-emerald-900/30 px-5 py-2"
              onClick={() => { setEditId(null); setForm(blank()); }}>Cancel</button>
          )}
        </div>
      </form>
    </section>
  );
}
