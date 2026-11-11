import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";

const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:3001").replace(/\/+$/, "");
const imagenPublicidad = (url) => url?.startsWith("http") ? url : `${API_BASE_URL}${url || ""}`;

export default function AnuncioEmergente({ anuncio, onClose }) {
  const [formularioAbierto, setFormularioAbierto] = useState(false);
  const [campos, setCampos] = useState({ nombre: "", whatsapp: "", mensaje: "" });
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState("");
  const [error, setError] = useState("");
  const cerrarRef = useRef(null);

  useEffect(() => {
    if (!anuncio) { setFormularioAbierto(false); setResultado(""); setError(""); return; }
    const previo = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    cerrarRef.current?.focus();
    const escape = (event) => { if (event.key === "Escape") formularioAbierto ? setFormularioAbierto(false) : onClose(); };
    document.addEventListener("keydown", escape);
    return () => { document.body.style.overflow = previo; document.removeEventListener("keydown", escape); };
  }, [anuncio, formularioAbierto, onClose]);

  if (!anuncio) return null;
  const enviar = async (event) => {
    event.preventDefault();
    if (enviando) return;
    setEnviando(true); setError(""); setResultado("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/publicidad/${anuncio.id}/consultas`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(campos) });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error || "No se pudo enviar la consulta.");
      setResultado("Tu consulta se envió correctamente. Nos comunicaremos contigo pronto.");
      setCampos({ nombre: "", whatsapp: "", mensaje: "" });
    } catch (reason) { setError(reason.message || "No se pudo enviar la consulta."); }
    finally { setEnviando(false); }
  };

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center overflow-y-auto px-4 py-6 sm:px-8" role="presentation">
      <button type="button" aria-label="Cerrar anuncio" onClick={onClose} className="absolute inset-0 h-full w-full cursor-default bg-[rgba(12,11,11,0.72)] backdrop-blur-[3px]" />
      <section role="dialog" aria-modal="true" aria-labelledby="anuncio-inicio-titulo" className="relative z-10 my-auto grid max-h-[calc(100dvh-2rem)] w-full max-w-[820px] overflow-y-auto border border-white/60 bg-[#f4f3f0] shadow-[0_24px_80px_rgba(0,0,0,0.4)] md:grid-cols-[1.08fr_0.92fr] md:overflow-hidden">
        <button ref={cerrarRef} type="button" onClick={onClose} aria-label="Cerrar anuncio" className="absolute right-3 top-3 z-20 flex h-11 w-11 items-center justify-center border border-white/70 bg-[#111010]/90 text-white shadow-md hover:bg-[#a51c1c]">×</button>
        <div className="relative min-h-48 bg-[#1a1818] md:min-h-96"><img src={imagenPublicidad(anuncio.url)} alt={anuncio.nombre} className="absolute inset-0 h-full w-full object-cover" /><div className="absolute inset-0 bg-linear-to-t from-[rgba(12,11,11,0.48)] via-transparent to-transparent" /><span className="absolute bottom-4 left-4 border border-white/40 bg-[#111010]/55 px-3 py-2 text-[0.6rem] tracking-[0.2em] text-white uppercase">Studio13 · {anuncio.seccion}</span></div>
        <div className="flex flex-col justify-center px-5 py-6 text-[#1a1818] sm:px-7 sm:py-8 md:px-8">
          <p className="mb-4 text-[0.62rem] tracking-[0.26em] text-[#a51c1c] uppercase">Una experiencia para recordar</p>
          <h2 id="anuncio-inicio-titulo" className="mb-4 font-[Fraunces,Georgia,serif] text-3xl leading-tight sm:text-4xl">{anuncio.nombre}</h2>
          {anuncio.descripcion && <p className="mb-8 max-w-lg text-sm leading-7 text-[#5a5856]">{anuncio.descripcion}</p>}
          <div className="flex flex-wrap items-center gap-3">
            {anuncio.formularioEspecial && <button type="button" onClick={() => { setFormularioAbierto(true); setResultado(""); setError(""); }} className="inline-flex min-h-12 items-center bg-[#a51c1c] px-5 py-3 text-xs tracking-wide text-white uppercase hover:bg-[#111010]">Consultar sobre este anuncio</button>}
            {anuncio.enlace ? <a href={anuncio.enlace} onClick={onClose} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center border border-[#a51c1c] px-5 py-3 text-xs tracking-wide text-[#a51c1c] uppercase">{anuncio.textoBoton || "Ver promoción"} ↗</a> : <Link to="/contacto" onClick={onClose} className="inline-flex min-h-12 items-center border border-[#a51c1c] px-5 py-3 text-xs tracking-wide text-[#a51c1c] uppercase">{anuncio.textoBoton || "Reservar ahora"} ↗</Link>}
            <button type="button" onClick={onClose} className="min-h-11 px-1 text-xs text-[#5a5856] underline">Seguir explorando</button>
          </div>
        </div>
        {formularioAbierto && <div className="absolute inset-0 z-30 flex items-center justify-center overflow-y-auto bg-black/75 p-3 sm:p-6" role="presentation">
          <section role="dialog" aria-modal="true" aria-labelledby="consulta-anuncio-titulo" className="my-auto w-full max-w-xl border border-neutral-200 bg-white p-5 shadow-2xl sm:p-8">
            <div className="mb-5 flex items-start justify-between gap-4"><div><p className="mb-2 text-[10px] tracking-[.2em] text-[#a51c1c] uppercase">Formulario especial</p><h3 id="consulta-anuncio-titulo" className="m-0 font-[Georgia] text-2xl text-neutral-900">{anuncio.nombre}</h3></div><button type="button" onClick={() => setFormularioAbierto(false)} aria-label="Cerrar formulario" className="border border-neutral-300 px-3 py-1 text-xl">×</button></div>
            {resultado ? <div role="status" className="border border-green-200 bg-green-50 p-4 text-sm leading-6 text-green-800">{resultado}<button type="button" onClick={() => setFormularioAbierto(false)} className="mt-4 block border border-green-700 px-4 py-2 text-xs">Volver al anuncio</button></div> : <form className="grid gap-4" onSubmit={enviar}>
              <label className="grid gap-1.5 text-xs font-semibold text-neutral-700">Nombre<input required maxLength={140} autoComplete="name" value={campos.nombre} onChange={(e) => setCampos({ ...campos, nombre: e.target.value })} className="border border-neutral-300 px-3 py-2.5 text-sm" /></label>
              <label className="grid gap-1.5 text-xs font-semibold text-neutral-700">WhatsApp<input required maxLength={40} autoComplete="tel" value={campos.whatsapp} onChange={(e) => setCampos({ ...campos, whatsapp: e.target.value })} className="border border-neutral-300 px-3 py-2.5 text-sm" /></label>
              <label className="grid gap-1.5 text-xs font-semibold text-neutral-700">Mensaje<textarea required maxLength={5000} rows={5} value={campos.mensaje} onChange={(e) => setCampos({ ...campos, mensaje: e.target.value })} className="border border-neutral-300 px-3 py-2.5 text-sm" /></label>
              {error && <p role="alert" className="m-0 border border-red-200 bg-red-50 p-3 text-sm text-[#a51c1c]">{error}</p>}
              <div className="flex justify-end gap-3"><button type="button" onClick={() => setFormularioAbierto(false)} disabled={enviando} className="border border-neutral-300 px-4 py-2.5 text-xs">Volver al anuncio</button><button type="submit" disabled={enviando} className="bg-[#a51c1c] px-5 py-2.5 text-xs text-white disabled:opacity-60">{enviando ? "Enviando..." : "Enviar consulta"}</button></div>
            </form>}
          </section>
        </div>}
      </section>
    </div>, document.body,
  );
}
