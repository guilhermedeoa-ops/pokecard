# Arquitetura e sequência

## Situação verificada
O repositório estava vazio e o conector GitHub permite leitura e escrita. O terminal local falha ao iniciar com setup refresh had errors; nenhuma dependência instalada no computador foi verificada. Validação será feita no GitHub Actions.

## Primeira entrega
Monorepo npm com apps/web, apps/api e packages/shared; PostgreSQL local com Docker; Prisma; endpoint de saúde que consulta o banco; página inicial de desenvolvimento; teste de integração do esquema.

Prisma 6.19 é uma escolha inicial explícita para manter o cliente clássico; não se afirma que seja a versão mais recente. Migração de versão terá revisão própria. O primeiro install não tem lockfile: a CI valida as dependências resolvidas, mas builds ainda não são reproduzíveis. Gerar e versionar package-lock.json antes de uma release.

## Cadastro e treinador: próximo incremento
- Normalizar usernameKey e emailKey na API; nunca aceitar essas chaves do cliente.
- Validar DTOs; senhas com Argon2id; não retornar hashes em respostas.
- Criar conta/treinador atomicamente, ou definir criação do treinador no onboarding.
- Tokens aleatórios: guardar somente SHA-256, expiração e consumo atômico.
- Sessão revogável em cookie HttpOnly, Secure em produção e SameSite; proteção de origem/CSRF, limites de tentativas e respostas que não revelem existência de e-mails.
- Recuperação de senha revoga sessões; e-mail via interface de entrega com outbox transacional.
- Testes de duplicidade, credenciais, validade e reutilização de tokens, isolamento entre usuários e autorização.
O esquema desta entrega não implementa autenticação: não há endpoints de cadastro/login nem envio de e-mail.

## Fronteiras dos próximos módulos
- Contas e sessões: identidade e autorização.
- Treinador e onboarding: perfil, início em Pallet Town e escolha do inicial.
- Catálogo: 151 espécies, elementos, evoluções e habilidades.
- Cartas: instâncias únicas, experiência e histórico. Bola de origem é permanente.
- Inventário e economia: saldo, lançamentos e consumíveis; mutações transacionais.
- Expedições: Hunts e viagens; Redis/BullMQ para agendamento, resultados idempotentes persistidos no PostgreSQL. Nunca confiar no cronômetro do navegador.
- Pokédex/Pokélog: descoberta/captura e mérito por espécie.
- Trocas: reserva de recursos, confirmação dos dois jogadores e transferência atômica.
- Social: WebSocket autenticado, amigos, mensagens e moderação.

A API define resultados e valida propriedade dos recursos. Frontend apresenta estado e intenção. packages/shared contém contratos públicos, sem dados secretos ou lógica autoritativa.

## Decisões pendentes
Unicidade do nome de treinador; provedor de e-mail; armazenamento/limites de foto; hosting; fórmulas de game design e balanceamento. Não definir taxas de captura, distribuição de espécies, custos ou regras Premium sem consulta. Tipos e tabelas de jogo entram com seus módulos para evitar cristalizar regras ainda não aprovadas.

## Requisitos de jogo preservados
151 Pokémon de Kanto; Oak e iniciais Charmander/Squirtle/Bulbasaur; cartas individuais com nível, XP, atributos, habilidades, evolução e histórico; bordas vermelha/azul/amarela/preta e Premier RGB exclusiva de eventos com captura extremamente rara; quatro dificuldades de Hunt; mérito limitado por balanceamento; viagens até dois minutos com menor dificuldade/recompensa; Bicicleta/Ride/Fly sem encontros; Teleport Premium com Pokémon compatível e destino desbloqueado; chats, amigos e trocas seguras; Pokédollars, lojas e inventário.
