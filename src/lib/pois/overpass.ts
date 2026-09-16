// Busca de POIs via Overpass API (OpenStreetMap) -- gratuito, sem cartao.
// Usa nwr (node/way/relation) + "out center", nao so node[...] -- praia e
// outros POIs de area/linha ficam de fora com node puro (achado da Fase 1,
// ver mimesis-brain/cercania/docs/decisoes.md).
//
// Cache em Postgres por geohash da regiao (pois_cache): evita rebater a
// API pro mesmo raio, respeita a politica de uso do Overpass (nao fazer
// queries sistematicas/em lote) e acelera consultas repetidas na mesma
// vizinhanca.

import { prisma } from "@/lib/prisma";
import { geohashEncode } from "@/lib/geohash";
import { calcularDistanciaHaversine } from "./distancia";

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";
const USER_AGENT = "CercaniaApp/0.1 (contato: vittorhuggolds@gmail.com)";
const PRECISAO_GEOHASH = 5;
// Sentinela de "cache negativo": categoria sem nenhum POI no raio, nesta
// regiao. Sem isso, categoria vazia nunca fica marcada como "ja verificada"
// e toda chamada nova volta a bater no Overpass -- achado real: causou 504
// por repetir a mesma busca vazia varias vezes seguidas.
const MARCADOR_SEM_RESULTADO = "__sem_resultado__";

export type CategoriaPoi =
  | "praia"
  | "mercado"
  | "escola"
  | "hospital"
  | "farmacia"
  | "restaurante";

interface DefinicaoCategoria {
  categoria: CategoriaPoi;
  seletorOverpass: string;
  raioMetros: number;
}

const CATEGORIAS: DefinicaoCategoria[] = [
  { categoria: "praia", seletorOverpass: 'nwr["natural"="beach"]', raioMetros: 5000 },
  { categoria: "mercado", seletorOverpass: 'nwr["shop"="supermarket"]', raioMetros: 2000 },
  { categoria: "escola", seletorOverpass: 'nwr["amenity"="school"]', raioMetros: 2000 },
  { categoria: "hospital", seletorOverpass: 'nwr["amenity"="hospital"]', raioMetros: 5000 },
  { categoria: "farmacia", seletorOverpass: 'nwr["amenity"="pharmacy"]', raioMetros: 1500 },
  { categoria: "restaurante", seletorOverpass: 'nwr["amenity"="restaurant"]', raioMetros: 1500 },
];

export interface Poi {
  categoria: CategoriaPoi;
  nome: string;
  latitude: number;
  longitude: number;
}

interface ElementoOverpass {
  type: "node" | "way" | "relation";
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

export class ErroBuscaPois extends Error {}

export async function buscarPoisProximos(
  latitude: number,
  longitude: number,
): Promise<Poi[]> {
  const geohash = geohashEncode(latitude, longitude, PRECISAO_GEOHASH);

  const categoriasEmCache = new Set(
    (
      await prisma.poiCache.findMany({
        where: { geohash },
        select: { categoria: true },
        distinct: ["categoria"],
      })
    ).map((r) => r.categoria),
  );

  const categoriasFaltando = CATEGORIAS.filter(
    (c) => !categoriasEmCache.has(c.categoria),
  );

  if (categoriasFaltando.length > 0) {
    const encontrados = await buscarNoOverpass(
      latitude,
      longitude,
      categoriasFaltando,
    );

    const categoriasEncontradas = new Set(encontrados.map((p) => p.categoria));
    const categoriasSemResultado = categoriasFaltando.filter(
      (c) => !categoriasEncontradas.has(c.categoria),
    );

    const linhasParaCache = [
      ...encontrados.map((p) => ({
        categoria: p.categoria,
        nome: p.nome,
        latitude: p.latitude,
        longitude: p.longitude,
        fonte: "overpass",
        geohash,
      })),
      ...categoriasSemResultado.map((c) => ({
        categoria: c.categoria,
        nome: MARCADOR_SEM_RESULTADO,
        latitude,
        longitude,
        fonte: "overpass",
        geohash,
      })),
    ];

    if (linhasParaCache.length > 0) {
      await prisma.poiCache.createMany({ data: linhasParaCache });
    }
  }

  const todosDoCache = await prisma.poiCache.findMany({ where: { geohash } });

  const pois: Poi[] = todosDoCache
    .filter((p) => p.nome !== MARCADOR_SEM_RESULTADO)
    .map((p) => ({
      categoria: p.categoria as CategoriaPoi,
      nome: p.nome,
      latitude: p.latitude,
      longitude: p.longitude,
    }));

  return filtrarPorRaioDaCategoria(pois, latitude, longitude);
}

function filtrarPorRaioDaCategoria(
  pois: Poi[],
  latitude: number,
  longitude: number,
): Poi[] {
  const raioPorCategoria = new Map(
    CATEGORIAS.map((c) => [c.categoria, c.raioMetros]),
  );

  return pois.filter((poi) => {
    const raio = raioPorCategoria.get(poi.categoria);
    if (!raio) return false;
    const distancia = calcularDistanciaHaversine(
      latitude,
      longitude,
      poi.latitude,
      poi.longitude,
    );
    return distancia <= raio;
  });
}

async function buscarNoOverpass(
  latitude: number,
  longitude: number,
  categorias: DefinicaoCategoria[],
): Promise<Poi[]> {
  const blocos = categorias
    .map((c) => `${c.seletorOverpass}(around:${c.raioMetros},${latitude},${longitude});`)
    .join("\n  ");

  const query = `[out:json][timeout:25];
(
  ${blocos}
);
out center tags;`;

  const resposta = await fetch(OVERPASS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain",
      "User-Agent": USER_AGENT,
    },
    body: query,
  });

  if (!resposta.ok) {
    throw new ErroBuscaPois(`Overpass respondeu ${resposta.status}`);
  }

  const dados = (await resposta.json()) as { elements: ElementoOverpass[] };

  const pois: Poi[] = [];
  for (const elemento of dados.elements) {
    const lat = elemento.lat ?? elemento.center?.lat;
    const lon = elemento.lon ?? elemento.center?.lon;
    if (lat == null || lon == null) continue;

    const categoria = identificarCategoria(elemento.tags ?? {}, categorias);
    if (!categoria) continue;

    pois.push({
      categoria,
      nome: elemento.tags?.name ?? nomeGenericoPorCategoria(categoria),
      latitude: lat,
      longitude: lon,
    });
  }

  return pois;
}

function identificarCategoria(
  tags: Record<string, string>,
  categorias: DefinicaoCategoria[],
): CategoriaPoi | null {
  const mapaTag: Record<CategoriaPoi, [string, string]> = {
    praia: ["natural", "beach"],
    mercado: ["shop", "supermarket"],
    escola: ["amenity", "school"],
    hospital: ["amenity", "hospital"],
    farmacia: ["amenity", "pharmacy"],
    restaurante: ["amenity", "restaurant"],
  };

  for (const c of categorias) {
    const [chave, valor] = mapaTag[c.categoria];
    if (tags[chave] === valor) return c.categoria;
  }
  return null;
}

function nomeGenericoPorCategoria(categoria: CategoriaPoi): string {
  const nomes: Record<CategoriaPoi, string> = {
    praia: "Praia",
    mercado: "Mercado",
    escola: "Escola",
    hospital: "Hospital",
    farmacia: "Farmácia",
    restaurante: "Restaurante",
  };
  return nomes[categoria];
}
