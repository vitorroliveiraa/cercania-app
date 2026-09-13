# Nearby (app)

Este é o repositório de código do produto Nearby. **Toda a documentação de contexto, decisões e planejamento vive fora daqui**, em:

`C:\Users\vitor\Dev\mimesis-brain\nearby\`

Antes de escrever qualquer código, leia (nessa ordem):

1. `mimesis-brain\nearby\README.md` — o que é o Nearby, problema, cliente, hipóteses, estado atual.
2. `mimesis-brain\nearby\docs\plano-tecnico-mvp.md` — stack técnica, o que construir, custos/limites de cada serviço, cronograma até o dia 29/09/2026, e a seção de autenticação futura (adiada, mas já pensada).
3. `mimesis-brain\nearby\docs\decisoes.md` — log de decisões já tomadas, para não reabrir sem motivo.

Este repositório propositalmente **não tem código ainda** — nasceu vazio (só documentação de processo) para o Claude Code (ou você, no Cursor) começar a implementação a partir do plano técnico acima, sem eu antecipar decisões de estrutura de código que cabem a quem vai efetivamente escrever e manter esse código.

Ver [`ROADMAP.md`](./ROADMAP.md) para o checklist de fases até o dia 29.

## Convenção de continuidade

Sempre que uma fase do `ROADMAP.md` for concluída ou o plano mudar de verdade (não só de intenção), atualize também `mimesis-brain\nearby\docs\decisoes.md` — o Mimesis Brain é a camada de memória compartilhada entre Cowork e Claude Code; este repositório é só o código.
