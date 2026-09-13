# Roadmap — MVP até 29/09/2026

Checklist derivado de `mimesis-brain\nearby\docs\plano-tecnico-mvp.md` (seção 5). Marcar aqui conforme avança; ao fechar cada fase, registrar o que mudou de fato em `mimesis-brain\nearby\docs\decisoes.md`.

## Fase 0 — Setup
- [x] Next.js (App Router) + TypeScript + Tailwind inicializado
- [x] Prisma configurado (schema com todos os modelos da seção 4 do plano técnico, client gerado, driver adapter `@prisma/adapter-pg`) — falta só apontar `DATABASE_URL` para um projeto Neon real
- [ ] Deploy inicial no Vercel funcionando (app vazio, mas publicado)

## Fase 1 — Motor de dados (maior risco técnico — priorizar)
- [ ] Testar Apify (actor genérico de crawling) contra 2-3 anúncios reais dos portais que o Wagner usa
- [ ] Plano B (Playwright direto) testado, caso Apify não sirva
- [ ] Extração de dados estruturados do imóvel via Claude (endereço, preço, área, quartos, vagas, fotos)
- [ ] Geocoding via Nominatim funcionando
- [ ] Validar cobertura do Nominatim/Overpass nas regiões-alvo (João Pessoa/Recife/Natal)

## Fase 2 — POIs e argumentos
- [ ] Busca de POIs via Overpass API (categorias: praia, mercado, escola, hospital, farmácia, restaurante — confirmar com Wagner)
- [ ] Cálculo de distância e tempo estimado
- [ ] Geração dos argumentos de venda via Claude a partir dos POIs

## Fase 3 — Dossiê público e embed
- [ ] Página pública `/imovel/[slug]` (responsiva, com mapa)
- [ ] Snippet de embed (iframe) copiável

## Fase 4 — Landing e captura de leads + schema de billing
- [ ] Landing page de vendas
- [ ] Formulário de captura de leads (nome, telefone, email) salvando no Postgres
- [ ] Migrações das tabelas futuras de billing/multi-tenant (`accounts`, `users`, `plans`, `subscriptions`) — schema pronto, sem lógica

## Fase 5 — Curadoria e ensaio
- [ ] 5-10 imóveis reais pré-testados como rede de segurança
- [ ] Fluxo de ponta a ponta testado várias vezes
- [ ] Apresentado ao Wagner pelo menos uma vez antes do dia 29

## Fase 6 — Buffer, polimento e ensaio final
- [ ] Ajustes visuais
- [ ] Ensaio final da apresentação

## 29/09 — Apresentação
- [ ] 🎯
