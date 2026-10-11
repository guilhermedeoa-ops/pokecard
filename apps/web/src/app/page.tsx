import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-16">
      <p className="mb-5 text-sm font-semibold uppercase tracking-widest text-amber-300">Pokémon Kanto Cards</p>
      <h1 className="max-w-3xl text-5xl font-bold leading-tight sm:text-7xl">Sua aventura em Kanto começa aqui.</h1>
      <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-300">
        Explore cidades e rotas, capture cartas e construa sua história como treinador.
      </p>
      <div className="mt-8 flex flex-wrap gap-4"><Link href="/cadastro" className="rounded-lg bg-amber-300 px-6 py-3 font-bold text-slate-950">Criar conta</Link><Link href="/login" className="rounded-lg border border-slate-600 px-6 py-3">Entrar</Link></div>
      <section className="mt-12 rounded-2xl border border-slate-700 bg-slate-900 p-6">
        <h2 className="text-xl font-semibold">Estamos preparando Pallet Town</h2>
        <p className="mt-3 leading-relaxed text-slate-300">
          O jogo está em desenvolvimento. Crie sua conta e prepare seu treinador. A escolha do Pokémon inicial e as aventuras estarão disponíveis nas próximas etapas.
        </p>
      </section>
    </main>
  );
}
