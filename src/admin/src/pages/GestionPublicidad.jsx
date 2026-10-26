import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL, adminHeaders, mensajeError, redirigirSiNoAutorizado, useAdminCollection } from "./useAdminCollection.js";

const servicios = ["Corporativas", "Quince\u00f1ero", "Fotos Familiares", "Embarazo", "Parejas", "Snacks Queik", "Eventos", "Exteriores", "Talleres"];
const formularioVacio = { titulo: "", servicio: servicios[0], descripcion: "", enlace: "", textoBoton: "Ver mas", imagenPreview: "", archivoImagen: null };
const campo = "w-full border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-[#a51c1c]";
const etiqueta = "grid gap-1.5 text-xs font-semibold! text-neutral-700";
const urlImagen = (url) => url?.startsWith("http") ? url : `${API_BASE_URL}${url || ""}`;

export default function GestionPublicidad() {
  const navigate = useNavigate();
  const [formulario, setFormulario] = useState(formularioVacio);
  const { filas: anuncios, setFilas: setAnuncios, cargando, error, recargar } = useAdminCollection("/api/admin/publicidad");
  const [guardando, setGuardando] = useState(false);
  const [errorOperacion, setErrorOperacion] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");
  const archivoRef = useRef(null);
  const imagenesRef = useRef([]);
  imagenesRef.current = [formulario.imagenPreview].filter(Boolean);

  useEffect(() => () => imagenesRef.current.forEach((url) => URL.revokeObjectURL(url)), []);

  const seleccionarImagen = (archivo) => {
    if (!archivo || !["image/jpeg", "image/png", "image/webp"].includes(archivo.type) || archivo.size > 5 * 1024 * 1024) return;
    if (formulario.imagenPreview) URL.revokeObjectURL(formulario.imagenPreview);
    setFormulario((actual) => ({ ...actual, archivoImagen: archivo, imagenPreview: URL.createObjectURL(archivo) }));
  };

  const crearAnuncio = async (evento) => {
    evento.preventDefault();
    if (guardando) return;
    if (!formulario.archivoImagen) return setErrorOperacion("Selecciona una imagen para el anuncio.");
    setGuardando(true);
    setErrorOperacion("");
    setMensajeExito("");
    const datos = new FormData();
    datos.append("titulo", formulario.titulo.trim());
    datos.append("servicio", formulario.servicio);
    datos.append("descripcion", formulario.descripcion.trim());
    datos.append("textoBoton", formulario.textoBoton.trim());
    datos.append("enlace", formulario.enlace.trim());
    datos.append("imagen", formulario.archivoImagen);
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/publicidad`, { method: "POST", headers: adminHeaders(), body: datos });
      const body = await response.json().catch(() => ({}));
      redirigirSiNoAutorizado(response, navigate);
      if (!response.ok) throw new Error(body.error || "No se pudo guardar el anuncio.");
      setAnuncios((actuales) => [body, ...actuales]);
      if (formulario.imagenPreview) URL.revokeObjectURL(formulario.imagenPreview);
      setFormulario(formularioVacio);
      if (archivoRef.current) archivoRef.current.value = "";
      setMensajeExito("Anuncio guardado como borrador.");
    } catch (reason) {
      setErrorOperacion(mensajeError(reason));
    } finally {
      setGuardando(false);
    }
  };

  const cambiarPublicacion = async (anuncio) => {
    setErrorOperacion("");
    setMensajeExito("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/publicidad/${anuncio.id}/publicacion`, {
        method: "PATCH",
        headers: adminHeaders(true),
        body: JSON.stringify({ activo: !anuncio.activo }),
      });
      const body = await response.json().catch(() => ({}));
      redirigirSiNoAutorizado(response, navigate);
      if (!response.ok) throw new Error(body.error || "No se pudo actualizar la publicacion.");
      setAnuncios((actuales) => actuales.map((item) => item.id === body.id ? body : item));
      setMensajeExito(body.activo ? "Anuncio publicado." : "Anuncio ocultado.");
    } catch (reason) {
      setErrorOperacion(mensajeError(reason));
    }
  };

  const eliminarAnuncio = async (anuncio) => {
    if (!window.confirm(`Eliminar el anuncio \"${anuncio.nombre}\"?`)) return;
    setErrorOperacion("");
    setMensajeExito("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/publicidad/${anuncio.id}`, { method: "DELETE", headers: adminHeaders() });
      redirigirSiNoAutorizado(response, navigate);
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || "No se pudo eliminar el anuncio.");
      }
      setAnuncios((actuales) => actuales.filter((item) => item.id !== anuncio.id));
      setMensajeExito("Anuncio eliminado.");
    } catch (reason) {
      setErrorOperacion(mensajeError(reason));
    }
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-350 px-5 py-8 sm:px-7 md:px-10 md:py-10 xl:px-12">
      <header className="mb-8">
        <p className="mb-2 text-[10px] font-semibold! tracking-[.2em] text-neutral-500 uppercase sm:text-xs">Contenido promocional</p>
        <h1 className="m-0 font-[Georgia] text-3xl font-normal! text-neutral-900 sm:text-4xl">Gesti&oacute;n publicidad</h1>
        <p className="mb-0 mt-2 max-w-2xl text-sm leading-6 text-neutral-500">Prepara anuncios para promocionar los servicios de Studio13.</p>
      </header>

      {mensajeExito && <p className="mb-4 text-sm text-green-700" role="status">{mensajeExito}</p>}
      {error && <p className="mb-4 border border-red-200 bg-red-50 p-3 text-sm text-[#a51c1c]" role="alert">{error}</p>}
      {errorOperacion && <p className="mb-4 border border-red-200 bg-red-50 p-3 text-sm text-[#a51c1c]" role="alert">{errorOperacion}</p>}

      <div className="grid grid-cols-2 items-start gap-3 sm:gap-6">
        <section className="border border-neutral-200 bg-white p-5 sm:p-6">
          <div className="mb-5"><h2 className="m-0 font-[Georgia] text-xl font-normal! text-neutral-900">Crear anuncio</h2><p className="mb-0 mt-1 text-xs text-neutral-500">Completa los campos y mira como cambia el ejemplo a tu costado.</p></div>
          <form className="grid gap-4" onSubmit={crearAnuncio}>
            <label className={etiqueta}>Titulo del anuncio<input className={campo} required maxLength={100} placeholder="Ej. Captura momentos especiales" value={formulario.titulo} onChange={(evento) => setFormulario((actual) => ({ ...actual, titulo: evento.target.value }))} /></label>
            <label className={etiqueta}>Servicio<select className={campo} value={formulario.servicio} onChange={(evento) => setFormulario((actual) => ({ ...actual, servicio: evento.target.value }))}>{servicios.map((servicio) => <option key={servicio}>{servicio}</option>)}</select></label>
            <label className={etiqueta}>Texto del anuncio<textarea className={campo} rows={4} maxLength={500} placeholder="Describe la promocion o el servicio..." value={formulario.descripcion} onChange={(evento) => setFormulario((actual) => ({ ...actual, descripcion: evento.target.value }))} /></label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className={etiqueta}>Texto del boton<input className={campo} maxLength={32} value={formulario.textoBoton} onChange={(evento) => setFormulario((actual) => ({ ...actual, textoBoton: evento.target.value }))} /></label>
              <label className={etiqueta}>Enlace<input className={campo} type="url" placeholder="https://..." value={formulario.enlace} onChange={(evento) => setFormulario((actual) => ({ ...actual, enlace: evento.target.value }))} /></label>
            </div>
            <label className={etiqueta}>Imagen del anuncio<input ref={archivoRef} className={`${campo} file:mr-3 file:border-0 file:bg-neutral-100 file:px-3 file:py-1.5 file:text-xs file:font-semibold`} type="file" accept="image/jpeg,image/png,image/webp" required onChange={(evento) => seleccionarImagen(evento.target.files?.[0])} /><span className="font-normal! text-neutral-400">JPG, PNG o WEBP. Maximo 5 MB.</span></label>
            <div className="flex justify-end border-t border-neutral-200 pt-4"><button type="submit" disabled={guardando} className="border border-[#a51c1c] bg-[#a51c1c] px-5 py-2.5 text-xs font-semibold! text-white transition-colors hover:bg-black disabled:opacity-60">{guardando ? "Guardando..." : "Guardar borrador"}</button></div>
          </form>
        </section>

        <aside className="border border-neutral-200 bg-white p-5 sm:p-6">
          <div className="mb-5 flex items-start justify-between gap-3"><div><p className="mb-1 text-[10px] font-semibold! tracking-[.18em] text-neutral-500 uppercase">Ejemplo en vivo</p><h2 className="m-0 font-[Georgia] text-xl font-normal! text-neutral-900">Asi se vera el anuncio</h2></div><span className="shrink-0 border border-neutral-300 px-2.5 py-1 text-[10px] font-semibold! text-neutral-500 uppercase">Vista previa</span></div>

          <article className="overflow-hidden border border-neutral-200 bg-white shadow-sm">
            {formulario.imagenPreview ? <img src={formulario.imagenPreview} alt="Vista previa del anuncio" className="aspect-[16/9] w-full object-cover" /> : <div className="flex aspect-[16/9] flex-col items-center justify-center bg-neutral-100 text-neutral-400"><svg aria-hidden="true" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" /></svg><span className="mt-2 text-[10px] uppercase">Imagen del anuncio</span></div>}
            <div className="p-5"><p className="mb-2 text-[10px] font-semibold! tracking-wide text-[#a51c1c] uppercase">{formulario.servicio}</p><h3 className="mb-2 font-[Georgia] text-2xl font-normal! text-neutral-900">{formulario.titulo || "Captura momentos especiales"}</h3><p className="mb-5 min-h-12 text-sm leading-6 text-neutral-600">{formulario.descripcion || "Aqui aparecera el texto para contarle a tus clientes sobre este servicio."}</p><button type="button" disabled className="border border-[#a51c1c] bg-[#a51c1c] px-4 py-2.5 text-xs font-semibold! text-white opacity-90">{formulario.textoBoton || "Ver mas"}</button></div>
          </article>

          <p className="mb-0 mt-4 border-t border-neutral-200 pt-4 text-[10px] leading-5 text-neutral-400">Vista local; los cambios no se guardan ni se publican en internet.</p>
        </aside>
      </div>

      <section className="mt-6 border border-neutral-200 bg-white p-5 sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-3"><div><h2 className="m-0 font-[Georgia] text-xl font-normal! text-neutral-900">Anuncios creados</h2><p className="mb-0 mt-1 text-xs text-neutral-500">{anuncios.length} anuncios registrados</p></div><button type="button" onClick={recargar} className="border border-neutral-300 bg-white px-3 py-2 text-xs font-semibold! text-neutral-700 hover:border-[#a51c1c]">Actualizar</button></div>
        {cargando ? <p className="py-8 text-center text-sm text-neutral-500">Cargando anuncios...</p> : anuncios.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{anuncios.map((anuncio) => <article key={anuncio.id} className="overflow-hidden border border-neutral-200">
          {anuncio.url && <img src={urlImagen(anuncio.url)} alt={anuncio.nombre} className="aspect-[16/9] w-full bg-neutral-100 object-cover" />}
          <div className="p-4"><div className="mb-2 flex items-start justify-between gap-3"><h3 className="m-0 font-[Georgia] text-lg font-normal! text-neutral-900">{anuncio.nombre}</h3><span className={`shrink-0 text-[10px] font-semibold! uppercase ${anuncio.activo ? "text-green-700" : "text-amber-700"}`}>{anuncio.activo ? "Publicado" : "Borrador"}</span></div><p className="mb-2 text-[10px] font-semibold! tracking-wide text-neutral-500 uppercase">{anuncio.seccion}</p>{anuncio.descripcion && <p className="mb-4 text-sm leading-6 text-neutral-600">{anuncio.descripcion}</p>}<div className="flex flex-wrap gap-2"><button type="button" onClick={() => cambiarPublicacion(anuncio)} className="border border-[#a51c1c] px-3 py-2 text-xs font-semibold! text-[#a51c1c] hover:bg-[#a51c1c] hover:text-white">{anuncio.activo ? "Ocultar" : "Publicar"}</button><button type="button" onClick={() => eliminarAnuncio(anuncio)} className="border border-neutral-300 px-3 py-2 text-xs font-semibold! text-neutral-600 hover:border-[#a51c1c] hover:text-[#a51c1c]">Eliminar</button></div></div>
        </article>)}</div>
          : <div className="flex min-h-36 flex-col items-center justify-center border border-dashed border-neutral-200 bg-neutral-50 px-5 text-center"><p className="mb-1 text-sm font-medium! text-neutral-600">Aun no hay anuncios</p><p className="m-0 text-xs text-neutral-400">Guarda un borrador para registrarlo en Gestion publicidad.</p></div>}
        <p className="mb-0 mt-5 border-t border-neutral-200 pt-4 text-[10px] leading-5 text-neutral-400">Los anuncios se guardan como borrador en la base de datos; al publicarlos apareceran en la API publica.</p>
      </section>
    </main>
  );
}
