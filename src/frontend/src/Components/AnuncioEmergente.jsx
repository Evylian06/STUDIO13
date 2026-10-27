import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";

const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:3001").replace(/\/+$/, "");
const CLAVE_CIERRE = "studio13-anuncio-cerrado";
const imagenPublicidad = (url) => url?.startsWith("http") ? url : `${API_BASE_URL}${url || ""}`;

export default function AnuncioEmergente() {
  const [anuncio, setAnuncio] = useState(null);
  const cerrarRef = useRef(null);
  const ctaRef = useRef(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API_BASE_URL}/api/publicidad`, { signal: controller.signal })
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error || "No se pudieron cargar los anuncios.");
        return body;
      })
      .then((anuncios) => {
        if (controller.signal.aborted || !Array.isArray(anuncios)) return;
        let cerradoEnEstaSesion = false;
        try { cerradoEnEstaSesion = sessionStorage.getItem(CLAVE_CIERRE) === "true"; }
        catch { /* Se muestra el anuncio si el navegador bloquea el almacenamiento de sesión. */ }
        if (!cerradoEnEstaSesion && anuncios[0]) setAnuncio(anuncios[0]);
      })
      .catch((error) => {
        if (!controller.signal.aborted) console.error("[publicidad de Inicio]", error);
      });
    return () => controller.abort();
  }, []);

  const cerrarAnuncio = useCallback(() => {
    if (!anuncio) return;
    try { sessionStorage.setItem(CLAVE_CIERRE, "true"); }
    catch { /* El cierre sigue funcionando si el navegador bloquea el almacenamiento de sesión. */ }
    setAnuncio(null);
  }, [anuncio]);

  useEffect(() => {
    if (!anuncio) return undefined;
    const overflowAnterior = document.body.style.overflow;
    const cerrarConEscape = (evento) => {
      if (evento.key === "Escape") cerrarAnuncio();
      if (evento.key === "Tab") {
        const primero = cerrarRef.current;
        const ultimo = ctaRef.current;
        if (evento.shiftKey && document.activeElement === primero) {
          evento.preventDefault();
          ultimo?.focus();
        } else if (!evento.shiftKey && document.activeElement === ultimo) {
          evento.preventDefault();
          primero?.focus();
        }
      }
    };
    document.addEventListener("keydown", cerrarConEscape);
    document.body.style.overflow = "hidden";
    cerrarRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", cerrarConEscape);
      document.body.style.overflow = overflowAnterior;
    };
  }, [anuncio, cerrarAnuncio]);

  if (!anuncio) return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center overflow-y-auto px-4 py-6 sm:px-8" role="presentation">
      <button type="button" aria-label="Cerrar anuncio" onClick={cerrarAnuncio} className="absolute inset-0 h-full w-full cursor-default bg-[rgba(12,11,11,0.72)] backdrop-blur-[3px]" />
      <section role="dialog" aria-modal="true" aria-labelledby="anuncio-inicio-titulo" aria-describedby={anuncio.descripcion ? "anuncio-inicio-descripcion" : undefined} className="relative z-10 my-auto grid max-h-[calc(100dvh-3rem)] w-full max-w-5xl overflow-y-auto border border-white/60 bg-[#f4f3f0] shadow-[0_24px_80px_rgba(0,0,0,0.4)] md:grid-cols-[1.08fr_0.92fr] md:overflow-hidden">
        <button ref={cerrarRef} type="button" onClick={cerrarAnuncio} aria-label="Cerrar anuncio" className="absolute right-3 top-3 z-20 flex h-11 w-11 items-center justify-center border border-white/70 bg-[#111010]/90 text-white shadow-md transition-colors hover:bg-[#a51c1c] focus:outline-2 focus:outline-offset-2 focus:outline-white">
          <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="m18 6-12 12M6 6l12 12" /></svg>
        </button>
        <div className="relative min-h-52 bg-[#1a1818] md:min-h-120">
          <img src={imagenPublicidad(anuncio.url)} alt={anuncio.nombre} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-linear-to-t from-[rgba(12,11,11,0.48)] via-transparent to-transparent" />
          <span className="absolute bottom-5 left-6 border border-white/40 bg-[#111010]/55 px-3 py-2 font-['Inter'] text-[0.6rem] tracking-[0.2em] text-white uppercase backdrop-blur-sm">Studio13 · {anuncio.seccion}</span>
        </div>
        <div className="flex flex-col justify-center px-7 py-8 text-[#1a1818] sm:px-10 sm:py-12 md:px-12">
          <p className="mb-4 flex items-center gap-3 font-['Inter'] text-[0.62rem] tracking-[0.26em] text-[#a51c1c] uppercase"><span className="h-px w-7 bg-[#a51c1c]" />Una experiencia para recordar</p>
          <h2 id="anuncio-inicio-titulo" className="mb-4 font-[Fraunces,Georgia,serif] text-3xl leading-[1.08] text-[#1a1818] sm:text-4xl lg:text-[2.75rem]">{anuncio.nombre}</h2>
          {anuncio.descripcion && <p id="anuncio-inicio-descripcion" className="mb-8 max-w-lg text-sm leading-7 text-[#5a5856]">{anuncio.descripcion}</p>}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
            {anuncio.enlace
              ? <a ref={ctaRef} href={anuncio.enlace} onClick={cerrarAnuncio} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center gap-3 bg-[#a51c1c] px-6 py-3 font-['Inter'] text-[0.68rem] tracking-[0.15em] text-white uppercase transition-colors hover:bg-[#111010] focus:outline-2 focus:outline-offset-2 focus:outline-[#a51c1c]">{anuncio.textoBoton || "Ver promoción"}<span aria-hidden="true">↗</span></a>
              : <Link ref={ctaRef} to="/contacto" onClick={cerrarAnuncio} className="inline-flex min-h-12 items-center justify-center gap-3 bg-[#a51c1c] px-6 py-3 font-['Inter'] text-[0.68rem] tracking-[0.15em] text-white uppercase transition-colors hover:bg-[#111010] focus:outline-2 focus:outline-offset-2 focus:outline-[#a51c1c]">{anuncio.textoBoton || "Reservar ahora"}<span aria-hidden="true">↗</span></Link>}
            <button type="button" onClick={cerrarAnuncio} className="min-h-11 px-1 font-['Inter'] text-[0.65rem] tracking-[0.12em] text-[#5a5856] underline decoration-[#aaa49d] underline-offset-4 transition-colors hover:text-[#a51c1c]">Seguir explorando</button>
          </div>
        </div>
      </section>
    </div>,
    document.body,
  );
}
