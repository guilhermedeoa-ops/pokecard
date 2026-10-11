# Etapa 05 — Frente da carta e seis abas

## Objetivo
Validar a hierarquia visual da carta e a organização das seis abas em um protótipo independente, sem integrar ao jogo principal.

## Molduras
Usar os cinco PNGs cromados aprovados (Poké, Great, Super, Ultra e Premier RGB), sem emblema de Poké Ball. A moldura é imagem sobreposta, sem recriação em CSS.

## Controles da prévia
- Pokémon demonstrativos: Charmander, Squirtle e Bulbasaur.
- Origem: STARTER_PACK, POKEMON_PACK e CAUGHT.
- Nível 1–100, natureza, moldura e layout equilibrado/minimalista.
- Alternância de visualização desktop/celular.
- Comparação das cinco molduras.

## Seis abas
1. **Resumo** — nome, tipo, nível, natureza e origem.
2. **Status** — status-base de exemplo por espécie. Não calcular IV/EV fictícios.
3. **Moves** — quatro movimentos demonstrativos por espécie; biblioteca permanente ainda não implementada.
4. **Equipamentos** — slots somente para CAUGHT: nível 1–9 = 0, 10–24 = 1, 25+ = 2.
5. **Evolução** — cadeia evolutiva demonstrativa, preservando origem e moldura.
6. **Origem** — origem e moldura são imutáveis na carta persistida. Os seletores da prévia representam **outras cartas**, não alterações da carta existente.

## Critérios para próxima etapa
- Substituir dados demonstrativos por esquema validado de carta.
- Definir regras de IV/EV, natureza e cálculos, sem inventar fórmulas.
- Especificar biblioteca permanente de movimentos e quatro slots ativos.
- Testar legibilidade das cinco molduras em tamanhos de celular e desktop.
- Publicar a prévia exata na Vercel após transferência dos assets.
- Não mesclar nem integrar ao jogo principal sem aprovação.
