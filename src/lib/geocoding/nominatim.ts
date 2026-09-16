// Geocoding via Nominatim (OpenStreetMap) -- gratuito, sem cartao.
// Politica de uso exige: 1 req/segundo, proibe uso em lote/sistematico,
// exige User-Agent identificando a aplicacao. Ver:
// https://operations.osmfoundation.org/policies/nominatim/

const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org/search";
const USER_AGENT = "CercaniaApp/0.1 (contato: vittorhuggolds@gmail.com)";

export interface ResultadoGeocoding {
  latitude: number;
  longitude: number;
  enderecoNormalizado: string;
}

export class ErroGeocoding extends Error {}

export async function geocodificarEndereco(
  endereco: string,
): Promise<ResultadoGeocoding> {
  const url = new URL(NOMINATIM_BASE_URL);
  url.searchParams.set("q", endereco);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "1");
  url.searchParams.set("countrycodes", "br");

  const resposta = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
  });

  if (!resposta.ok) {
    throw new ErroGeocoding(
      `Nominatim respondeu ${resposta.status} para o endereco: ${endereco}`,
    );
  }

  const resultados = (await resposta.json()) as Array<{
    lat: string;
    lon: string;
    display_name: string;
  }>;

  if (resultados.length === 0) {
    throw new ErroGeocoding(`Nenhum resultado de geocoding para: ${endereco}`);
  }

  const [primeiro] = resultados;
  return {
    latitude: Number(primeiro.lat),
    longitude: Number(primeiro.lon),
    enderecoNormalizado: primeiro.display_name,
  };
}
