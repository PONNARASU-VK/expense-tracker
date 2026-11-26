import { useEffect, useState } from "react";
import { api, errText } from "../api.js";
import { currentMonth, money } from "../constants.js";
import Transactions from "./Transactions.jsx";

export default function Dashboard({ onLogout }) {
  const [month, setMonth] = useState(currentMonth());
  const [summary, setSummary] = useState(null);
  const [budgetInput, setBudgetInput] = useState("");
  const [msg, setMsg] = useState("");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    api(`/summary/?month=${month}`).then((s) => {
      setSummary(s);
      setBudgetInput(s.budget || "");
    });
  }, [month, tick]);

  const saveBudget = async (e) => {
    e.preventDefault();
    try {
      await api("/budget/", { method: "PUT", body: { month, amount: budgetInput || 0 } });
      setMsg("Budget saved.");
      setTick((t) => t + 1);
    } catch (err) {
      setMsg(errText(err));
    }
  };

  const s = summary;
  const pct = s && s.budget > 0 ? Math.min(100, (s.expense / s.budget) * 100) : 0;
  const barColor = pct >= 100 ? "bg-red-600" : pct >= 80 ? "bg-amber-500" : "bg-[#0f6b4f]";
  const maxCat = s?.by_category?.[0]?.total || 1;

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8 rise">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Expense Tracker</h1>
        <div className="flex items-center gap-3">
          <input type="month" value={month} onChange={(e) => e.target.value && setMonth(e.target.value)}
            aria-label="Month" className="rounded-lg border border-emerald-900/20 bg-white px-3 py-2" />
          <button onClick={onLogout} className="rounded-lg border border-emerald-900/30 px-3 py-2 hover:bg-white transition">
            Log out
          </button>
        </div>
      </header>

      {s && (
        <>
          <section className="grid sm:grid-cols-3 gap-6">
            <div><p className="text-sm text-emerald-900/70">Income</p><p className="text-2xl font-bold text-[#0f6b4f]">{money(s.income)}</p></div>
            <div><p className="text-sm text-emerald-900/70">Expenses</p><p className="text-2xl font-bold text-orange-700">{money(s.expense)}</p></div>
            <div><p className="text-sm text-emerald-900/70">Balance</p><p className="text-2xl font-bold">{money(s.balance)}</p></div>
          </section>

          <section className="bg-white rounded-xl p-5 border border-emerald-900/10">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="font-semibold">Monthly budget</h2>
                <p className="text-sm text-emerald-900/70">
                  {s.budget > 0
                    ? `${money(s.expense)} of ${money(s.budget)} spent` + (s.expense > s.budget ? " — over budget" : ` — ${money(s.budget - s.expense)} left`)
                    : "No budget set for this month."}
                </p>
              </div>
              <form onSubmit={saveBudget} className="flex gap-2">
                <input type="number" min="0" step="0.01" value={budgetInput} placeholder="Amount"
                  aria-label="Budget amount" onChange={(e) => setBudgetInput(e.target.value)}
                  className="w-32 rounded-lg border border-emerald-900/20 px-3 py-2" />
                <button className="rounded-lg bg-[#0f6b4f] text-white px-4 py-2 hover:bg-[#0b5740] active:scale-[.98] transition">Save budget</button>
              </form>
            </div>
            <div className="mt-4 h-4 rounded-full bg-emerald-900/10 overflow-hidden">
              <div key={`${month}-${s.budget}-${s.expense}`} className={`h-full grow ${barColor}`} style={{ width: `${pct}%` }} />
            </div>
            {msg && <p role="status" className="text-sm mt-2">{msg}</p>}
          </section>

          <section>
            <h2 className="font-semibold mb-3">Spending by category</h2>
            {s.by_category.length === 0 ? (
              <p className="text-sm text-emerald-900/70">No expenses this month. Add one below to see the breakdown.</p>
            ) : (
              <ul className="space-y-3">
                {s.by_category.map((c) => (
                  <li key={c.category}>
                    <div className="flex justify-between text-sm"><span>{c.category}</span><span>{money(c.total)}</span></div>
                    <div className="h-2.5 rounded-full bg-emerald-900/10 overflow-hidden">
                      <div className="h-full bg-orange-700 grow" style={{ width: `${(c.total / maxCat) * 100}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}

      <Transactions month={month} onChange={() => setTick((t) => t + 1)} />
    </div>
  );
}
