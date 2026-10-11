# Capítulo 1 — Pallet Town

Transcrição textual do PDF fornecido pelo usuário. Documento principal de requisitos do capítulo.

Página 1
POKÉMON KANTO CARDS
CAPÍTULO 1 — PALLET TOWN
Prompt técnico de implementação para Codex • Professor Oak, packs iniciais, animação gacha, coleção,
Pokédex e tutorial.
1. CONTEXTO DO PROJETO
Desenvolver Pokémon Kanto Cards, RPG online de cartas para navegador, inicialmente com as 151 espécies
de Kanto. Não é um jogo com movimentação de personagem: nada de teclado, joystick ou mapa navegável.
A interação acontece exclusivamente por menus, painéis, cenários ilustrados, diálogos, cartas, missões e
futuramente expedições automáticas. Visual inspirado em RPG clássico e abertura de packs estilo gacha.
2. ANTES DE PROGRAMAR
Inspecione o repositório, stack, autenticação, banco, rotas, componentes, dados de espécies, sprites e
convenções. Reutilize a infraestrutura existente; não recrie o projeto nem substitua sistemas funcionais.
Apresente primeiro plano técnico breve, arquivos previstos, riscos e decisões pendentes. Aguarde
aprovação antes de alterações significativas. Desenvolva incrementalmente, testando cada módulo.
3. FLUXO COMPLETO DO CAPÍTULO
Jogador autenticado sem inicial entra em Pallet Town → conversa com Professor Oak → escolhe Pack Fogo,
Água ou Planta → confirma → backend registra a escolha e cria uma carta individual → animação gacha com
sons, efeitos elementais e giro 3D → revela Pokémon e atributos → coleção e Pokédex atualizadas → Oak
entrega kit inicial → jogador completa tutorial → Rota 1 desbloqueada. Persistir progresso e permitir
retomada após fechar ou atualizar a página.
4. PALLET TOWN POR MENUS
Criar hub com cenário ilustrado, nome da cidade, Laboratório Oak, Minhas Cartas, Pokédex, Inventário,
Missões, Mapa de Kanto e Rota 1 bloqueada. Liberar opções conforme tutorial. Não implementar
movimentação ou outras cidades. Estruturar localidades para expansão futura.
5. PROFESSOR OAK E DIÁLOGOS
Componente reutilizável com retrato, nome, caixa de texto, mensagens curtas, botão Continuar, opção de
efeito de digitação e avanço imediato. Exemplo: “Olá, jovem treinador! Seja bem-vindo à região de Kanto!
Meu nome é Oak. Preparei três pacotes especiais: Fogo, Água e Planta. Escolha o elemento que mais
combina com você!” Ao finalizar, abrir seleção de packs. Persistir etapa atual.
6. PACKS ELEMENTAIS PREDEFINIDOS
Pack Fogo: vermelho/laranja, chama, brasas e partículas, entrega Charmander #004 (Fogo). Pack Água:
azul, gota, bolhas/ondas, entrega Squirtle #007 (Água). Pack Planta: verde, folha, folhas e brilho natural,
entrega Bulbasaur #001 (Planta/Veneno). Não há sorteio: conteúdo é 100% predeterminado. Não anunciar
chances fictícias. Estruturar sistema para packs aleatórios futuros sem implementá-los agora.

