import { useEffect, useState } from "react";
import { Icono, useMenuAdmin } from "./Layout/AdminLayout.jsx";
import portada from "../assets/imagen01.jpg";
import portada2 from "../assets/imagen02.jpg";
import portada3 from "../assets/imagen03.jpg";

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:3001"
).replace(/\/+$/, "");

const recursos = [
  { key: "reservaciones", label: "Reservaciones", endpoint: "/api/reservaciones" },
  { key: "clientes", label: "Clientes", endpoint: "/api/clientes" },
  { key: "servicios", label: "Servicios", endpoint: "/api/servicios" },
  { key: "paquetes", label: "Paquetes", endpoint: "/api/paquetes" },
  { key: "membresias", label: "Membresías", endpoint: "/api/planes-membresia" },
  { key: "galerias", label: "Galería", endpoint: "/api/galerias" },
];

const estadisticas = [
  { key: "reservaciones", label: "Reservaciones", note: "pendientes" },
  { key: "clientes", label: "Clientes", note: "En la base de clientes" },
  { key: "servicios", label: "Servicios", note: "Registros en catálogo" },
  { key: "paquetes", label: "Paquetes", note: "Registros en catálogo" },
  { key: "membresias", label: "Membresías", note: "Planes registrados" },
];

function leerAdmin() {
  try {
    const admin = JSON.parse(sessionStorage.getItem("studio13Admin") || "null");
    return admin && typeof admin.name === "string" ? admin : null;
  } catch {
    return null;
  }
}

function fechaLegible(valor, opciones = {}) {
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return null;
  return new Intl.DateTimeFormat("es-CR", opciones).format(fecha);
}

function fechaHoraLocal(reserva) {
  const coincidencia = String(reserva.fecha || "").match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!coincidencia) return null;
  const [, anio, mes, dia] = coincidencia;
  const [hora = "0", minuto = "0"] = String(reserva.hora || "00:00").split(":");
  const fecha = new Date(Number(anio), Number(mes) - 1, Number(dia), Number(hora), Number(minuto));
  return Number.isNaN(fecha.getTime()) ? null : fecha;
}

function elegirImagenesAleatorias(imagenes = []) {
  const mezcla = [...imagenes];
  for (let indice = mezcla.length - 1; indice > 0; indice -= 1) {
    const aleatorio = Math.floor(Math.random() * (indice + 1));
    [mezcla[indice], mezcla[aleatorio]] = [mezcla[aleatorio], mezcla[indice]];
  }
  return mezcla.slice(0, 3);
}

function obtenerImagenes(galerias = []) {
  return galerias.flatMap((galeria) =>
    (galeria.imagenes || [])
      .filter(
        (imagen) =>
          imagen.activo !== false &&
          typeof imagen.url === "string" &&
          imagen.url,
      )
      .map((imagen) => ({
        id: imagen.id,
        url: imagen.url.startsWith("/uploads/") ? `${API_BASE_URL}${imagen.url}` : imagen.url,
        titulo: imagen.titulo || galeria.nombre || "Fotografía",
        galeria: galeria.nombre || "Galería",
      })),
  );
}

