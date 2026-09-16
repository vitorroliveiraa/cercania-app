import Image from "next/image";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <Image
        src="/brand/simbolo-verde.svg"
        alt=""
        width={56}
        height={56}
        priority
      />
      <h1 className="font-display text-3xl font-semibold text-verde-mata">
        Cercania
      </h1>
      <p className="max-w-sm text-cinza-oliva">
        Inteligência de localização para imóveis. Landing em construção.
      </p>
    </main>
  );
}
