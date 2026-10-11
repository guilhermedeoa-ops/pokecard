"use client";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { api } from "../lib/api";

type Mode = "register" | "login" | "forgot" | "verify" | "reset" | "resend";
const titles: Record<Mode, string> = {
  register: "Crie sua conta de treinador", login: "Entre na sua aventura",
  forgot: "Recupere sua conta", verify: "Confirme seu e-mail",
  reset: "Escolha uma nova senha", resend: "Reenvie a confirmação",
};
const paths: Record<Mode, string> = {
  register: "/auth/register", login: "/auth/login", forgot: "/auth/forgot-password",
  verify: "/auth/verify-email", reset: "/auth/reset-password", resend: "/auth/resend-verification",
};

export function AuthForm({ mode }: { mode: Mode }) {
  const [token, setToken] = useState("");
  const tokenLoaded = useRef(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    if ((mode === "verify" || mode === "reset") && !tokenLoaded.current) {
      tokenLoaded.current = true;
      const value = new URLSearchParams(window.location.hash.slice(1)).get("token") ?? "";
      setToken(value);
      if (!/^[a-f0-9]{64}$/.test(value)) setError("Link inválido. Solicite um novo e-mail.");
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, [mode]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); setMessage("");
    const form = new FormData(event.currentTarget);
    const data: Record<string, string> = {};
    for (const [key, value] of form.entries()) data[key] = String(value);
    if (mode === "verify" || mode === "reset") data.token = token;
    try {
      const result = await api<{ message: string }>(paths[mode], data);
      setMessage(result.message);
      if (mode === "login") window.location.assign("/pallet");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível conectar. Tente novamente.");
    } finally { setBusy(false); }
  }
  const inputClass = "mt-2 w-full rounded-lg border border-slate-600 bg-slate-950 px-4 py-3";
  return (
    <main className="mx-auto max-w-lg px-6 py-16">
      <Link href="/" className="text-amber-300">← Pokémon Kanto Cards</Link>
      <h1 className="my-8 text-3xl font-bold">{titles[mode]}</h1>
      <form onSubmit={submit} className="space-y-5">
        {mode === "register" && <>
          <label className="block">Nome de usuário
            <input name="username" required minLength={3} maxLength={32} pattern="[A-Za-z0-9_]+" autoComplete="username" className={inputClass} />
            <span className="mt-1 block text-sm text-slate-400">3 a 32 letras, números ou sublinhado.</span>
          </label>
          <label className="block">Nome do treinador
            <input name="displayName" required minLength={2} maxLength={32} autoComplete="nickname" className={inputClass} />
          </label>
        </>}
        {["register", "forgot", "resend"].includes(mode) && <label className="block">E-mail
          <input name="email" type="email" required maxLength={254} autoComplete="email" className={inputClass} />
        </label>}
        {mode === "login" && <label className="block">Usuário ou e-mail
          <input name="identifier" required autoComplete="username" className={inputClass} />
        </label>}
        {["register", "login", "reset"].includes(mode) && <label className="block">Senha
          <input name="password" type="password" required minLength={mode === "login" ? 1 : 12} maxLength={128}
            autoComplete={mode === "login" ? "current-password" : "new-password"} className={inputClass} />
          {mode !== "login" && <span className="mt-1 block text-sm text-slate-400">Use pelo menos 12 caracteres.</span>}
        </label>}
        {mode === "verify" && <p className="text-slate-300">Confirme para liberar o acesso à sua conta.</p>}
        <button disabled={busy || (["verify", "reset"].includes(mode) && !/^[a-f0-9]{64}$/.test(token))}
          className="w-full rounded-lg bg-amber-300 px-5 py-3 font-bold text-slate-950 disabled:opacity-50">
          {busy ? "Aguarde…" : mode === "login" ? "Entrar" : mode === "register" ? "Criar conta" : mode === "verify" ? "Confirmar e-mail" : mode === "reset" ? "Atualizar senha" : "Enviar instruções"}
        </button>
      </form>
      {error && <p role="alert" className="mt-5 text-red-300">{error}</p>}
      {message && <p role="status" className="mt-5 text-emerald-300">{message}</p>}
      <nav aria-label="Acesso à conta" className="mt-8 flex flex-wrap gap-4 text-sm text-amber-300">
        <Link href="/login">Entrar</Link><Link href="/cadastro">Criar conta</Link>
        <Link href="/recuperar">Esqueci a senha</Link><Link href="/reenviar">Reenviar confirmação</Link>
      </nav>
    </main>
  );
}
