import { useAdminCollection } from "./useAdminCollection.js";

export function AdminLista({ titulo, endpoint, columnas }) {
  const { filas, cargando, error, recargar } = useAdminCollection(endpoint);
  const leerValor = (fila, ruta) => ruta.split(".").reduce((valor, llave) => valor?.[llave], fila);

  return (
    <main className="mx-auto min-h-screen w-full max-w-350 px-5 py-8 sm:px-7 md:px-10 md:py-10 xl:px-12">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div><p className="mb-2 text-[10px] font-semibold! tracking-[.2em] text-neutral-500 uppercase sm:text-xs">Administración</p><h1 className="m-0 font-[Georgia] text-3xl font-normal! text-neutral-900 sm:text-4xl">{titulo}</h1><p className="mb-0 mt-2 text-xs text-neutral-500 sm:text-sm">Consulta los registros de Studio13.</p></div>
        <button className="border border-neutral-300 bg-white px-4 py-2.5 text-xs font-semibold! text-neutral-800 transition-colors hover:border-[#b51f2a] hover:text-[#a51c1c] sm:text-sm" type="button" onClick={recargar}>Actualizar</button>
      </div>
      <div className="overflow-hidden border border-neutral-200 bg-white">
        {error ? <div className="flex flex-wrap items-center justify-between gap-4 p-5 text-sm text-[#a51c1c]" role="alert"><span>{error}</span><button className="underline" type="button" onClick={recargar}>Reintentar</button></div> : <div className="overflow-x-auto">
          <table className="w-full min-w-155 border-collapse text-left text-sm"><thead className="bg-[#111] text-white"><tr>{columnas.map((columna) => <th className="px-5 py-4 text-xs font-semibold! tracking-wide" key={columna.key}>{columna.label}</th>)}</tr></thead><tbody>
            {cargando ? <tr><td className="px-5 py-8 text-neutral-500" colSpan={columnas.length}>Cargando registros…</td></tr> : filas.length ? filas.map((fila, indice) => <tr className="border-t border-neutral-200 even:bg-[#faf9f8]" key={fila.id ?? indice}>{columnas.map((columna) => { const valor = leerValor(fila, columna.key); const texto = valor == null || valor === "" ? "—" : typeof valor === "boolean" ? (valor ? "Activo" : "Inactivo") : columna.date ? new Intl.DateTimeFormat("es", { dateStyle: "medium" }).format(new Date(valor)) : String(valor); return <td className="max-w-80 px-5 py-4 text-neutral-700" key={columna.key}><span className="block overflow-hidden text-ellipsis">{texto}</span></td>; })}</tr>) : <tr><td className="px-5 py-8 text-neutral-500" colSpan={columnas.length}>Todavía no hay registros para mostrar.</td></tr>}
          </tbody></table>
        </div>}
      </div>
      {!cargando && !error && <p className="mt-3 text-xs text-neutral-500">{filas.length} {filas.length === 1 ? "registro" : "registros"}</p>}
    </main>
  );
}
