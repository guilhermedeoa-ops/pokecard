# Pokémon Kanto Cards

RPG online de cartas com os 151 Pokémon de Kanto, iniciado do zero.

## Estado
Estrutura inicial em desenvolvimento. Há frontend Next.js, API NestJS com GET /api/health e esquema Prisma para conta, treinador, sessões e tokens. Cadastro, login, verificação de e-mail e recuperação de senha ainda serão implementados. Não há jogo funcional nesta entrega.

## Estrutura
- apps/web: Next.js, React, TypeScript e Tailwind CSS.
- apps/api: NestJS e Prisma.
- packages/shared: contratos públicos TypeScript.
- compose.yaml: PostgreSQL local.
- docs/architecture.md: plano, próximos módulos e decisões pendentes.

## Desenvolvimento local
Requisitos previstos: Node.js 22.12 ou superior, npm e Docker Compose. A instalação local ainda não foi verificada.

No PowerShell:
```powershell
git clone https://github.com/guilhermedeoa-ops/pokecard.git
cd pokecard
# Enquanto o PR inicial estiver aberto:
git switch codex/initial-foundation
Copy-Item .env.example .env
Copy-Item apps/api/.env.example apps/api/.env
docker compose up -d --wait
npm install
npm run db:validate
npm run db:generate
npm run db:migrate -- --name initial
npm run build -w @pokecard/shared
npm run dev:api
```

Em outro terminal na raiz:
```powershell
npm run dev:web
```

Frontend: http://localhost:3000. API: http://localhost:3001/api/health.
As credenciais dos exemplos são apenas locais; mantenha a senha do Compose e a DATABASE_URL correspondentes. Nunca versione .env.
O banco é exposto apenas no loopback local. O endpoint de saúde retorna erro se o banco não responder.

## Verificação
GitHub Actions valida o Prisma, cria tabelas em PostgreSQL descartável, compila frontend/API e testa unicidade de usuário/e-mail, propriedade do treinador e remoção de sessões/tokens vinculados. Testes exigem uma DATABASE_URL para o banco pokecard_test e não devem ser executados em produção.
Não há lockfile nesta primeira estrutura; gerar e versionar package-lock.json antes de uma release.

## Ordem e requisitos
Fundação → cadastro/autenticação/treinador → Oak e inicial → cartas/inventário/Pokédex/Pokélog → Hunts/viagens → economia/trocas/social. Todas as funcionalidades do resumo estão preservadas no plano de arquitetura.

## Decisões pendentes
Nome de treinador único ou não; provedor de e-mail; upload de foto; hospedagem; fórmulas de balanceamento, eventos e Premium. Nenhuma decisão de game design será alterada sem consulta.
