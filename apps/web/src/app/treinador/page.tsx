"use client";
import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { api } from "../../lib/api";

interface Profile {
  username: string; email: string;
  trainer: { id: string; displayName: string; avatarUrl: string | null; level: number; experience: number };
}
export default function TrainerPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let active = true;
    api<Profile>("/auth/me").then(value => { if (active) setProfile(value); })
      .catch(cause => { if (active) setError(cause instanceof Error ? cause.message : "Não foi possível carregar."); });
    return () => { active = false; };
  }, []);
  async function update(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); setMessage("");
    const displayName = String(new FormData(event.currentTarget).get("displayName"));
    try {
      const trainer = await api<Profile["trainer"]>("/trainer/me", { displayName }, "PATCH");
      setProfile(old => old ? { ...old, trainer } : old);
      setMessage("Nome atualizado.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível salvar."); }
    finally { setBusy(false); }
  }
  async function logout() {
    setBusy(true); setError("");
    try { await api("/auth/logout", {}); window.location.assign("/login"); }
    catch { setError("Não foi possível sair. Tente novamente."); setBusy(false); }
  }
  return <main className="mx-auto max-w-2xl px-6 py-16">
    <Link href="/" className="text-amber-300">← Pokémon Kanto Cards</Link>
    <h1 className="my-8 text-4xl font-bold">Seu treinador</h1>
    {profile ? <>
      <section className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
        <p className="text-2xl font-semibold">{profile.trainer.displayName}</p>
        <p className="mt-2 text-slate-300">Usuário: {profile.username}</p>
        <p className="mt-2 text-slate-300">Nível {profile.trainer.level} · {profile.trainer.experience} XP</p>
        <p className="mt-5 text-slate-400">A visita ao Professor Oak e a escolha do seu primeiro Pokémon chegarão na próxima etapa.</p>
      </section>
      <form onSubmit={update} className="mt-8 space-y-4">
        <label className="block">Nome do treinador
          <input name="displayName" defaultValue={profile.trainer.displayName} required minLength={2} maxLength={32}
            className="mt-2 w-full rounded-lg border border-slate-600 bg-slate-950 px-4 py-3" />
        </label>
        <button disabled={busy} className="rounded-lg bg-amber-300 px-5 py-3 font-bold text-slate-950 disabled:opacity-50">Salvar nome</button>
      </form>
      <button onClick={logout} disabled={busy} className="mt-8 text-amber-300">Sair da conta</button>
    </> : !error && <p role="status">Carregando seu perfil…</p>}
    {error && <p role="alert" className="mt-5 text-red-300">{error} <Link href="/login" className="underline">Entrar</Link></p>}
    {message && <p role="status" className="mt-5 text-emerald-300">{message}</p>}
  </main>;
}
