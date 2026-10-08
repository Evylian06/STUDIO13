import { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logoBlanco from '../../assets/Studio13_blanco.png';

const MenuContext = createContext(null);

const secciones = [
	{ label: 'Inicio', icon: 'home', active: true },
	{ label: 'Clientes', icon: 'users' },
	{ label: 'Reservaciones', icon: 'calendar' },
	{ label: 'Paquetes', icon: 'layers' },
	{ label: 'MembresÃ­as', icon: 'membership' },
	{ label: 'Servicios', icon: 'camera' },
	{ label: 'GalerÃ­a', icon: 'image' },
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
	arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
	refresh: <><path d="M20 7v5h-5M4 17v-5h5" /><path d="M5.6 9a7 7 0 0 1 11.6-2L20 12M4 12l2.8 5a7 7 0 0 0 11.6-2" /></>,
};

export function Icono({ name, size = 20 }) {
	return (
		<svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
			{trazosIcono[name]}
		</svg>
	);
}

export function useMenuAdmin() {
	return useContext(MenuContext);
}

function AdminLayout({ children }) {
	const navigate = useNavigate();
	const [menuAbierto, setMenuAbierto] = useState(false);
	const cerrarSesion = () => {
		sessionStorage.removeItem('studio13AdminToken');
		sessionStorage.removeItem('studio13Admin');
		navigate('/iniciar-sesion', { replace: true });
	};

	return (
		<MenuContext.Provider value={{ menuAbierto, setMenuAbierto }}>
			<div className="flex min-h-screen bg-[#f7f7f6] text-[#171717] font-sans !font-normal">
				{menuAbierto && <button className="fixed inset-0 z-20 bg-black/45 md:hidden" type="button" aria-label="Cerrar menÃº" onClick={() => setMenuAbierto(false)} />}
				<aside className={`fixed inset-y-0 left-0 z-30 flex h-dvh w-66.25 shrink-0 flex-col bg-[#171717] px-4.75 pt-8.5 pb-5.5 text-white transition-transform duration-300 md:sticky md:top-0 md:z-auto md:h-screen md:w-61.5 md:translate-x-0 ${menuAbierto ? 'translate-x-0' : '-translate-x-full'}`}>
					<a className="mb-15.25 ml-2.25 flex w-fit flex-col items-start text-white no-underline" href="/admin/dashboard" aria-label="Studio13, inicio">
						<img className="block max-h-13 w-33 object-contain object-left" src={logoBlanco} alt="Studio13" />
						<span className="mt-2 text-[8px] font-semibold! tracking-[.22em] text-neutral-400">ADMINISTRACIÃ“N</span>
					</a>
					<div className="mb-3.5 ml-2.75 text-[9px] font-semibold! tracking-[.17em] text-neutral-500 uppercase">Espacio de trabajo</div>
					<nav className="grid gap-1.25" aria-label="NavegaciÃ³n administrativa">
						{secciones.map((seccion) => seccion.active ? (
							<a key={seccion.label} className="relative flex min-h-11.5 items-center gap-3.25 rounded-sm border-0 border-l-2 border-[#a51c1c] bg-[#282828] px-3 text-xs font-medium! text-white no-underline transition-colors" href="/admin/dashboard" aria-current="page" onClick={() => setMenuAbierto(false)}>
								<Icono name={seccion.icon} size={18} /><span>{seccion.label}</span>
							</a>
						) : (
							<button key={seccion.label} className="flex min-h-11.5 w-full items-center gap-3.25 rounded-sm border-0 bg-transparent px-3 text-left text-xs font-medium! text-neutral-500 opacity-75" type="button" disabled title={`La pantalla de ${seccion.label.toLowerCase()} aÃºn no estÃ¡ disponible`}>
								<Icono name={seccion.icon} size={18} /><span>{seccion.label}</span>
							</button>
						))}
					</nav>
					<div className="mt-auto">
						<p className="mx-2 mb-4.75 border-l border-neutral-600 py-3.25 pr-2 pl-2.5 text-[10px] leading-relaxed text-neutral-400">Las pantallas de gestiÃ³n adicionales aÃºn no estÃ¡n implementadas.</p>
						<button className="flex w-full items-center gap-3.25 border-0 border-t border-neutral-800 bg-transparent px-3 py-3.25 text-left text-[11px] text-neutral-300" type="button" onClick={cerrarSesion}><Icono name="logout" size={18} /><span>Cerrar sesiÃ³n</span></button>
						<div className="mt-6 mx-2.5 text-[8px] font-semibold! tracking-[.13em] text-neutral-500">STUDIO13 <span className="px-1 text-red-400">Â·</span> PUERTO CITO</div>
					</div>
				</aside>
				{children}
			</div>
		</MenuContext.Provider>
	);
}

export default AdminLayout;
