import { useEffect, useState } from 'react';
import { Icono, useMenuAdmin } from './Components/AdminLayout.jsx';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/+$/, '');

const recursos = [
	{ key: 'reservaciones', label: 'Reservaciones', endpoint: '/api/reservaciones' },
	{ key: 'clientes', label: 'Clientes', endpoint: '/api/clientes' },
	{ key: 'servicios', label: 'Servicios', endpoint: '/api/servicios' },
	{ key: 'paquetes', label: 'Paquetes', endpoint: '/api/paquetes' },
	{ key: 'membresias', label: 'Membresías', endpoint: '/api/planes-membresia' },
	{ key: 'galerias', label: 'Galería', endpoint: '/api/galerias' },
];




function leerAdmin() {
	try {
		const admin = JSON.parse(sessionStorage.getItem('studio13Admin') || 'null');
		return admin && typeof admin.name === 'string' ? admin : null;
	} catch {
		return null;
	}
}

function fechaLegible(valor, opciones = {}) {
	const fecha = new Date(valor);
	if (Number.isNaN(fecha.getTime())) return null;
	return new Intl.DateTimeFormat('es-CR', opciones).format(fecha);
}

function fechaHoraLegible(reservacion) {
	const fecha = fechaLegible(reservacion.fecha, { day: '2-digit', month: 'short' });
	if (!fecha) return 'Fecha por confirmar';
	return reservacion.hora ? `${fecha} · ${reservacion.hora}` : fecha;
}

function obtenerImagenes(galerias) {
	return (galerias || []).flatMap((galeria) =>
		(galeria.imagenes || [])
			.filter((imagen) => imagen.activo !== false && typeof imagen.url === 'string' && imagen.url)
			.map((imagen) => ({
				id: imagen.id,
				url: imagen.url,
				titulo: imagen.titulo || galeria.nombre,
				galeria: galeria.nombre,
			})),
	);
}

