import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL, adminHeaders, mensajeError, redirigirSiNoAutorizado } from "./useAdminCollection.js";

async function cargarDiagnostico(navigate) {
  const response = await fetch(`${API_BASE_URL}/api/tecnico/diagnostico`, { headers: adminHeaders() });
  const body = await response.json();
  redirigirSiNoAutorizado(response, navigate);
  if (!response.ok) throw new Error(body.error || "No se pudo obtener el diagnóstico técnico.");
  return body;
}

export default function DiagnosticoTecnico() {
  const navigate = useNavigate();
  const [estado, setEstado] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const consultar = useCallback(async () => {
    setCargando(true);
    setError("");
    try {
      setEstado(await cargarDiagnostico(navigate));
    } catch (reason) {
      setError(mensajeError(reason));
    } finally {
      setCargando(false);
    }
  }, [navigate]);

  useEffect(() => {
    let activo = true;
    cargarDiagnostico(navigate)
      .then((body) => { if (activo) setEstado(body); })
      .catch((reason) => { if (activo) setError(mensajeError(reason)); })
      .finally(() => { if (activo) setCargando(false); });
    return () => { activo = false; };
  }, [navigate]);

  const estadoLegible = (valor) => valor === "available" ? "Disponible" : valor === "unavailable" ? "Sin conexión" : "No consultado";
  const integraciones = [
    { nombre: "Cloudinary", configurada: estado?.integrations?.cloudinary },
    { nombre: "Correo electrónico", configurada: estado?.integrations?.email },
  ];

  return (
    <main className="mx-auto min-h-screen w-full max-w-350 px-5 py-8 sm:px-7 md:px-10 md:py-10 xl:px-12">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-[10px] font-semibold! tracking-[.2em] text-neutral-500 uppercase sm:text-xs">Herramientas técnicas</p>
          <h1 className="m-0 font-[Georgia] text-3xl font-normal! text-neutral-900 sm:text-4xl">Diagnóstico técnico</h1>
          <p className="mb-0 mt-2 text-xs text-neutral-500 sm:text-sm">Estado de servicios e integraciones, sin mostrar credenciales ni datos de clientes.</p>
        </div>
        <button className="border border-neutral-300 bg-white px-4 py-2.5 text-xs font-semibold! text-neutral-800 sm:text-sm" type="button" onClick={consultar} disabled={cargando}>Actualizar</button>
      </div>
      {error && <p className="mb-4 text-sm text-[#a51c1c]" role="alert">{error}</p>}
      <section className="grid gap-4 sm:grid-cols-2" aria-label="Estado técnico">
        {[
          { nombre: "Backend", estado: estadoLegible(estado?.backend) },
          { nombre: "Base de datos", estado: estadoLegible(estado?.database) },
          ...integraciones.map(({ nombre, configurada }) => ({ nombre, estado: configurada ? "Configurada" : "No configurada" })),
        ].map(({ nombre, estado: valor }) => (
          <article className="border border-neutral-200 bg-white p-5" key={nombre}>
            <h2 className="m-0 text-sm font-semibold! text-neutral-900">{nombre}</h2>
            <p className="mb-0 mt-3 text-sm text-neutral-600">{cargando ? "Consultando…" : valor}</p>
          </article>
        ))}
      </section>
      {estado?.checkedAt && <p className="mt-4 text-xs text-neutral-500">Consulta: {new Intl.DateTimeFormat("es", { dateStyle: "medium", timeStyle: "short" }).format(new Date(estado.checkedAt))}</p>}
    </main>
  );
}
