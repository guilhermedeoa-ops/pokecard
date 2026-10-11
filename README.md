# Pokémon Kanto Cards

RPG online de cartas com os 151 Pokémon de Kanto, iniciado do zero.

## Estado
Primeiro módulo em desenvolvimento: cadastro, verificação de e-mail, login/logout, recuperação de senha e perfil de treinador. A API valida e persiste contas, sessões e tokens; e-mails locais ficam no Mailpit. Os módulos de jogo ainda estão no roadmap.

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
Copy-Item apps/web/.env.example apps/web/.env.local
docker compose up -d --wait
npm install
npm run db:validate
npm run db:generate
npm run db:deploy -w @pokecard/api
npm run build -w @pokecard/shared
npm run dev:api
```

Em outro terminal na raiz:
```powershell
npm run dev:web
```

Frontend: http://localhost:3000. API: http://localhost:3001/api/health. Caixa de e-mail local: http://localhost:8025.

Crie a conta em /cadastro, abra a mensagem no Mailpit, confirme o e-mail e entre em /login. Perfil em /treinador; recuperação em /recuperar. Veja docs/authentication.md para contratos e limites.

Se você aplicou db push da primeira estrutura em um banco descartável, crie um banco novo para as migrações. Não execute reset em um banco com dados que deseja preservar.
As credenciais dos exemplos são apenas locais; mantenha a senha do Compose e a DATABASE_URL correspondentes. Nunca versione .env.
O banco é exposto apenas no loopback local. O endpoint de saúde retorna erro se o banco não responder.

## Verificação
GitHub Actions valida e gera Prisma, aplica migrações em PostgreSQL descartável, compila frontend/API e testa restrições do banco e o ciclo HTTP de cadastro, envio SMTP, verificação, login, perfil, logout e recuperação. Inclui tokens expirados/reutilizados, concorrência, origem inválida e limites de tentativas. Testes exigem uma DATABASE_URL para o banco pokecard_test e não devem ser executados em produção.
Não há lockfile nesta primeira estrutura; gerar e versionar package-lock.json antes de uma release.

## Ordem e requisitos
Fundação → cadastro/autenticação/treinador → Oak e inicial → cartas/inventário/Pokédex/Pokélog → Hunts/viagens → economia/trocas/social. Todas as funcionalidades do resumo estão preservadas no plano de arquitetura.

## Decisões pendentes
Nome de treinador único ou não; provedor de e-mail; upload de foto; hospedagem; fórmulas de balanceamento, eventos e Premium. Nenhuma decisão de game design será alterada sem consulta.