function Inicio() {
	const admin = leerAdmin();
	const { menuAbierto, setMenuAbierto } = useMenuAdmin();
	const [cargando, setCargando] = useState(true);
	const [datos, setDatos] = useState({});
	const [errores, setErrores] = useState([]);
	const [actualizacion, setActualizacion] = useState(0);

	useEffect(() => {
		const controller = new AbortController();

		Promise.allSettled(
			recursos.map(async ({ key, endpoint }) => {
				const response = await fetch(`${API_BASE_URL}${endpoint}`, { signal: controller.signal });
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
				if (resultado.status === 'fulfilled') {
					const [key, values] = resultado.value;
					datosCargados[key] = values;
				} else {
					erroresCarga.push(`${recursos[index].label}: ${resultado.reason.message}`);
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

	const imagenes = obtenerImagenes(datos.galerias);
	const reservaciones = datos.reservaciones;
	const siguientesReservaciones = reservaciones
		? reservaciones
			.filter((reserva) => {
				const fecha = new Date(reserva.fecha);
				return !Number.isNaN(fecha.getTime()) &&
					fecha >= new Date() &&
					!['RECHAZADA', 'CANCELADA'].includes(reserva.estado);
			})
			.sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
			.slice(0, 4)
		: [];
	const reservacionesPendientes = reservaciones?.filter((reserva) => reserva.estado === 'PENDIENTE').length;
	const estadisticas = [
		{ key: 'reservaciones', label: 'Reservaciones', note: reservacionesPendientes === undefined ? 'Registros totales' : `${reservacionesPendientes} pendientes`, icon: 'calendar' },
		{ key: 'clientes', label: 'Clientes', note: 'En la base de clientes', icon: 'users' },
		{ key: 'servicios', label: 'Servicios', note: 'Registros en catálogo', icon: 'camera' },
		{ key: 'paquetes', label: 'Paquetes', note: 'Registros en catálogo', icon: 'layers' },
		{ key: 'membresias', label: 'Membresías', note: 'Planes registrados', icon: 'membership' },
	];
	const fechaHoy = fechaLegible(new Date(), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

	const eyebrowClasses = 'mb-2 flex items-center gap-2 text-[9px] !font-semibold tracking-[.19em] text-neutral-500 uppercase';
	const headingClasses = 'm-0 font-[var(--font-display)] !font-semibold tracking-[-.025em] text-neutral-900';

	return (
		<div className="min-w-0 flex-1">
				<header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-neutral-200 bg-white/95 px-5 backdrop-blur md:h-19 md:px-[5.2%]">
					<button
						className="inline-flex border-0 bg-transparent p-1.25 text-neutral-900 md:hidden"
						type="button"
						aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
						aria-expanded={menuAbierto}
						onClick={() => setMenuAbierto(!menuAbierto)}
					>
						<Icono name="menu" />
					</button>
					<div className="ml-3.5 mr-auto text-[10px] text-neutral-700 md:ml-0 md:text-[11px]">
						<span className="hidden text-neutral-500 min-[431px]:inline">Studio13</span>
						<i className="hidden px-2.75 not-italic text-neutral-400 min-[431px]:inline">/</i> Inicio
					</div>
					<div className="flex items-center gap-2 md:gap-3.25">
						<span className="flex items-center gap-1.75 text-[0px] text-neutral-600 md:text-[10px]"><i className="h-1.5 w-1.5 rounded-full bg-[#a51c1c]" /> Sesión activa</span>
						<span className="hidden h-7 w-px bg-neutral-200 md:block" />
						<div className="grid h-7.75 w-7.75 place-items-center rounded-full border border-neutral-300 bg-neutral-100 font-[Georgia] text-sm md:h-8.5 md:w-8.5" aria-hidden="true">{(admin?.name || 'A').charAt(0).toUpperCase()}</div>
						<div className="grid max-w-25 gap-0.75 md:min-w-25">
							<strong className="overflow-hidden text-ellipsis whitespace-nowrap text-[9px] font-semibold! text-neutral-800 md:text-[10px]">{admin?.name || 'Administrador'}</strong>
							<span className="hidden text-[9px] text-neutral-400 md:block">Administrador</span>
						</div>
					</div>
				</header>

				<main className="mx-auto w-full max-w-360 px-3.75 pt-8.25 pb-5.5 sm:px-5 md:px-[5.2%] md:pt-11.75 md:pb-6.25">
					<div className="mb-5.5 flex items-start justify-between gap-5.5 md:mb-7 md:items-end">
						<div>
							<p className={eyebrowClasses}>Panel de control <span className="inline-block h-px w-4.25 bg-[#a51c1c]" /></p>
							<h1 className="m-0 font-(--font-display) text-[clamp(28px,7vw,38px)] tracking-[-.045em] leading-[1.14] text-neutral-900 md:text-[clamp(29px,3.3vw,43px)]">
								Bienvenido al Panel Administrativo{admin?.name ? `, ${admin.name.split(' ')[0]}` : ''}.
							</h1>
							<p className="mt-2.5 mb-0 text-xs leading-relaxed text-neutral-500">Una mirada clara al día a día de tu estudio fotográfico.</p>
						</div>
						<p className="mb-1.25 hidden text-[10px] text-neutral-500 capitalize md:block">{fechaHoy}</p>
					</div>

					<section className="relative grid min-h-55 grid-cols-1 overflow-hidden bg-[#171717] text-white md:min-h-61.5 md:grid-cols-[1fr_42%]" aria-label="Studio13 fotografía">
						<div className="z-1 self-center px-5.25 py-6.25 md:px-10 md:py-7.25">
							<p className="mb-3.75 text-[9px] font-semibold! tracking-[.17em] text-neutral-300 uppercase">Studio13 <span className="px-1.25 text-red-400">—</span> Fotografía profesional</p>
							<h2 className="m-0 font-(--font-display) text-[clamp(25px,5.5vw,35px)] tracking-[-.035em] leading-[1.06] md:text-[clamp(28px,3vw,39px)]">
								Historias que<br /><em className="font-medium! text-neutral-300">merecen ser vistas.</em>
							</h2>
							<p className="mt-3.25 mb-4.25 max-w-82.5 text-[10px] leading-[1.7] text-neutral-400">Tu estudio, tus sesiones y cada momento importante, en un solo lugar.</p>
							<a href="#studio-galeria" className="inline-flex items-center gap-2.25 text-[9px] font-semibold! tracking-[.12em] text-white no-underline uppercase">
								Ver galería <span className="text-red-400"><Icono name="arrow" size={16} /></span>
							</a>
						</div>
						{imagenes[0] ? (
							<div className="absolute inset-y-0 right-0 left-[40%] overflow-hidden opacity-50 md:relative md:left-auto md:opacity-100">
								<img className="h-full min-h-55 w-full object-cover saturate-75 md:min-h-61.5" src={imagenes[0].url} alt={imagenes[0].titulo} />
								<div className="absolute inset-0 bg-linear-to-r from-[#171717] via-[#171717]/20 to-transparent" />
								<span className="absolute right-4.75 bottom-4.25 z-1 hidden text-[8px] font-semibold! tracking-[.15em] text-white uppercase md:block">{imagenes[0].galeria}</span>
							</div>
						) : (
							<div className="absolute inset-y-0 right-0 left-[40%] hidden items-center justify-center bg-linear-to-br from-neutral-800 to-neutral-700 text-neutral-500 md:flex">
								<Icono name="camera" size={34} />
							</div>
						)}
						<div className="absolute top-3.75 right-4 z-2 hidden text-[8px] font-semibold! tracking-widest text-neutral-300 md:block">ST13 <span className="px-1 text-red-400">/</span> 01</div>
					</section>

					<section className="mt-7.25 md:mt-9.25" aria-label="Resumen del estudio">
						<div className="mb-3.75 flex items-center justify-between gap-3.75">
							<div>
								<p className={`${eyebrowClasses} mb-1.5`}>En cifras</p>
								<h2 className={`${headingClasses} text-xl`}>Resumen del estudio</h2>
							</div>
							<button
								className="inline-flex items-center gap-1.75 border-0 bg-transparent py-1.75 pl-2 text-[9px] text-neutral-600 disabled:cursor-wait disabled:opacity-50"
								type="button"
								onClick={actualizarDatos}
								disabled={cargando}
							>
								<span className="text-[#a51c1c]"><Icono name="refresh" size={15} /></span>
								<span>{cargando ? 'Actualizando' : 'Actualizar'}</span>
							</button>
						</div>
						<div className="grid grid-cols-2 border border-neutral-200 bg-white md:grid-cols-5">
							{estadisticas.map((estadistica, index) => (
								<article className={`min-h-33.25 min-w-0 border-b border-r border-neutral-200 px-3.75 py-3.25 md:min-h-0 md:border-b-0 md:px-4.25 md:py-4 ${index % 2 === 1 ? 'border-r-0 md:border-r' : ''} ${index === estadisticas.length - 1 ? 'col-span-2 border-r-0 border-b-0 md:col-span-1 md:border-b-0' : ''}`} key={estadistica.key}>
									<div className="mb-3.75 flex items-center justify-between">
										<span className="grid h-7.75 w-7.75 place-items-center bg-[#f6f4f4] text-[#a51c1c]"><Icono name={estadistica.icon} size={19} /></span>
										<span className="text-[8px] tracking-widest text-neutral-400">0{index + 1}</span>
									</div>
									<strong className="block min-h-7.75 font-(--font-display) text-[27px] leading-[1.05] text-neutral-900">
										{cargando ? <span className="inline-block h-5.75 w-6.25 animate-pulse bg-neutral-200" /> : (datos[estadistica.key]?.length ?? '—')}
									</strong>
									<span className="mt-1 block text-[10px] font-semibold! text-neutral-800">{estadistica.label}</span>
									<span className="mt-1.5 block overflow-hidden text-ellipsis whitespace-nowrap text-[8px] text-neutral-400">{estadistica.note}</span>
								</article>
							))}
						</div>
					</section>

					<div className="mt-7 grid min-w-0 grid-cols-1 gap-6.25 md:mt-8.5 lg:grid-cols-[minmax(0,1.1fr)_minmax(270px,.9fr)]">
						<section className="min-w-0">
							<div className="mb-2.5 flex min-h-10.5 items-center justify-between gap-3.75">
								<div>
									<p className={`${eyebrowClasses} mb-1.5`}>Agenda</p>
									<h2 className={`${headingClasses} text-lg md:text-xl`}>Próximas reservaciones</h2>
								</div>
								<span className="font-(--font-display) text-[19px] text-neutral-400">{cargando ? '—' : String(siguientesReservaciones.length).padStart(2, '0')}</span>
							</div>
							{!cargando && reservaciones && siguientesReservaciones.length > 0 ? (
								<ul className="m-0 border-t border-neutral-200 p-0">
									{siguientesReservaciones.map((reservacion) => (
										<li className="grid min-h-13.75 grid-cols-[72px_minmax(0,1fr)_auto] items-center gap-2 border-b border-neutral-200 sm:grid-cols-[90px_minmax(0,1fr)_auto] sm:gap-3" key={reservacion.id}>
											<div className="text-[9px] text-neutral-500 capitalize">{fechaHoraLegible(reservacion)}</div>
											<div className="grid min-w-0 gap-1">
												<strong className="overflow-hidden text-ellipsis whitespace-nowrap text-[10px] font-semibold! text-neutral-800">{reservacion.nombre}</strong>
												<span className="overflow-hidden text-ellipsis whitespace-nowrap text-[9px] text-neutral-400">{reservacion.tipoSesion}</span>
											</div>
											<span className={`max-w-18.5 border px-1 py-1.25 text-center text-[6px] tracking-[.04em] capitalize sm:max-w-23.75 sm:px-1.75 sm:text-[7px] ${reservacion.estado === 'CONFIRMADA' ? 'border-neutral-300 text-neutral-700' : ['CANCELADA', 'RECHAZADA'].includes(reservacion.estado) ? 'border-neutral-200 text-neutral-400' : 'border-[#e5d7d7] text-[#a51c1c]'}`}>
												{reservacion.estado || 'Sin estado'}
											</span>
										</li>
									))}
								</ul>
							) : (
								<p className="m-0 border-t border-neutral-200 py-4.75 text-[10px] leading-relaxed text-neutral-500">
									{cargando ? 'Cargando reservaciones…' : reservaciones ? 'No hay reservaciones próximas registradas.' : 'No fue posible obtener las reservaciones.'}
								</p>
							)}
						</section>

						<section className="min-w-0" id="studio-galeria">
							<div className="mb-2.5 flex min-h-10.5 items-center justify-between gap-3.75">
								<div>
									<p className={`${eyebrowClasses} mb-1.5`}>Selección del estudio</p>
									<h2 className={`${headingClasses} text-lg md:text-xl`}>Galería</h2>
								</div>
								<span className="text-[#a51c1c]"><Icono name="image" size={19} /></span>
							</div>
							{imagenes.length > 0 ? (
								<div className="grid grid-cols-3 gap-1.5 sm:gap-2.25">
									{imagenes.slice(0, 3).map((imagen) => (
										<figure className="group relative m-0 h-25 overflow-hidden bg-neutral-200 sm:h-32" key={imagen.id}>
											<img className="h-full w-full object-cover saturate-75 transition duration-300 group-hover:scale-105 group-hover:saturate-100" src={imagen.url} alt={imagen.titulo} loading="lazy" />
											<figcaption className="absolute right-0 bottom-0 left-0 overflow-hidden bg-linear-to-t from-black/70 to-transparent px-2 pt-4.75 pb-2 text-[8px] text-ellipsis whitespace-nowrap text-white">{imagen.titulo}</figcaption>
										</figure>
									))}
								</div>
							) : (
								<p className="m-0 border-t border-neutral-200 py-4.75 text-[10px] leading-relaxed text-neutral-500">
									{cargando ? 'Cargando imágenes…' : datos.galerias ? 'Aún no hay imágenes en las galerías.' : 'No fue posible obtener la galería.'}
								</p>
							)}
						</section>
					</div>

					{errores.length > 0 && (
						<div className="mt-6.75 flex flex-col items-start justify-between gap-4 border-l-2 border-[#a51c1c] bg-white px-3.75 py-3.25 sm:flex-row sm:items-center" role="alert">
							<div className="grid gap-1">
								<strong className="text-[10px] font-semibold! text-neutral-800">Algunos datos no están disponibles.</strong>
								<span className="text-[9px] leading-relaxed text-neutral-600">{errores.join(' ')}</span>
							</div>
							<button className="shrink-0 border border-neutral-300 bg-white px-2.5 py-1.75 text-[9px] text-neutral-800" type="button" onClick={actualizarDatos}>Reintentar</button>
						</div>
					)}

					<footer className="mt-9 flex flex-col gap-1.5 border-t border-neutral-200 pt-3.5 text-[8px] tracking-[.02em] text-neutral-400 sm:flex-row sm:justify-between sm:gap-3.75">
						<span>© Studio13 · Puerto Cito, Costa Rica</span>
						<span>Preservando momentos, creando historias.</span>
					</footer>
				</main>
		</div>
	);
}

export default Inicio;