Página 2
7. ESCOLHA E CONFIRMAÇÃO
Exibir três packs responsivos. Ao selecionar, destacar escolhido e escurecer outros; mostrar confirmação e
opção de voltar. Até confirmar, pode trocar de pack. Depois de confirmar, escolha definitiva. O servidor
aceita somente identificadores válidos dos três packs e associa a espécie correta.
8. PERSISTÊNCIA E ANTIDUPLICAÇÃO
Cada treinador pode receber somente um Pokémon inicial. Fazer seleção e criação da carta em transação
atômica com restrição de unicidade e proteção a requisições concorrentes/repetidas. Não confiar em IDs de
espécie enviados pelo cliente. Criar carta antes de iniciar animação. Se conexão cair, retomar revelação ou
tutorial sem conceder outra carta. Endpoints idempotentes e verificações no backend.
9. ANIMAÇÃO GACHA
Sequência de 4–6 segundos: pack centralizado, fundo escurece, partículas elementais; flutuação e energia
crescente; abertura/rasgo e luz; carta emerge e gira suavemente em 3D; posiciona-se de frente, revela
“Você recebeu um Charmander!” (ou correspondente), atributos e botão “Adicionar à minha coleção”. Este
botão conclui apresentação, não cria outra carta. Incluir “Pular animação”, reduced-motion, desempenho
mobile, fallback caso efeitos falhem. Preferir CSS transforms/Web Animations ou biblioteca já instalada.
10. ÁUDIO E EFEITOS
Sons de seleção, confirmação, carregamento, abertura, revelação e recompensa. Identidade elemental:
fogo energético, água suave, planta natural. Configuração de ligar/desligar áudio; respeitar políticas de
autoplay. Somente assets autorizados ou originais. Efeitos visuais responsivos, sem prejudicar legibilidade.
11. COMPONENTE UNIVERSAL DE CARTA
Um componente reutilizável para todas as espécies, não um por inicial. Exibir ID individual, nome, número
Pokédex, imagem, tipos, nível, EXP, HP atual/máximo, Ataque, Defesa, Ataque Especial, Defesa Especial,
Velocidade, habilidades, movimentos, bola de origem, borda, local/data, treinador original, proprietário e
histórico. Atributos no nível 5 calculados por fórmula consistente a partir dos atributos-base; neste capítulo
valores determinísticos por espécie.
12. BORDA E ORIGEM
Todos os iniciais são nível 5 e obtidos com Poké Ball comum, tier comum, borda vermelha; sem bônus de
poder. Registrar bola de origem permanentemente. Prever configuração futura: Great Ball azul, Super Ball
amarela, Ultra Ball preta, Premier Ball RGB animada. Implementar agora somente borda vermelha. Origem
histórica “Pokémon Inicial — Presente do Professor Oak”, local Pallet Town. Preservar após evolução/troca
futura.
13. MINHAS CARTAS
Página que lista cartas do treinador com imagem, nível, tipo e borda; ao clicar abre atributos completos,
experiência, status, origem e data. Preparada para múltiplas cartas. Estados de vazio, loading e erro. Não
implementar treinamento, evolução ou trocas agora.

