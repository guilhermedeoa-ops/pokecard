# Pokémon Kanto Cards

RPG online de cartas com os 151 Pokémon de Kanto. Projeto iniciado do zero.

## Plano inicial

1. Estrutura do monorepo: Next.js/React/TypeScript/Tailwind no frontend, NestJS no backend e PostgreSQL/Prisma no banco.
2. Cadastro, verificação de e-mail, login, logout e recuperação de senha.
3. Criação do treinador e perfil protegido.
4. Pallet Town, Professor Oak, escolha do inicial e inventário inicial.
5. Cartas individuais, evolução, Pokédex e Pokélog.
6. Hunts e viagens com Redis/BullMQ; economia e trocas transacionais; chat e amigos com WebSocket.

As próximas implementações serão propostas em branches e pull requests. Não há jogo funcional neste commit inicial.

## Requisitos preservados

Cartas mantêm a borda da bola de captura após evolução e troca. Poké Ball vermelha, Great Ball azul, Super Ball amarela, Ultra Ball preta e Premier Ball RGB animada, exclusiva de eventos e com captura extremamente rara. Hunts têm quatro dificuldades; viagens duram até dois minutos e têm recompensas inferiores. Bicicleta/Ride/Fly reduzem tempo sem encontros; Teleport exige Premium, Pokémon compatível e destino desbloqueado. O servidor valida progressão, capturas, inventário, dinheiro e trocas.

## Decisões pendentes

- Nome de treinador também será único? O nome de usuário deve ser único.
- Serviço de envio de e-mails e armazenamento de fotos.
- Fórmulas de atributos, captura, mérito, recompensas e limites de balanceamento.
- Hospedagem e regras detalhadas de eventos e Premium.

Nenhuma dessas decisões de game design será preenchida silenciosamente.
