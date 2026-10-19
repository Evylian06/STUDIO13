import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL, adminHeaders, mensajeError, redirigirSiNoAutorizado, useAdminCollection } from "./useAdminCollection.js";

const formularioVacio = { nombre: "", descripcion: "", precio: "", beneficios: "", imagenId: "", activo: true };
const secciones = [
  { id: "SESION", nombre: "Sesiones" },
  { id: "ALQUILER", nombre: "Alquiler" },
  { id: "TARIFA", nombre: "Tarifas" },
];
const campo = "w-full border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-[#a51c1c]";
const etiqueta = "grid gap-1.5 text-xs font-semibold! text-neutral-700";


const precioPaquete = (valor) => valor == null || valor === ""? "Precio por definir": new Intl.NumberFormat("es-PE", {
      style: "currency",currency: "PEN", minimumFractionDigits: 2, maximumFractionDigits: 2}).format(Number(valor));


export default function Paquetes() {
  const navigate = useNavigate();
  const { filas, setFilas, cargando, error, recargar } = useAdminCollection("/api/admin/paquetes");
  const [imagenes, setImagenes] = useState([]);
  const [errorImagenes, setErrorImagenes] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [paqueteEditando, setPaqueteEditando] = useState(null);
  const [borrador, setBorrador] = useState(formularioVacio);
  const [guardando, setGuardando] = useState(false);
  const [errorOperacion, setErrorOperacion] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");
  const [seccionActiva, setSeccionActiva] = useState("SESION");
  const filasVisibles = filas.filter((paquete) => (paquete.seccion || "SESION") === seccionActiva);
  const nombreSeccion = secciones.find((seccion) => seccion.id === seccionActiva)?.nombre || "Sesiones";
  const textoNuevo = seccionActiva === "SESION" ? "Nueva sesión" : seccionActiva === "ALQUILER" ? "Nuevo alquiler" : "Nueva tarifa";

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API_BASE_URL}/api/imagenes`, { signal: controller.signal, headers: adminHeaders() })
      .then(async (response) => {
        const body = await response.json();
        redirigirSiNoAutorizado(response, navigate);
        if (!response.ok) throw new Error(body.error || "No se pudo cargar la biblioteca de imágenes.");
        return body;
      })
      .then((body) => { if (!controller.signal.aborted) setImagenes(body.filter((imagen) => imagen.activo !== false)); })
      .catch((reason) => { if (!controller.signal.aborted) setErrorImagenes(mensajeError(reason)); });
    return () => controller.abort();
  }, [navigate]);

  const abrirNuevo = () => {
    setPaqueteEditando(null);
    setBorrador(formularioVacio);
    setErrorOperacion("");
    setMensajeExito("");
    setModalAbierto(true);
  };

  const abrirEdicion = (paquete) => {
    const imagen = imagenes.find((item) => item.url === paquete.imagenUrl && item.publicId === paquete.publicId);
    setPaqueteEditando(paquete);
    setBorrador({
      nombre: paquete.nombre || "",
      descripcion: paquete.descripcion || "",
      precio: paquete.precio == null ? "" : String(paquete.precio),
      beneficios: (paquete.caracteristicas || []).map((item) => item.nombre).join("\n"),
      imagenId: imagen ? String(imagen.id) : "",
      activo: paquete.activo !== false,
    });
    setErrorOperacion("");
    setMensajeExito("");
    setModalAbierto(true);
  };

  const guardar = async (evento) => {
    evento.preventDefault();
    if (guardando) return;
    const precio = Number(borrador.precio);
    if (!borrador.nombre.trim()) return setErrorOperacion("Escribe el nombre del paquete.");
    if (!borrador.precio || !Number.isFinite(precio) || precio < 0) return setErrorOperacion("Indica un precio válido igual o mayor que cero.");

    const imagen = imagenes.find((item) => String(item.id) === borrador.imagenId);
    const caracteristicas = borrador.beneficios.split("\n").map((item) => item.trim()).filter(Boolean);
    const payload = {
      nombre: borrador.nombre.trim(),
      descripcion: borrador.descripcion.trim() || null,
      precio,
      imagenUrl: imagen?.url || paqueteEditando?.imagenUrl || null,
      publicId: imagen?.publicId || paqueteEditando?.publicId || null,
      orden: paqueteEditando?.orden ?? filasVisibles.length,
      activo: borrador.activo,
      seccion: seccionActiva,
      caracteristicas,
    };

    setGuardando(true);
    setErrorOperacion("");
    setMensajeExito("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/paquetes${paqueteEditando ? `/${paqueteEditando.id}` : ""}`, {
        method: paqueteEditando ? "PATCH" : "POST",
        headers: adminHeaders(true),
        body: JSON.stringify(payload),
      });
      const body = response.status === 204 ? null : await response.json();
      redirigirSiNoAutorizado(response, navigate);
      if (!response.ok) throw new Error(body?.error || "No se pudo guardar el paquete.");
      setFilas((actuales) => paqueteEditando
        ? actuales.map((item) => item.id === body.id ? body : item)
        : [...actuales, body].sort((a, b) => a.orden - b.orden || a.id - b.id));
      setModalAbierto(false);
      setMensajeExito(paqueteEditando ? "Paquete actualizado correctamente." : "Paquete creado correctamente.");
    } catch (reason) {
      setErrorOperacion(mensajeError(reason));
    } finally {
      setGuardando(false);
    }
  };

  const cambiarPublicacion = async (paquete) => {
    setErrorOperacion("");
    setMensajeExito("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/paquetes/${paquete.id}`, {
        method: "PATCH", headers: adminHeaders(true), body: JSON.stringify({ activo: !paquete.activo }),
      });
      const body = await response.json();
      redirigirSiNoAutorizado(response, navigate);
      if (!response.ok) throw new Error(body.error || "No se pudo cambiar la publicación del paquete.");
      setFilas((actuales) => actuales.map((item) => item.id === body.id ? { ...item, ...body } : item));
      setMensajeExito(body.activo ? "Paquete publicado." : "Paquete oculto.");
    } catch (reason) {
      setErrorOperacion(mensajeError(reason));
    }
  };

  const eliminar = async (paquete) => {
    if (!window.confirm(`¿Eliminar “${paquete.nombre}”? También se eliminarán sus beneficios. Las reservaciones históricas no se modifican.`)) return;
    setErrorOperacion("");
    setMensajeExito("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/paquetes/${paquete.id}`, { method: "DELETE", headers: adminHeaders() });
      const body = response.status === 204 ? null : await response.json();
      redirigirSiNoAutorizado(response, navigate);
      if (!response.ok) throw new Error(body?.error || "No se pudo eliminar el paquete.");
      setFilas((actuales) => actuales.filter((item) => item.id !== paquete.id));
      setMensajeExito("Paquete eliminado.");
    } catch (reason) {
      setErrorOperacion(mensajeError(reason));
    }
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-350 px-5 py-8 sm:px-7 md:px-10 md:py-10 xl:px-12">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div><p className="mb-2 text-[10px] font-semibold! tracking-[.2em] text-neutral-500 uppercase sm:text-xs">Administración</p><h1 className="m-0 font-[Georgia] text-3xl font-normal! text-neutral-900 sm:text-4xl">Paquetes</h1><p className="mb-0 mt-2 text-xs text-neutral-500 sm:text-sm">Administra las opciones que se muestran en el catálogo.</p></div>
        <div className="flex gap-3"><button className="border border-[#a51c1c] bg-[#a51c1c] px-4 py-2.5 text-xs font-semibold! text-white transition-colors hover:bg-black sm:text-sm" type="button" onClick={abrirNuevo}>{textoNuevo}</button><button className="border border-neutral-300 bg-white px-4 py-2.5 text-xs font-semibold! text-neutral-800 transition-colors hover:border-[#b51f2a] hover:text-[#a51c1c] sm:text-sm" type="button" onClick={recargar}>Actualizar</button></div>
      </div>
      <nav className="mb-6 flex flex-wrap border-b border-neutral-200" aria-label="Secciones de paquetes">{secciones.map((seccion) => <button key={seccion.id} type="button" onClick={() => setSeccionActiva(seccion.id)} className={`border-0 border-b-2 bg-transparent px-4 py-3 text-sm font-semibold! ${seccionActiva === seccion.id ? "border-[#a51c1c] text-[#a51c1c]" : "border-transparent text-neutral-500 hover:text-neutral-900"}`}>{seccion.nombre}</button>)}</nav>
      {mensajeExito && <p className="mb-4 text-sm text-neutral-800" role="status">{mensajeExito}</p>}
      {errorOperacion && <p className="mb-4 text-sm text-[#a51c1c]" role="alert">{errorOperacion}</p>}
      {errorImagenes && <p className="mb-4 text-sm text-[#a51c1c]" role="alert">{errorImagenes}</p>}

      {error ? <div className="flex flex-wrap items-center justify-between gap-4 border border-neutral-200 bg-white p-5 text-sm text-[#a51c1c]" role="alert"><span>{error}</span><button className="underline" type="button" onClick={recargar}>Reintentar</button></div>
        : cargando ? <p className="border border-neutral-200 bg-white p-8 text-sm text-neutral-500">Cargando paquetes…</p>
          : filasVisibles.length ? <div className="grid gap-5 sm:grid-cols-3 xl:grid-cols-3">{filasVisibles.map((paquete) => <article className="overflow-hidden border border-neutral-200 bg-white" key={paquete.id}>
            {paquete.imagenUrl && <img className="h-48 w-full border-b border-neutral-200 object-cover" src={paquete.imagenUrl} alt={paquete.nombre} />}
            <div className="p-5"><div className="mb-4 flex items-start justify-between gap-3"><h2 className="m-0 font-[Georgia] text-xl font-normal! text-neutral-900">{paquete.nombre}</h2><span className={`shrink-0 border px-2.5 py-1 text-[10px] font-semibold! uppercase ${paquete.activo ? "border-[#a51c1c] bg-[#a51c1c] text-white" : "border-neutral-300 bg-white text-neutral-600"}`}>{paquete.activo ? "Publicado" : "Oculto"}</span></div>
              <p className="mb-4 text-lg font-semibold! text-[#a51c1c]">{precioPaquete(paquete.precio)}</p>
              {paquete.descripcion && <p className="mb-4 whitespace-pre-wrap text-sm leading-6 text-neutral-600">{paquete.descripcion}</p>}
              {(paquete.caracteristicas || []).length > 0 && <ul className="mb-5 grid gap-2 border-t border-neutral-200 pt-4 text-sm text-neutral-700">{paquete.caracteristicas.map((item) => <li className="flex gap-2" key={item.id}><span className="text-[#a51c1c]">•</span><span>{item.nombre}</span></li>)}</ul>}
              <div className="flex flex-wrap gap-2 border-t border-neutral-200 pt-4"><button type="button" onClick={() => abrirEdicion(paquete)} className="border border-[#a51c1c] px-3 py-2 text-xs font-semibold! text-[#a51c1c] hover:bg-[#a51c1c] hover:text-white">Editar</button><button type="button" onClick={() => cambiarPublicacion(paquete)} className="border border-neutral-400 px-3 py-2 text-xs font-semibold! text-neutral-700 hover:border-black hover:text-black">{paquete.activo ? "Ocultar" : "Publicar"}</button><button type="button" onClick={() => eliminar(paquete)} className="border border-neutral-300 px-3 py-2 text-xs font-semibold! text-neutral-600 hover:border-[#a51c1c] hover:text-[#a51c1c]">Eliminar</button></div>
            </div></article>)}</div>
          : <div className="border border-neutral-200 bg-white px-6 py-12 text-center"><h2 className="mb-2 font-[Georgia] text-xl font-normal! text-neutral-900">Todavía no hay paquetes</h2><p className="mb-5 text-sm text-neutral-500">Crea un paquete para comenzar a publicar opciones en el catálogo.</p><button type="button" onClick={abrirNuevo} className="border border-[#a51c1c] bg-[#a51c1c] px-4 py-2.5 text-xs font-semibold! text-white hover:bg-black">Nuevo paquete</button></div>}

      {!cargando && !error && <p className="mt-3 text-xs text-neutral-500">{filasVisibles.length} {nombreSeccion.toLowerCase()}</p>}

      {modalAbierto && <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/55 p-3 sm:p-4" onMouseDown={(evento) => { if (evento.target === evento.currentTarget && !guardando) setModalAbierto(false); }}><section role="dialog" aria-modal="true" aria-labelledby="paquete-modal-titulo" className="my-auto max-h-[75vh] w-full max-w-105 overflow-y-auto rounded-xl border border-neutral-300 bg-white p-4 shadow-2xl sm:p-5">
        <p className="mb-2 text-[10px] font-semibold! tracking-[.2em] text-[#a51c1c] uppercase">Catálogo</p><h2 id="paquete-modal-titulo" className="mb-4 font-[Georgia] text-xl font-normal! text-neutral-900">{paqueteEditando ? "Editar paquete" : "Nuevo paquete"}</h2>
        <form className="grid gap-3" onSubmit={guardar}>
          <label className={etiqueta}>Nombre del paquete<input className={campo} required maxLength={120} value={borrador.nombre} onChange={(evento) => setBorrador((actual) => ({ ...actual, nombre: evento.target.value }))} /></label>
          <label className={etiqueta}>Descripción<textarea className={campo} rows={2} value={borrador.descripcion} onChange={(evento) => setBorrador((actual) => ({ ...actual, descripcion: evento.target.value }))} /></label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className={etiqueta}>Precio (S/)<input className={campo} type="number" required min="0" step="0.01" value={borrador.precio} onChange={(evento) => setBorrador((actual) => ({ ...actual, precio: evento.target.value }))} /></label>
            <div className="flex items-end"><label className="flex items-center gap-3 text-xs font-semibold! text-neutral-700"><input type="checkbox" checked={borrador.activo} onChange={(evento) => setBorrador((actual) => ({ ...actual, activo: evento.target.checked }))} className="accent-[#a51c1c]" />Publicado en el sitio público</label></div>
          </div>
          <label className={etiqueta}>Beneficios incluidos <span className="font-normal! text-neutral-500">{"Escribe un beneficio por l\u00ednea."}</span><textarea className={campo} rows={3} value={borrador.beneficios} onChange={(evento) => setBorrador((actual) => ({ ...actual, beneficios: evento.target.value }))} /></label>
          <fieldset className="grid gap-2 border-0 p-0"><legend className="mb-1 text-xs font-semibold! text-neutral-700">Imagen de la biblioteca</legend>{imagenes.length ? <div className="grid max-h-40 grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-3">{imagenes.map((imagen) => <button key={imagen.id} type="button" onClick={() => setBorrador((actual) => ({ ...actual, imagenId: actual.imagenId === String(imagen.id) ? "" : String(imagen.id) }))} className={`overflow-hidden border text-left ${borrador.imagenId === String(imagen.id) ? "border-[#a51c1c] ring-2 ring-[#a51c1c]/20" : "border-neutral-200"}`}><img src={imagen.url} alt={imagen.nombre} className="h-16 w-full object-cover" /><span className="block truncate px-2 py-1 text-xs text-neutral-700">{imagen.nombre}</span></button>)}</div> : <p className="m-0 text-xs text-neutral-500">{"No hay im\u00e1genes disponibles en la biblioteca."}</p>}</fieldset>
          {errorOperacion && <p className="m-0 text-sm text-[#a51c1c]" role="alert">{errorOperacion}</p>}
          <div className="sticky bottom-0 z-10 -mx-4 mt-1 flex justify-end gap-2 border-t border-neutral-200 bg-white px-4 pt-2 pb-1 sm:-mx-5 sm:px-5"><button type="button" disabled={guardando} onClick={() => setModalAbierto(false)} className="border border-neutral-300 bg-white px-3 py-2 text-xs font-semibold! text-neutral-700">Cancelar</button><button type="submit" disabled={guardando} className="border border-[#a51c1c] bg-[#a51c1c] px-3 py-2 text-xs font-semibold! text-white disabled:opacity-60">{guardando ? "Guardando…" : "Guardar"}</button></div>
        </form>
      </section></div>}
    </main>
  );
}
