# Pokémon Kanto Cards — Modelo conceitual universal de carta (rascunho v0.1)

> Escopo: documento de conceito e protótipo isolado. Não autoriza integrar, migrar banco, publicar o jogo ou mesclar branches.

## Identidade e histórico permanentes
- ID único da instância; espécie de origem; treinador original.
- Origem imutável: STARTER_PACK, POKEMON_PACK ou CAUGHT.
- Poké Ball original e borda visual correspondente, imutáveis após criação.
- Local, data e circunstância de obtenção; trilha histórica de evolução e trocas (a especificar).
- A evolução altera a espécie atual, não apaga a espécie de origem.

## Progressão e atributos
- Espécie atual, nível, experiência, natureza, habilidade ativa, HP atual e máximo.
- Seis atributos: HP, Ataque, Defesa, Ataque Especial, Defesa Especial, Velocidade.
- IVs por atributo, EVs por atributo, regras de natureza e cálculo dos stats.
- O laboratório usa IV/EV uniforme apenas como atalho visual; o modelo final exige seis valores independentes.
- Definir limites, fontes de EV, persistência do HP e tratamento de mudança de habilidade antes de integrar.

## Configuração
- Biblioteca permanente de movimentos aprendidos; quatro slots ativos configuráveis; evitar repetição do mesmo movimento em dois slots.
- Equipamentos apenas para CAUGHT. Slots por nível: 1–9 = 0; 10–24 = 1; 25+ = 2.
- Equipamentos do protótipo são exemplos sem efeitos, economia ou inventário real.
- Definir regras de aprendizagem, substituição, remoção e evolução dos moves antes de implementar.

## Seis abas
1. Resumo: identificação e dados essenciais.
2. Status: atributos, IVs, EVs e natureza.
3. Moves: biblioteca e quatro slots.
4. Equipamentos: elegibilidade e slots.
5. Evolução: linha, requisitos e histórico.
6. Origem: registros permanentes e rastreabilidade.

## Frente da carta
- Nome/espécie atual, representação visual, tipo, nível e borda da Poké Ball original.
- Indicadores compactos de habilidade, natureza e HP.
- Informações extensas ficam nas abas, evitando excesso visual.

## Lacunas intencionais
- Raridades, artes finais, economia, distribuição de packs e probabilidades.
- Lista completa de naturezas, moves, habilidades e equipamentos.
- Formato definitivo do histórico, IDs, data, treinador e localização.
- Regras completas de evolução, combate, captura e efeitos dos itens.
- Validação da experiência visual em diferentes tamanhos de tela.

## Regra de aprovação
Cada mudança conceitual é apresentada em prévia independente. Não alterar o jogo principal nem avançar para integração sem aprovação explícita.
