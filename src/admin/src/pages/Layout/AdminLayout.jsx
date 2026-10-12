import { createContext, useContext, useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import logoBlanco from "../../assets/Studio13_blanco.png";

const MenuContext = createContext(null);
const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:3001").replace(/\/+$/, "");

const secciones = [
  { label: "Inicio", icon: "home", to: "/Inicio" },
  { label: "Clientes", icon: "users", to: "/admin/Clientes" },
  { label: "Reservaciones", icon: "calendar", to: "/admin/Reservaciones" },
  { label: "Paquetes", icon: "layers", to: "/admin/Paquetes" },
  { label: "MembresÃ­as", icon: "membership", to: "/admin/Membresias" },
  { label: "Servicios", icon: "camera", to: "/admin/Servicios" },
  { label: "GalerÃ­a", icon: "image", to: "/admin/Galeria" },
];

const trazosIcono = {
  home: <><path d="m3 10 9-7 9 7" /><path d="M5 9v11h14V9M9 20v-7h6v7" /></>,
  users: <><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="10" cy="7" r="4" /><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
  layers: <><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 12 9 5 9-5M3 16l9 5 9-5" /></>,
  membership: <><circle cx="12" cy="8" r="6" /><path d="m8.2 13-1 8 4.8-2.7 4.8 2.7-1-8" /></>,
  camera: <><path d="M14 4h-4l-2 3H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-4l-2-3Z" /><circle cx="12" cy="13" r="3.5" /></>,
  image: <><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" /></>,
  logout: <><path d="M10 17l5-5-5-5M15 12H3" /><path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" /></>,
  menu: <><path d="M4 6h16M4 12h16M4 18h16" /></>,
};

export function Icono({ name, size = 18 }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      {trazosIcono[name]}
    </svg>
  );
}

export function useMenuAdmin() {
  return useContext(MenuContext);
}

