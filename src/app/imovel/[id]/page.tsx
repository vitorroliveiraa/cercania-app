import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  DadosDossieSchema,
  DadosExtraidosImovelSchema,
} from "@/lib/dossie/tipos";
import {
  formatarArea,
  formatarDistancia,
  formatarPreco,
} from "@/lib/formatacao";
import { Icone, iconePorCategoria, labelPorCategoria } from "@/components/icones";
import { MapaImovel } from "@/components/mapa-imovel";

export default async function PaginaImovel(
  props: PageProps<"/imovel/[id]">,
) {
  const { id } = await props.params;

  const imovel = await prisma.imovel.findUnique({
    where: { id },
    include: {
      // Postgres ordena NULL primeiro em DESC por padrao -- sem "nulls: last"
      // uma tentativa antiga com erro (geradoEm nulo) aparece na frente de
      // um dossie pronto mais recente.
      dossies: {
        orderBy: { geradoEm: { sort: "desc", nulls: "last" } },
        take: 1,
      },
    },
  });

  if (!imovel || imovel.latitude == null || imovel.longitude == null) {
    notFound();
  }

  const dossie = imovel.dossies[0];
  const fotos = DadosExtraidosImovelSchema.safeParse(
    imovel.dadosExtraidos,
  ).data?.fotos ?? [];
  const fotoPrincipal = fotos[0];

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6 sm:px-6 sm:py-10">
      <header className="mb-5 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-full bg-verde-cercania/10 px-3 py-1 text-sm font-semibold text-verde-cercania"
        >
          <Image src="/brand/simbolo-verde.svg" alt="" width={14} height={14} />
          cercania
        </Link>
      </header>

      <div className="overflow-hidden rounded-2xl border border-borda-neutra bg-white">
        {fotoPrincipal && (
          // eslint-disable-next-line @next/next/no-img-element -- fotos vem de dominio externo variavel (CDN de cada imobiliaria)
          <img
            src={fotoPrincipal}
            alt={`Foto do imóvel em ${imovel.endereco}`}
            className="h-56 w-full object-cover sm:h-72"
          />
        )}

        <div className="p-5 sm:p-6">
          <h1 className="font-display text-2xl font-semibold text-verde-mata sm:text-3xl">
            {imovel.endereco}
          </h1>

          <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-cinza-oliva">
            {imovel.preco != null && (
              <div className="text-base font-semibold text-verde-mata">
                {formatarPreco(imovel.preco)}
              </div>
            )}
            {imovel.areaTotal != null && (
              <div className="flex items-center gap-1.5">
                <Icone nome="area" className="h-4 w-4" />
                {formatarArea(imovel.areaTotal)}
              </div>
            )}
            {imovel.quartos != null && (
              <div className="flex items-center gap-1.5">
                <Icone nome="quarto" className="h-4 w-4" />
                {imovel.quartos} {imovel.quartos === 1 ? "quarto" : "quartos"}
              </div>
            )}
            {imovel.suites != null && imovel.suites > 0 && (
              <div className="flex items-center gap-1.5">
                <Icone nome="suite" className="h-4 w-4" />
                {imovel.suites} {imovel.suites === 1 ? "suíte" : "suítes"}
              </div>
            )}
            {imovel.vagas != null && (
              <div className="flex items-center gap-1.5">
                <Icone nome="vaga" className="h-4 w-4" />
                {imovel.vagas} {imovel.vagas === 1 ? "vaga" : "vagas"}
              </div>
            )}
          </dl>
        </div>
      </div>

      <section className="mt-6" aria-labelledby="titulo-arredores">
        <h2
          id="titulo-arredores"
          className="font-display text-lg font-semibold text-verde-mata"
        >
          Ao redor
        </h2>

        <ConteudoDossie
          status={dossie?.status}
          dadosJson={dossie?.dadosJson}
          latitude={imovel.latitude}
          longitude={imovel.longitude}
        />
      </section>

      <footer className="mt-10 border-t border-borda-neutra pt-4 text-center text-xs text-cinza-oliva">
        Dados de localização via OpenStreetMap. Dossiê gerado por{" "}
        <span className="font-semibold text-verde-cercania">cercania</span>.
      </footer>
    </main>
  );
}

function ConteudoDossie({
  status,
  dadosJson,
  latitude,
  longitude,
}: {
  status?: string;
  dadosJson?: unknown;
  latitude: number;
  longitude: number;
}) {
  if (!status) {
    return (
      <EstadoInformativo mensagem="Dossiê ainda não foi gerado para este imóvel." />
    );
  }

  if (status === "gerando") {
    return <EstadoInformativo mensagem="Gerando dossiê..." carregando />;
  }

  if (status === "erro") {
    return (
      <EstadoInformativo mensagem="Não foi possível gerar o dossiê deste imóvel. Tente novamente mais tarde." />
    );
  }

  const resultado = DadosDossieSchema.safeParse(dadosJson);
  if (!resultado.success || resultado.data.pois.length === 0) {
    return (
      <EstadoInformativo mensagem="Nenhum ponto de interesse encontrado perto deste imóvel." />
    );
  }

  const { pois, argumentos } = resultado.data;
  const argumentoPorCategoria = new Map(
    argumentos.map((a) => [a.categoria, a.argumento]),
  );

  return (
    <>
      <div className="mt-3">
        <MapaImovel latitude={latitude} longitude={longitude} pois={pois} />
      </div>

      <ul className="mt-4 divide-y divide-borda-neutra">
        {pois.map((poi) => (
          <li key={`${poi.categoria}-${poi.nome}`} className="py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-verde-cercania/10 text-verde-cercania">
                  <Icone
                    nome={iconePorCategoria(poi.categoria)}
                    className="h-4 w-4"
                  />
                </span>
                <div>
                  <p className="text-sm font-semibold text-verde-mata">
                    {poi.nome}
                  </p>
                  <p className="text-xs text-cinza-oliva">
                    {labelPorCategoria(poi.categoria)}
                  </p>
                </div>
              </div>
              <div className="shrink-0 text-right text-sm text-cinza-oliva">
                <div className="flex items-center justify-end gap-1">
                  <Icone nome="pe" className="h-3.5 w-3.5" />
                  {poi.tempoAPeMinutos} min
                </div>
                <div className="text-xs">
                  {formatarDistancia(poi.distanciaMetros)}
                </div>
              </div>
            </div>
            {argumentoPorCategoria.get(poi.categoria) && (
              <p className="mt-2 text-sm text-verde-mata">
                {argumentoPorCategoria.get(poi.categoria)}
              </p>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}

function EstadoInformativo({
  mensagem,
  carregando,
}: {
  mensagem: string;
  carregando?: boolean;
}) {
  return (
    <div className="mt-3 rounded-lg border border-dashed border-borda-neutra px-4 py-8 text-center text-sm text-cinza-oliva">
      {carregando && (
        <span
          className="mb-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-verde-cercania border-t-transparent motion-reduce:animate-none"
          aria-hidden="true"
        />
      )}
      <p>{mensagem}</p>
    </div>
  );
}
