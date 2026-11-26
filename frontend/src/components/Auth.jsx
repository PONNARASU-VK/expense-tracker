import { useState } from "react";
import { api, errText } from "../api.js";

export default function Auth({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const data = await api(`/auth/${mode}/`, { method: "POST", body: form });
      localStorage.setItem("token", data.token);
      onLogin(data.token);
    } catch (err) {
      setError(errText(err));
    } finally {
      setBusy(false);
    }
  };

  const input = "w-full rounded-lg border border-emerald-900/20 bg-white px-3 py-2.5";

  return (
    <main className="min-h-screen grid md:grid-cols-2">
      <section className="bg-[#12261f] text-[#eef2ee] p-8 md:p-14 flex flex-col justify-end rise">
        <p className="text-5xl md:text-7xl font-bold leading-none">₹ in.<br />₹ out.</p>
        <p className="mt-6 max-w-sm text-emerald-100/80">
          Log every rupee, set a monthly budget, and see where your money goes.
        </p>
      </section>

      <section className="flex items-center justify-center p-8">
        <form onSubmit={submit} className="w-full max-w-sm space-y-4 rise" style={{ animationDelay: ".15s" }}>
          <h1 className="text-2xl font-bold">{mode === "login" ? "Log in" : "Create your account"}</h1>
          <div>
            <label className="text-sm font-medium" htmlFor="u">Username</label>
            <input id="u" className={input} required minLength={3} autoComplete="username"
              value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
          </div>
          <div>
            <label className="text-sm font-medium" htmlFor="p">Password</label>
            <input id="p" type="password" className={input} required minLength={8}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
          {error && <p role="alert" className="rounded-lg bg-red-50 text-red-700 text-sm p-3">{error}</p>}
          <button disabled={busy}
            className="w-full rounded-lg bg-[#0f6b4f] text-white font-semibold py-2.5 hover:bg-[#0b5740] active:scale-[.98] transition disabled:opacity-60">
            {busy ? "Please wait…" : mode === "login" ? "Log in" : "Sign up"}
          </button>
          <button type="button" className="text-sm underline"
            onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}>
            {mode === "login" ? "New here? Create an account" : "Already registered? Log in"}
          </button>
        </form>
      </section>
    </main>
  );
}
