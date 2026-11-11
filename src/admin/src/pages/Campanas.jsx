import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL, adminHeaders, mensajeError, redirigirSiNoAutorizado, useAdminCollection } from "./useAdminCollection.js";

const formularioVacio = { titulo: "", descripcion: "", inicio: "", fin: "", paqueteId: "", habilitada: true };
const campo = "w-full border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none focus:border-[#a51c1c]";
const etiqueta = "grid gap-1.5 text-xs font-semibold! text-neutral-700";

const fechaLocalPeru = (value) => {
  if (!value) return "";
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Lima", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(new Date(value));
  const part = Object.fromEntries(parts.map(({ type, value: text }) => [type, text]));
  return `${part.year}-${part.month}-${part.day}T${part.hour}:${part.minute}`;
};

const fechaPeruIso = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return "";
  return new Date(`${value}:00-05:00`).toISOString();
};

const mostrarFecha = (value) => new Intl.DateTimeFormat("es-PE", {
  timeZone: "America/Lima", dateStyle: "medium", timeStyle: "short",
}).format(new Date(value));

const estadoCampania = (campania) => {
  if (!campania.habilitada) return "Desactivada";
  const ahora = Date.now();
  if (ahora < new Date(campania.inicio).getTime()) return "Programada";
  if (ahora >= new Date(campania.fin).getTime()) return "Vencida";
  return "Activa";
};

