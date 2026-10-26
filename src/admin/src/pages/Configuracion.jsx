import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL, adminHeaders, mensajeError, redirigirSiNoAutorizado, useAdminCollection } from "./useAdminCollection.js";

const campo = "w-full border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-[#a51c1c]";
const etiqueta = "grid gap-1.5 text-xs font-semibold! text-neutral-700";
const fotoVacia = { titulo: "", descripcion: "", url: "", publicId: "", orden: 0, activo: true };

export default function Galeria() {
  const navigate = useNavigate();
  const { filas: galerias, setFilas, cargando, error, recargar } = useAdminCollection("/api/admin/galerias");
  const { filas: biblioteca, error: errorBiblioteca } = useAdminCollection("/api/imagenes");
  const [galeriaId, setGaleriaId] = useState(null);
  const [fotoModal, setFotoModal] = useState(false);
  const [fotoEditando, setFotoEditando] = useState(null);
  const [borrador, setBorrador] = useState(fotoVacia);
  const [guardando, setGuardando] = useState(false);
  const [errorOperacion, setErrorOperacion] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");
  const galeriaActiva = galerias.find((galeria) => galeria.id === galeriaId);
  const normalizar = (valor) => String(valor || "").trim().toLocaleLowerCase();
  const imagenesDelServicio = galeriaActiva
    ? biblioteca.filter((imagen) => imagen.activo !== false && [galeriaActiva.servicio?.nombre, galeriaActiva.nombre]
      .some((nombre) => normalizar(nombre) === normalizar(imagen.seccion)))
    : [];

  const abrirAgregar = () => {
    setFotoEditando(null);
    setBorrador({ ...fotoVacia, orden: galeriaActiva?.imagenes?.length || 0 });
    setErrorOperacion("");
    setFotoModal(true);
  };

  const abrirEdicion = (foto) => {
    setFotoEditando(foto);
    setBorrador({
      titulo: foto.titulo || "",
      descripcion: foto.descripcion || "",
      url: foto.url || "",
      publicId: foto.publicId || "",
      orden: foto.orden || 0,
      activo: Boolean(foto.activo),
    });
    setErrorOperacion("");
    setFotoModal(true);
  };

  const seleccionarImagen = (id) => {
    const imagen = imagenesDelServicio.find((item) => String(item.id) === id);
    if (!imagen) return;
    setBorrador((actual) => ({ ...actual, titulo: actual.titulo || imagen.nombre, url: imagen.url, publicId: imagen.publicId || "" }));
  };

  const guardarFoto = async (evento) => {
    evento.preventDefault();
    if (!galeriaActiva || guardando) return;
    if (!imagenesDelServicio.some((imagen) => imagen.url === borrador.url.trim())) return setErrorOperacion("Selecciona una imagen correspondiente a este servicio.");
    setGuardando(true);
    setErrorOperacion("");
    setMensajeExito("");
    const payload = {
      titulo: borrador.titulo.trim() || null,
      descripcion: borrador.descripcion.trim() || null,
      url: borrador.url.trim(),
      publicId: borrador.publicId.trim() || null,
      orden: Number(borrador.orden) || 0,
      activo: borrador.activo,
    };
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/galerias/${galeriaActiva.id}/imagenes${fotoEditando ? `/${fotoEditando.id}` : ""}`, {
        method: fotoEditando ? "PATCH" : "POST",
        headers: adminHeaders(true),
        body: JSON.stringify(payload),
      });
      const body = await response.json().catch(() => ({}));
      redirigirSiNoAutorizado(response, navigate);
      if (!response.ok) throw new Error(body.error || "No se pudo guardar la fotografía.");
      setFilas((actuales) => actuales.map((galeria) => galeria.id !== galeriaActiva.id ? galeria : {
        ...galeria,
        imagenes: fotoEditando
          ? (galeria.imagenes || []).map((foto) => foto.id === body.id ? body : foto)
          : [...(galeria.imagenes || []), body].sort((a, b) => a.orden - b.orden || a.id - b.id),
      }));
      setFotoModal(false);
      setMensajeExito(fotoEditando ? "Fotografía actualizada." : "Fotografía agregada.");
    } catch (reason) {
      setErrorOperacion(mensajeError(reason));
    } finally {
      setGuardando(false);
    }
  };

  const eliminarFoto = async (foto) => {
    if (!galeriaActiva || !window.confirm("¿Eliminar esta fotografía de la galería?")) return;
    setErrorOperacion("");
    setMensajeExito("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/galerias/${galeriaActiva.id}/imagenes/${foto.id}`, { method: "DELETE", headers: adminHeaders() });
      redirigirSiNoAutorizado(response, navigate);
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || "No se pudo eliminar la fotografía.");
      }
      setFilas((actuales) => actuales.map((galeria) => galeria.id === galeriaActiva.id
        ? { ...galeria, imagenes: (galeria.imagenes || []).filter((item) => item.id !== foto.id) }
        : galeria));
      setMensajeExito("Fotografía eliminada.");
    } catch (reason) {
      setErrorOperacion(mensajeError(reason));
    }
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-350 px-5 py-8 sm:px-7 md:px-10 md:py-10 xl:px-12">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div><p className="mb-2 text-[10px] font-semibold! tracking-[.2em] text-neutral-500 uppercase sm:text-xs">Administración</p><h1 className="m-0 font-[Georgia] text-3xl font-normal! text-neutral-900 sm:text-4xl">Galería</h1><p className="mb-0 mt-2 text-xs text-neutral-500 sm:text-sm">Las secciones vinculadas a Servicios se crean automáticamente.</p></div>
        <button className="border border-neutral-300 bg-white px-4 py-2.5 text-xs font-semibold! text-neutral-800 hover:border-[#b51f2a] hover:text-[#a51c1c] sm:text-sm" type="button" onClick={recargar}>Actualizar</button>
      </div>
      {mensajeExito && <p className="mb-4 text-sm text-neutral-800" role="status">{mensajeExito}</p>}
      {errorOperacion && !fotoModal && <p className="mb-4 text-sm text-[#a51c1c]" role="alert">{errorOperacion}</p>}
      {error ? <div className="border border-neutral-200 bg-white p-5 text-sm text-[#a51c1c]" role="alert">{error}</div>
        : cargando ? <p className="border border-neutral-200 bg-white p-8 text-sm text-neutral-500">Cargando galerías…</p>
          : galerias.length ? <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{galerias.map((galeria) => <article className="overflow-hidden border border-neutral-200 bg-white" key={galeria.id}>
            <div className="p-5"><div className="mb-3 flex items-start justify-between gap-3"><div><h2 className="m-0 font-[Georgia] text-xl font-normal! text-neutral-900">{galeria.nombre}</h2><p className="mb-0 mt-1 text-xs text-neutral-500">{galeria.servicio ? `Servicio: ${galeria.servicio.nombre}` : "Galería existente"}</p></div><span className={`shrink-0 border px-2.5 py-1 text-[10px] font-semibold! uppercase ${galeria.activo ? "border-[#a51c1c] bg-[#a51c1c] text-white" : "border-neutral-300 bg-white text-neutral-600"}`}>{galeria.activo ? "Activa" : "Oculta"}</span></div>
              {galeria.descripcion && <p className="mb-4 text-sm leading-6 text-neutral-600">{galeria.descripcion}</p>}
              <p className="mb-4 text-xs text-neutral-500">{galeria.imagenes?.length || 0} fotografías</p>
              <button type="button" onClick={() => { setGaleriaId(galeria.id); setErrorOperacion(""); }} className="border border-[#a51c1c] px-3 py-2 text-xs font-semibold! text-[#a51c1c] hover:bg-[#a51c1c] hover:text-white">Administrar fotografías</button>
            </div>
          </article>)}</div>
          : <div className="border border-neutral-200 bg-white px-6 py-12 text-center"><h2 className="mb-2 font-[Georgia] text-xl font-normal! text-neutral-900">Todavía no hay secciones</h2><p className="m-0 text-sm text-neutral-500">Al crear un servicio aparecerá aquí su sección de galería.</p></div>}

      {galeriaActiva && <div className="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto bg-black/55 p-3 sm:p-4" onMouseDown={(evento) => { if (evento.target === evento.currentTarget) setGaleriaId(null); }}><section role="dialog" aria-modal="true" aria-labelledby="galeria-modal-titulo" className="my-auto max-h-[90vh] w-full max-w-5xl overflow-y-auto border border-neutral-300 bg-white p-4 shadow-2xl sm:p-6">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-4"><div><p className="mb-2 text-[10px] font-semibold! tracking-[.2em] text-[#a51c1c] uppercase">{galeriaActiva.servicio ? "Servicio" : "Galería"}</p><h2 id="galeria-modal-titulo" className="m-0 font-[Georgia] text-2xl font-normal! text-neutral-900">{galeriaActiva.nombre}</h2></div><div className="flex gap-2"><button type="button" onClick={abrirAgregar} className="border border-[#a51c1c] bg-[#a51c1c] px-3 py-2 text-xs font-semibold! text-white hover:bg-black">Agregar fotografía</button><button type="button" onClick={() => setGaleriaId(null)} className="border border-neutral-300 bg-white px-3 py-2 text-xs font-semibold! text-neutral-700">Cerrar</button></div></div>
        {errorOperacion && !fotoModal && <p className="mb-4 text-sm text-[#a51c1c]" role="alert">{errorOperacion}</p>}
        {galeriaActiva.imagenes?.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{galeriaActiva.imagenes.map((foto) => <article key={foto.id} className="overflow-hidden border border-neutral-200"><img src={foto.url} alt={foto.titulo || galeriaActiva.nombre} className="h-48 w-full object-cover" /><div className="p-4"><div className="mb-3 flex items-start justify-between gap-3"><div><h3 className="m-0 text-sm font-semibold! text-neutral-900">{foto.titulo || "Sin título"}</h3>{foto.descripcion && <p className="mb-0 mt-1 text-xs text-neutral-600">{foto.descripcion}</p>}</div><span className="text-[10px] uppercase text-neutral-500">{foto.activo ? "Activa" : "Oculta"}</span></div><div className="flex gap-2 border-t border-neutral-200 pt-3"><button type="button" onClick={() => abrirEdicion(foto)} className="border border-neutral-300 px-3 py-2 text-xs font-semibold! text-neutral-700 hover:border-[#a51c1c] hover:text-[#a51c1c]">Editar</button><button type="button" onClick={() => eliminarFoto(foto)} className="border border-neutral-300 px-3 py-2 text-xs font-semibold! text-neutral-600 hover:border-[#a51c1c] hover:text-[#a51c1c]">Eliminar</button></div></div></article>)}</div>
          : <div className="border border-dashed border-neutral-300 px-5 py-12 text-center"><p className="mb-4 text-sm text-neutral-500">Esta sección todavía no tiene fotografías.</p><button type="button" onClick={abrirAgregar} className="border border-[#a51c1c] px-3 py-2 text-xs font-semibold! text-[#a51c1c] hover:bg-[#a51c1c] hover:text-white">Agregar primera fotografía</button></div>}
      </section></div>}

      {fotoModal && galeriaActiva && <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/55 p-3 sm:p-4" onMouseDown={(evento) => { if (evento.target === evento.currentTarget && !guardando) setFotoModal(false); }}><section role="dialog" aria-modal="true" aria-labelledby="foto-modal-titulo" className="my-auto max-h-[90vh] w-full max-w-xl overflow-y-auto border border-neutral-300 bg-white p-4 shadow-2xl sm:p-6">
        <p className="mb-2 text-[10px] font-semibold! tracking-[.2em] text-[#a51c1c] uppercase">{galeriaActiva.nombre}</p><h2 id="foto-modal-titulo" className="mb-5 font-[Georgia] text-2xl font-normal! text-neutral-900">{fotoEditando ? "Editar fotografía" : "Agregar fotografía"}</h2>
        <form className="grid gap-4" onSubmit={guardarFoto}>
          <label className={etiqueta}>Imagen para {galeriaActiva.servicio?.nombre || galeriaActiva.nombre}<select className={campo} required value={imagenesDelServicio.find((imagen) => imagen.url === borrador.url)?.id || ""} onChange={(evento) => seleccionarImagen(evento.target.value)}><option value="">Selecciona una imagen</option>{imagenesDelServicio.map((imagen) => <option key={imagen.id} value={imagen.id}>{imagen.nombre}</option>)}</select></label>
          {errorBiblioteca && <p className="m-0 text-xs text-[#a51c1c]">Biblioteca no disponible: {errorBiblioteca}.</p>}
          {!errorBiblioteca && imagenesDelServicio.length === 0 && <p className="m-0 text-xs text-neutral-500">No hay imágenes registradas para este servicio.</p>}
          <label className={etiqueta}>Título<input className={campo} maxLength={160} value={borrador.titulo} onChange={(evento) => setBorrador((actual) => ({ ...actual, titulo: evento.target.value }))} /></label>
          <label className={etiqueta}>Descripción<textarea className={campo} rows={2} value={borrador.descripcion} onChange={(evento) => setBorrador((actual) => ({ ...actual, descripcion: evento.target.value }))} /></label>
          <div className="grid gap-4 sm:grid-cols-2"><label className={etiqueta}>Orden<input className={campo} type="number" min="0" step="1" value={borrador.orden} onChange={(evento) => setBorrador((actual) => ({ ...actual, orden: evento.target.value }))} /></label><label className="flex items-center gap-3 self-end pb-2 text-xs font-semibold! text-neutral-700"><input type="checkbox" checked={borrador.activo} onChange={(evento) => setBorrador((actual) => ({ ...actual, activo: evento.target.checked }))} className="accent-[#a51c1c]" />Visible</label></div>
          {errorOperacion && <p className="m-0 text-sm text-[#a51c1c]" role="alert">{errorOperacion}</p>}
          <div className="flex justify-end gap-3 border-t border-neutral-200 pt-4"><button type="button" disabled={guardando} onClick={() => setFotoModal(false)} className="border border-neutral-300 bg-white px-4 py-2.5 text-xs font-semibold! text-neutral-700">Cancelar</button><button type="submit" disabled={guardando} className="border border-[#a51c1c] bg-[#a51c1c] px-4 py-2.5 text-xs font-semibold! text-white disabled:opacity-60">{guardando ? "Guardando…" : "Guardar"}</button></div>
        </form>
      </section></div>}
    </main>
  );
}
