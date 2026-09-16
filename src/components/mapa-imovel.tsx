"use client";

import { useEffect, useRef } from "react";
import type { Map as MapaLeaflet } from "leaflet";

export interface PoiNoMapa {
  nome: string;
  latitude: number;
  longitude: number;
}

interface MapaImovelProps {
  latitude: number;
  longitude: number;
  pois: PoiNoMapa[];
}

export function MapaImovel({ latitude, longitude, pois }: MapaImovelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapaRef = useRef<MapaLeaflet | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapaRef.current) return;

    let cancelado = false;

    import("leaflet").then((L) => {
      if (cancelado || !containerRef.current) return;

      const mapa = L.map(containerRef.current, {
        center: [latitude, longitude],
        zoom: 15,
        scrollWheelZoom: false,
      });
      mapaRef.current = mapa;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(mapa);

      const iconeImovel = L.divIcon({
        className: "",
        html: '<span class="block h-5 w-5 rounded-full bg-terracota ring-4 ring-terracota/30 border-2 border-white shadow"></span>',
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });
      L.marker([latitude, longitude], { icon: iconeImovel }).addTo(mapa);

      const iconePoi = L.divIcon({
        className: "",
        html: '<span class="block h-3 w-3 rounded-full bg-verde-cercania border-2 border-white shadow"></span>',
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      });
      for (const poi of pois) {
        L.marker([poi.latitude, poi.longitude], { icon: iconePoi })
          .addTo(mapa)
          .bindTooltip(poi.nome);
      }
    });

    return () => {
      cancelado = true;
      mapaRef.current?.remove();
      mapaRef.current = null;
    };
  }, [latitude, longitude, pois]);

  return (
    <div
      ref={containerRef}
      className="h-64 w-full rounded-lg border border-borda-neutra sm:h-80"
      role="img"
      aria-label="Mapa com a localização do imóvel e pontos de interesse próximos"
    />
  );
}
