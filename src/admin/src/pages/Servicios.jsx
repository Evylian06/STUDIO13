import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL, adminHeaders, mensajeError, redirigirSiNoAutorizado, useAdminCollection } from "./useAdminCollection.js";

const campo = "w-full border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-[#a51c1c]";
const etiqueta = "grid gap-1.5 text-xs font-semibold! text-neutral-700";
const servicioVacio = { nombre: "", descripcion: "", imagenUrl: "", activo: true };

export default function Servicios() {
  const navigate = useNavigate();
  const { filas: servicios, setFilas, cargando, error, recargar } = useAdminCollection("/api/admin/servicios");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [servicioEditando, setServicioEditando] = useState(null);
  const [borrador, setBorrador] = useState(servicioVacio);
  const [guardando, setGuardando] = useState(false);
  const [errorOperacion, setErrorOperacion] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");

  const abrirNuevo = () => {
    setServicioEditando(null);
    setBorrador({ ...servicioVacio });
    setErrorOperacion("");
    setModalAbierto(true);
  };

  const abrirEdicion = (servicio) => {
    setServicioEditando(servicio);
    setBorrador({
      nombre: servicio.nombre || "",
      descripcion: servicio.descripcion || "",
      imagenUrl: servicio.imagenUrl || "",
      activo: Boolean(servicio.activo),
    });
    setErrorOperacion("");
    setModalAbierto(true);
  };

  const guardar = async (evento) => {
    evento.preventDefault();
    if (guardando) return;
    if (!borrador.nombre.trim()) return setErrorOperacion("El nombre del servicio es obligatorio.");
    setGuardando(true);
    setErrorOperacion("");
    setMensajeExito("");
    try {
      const mismaImagen = borrador.imagenUrl.trim() === (servicioEditando?.imagenUrl || "");
      const response = await fetch(`${API_BASE_URL}/api/admin/servicios${servicioEditando ? `/${servicioEditando.id}` : ""}`, {
        method: servicioEditando ? "PATCH" : "POST",
        headers: adminHeaders(true),
        body: JSON.stringify({
          nombre: borrador.nombre.trim(),
          descripcion: borrador.descripcion.trim() || null,
          imagenUrl: borrador.imagenUrl.trim() || null,
          publicId: mismaImagen ? servicioEditando?.publicId ?? null : null,
          orden: servicioEditando?.orden ?? servicios.length,
          activo: borrador.activo,
        }),
      });
      const body = await response.json().catch(() => ({}));
      redirigirSiNoAutorizado(response, navigate);
      if (!response.ok) throw new Error(body.error || "No se pudo guardar el servicio.");
      setFilas((actuales) => servicioEditando
        ? actuales.map((item) => item.id === body.id ? body : item)
        : [...actuales, body].sort((a, b) => a.orden - b.orden || a.id - b.id));
      setModalAbierto(false);
      setServicioEditando(null);
      setMensajeExito(servicioEditando ? "Servicio actualizado." : "Servicio creado; su sección ya está en Galería.");
    } catch (reason) {
      setErrorOperacion(mensajeError(reason));
    } finally {
      setGuardando(false);
    }
  };

  const cambiarPublicacion = async (servicio) => {
    setMensajeExito("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/servicios/${servicio.id}`, {
        method: "PATCH",
        headers: adminHeaders(true),
        body: JSON.stringify({ activo: !servicio.activo }),
      });
      const body = await response.json().catch(() => ({}));
      redirigirSiNoAutorizado(response, navigate);
      if (!response.ok) throw new Error(body.error || "No se pudo cambiar la publicación del servicio.");
      setFilas((actuales) => actuales.map((item) => item.id === body.id ? body : item));
      setMensajeExito(body.activo ? "Servicio publicado." : "Servicio despublicado.");
    } catch (reason) {
      setErrorOperacion(mensajeError(reason));
    }
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-350 px-5 py-8 sm:px-7 md:px-10 md:py-10 xl:px-12">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div><p className="mb-2 text-[10px] font-semibold! tracking-[.2em] text-neutral-500 uppercase sm:text-xs">Administración</p><h1 className="m-0 font-[Georgia] text-3xl font-normal! text-neutral-900 sm:text-4xl">Servicios</h1><p className="mb-0 mt-2 text-xs text-neutral-500 sm:text-sm">Administra los servicios que ofrece Studio13.</p></div>
        <div className="flex gap-3"><button className="border border-[#a51c1c] bg-[#a51c1c] px-4 py-2.5 text-xs font-semibold! text-white hover:bg-black sm:text-sm" type="button" onClick={abrirNuevo}>Nuevo servicio</button><button className="border border-neutral-300 bg-white px-4 py-2.5 text-xs font-semibold! text-neutral-800 hover:border-[#b51f2a] hover:text-[#a51c1c] sm:text-sm" type="button" onClick={recargar}>Actualizar</button></div>
      </div>
      {mensajeExito && <p className="mb-4 text-sm text-neutral-800" role="status">{mensajeExito}</p>}
      {errorOperacion && !modalAbierto && <p className="mb-4 text-sm text-[#a51c1c]" role="alert">{errorOperacion}</p>}
      {error ? <div className="border border-neutral-200 bg-white p-5 text-sm text-[#a51c1c]" role="alert">{error}</div>
        : cargando ? <p className="border border-neutral-200 bg-white p-8 text-sm text-neutral-500">Cargando servicios…</p>
          : servicios.length ? <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{servicios.map((servicio) => <article className="overflow-hidden border border-neutral-200 bg-white" key={servicio.id}>
            {servicio.imagenUrl && <img className="h-48 w-full border-b border-neutral-200 object-cover" src={servicio.imagenUrl} alt={servicio.nombre} />}
            <div className="p-5"><div className="mb-3 flex items-start justify-between gap-3"><h2 className="m-0 font-[Georgia] text-xl font-normal! text-neutral-900">{servicio.nombre}</h2><span className={`shrink-0 border px-2.5 py-1 text-[10px] font-semibold! uppercase ${servicio.activo ? "border-[#a51c1c] bg-[#a51c1c] text-white" : "border-neutral-300 bg-white text-neutral-600"}`}>{servicio.activo ? "Publicado" : "Oculto"}</span></div>
              {servicio.descripcion && <p className="mb-5 whitespace-pre-wrap text-sm leading-6 text-neutral-600">{servicio.descripcion}</p>}
              <div className="flex flex-wrap gap-2 border-t border-neutral-200 pt-4"><button type="button" onClick={() => abrirEdicion(servicio)} className="border border-[#a51c1c] px-3 py-2 text-xs font-semibold! text-[#a51c1c] hover:bg-[#a51c1c] hover:text-white">Editar</button><button type="button" onClick={() => cambiarPublicacion(servicio)} className="border border-neutral-400 px-3 py-2 text-xs font-semibold! text-neutral-700 hover:border-black hover:text-black">{servicio.activo ? "Despublicar" : "Publicar"}</button></div>
            </div>
          </article>)}</div>
          : <div className="border border-neutral-200 bg-white px-6 py-12 text-center"><h2 className="mb-2 font-[Georgia] text-xl font-normal! text-neutral-900">Todavía no hay servicios</h2><p className="mb-5 text-sm text-neutral-500">Crea un servicio para que su sección aparezca automáticamente en Galería.</p><button type="button" onClick={abrirNuevo} className="border border-[#a51c1c] bg-[#a51c1c] px-4 py-2.5 text-xs font-semibold! text-white hover:bg-black">Nuevo servicio</button></div>}

      {modalAbierto && <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/55 p-3 sm:p-4" onMouseDown={(evento) => { if (evento.target === evento.currentTarget && !guardando) setModalAbierto(false); }}><section role="dialog" aria-modal="true" aria-labelledby="servicio-modal-titulo" className="my-auto w-full max-w-xl border border-neutral-300 bg-white p-4 shadow-2xl sm:p-6">
        <p className="mb-2 text-[10px] font-semibold! tracking-[.2em] text-[#a51c1c] uppercase">Servicios</p><h2 id="servicio-modal-titulo" className="mb-5 font-[Georgia] text-2xl font-normal! text-neutral-900">{servicioEditando ? "Editar servicio" : "Nuevo servicio"}</h2>
        <form className="grid gap-4" onSubmit={guardar}>
          <label className={etiqueta}>Nombre<input className={campo} required maxLength={120} value={borrador.nombre} onChange={(evento) => setBorrador((actual) => ({ ...actual, nombre: evento.target.value }))} /></label>
          <label className={etiqueta}>Descripción<textarea className={campo} rows={3} value={borrador.descripcion} onChange={(evento) => setBorrador((actual) => ({ ...actual, descripcion: evento.target.value }))} /></label>
          <label className={etiqueta}>Imagen representativa (URL)<input className={campo} type="url" value={borrador.imagenUrl} onChange={(evento) => setBorrador((actual) => ({ ...actual, imagenUrl: evento.target.value }))} /></label>
          <label className="flex items-center gap-3 text-xs font-semibold! text-neutral-700"><input type="checkbox" checked={borrador.activo} onChange={(evento) => setBorrador((actual) => ({ ...actual, activo: evento.target.checked }))} className="accent-[#a51c1c]" />Publicado</label>
          {errorOperacion && <p className="m-0 text-sm text-[#a51c1c]" role="alert">{errorOperacion}</p>}
          <div className="flex justify-end gap-3 border-t border-neutral-200 pt-4"><button type="button" disabled={guardando} onClick={() => setModalAbierto(false)} className="border border-neutral-300 bg-white px-4 py-2.5 text-xs font-semibold! text-neutral-700">Cancelar</button><button type="submit" disabled={guardando} className="border border-[#a51c1c] bg-[#a51c1c] px-4 py-2.5 text-xs font-semibold! text-white disabled:opacity-60">{guardando ? "Guardando…" : "Guardar"}</button></div>
        </form>
      </section></div>}
    </main>
  );
}
