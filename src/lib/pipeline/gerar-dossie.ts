// Orquestra a Fase 2: imovel geocodificado -> busca POIs -> calcula
// distancia/tempo -> gera argumentos de venda -> registra o dossie.
// Pressupoe que o imovel ja foi importado (ver importar-imovel.ts) e tem
// latitude/longitude preenchidos.

import { prisma } from "@/lib/prisma";
import { buscarPoisProximos, type Poi } from "@/lib/pois/overpass";
import { calcularDistanciaHaversine, estimarDistanciaETempo } from "@/lib/pois/distancia";
import { gerarArgumentosDeVenda, type PoiComDistancia } from "@/lib/argumentos/gerar";
import type { Dossie, Prisma } from "@/generated/prisma/client";

export class ErroGeracaoDossie extends Error {}

export async function gerarDossie(imovelId: string): Promise<Dossie> {
  const imovel = await prisma.imovel.findUnique({ where: { id: imovelId } });
  if (!imovel) {
    throw new ErroGeracaoDossie(`Imovel nao encontrado: ${imovelId}`);
  }
  if (imovel.latitude == null || imovel.longitude == null) {
    throw new ErroGeracaoDossie(
      `Imovel ${imovelId} nao tem latitude/longitude -- geocoding falhou ou nao foi rodado.`,
    );
  }

  const dossie = await prisma.dossie.create({
    data: { imovelId, status: "gerando" },
  });

  try {
    const pois = await buscarPoisProximos(imovel.latitude, imovel.longitude);
    const maisProximoPorCategoria = escolherMaisProximoPorCategoria(
      pois,
      imovel.latitude,
      imovel.longitude,
    );

    const poisComDistancia: PoiComDistancia[] = maisProximoPorCategoria.map(
      ({ poi, estimativa }) => ({
        categoria: poi.categoria,
        nome: poi.nome,
        latitude: poi.latitude,
        longitude: poi.longitude,
        distanciaMetros: estimativa.distanciaMetros,
        tempoAPeMinutos: estimativa.tempoAPeMinutos,
        tempoDeCarroMinutos: estimativa.tempoDeCarroMinutos,
      }),
    );

    const argumentos = await gerarArgumentosDeVenda(poisComDistancia);

    return await prisma.dossie.update({
      where: { id: dossie.id },
      data: {
        status: "pronto",
        geradoEm: new Date(),
        dadosJson: { pois: poisComDistancia, argumentos } as unknown as Prisma.InputJsonValue,
      },
    });
  } catch (erro) {
    await prisma.dossie.update({
      where: { id: dossie.id },
      data: { status: "erro" },
    });
    throw erro;
  }
}

function escolherMaisProximoPorCategoria(
  pois: Poi[],
  latitude: number,
  longitude: number,
) {
  const melhorPorCategoria = new Map<
    string,
    { poi: Poi; estimativa: ReturnType<typeof estimarDistanciaETempo> }
  >();

  for (const poi of pois) {
    const distanciaAtual = calcularDistanciaHaversine(
      latitude,
      longitude,
      poi.latitude,
      poi.longitude,
    );
    const melhorAtual = melhorPorCategoria.get(poi.categoria);
    const melhorDistancia = melhorAtual
      ? calcularDistanciaHaversine(
          latitude,
          longitude,
          melhorAtual.poi.latitude,
          melhorAtual.poi.longitude,
        )
      : Infinity;

    if (distanciaAtual < melhorDistancia) {
      melhorPorCategoria.set(poi.categoria, {
        poi,
        estimativa: estimarDistanciaETempo(
          latitude,
          longitude,
          poi.latitude,
          poi.longitude,
        ),
      });
    }
  }

  return [...melhorPorCategoria.values()];
}
