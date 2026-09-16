// Geohash minimo (so encode) -- usado pra agrupar POIs em pois_cache por
// regiao, evitando rechamar o Overpass pro mesmo raio (ver decisoes.md).
// Precisao 5 = celula de ~4.9km x 4.9km, compativel com o raio de busca
// de POIs (1-5km).

const BASE32 = "0123456789bcdefghjkmnpqrstuvwxyz";

export function geohashEncode(
  latitude: number,
  longitude: number,
  precisao = 5,
): string {
  let latMin = -90;
  let latMax = 90;
  let lonMin = -180;
  let lonMax = 180;
  let hash = "";
  let bit = 0;
  let ch = 0;
  let par = true;

  while (hash.length < precisao) {
    if (par) {
      const mid = (lonMin + lonMax) / 2;
      if (longitude >= mid) {
        ch |= 1 << (4 - bit);
        lonMin = mid;
      } else {
        lonMax = mid;
      }
    } else {
      const mid = (latMin + latMax) / 2;
      if (latitude >= mid) {
        ch |= 1 << (4 - bit);
        latMin = mid;
      } else {
        latMax = mid;
      }
    }
    par = !par;
    if (bit < 4) {
      bit++;
    } else {
      hash += BASE32[ch];
      bit = 0;
      ch = 0;
    }
  }

  return hash;
}
