import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { WHATSAPP_ESTUDIO } from "../pages/Layout/Layout.jsx";

const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:3001").replace(/\/+$/, "");
const imagenPublicidad = (url) => url?.startsWith("http") ? url : `${API_BASE_URL}${url || ""}`;

export default function AnuncioEmergente({ anuncio, disponible = true, onClose }) {
  const cerrarRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!anuncio?.id) return undefined;
    const previo = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    cerrarRef.current?.focus();
    const escape = (event) => { if (event.key === "Escape") onCloseRef.current(); };
    document.addEventListener("keydown", escape);
    return () => { document.body.style.overflow = previo; document.removeEventListener("keydown", escape); };
  }, [anuncio?.id]);

  if (!anuncio) return null;
  const mensajeWhatsApp = encodeURIComponent(`Hola, quisiera consultar sobre: ${anuncio.nombre}`);
  const enlaceWhatsApp = `https://wa.me/${WHATSAPP_ESTUDIO}?text=${mensajeWhatsApp}`;

  return createPortal(
    <div className="fixed inset-0 z-200 flex items-center justify-center overflow-y-auto px-4 py-6 sm:px-8" role="presentation">
      <button type="button" aria-label="Cerrar anuncio" onClick={onClose} className="absolute inset-0 h-full w-full cursor-default bg-[rgba(12,11,11,0.72)] backdrop-blur-[3px]" />
      <section role="dialog" aria-modal="true" aria-labelledby="anuncio-inicio-titulo" className="relative z-10 my-auto grid max-h-[calc(100dvh-2rem)] w-full max-w-205 overflow-y-auto border border-white/60 bg-[#f4f3f0] shadow-[0_24px_80px_rgba(0,0,0,0.4)] md:grid-cols-[1.08fr_0.92fr] md:overflow-hidden">
        <button ref={cerrarRef} type="button" onClick={onClose} aria-label="Cerrar anuncio" className="absolute right-3 top-3 z-20 flex h-11 w-11 items-center justify-center border border-white/70 bg-[#111010]/90 text-white shadow-md hover:bg-[#a51c1c]">×</button>
        <div className="relative min-h-48 bg-[#1a1818] md:min-h-96"><img src={imagenPublicidad(anuncio.url)} alt={anuncio.nombre} className="absolute inset-0 h-full w-full object-cover" /><div className="absolute inset-0 bg-linear-to-t from-[rgba(12,11,11,0.48)] via-transparent to-transparent" /><span className="absolute bottom-4 left-4 border border-white/40 bg-[#111010]/55 px-3 py-2 text-[0.6rem] tracking-[0.2em] text-white uppercase">Studio13 · {anuncio.seccion}</span></div>
        <div className="flex flex-col justify-center px-5 py-6 text-[#1a1818] sm:px-7 sm:py-8 md:px-8">
          <p className="mb-4 text-[0.62rem] tracking-[0.26em] text-[#a51c1c] uppercase">Studio13</p>
          <h2 id="anuncio-inicio-titulo" className="mb-4 font-[Fraunces,Georgia,serif] text-3xl leading-tight sm:text-4xl">{anuncio.nombre}</h2>
          {!disponible && <p className="mb-5 border border-amber-300 bg-amber-50 p-3 text-sm leading-6 text-amber-900" role="status">Este anuncio ya no está disponible.</p>}
          {anuncio.descripcion && <p className="mb-8 max-w-lg text-sm leading-7 text-[#5a5856]">{anuncio.descripcion}</p>}
          <div className="flex flex-wrap items-center gap-3">
            {disponible && anuncio.mostrarWhatsapp && <a href={enlaceWhatsApp} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center bg-[#a51c1c] px-5 py-3 text-xs tracking-wide text-white uppercase hover:bg-[#111010]">Consultar por WhatsApp</a>}
            <button type="button" onClick={onClose} className="min-h-11 px-1 text-xs text-[#5a5856] underline">Seguir explorando</button>
          </div>
        </div>
      </section>
    </div>, document.body,
  );
}
