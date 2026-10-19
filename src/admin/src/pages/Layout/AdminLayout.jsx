import { createContext, useContext, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import logoBlanco from "../../assets/Studio13_blanco.png";

const MenuContext = createContext(null);
const secciones = [
  { label: "Inicio", icon: "home", to: "/Inicio" },
  { label: "Clientes", icon: "users", to: "/admin/Clientes" },
  { label: "Reservaciones", icon: "calendar", to: "/admin/Reservaciones" },
  { label: "Paquetes", icon: "layers", to: "/admin/Paquetes" },
  { label: "Membresi­as", icon: "membership", to: "/admin/Membresias" },
  { label: "Servicios", icon: "camera", to: "/admin/Servicios" },
  { label: "Galeri­a", icon: "image", to: "/admin/Galeria" },
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

// Este hook también se importa desde Inicio para controlar el menú móvil.
// eslint-disable-next-line react-refresh/only-export-components
export function useMenuAdmin() {
  return useContext(MenuContext);
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