function Inicio() {
  const admin = leerAdmin();
  const menu = useMenuAdmin();
  const setMenuAbierto = menu?.setMenuAbierto;
  const [cargando, setCargando] = useState(true);
  const [datos, setDatos] = useState({});
  const [imagenesSeleccionadas, setImagenesSeleccionadas] = useState([]);
  const [imagenesRota, setImagenesRota] = useState({});
  const [errores, setErrores] = useState([]);
  const [actualizacion, setActualizacion] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    Promise.allSettled(
      recursos.map(async ({ key, endpoint }) => {
        const token = sessionStorage.getItem("studio13AdminToken");
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
          signal: controller.signal,
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (response.status === 401) {
          sessionStorage.removeItem("studio13AdminToken");
          sessionStorage.removeItem("studio13Admin");
          window.location.assign("/iniciar-sesion");
          throw new Error("La sesión expiró. Inicia sesión nuevamente.");
        }
        let result;
        try {
          result = await response.json();
        } catch {
          throw new Error(`La respuesta de ${endpoint} no es válida.`);
        }
        if (!response.ok) {
          throw new Error(result.error || `No se pudo cargar ${endpoint}.`);
        }
        if (!Array.isArray(result)) {
          throw new Error(`El formato de datos de ${endpoint} no es válido.`);
        }
        return [key, result];
      }),
    ).then((resultados) => {
      if (controller.signal.aborted) return;

      const datosCargados = {};
      const erroresCarga = [];
      resultados.forEach((resultado, index) => {
        if (resultado.status === "fulfilled") {
          const [key, values] = resultado.value;
          datosCargados[key] = values;
        } else {
          erroresCarga.push(
            `${recursos[index].label}: ${resultado.reason.message}`,
          );
        }
      });

      setDatos(datosCargados);
      setErrores(erroresCarga);
      setCargando(false);
    });

    return () => controller.abort();
  }, [actualizacion]);

  const actualizarDatos = () => {
    setCargando(true);
    setActualizacion((value) => value + 1);
  };

  useEffect(() => {
    if (Array.isArray(datos.galerias)) {
      setImagenesSeleccionadas(elegirImagenesAleatorias(obtenerImagenes(datos.galerias)));
      setImagenesRota({});
    }
  }, [datos.galerias]);

  const imagenes = imagenesSeleccionadas;
  const reservaciones = datos.reservaciones;
  const proximasReservaciones = (reservaciones || [])
    .filter((reserva) => ["PENDIENTE", "CONFIRMADA"].includes(reserva.estado) && fechaHoraLocal(reserva) >= new Date())
    .sort((a, b) => fechaHoraLocal(a) - fechaHoraLocal(b));
  const siguientesReservaciones = proximasReservaciones.slice(0, 5);
  const pendientes = reservaciones?.filter(
    (reserva) => reserva.estado === "PENDIENTE",
  ).length;
  const fechaHoy = fechaLegible(new Date(), {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-[#f5f4f2] text-[#171717]">
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-neutral-200 bg-white/95 px-5 backdrop-blur sm:px-7 md:h-18 md:px-10">
        <div className="flex items-center gap-3 text-xs text-neutral-500 sm:text-sm">
          <button
            className="mr-1 inline-flex border-0 bg-transparent p-1.5 text-neutral-800 md:hidden"
            type="button"
            aria-label="Abrir menú"
            onClick={() => setMenuAbierto?.(true)}
          >
            <Icono name="menu" size={20} />
          </button>
          <span>Studio13</span>
          <span className="text-neutral-300">/</span>
          <span className="text-neutral-800">Inicio</span>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <span className="flex items-center gap-2 text-[10px] text-neutral-500 sm:text-xs">
            <i className="h-2 w-2 rounded-full bg-[#b51f2a]" />
            Sesión activa
          </span>
          <span className="hidden h-5 w-px bg-neutral-200 sm:block" />
          <span className="grid h-9 w-9 place-items-center rounded-full bg-[#111] text-sm font-semibold! text-white sm:h-10 sm:w-10">
            {(admin?.name || "A").charAt(0).toUpperCase()}
          </span>
          <span className="hidden sm:grid">
            <strong className="max-w-40 overflow-hidden text-ellipsis whitespace-nowrap text-xs font-semibold! text-neutral-800">
              {admin?.name || "Administrador"}
            </strong>
            <span className="text-[10px] text-neutral-400">Administrador</span>
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-350 px-5 py-8 sm:px-7 md:px-10 md:py-10 xl:px-12">
        <div className="mb-7 flex items-end justify-between gap-5 sm:mb-8">
          <div>
            <p className="mb-2 flex items-center gap-2.5 text-[10px] font-semibold! tracking-[.2em] text-neutral-500 uppercase sm:text-xs">
              Panel de control
              <span className="h-px w-3.5 bg-[#b51f2a]" />
            </p>
            <h1 className="m-0 font-[Georgia] text-[clamp(30px,4vw,48px)] font-normal! leading-tight tracking-[-.035em] text-neutral-900">
              Bienvenido al panel{admin?.name ? `, ${admin.name.split(" ")[0]}` : ""}.
            </h1>
            <p className="mt-2 mb-0 text-xs leading-relaxed text-neutral-500 sm:text-sm">
              Una mirada clara al día a día de tu estudio fotográfico.
            </p>
          </div>
          <p className="mb-1 hidden text-xs text-neutral-500 capitalize md:block lg:text-sm">
            {fechaHoy}
          </p>
        </div>

        <section
          className="grid min-h-64 overflow-hidden bg-[#101010] text-white sm:min-h-72 md:grid-cols-[1.1fr_.9fr] md:gap-8 lg:min-h-80"
          aria-label="Studio13 fotografía"
        >
          <div className="flex max-w-155 flex-col justify-center px-7 py-9 sm:px-9 md:px-10 lg:px-12">
            <p className="mb-4 text-[10px] font-semibold! tracking-[.2em] text-neutral-300 uppercase sm:text-xs">
              Studio13 <span className="px-1 text-[#c51f2d]">—</span>
              Fotografía profesional
            </p>
            <h2 className="m-0 font-[Georgia] text-[clamp(30px,3.5vw,44px)] font-normal! leading-[1.08] tracking-tight">
              Historias que
              <br />
              <em className="text-neutral-300">merecen ser vistas.</em>
            </h2>
            <p className="mt-3 mb-4 max-w-155 text-xs leading-[1.6] text-neutral-400 sm:text-sm">
              Tu estudio, tus sesiones y cada momento importante, en un solo lugar.
            </p>
            <a
              href="/admin/Galeria"
              className="group inline-flex w-full cursor-pointer items-center justify-center gap-2.5 bg-[#b51f2a] px-8 py-4 text-[10px] font-semibold! tracking-[.2em] text-white no-underline uppercase transition-colors duration-200 hover:bg-[#921823] md:w-fit sm:text-xs"
            >
              Ver galería <span className="transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true">→</span>
            </a>
          </div>
          <div className="portada-collage relative min-h-64 overflow-visible p-4 sm:p-5 md:min-h-[320px]">
            <div className="relative h-full min-h-56 overflow-hidden rounded-[3px] border border-[#b51f2a] shadow-[0_10px_30px_rgba(0,0,0,.5)] md:min-h-[280px]">
              <img
                className="h-full w-full object-cover opacity-80"
                src={portada}
                alt="Fotografía de portada de Studio13"
                loading="lazy"
              />
            </div>
            <img className="portada-collage__foto portada-collage__foto--empresarial" src={portada2} alt="Retrato empresarial de Studio13" loading="lazy" />
            <img className="portada-collage__foto portada-collage__foto--familiar" src={portada3} alt="Fotografía de una familia" loading="lazy" />
            <img className="portada-collage__foto portada-collage__foto--exteriores" src={portada} alt="Atardecer sobre el río con una mujer en un bote" loading="lazy" />
          </div>
        </section>

        <section className="mt-8 sm:mt-10" aria-label="Resumen del estudio">
          <div className="mb-4">
            <p className="mb-1.5 text-[10px] font-semibold! tracking-[.2em] text-neutral-500 uppercase sm:text-xs">
              En cifras
            </p>
            <h2 className="m-0 font-[Georgia] text-xl font-normal! text-neutral-900 sm:text-2xl">
              Resumen del estudio
            </h2>
          </div>
          <div className="grid grid-cols-2 border border-neutral-200 bg-white sm:grid-cols-3 lg:grid-cols-5">
            {estadisticas.map((estadistica, index) => (
              <article
                className={`min-h-28 border-b border-r border-neutral-200 px-4 py-4 sm:min-h-32 sm:px-5 sm:py-5 ${index % 2 === 1 ? "border-r-0 sm:border-r" : ""} ${index === estadisticas.length - 1 ? "col-span-2 border-r-0 sm:col-span-1 sm:border-r-0" : ""}`}
                key={estadistica.key}
              >
                <div className="mb-3 flex items-center justify-between text-[10px] text-neutral-400 sm:mb-4">
                  <span className="h-px w-5 bg-[#b51f2a]" />
                  <span>0{index + 1}</span>
                </div>
                <strong className="block font-[Georgia] text-3xl font-normal! leading-none text-neutral-900 sm:text-4xl">
                  {cargando ? "—" : (datos[estadistica.key]?.length ?? "—")}
                </strong>
                <span className="mt-2 block text-xs font-semibold! text-neutral-800 sm:text-sm">
                  {estadistica.label}
                </span>
                <span className="mt-1.5 block text-[10px] leading-snug text-neutral-400 sm:text-xs">
                  {estadistica.key === "reservaciones" && pendientes !== undefined
                    ? `${pendientes} pendientes`
                    : estadistica.note}
                </span>
              </article>
            ))}
          </div>
        </section>

        <div className="mt-8 grid grid-cols-1 gap-9 md:mt-10 md:grid-cols-[1.2fr_.95fr] md:gap-10 xl:gap-14">
          <section className="min-w-0" aria-label="Próximas reservaciones">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="mb-1.5 text-[10px] font-semibold! tracking-[.2em] text-neutral-500 uppercase sm:text-xs">Agenda</p>
                <h2 className="m-0 font-[Georgia] text-xl font-normal! text-neutral-900 sm:text-2xl">Próximas reservaciones</h2>
              </div>
              <span className="text-xs text-neutral-400 sm:text-sm">{cargando ? "—" : String(proximasReservaciones.length).padStart(2, "0")}</span>
            </div>
            <ul className="m-0 border-t border-neutral-300 p-0">
              {!cargando && siguientesReservaciones.length > 0 ? (
                siguientesReservaciones.map((reserva) => {
                  const fecha = fechaHoraLocal(reserva);
                  const esHoy = fecha?.toDateString() === new Date().toDateString();
                  const estadoPendiente = reserva.estado === "PENDIENTE";
                  return (
                    <li className="border-b border-neutral-200" key={reserva.id}>
                      <a href={`/admin/Reservaciones?id=${encodeURIComponent(reserva.id)}`} className="grid min-h-20 grid-cols-[52px_minmax(0,1fr)_auto] items-center gap-3 py-3 text-inherit no-underline transition-colors hover:bg-neutral-50 sm:grid-cols-[64px_minmax(0,1fr)_auto] sm:gap-4">
                        <span className="grid justify-items-center leading-none">
                          <strong className="font-[Georgia] text-2xl font-normal! text-neutral-900">{fecha?.toLocaleDateString("es", { day: "2-digit" })}</strong>
                          <span className="mt-1 text-[9px] font-semibold! tracking-[.1em] text-neutral-500 uppercase">{fecha?.toLocaleDateString("es", { month: "short" }).replace(".", "")}</span>
                        </span>
                        <span className="grid min-w-0 gap-1">
                          <span className="flex flex-wrap items-center gap-2">
                            <strong className="overflow-hidden text-ellipsis whitespace-nowrap text-xs font-semibold! text-neutral-800 sm:text-sm">{reserva.cliente?.nombre || reserva.nombre || "Cliente"}</strong>
                            {esHoy && <span className="bg-[#b71c2b] px-1.5 py-0.5 text-[8px] font-semibold! tracking-wide text-white">HOY</span>}
                          </span>
                          <span className="overflow-hidden text-ellipsis whitespace-nowrap text-[10px] text-neutral-500 sm:text-xs">{reserva.tipoSesion || "Sesión fotográfica"}{reserva.hora ? ` · ${reserva.hora}` : ""}</span>
                        </span>
                        <span className={`border px-2 py-1 text-center text-[8px] font-semibold! tracking-wide uppercase sm:px-2.5 sm:text-[9px] ${estadoPendiente ? "border-amber-200 bg-amber-50 text-amber-800" : "border-green-200 bg-green-50 text-green-800"}`}>{estadoPendiente ? "Pendiente" : "Confirmada"}</span>
                      </a>
                    </li>
                  );
                })
              ) : (
                <li className="border-b border-neutral-200 py-6 text-xs text-neutral-500 sm:text-sm">
                  {cargando ? "Cargando reservaciones…" : reservaciones ? "No hay reservaciones próximas registradas." : "No fue posible obtener las reservaciones."}
                </li>
              )}
            </ul>
            {!cargando && proximasReservaciones.length > 5 && <a href="/admin/Reservaciones" className="mt-3 inline-flex items-center gap-2 text-xs font-semibold! text-[#b71c2b] no-underline hover:underline">Ver todas <span aria-hidden="true">→</span></a>}
          </section>

          <section id="studio-galeria" className="min-w-0" aria-label="Galería">
            <div className="mb-4">
              <p className="mb-1.5 text-[10px] font-semibold! tracking-[.2em] text-neutral-500 uppercase sm:text-xs">
                Selección del estudio
              </p>
              <h2 className="m-0 font-[Georgia] text-xl font-normal! text-neutral-900 sm:text-2xl">
                Galería
              </h2>
            </div>
            {imagenes.length > 0 ? (
              <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                {[0, 1, 2].map((indice) => {
                  const imagen = imagenes[indice];
                  const mostrarImagen = imagen && !imagenesRota[imagen.id];
                  return (
                    <a href="/admin/Galeria" key={imagen?.id || `placeholder-${indice}`} aria-label={imagen ? `Ver ${imagen.titulo} en Galería` : `Subir Foto ${indice + 1} a Galería`} className="group relative block aspect-square overflow-hidden bg-[#111] text-inherit no-underline">
                      {mostrarImagen ? (
                        <img className="h-full w-full object-cover object-top transition-transform duration-200 group-hover:scale-[1.03]" src={imagen.url} alt={imagen.titulo} loading="lazy" onError={() => setImagenesRota((actual) => ({ ...actual, [imagen.id]: true }))} />
                      ) : (
                        <span className="flex h-full w-full flex-col items-center justify-center gap-2 text-neutral-500">
                          <Icono name="image" size={20} />
                          <span className="text-[9px] text-neutral-400 sm:text-[10px]">Foto {indice + 1}</span>
                        </span>
                      )}
                      {mostrarImagen && <span className="pointer-events-none absolute inset-x-0 bottom-0 overflow-hidden bg-linear-to-t from-black/75 to-transparent px-2.5 pb-2.5 pt-8 text-[10px] text-ellipsis whitespace-nowrap text-white sm:text-xs">{imagen.titulo}</span>}
                    </a>
                  );
                })}
              </div>
            ) : cargando ? (
              <div className="grid grid-cols-3 gap-2.5 sm:gap-3">{[1, 2, 3].map((item) => <div className="flex aspect-square flex-col items-center justify-center gap-2 bg-[#111] text-neutral-500" key={item}><Icono name="image" size={20} /><span className="text-[9px] text-neutral-400 sm:text-[10px]">…</span></div>)}</div>
            ) : (
              <div className="grid gap-3 bg-white p-4 text-xs text-neutral-500 sm:text-sm">
                <p className="m-0">Aún no hay fotos en la galería.</p>
                <a href="/admin/Galeria" className="w-fit font-semibold! text-[#b71c2b] no-underline hover:underline">Subir fotos →</a>
              </div>
            )}
          </section>
        </div>

        {errores.length > 0 && (
          <div
            className="mt-7 border-l-2 border-[#b51f2a] bg-white px-4 py-4 text-xs leading-relaxed text-neutral-600 sm:px-5 sm:text-sm"
            role="alert"
          >
            <strong className="mb-1 block font-semibold! text-neutral-800">
              Algunos datos no están disponibles.
            </strong>
            {errores.join(" ")}
            <button
              className="ml-3 border-0 bg-transparent p-0 text-[#a51c1c] underline"
              type="button"
              onClick={actualizarDatos}
            >
              Reintentar
            </button>
          </div>
        )}

        <footer className="mt-9 flex flex-col gap-2 border-t border-neutral-200 pt-4 text-[10px] text-neutral-400 sm:flex-row sm:justify-between sm:text-xs">
          <span>© Studio13 · Puerto Cito, Costa Rica</span>
          <span>Preservando momentos, creando historias.</span>
        </footer>
      </main>
    </div>
  );
}

export default Inicio;
