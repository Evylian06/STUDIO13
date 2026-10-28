import { useEffect, useMemo, useState } from "react";
import Layout from "../pages/Layout/Layout";

const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:3001").replace(/\/+$/, "");
const seccionesOriginales = [
  "Corporativas",
  "Quinceañero",
  "Fotos Familiares",
  "Embarazo",
  "Parejas",
  "Snacks Queik",
  "Eventos",
  "Exteriores",
  "Talleres",
];
const normalizarNombre = (value) => value.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase();

const urlPublica = (value) => {
  if (typeof value !== "string" || !value.trim()) return "";
  const url = value.trim();
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith("/uploads/")) return `${API_BASE_URL}${url}`;
  return "";
};

const validarImagenes = (data) => Array.isArray(data) ? data
  .filter((image) => image && Number.isInteger(image.id) && image.activo !== false && typeof image.seccion === "string" && image.seccion.trim() && urlPublica(image.url))
  .map((image) => ({
    id: image.id,
    url: urlPublica(image.url),
    titulo: typeof image.nombre === "string" ? image.nombre : "",
    categoria: image.seccion.trim(),
  })) : [];

export default function Portafolio() {
  const [imagenes, setImagenes] = useState([]);
  const [active, setActive] = useState("Todos");
  const [lightbox, setLightbox] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setCargando(true);
    setError("");
    fetch(`${API_BASE_URL}/api/imagenes`, { signal: controller.signal })
      .then(async (response) => {
        const body = await response.json().catch(() => null);
        if (!response.ok) throw new Error(body?.error || "No se pudo cargar el portafolio.");
        if (!Array.isArray(body)) throw new Error("El servidor devolvió un formato de imágenes no válido.");
        return validarImagenes(body);
      })
      .then((data) => {
        if (!controller.signal.aborted) setImagenes(data);
      })
      .catch((reason) => {
        if (!controller.signal.aborted) {
          setError(reason instanceof TypeError ? "No se pudo conectar con el portafolio. Inténtalo nuevamente." : reason.message);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setCargando(false);
      });
    return () => controller.abort();
  }, [reload]);

  useEffect(() => {
    const actualizarAlVolver = () => {
      if (document.visibilityState === "visible") setReload((value) => value + 1);
    };
    window.addEventListener("focus", actualizarAlVolver);
    document.addEventListener("visibilitychange", actualizarAlVolver);
    return () => {
      window.removeEventListener("focus", actualizarAlVolver);
      document.removeEventListener("visibilitychange", actualizarAlVolver);
    };
  }, []);

  const secciones = useMemo(() => {
    const nombres = new Map(seccionesOriginales.map((name) => [normalizarNombre(name), name]));
    imagenes.forEach((image) => {
      if (!nombres.has(normalizarNombre(image.categoria))) nombres.set(normalizarNombre(image.categoria), image.categoria);
    });
    return [...nombres.values()];
  }, [imagenes]);
  const fotos = useMemo(() => (active === "Todos" ? imagenes : imagenes.filter((image) => normalizarNombre(image.categoria) === normalizarNombre(active))), [active, imagenes]);

  useEffect(() => {
    if (active !== "Todos" && !secciones.some((name) => normalizarNombre(name) === normalizarNombre(active))) setActive("Todos");
  }, [active, secciones]);

  useEffect(() => {
    if (!lightbox) return undefined;
    const closeOnEscape = (event) => { if (event.key === "Escape") setLightbox(null); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [lightbox]);

  return (
    <Layout>
      <div className="bg-white">
        <header className="border-b border-[rgba(26,24,24,0.08)] px-8 pb-10 pt-20 md:px-12">
          <p className="t-label mb-6">Portafolio</p>
          <h1 className="font-[Fraunces,Georgia,serif] text-[clamp(3rem,6vw,5.5rem)] font-extralight italic leading-none tracking-[0.02em] text-[#1a1818]">Galería</h1>
        </header>

        <div className="sticky top-14.5 z-50 flex gap-0 overflow-x-auto border-b border-[rgba(26,24,24,0.08)] bg-white px-8 md:px-12" role="group" aria-label="Filtrar portafolio por galería">
          <button type="button" onClick={() => setActive("Todos")} aria-pressed={active === "Todos"} className={`shrink-0 cursor-pointer whitespace-nowrap border-0 border-b bg-transparent px-5 py-[1.1rem] font-['Inter'] text-[0.65rem] font-normal tracking-[0.22em] uppercase transition-colors duration-200 ${active === "Todos" ? "border-[#a51c1c] text-[#1a1818]" : "border-transparent text-[#aaa8a4]"}`}>Todos</button>
          {secciones.map((section) => <button key={normalizarNombre(section)} type="button" onClick={() => setActive(section)} aria-pressed={normalizarNombre(active) === normalizarNombre(section)} className={`shrink-0 cursor-pointer whitespace-nowrap border-0 border-b bg-transparent px-5 py-[1.1rem] font-['Inter'] text-[0.65rem] font-normal tracking-[0.22em] uppercase transition-colors duration-200 ${normalizarNombre(active) === normalizarNombre(section) ? "border-[#a51c1c] text-[#1a1818]" : "border-transparent text-[#aaa8a4]"}`}>{section}</button>)}
        </div>

        <section className="px-8 pb-16 pt-10 md:px-12" aria-live="polite">
          {cargando ? <p className="t-body py-20 text-center text-[#77736f]">Cargando portafolio…</p>
            : error ? <div className="py-20 text-center"><p className="t-body mb-5">{error}</p><button type="button" onClick={() => setReload((value) => value + 1)} className="border border-[#a51c1c] px-5 py-3 font-['Inter'] text-xs tracking-widest text-[#a51c1c] hover:bg-[#a51c1c] hover:text-white">Reintentar</button></div>
              : fotos.length ? <div className="columns-[280px] gap-6">{fotos.map((photo) => <button key={photo.id} type="button" onClick={() => setLightbox(photo)} aria-label={`Ampliar ${photo.titulo || photo.categoria}`} className="group relative mb-6 block w-full break-inside-avoid cursor-zoom-in overflow-hidden border-0 bg-[#dedad4] p-0 text-left">
                <img src={photo.url} alt={photo.titulo || photo.categoria} loading="lazy" className="block w-full object-cover opacity-[0.92] transition-all duration-700 ease-out group-hover:scale-[1.03] group-hover:opacity-100" />
                <span className="absolute inset-x-0 bottom-0 bg-[linear-gradient(to_top,rgba(12,11,11,0.72)_0%,rgba(12,11,11,0.28)_70%,transparent_100%)] px-4 pb-4 pt-12 text-[0.6rem] tracking-[0.2em] text-white opacity-100 transition-opacity duration-300">
                  <span className="block font-['Inter'] uppercase">{photo.categoria}</span>
                  {photo.titulo && <span className="mt-1 block text-xs tracking-normal">{photo.titulo}</span>}
                </span>
              </button>)}</div>
                : <div className="py-20 text-center"><p className="t-body text-[#77736f]">{active === "Todos" ? "Pronto compartiremos nuevas imágenes." : "Esta galería todavía no tiene imágenes."}</p></div>}
        </section>

        {lightbox && <div onClick={() => setLightbox(null)} className="fixed inset-0 z-200 flex cursor-zoom-out items-center justify-center bg-[rgba(12,11,11,0.97)]" role="dialog" aria-modal="true" aria-label={lightbox.titulo || lightbox.categoria}>
          <button type="button" onClick={() => setLightbox(null)} className="absolute right-8 top-7 cursor-pointer border-0 bg-transparent font-['Inter'] text-[0.65rem] tracking-[0.2em] text-[rgba(244,243,240,0.7)] uppercase">Cerrar ×</button>
          <img src={lightbox.url} alt={lightbox.titulo || lightbox.categoria} onClick={(event) => event.stopPropagation()} className="block max-h-[90vh] max-w-[90vw] object-contain" />
        </div>}
      </div>
    </Layout>
  );
}
