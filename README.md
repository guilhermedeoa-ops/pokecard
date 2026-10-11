# Pokémon Kanto Cards

RPG online de cartas com os 151 Pokémon de Kanto, iniciado do zero.

## Estado
Cadastro/autenticação e Capítulo 1 em desenvolvimento: Pallet Town por menus, Professor Oak, packs elementais predeterminados, carta inicial, coleção, Pokédex, kit e tutorial. Expedições e demais módulos ficam para os próximos capítulos.

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
git switch codex/chapter-1-pallet-town
Copy-Item .env.example .env
Copy-Item apps/api/.env.example apps/api/.env
Copy-Item apps/web/.env.example apps/web/.env.local
docker compose up -d --wait
npm install
npm run db:validate
npm run db:generate
npm run db:deploy -w @pokecard/api
npm run build -w @pokecard/shared
npm run build -w @pokecard/api
npm run db:seed -w @pokecard/api
npm run dev:api
```

Em outro terminal na raiz:
```powershell
npm run dev:web
```

Frontend: http://localhost:3000. API: http://localhost:3001/api/health. Caixa de e-mail local: http://localhost:8025.

Crie a conta em /cadastro, abra a mensagem no Mailpit, confirme o e-mail e entre em /login. Login inicia em /pallet; perfil em /treinador; recuperação em /recuperar. Veja docs/chapter-one-implementation.md para o capítulo e docs/capitulo-1.md para o prompt original transcrito. Veja docs/authentication.md para contratos e limites.

Se você aplicou db push da primeira estrutura em um banco descartável, crie um banco novo para as migrações. Não execute reset em um banco com dados que deseja preservar.
As credenciais dos exemplos são apenas locais; mantenha a senha do Compose e a DATABASE_URL correspondentes. Nunca versione .env.
O banco é exposto apenas no loopback local. O endpoint de saúde retorna erro se o banco não responder.

## Verificação
GitHub Actions valida e gera Prisma, aplica migrações em PostgreSQL descartável, compila frontend/API e testa restrições do banco e o ciclo HTTP de cadastro, envio SMTP, verificação, login, perfil, logout e recuperação. Inclui tokens expirados/reutilizados, concorrência, origem inválida e limites de tentativas. Capítulo 1: testa três iniciais, idempotência, kit e saldo, retomada e Rota 1. Playwright testa o fluxo em desktop/mobile, áudio desligado, reduced-motion e refresh; screenshots ficam no artifact chapter-one-browser-report. Testes exigem uma DATABASE_URL para o banco pokecard_test e não devem ser executados em produção.
Não há lockfile nesta primeira estrutura; gerar e versionar package-lock.json antes de uma release.

## Ordem e requisitos
Fundação → cadastro/autenticação/treinador → Oak e inicial → cartas/inventário/Pokédex/Pokélog → Hunts/viagens → economia/trocas/social. Todas as funcionalidades do resumo estão preservadas no plano de arquitetura.

## Decisões pendentes
Nome de treinador único ou não; provedor de e-mail; upload de foto; hospedagem; fórmulas de balanceamento, eventos e Premium. Nenhuma decisão de game design será alterada sem consulta.
