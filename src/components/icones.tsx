// Icones outline/stroke SVG (nunca emoji), 2px de stroke -- ver
// docs/identidade-visual.md. Um so componente com switch pra nao multiplicar
// arquivos pra cada icone.

type NomeIcone =
  | "quarto"
  | "suite"
  | "vaga"
  | "area"
  | "praia"
  | "mercado"
  | "escola"
  | "saude"
  | "farmacia"
  | "restaurante"
  | "pe"
  | "carro";

const CAMINHOS: Record<NomeIcone, React.ReactNode> = {
  quarto: (
    <>
      <path d="M3 18v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6" />
      <path d="M3 18v2M21 18v2" />
      <path d="M3 12V9a2 2 0 0 1 2-2h5v5" />
    </>
  ),
  suite: (
    <>
      <path d="M3 18v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6" />
      <path d="M3 18v2M21 18v2" />
      <path d="M3 12V9a2 2 0 0 1 2-2h5v5" />
      <circle cx="17" cy="8" r="1.5" />
    </>
  ),
  vaga: (
    <>
      <path d="M5 17h14M5 17a2 2 0 0 1-2-2v-2.2a2 2 0 0 1 .4-1.2l2-2.7A2 2 0 0 1 7 8h10a2 2 0 0 1 1.6.8l2 2.7a2 2 0 0 1 .4 1.2V15a2 2 0 0 1-2 2" />
      <circle cx="7.5" cy="17" r="1.5" />
      <circle cx="16.5" cy="17" r="1.5" />
    </>
  ),
  area: (
    <>
      <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
    </>
  ),
  praia: (
    <>
      <path d="M2 19c1.5-1.5 3-1.5 4.5 0s3 1.5 4.5 0 3-1.5 4.5 0 3 1.5 4.5 0" />
      <path d="M6 15 16 5M12 5h4v4" />
    </>
  ),
  mercado: (
    <>
      <path d="M6 8h12l-1 11a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L6 8Z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </>
  ),
  escola: (
    <>
      <path d="m2 8 10-4 10 4-10 4-10-4Z" />
      <path d="M6 10v5c0 1.1 2.7 2 6 2s6-.9 6-2v-5" />
    </>
  ),
  saude: (
    <>
      <path d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.5-9.5 9-9.5 9Z" />
    </>
  ),
  farmacia: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <path d="M12 8v8M8 12h8" />
    </>
  ),
  restaurante: (
    <>
      <path d="M7 3v8M5 3v5a2 2 0 0 0 4 0V3M17 3c-1.7 0-3 2-3 4.5S15.3 12 17 12M17 3v18" />
    </>
  ),
  pe: (
    <>
      <circle cx="12" cy="5" r="2" />
      <path d="M9 22v-5l2-3-1-5 5 1 2 4-3 2 1 6" />
    </>
  ),
  carro: (
    <>
      <path d="M5 17h14M5 17a2 2 0 0 1-2-2v-2.2a2 2 0 0 1 .4-1.2l2-2.7A2 2 0 0 1 7 8h10a2 2 0 0 1 1.6.8l2 2.7a2 2 0 0 1 .4 1.2V15a2 2 0 0 1-2 2" />
      <circle cx="7.5" cy="17" r="1.5" />
      <circle cx="16.5" cy="17" r="1.5" />
    </>
  ),
};

export function Icone({
  nome,
  className,
}: {
  nome: NomeIcone;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {CAMINHOS[nome]}
    </svg>
  );
}

export function iconePorCategoria(categoria: string): NomeIcone {
  const mapa: Record<string, NomeIcone> = {
    praia: "praia",
    mercado: "mercado",
    escola: "escola",
    hospital: "saude",
    farmacia: "farmacia",
    restaurante: "restaurante",
  };
  return mapa[categoria] ?? "praia";
}

export function labelPorCategoria(categoria: string): string {
  const mapa: Record<string, string> = {
    praia: "Praia",
    mercado: "Mercado",
    escola: "Escola",
    hospital: "Saúde",
    farmacia: "Farmácia",
    restaurante: "Restaurante",
  };
  return mapa[categoria] ?? categoria;
}
