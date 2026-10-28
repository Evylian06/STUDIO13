import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL, adminHeaders, mensajeError, redirigirSiNoAutorizado } from "./useAdminCollection.js";

const categorias = [
  "Corporativas",
  "Quince\u00f1ero",
  "Fotos Familiares",
  "Embarazo",
  "Parejas",
  "Snacks Queik",
  "Eventos",
  "Exteriores",
  "Talleres",
];
const tiposPermitidos = ["image/jpeg", "image/png", "image/webp"];
const urlImagen = (url) => typeof url === "string" && url.startsWith("/uploads/") ? `${API_BASE_URL}${url}` : url;

export default function Galeria() {
  const navigate = useNavigate();
  const [categoriaActiva, setCategoriaActiva] = useState(categorias[0]);
  const [imagenes, setImagenes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [subiendo, setSubiendo] = useState(false);
  const [errorOperacion, setErrorOperacion] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");
  const [arrastrando, setArrastrando] = useState(false);
  const [avisoArchivo, setAvisoArchivo] = useState("");
  const [categoriasAbiertas, setCategoriasAbiertas] = useState(false);
  const [tituloImagen, setTituloImagen] = useState("");
  const [imagenTituloId, setImagenTituloId] = useState(null);
  const [busquedaImagen, setBusquedaImagen] = useState("");
  const [pestanaActiva, setPestanaActiva] = useState("subir");
  const [filtroCategoria, setFiltroCategoria] = useState("todas");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [ordenFecha, setOrdenFecha] = useState("desc");
  const [imagenEditando, setImagenEditando] = useState(null);
  const [borradorEdicion, setBorradorEdicion] = useState(null);
  const [archivoReemplazo, setArchivoReemplazo] = useState(null);
  const [previewReemplazo, setPreviewReemplazo] = useState("");
  const [guardandoEdicion, setGuardandoEdicion] = useState(false);
  const [imagenEliminando, setImagenEliminando] = useState(null);
  const [eliminando, setEliminando] = useState(false);
  const inputRef = useRef(null);
  const imagenesRef = useRef(imagenes);

  useEffect(() => { imagenesRef.current = imagenes; }, [imagenes]);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API_BASE_URL}/api/admin/imagenes`, { signal: controller.signal, headers: adminHeaders() })
      .then(async (response) => {
        const body = await response.json().catch(() => null);
        redirigirSiNoAutorizado(response, navigate);
        if (!response.ok) throw new Error(body?.error || "No se pudieron cargar las imágenes.");
        if (!Array.isArray(body)) throw new Error("El servidor devolvió un formato de imágenes no válido.");
        return body.filter((image) => image && Number.isInteger(image.id) && typeof image.url === "string" && typeof image.seccion === "string")
          .map((image) => ({ ...image, titulo: image.nombre, categoria: image.seccion, preview: urlImagen(image.url), guardada: true }));
      })
      .then((body) => { if (!controller.signal.aborted) setImagenes(body); })
      .catch((reason) => { if (!controller.signal.aborted) setErrorOperacion(mensajeError(reason)); })
      .finally(() => { if (!controller.signal.aborted) setCargando(false); });
    return () => controller.abort();
  }, [navigate]);

  useEffect(() => () => imagenesRef.current.filter((imagen) => imagen.preview?.startsWith("blob:")).forEach((imagen) => URL.revokeObjectURL(imagen.preview)), []);
  useEffect(() => () => { if (previewReemplazo.startsWith("blob:")) URL.revokeObjectURL(previewReemplazo); }, [previewReemplazo]);
  useEffect(() => {
    if (!mensajeExito) return undefined;
    const timeout = window.setTimeout(() => setMensajeExito(""), 4000);
    return () => window.clearTimeout(timeout);
  }, [mensajeExito]);

  const agregarArchivos = (archivos) => {
    const seleccion = Array.from(archivos || []);
    const permitidos = seleccion.filter((archivo) => tiposPermitidos.includes(archivo.type) && archivo.size > 0 && archivo.size <= 5 * 1024 * 1024);
    const nuevos = permitidos
      .map((archivo) => ({ id: `${archivo.name}-${archivo.lastModified}-${crypto.randomUUID()}`, nombre: archivo.name.replace(/\.[^.]+$/, "").slice(0, 120), titulo: "", archivo, categoria: categoriaActiva, preview: URL.createObjectURL(archivo), guardada: false, activo: true }));
    setAvisoArchivo(permitidos.length < seleccion.length ? "Solo se aceptan JPG, PNG o WEBP de hasta 5 MB." : "");
    setErrorOperacion("");
    setMensajeExito("");
    if (nuevos.length) {
      setImagenes((actuales) => [...nuevos, ...actuales]);
      setImagenTituloId(nuevos[0].id);
    }
  };

  const seleccionarCategoria = (categoria) => {
    const imagen = imagenes.find((item) => item.categoria === categoria);
    setCategoriaActiva(categoria);
    setImagenTituloId(imagen?.id ?? null);
    setTituloImagen(imagen?.titulo || "");
    setCategoriasAbiertas(false);
  };


  const imagenesCategoria = imagenes.filter((imagen) => imagen.categoria === categoriaActiva);
  const imagenesPendientes = imagenesCategoria.filter((imagen) => !imagen.guardada);
  const imagenesGuardadas = imagenes.filter((imagen) => imagen.guardada);
  const categoriasDisponibles = [...new Set(imagenesGuardadas.map((imagen) => imagen.categoria))].sort((a, b) => a.localeCompare(b, "es"));
  const imagenesFiltradas = imagenesGuardadas
    .filter((imagen) => `${imagen.titulo} ${imagen.nombre}`.toLocaleLowerCase().includes(busquedaImagen.trim().toLocaleLowerCase()))
    .filter((imagen) => filtroCategoria === "todas" || imagen.categoria === filtroCategoria)
    .filter((imagen) => filtroEstado === "todos" || (filtroEstado === "publicadas" ? imagen.activo !== false : imagen.activo === false))
    .sort((a, b) => (ordenFecha === "desc" ? 1 : -1) * (new Date(a.createdAt || 0) - new Date(b.createdAt || 0)));
  const imagenesPublicadas = imagenesGuardadas.filter((imagen) => imagen.activo !== false).length;

  const publicarImagenes = async () => {
    const pendientes = imagenes.filter((imagen) => imagen.categoria === categoriaActiva && !imagen.guardada);
    if (!pendientes.length || subiendo) return;
    setSubiendo(true);
    setErrorOperacion("");
    setMensajeExito("");
    let subidas = 0;
    try {
      for (const imagen of pendientes) {
        const data = new FormData();
        data.append("imagen", imagen.archivo);
        data.append("nombre", imagen.titulo.trim() || imagen.nombre);
        data.append("seccion", categoriaActiva);
        const response = await fetch(`${API_BASE_URL}/api/admin/imagenes`, { method: "POST", headers: adminHeaders(), body: data });
        const body = await response.json().catch(() => ({}));
        redirigirSiNoAutorizado(response, navigate);
        if (!response.ok) throw new Error(body.error || `No se pudo subir ${imagen.nombre}.`);
        setImagenes((current) => current.map((item) => item.id === imagen.id ? { ...body, titulo: body.nombre, categoria: body.seccion, preview: urlImagen(body.url), guardada: true } : item));
        setTituloImagen(body.nombre);
        setImagenTituloId(body.id);
        URL.revokeObjectURL(imagen.preview);
        subidas += 1;
      }
      setMensajeExito(`${subidas} imagen(es) guardada(s) en ${categoriaActiva}. Ya aparecerán en el portafolio.`);
      setAvisoArchivo("");
      setTituloImagen("");
      setImagenTituloId(null);
      if (inputRef.current) inputRef.current.value = "";
    } catch (reason) {
      setErrorOperacion(mensajeError(reason));
      if (subidas) setMensajeExito(`${subidas} imagen(es) sí se guardaron; revisa el error para continuar con las restantes.`);
    } finally {
      setSubiendo(false);
    }
  };

  const abrirEdicion = (imagen) => {
    setImagenEditando(imagen);
    setBorradorEdicion({ nombre: imagen.nombre || imagen.titulo || "", descripcion: imagen.descripcion || "", seccion: imagen.seccion || imagen.categoria || categorias[0], activo: imagen.activo !== false });
    setArchivoReemplazo(null);
    setPreviewReemplazo("");
    setErrorOperacion("");
  };

  const cerrarEdicion = () => {
    if (guardandoEdicion) return;
    setImagenEditando(null);
    setBorradorEdicion(null);
    setArchivoReemplazo(null);
    setPreviewReemplazo("");
  };

  const seleccionarReemplazo = (archivo) => {
    if (!archivo) return;
    if (!tiposPermitidos.includes(archivo.type) || archivo.size <= 0 || archivo.size > 5 * 1024 * 1024) {
      setErrorOperacion("El archivo debe ser JPG, PNG o WEBP y pesar hasta 5 MB.");
      return;
    }
    setErrorOperacion("");
    setArchivoReemplazo(archivo);
    setPreviewReemplazo(URL.createObjectURL(archivo));
  };

  const guardarEdicion = async (evento) => {
    evento.preventDefault();
    if (!imagenEditando || !borradorEdicion || guardandoEdicion) return;
    if (!borradorEdicion.nombre.trim() || !borradorEdicion.seccion.trim()) {
      setErrorOperacion("El nombre y la categoría son obligatorios.");
      return;
    }
    setGuardandoEdicion(true);
    setErrorOperacion("");
    setMensajeExito("");
    try {
      const datos = { nombre: borradorEdicion.nombre.trim(), seccion: borradorEdicion.seccion.trim(), activo: borradorEdicion.activo };
      let headers;
      let body;
      if (archivoReemplazo) {
        body = new FormData();
        body.append("imagen", archivoReemplazo);
        Object.entries(datos).forEach(([key, value]) => body.append(key, value === null ? "" : String(value)));
        headers = adminHeaders();
      } else {
        body = JSON.stringify(datos);
        headers = adminHeaders(true);
      }
      const response = await fetch(API_BASE_URL + "/api/admin/imagenes/" + imagenEditando.id, { method: "PATCH", headers, body });
      const resultado = await response.json().catch(() => ({}));
      redirigirSiNoAutorizado(response, navigate);
      if (!response.ok) throw new Error(resultado.error || "No se pudo actualizar la imagen.");
      const imagenActualizada = { ...resultado, titulo: resultado.nombre, categoria: resultado.seccion, preview: urlImagen(resultado.url), guardada: true };
      setImagenes((actuales) => actuales.map((item) => item.id === imagenEditando.id ? imagenActualizada : item));
      setMensajeExito("Imagen actualizada correctamente.");
      if (resultado.cleanupWarning) setErrorOperacion(resultado.cleanupWarning);
      setImagenEditando(null);
      setBorradorEdicion(null);
      setArchivoReemplazo(null);
      setPreviewReemplazo("");
    } catch (reason) {
      setErrorOperacion(mensajeError(reason));
    } finally {
      setGuardandoEdicion(false);
    }
  };

  const confirmarEliminacion = async () => {
    if (!imagenEliminando || eliminando) return;
    setEliminando(true);
    setErrorOperacion("");
    setMensajeExito("");
    try {
      const response = await fetch(API_BASE_URL + "/api/admin/imagenes/" + imagenEliminando.id, { method: "DELETE", headers: adminHeaders() });
      const resultado = await response.json().catch(() => ({}));
      redirigirSiNoAutorizado(response, navigate);
      if (!response.ok) {
        if (resultado.image) {
          const imagenRetenida = { ...resultado.image, titulo: resultado.image.nombre, categoria: resultado.image.seccion, preview: urlImagen(resultado.image.url), guardada: true };
          setImagenes((actuales) => actuales.map((item) => item.id === imagenRetenida.id ? imagenRetenida : item));
        }
        throw new Error(resultado.error || "No se pudo eliminar la imagen.");
      }
      setImagenes((actuales) => actuales.filter((item) => item.id !== imagenEliminando.id));
      setMensajeExito("Imagen eliminada de Cloudinary, la base de datos y el portafolio público.");
      setImagenEliminando(null);
    } catch (reason) {
      setErrorOperacion(mensajeError(reason));
      setImagenEliminando(null);
    } finally {
      setEliminando(false);
    }
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-350 px-5 py-8 sm:px-7 md:px-10 md:py-10 xl:px-12">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-[10px] font-semibold! tracking-[.2em] text-neutral-500 uppercase sm:text-xs">Contenido del sitio</p>
          <h1 className="m-0 font-[Georgia] text-3xl font-normal! text-neutral-900 sm:text-4xl">Galería</h1>
          <p className="mb-0 mt-2 max-w-xl text-sm leading-6 text-neutral-500">Organiza las imágenes por categoría y elige cuáles aparecerán en la página pública.</p>
        </div>
        <span className="border border-green-200 bg-green-50 px-3 py-2 text-[10px] font-semibold! tracking-wide text-green-800 uppercase">Conectado al portafolio</span>
      </div>

      {errorOperacion && <p className="mb-5 border border-red-200 bg-red-50 p-4 text-sm text-[#a51c1c]" role="alert">{errorOperacion}</p>}
      {mensajeExito && <div className="fixed right-5 top-5 z-70 flex w-[min(28rem,calc(100vw-2.5rem))] items-start gap-3 border border-green-200 bg-green-50 px-5 py-4 text-sm text-green-800 shadow-lg" role="status" aria-live="polite"><span aria-hidden="true" className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-700 text-xs font-bold! text-white">✓</span><p className="m-0 flex-1 leading-6">{mensajeExito}</p><button type="button" onClick={() => setMensajeExito("")} aria-label="Cerrar notificación" className="border-0 bg-transparent px-1 text-lg leading-5 text-green-800 hover:text-green-950">×</button></div>}

      <div className="mb-6 flex border-b border-neutral-200" role="tablist" aria-label="Secciones de la galería">
        {[{ id: "subir", label: "Subir imagen" }, { id: "gestionar", label: "Gestión de imágenes" }].map((tab) => <button key={tab.id} id={`galeria-tab-${tab.id}`} type="button" role="tab" aria-selected={pestanaActiva === tab.id} aria-controls={`galeria-panel-${tab.id}`} onClick={() => setPestanaActiva(tab.id)} className={`border-0 border-b-2 px-5 py-3 text-xs font-semibold! tracking-wide transition-colors ${pestanaActiva === tab.id ? "border-[#a51c1c] text-[#a51c1c]" : "border-transparent bg-transparent text-neutral-500 hover:text-neutral-900"}`}>{tab.label}</button>)}
      </div>

      {pestanaActiva === "subir" && <section id="galeria-panel-subir" role="tabpanel" aria-labelledby="galeria-tab-subir" className="mb-7 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)]">
        <div className="border border-neutral-200 bg-white p-5 sm:p-6">
          <div className="mb-5"><h2 className="m-0 font-[Georgia] text-xl font-normal! text-neutral-900">Agregar a {categoriaActiva}</h2><p className="mb-0 mt-1 text-xs text-neutral-500">Selecciona imagenes desde tu dispositivo para ver como quedaran.</p></div>
          <button type="button" onClick={() => inputRef.current?.click()} onDragOver={(evento) => { evento.preventDefault(); setArrastrando(true); }} onDragLeave={() => setArrastrando(false)} onDrop={(evento) => { evento.preventDefault(); setArrastrando(false); agregarArchivos(evento.dataTransfer.files); }} className={`flex min-h-52 w-full flex-col items-center justify-center border border-dashed px-5 py-8 text-center transition-colors ${arrastrando ? "border-[#a51c1c] bg-red-50" : "border-neutral-300 bg-neutral-50 hover:border-[#a51c1c] hover:bg-red-50/40"}`}>
            <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#a51c1c] shadow-sm"><svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 16V4m0 0L7 9m5-5 5 5" /><path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" /></svg></span>
            <span className="text-sm font-semibold! text-neutral-800">Arrastra tus imagenes aqui</span>
            <span className="mt-1 text-xs text-neutral-500">o <span className="text-[#a51c1c] underline">selecciona archivos</span> de tu dispositivo</span>
            <span className="mt-4 text-[10px] tracking-wide text-neutral-400 uppercase">JPG, PNG o WEBP · hasta 5 MB por imagen</span>
          </button>
          <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={(evento) => agregarArchivos(evento.target.files)} />
          {avisoArchivo && <p className="mb-0 mt-3 text-xs text-[#a51c1c]" role="alert">{avisoArchivo}</p>}
          <p className="mb-0 mt-3 text-[11px] leading-5 text-neutral-400">Las imágenes se guardan en Cloudinary y en la biblioteca del sitio.</p>
          <label className="mt-5 grid gap-2 text-xs font-semibold! text-neutral-700">
            Titulo de la imagen
            <input className="w-full border border-neutral-300 bg-white px-3 py-2.5 text-sm font-normal! text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-[#a51c1c]" type="text" maxLength={120} placeholder="Escribe el titulo que aparecera junto a la imagen" value={tituloImagen} onChange={(evento) => { const valor = evento.target.value; setTituloImagen(valor); setImagenes((actuales) => actuales.map((imagen) => imagen.id === imagenTituloId ? { ...imagen, titulo: valor } : imagen)); }} />
          </label>
          <div className="mt-6 border-t border-neutral-200 pt-5">
            <h3 className="mb-2 text-sm font-semibold! text-neutral-800">Categoría de la imagen</h3>
            <button type="button" aria-expanded={categoriasAbiertas} onClick={() => setCategoriasAbiertas((abierto) => !abierto)} className="flex w-full items-center justify-between border border-neutral-300 bg-white px-4 py-3 text-left text-sm text-neutral-700 hover:border-[#a51c1c]">
              <span>{categoriaActiva}</span><svg aria-hidden="true" className={`transition-transform duration-300 ${categoriasAbiertas ? "rotate-180" : ""}`} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
            </button>
            <div className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${categoriasAbiertas ? "mt-2 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
              <div className="overflow-hidden">
                <div className="border border-neutral-200 bg-neutral-50 p-1">
                  {categorias.map((categoria) => <button key={categoria} type="button" onClick={() => seleccionarCategoria(categoria)} className={`flex w-full items-center justify-between px-3 py-2.5 text-left text-xs transition-colors ${categoriaActiva === categoria ? "bg-white font-semibold! text-[#a51c1c]" : "text-neutral-600 hover:bg-white hover:text-neutral-900"}`}><span>{categoria}</span><span className="text-[10px] text-neutral-400">{imagenes.filter((imagen) => imagen.categoria === categoria && imagen.activo !== false).length}</span></button>)}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid content-start gap-3">
          <aside className="border border-neutral-200 bg-white p-5 sm:p-6"><h2 className="m-0 font-[Georgia] text-xl font-normal! text-neutral-900">Vista previa de la carga</h2><p className="mb-3 mt-2 text-xs text-neutral-500">{imagenesPendientes.length} imagen(es) seleccionada(s) para {categoriaActiva}.</p>{imagenesPendientes.length ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{imagenesPendientes.map((imagen) => <div key={imagen.id} className="overflow-hidden border border-neutral-200"><img src={imagen.preview} alt={imagen.nombre} className="aspect-square w-full object-cover" /><p className="m-0 truncate p-2 text-xs text-neutral-700" title={imagen.nombre}>{imagen.nombre}</p></div>)}</div> : <p className="m-0 border border-dashed border-neutral-200 bg-neutral-50 p-6 text-center text-xs text-neutral-400">Selecciona una imagen para verla aquí.</p>}</aside>
          <button type="button" disabled={subiendo || !imagenes.some((imagen) => imagen.categoria === categoriaActiva && !imagen.guardada)} onClick={publicarImagenes} className="w-full border border-[#a51c1c] bg-[#a51c1c] px-4 py-3 text-sm font-semibold! text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-50">{subiendo ? "Subiendo..." : "Guardar y publicar"}</button>
          <p className="m-0 text-center text-[10px] text-neutral-400">Las imágenes guardadas aparecerán en Portafolio bajo su categoría.</p>
        </div>
      </section>}

      {pestanaActiva === "gestionar" && <section id="galeria-panel-gestionar" role="tabpanel" aria-labelledby="galeria-tab-gestionar" className="mb-7">
        <div className="mb-6"><h2 className="m-0 font-[Georgia] text-2xl font-normal! text-neutral-900">Gestión de imágenes</h2><p className="mb-0 mt-2 text-sm text-neutral-500">Administra las imágenes de tu portafolio desde un solo lugar.</p></div>
        <div className="mb-6 grid gap-3 sm:grid-cols-2">
          {[{ label: "Total de imágenes", value: imagenesGuardadas.length }, { label: "Imágenes publicadas", value: imagenesPublicadas }].map((item) => <article key={item.label} className="border border-neutral-200 bg-white p-4"><p className="m-0 text-[10px] font-semibold! tracking-[.16em] text-neutral-500 uppercase">{item.label}</p><p className="mb-0 mt-2 font-[Georgia] text-3xl text-neutral-900">{item.value}</p></article>)}
        </div>
        <div className="mb-5 grid gap-3 border border-neutral-200 bg-white p-4 sm:grid-cols-2 xl:grid-cols-4">
          <label className="grid gap-1.5 text-[10px] font-semibold! tracking-wide text-neutral-500 uppercase">Buscar por nombre<input type="search" value={busquedaImagen} onChange={(evento) => setBusquedaImagen(evento.target.value)} placeholder="Nombre o título" className="w-full border border-neutral-300 bg-white px-3 py-2.5 text-xs font-normal! text-neutral-800 outline-none placeholder:text-neutral-400 focus:border-[#a51c1c]" /></label>
          <label className="grid gap-1.5 text-[10px] font-semibold! tracking-wide text-neutral-500 uppercase">Categoría<select value={filtroCategoria} onChange={(evento) => setFiltroCategoria(evento.target.value)} className="w-full border border-neutral-300 bg-white px-3 py-2.5 text-xs font-normal! text-neutral-800 outline-none focus:border-[#a51c1c]"><option value="todas">Todas las categorías</option>{categoriasDisponibles.map((categoria) => <option key={categoria} value={categoria}>{categoria}</option>)}</select></label>
          <label className="grid gap-1.5 text-[10px] font-semibold! tracking-wide text-neutral-500 uppercase">Estado<select value={filtroEstado} onChange={(evento) => setFiltroEstado(evento.target.value)} className="w-full border border-neutral-300 bg-white px-3 py-2.5 text-xs font-normal! text-neutral-800 outline-none focus:border-[#a51c1c]"><option value="todos">Todos los estados</option><option value="publicadas">Publicadas</option><option value="ocultas">Ocultas</option></select></label>
          <label className="grid gap-1.5 text-[10px] font-semibold! tracking-wide text-neutral-500 uppercase">Fecha de subida<select value={ordenFecha} onChange={(evento) => setOrdenFecha(evento.target.value)} className="w-full border border-neutral-300 bg-white px-3 py-2.5 text-xs font-normal! text-neutral-800 outline-none focus:border-[#a51c1c]"><option value="desc">Más recientes primero</option><option value="asc">Más antiguas primero</option></select></label>
        </div>
        {cargando ? <p className="border border-neutral-200 bg-white py-16 text-center text-sm text-neutral-500">Cargando imágenes...</p> : imagenesFiltradas.length ? <div className="galeria-imagenes-scroll grid max-h-[70vh] grid-cols-1 gap-4 overflow-y-auto pr-2 sm:grid-cols-2 lg:grid-cols-4">{imagenesFiltradas.map((imagen) => <article key={imagen.id} className="overflow-hidden border border-neutral-200 bg-white">
          <img src={imagen.preview} alt={imagen.nombre} className="aspect-4/3 w-full bg-neutral-100 object-cover" />
          <div className="p-4"><div className="mb-2 flex items-start justify-between gap-2"><h3 className="m-0 truncate text-sm font-semibold! text-neutral-900" title={imagen.nombre}>{imagen.nombre}</h3><span className={"shrink-0 border px-2 py-1 text-[9px] font-semibold! uppercase " + (imagen.activo !== false ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-neutral-300 bg-neutral-100 text-neutral-600")}>{imagen.activo !== false ? "Publicada" : "Oculta"}</span></div>
            {imagen.descripcion && <p className="mb-2 line-clamp-2 text-xs leading-5 text-neutral-600">{imagen.descripcion}</p>}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-[10px] text-neutral-500"><span>{imagen.categoria}</span><time dateTime={imagen.createdAt}>{imagen.createdAt ? new Intl.DateTimeFormat("es-PE", { dateStyle: "medium" }).format(new Date(imagen.createdAt)) : "Fecha no disponible"}</time></div>
            <div className="grid grid-cols-2 gap-2"><button type="button" onClick={() => abrirEdicion(imagen)} className="border border-neutral-300 bg-white px-3 py-2 text-xs font-semibold! text-neutral-700 hover:border-[#a51c1c] hover:text-[#a51c1c]">Editar</button><button type="button" onClick={() => { setImagenEliminando(imagen); setErrorOperacion(""); }} className="border border-red-200 bg-white px-3 py-2 text-xs font-semibold! text-[#a51c1c] hover:bg-red-50">Eliminar</button></div>
          </div>
        </article>)}</div> : <div className="border border-dashed border-neutral-300 bg-white px-5 py-16 text-center"><p className="mb-1 text-sm font-semibold! text-neutral-700">{imagenesGuardadas.length ? "No se encontraron imágenes" : "Todavía no hay imágenes guardadas"}</p><p className="m-0 text-xs text-neutral-500">{imagenesGuardadas.length ? "Prueba con otros filtros de búsqueda." : "Las imágenes que subas aparecerán aquí."}</p></div>}
      </section>}

      {imagenEditando && borradorEdicion && <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/55 p-4" onMouseDown={(evento) => { if (evento.target === evento.currentTarget) cerrarEdicion(); }}><form role="dialog" aria-modal="true" aria-labelledby="editar-imagen-titulo" onSubmit={guardarEdicion} className="my-auto max-h-[92vh] w-full max-w-2xl overflow-y-auto border border-neutral-300 bg-white p-5 shadow-2xl sm:p-7"><div className="mb-5 flex items-start justify-between gap-4"><div><p className="mb-1 text-[10px] font-semibold! tracking-[.18em] text-[#a51c1c] uppercase">Gestión de imágenes</p><h2 id="editar-imagen-titulo" className="m-0 font-[Georgia] text-2xl font-normal! text-neutral-900">Editar imagen</h2></div><button type="button" onClick={cerrarEdicion} disabled={guardandoEdicion} className="border border-neutral-300 px-3 py-2 text-xs text-neutral-700">Cerrar</button></div>
        {errorOperacion && <p className="mb-4 border border-red-200 bg-red-50 p-3 text-xs text-[#a51c1c]" role="alert">{errorOperacion}</p>}
        <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]"><div><img src={previewReemplazo || imagenEditando.preview} alt={borradorEdicion.nombre} className="aspect-square w-full border border-neutral-200 bg-neutral-100 object-cover" /><label className="mt-3 block text-xs font-semibold! text-neutral-700">Reemplazar archivo<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(evento) => seleccionarReemplazo(evento.target.files?.[0])} className="mt-2 block w-full cursor-pointer text-xs text-neutral-600 file:mr-3 file:cursor-pointer file:border-0 file:bg-[#a51c1c] file:px-4 file:py-2.5 file:text-xs file:font-semibold! file:text-white hover:file:bg-black" /></label><p className="mb-0 mt-1 text-[10px] text-neutral-500">JPG, PNG o WEBP · máximo 5 MB</p></div>
          <div className="grid content-start gap-4"><label className="grid gap-1.5 text-xs font-semibold! text-neutral-700">Nombre o título<input required maxLength={120} value={borradorEdicion.nombre} onChange={(evento) => setBorradorEdicion((actual) => ({ ...actual, nombre: evento.target.value }))} className="border border-neutral-300 px-3 py-2.5 text-sm font-normal! outline-none focus:border-[#a51c1c]" /></label>
            <label className="grid gap-1.5 text-xs font-semibold! text-neutral-700">Categoría<select required value={borradorEdicion.seccion} onChange={(evento) => setBorradorEdicion((actual) => ({ ...actual, seccion: evento.target.value }))} className="border border-neutral-300 bg-white px-3 py-2.5 text-sm font-normal! outline-none focus:border-[#a51c1c]">{[...new Set([...categorias, ...categoriasDisponibles, borradorEdicion.seccion])].map((categoria) => <option key={categoria} value={categoria}>{categoria}</option>)}</select></label>
            <label className="flex items-center gap-2 text-xs font-semibold! text-neutral-700"><input type="checkbox" checked={borradorEdicion.activo} onChange={(evento) => setBorradorEdicion((actual) => ({ ...actual, activo: evento.target.checked }))} className="accent-[#a51c1c]" />Publicada en el portafolio</label>
          </div></div>
        <div className="mt-6 flex justify-end gap-2 border-t border-neutral-200 pt-4"><button type="button" onClick={cerrarEdicion} disabled={guardandoEdicion} className="border border-neutral-300 bg-white px-4 py-2.5 text-xs font-semibold! text-neutral-700">Cancelar</button><button type="submit" disabled={guardandoEdicion} className="border border-[#a51c1c] bg-[#a51c1c] px-4 py-2.5 text-xs font-semibold! text-white hover:bg-black disabled:opacity-50">{guardandoEdicion ? "Guardando..." : "Guardar cambios"}</button></div>
      </form></div>}

      {imagenEliminando && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4" role="presentation" onMouseDown={(evento) => { if (evento.target === evento.currentTarget && !eliminando) setImagenEliminando(null); }}><section role="alertdialog" aria-modal="true" aria-labelledby="eliminar-imagen-titulo" aria-describedby="eliminar-imagen-descripcion" className="w-full max-w-lg border border-neutral-300 bg-white p-6 shadow-2xl"><h2 id="eliminar-imagen-titulo" className="m-0 font-[Georgia] text-xl font-normal! text-neutral-900">¿Estás seguro de que deseas eliminar esta imagen?</h2><p id="eliminar-imagen-descripcion" className="mb-0 mt-3 text-sm leading-6 text-neutral-600">Esta acción eliminará la imagen del almacenamiento de Cloudinary, de la base de datos y de las secciones públicas donde se muestra. Esta acción no se puede deshacer fácilmente.</p><p className="mb-0 mt-3 truncate text-xs font-semibold! text-neutral-800">{imagenEliminando.nombre}</p>{errorOperacion && <p className="mb-0 mt-3 border border-red-200 bg-red-50 p-3 text-xs text-[#a51c1c]" role="alert">{errorOperacion}</p>}<div className="mt-6 flex justify-end gap-2"><button type="button" disabled={eliminando} onClick={() => setImagenEliminando(null)} className="border border-neutral-300 bg-white px-4 py-2.5 text-xs font-semibold! text-neutral-700">Cancelar</button><button type="button" disabled={eliminando} onClick={confirmarEliminacion} className="border border-[#a51c1c] bg-[#a51c1c] px-4 py-2.5 text-xs font-semibold! text-white hover:bg-black disabled:opacity-50">{eliminando ? "Eliminando..." : "Eliminar imagen"}</button></div></section></div>}

    </main>
  );
}
