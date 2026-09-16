// Formatacao de exibicao pt-BR -- ver docs/identidade-visual.md.

export function formatarPreco(valor: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(valor);
}

export function formatarArea(metrosQuadrados: number): string {
  return `${new Intl.NumberFormat("pt-BR").format(metrosQuadrados)} m²`;
}

export function formatarDistancia(metros: number): string {
  if (metros < 1000) return `${Math.round(metros)} m`;
  return `${(metros / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} km`;
}
