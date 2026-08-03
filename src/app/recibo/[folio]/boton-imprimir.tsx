"use client";

export function BotonImprimir() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="mt-8 w-full rounded-caja bg-acento px-5 py-4 text-[17px] font-medium text-white print:hidden"
    >
      Imprimir o guardar en PDF
    </button>
  );
}
