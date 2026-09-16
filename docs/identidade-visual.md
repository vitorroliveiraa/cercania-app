# Identidade Visual — Cercania

Referência de marca para qualquer trabalho de frontend/UI neste repositório. Sempre que for construir ou ajustar componentes visuais, páginas, ou o dossiê público do imóvel, siga estes valores em vez de escolher cores/fontes livremente.

Direção de marca escolhida: sóbria, confiável, com um toque de calor (nem "SaaS azul corporativo genérico", nem luxuoso/premium demais) — o produto fala de bairro, escola, praia, coisas humanas, não só dado técnico de mapa.

## Cores

Usar sempre os hex exatos abaixo (não aproximar, não inventar tons intermediários sem necessidade).

| Nome | Hex | Uso |
|---|---|---|
| Verde-cercania | `#3D6B4F` | Cor principal da marca — CTAs primários, links, ícones, símbolo do logo |
| Verde-mata | `#22301F` | Texto de alto contraste, fundos escuros, headers escuros |
| Terracota | `#C77B3E` | Acento de destaque — usar com moderação (indicadores, o ponto do símbolo, hover states) |
| Terracota-claro | `#F2A25C` | Variação clara do acento, para fundos escuros |
| Areia | `#F7F4EE` | Fundo padrão da interface (substitui o branco puro) |
| Cinza-oliva | `#5B6152` | Texto secundário, legendas, metadados |
| Borda neutra | `#E3DFD3` | Divisórias, bordas de cards, inputs |

Regras de uso:
- Fundo de página padrão: `#F7F4EE` (areia), nunca branco puro (`#FFFFFF`).
- Verde-cercania (`#3D6B4F`) é a cor de ação — botões primários, links, estados ativos.
- Terracota é acento raro — usar em no máximo um elemento de destaque por tela (ex: o ponto do símbolo, um badge, um valor numérico importante). Nunca usar terracota em blocos grandes de fundo.
- Texto principal: `#22301F` sobre fundo claro, `#F7F4EE` sobre fundo escuro.
- Evitar azul em qualquer elemento de UI — é a cor que estávamos deliberadamente fugindo (padrão SaaS genérico).

## Tipografia

- **Fraunces** (serifada) — nome da marca, headlines, títulos de seção. Pesos usados: 500 (regular) e 600 (semibold). Fonte com personalidade — não usar para textos longos.
- **Manrope** (sans-serif) — todo o resto: corpo de texto, labels, dados do dossiê, botões, formulários. Pesos usados: 400, 500, 600, 700.

Ambas via Google Fonts:
```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Manrope:wght@400;500;600;700&display=swap">
```
Ou via `next/font/google` (preferível em projeto Next.js):
```ts
import { Fraunces, Manrope } from 'next/font/google'

const fraunces = Fraunces({ subsets: ['latin'], weight: ['500', '600'], variable: '--font-fraunces' })
const manrope = Manrope({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-manrope' })
```

Regra: Fraunces só em título/nome de marca. Interface e dados usam Manrope.

## Logo e símbolo

Símbolo: dois círculos concêntricos com um ponto central (terracota) — representa os raios de proximidade ao redor do imóvel, a lógica central do produto.

Arquivos de logo (SVG + PNG + WebP, fundo transparente, variantes clara/escura e favicons em todos os tamanhos padrão) estão em `public/brand/` — ver `public/brand/LEIA-ME.txt` para qual arquivo usar em cada contexto (favicon, apple-touch-icon, manifest PWA, etc).

Nunca redesenhar o símbolo do zero num componente — sempre referenciar os arquivos de `public/brand/`.

## Tom visual geral

- Cantos levemente arredondados (não totalmente retos, não excessivamente arredondados) — 4-8px de radius em cards e botões.
- Evitar gradientes chamativos, glassmorphism, ou qualquer estética "AI slop" genérica.
- Ícones: sempre outline/stroke SVG (nunca emoji) — estilo consistente de 2px de stroke.
- Densidade de informação alta é aceitável no dossiê (é uma ferramenta de dado), mas cada seção deve ter respiro (padding generoso), não amontoado.

## Referência viva

O sistema de marca completo (paleta, tipografia, aplicações — cartão, landing page, mockup do dossiê embedado) está documentado visualmente aqui:
https://claude.ai/artifact/GoPsDMXLj2s1skdPKBbPrP

Consultar esse link para ver exemplos de composição antes de criar uma tela nova do zero.