Página 3
14. POKÉDEX KANTO
Estrutura de 151 espécies com número, nome, tipos, imagem e dados básicos. Estados: Desconhecido,
Avistado, Capturado. Registrar automaticamente espécie inicial como capturada; demais desconhecidas.
Mostrar total 151, avistadas, capturadas, porcentagem, busca por nome/número e filtros. Registro histórico
persiste mesmo se carta for trocada futuramente. Não criar capturas selvagens agora.
15. KIT INICIAL
Professor Oak entrega uma única vez: 5 Poké Balls comuns, 3 Poções, 1 Revive, 500 Pokédollars e acesso à
Pokédex de Kanto. Usar/reutilizar inventário com item, categoria e quantidade; entrega
atômica/idempotente, sem duplicação. Mostrar modal de recompensa. Não implementar uso de
consumíveis em combate.
16. MISSÃO #001 — O COMEÇO DE UMA JORNADA
Objetivos: escolher pack, revelar carta, visualizar atributos, acessar Minhas Cartas, consultar Pokédex, abrir
mapa, desbloquear Rota 1. Exibir pendências e progresso. Validar objetivos sensíveis no servidor e persistir.
Kit inicial não pode ser entregue de novo na conclusão. Diálogo final de Oak: “Excelente trabalho! Agora
você está pronto para explorar Kanto. Sua primeira aventura começa na Rota 1!”
17. MAPA DE KANTO INICIAL
Mapa por seleção de locais, sem personagem caminhando. Pallet Town atual, Rota 1 bloqueada até
conclusão do tutorial, Viridian City futura/bloqueada. Mostrar estados atual/desbloqueado/bloqueado. Ao
liberar Rota 1, exibir mensagem de que expedições chegarão no próximo capítulo; não criar viagens ou
encontros.
18. MODELOS DE DADOS
Inspecionar e adaptar entidades existentes: Users, Trainers (localização e tutorial), PokemonSpecies (151
espécies e atributos-base), PokemonInstances (carta individual, proprietário, origem, bola, nível, EXP,
atributos, HP), PackDefinitions, StarterSelections, PokedexEntries, Inventory, TutorialProgress, Locations,
PlayerLocationUnlocks. Criar índices e constraints, migrações seguras e reversíveis quando possível; não
apagar dados sem autorização.
19. COMPONENTIZAÇÃO
Sugestões: PalletTownPage, ProfessorOakDialog, DialogBox, StarterPackSelection, ElementalPack,
PackOpeningAnimation, PokemonCard, PokemonCard3DReveal, PokemonCardDetails, PokemonCollection,
PokedexPage, StarterRewardModal, TutorialMissionPanel, KantoMap, LocationCard. Adaptar nomes à base
existente. Separar UI, domínio, persistência, validação, serviços, conteúdo e animações.
20. DIRETRIZES DE DESIGN
Interface moderna e consistente, cenário ilustrado, cores elementais, cartas com profundidade, sombras e
bordas, transições suaves e layout responsivo. Destaque principal: abertura do pack e revelação da
primeira carta. Acessibilidade, movimento reduzido, sem informação transmitida só por animação. Usar
apenas imagens/sons licenciados; caso indisponíveis, placeholders identificados e substituíveis.

Página 4
21. TESTES OBRIGATÓRIOS
Testar: primeiro acesso direciona ao tutorial; troca de pack antes de confirmar; mapeamento
Fogo→Charmander, Água→Squirtle, Planta→Bulbasaur; escolha irreversível; concorrência e requisições
duplicadas; refresh durante animação; coleção exibe carta nível 5 com borda vermelha; Pokédex registra
espécie; kit entregue uma vez; retomada do tutorial; Rota 1 só libera ao concluir; desktop/mobile, áudio
desativado e reduced-motion. Executar testes existentes e corrigir falhas.
22. FORA DO ESCOPO
Não implementar: Hunts, combate, captura selvagem, viagens, bicicleta, Fly, Teleport, Premium, chat,
amigos, mensagens privadas, trocas, mercado, PvP, ginásios, evolução funcional, packs aleatórios, loja de
packs, Premier Ball RGB funcional ou eventos. Somente preparar estrutura extensível.
23. ORDEM DE EXECUÇÃO
1) Inspeção e plano. 2) Modelos, migrações e seed. 3) Pallet Town e Oak. 4) Packs, confirmação e
persistência. 5) Animação, áudio e giro 3D. 6) Componente carta e coleção. 7) Pokédex e kit. 8) Tutorial e
mapa. 9) Testes e revisão. Após cada fase, relatar arquivos modificados, testes e pendências.
24. CRITÉRIOS DE ACEITE
Novo jogador deve conseguir entrar, ver Pallet, conversar com Oak, escolher e confirmar pack, assistir/pular
animação com giro 3D, receber espécie correta nível 5 e borda comum vermelha, consultar carta na
coleção e espécie na Pokédex, receber kit, concluir tutorial, desbloquear Rota 1, sair e voltar com progresso
intacto. Nenhuma duplicação de carta, itens ou dinheiro.
25. INSTRUÇÃO FINAL AO CODEX
Comece inspecionando o projeto existente e apresente plano técnico antes de alterar arquivos. Preserve
funcionalidades existentes; priorize qualidade, segurança, persistência e componentes reutilizáveis. Faça
implementação incremental e testes. Não extrapole o escopo. Aguarde minha confirmação antes de
alterações significativas. O objetivo é um Capítulo 1 funcional, visualmente marcante e pronto para
expansão.