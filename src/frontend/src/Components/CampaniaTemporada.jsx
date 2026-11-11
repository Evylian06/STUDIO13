import { useEffect, useState } from "react";
import ReservaCampaniaModal from "./ReservaCampaniaModal";

const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:3001").replace(/\/+$/, "");
const formatDate = (value) => new Intl.DateTimeFormat("es-PE", {
  timeZone: "America/Lima",
  dateStyle: "medium",
  timeStyle: "short",
}).format(new Date(value));

export default function CampaniaTemporada() {
  const [campania, setCampania] = useState(null);
  const [reservaAbierta, setReservaAbierta] = useState(false);
  const [campaniaReservando, setCampaniaReservando] = useState(null);
  const [horaActual, setHoraActual] = useState(Date.now());

  useEffect(() => {
    let controller = null;
    let timerVigencia = null;
    let actualizando = false;
    let desmontado = false;
    const actualizar = async () => {
      if (desmontado || actualizando || document.visibilityState !== "visible") return;
      actualizando = true;
      const request = new AbortController();
      controller = request;
      try {
        const response = await fetch(`${API_BASE_URL}/api/campanias/activa`, { signal: request.signal, cache: "no-store" });
        if (!response.ok) throw new Error("No se pudo actualizar la campaña.");
        const data = await response.json();
        if (request.signal.aborted || desmontado) return;
        setCampania((actual) => JSON.stringify(actual) === JSON.stringify(data) ? actual : data);
        setCampaniaReservando((actual) => actual && data?.id === actual.id ? (JSON.stringify(actual) === JSON.stringify(data) ? actual : data) : actual);
        window.clearTimeout(timerVigencia);
        const siguienteCambio = data?.fin ? new Date(data.fin).getTime() : new Date(response.headers.get("X-Next-Campaign-Start") || "").getTime();
        if (Number.isFinite(siguienteCambio)) timerVigencia = window.setTimeout(() => {
            setHoraActual(Date.now());
            actualizar();
          }, Math.max(0, siguienteCambio - Date.now() + 20));
      } catch {
        // Conserva la campaña vigente y vuelve a intentarlo en el siguiente ciclo.
      } finally {
        if (controller === request) controller = null;
        actualizando = false;
      }
    };
    const alCambiarVisibilidad = () => { if (document.visibilityState === "visible") { setHoraActual(Date.now()); actualizar(); } };
    actualizar();
    const intervalo = window.setInterval(actualizar, 30000);
    document.addEventListener("visibilitychange", alCambiarVisibilidad);
    window.addEventListener("focus", actualizar);
    return () => {
      desmontado = true;
      controller?.abort();
      window.clearInterval(intervalo);
      window.clearTimeout(timerVigencia);
      document.removeEventListener("visibilitychange", alCambiarVisibilidad);
      window.removeEventListener("focus", actualizar);
    };
  }, []);

  const campaniaVisible = campania && new Date(campania.inicio).getTime() <= horaActual && new Date(campania.fin).getTime() > horaActual;
  const reservaDisponible = Boolean(campaniaVisible && campaniaReservando && campania.id === campaniaReservando.id && Number(campania.paqueteId) === Number(campaniaReservando.paqueteId));

  return (
    <>
    {campaniaVisible && <section className="bg-[#111010] px-6 py-12 sm:px-12 sm:py-16" aria-labelledby="campania-temporada-titulo">
      <div className="mx-auto grid max-w-340 items-center gap-8 lg:grid-cols-2 lg:gap-16">
        <img src={campania.imagenUrl} alt={campania.titulo} className="aspect-[16/10] w-full object-cover" />
        <div className="text-left text-[#e8e6e2]">
          <p className="mb-4 font-['Inter'] text-[0.62rem] tracking-[0.32em] uppercase text-[#a9a5a0]">Temporada especial</p>
          <h2 id="campania-temporada-titulo" className="mb-5 font-[Fraunces,Georgia,serif] text-[clamp(2rem,4vw,3.5rem)] leading-tight font-light text-[#e8e6e2]">{campania.titulo}</h2>
          <p className="mb-8 whitespace-pre-line font-['Inter'] text-sm leading-7 text-[#b5b1ac]">{campania.descripcion}</p>
          <p className="mb-6 font-['Inter'] text-xs text-[#b5b1ac]">Promoción del {formatDate(campania.inicio)} al {formatDate(campania.fin)}</p>
          <button type="button" onClick={() => { setCampaniaReservando(campania); setReservaAbierta(true); }} className="inline-flex min-h-11 items-center border border-[#a51c1c] bg-[#a51c1c] px-6 py-3 font-['Inter'] text-xs tracking-[0.14em] text-white no-underline transition-colors hover:border-white hover:bg-transparent">
            Reservar sesión
          </button>
        </div>
      </div>
    </section>}
      {reservaAbierta && campaniaReservando && <ReservaCampaniaModal campania={campaniaReservando} disponible={reservaDisponible} onClose={() => { setReservaAbierta(false); setCampaniaReservando(null); }} />}
    </>
  );
}
