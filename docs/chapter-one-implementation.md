# Capítulo 1 — Pallet Town

## Requisitos e aprovação
Implementação baseada no PDF PROMPT_CODEX_CAPITULO_1_PALLET_TOWN.pdf enviado pelo usuário e transcrito integralmente em docs/capitulo-1.md. O plano foi aprovado, assim como IV/EV zero, natureza neutra e habilidades/movimentos básicos dos iniciais. A referência visual é guia de composição, não um asset distribuído pelo jogo.

## Fases e arquivos
1. Inspeção: reaproveita autenticação e infraestrutura do PR #1; nenhuma substituição desses fluxos.
2. Dados: schema.prisma, migração 202610110001_chapter_one, content/kanto.json e seed.ts. 151 espécies, packs, cartas, inventário, Pokédex, tutorial e locais. Migração aditiva não apaga contas.
3. Pallet/Oak: journey-page.tsx, ui.tsx e laboratório/portrait SVG originais provisórios.
4. Packs: PackDto só aceita fire/water/grass; a API deriva a espécie e trava a linha do treinador. StarterSelection.trainerId único; escolha repetida igual retorna o estado existente, escolha diferente retorna conflito.
5. Animação/áudio: pack.tsx, journey.css e use-audio.ts. Abertura de 5,5 segundos com giro 3D, pular e reduced-motion. Som sintetizado original opcional; sem autoplay forçado. Opção de áudio guardada localmente.
6. Cartas: PokemonCard/CardDetails universais, páginas /cartas e coleção preparada para múltiplas instâncias.
7. Pokédex/kit: 151 registros com filtro/busca/status; captura histórica independente do proprietário atual. Kit em transação, RewardGrant único; 5 bolas, 3 poções, 1 revive e 500 Pokédollars.
8. Tutorial/mapa: etapas persistidas e validação no servidor. Rota 1 somente após escolha, revelação, atributos, coleção, Pokédex, mapa e kit. A conclusão não entrega outra recompensa.
9. Testes: testes existentes, journey.test.ts e Playwright em desktop/mobile, com screenshots e traces nos artifacts da CI.

## Fórmula aprovada
Nível L=5. HP = floor(2*baseHP*L/100)+L+10.
Demais atributos = floor(2*baseStat*L/100)+5.
Sem IV, EV ou bônus de natureza. Atributos-base são dados de catálogo; atributos calculados são snapshot da instância. EXP inicial zero, HP cheio, Poké Ball comum, tier comum e borda vermelha.
Charmander: Blaze, Scratch/Growl; Squirtle: Torrent, Tackle/Tail Whip; Bulbasaur: Overgrow, Tackle/Growl.
Sem combate, efeitos de habilidade ou aprendizagem de movimentos nesta etapa.

## Dados e assets
Dados factuais do catálogo: PokeAPI/pokeapi data/v2/csv.
Blobs consultados: pokemon.csv bb32b1763d2462160f49ce88b4a1d800e4f195e1; pokemon_stats.csv fb76eeb810892440b5b2b2e148688a131452a1a4; pokemon_types.csv 5567064b22c77c4082c1dfb30674102c669968d8; types.csv d0ec10c324fb7d1529269ddbffac4778fdf99836.
Licença integral preservada em docs/third-party/PokeAPI-LICENSE.md. O recorte é das 151 espécies de Kanto; tipos/atributos seguem o catálogo atual do PokéAPI, não uma simulação das regras de combate de um cartucho específico.
Laboratório, retrato do cientista e ícones de criaturas são SVGs originais provisórios. Nenhum sprite/logo/som oficial foi baixado ou usado. Todas as imagens de Pokémon têm imagePlaceholder=true; outras espécies usam silhueta genérica identificada e substituível.
Artistas podem substituir os arquivos e atualizar o catálogo quando houver assets autorizados.

## Execução local e retomada
Aplicar migrações, compilar API/shared e rodar npm run db:seed -w @pokecard/api antes de iniciar.
Login redireciona para /pallet. /journey devolve o estágio salvo. Carta é persistida antes da animação. Atualizar durante REVEAL recomeça a apresentação, nunca cria outra instância.
Os botões de visita gravam somente os objetivos associados ao treinador autenticado. Dados econômicos e escolha nunca são aceitos do cliente.
Kit recebido seguido de refresh leva às missões; inventário e saldo permanecem visíveis. Arquivos são seedados de modo idempotente, sem tocar nas instâncias/recompensas.

## Limites
Sem Hunts, combate, captura selvagem, viagens, evolução, Premium, trocas, chat ou packs aleatórios.
Autenticação, throttle de desenvolvimento e outbox mantêm seus limites operacionais documentados. Node/Docker no PC continuam não verificados devido à falha do sandbox.
Sem dados apagados. Rollback das tabelas de jogo deve ser planejado com backup após uso; não há down migration destrutiva automática.
Lockfile e hosting permanecem pendências antes da release; assets finais ainda precisam substituir os placeholders.
