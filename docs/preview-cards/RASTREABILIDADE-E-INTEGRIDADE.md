# Especificação conceitual — rastreabilidade e integridade das cartas (v0.2)

**Estado:** proposta para avaliação, não implementada no jogo. O HTML é um laboratório local, sem persistência.

## 1. Identidade da instância
Uma carta corresponde a uma instância identificada por `cardId` único e permanente. O identificador **não muda** em evolução, troca ou mudança de dono.

Campos permanentes propostos:
- `cardId`, `speciesAtOrigin`, `originalTrainerId`
- `origin`: `STARTER_PACK`, `POKEMON_PACK` ou `CAUGHT`
- `originalBall` e `originalBorder`, registrados na criação
- `obtainedAt`, `obtainedLocation`, `obtainedMethod` (conforme disponibilidade)

Campos mutáveis:
- `currentSpecies`, `currentOwnerId`, `level`, `experience`, `currentHp`
- `evs`, `activeMoves[4]`, `equipment[0..2]` quando permitido
- A natureza e os IVs são tratados como estáveis na proposta; eventual mecânica que os modifique exigirá decisão explícita.

## 2. Eventos históricos
Propor registro de eventos com `eventId`, `cardId`, `type`, `occurredAt`, `actorId`, `payload`.
- `OBTAINED`: criação da carta, origem, bola, local, treinador.
- `EVOLVED`: espécie anterior e espécie posterior.
- `TRANSFERRED`: proprietário anterior e novo proprietário.
- Outros eventos, se adotados, devem ser definidos separadamente (aprendizagem de movimento, equipamento, treinamento).

**Invariante:** eventos de transferência nunca sobrescrevem `originalTrainerId`. Eventos de evolução nunca sobrescrevem `speciesAtOrigin`, `origin` ou `originalBall`.

## 3. Regras entre sistemas
- A evolução atualiza apenas `currentSpecies` e os atributos derivados da espécie atual. O modelo de movimentos deve preservar a biblioteca aprendida.
- Uma transferência muda `currentOwnerId`, mas não modifica atributos, IVs, EVs, natureza, bola, origem, biblioteca de moves ou espécie atual.
- Equipamentos são permitidos apenas para `CAUGHT`: níveis 1–9: 0 slots; 10–24: 1; 25+: 2.
- Caso o nível diminua (se a mecânica permitir), definir previamente o destino dos equipamentos em slots bloqueados: **pendente de decisão**.
- Em transferência, definir se equipamentos acompanham a carta ou retornam ao inventário do proprietário anterior: **pendente de decisão**.
- As bordas representam a bola original; a origem e a bola são conceitos distintos.

## 4. Regras do laboratório
- Seletores de espécie, origem e bola criam um **novo cenário de teste**. Não editam os campos permanentes de uma carta existente.
- Evolução e transferência são eventos apenas em memória; recarregar a página reinicia o cenário.
- A simulação não produz dados reais de usuário nem garante que o backend do jogo adote esta estrutura.

## 5. Critérios para aprovação futura
1. Uma carta conserva ID, origem, treinador original, espécie de origem e bola original após evoluir e trocar de dono.
2. O proprietário atual acompanha a última transferência válida.
3. A espécie atual acompanha a última evolução válida.
4. Eventos exibem ordem e transição anterior → posterior.
5. A elegibilidade de equipamentos respeita origem e nível.
6. A biblioteca permanente de movimentos não se perde na evolução.
7. Nenhuma dessas regras é integrada ao jogo antes de aprovação expressa.

## 6. Decisões em aberto
- Se a transferência leva equipamentos equipados e quem é proprietário dos itens.
- Quais eventos entram no histórico visível e por quanto tempo são retidos.
- Identidade pública ou privada do treinador original.
- Se há formas alternativas de evolução e como são registradas.
- Se há mudanças legítimas de IV, natureza ou habilidade.
