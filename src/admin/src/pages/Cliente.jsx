import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL, adminHeaders, mensajeError, redirigirSiNoAutorizado, useAdminCollection } from "./useAdminCollection.js";

export default function Clientes() {
  const navigate = useNavigate();
  const { filas, setFilas, cargando, error, recargar } = useAdminCollection("/api/clientes");
  const [busqueda, setBusqueda] = useState("");
  const [clienteEditando, setClienteEditando] = useState(null);
  const [borrador, setBorrador] = useState({ nombre: "", email: "", telefono: "" });
  const [guardando, setGuardando] = useState(false);
  const [errorEdicion, setErrorEdicion] = useState("");
  const [errorPago, setErrorPago] = useState("");
  const [reservacionSeleccionada, setReservacionSeleccionada] = useState({});

  const filasVisibles = filas.filter((cliente) => String(cliente.nombre ?? "").toLocaleLowerCase().includes(busqueda.trim().toLocaleLowerCase()));
  const iniciarEdicion = (cliente) => {
    setClienteEditando(cliente);
    setBorrador({ nombre: cliente.nombre ?? "", email: cliente.email ?? "", telefono: cliente.telefono ?? "" });
    setErrorEdicion("");
  };

  const guardarEdicion = async (evento) => {
    evento.preventDefault();
    setGuardando(true);
    setErrorEdicion("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/clientes/${clienteEditando.id}`, { method: "PATCH", headers: adminHeaders(true), body: JSON.stringify(borrador) });
      const body = response.status === 204 ? null : await response.json();
      redirigirSiNoAutorizado(response, navigate);
      if (!response.ok) throw new Error(body?.error || "No se pudo guardar la edición.");
      setFilas((actuales) => actuales.map((cliente) => cliente.id === clienteEditando.id ? { ...cliente, ...body } : cliente));
      setClienteEditando(null);
    } catch (reason) {
      setErrorEdicion(mensajeError(reason));
    } finally {
      setGuardando(false);
    }
  };

  const actualizarPago = async (clienteId, reservacionId, estadoPago) => {
    setErrorPago("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/reservaciones/${reservacionId}`, { method: "PATCH", headers: adminHeaders(true), body: JSON.stringify({ estadoPago }) });
      const body = await response.json();
      redirigirSiNoAutorizado(response, navigate);
      if (!response.ok) throw new Error(body.error || "No se pudo actualizar el pago.");
      setFilas((actuales) => actuales.map((cliente) => cliente.id === clienteId ? { ...cliente, reservaciones: cliente.reservaciones.map((reserva) => reserva.id === reservacionId ? { ...reserva, estadoPago: body.estadoPago } : reserva) } : cliente));
      setClienteEditando((actual) => actual?.id === clienteId ? { ...actual, reservaciones: actual.reservaciones.map((reserva) => reserva.id === reservacionId ? { ...reserva, estadoPago: body.estadoPago } : reserva) } : actual);
    } catch (reason) {
      setErrorPago(mensajeError(reason));
    }
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-350 px-5 py-8 sm:px-7 md:px-10 md:py-10 xl:px-12">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><p className="mb-2 text-[10px] font-semibold! tracking-[.2em] text-neutral-500 uppercase sm:text-xs">Administración</p><h1 className="m-0 font-[Georgia] text-3xl font-normal! text-neutral-900 sm:text-4xl">Clientes</h1><p className="mb-0 mt-2 text-xs text-neutral-500 sm:text-sm">Consulta los registros de Studio13.</p></div><button className="border border-neutral-300 bg-white px-4 py-2.5 text-xs font-semibold! text-neutral-800 transition-colors hover:border-[#b51f2a] hover:text-[#a51c1c] sm:text-sm" type="button" onClick={recargar}>Actualizar</button></div>
      <div className="mb-4 max-w-lg"><label className="mb-2 block text-xs font-semibold! text-neutral-700" htmlFor="buscar-clientes">Buscar clientes por nombre</label><input id="buscar-clientes" type="search" value={busqueda} onChange={(evento) => setBusqueda(evento.target.value)} placeholder="Escribe un nombre..." className="w-full border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-[#a51c1c] focus:ring-2 focus:ring-[#a51c1c]/15" /></div>
      {errorPago && <p className="mb-4 text-sm text-[#a51c1c]" role="alert">{errorPago}</p>}
      <div className="overflow-hidden border border-neutral-200 bg-white">{error ? <div className="flex flex-wrap items-center justify-between gap-4 p-5 text-sm text-[#a51c1c]" role="alert"><span>{error}</span><button className="underline" type="button" onClick={recargar}>Reintentar</button></div> : <div className="overflow-x-auto"><table className="w-full min-w-155 border-collapse text-left text-sm"><thead className="bg-[#111] text-white"><tr>{["Nombre", "Correo electrónico", "Teléfono", "Reservación", "Estado de pago", "Acciones"].map((titulo) => <th className="px-5 py-4 text-xs font-semibold! tracking-wide" key={titulo}>{titulo}</th>)}</tr></thead><tbody>
        {cargando ? <tr><td className="px-5 py-8 text-neutral-500" colSpan={6}>Cargando registros…</td></tr> : filasVisibles.length ? filasVisibles.map((cliente) => {
          const reservaciones = cliente.reservaciones || [];
          const reservaId = reservacionSeleccionada[cliente.id] || reservaciones[0]?.id || "";
          const reserva = reservaciones.find((elemento) => elemento.id === reservaId);
          return <tr className="border-t border-neutral-200 even:bg-[#faf9f8]" key={cliente.id}>
            <td className="max-w-80 px-5 py-4 text-neutral-700">{cliente.nombre || "—"}</td><td className="max-w-80 px-5 py-4 text-neutral-700">{cliente.email || "—"}</td><td className="max-w-80 px-5 py-4 text-neutral-700">{cliente.telefono || "—"}</td>
            <td className="min-w-64 px-5 py-4">{reservaciones.length ? <select aria-label={`Reservación de ${cliente.nombre}`} value={reservaId} onChange={(evento) => setReservacionSeleccionada((actual) => ({ ...actual, [cliente.id]: evento.target.value }))} className="w-full border border-neutral-300 bg-white px-2 py-2 text-xs text-neutral-700">{reservaciones.map((item) => <option key={item.id} value={item.id}>{item.tipoSesion}{item.fecha ? ` · ${new Intl.DateTimeFormat("es", { dateStyle: "medium" }).format(new Date(item.fecha))}` : ""}</option>)}</select> : <span className="text-xs text-neutral-500">Sin reservaciones</span>}</td>
            <td className="whitespace-nowrap px-5 py-4">{reserva ? <select aria-label={`Estado de pago de ${reserva.tipoSesion}`} value={reserva.estadoPago || "PENDIENTE"} onChange={(evento) => actualizarPago(cliente.id, reserva.id, evento.target.value)} className="border border-neutral-300 bg-white px-2 py-1"><option value="PENDIENTE">Pendiente de pago</option><option value="PAGADO">Pagado</option></select> : <span className="text-xs text-neutral-500">—</span>}</td>
            <td className="whitespace-nowrap px-5 py-4"><button className="border border-[#a51c1c] px-3 py-2 text-xs font-semibold! text-[#a51c1c] transition-colors hover:bg-[#a51c1c] hover:text-white" type="button" onClick={() => iniciarEdicion(cliente)}>Editar</button></td>
          </tr>;
        }) : <tr><td className="px-5 py-8 text-neutral-500" colSpan={6}>{busqueda.trim() ? "No hay clientes que coincidan con esa búsqueda." : "Todavía no hay registros para mostrar."}</td></tr>}
      </tbody></table></div>}</div>      {!cargando && !error && <p className="mt-3 text-xs text-neutral-500">{filasVisibles.length} {filasVisibles.length === 1 ? "cliente" : "clientes"}</p>}
      {clienteEditando && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4" onMouseDown={(evento) => { if (evento.target === evento.currentTarget && !guardando) setClienteEditando(null); }}><section role="dialog" aria-modal="true" aria-labelledby="editar-cliente-titulo" className="w-full max-w-lg border border-neutral-200 bg-white p-6 shadow-2xl sm:p-8"><p className="mb-2 text-[10px] font-semibold! tracking-[.2em] text-[#a51c1c] uppercase">Clientes</p><h2 id="editar-cliente-titulo" className="mb-6 text-2xl text-neutral-900">Editar cliente</h2><form className="grid gap-5" onSubmit={guardarEdicion}>
        {[{ key: "nombre", label: "Nombre", type: "text" }, { key: "email", label: "Correo electrónico", type: "email" }, { key: "telefono", label: "Teléfono", type: "tel" }].map((campo) => <label className="grid gap-2 text-xs font-semibold! text-neutral-700" key={campo.key}>{campo.label}<input required type={campo.type} value={borrador[campo.key]} onChange={(evento) => setBorrador((actual) => ({ ...actual, [campo.key]: evento.target.value }))} className="w-full border border-neutral-300 bg-white px-3 py-3 text-sm font-normal! text-neutral-900 outline-none focus:border-[#a51c1c] focus:ring-2 focus:ring-[#a51c1c]/15" /></label>)}
        <p className="text-xs text-neutral-500">Las reservaciones relacionadas mostrarán automáticamente el nombre actualizado.</p>{errorEdicion && <p className="m-0 text-sm text-[#a51c1c]" role="alert">{errorEdicion}</p>}<div className="mt-1 flex flex-wrap justify-end gap-3"><button className="border border-neutral-300 bg-white px-4 py-2.5 text-xs font-semibold! text-neutral-700" type="button" disabled={guardando} onClick={() => setClienteEditando(null)}>Cancelar</button><button className="border border-[#a51c1c] bg-[#a51c1c] px-4 py-2.5 text-xs font-semibold! text-white disabled:opacity-60" type="submit" disabled={guardando}>{guardando ? "Guardando…" : "Guardar cambios"}</button></div>
      </form></section></div>}
    </main>
  );
}
