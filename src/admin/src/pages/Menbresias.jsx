import { useCallback, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL, adminHeaders, mensajeError, redirigirSiNoAutorizado, useAdminCollection } from "./useAdminCollection.js";
import { AdminLista } from "./AdminLista.jsx";

const formularioVacio = {
  nombre: "", descripcion: "", precio: "", periodo: "MENSUAL", beneficiosItems: [""],
  limiteSesiones: "", activo: false, ubicacionPublica: "MEMBRESIAS", agregarInicio: false,
};
const periodos = [
  { value: "MENSUAL", label: "Mensual" },
  { value: "TRIMESTRAL", label: "Trimestral" },
  { value: "ANUAL", label: "Anual" },
];
const campo = "w-full border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-[#a51c1c] disabled:bg-neutral-100 disabled:text-neutral-500";
const etiqueta = "grid gap-1.5 text-xs font-semibold! text-neutral-700";
const precioPlan = (valor) => new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(valor));
const errorRespuesta = async (response) => {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || "No se pudo completar la operación.");
  return body;
};

export default function Membresias() {
  const navigate = useNavigate();
  const { filas: planes, setFilas: setPlanes, cargando, error, recargar } = useAdminCollection("/api/admin/planes-membresia");
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("TODAS");
  const [pestanaActiva, setPestanaActiva] = useState("membresias");
  const recargarAdquiridasRef = useRef(() => {});
  const registrarRecargaAdquiridas = useCallback((recargarDisponible) => {
    recargarAdquiridasRef.current = recargarDisponible;
  }, []);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [planEditando, setPlanEditando] = useState(null);
  const [borrador, setBorrador] = useState(formularioVacio);
  const [guardando, setGuardando] = useState(false);
  const [errorOperacion, setErrorOperacion] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");
  const planesVisibles = useMemo(() => {
    const consulta = busqueda.trim().toLocaleLowerCase("es");
    return planes.filter((plan) => {
      const coincideNombre = !consulta || plan.nombre.toLocaleLowerCase("es").includes(consulta);
      const coincideEstado = filtroEstado === "TODAS"
        || (filtroEstado === "ARCHIVADAS" && plan.archivado)
        || (filtroEstado === "PUBLICADAS" && !plan.archivado && plan.activo)
        || (filtroEstado === "NO_PUBLICADAS" && !plan.archivado && !plan.activo);
      return coincideNombre && coincideEstado;
    });
  }, [planes, busqueda, filtroEstado]);

  const actualizarBorrador = (campoBorrador, valor) => setBorrador((actual) => ({ ...actual, [campoBorrador]: valor }));
  const cerrarModal = () => {
    setModalAbierto(false);
  };
  const abrirNueva = () => {
    setPlanEditando(null);
    setBorrador({ ...formularioVacio, beneficiosItems: [""] });
    setErrorOperacion("");
    setMensajeExito("");
    setModalAbierto(true);
  };

  const abrirEdicion = (plan) => {
    setPlanEditando(plan);
    setBorrador({
      nombre: plan.nombre || "",
      descripcion: plan.descripcion || "",
      precio: String(plan.precio ?? ""),
      periodo: plan.periodo || (plan.duracionDias >= 350 ? "ANUAL" : plan.duracionDias >= 80 ? "TRIMESTRAL" : "MENSUAL"),
      beneficiosItems: plan.beneficiosItems?.length ? plan.beneficiosItems.map((beneficio) => beneficio.nombre) : (plan.beneficios || "").split(/\r?\n/).filter(Boolean),
      limiteSesiones: plan.limiteSesiones == null ? "" : String(plan.limiteSesiones),
      activo: Boolean(plan.activo),
      ubicacionPublica: plan.ubicacionPublica || "MEMBRESIAS",
      agregarInicio: Boolean(plan.agregarInicio),
    });
    setErrorOperacion("");
    setMensajeExito("");
    setModalAbierto(true);
  };

  const guardar = async (evento) => {
    evento.preventDefault();
    if (guardando) return;
    const precio = Number(borrador.precio);
    const beneficios = borrador.beneficiosItems.map((item) => item.trim()).filter(Boolean);
    const limite = borrador.limiteSesiones === "" ? null : Number(borrador.limiteSesiones);
    if (!borrador.nombre.trim()) return setErrorOperacion("Escribe el nombre de la membresía.");
    if (!borrador.descripcion.trim()) return setErrorOperacion("Escribe una descripción para la membresía.");
    if (borrador.precio === "" || !Number.isFinite(precio) || precio < 0) return setErrorOperacion("Indica un precio válido igual o mayor que cero.");
    if (!periodos.some((periodo) => periodo.value === borrador.periodo)) return setErrorOperacion("Selecciona una duración válida.");
    if (!beneficios.length) return setErrorOperacion("Agrega al menos un beneficio.");
    if (limite !== null && (!Number.isInteger(limite) || limite < 1)) return setErrorOperacion("El límite de sesiones debe ser un entero mayor que cero.");

    setGuardando(true);
    setErrorOperacion("");
    setMensajeExito("");
    try {
      const payloadCompleto = {
        nombre: borrador.nombre.trim(),
        descripcion: borrador.descripcion.trim(),
        precio,
        periodo: borrador.periodo,
        beneficiosItems: beneficios,
        limiteSesiones: limite,
        activo: borrador.activo,
        ubicacionPublica: borrador.ubicacionPublica,
        agregarInicio: borrador.agregarInicio,
      };
      const payload = camposProtegidos ? {
        activo: borrador.activo,
        ubicacionPublica: borrador.ubicacionPublica,
        agregarInicio: borrador.agregarInicio,
      } : payloadCompleto;
      const response = await fetch(`${API_BASE_URL}/api/admin/planes-membresia${planEditando ? `/${planEditando.id}` : ""}`, {
        method: planEditando ? "PATCH" : "POST",
        headers: adminHeaders(true),
        body: JSON.stringify(payload),
      });
      redirigirSiNoAutorizado(response, navigate);
      const guardado = await errorRespuesta(response);
      if (planEditando) setPlanes((actuales) => actuales.map((plan) => plan.id === guardado.id ? guardado : plan));
      else setPlanes((actuales) => [...actuales, guardado]);
      cerrarModal();
      setMensajeExito(planEditando ? "Membresía actualizada." : "Membresía creada.");
    } catch (reason) {
      setErrorOperacion(mensajeError(reason));
    } finally {
      setGuardando(false);
    }
  };

  const actualizarEstado = async (plan, cambios, mensaje) => {
    setErrorOperacion("");
    setMensajeExito("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/planes-membresia/${plan.id}`, {
        method: "PATCH",
        headers: adminHeaders(true),
        body: JSON.stringify(cambios),
      });
      redirigirSiNoAutorizado(response, navigate);
      const actualizado = await errorRespuesta(response);
      setPlanes((actuales) => actuales.map((item) => item.id === actualizado.id ? actualizado : item));
      setMensajeExito(mensaje);
    } catch (reason) {
      setErrorOperacion(mensajeError(reason));
    }
  };

  const camposProtegidos = Boolean(planEditando?._count?.membresias);
  const cambiarPestanaConTeclado = (evento) => {
    const indiceActual = pestanaActiva === "membresias" ? 0 : 1;
    const indiceSiguiente = evento.key === "ArrowRight" ? (indiceActual + 1) % 2
      : evento.key === "ArrowLeft" ? (indiceActual + 1) % 2
        : evento.key === "Home" ? 0
          : evento.key === "End" ? 1
            : -1;
    if (indiceSiguiente < 0) return;
    evento.preventDefault();
    const siguiente = indiceSiguiente === 0 ? "membresias" : "adquiridas";
    setPestanaActiva(siguiente);
    document.getElementById(`membresias-tab-${siguiente}`)?.focus();
  };

  return <>
    <main className="pagina-tabla-admin pagina-membresias mx-auto min-h-screen w-full max-w-350 px-5 py-8 sm:px-7 md:px-10 md:py-10 xl:px-12">
      <div className="membership-page-heading mb-5 flex flex-wrap items-end justify-between gap-4">
        <div><p className="mb-2 text-[10px] font-semibold! tracking-[.2em] text-neutral-500 uppercase sm:text-xs">ADMINISTRACIÓN</p><h1 className="m-0 font-[Georgia] text-3xl font-normal! text-neutral-900 sm:text-4xl">Membresías</h1><p className="mb-0 mt-2 text-xs text-neutral-500 sm:text-sm">Administra planes y revisa las membresías de tus clientes.</p></div>
        <div className="membership-page-actions flex flex-wrap gap-2">
          {pestanaActiva === "membresias" && <button className="border border-[#a51c1c] bg-[#a51c1c] px-4 py-2.5 text-xs font-semibold! text-white transition-colors hover:bg-[#861717] sm:text-sm" type="button" onClick={abrirNueva}>Nueva membresía</button>}
          <button className="border border-neutral-300 bg-white px-4 py-2.5 text-xs font-semibold! text-neutral-800 transition-colors hover:border-[#b51f2a] hover:text-[#a51c1c] sm:text-sm" type="button" onClick={() => pestanaActiva === "membresias" ? recargar() : recargarAdquiridasRef.current()}>Actualizar</button>
        </div>
      </div>
      <nav className="membership-tabs" role="tablist" aria-label="Secciones de membresías" onKeyDown={cambiarPestanaConTeclado}>
        <button id="membresias-tab-membresias" type="button" role="tab" aria-selected={pestanaActiva === "membresias"} aria-controls="membresias-panel-membresias" tabIndex={pestanaActiva === "membresias" ? 0 : -1} onClick={() => setPestanaActiva("membresias")}>Membresías</button>
        <button id="membresias-tab-adquiridas" type="button" role="tab" aria-selected={pestanaActiva === "adquiridas"} aria-controls="membresias-panel-adquiridas" tabIndex={pestanaActiva === "adquiridas" ? 0 : -1} onClick={() => setPestanaActiva("adquiridas")}>Adquiridas</button>
      </nav>
      <section id="membresias-panel-membresias" className="membership-tab-panel" role="tabpanel" aria-labelledby="membresias-tab-membresias" hidden={pestanaActiva !== "membresias"}>
      {mensajeExito && <p className="mb-4 text-sm text-neutral-800" role="status">{mensajeExito}</p>}
      {errorOperacion && !modalAbierto && <p className="mb-4 text-sm text-[#a51c1c]" role="alert">{errorOperacion}</p>}

      <div className="mb-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_220px]">
        <label className={etiqueta}>Buscar por nombre<input className={campo} type="search" placeholder="Nombre de membresía" value={busqueda} onChange={(evento) => setBusqueda(evento.target.value)} /></label>
        <label className={etiqueta}>Estado<select className={campo} value={filtroEstado} onChange={(evento) => setFiltroEstado(evento.target.value)}><option value="TODAS">Todos los estados</option><option value="PUBLICADAS">Publicadas</option><option value="NO_PUBLICADAS">No publicadas</option><option value="ARCHIVADAS">Archivadas</option></select></label>
      </div>

      <div className="overflow-hidden border border-neutral-200 bg-white">
        {error ? <div className="flex flex-wrap items-center justify-between gap-4 p-5 text-sm text-[#a51c1c]" role="alert"><span>{error}</span><button className="underline" type="button" onClick={recargar}>Reintentar</button></div> : <div className="overflow-x-auto"><table className="w-full min-w-240 border-collapse text-left text-sm"><thead className="bg-[#111] text-white"><tr>{["Membresía", "Precio", "Duración", "Sesiones", "Beneficios", "Estado", "Acciones"].map((titulo) => <th className="px-4 py-4 text-xs font-semibold! tracking-wide" key={titulo}>{titulo}</th>)}</tr></thead><tbody>
          {cargando ? <tr><td className="px-5 py-8 text-neutral-500" colSpan={7}>Cargando membresías…</td></tr> : planesVisibles.length ? planesVisibles.map((plan) => {
            const archivado = Boolean(plan.archivado);
            const beneficios = plan.beneficiosItems?.map((item) => item.nombre) || (plan.beneficios || "").split(/\r?\n/).filter(Boolean);
            const periodo = periodos.find((item) => item.value === plan.periodo)?.label || `${plan.duracionDias} días`;
            return <tr className="border-t border-neutral-200 even:bg-[#faf9f8]" key={plan.id}>
              <td className="px-4 py-4"><div><p className="m-0 font-semibold! text-neutral-900">{plan.nombre}</p><p className="mb-0 mt-1 max-w-60 truncate text-xs text-neutral-500">{plan.descripcion || "Sin descripción"}</p></div></td>
              <td className="whitespace-nowrap px-4 py-4 text-neutral-700">{precioPlan(plan.precio)}</td>
              <td className="px-4 py-4 text-neutral-700">{periodo}</td>
              <td className="px-4 py-4 text-neutral-700">{plan.limiteSesiones ?? "Sin límite"}</td>
              <td className="px-4 py-4 text-neutral-700">{beneficios.length ? `${beneficios.length} beneficio(s)` : "—"}</td>
              <td className="px-4 py-4"><span className={`border px-2.5 py-1 text-[10px] font-semibold! uppercase ${archivado ? "border-neutral-300 bg-neutral-100 text-neutral-600" : plan.activo ? "border-[#a51c1c] bg-[#a51c1c] text-white" : "border-neutral-300 bg-white text-neutral-600"}`}>{archivado ? "Archivada" : plan.activo ? "Publicada" : "No publicada"}</span>{plan._count?.membresias > 0 && <span className="mt-2 block text-xs text-neutral-500">{plan._count.membresias} cliente(s)</span>}</td>
              <td className="whitespace-nowrap px-4 py-4"><div className="flex flex-wrap gap-2">
                <button className="border border-[#a51c1c] px-3 py-2 text-xs font-semibold! text-[#a51c1c] transition-colors hover:bg-[#a51c1c] hover:text-white" type="button" onClick={() => abrirEdicion(plan)}>Editar</button>
                {archivado ? <button className="border border-neutral-300 px-3 py-2 text-xs font-semibold! text-neutral-700 hover:border-black hover:text-black" type="button" onClick={() => actualizarEstado(plan, { archivado: false }, "Membresía restaurada como no publicada.")}>Restaurar</button> : <>
                  <button className="border border-neutral-300 px-3 py-2 text-xs font-semibold! text-neutral-700 hover:border-black hover:text-black" type="button" onClick={() => actualizarEstado(plan, { activo: !plan.activo }, plan.activo ? "Membresía despublicada." : "Membresía publicada.")}>{plan.activo ? "Despublicar" : "Publicar"}</button>
                  <button className="border border-neutral-300 px-3 py-2 text-xs font-semibold! text-neutral-700 hover:border-black hover:text-black" type="button" onClick={() => actualizarEstado(plan, { archivado: true }, "Membresía archivada.")}>Archivar</button>
                </>}
              </div></td>
            </tr>;
          }) : <tr><td className="px-5 py-8 text-neutral-500" colSpan={7}>{planes.length ? "No hay membresías que coincidan con la búsqueda y el filtro." : "Todavía no hay membresías registradas."}</td></tr>}
        </tbody></table></div>}
      </div>
      {!cargando && !error && <p className="mt-3 text-xs text-neutral-500">{planesVisibles.length} de {planes.length} membresías</p>}
      </section>
      <section id="membresias-panel-adquiridas" className="membership-tab-panel" role="tabpanel" aria-labelledby="membresias-tab-adquiridas" hidden={pestanaActiva !== "adquiridas"}>
    <AdminLista titulo="Membresías adquiridas" endpoint="/api/membresias" ocultarEncabezado onRecargarDisponible={registrarRecargaAdquiridas} columnas={[
      { key: "cliente.nombre", label: "Cliente" }, { key: "plan.nombre", label: "Plan" },
      { key: "fechaInicio", label: "Inicio", date: true }, { key: "fechaFin", label: "Vencimiento", date: true }, { key: "estado", label: "Estado" },
    ]} />
      </section>
    </main>

    {modalAbierto && <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/55 p-4" onMouseDown={(evento) => { if (evento.target === evento.currentTarget && !guardando) cerrarModal(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="membresia-modal-titulo" className="my-auto max-h-[85vh] w-full max-w-lg overflow-y-auto border border-neutral-200 bg-white p-4 shadow-2xl sm:p-5">
        <p className="mb-2 text-[10px] font-semibold! tracking-[.2em] text-[#a51c1c] uppercase">Planes de suscripción</p>
        <h2 id="membresia-modal-titulo" className="mb-6 font-[Georgia] text-2xl font-normal! text-neutral-900">{planEditando ? "Editar membresía" : "Nueva membresía"}</h2>
        {camposProtegidos && <p className="mb-4 border-l-2 border-[#a51c1c] pl-3 text-xs text-neutral-600">Este plan ya tiene clientes inscritos. Sus condiciones y beneficios están protegidos para conservar el historial; puedes cambiar publicación, ubicación o archivarlo.</p>}
        <form className="grid gap-4" onSubmit={guardar}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={etiqueta}>Nombre<input className={campo} required maxLength={120} disabled={camposProtegidos} value={borrador.nombre} onChange={(evento) => actualizarBorrador("nombre", evento.target.value)} placeholder="Nombre del plan" /></label>
            <label className={etiqueta}>Precio (S/)<div className="flex items-center border border-neutral-300 focus-within:border-[#a51c1c]"><span className="px-3 text-sm text-neutral-500">S/</span><input className="w-full border-0 bg-transparent px-2 py-2 text-sm outline-none disabled:bg-neutral-100" type="number" required min="0" step="0.01" disabled={camposProtegidos} value={borrador.precio} onChange={(evento) => actualizarBorrador("precio", evento.target.value)} placeholder="0.00" /></div></label>
          </div>
          <label className={etiqueta}>Descripción<textarea className={campo} required maxLength={1000} rows={3} disabled={camposProtegidos} value={borrador.descripcion} onChange={(evento) => actualizarBorrador("descripcion", evento.target.value)} placeholder="Describe brevemente el plan y a quién está dirigido." /></label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={etiqueta}>Duración<select className={campo} required disabled={camposProtegidos} value={borrador.periodo} onChange={(evento) => actualizarBorrador("periodo", evento.target.value)}>{periodos.map((periodo) => <option value={periodo.value} key={periodo.value}>{periodo.label}</option>)}</select></label>
            <label className={etiqueta}>Límite de uso (sesiones)<span className="font-normal! text-neutral-500">Déjalo vacío si no corresponde.</span><input className={campo} type="number" min="1" step="1" disabled={camposProtegidos} value={borrador.limiteSesiones} onChange={(evento) => actualizarBorrador("limiteSesiones", evento.target.value)} placeholder="Sin límite" /></label>
          </div>
          <fieldset className="grid gap-2 border-0 p-0" disabled={camposProtegidos}>
            <legend className="mb-1 text-xs font-semibold! text-neutral-700">Beneficios incluidos</legend>
            {borrador.beneficiosItems.map((beneficio, index) => <div className="flex gap-2" key={index}>
              <input className={campo} required value={beneficio} onChange={(evento) => setBorrador((actual) => ({ ...actual, beneficiosItems: actual.beneficiosItems.map((item, itemIndex) => itemIndex === index ? evento.target.value : item) }))} placeholder="Escribe un beneficio" />
              <button className="shrink-0 border border-neutral-300 px-3 text-sm text-neutral-600 hover:border-[#a51c1c] hover:text-[#a51c1c] disabled:opacity-40" type="button" aria-label={`Eliminar beneficio ${index + 1}`} disabled={borrador.beneficiosItems.length === 1} onClick={() => setBorrador((actual) => ({ ...actual, beneficiosItems: actual.beneficiosItems.filter((_, itemIndex) => itemIndex !== index) }))}>Eliminar</button>
            </div>)}
            <button className="w-fit border border-neutral-300 px-3 py-2 text-xs font-semibold! text-neutral-700 hover:border-black" type="button" onClick={() => setBorrador((actual) => ({ ...actual, beneficiosItems: [...actual.beneficiosItems, ""] }))}>+ Agregar beneficio</button>
          </fieldset>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={etiqueta}>Ubicación pública<select className={campo} value={borrador.ubicacionPublica} onChange={(evento) => setBorrador((actual) => ({ ...actual, ubicacionPublica: evento.target.value, agregarInicio: evento.target.value === "INICIO" ? true : actual.agregarInicio }))}><option value="MEMBRESIAS">Membresías</option><option value="INICIO">Inicio</option></select></label>
            <div className="grid content-end gap-3"><label className="flex items-center gap-3 text-xs font-semibold! text-neutral-700"><input type="checkbox" checked={borrador.agregarInicio} onChange={(evento) => setBorrador((actual) => ({ ...actual, agregarInicio: evento.target.checked, ubicacionPublica: !evento.target.checked && actual.ubicacionPublica === "INICIO" ? "MEMBRESIAS" : actual.ubicacionPublica }))} className="accent-[#a51c1c]" />Agregar a Inicio</label><label className="flex items-center gap-3 text-xs font-semibold! text-neutral-700"><input type="checkbox" checked={borrador.activo} onChange={(evento) => actualizarBorrador("activo", evento.target.checked)} className="accent-[#a51c1c]" />Publicada</label></div>
          </div>
          {errorOperacion && <p className="m-0 text-sm text-[#a51c1c]" role="alert">{errorOperacion}</p>}
          <div className="mt-2 flex flex-wrap justify-end gap-3"><button className="border border-neutral-300 bg-white px-4 py-2.5 text-xs font-semibold! text-neutral-700 disabled:opacity-60" type="button" disabled={guardando} onClick={cerrarModal}>Cancelar</button><button className="border border-[#a51c1c] bg-[#a51c1c] px-4 py-2.5 text-xs font-semibold! text-white disabled:opacity-60" type="submit" disabled={guardando}>{guardando ? "Guardando…" : planEditando ? "Guardar cambios" : "Crear membresía"}</button></div>
        </form>
      </section>
    </div>}
  </>;
}
