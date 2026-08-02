"use client";

import { useState } from "react";
import { api, setSession } from "../../lib/api";

export default function RegisterPage() {
  const [password, setPassword] = useState("");
  const [preferred, setPreferred] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.register(password, preferred || undefined);
      setSession(res.access_token, res.username);
      window.location.href = "/";
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-8">
      <h1 className="font-display text-2xl font-semibold mb-1">Get an anonymous name</h1>
      <p className="text-muted text-sm mb-6">
        No email. No real name. We&apos;ll assign one, or you can propose your own.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="register-preferred" className="text-sm text-muted block mb-1">
            Preferred name (optional)
          </label>
          <input
            id="register-preferred"
            value={preferred}
            onChange={(e) => setPreferred(e.target.value)}
            placeholder="e.g. QuietFalcon"
            className="w-full rounded-lg bg-surface2 border border-line px-3 py-2 text-sm outline-none focus:border-signal"
          />
        </div>
        <div>
          <label htmlFor="register-password" className="text-sm text-muted block mb-1">
            Password
          </label>
          <input
            id="register-password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg bg-surface2 border border-line px-3 py-2 text-sm outline-none focus:border-signal"
          />
        </div>
        {error && <p className="text-danger text-sm">{error}</p>}
        <button
          disabled={loading}
          className="rounded-lg bg-signal text-ink font-medium py-2 text-sm disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create anonymous account"}
        </button>
      </form>
    </div>
  );
}
