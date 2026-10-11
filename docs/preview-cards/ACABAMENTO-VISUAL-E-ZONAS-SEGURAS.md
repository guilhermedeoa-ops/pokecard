# Etapa conceitual — acabamento visual e zonas seguras (v0.3)

## Decisão visual aprovada
Usar **exatamente as cinco molduras cromadas extraídas da composição visual escolhida**, sem Poké Ball desenhada no topo ou rodapé. Não recriar a borda com CSS. A origem da Poké Ball continua registrada como metadado da carta.

### Molduras
- POKE_BALL: cromado vermelho com traços brancos.
- GREAT_BALL: cromado azul com traços vermelhos.
- SUPER_BALL: cromado amarelo com traços azuis.
- ULTRA_BALL: cromado preto com traços amarelos.
- PREMIER_BALL: cromado RGB multicolorido de alto contraste.

## Hierarquia visual
1. Nome do Pokémon e nível, na zona superior **dentro** do vão livre da moldura.
2. Arte do Pokémon em área central de destaque.
3. Tipo e informação resumida em área inferior interna.
4. Seis abas para detalhes: Resumo, Status, Moves, Equipamentos, Evolução, Origem.
5. Moldura visual sempre acima do fundo, mas não deve bloquear controles.

## Zonas seguras
- A moldura é sobreposição não interativa com `pointer-events: none`.
- Texto e controles devem ficar recuados do contorno cromado e dos recortes angulares.
- Sem emblemas sobre o nome ou dados.
- Manter proporção da imagem original para não deformar cromados.
- A Premier Ball exige teste especial de contraste e legibilidade.

## Próxima revisão
- Verificar 5 molduras x 3 espécies x layouts equilibrado/minimalista.
- Testar desktop e celular.
- Confirmar se dados compactos ficam na frente ou somente nas abas.
- Validar o modelo de raridade independente da moldura.
- Nenhuma integração no jogo principal sem aprovação.

## Publicação
A prévia de HTML autônomo inclui imagens embutidas. Publicação na Vercel depende de enviar o HTML completo ou hospedar os PNGs, sem substituição por CSS.
