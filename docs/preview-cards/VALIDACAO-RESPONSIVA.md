# Validação visual e responsividade — laboratório de cartas v0.4

## Escopo
Apenas protótipo conceitual. Nenhuma integração ao jogo principal, nenhuma alteração em produção e nenhuma mudança de origem, bola ou histórico.

## Referência visual aprovada
- Usar os **cinco recortes cromados da imagem aprovada pelo usuário**, não versões reinterpretadas em CSS.
- Não colocar ícones ou emblemas de Poké Ball na parte superior ou inferior.
- POKE_BALL: vermelho/branco; GREAT_BALL: azul/vermelho; SUPER_BALL: amarelo/azul; ULTRA_BALL: preto/amarelo; PREMIER_BALL: RGB forte e bem definido.
- Raridade é uma camada conceitual separada da moldura.

## Layout de frente
- Nome: centralizado na zona segura superior, sem interseção com a moldura.
- Arte: área central de maior destaque.
- Tipo e nível: indicadores compactos em zona interna inferior, nunca sobre a borda.
- Dois modos em avaliação: equilibrado (tipo e nível visíveis) e minimalista (nome e arte).
- Detalhes completos nas seis abas: Resumo, Status, Moves, Equipamentos, Evolução e Origem.

## Testes de revisão
1. Comparar simultaneamente as cinco molduras.
2. Alternar o Pokémon demonstrativo (Charmander, Squirtle e Bulbasaur).
3. Testar desktop e simulação de celular.
4. Verificar nomes longos, legibilidade e contraste (especialmente Premier Ball).
5. Verificar ausência de Poké Ball e de elementos sobrepostos.
6. Não assumir aprovação definitiva antes da avaliação do usuário.

## Pendências
- Arte final de cada Pokémon.
- Regras definitivas de raridade, efeitos e distribuição.
- Comportamento responsivo real em diferentes navegadores e tamanhos.
- Publicação da prévia com os assets exatos na Vercel.
- Validação da especificação para futura implementação.

A versão HTML independente contém as imagens das molduras embutidas. Não substituí-las por CSS no site.
