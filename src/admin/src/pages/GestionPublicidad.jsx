import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL, adminHeaders, mensajeError, redirigirSiNoAutorizado, useAdminCollection } from "./useAdminCollection.js";
import { comprimirImagenParaSubida } from "./ImageCompretion.js";

const servicios = ["Informaci\u00f3n del estudio", "Corporativas", "Quince\u00f1ero", "Fotos Familiares", "Embarazo", "Parejas", "Snacks Queik", "Eventos", "Exteriores", "Talleres"];
const formularioVacio = { titulo: "", servicio: servicios[0], descripcion: "", mostrarWhatsapp: false, imagenPreview: "", archivoImagen: null, visibleHasta: "" };
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
  const [pestanaActiva, setPestanaActiva] = useState("crear");
  const [busquedaAnuncio, setBusquedaAnuncio] = useState("");
  const [filtroServicio, setFiltroServicio] = useState("todos");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [ordenFecha, setOrdenFecha] = useState("desc");
  const [anuncioEliminando, setAnuncioEliminando] = useState(null);
  const [eliminando, setEliminando] = useState(false);
  const [anuncioEditando, setAnuncioEditando] = useState(null);
  const [consultasAbiertas, setConsultasAbiertas] = useState(null);
  const [cargandoConsultas, setCargandoConsultas] = useState(false);
  const [guardandoConfiguracion, setGuardandoConfiguracion] = useState(false);
  const archivoRef = useRef(null);
  const imagenesRef = useRef([]);

  useEffect(() => { imagenesRef.current = [formulario.imagenPreview].filter(Boolean); }, [formulario.imagenPreview]);
  useEffect(() => () => imagenesRef.current.forEach((url) => URL.revokeObjectURL(url)), []);
  useEffect(() => {
    if (!mensajeExito) return undefined;
    const timeout = window.setTimeout(() => setMensajeExito(""), 4000);
    return () => window.clearTimeout(timeout);
  }, [mensajeExito]);

  const serviciosDisponibles = [...new Set(anuncios.map((anuncio) => anuncio.seccion).filter(Boolean))].sort((a, b) => a.localeCompare(b, "es"));
  const anunciosFiltrados = anuncios
    .filter((anuncio) => `${anuncio.nombre} ${anuncio.descripcion || ""}`.toLocaleLowerCase().includes(busquedaAnuncio.trim().toLocaleLowerCase()))
    .filter((anuncio) => filtroServicio === "todos" || anuncio.seccion === filtroServicio)
    .filter((anuncio) => filtroEstado === "todos" || (filtroEstado === "vencidos" ? anuncio.visibleHasta && new Date(anuncio.visibleHasta) <= new Date() : filtroEstado === "publicados" ? anuncio.activo : !anuncio.activo))
    .sort((a, b) => (ordenFecha === "desc" ? 1 : -1) * (new Date(a.createdAt || 0) - new Date(b.createdAt || 0)));
  const anunciosPublicados = anuncios.filter((anuncio) => anuncio.activo).length;
  const anunciosBorrador = anuncios.length - anunciosPublicados;

  const seleccionarImagen = (archivo) => {
    if (!archivo || !["image/jpeg", "image/png", "image/webp"].includes(archivo.type) || archivo.size <= 0) {
      setErrorOperacion("Selecciona una imagen JPG, PNG o WEBP válida.");
      return;
    }
    setErrorOperacion("");
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
    datos.append("mostrarWhatsapp", String(formulario.mostrarWhatsapp));
    datos.append("visibleHasta", formulario.visibleHasta ? `${formulario.visibleHasta}:00-05:00` : "");
    try {
      const imagenComprimida = await comprimirImagenParaSubida(formulario.archivoImagen);
      datos.append("imagen", imagenComprimida, imagenComprimida.name);
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

  const guardarConfiguracion = async (evento) => {
    evento.preventDefault();
    if (!anuncioEditando || guardandoConfiguracion) return;
    setGuardandoConfiguracion(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/publicidad/${anuncioEditando.id}`, { method: "PATCH", headers: adminHeaders(true), body: JSON.stringify({ mostrarWhatsapp: anuncioEditando.mostrarWhatsapp === true, visibleHasta: anuncioEditando.visibleHasta ? `${anuncioEditando.visibleHasta}:00-05:00` : null }) });
      const body = await response.json().catch(() => ({}));
      redirigirSiNoAutorizado(response, navigate);
      if (!response.ok) throw new Error(body.error || "No se pudo guardar la configuración.");
      setAnuncios((actuales) => actuales.map((item) => item.id === body.id ? body : item));
      setAnuncioEditando(null); setMensajeExito("Configuración actualizada.");
    } catch (reason) { setErrorOperacion(mensajeError(reason)); }
    finally { setGuardandoConfiguracion(false); }
  };

  const verConsultas = async (anuncio) => {
    setCargandoConsultas(true); setConsultasAbiertas({ anuncio, consultas: [] }); setErrorOperacion("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/publicidad/${anuncio.id}/consultas`, { headers: adminHeaders() });
      const body = await response.json().catch(() => ({}));
      redirigirSiNoAutorizado(response, navigate);
      if (!response.ok) throw new Error(body.error || "No se pudieron cargar las consultas.");
      setConsultasAbiertas(body);
    } catch (reason) { setErrorOperacion(mensajeError(reason)); }
    finally { setCargandoConsultas(false); }
  };

  const fechaLimaInput = (value) => {
    if (!value) return "";
    const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Lima", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date(value));
    const get = (key) => parts.find((part) => part.type === key)?.value || "";
    return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
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
    if (eliminando) return;
    setEliminando(true);
    setErrorOperacion("");
    setMensajeExito("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/publicidad/${anuncio.id}`, { method: "DELETE", headers: adminHeaders() });
      const body = await response.json().catch(() => ({}));
      redirigirSiNoAutorizado(response, navigate);
      if (!response.ok) {
        if (body.image) setAnuncios((actuales) => actuales.map((item) => item.id === anuncio.id ? body.image : item));
        throw new Error(body.error || "No se pudo eliminar el anuncio.");
      }
      setAnuncios((actuales) => actuales.filter((item) => item.id !== anuncio.id));
      setMensajeExito(body.assetPreserved ? "Anuncio eliminado. El archivo se conservó porque también se usa en otra sección." : "Anuncio y archivo eliminados.");
      setAnuncioEliminando(null);
    } catch (reason) {
      setErrorOperacion(mensajeError(reason));
      setAnuncioEliminando(null);
    } finally {
      setEliminando(false);
    }
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-350 px-5 py-8 sm:px-7 md:px-10 md:py-10 xl:px-12">
      <header className="mb-8">
        <p className="mb-2 text-[10px] font-semibold! tracking-[.2em] text-neutral-500 uppercase sm:text-xs">Avisos del estudio</p>
        <h1 className="m-0 font-[Georgia] text-3xl font-normal! text-neutral-900 sm:text-4xl">Gesti&oacute;n publicidad</h1>
        <p className="mb-0 mt-2 max-w-2xl text-sm leading-6 text-neutral-500">Publica avisos sobre horarios, novedades e información de Studio13.</p>
      </header>

      {mensajeExito && <div className="fixed right-5 top-5 z-70 flex w-[min(28rem,calc(100vw-2.5rem))] items-start gap-3 border border-green-200 bg-green-50 px-5 py-4 text-sm text-green-800 shadow-lg" role="status" aria-live="polite"><span aria-hidden="true" className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-700 text-xs font-bold! text-white">✓</span><p className="m-0 flex-1 leading-6">{mensajeExito}</p><button type="button" onClick={() => setMensajeExito("")} aria-label="Cerrar notificación" className="border-0 bg-transparent px-1 text-lg leading-5 text-green-800 hover:text-green-950">×</button></div>}
      {error && <p className="mb-4 border border-red-200 bg-red-50 p-3 text-sm text-[#a51c1c]" role="alert">{error}</p>}
      {errorOperacion && <p className="mb-4 border border-red-200 bg-red-50 p-3 text-sm text-[#a51c1c]" role="alert">{errorOperacion}</p>}

      <div className="mb-6 flex border-b border-neutral-200" role="tablist" aria-label="Secciones de publicidad">
        {[{ id: "crear", label: "Crear anuncio" }, { id: "gestionar", label: "Gestión de publicidad" }].map((tab) => <button key={tab.id} id={`publicidad-tab-${tab.id}`} type="button" role="tab" aria-selected={pestanaActiva === tab.id} aria-controls={`publicidad-panel-${tab.id}`} onClick={() => setPestanaActiva(tab.id)} className={`border-0 border-b-2 px-5 py-3 text-xs font-semibold! tracking-wide transition-colors ${pestanaActiva === tab.id ? "border-[#a51c1c] text-[#a51c1c]" : "border-transparent bg-transparent text-neutral-500 hover:text-neutral-900"}`}>{tab.label}</button>)}
      </div>

      {pestanaActiva === "crear" && <section id="publicidad-panel-crear" role="tabpanel" aria-labelledby="publicidad-tab-crear" className="mb-7 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)]">
        <section className="border border-neutral-200 bg-white p-5 sm:p-6">
          <div className="mb-5"><h2 className="m-0 font-[Georgia] text-xl font-normal! text-neutral-900">Crear anuncio</h2><p className="mb-0 mt-1 text-xs text-neutral-500">Completa los campos y mira como cambia el ejemplo a tu costado.</p></div>
          <form className="grid gap-4" onSubmit={crearAnuncio}>
            <label className={etiqueta}>Título del anuncio<input className={campo} required maxLength={100} placeholder="Ej. Captura momentos especiales" value={formulario.titulo} onChange={(evento) => setFormulario((actual) => ({ ...actual, titulo: evento.target.value }))} /></label>
            <label className={etiqueta}>Categoría del aviso<select className={campo} value={formulario.servicio} onChange={(evento) => setFormulario((actual) => ({ ...actual, servicio: evento.target.value }))}>{servicios.map((servicio) => <option key={servicio}>{servicio}</option>)}</select></label>
            <label className={etiqueta}>Descripción<textarea className={campo} rows={4} maxLength={500} required placeholder="Escribe el horario, novedad o información que quieres compartir..." value={formulario.descripcion} onChange={(evento) => setFormulario((actual) => ({ ...actual, descripcion: evento.target.value }))} /></label>
            <label className={etiqueta}>Imagen del anuncio<input ref={archivoRef} className={`${campo} file:mr-3 file:cursor-pointer file:border-0 file:bg-[#a51c1c] file:px-3 file:py-2 file:text-xs file:font-semibold! file:text-white hover:file:bg-black`} type="file" accept="image/jpeg,image/png,image/webp" required onChange={(evento) => seleccionarImagen(evento.target.files?.[0])} /><span className="font-normal! text-neutral-400">JPG, PNG o WEBP. Las imágenes mayores a 5 MB se comprimen automáticamente.</span></label>
            <label className="flex items-center gap-2 text-xs font-semibold! text-neutral-700"><input type="checkbox" checked={formulario.mostrarWhatsapp} onChange={(e) => setFormulario((actual) => ({ ...actual, mostrarWhatsapp: e.target.checked }))} />Mostrar botón de WhatsApp</label>
            <label className={etiqueta}>Visible hasta <span className="font-normal! text-neutral-500">Fecha y hora de Perú (America/Lima)</span><input className={campo} type="datetime-local" value={formulario.visibleHasta} onChange={(e) => setFormulario((actual) => ({ ...actual, visibleHasta: e.target.value }))} /></label>
            <div className="flex justify-end border-t border-neutral-200 pt-4"><button type="submit" disabled={guardando} className="border border-[#a51c1c] bg-[#a51c1c] px-5 py-2.5 text-xs font-semibold! text-white transition-colors hover:bg-black disabled:opacity-60">{guardando ? "Comprimiendo y guardando..." : "Guardar borrador"}</button></div>
          </form>
        </section>

        <aside className="border border-neutral-200 bg-white p-4 sm:p-5">
          <div className="mb-5 flex items-start justify-between gap-3"><div><p className="mb-1 text-[10px] font-semibold! tracking-[.18em] text-neutral-500 uppercase">Ejemplo en vivo</p><h2 className="m-0 font-[Georgia] text-xl font-normal! text-neutral-900">Asi se vera el anuncio</h2></div><span className="shrink-0 border border-neutral-300 px-2.5 py-1 text-[10px] font-semibold! text-neutral-500 uppercase">Vista previa</span></div>

          <article className="overflow-hidden border border-neutral-200 bg-white shadow-sm">
            {formulario.imagenPreview ? <img src={formulario.imagenPreview} alt="Vista previa del anuncio" className="aspect-[16/8] w-full object-cover" /> : <div className="flex aspect-[16/8] flex-col items-center justify-center bg-neutral-100 text-neutral-400"><svg aria-hidden="true" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" /></svg><span className="mt-1.5 text-[10px] uppercase">Imagen del anuncio</span></div>}
            <div className="p-4"><p className="mb-1.5 text-[10px] font-semibold! tracking-wide text-[#a51c1c] uppercase">{formulario.servicio}</p><h3 className="mb-2 font-[Georgia] text-xl font-normal! text-neutral-900">{formulario.titulo || "Captura momentos especiales"}</h3><p className="mb-4 min-h-10 text-sm leading-6 text-neutral-600">{formulario.descripcion || "Aqui aparecera el texto para contarle a tus clientes sobre este servicio."}</p>{formulario.mostrarWhatsapp && <button type="button" disabled className="border border-[#a51c1c] bg-[#a51c1c] px-4 py-2 text-xs font-semibold! text-white opacity-90">Consultar por WhatsApp</button>}</div>
          </article>

          <p className="mb-0 mt-4 border-t border-neutral-200 pt-4 text-[10px] leading-5 text-neutral-400">Vista local; los cambios no se guardan ni se publican en internet.</p>
        </aside>
      </section>}

      {pestanaActiva === "gestionar" && <section id="publicidad-panel-gestionar" role="tabpanel" aria-labelledby="publicidad-tab-gestionar" className="mb-7">
        <div className="mb-6"><h2 className="m-0 font-[Georgia] text-2xl font-normal! text-neutral-900">Gestión de publicidad</h2><p className="mb-0 mt-2 text-sm text-neutral-500">Administra los avisos informativos desde un solo lugar.</p></div>
        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          {[{ label: "Total de anuncios", value: anuncios.length }, { label: "Anuncios publicados", value: anunciosPublicados }, { label: "Borradores", value: anunciosBorrador }].map((item) => <article key={item.label} className="border border-neutral-200 bg-white p-4"><p className="m-0 text-[10px] font-semibold! tracking-[.16em] text-neutral-500 uppercase">{item.label}</p><p className="mb-0 mt-2 font-[Georgia] text-3xl text-neutral-900">{item.value}</p></article>)}
        </div>
        <div className="mb-5 grid gap-3 border border-neutral-200 bg-white p-4 sm:grid-cols-2 xl:grid-cols-4">
          <label className="grid gap-1.5 text-[10px] font-semibold! tracking-wide text-neutral-500 uppercase">Buscar anuncio<input type="search" value={busquedaAnuncio} onChange={(evento) => setBusquedaAnuncio(evento.target.value)} placeholder="Título o texto" className={campo} /></label>
          <label className="grid gap-1.5 text-[10px] font-semibold! tracking-wide text-neutral-500 uppercase">Servicio<select value={filtroServicio} onChange={(evento) => setFiltroServicio(evento.target.value)} className={campo}><option value="todos">Todos los servicios</option>{serviciosDisponibles.map((servicio) => <option key={servicio} value={servicio}>{servicio}</option>)}</select></label>
          <label className="grid gap-1.5 text-[10px] font-semibold! tracking-wide text-neutral-500 uppercase">Estado<select value={filtroEstado} onChange={(evento) => setFiltroEstado(evento.target.value)} className={campo}><option value="todos">Todos los estados</option><option value="publicados">Publicados</option><option value="borradores">Borradores</option><option value="vencidos">Vencidos</option></select></label>
          <label className="grid gap-1.5 text-[10px] font-semibold! tracking-wide text-neutral-500 uppercase">Fecha de creación<select value={ordenFecha} onChange={(evento) => setOrdenFecha(evento.target.value)} className={campo}><option value="desc">Más recientes primero</option><option value="asc">Más antiguos primero</option></select></label>
        </div>
        <div className="mb-5 flex items-center justify-between gap-3"><p className="m-0 text-xs text-neutral-500">{anunciosFiltrados.length} anuncio(s) que coinciden con los filtros.</p><button type="button" onClick={recargar} className="border border-neutral-300 bg-white px-3 py-2 text-xs font-semibold! text-neutral-700 hover:border-[#a51c1c]">Actualizar</button></div>
        {cargando ? <p className="border border-neutral-200 bg-white py-16 text-center text-sm text-neutral-500">Cargando anuncios...</p> : anunciosFiltrados.length ? <div className="galeria-imagenes-scroll grid max-h-[70vh] grid-cols-1 gap-4 overflow-y-auto pr-2 sm:grid-cols-2 lg:grid-cols-4">{anunciosFiltrados.map((anuncio) => <article key={anuncio.id} className="overflow-hidden border border-neutral-200 bg-white">
          {anuncio.url && <img src={urlImagen(anuncio.url)} alt={anuncio.nombre} className="h-[100px] w-full bg-neutral-100 object-cover object-center sm:h-[120px]" />}
          <div className="p-4"><div className="mb-2 flex items-start justify-between gap-3"><h3 className="m-0 truncate font-[Georgia] text-lg font-normal! text-neutral-900" title={anuncio.nombre}>{anuncio.nombre}</h3><span className={"shrink-0 border px-2 py-1 text-[9px] font-semibold! uppercase " + (anuncio.visibleHasta && new Date(anuncio.visibleHasta) <= new Date() ? "border-neutral-300 bg-neutral-100 text-neutral-600" : anuncio.activo ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-amber-200 bg-amber-50 text-amber-800")}>{anuncio.visibleHasta && new Date(anuncio.visibleHasta) <= new Date() ? "Vencido" : anuncio.activo ? "Publicado" : "Borrador"}</span></div>
            <p className="mb-2 text-[10px] font-semibold! tracking-wide text-neutral-500 uppercase">{anuncio.seccion}</p>{anuncio.descripcion && <p className="mb-3 line-clamp-3 text-xs leading-5 text-neutral-600">{anuncio.descripcion}</p>}
            <time className="mb-4 block text-[10px] text-neutral-500" dateTime={anuncio.createdAt}>{anuncio.createdAt ? new Intl.DateTimeFormat("es-PE", { dateStyle: "medium" }).format(new Date(anuncio.createdAt)) : "Fecha no disponible"}</time>
            {anuncio.visibleHasta && <p className="mb-3 text-[10px] text-neutral-500">Visible hasta {new Intl.DateTimeFormat("es-PE", { timeZone: "America/Lima", dateStyle: "medium", timeStyle: "short" }).format(new Date(anuncio.visibleHasta))} (Perú)</p>}
            <div className="mb-2 grid grid-cols-2 gap-2"><button type="button" onClick={() => cambiarPublicacion(anuncio)} className="border border-[#a51c1c] px-3 py-2 text-xs font-semibold! text-[#a51c1c] hover:bg-[#a51c1c] hover:text-white">{anuncio.activo ? "Ocultar" : "Publicar"}</button><button type="button" onClick={() => { setAnuncioEditando({ ...anuncio, visibleHasta: fechaLimaInput(anuncio.visibleHasta) }); setErrorOperacion(""); }} className="border border-neutral-300 px-3 py-2 text-xs font-semibold! text-neutral-600">Editar</button></div>
            <div className="grid grid-cols-2 gap-2"><button type="button" onClick={() => verConsultas(anuncio)} className="border border-neutral-300 px-3 py-2 text-xs font-semibold! text-neutral-700">Ver consultas ({anuncio._count?.consultas || 0})</button><button type="button" onClick={() => { setAnuncioEliminando(anuncio); setErrorOperacion(""); }} className="border border-neutral-300 px-3 py-2 text-xs font-semibold! text-neutral-600 hover:border-[#a51c1c] hover:text-[#a51c1c]">Eliminar</button></div>
          </div>
        </article>)}</div> : <div className="border border-dashed border-neutral-300 bg-white px-5 py-16 text-center"><p className="mb-1 text-sm font-semibold! text-neutral-700">{anuncios.length ? "No se encontraron anuncios" : "Aún no hay anuncios"}</p><p className="m-0 text-xs text-neutral-500">{anuncios.length ? "Prueba con otros filtros." : "Guarda un borrador para registrarlo aquí."}</p></div>}
        <p className="mb-0 mt-5 border-t border-neutral-200 pt-4 text-[10px] leading-5 text-neutral-400">Los anuncios se guardan como borrador; al publicarlos aparecen en la API pública.</p>
      </section>}

      {anuncioEliminando && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4" role="presentation" onMouseDown={(evento) => { if (evento.target === evento.currentTarget && !eliminando) setAnuncioEliminando(null); }}><section role="alertdialog" aria-modal="true" aria-labelledby="eliminar-anuncio-titulo" aria-describedby="eliminar-anuncio-descripcion" className="w-full max-w-lg border border-neutral-300 bg-white p-6 shadow-2xl"><h2 id="eliminar-anuncio-titulo" className="m-0 font-[Georgia] text-xl font-normal! text-neutral-900">¿Eliminar este anuncio?</h2><p id="eliminar-anuncio-descripcion" className="mb-0 mt-3 text-sm leading-6 text-neutral-600">El anuncio dejará de aparecer en la sección pública y se eliminará de la base de datos y del almacenamiento de imágenes.</p><p className="mb-0 mt-3 truncate text-xs font-semibold! text-neutral-800">{anuncioEliminando.nombre}</p>{errorOperacion && <p className="mb-0 mt-3 border border-red-200 bg-red-50 p-3 text-xs text-[#a51c1c]" role="alert">{errorOperacion}</p>}<div className="mt-6 flex justify-end gap-2"><button type="button" disabled={eliminando} onClick={() => setAnuncioEliminando(null)} className="border border-neutral-300 bg-white px-4 py-2.5 text-xs font-semibold! text-neutral-700">Cancelar</button><button type="button" disabled={eliminando} onClick={() => eliminarAnuncio(anuncioEliminando)} className="border border-[#a51c1c] bg-[#a51c1c] px-4 py-2.5 text-xs font-semibold! text-white hover:bg-black disabled:opacity-50">{eliminando ? "Eliminando..." : "Eliminar anuncio"}</button></div></section></div>}

      {anuncioEditando && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4"><form role="dialog" aria-modal="true" aria-labelledby="editar-anuncio-titulo" onSubmit={guardarConfiguracion} className="w-full max-w-lg border border-neutral-300 bg-white p-6 shadow-2xl"><h2 id="editar-anuncio-titulo" className="m-0 font-[Georgia] text-xl text-neutral-900">Editar anuncio: {anuncioEditando.nombre}</h2><label className="my-5 flex items-center gap-2 text-sm font-semibold text-neutral-700"><input type="checkbox" checked={anuncioEditando.mostrarWhatsapp === true} onChange={(e) => setAnuncioEditando({ ...anuncioEditando, mostrarWhatsapp: e.target.checked })} />Mostrar botón de WhatsApp</label><label className={`${etiqueta} mb-5`}>Visible hasta (hora de Perú)<input className={campo} type="datetime-local" value={anuncioEditando.visibleHasta || ""} onChange={(e) => setAnuncioEditando({ ...anuncioEditando, visibleHasta: e.target.value })} /></label>{errorOperacion && <p role="alert" className="text-sm text-[#a51c1c]">{errorOperacion}</p>}<div className="flex justify-end gap-2"><button type="button" onClick={() => setAnuncioEditando(null)} className="border border-neutral-300 px-4 py-2 text-xs">Cancelar</button><button type="submit" disabled={guardandoConfiguracion} className="bg-[#a51c1c] px-4 py-2 text-xs text-white">{guardandoConfiguracion ? "Guardando..." : "Guardar"}</button></div></form></div>}
      {consultasAbiertas && <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/55 p-4"><section role="dialog" aria-modal="true" aria-labelledby="consultas-anuncio-titulo" className="my-auto max-h-[90vh] w-full max-w-3xl overflow-y-auto border border-neutral-300 bg-white p-5 shadow-2xl sm:p-7"><div className="mb-5 flex items-start justify-between gap-4"><div><p className="mb-2 text-[10px] tracking-[.2em] text-[#a51c1c] uppercase">Consultas recibidas</p><h2 id="consultas-anuncio-titulo" className="m-0 font-[Georgia] text-2xl text-neutral-900">{consultasAbiertas.anuncio?.nombre}</h2></div><button type="button" onClick={() => setConsultasAbiertas(null)} className="border border-neutral-300 px-3 py-2 text-sm">Cerrar</button></div>{cargandoConsultas ? <p className="py-10 text-center text-sm text-neutral-500">Cargando consultas...</p> : consultasAbiertas.consultas?.length ? <div className="grid gap-3">{consultasAbiertas.consultas.map((consulta) => <article key={consulta.id} className="border border-neutral-200 p-4"><div className="flex flex-wrap items-start justify-between gap-2"><h3 className="m-0 text-sm font-semibold text-neutral-900">{consulta.nombre}</h3><time className="text-xs text-neutral-500">{new Intl.DateTimeFormat("es-PE", { timeZone: "America/Lima", dateStyle: "medium", timeStyle: "short" }).format(new Date(consulta.createdAt))} (Perú)</time></div><p className="my-2 text-sm text-neutral-700">WhatsApp: {consulta.whatsapp}</p><p className="mb-0 whitespace-pre-wrap text-sm leading-6 text-neutral-600">{consulta.mensaje}</p></article>)}</div> : <p className="border border-dashed border-neutral-300 px-4 py-12 text-center text-sm text-neutral-600">Este anuncio todavía no tiene consultas</p>}</section></div>}
    </main>
  );
}
