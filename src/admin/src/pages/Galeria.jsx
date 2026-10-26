import { useEffect, useRef, useState } from "react";

const serviciosDemo = [
  "Corporativas",
  "Quince\u00f1ero",
  "Fotos Familiares",
  "Embarazo",
  "Parejas",
  "Snacks Queik",
  "Eventos",
  "Exteriores",
  "Talleres",
];

export default function Galeria() {
  const [servicioActivo, setServicioActivo] = useState(serviciosDemo[0]);
  const [imagenes, setImagenes] = useState([]);
  const [arrastrando, setArrastrando] = useState(false);
  const [avisoArchivo, setAvisoArchivo] = useState("");
  const [serviciosAbiertos, setServiciosAbiertos] = useState(false);
  const [tituloImagen, setTituloImagen] = useState("");
  const [imagenTituloId, setImagenTituloId] = useState(null);
  const [busquedaImagen, setBusquedaImagen] = useState("");
  const inputRef = useRef(null);
  const imagenesRef = useRef(imagenes);
  imagenesRef.current = imagenes;

  useEffect(() => () => imagenesRef.current.forEach((imagen) => URL.revokeObjectURL(imagen.preview)), []);

  const agregarArchivos = (archivos) => {
    const seleccion = Array.from(archivos || []);
    const permitidos = seleccion.filter((archivo) => ["image/jpeg", "image/png", "image/webp"].includes(archivo.type) && archivo.size <= 5 * 1024 * 1024);
    const nuevos = permitidos
      .map((archivo) => ({ id: `${archivo.name}-${archivo.lastModified}-${Math.random()}`, nombre: archivo.name, titulo: tituloImagen.trim(), archivo, servicio: servicioActivo, preview: URL.createObjectURL(archivo) }));
    setAvisoArchivo(permitidos.length < seleccion.length ? "Solo se aceptan JPG, PNG o WEBP de hasta 5 MB." : "");
    if (nuevos.length) {
      setImagenes((actuales) => [...nuevos, ...actuales]);
      setImagenTituloId(nuevos[0].id);
    }
  };

  const seleccionarServicio = (servicio) => {
    const imagen = imagenes.find((item) => item.servicio === servicio);
    setServicioActivo(servicio);
    setImagenTituloId(imagen?.id ?? null);
    setTituloImagen(imagen?.titulo || "");
    setServiciosAbiertos(false);
  };


  const imagenesServicio = imagenes.filter((imagen) => imagen.servicio === servicioActivo);
  const imagenesFiltradas = imagenesServicio.filter((imagen) => `${imagen.titulo} ${imagen.nombre}`.toLocaleLowerCase().includes(busquedaImagen.trim().toLocaleLowerCase()));

  return (
    <main className="mx-auto min-h-screen w-full max-w-350 px-5 py-8 sm:px-7 md:px-10 md:py-10 xl:px-12">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-[10px] font-semibold! tracking-[.2em] text-neutral-500 uppercase sm:text-xs">Contenido del sitio</p>
          <h1 className="m-0 font-[Georgia] text-3xl font-normal! text-neutral-900 sm:text-4xl">Galería</h1>
          <p className="mb-0 mt-2 max-w-xl text-sm leading-6 text-neutral-500">Organiza las imágenes por servicio y prepara la selección que se mostrará en la página pública.</p>
        </div>
        <span className="border border-amber-300 bg-amber-50 px-3 py-2 text-[10px] font-semibold! tracking-wide text-amber-800 uppercase">Vista previa · sin publicar</span>
      </div>

      <section className="mb-7 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)]">
        <div className="border border-neutral-200 bg-white p-5 sm:p-6">
          <div className="mb-5"><h2 className="m-0 font-[Georgia] text-xl font-normal! text-neutral-900">Agregar a {servicioActivo}</h2><p className="mb-0 mt-1 text-xs text-neutral-500">Selecciona imagenes desde tu dispositivo para ver como quedaran.</p></div>
          <button type="button" onClick={() => inputRef.current?.click()} onDragOver={(evento) => { evento.preventDefault(); setArrastrando(true); }} onDragLeave={() => setArrastrando(false)} onDrop={(evento) => { evento.preventDefault(); setArrastrando(false); agregarArchivos(evento.dataTransfer.files); }} className={`flex min-h-52 w-full flex-col items-center justify-center border border-dashed px-5 py-8 text-center transition-colors ${arrastrando ? "border-[#a51c1c] bg-red-50" : "border-neutral-300 bg-neutral-50 hover:border-[#a51c1c] hover:bg-red-50/40"}`}>
            <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#a51c1c] shadow-sm"><svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 16V4m0 0L7 9m5-5 5 5" /><path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" /></svg></span>
            <span className="text-sm font-semibold! text-neutral-800">Arrastra tus imagenes aqui</span>
            <span className="mt-1 text-xs text-neutral-500">o <span className="text-[#a51c1c] underline">selecciona archivos</span> de tu dispositivo</span>
            <span className="mt-4 text-[10px] tracking-wide text-neutral-400 uppercase">JPG, PNG o WEBP · hasta 5 MB por imagen</span>
          </button>
          <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={(evento) => { agregarArchivos(evento.target.files); evento.target.value = ""; }} />
          {avisoArchivo && <p className="mb-0 mt-3 text-xs text-[#a51c1c]" role="alert">{avisoArchivo}</p>}
          <p className="mb-0 mt-3 text-[11px] leading-5 text-neutral-400">Las imagenes se muestran como vista previa temporal. La carga al sitio se conectara despues.</p>
          <label className="mt-5 grid gap-2 text-xs font-semibold! text-neutral-700">
            Titulo de la imagen
            <input className="w-full border border-neutral-300 bg-white px-3 py-2.5 text-sm font-normal! text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-[#a51c1c]" type="text" maxLength={120} placeholder="Escribe el titulo que aparecera junto a la imagen" value={tituloImagen} onChange={(evento) => { const valor = evento.target.value; setTituloImagen(valor); setImagenes((actuales) => actuales.map((imagen) => imagen.id === imagenTituloId ? { ...imagen, titulo: valor } : imagen)); }} />
          </label>
          <div className="mt-6 border-t border-neutral-200 pt-5">
            <h3 className="mb-2 text-sm font-semibold! text-neutral-800">Servicio de la imagen</h3>
            <button type="button" aria-expanded={serviciosAbiertos} onClick={() => setServiciosAbiertos((abierto) => !abierto)} className="flex w-full items-center justify-between border border-neutral-300 bg-white px-4 py-3 text-left text-sm text-neutral-700 hover:border-[#a51c1c]">
              <span>{servicioActivo}</span><svg aria-hidden="true" className={`transition-transform duration-300 ${serviciosAbiertos ? "rotate-180" : ""}`} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
            </button>
            <div className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${serviciosAbiertos ? "mt-2 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
              <div className="overflow-hidden">
                <div className="border border-neutral-200 bg-neutral-50 p-1">
                  {serviciosDemo.map((servicio) => <button key={servicio} type="button" onClick={() => seleccionarServicio(servicio)} className={`flex w-full items-center justify-between px-3 py-2.5 text-left text-xs transition-colors ${servicioActivo === servicio ? "bg-white font-semibold! text-[#a51c1c]" : "text-neutral-600 hover:bg-white hover:text-neutral-900"}`}><span>{servicio}</span><span className="text-[10px] text-neutral-400">{imagenes.filter((imagen) => imagen.servicio === servicio).length}</span></button>)}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid content-start gap-3">
        <aside className="border border-neutral-200 bg-white p-5 sm:p-6">
          <div className="mb-4 flex items-start justify-between gap-3"><div><p className="mb-1 text-[10px] font-semibold! tracking-[.18em] text-neutral-500 uppercase">Vista previa</p><h2 className="m-0 font-[Georgia] text-xl font-normal! text-neutral-900">{servicioActivo}</h2></div><span className="shrink-0 border border-amber-300 bg-amber-50 px-2.5 py-1 text-[10px] font-semibold! text-amber-800 uppercase">Borrador</span></div>
          <label className="relative mb-4 block">
            <span className="sr-only">Buscar imagen publicada</span>
            <svg aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>
            <input type="search" value={busquedaImagen} onChange={(evento) => setBusquedaImagen(evento.target.value)} placeholder="Buscar imagen publicada" className="w-full border border-neutral-300 bg-white py-2 pl-9 pr-3 text-xs text-neutral-800 outline-none placeholder:text-neutral-400 focus:border-[#a51c1c]" />
          </label>          <p className="mb-4 text-xs text-neutral-500">{imagenesServicio.length} {imagenesServicio.length === 1 ? "imagen" : "imagenes"} · Asi aparecera en la galeria publica.</p>
          {imagenesFiltradas.length ? <div className="grid max-h-130 grid-cols-1 gap-4 overflow-y-auto sm:grid-cols-2 xl:grid-cols-1">{imagenesFiltradas.map((imagen) => <article key={imagen.id} className="overflow-hidden border border-neutral-200 bg-white">
            <img src={imagen.preview} alt={imagen.nombre} className="aspect-4/3 w-full bg-neutral-100 object-cover" />
            <div className="p-3"><p className="mb-3 truncate text-xs font-medium! text-neutral-700" title={imagen.titulo || imagen.nombre}>{imagen.titulo || imagen.nombre}</p><div className="block">
              <button type="button" className="w-full border border-neutral-300 bg-white px-3 py-2 text-xs font-semibold! text-neutral-700 hover:border-neutral-500">Editar</button>
            </div></div>
          </article>)}</div>
            : <div className="flex min-h-64 flex-col items-center justify-center border border-dashed border-neutral-200 bg-neutral-50 px-5 text-center"><span className="mb-3 text-3xl text-neutral-300">▧</span><p className="mb-1 text-sm font-medium! text-neutral-600">{busquedaImagen ? "No se encontraron imagenes" : "La vista previa aparecera aqui"}</p><p className="m-0 text-xs leading-5 text-neutral-400">{busquedaImagen ? "Prueba otro titulo o nombre de archivo." : `Agrega imagenes a ${servicioActivo} para verlas en esta columna.`}</p></div>}
          <p className="mb-0 mt-4 border-t border-neutral-200 pt-3 text-[10px] leading-4 text-neutral-400">Los controles son solo visuales. La publicacion se conectara mas adelante.</p>
        </aside>
        <button type="button" className="w-full border border-[#a51c1c] bg-[#a51c1c] px-4 py-3 text-sm font-semibold! text-white transition-colors hover:bg-black">Publicar</button>
        <p className="m-0 text-center text-[10px] text-neutral-400">La publicacion en internet se habilitara mas adelante.</p>
        </div>
      </section>
    </main>
  );
}
