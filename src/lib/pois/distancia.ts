// Distancia e tempo estimado calculados localmente -- sem API de rotas
// paga (ver plano-tecnico-mvp.md secao 2). Tempo e estimativa por
// velocidade media, nao rota real (sem considerar ruas/transito).

const RAIO_TERRA_METROS = 6371000;
const VELOCIDADE_A_PE_KMH = 5;
const VELOCIDADE_DE_CARRO_KMH = 25;

export interface DistanciaEstimada {
  distanciaMetros: number;
  tempoAPeMinutos: number;
  tempoDeCarroMinutos: number;
}

function paraRadianos(graus: number): number {
  return (graus * Math.PI) / 180;
}

export function calcularDistanciaHaversine(
  latA: number,
  lonA: number,
  latB: number,
  lonB: number,
): number {
  const dLat = paraRadianos(latB - latA);
  const dLon = paraRadianos(lonB - lonA);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(paraRadianos(latA)) *
      Math.cos(paraRadianos(latB)) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return RAIO_TERRA_METROS * c;
}

export function estimarDistanciaETempo(
  latA: number,
  lonA: number,
  latB: number,
  lonB: number,
): DistanciaEstimada {
  const distanciaMetros = calcularDistanciaHaversine(latA, lonA, latB, lonB);
  const distanciaKm = distanciaMetros / 1000;

  return {
    distanciaMetros: Math.round(distanciaMetros),
    tempoAPeMinutos: Math.max(1, Math.round((distanciaKm / VELOCIDADE_A_PE_KMH) * 60)),
    tempoDeCarroMinutos: Math.max(
      1,
      Math.round((distanciaKm / VELOCIDADE_DE_CARRO_KMH) * 60),
    ),
  };
}