export default function Campanas() {
  const navigate = useNavigate();
  const { filas, setFilas, cargando, error, recargar } = useAdminCollection("/api/admin/campanias");
  const [paquetes, setPaquetes] = useState([]);
  const [errorPaquetes, setErrorPaquetes] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [campaniaEditando, setCampaniaEditando] = useState(null);
  const [borrador, setBorrador] = useState(formularioVacio);
  const [imagen, setImagen] = useState(null);
  const [vistaPrevia, setVistaPrevia] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [errorOperacion, setErrorOperacion] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");
  const [eliminandoId, setEliminandoId] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API_BASE_URL}/api/admin/paquetes`, { signal: controller.signal, headers: adminHeaders() })
      .then(async (response) => {
        const body = await response.json();
        redirigirSiNoAutorizado(response, navigate);
        if (!response.ok) throw new Error(body.error || "No se pudieron cargar los paquetes.");
        return body;
      })
      .then((body) => { if (!controller.signal.aborted) setPaquetes(body.filter((paquete) => paquete.activo && (paquete.seccion === "CAMPANIA" || paquete.seccion === "SESION"))); })
      .catch((reason) => { if (!controller.signal.aborted) setErrorPaquetes(mensajeError(reason)); });
    return () => controller.abort();
  }, [navigate]);

  useEffect(() => () => { if (vistaPrevia.startsWith("blob:")) URL.revokeObjectURL(vistaPrevia); }, [vistaPrevia]);

  const limpiarModal = () => {
    setModalAbierto(false);
    setCampaniaEditando(null);
    setBorrador(formularioVacio);
    setImagen(null);
    setVistaPrevia("");
    setErrorOperacion("");
  };

  const abrirNueva = () => {
    setCampaniaEditando(null);
    setBorrador({ ...formularioVacio, paqueteId: paquetes[0] ? String(paquetes[0].id) : "" });
    setImagen(null);
    setVistaPrevia("");
    setErrorOperacion("");
    setModalAbierto(true);
  };

  const abrirEdicion = (campania) => {
    setCampaniaEditando(campania);
    setBorrador({
      titulo: campania.titulo,
      descripcion: campania.descripcion,
      inicio: fechaLocalPeru(campania.inicio),
      fin: fechaLocalPeru(campania.fin),
      paqueteId: String(campania.paqueteId),
      habilitada: campania.habilitada,
    });
    setImagen(null);
    setVistaPrevia(campania.imagenUrl);
    setErrorOperacion("");
    setModalAbierto(true);
  };

  const guardar = async (evento) => {
    evento.preventDefault();
    if (guardando) return;
    if (!campaniaEditando && !imagen) return setErrorOperacion("Selecciona una imagen para la campaña.");
    const inicio = fechaPeruIso(borrador.inicio);
    const fin = fechaPeruIso(borrador.fin);
    if (!inicio || !fin || new Date(inicio) >= new Date(fin)) return setErrorOperacion("Revisa las fechas: el fin debe ser posterior al inicio (hora de Perú).");
    if (!borrador.paqueteId) return setErrorOperacion("Selecciona un paquete de Sesiones publicado.");

    const formData = new FormData();
    formData.set("titulo", borrador.titulo.trim());
    formData.set("descripcion", borrador.descripcion.trim());
    formData.set("inicio", inicio);
    formData.set("fin", fin);
    formData.set("paqueteId", borrador.paqueteId);
    formData.set("habilitada", String(borrador.habilitada));
    if (imagen) formData.set("imagen", imagen);

    setGuardando(true);
    setErrorOperacion("");
    setMensajeExito("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/campanias${campaniaEditando ? `/${campaniaEditando.id}` : ""}`, {
        method: campaniaEditando ? "PATCH" : "POST",
        headers: adminHeaders(),
        body: formData,
      });
      const body = await response.json();
      redirigirSiNoAutorizado(response, navigate);
      if (!response.ok) throw new Error(body.error || "No se pudo guardar la campaña.");
      setFilas((actuales) => campaniaEditando
        ? actuales.map((item) => item.id === body.id ? body : item)
        : [body, ...actuales].sort((a, b) => new Date(b.inicio) - new Date(a.inicio)));
      limpiarModal();
      setMensajeExito(campaniaEditando ? "Campaña actualizada." : "Campaña creada.");
    } catch (reason) {
      setErrorOperacion(mensajeError(reason));
    } finally {
      setGuardando(false);
    }
  };

  const cambiarEstado = async (campania) => {
    setErrorOperacion("");
    setMensajeExito("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/campanias/${campania.id}/publicacion`, {
        method: "PATCH",
        headers: adminHeaders(true),
        body: JSON.stringify({ habilitada: !campania.habilitada }),
      });
      const body = await response.json();
      redirigirSiNoAutorizado(response, navigate);
      if (!response.ok) throw new Error(body.error || "No se pudo cambiar el estado de la campaña.");
      setFilas((actuales) => actuales.map((item) => item.id === body.id ? body : item));
      setMensajeExito(body.habilitada ? "Campaña habilitada." : "Campaña desactivada.");
    } catch (reason) {
      setErrorOperacion(mensajeError(reason));
    }
  };

  const eliminarCampania = async (campania) => {
    if (!window.confirm(`¿Eliminar la campaña «${campania.titulo}»? Las reservas existentes conservarán su nombre histórico.`)) return;
    setErrorOperacion("");
    setMensajeExito("");
    setEliminandoId(campania.id);
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/campanias/${campania.id}`, {
        method: "DELETE",
        headers: adminHeaders(),
      });
      const body = response.status === 204 ? null : await response.json().catch(() => null);
      redirigirSiNoAutorizado(response, navigate);
      if (!response.ok) throw new Error(body?.error || "No se pudo eliminar la campaña.");
      setFilas((actuales) => actuales.filter((item) => item.id !== campania.id));
      setMensajeExito("Campaña eliminada.");
    } catch (reason) {
      setErrorOperacion(mensajeError(reason));
    } finally {
      setEliminandoId(null);
    }
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-350 px-5 py-8 sm:px-7 md:px-10 md:py-10 xl:px-12">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-[10px] font-semibold! tracking-[.2em] text-neutral-500 uppercase sm:text-xs">Administración</p>
          <h1 className="m-0 font-[Georgia] text-3xl font-normal! text-neutral-900 sm:text-4xl">Campañas</h1>
          <p className="mb-0 mt-2 text-xs text-neutral-500 sm:text-sm">Programa promociones para paquetes de Sesiones. Las fechas usan la hora de Perú.</p>
        </div>
        <div className="flex gap-3">
          <button className="border border-[#a51c1c] bg-[#a51c1c] px-4 py-2.5 text-xs font-semibold! text-white hover:bg-black sm:text-sm" type="button" onClick={abrirNueva}>Nueva campaña</button>
          <button className="border border-neutral-300 bg-white px-4 py-2.5 text-xs font-semibold! text-neutral-800 hover:border-[#b51f2a] hover:text-[#a51c1c] sm:text-sm" type="button" onClick={recargar}>Actualizar</button>
        </div>
      </div>

      {mensajeExito && <p className="mb-4 text-sm text-neutral-800" role="status">{mensajeExito}</p>}
      {errorOperacion && !modalAbierto && <p className="mb-4 text-sm text-[#a51c1c]" role="alert">{errorOperacion}</p>}
      {errorPaquetes && <p className="mb-4 text-sm text-[#a51c1c]" role="alert">{errorPaquetes}</p>}
      {!errorPaquetes && !paquetes.some((paquete) => paquete.seccion === "CAMPANIA") && <p className="mb-4 border border-neutral-200 bg-white p-4 text-sm text-neutral-600">Primero publica un paquete en Paquetes → Campañas para poder asociarlo a un anuncio.</p>}

      {error ? <div className="border border-neutral-200 bg-white p-5 text-sm text-[#a51c1c]" role="alert">{error}<button className="ml-3 underline" type="button" onClick={recargar}>Reintentar</button></div>
        : cargando ? <p className="border border-neutral-200 bg-white p-8 text-sm text-neutral-500">Cargando campañas…</p>
          : filas.length ? <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{filas.map((campania) => {
            const estado = estadoCampania(campania);
            return <article key={campania.id} className="overflow-hidden border border-neutral-200 bg-white">
              <img src={campania.imagenUrl} alt={campania.titulo} className="h-48 w-full border-b border-neutral-200 object-cover" />
              <div className="p-5">
                <div className="mb-3 flex items-start justify-between gap-3"><h2 className="m-0 font-[Georgia] text-xl font-normal! text-neutral-900">{campania.titulo}</h2><span className={`shrink-0 border px-2.5 py-1 text-[10px] font-semibold! uppercase ${estado === "Activa" ? "border-green-700 bg-green-700 text-white" : "border-neutral-300 bg-white text-neutral-600"}`}>{estado}</span></div>
                <p className="mb-4 line-clamp-3 whitespace-pre-wrap text-sm leading-6 text-neutral-600">{campania.descripcion}</p>
                <dl className="mb-4 grid gap-2 border-t border-neutral-200 pt-4 text-xs text-neutral-600"><div><dt className="inline font-semibold! text-neutral-800">Paquete: </dt><dd className="inline">{campania.paquete?.nombre || "No disponible"}</dd></div><div><dt className="inline font-semibold! text-neutral-800">Inicio: </dt><dd className="inline">{mostrarFecha(campania.inicio)}</dd></div><div><dt className="inline font-semibold! text-neutral-800">Fin: </dt><dd className="inline">{mostrarFecha(campania.fin)}</dd></div></dl>
                <div className="flex flex-wrap gap-2 border-t border-neutral-200 pt-4"><button type="button" onClick={() => abrirEdicion(campania)} className="border border-[#a51c1c] px-3 py-2 text-xs font-semibold! text-[#a51c1c] hover:bg-[#a51c1c] hover:text-white">Editar</button><button type="button" onClick={() => cambiarEstado(campania)} className="border border-neutral-400 px-3 py-2 text-xs font-semibold! text-neutral-700">{campania.habilitada ? "Desactivar" : "Habilitar"}</button><button type="button" disabled={eliminandoId === campania.id} onClick={() => eliminarCampania(campania)} className="border border-red-300 px-3 py-2 text-xs font-semibold! text-red-700 hover:border-red-700 hover:bg-red-700 hover:text-white disabled:cursor-wait disabled:opacity-60">{eliminandoId === campania.id ? "Eliminando…" : "Eliminar"}</button></div>
              </div>
            </article>;
          })}</div>
          : <div className="border border-neutral-200 bg-white px-6 py-12 text-center"><h2 className="mb-2 font-[Georgia] text-xl font-normal! text-neutral-900">Todavía no hay campañas</h2><p className="mb-5 text-sm text-neutral-500">Crea una campaña para mostrar una promoción de temporada en Inicio.</p><button type="button" disabled={!paquetes.length} onClick={abrirNueva} className="border border-[#a51c1c] bg-[#a51c1c] px-4 py-2.5 text-xs font-semibold! text-white disabled:opacity-50">Nueva campaña</button></div>}

      {modalAbierto && <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/55 p-3 sm:p-4" onMouseDown={(evento) => { if (evento.target === evento.currentTarget && !guardando) limpiarModal(); }}><section role="dialog" aria-modal="true" aria-labelledby="campania-modal-titulo" className="my-auto max-h-[90vh] w-full max-w-2xl overflow-y-auto border border-neutral-300 bg-white p-5 shadow-2xl sm:p-7">
        <p className="mb-2 text-[10px] font-semibold! tracking-[.2em] text-[#a51c1c] uppercase">Promoción de temporada</p><h2 id="campania-modal-titulo" className="mb-5 font-[Georgia] text-2xl font-normal! text-neutral-900">{campaniaEditando ? "Editar campaña" : "Nueva campaña"}</h2>
        <form className="grid gap-4" onSubmit={guardar}>
          <label className={etiqueta}>Título<input className={campo} required maxLength={140} value={borrador.titulo} onChange={(evento) => setBorrador((actual) => ({ ...actual, titulo: evento.target.value }))} /></label>
          <label className={etiqueta}>Descripción<textarea className={campo} required rows={4} value={borrador.descripcion} onChange={(evento) => setBorrador((actual) => ({ ...actual, descripcion: evento.target.value }))} /></label>
          <label className={etiqueta}>Paquete asociado<select className={campo} required value={borrador.paqueteId} onChange={(evento) => setBorrador((actual) => ({ ...actual, paqueteId: evento.target.value }))}><option value="">Selecciona un paquete</option>{paquetes.filter((paquete) => paquete.seccion === "CAMPANIA" || (campaniaEditando && Number(paquete.id) === Number(campaniaEditando.paqueteId))).map((paquete) => <option key={paquete.id} value={paquete.id}>{paquete.nombre} (ID {paquete.id})</option>)}</select></label>
          <div className="grid gap-4 sm:grid-cols-2"><label className={etiqueta}>Inicio (hora de Perú)<input className={campo} required type="datetime-local" value={borrador.inicio} onChange={(evento) => setBorrador((actual) => ({ ...actual, inicio: evento.target.value }))} /></label><label className={etiqueta}>Fin (hora de Perú)<input className={campo} required type="datetime-local" value={borrador.fin} onChange={(evento) => setBorrador((actual) => ({ ...actual, fin: evento.target.value }))} /></label></div>
          <label className={etiqueta}>Imagen de campaña<input className={campo} required={!campaniaEditando} type="file" accept="image/jpeg,image/png,image/webp" onChange={(evento) => { const file = evento.target.files?.[0] || null; setImagen(file); setVistaPrevia(file ? URL.createObjectURL(file) : campaniaEditando?.imagenUrl || ""); }} /><span className="font-normal! text-neutral-500">JPG, PNG o WEBP; hasta 5 MB.</span></label>
          {vistaPrevia && <img src={vistaPrevia} alt="Vista previa de la campaña" className="max-h-56 w-full border border-neutral-200 object-cover" />}
          <label className="flex items-center gap-3 text-xs font-semibold! text-neutral-700"><input type="checkbox" checked={borrador.habilitada} onChange={(evento) => setBorrador((actual) => ({ ...actual, habilitada: evento.target.checked }))} className="accent-[#a51c1c]" />Campaña habilitada durante las fechas indicadas</label>
          {errorOperacion && <p className="m-0 text-sm text-[#a51c1c]" role="alert">{errorOperacion}</p>}
          <div className="sticky bottom-0 -mx-5 mt-1 flex justify-end gap-2 border-t border-neutral-200 bg-white px-5 pt-3 sm:-mx-7 sm:px-7"><button type="button" disabled={guardando} onClick={limpiarModal} className="border border-neutral-300 px-4 py-2.5 text-xs font-semibold! text-neutral-700">Cancelar</button><button type="submit" disabled={guardando || !paquetes.length} className="border border-[#a51c1c] bg-[#a51c1c] px-4 py-2.5 text-xs font-semibold! text-white disabled:opacity-60">{guardando ? "Guardando…" : "Guardar campaña"}</button></div>
        </form>
      </section></div>}
    </main>
  );
}