export function AdminLista({ titulo, endpoint, columnas }) {
  const navigate = useNavigate();
  const [filas, setFilas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [actualizacion, setActualizacion] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const token = sessionStorage.getItem("studio13AdminToken");

    fetch(`${API_BASE_URL}${endpoint}`, {
      signal: controller.signal,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(async (response) => {
        const body = await response.json();
        if (response.status === 401) {
          sessionStorage.removeItem("studio13AdminToken");
          sessionStorage.removeItem("studio13Admin");
          navigate("/iniciar-sesion", { replace: true });
          throw new Error("La sesión expiró. Inicia sesión nuevamente.");
        }
        if (!response.ok) throw new Error(body.error || "No se pudieron cargar los datos.");
        if (!Array.isArray(body)) throw new Error("El servidor devolvió un formato de datos no válido.");
        return body;
      })
      .then((body) => {
        if (!controller.signal.aborted) {
          setFilas(body);
          setError("");
          setCargando(false);
        }
      })
      .catch((reason) => {
        if (!controller.signal.aborted) {
          setError(reason instanceof TypeError ? "No se pudo contactar con el servidor." : reason.message);
          setCargando(false);
        }
      });

    return () => controller.abort();
  }, [endpoint, navigate, actualizacion]);

  const leerValor = (fila, ruta) => ruta.split(".").reduce((valor, llave) => valor?.[llave], fila);
  const recargar = () => {
    setCargando(true);
    setActualizacion((valor) => valor + 1);
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-350 px-5 py-8 sm:px-7 md:px-10 md:py-10 xl:px-12">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-[10px] font-semibold! tracking-[.2em] text-neutral-500 uppercase sm:text-xs">Administración</p>
          <h1 className="m-0 font-[Georgia] text-3xl font-normal! text-neutral-900 sm:text-4xl">{titulo}</h1>
          <p className="mb-0 mt-2 text-xs text-neutral-500 sm:text-sm">Consulta los registros de Studio13.</p>
        </div>
        <button className="border border-neutral-300 bg-white px-4 py-2.5 text-xs font-semibold! text-neutral-800 transition-colors hover:border-[#b51f2a] hover:text-[#a51c1c] sm:text-sm" type="button" onClick={recargar}>
          Actualizar
        </button>
      </div>

      <div className="overflow-hidden border border-neutral-200 bg-white">
        {error ? (
          <div className="flex flex-wrap items-center justify-between gap-4 p-5 text-sm text-[#a51c1c]" role="alert">
            <span>{error}</span>
            <button className="underline" type="button" onClick={recargar}>Reintentar</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-155 border-collapse text-left text-sm">
              <thead className="bg-[#111] text-white">
                <tr>{columnas.map((columna) => <th className="px-5 py-4 text-xs font-semibold! tracking-wide" key={columna.key}>{columna.label}</th>)}</tr>
              </thead>
              <tbody>
                {cargando ? (
                  <tr><td className="px-5 py-8 text-neutral-500" colSpan={columnas.length}>Cargando registros…</td></tr>
                ) : filas.length ? filas.map((fila, indice) => (
                  <tr className="border-t border-neutral-200 even:bg-[#faf9f8]" key={fila.id ?? indice}>
                    {columnas.map((columna) => {
                      const valor = columna.key.split(".").reduce((dato, llave) => dato?.[llave], fila);
                      const texto = valor == null || valor === "" ? "—" : typeof valor === "boolean" ? (valor ? "Activo" : "Inactivo") : columna.date && valor ? new Intl.DateTimeFormat("es", { dateStyle: "medium" }).format(new Date(valor)) : String(valor);
                      return <td className="max-w-80 px-5 py-4 text-neutral-700" key={columna.key}><span className="block overflow-hidden text-ellipsis">{texto}</span></td>;
                    })}
                  </tr>
                )) : (
                  <tr><td className="px-5 py-8 text-neutral-500" colSpan={columnas.length}>Todavía no hay registros para mostrar.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {!cargando && !error && <p className="mt-3 text-xs text-neutral-500">{filas.length} {filas.length === 1 ? "registro" : "registros"}</p>}
    </main>
  );
}

function AdminLayout({ children }) {
  const navigate = useNavigate();
  const menuExistente = useContext(MenuContext);
  const [menuAbierto, setMenuAbierto] = useState(false);

  if (menuExistente) {
    return children ?? <Outlet />;
  }

  const cerrarSesion = () => {
    sessionStorage.removeItem("studio13AdminToken");
    sessionStorage.removeItem("studio13Admin");
    navigate("/iniciar-sesion", { replace: true });
  };

  const cerrarMenu = () => setMenuAbierto(false);

  return (
    <MenuContext.Provider value={{ menuAbierto, setMenuAbierto }}>
      <div className="flex min-h-screen bg-[#f3f3f2] text-[#171717]">
        {menuAbierto && (
          <button
            className="fixed inset-0 z-20 bg-black/50 md:hidden"
            type="button"
            aria-label="Cerrar menÃº"
            onClick={cerrarMenu}
          />
        )}

        <aside className={`fixed inset-y-0 left-0 z-30 flex h-dvh w-64 shrink-0 flex-col bg-[#090909] px-5 pb-6 pt-8 text-white transition-transform duration-300 md:sticky md:top-0 md:h-screen md:w-64 md:translate-x-0 ${menuAbierto ? "translate-x-0" : "-translate-x-full"}`}>
          <NavLink
            className="mb-10 ml-2 flex w-fit flex-col no-underline"
            to="/Inicio"
            aria-label="Studio13, inicio"
            onClick={cerrarMenu}
          >
            <span className="font-[Georgia] text-2xl font-semibold! tracking-[.12em] text-white">
             <img src={logoBlanco} alt="Studio13" className="h-10 w-auto object-contain" />
            </span>
            <span className="mt-1.5 text-[9px] font-semibold! tracking-[.3em] text-neutral-500">
              ADMINISTRACION
            </span>
          </NavLink>

          <p className="mb-3 ml-2.5 text-[10px] font-semibold! tracking-[.2em] text-neutral-500 uppercase">
            Espacio de trabajo
          </p>

          <nav className="grid gap-1.5" aria-label="NavegaciÃ³n administrativa">
            {secciones.map((seccion) => seccion.to ? (
              <NavLink
                key={seccion.label}
                to={seccion.to}
                end
                onClick={cerrarMenu}
                className={({ isActive }) => `relative flex min-h-11 items-center gap-3 border-l-2 px-3 text-xs font-medium! no-underline transition-colors ${isActive ? "border-[#b51f2a] bg-[#1d1d1d] text-white" : "border-transparent text-neutral-400 hover:bg-white/5 hover:text-white"}`}
              >
                <Icono name={seccion.icon} size={18} />
                <span>{seccion.label}</span>
              </NavLink>
            ) : (
              <button
                key={seccion.label}
                className="flex min-h-11 w-full items-center gap-3 border-0 bg-transparent px-3 text-left text-xs font-medium! text-neutral-400 opacity-80"
                type="button"
                disabled
                title={`La pantalla de ${seccion.label.toLowerCase()} aÃºn no estÃ¡ disponible`}
              >
                <Icono name={seccion.icon} size={18} />
                <span>{seccion.label}</span>
              </button>
            ))}
          </nav>

          <button
            className="mt-auto flex min-h-12 items-center gap-3 border-0 border-t border-white/10 bg-transparent px-3 pt-4 text-left text-[11px] font-medium! text-neutral-400 transition-colors hover:text-white"
            type="button"
            onClick={cerrarSesion}
          >
            <Icono name="logout" size={18} />
            <span>CERRAR SESION</span>
          </button>
        </aside>

        <div className="min-w-0 flex-1">
          {children ?? <Outlet />}
        </div>
      </div>
    </MenuContext.Provider>
  );
}

export default AdminLayout;
