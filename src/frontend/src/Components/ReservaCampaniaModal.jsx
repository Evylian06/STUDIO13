import { useEffect, useRef, useState } from "react";

const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:3001").replace(/\/+$/, "");

export default function ReservaCampaniaModal({ campania, disponible = true, onClose }) {
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const closeHandlerRef = useRef(onClose);
  const enviandoRef = useRef(false);
  const [form, setForm] = useState({ nombre: "", email: "", telefono: "", mensaje: "" });
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState("");
  closeHandlerRef.current = onClose;
  enviandoRef.current = enviando;

  useEffect(() => {
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKeyDown = (event) => {
      if (event.key === "Escape" && !enviandoRef.current) closeHandlerRef.current();
      if (event.key !== "Tab") return;
      const items = dialogRef.current?.querySelectorAll('button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [href]');
      if (!items?.length) return;
      const first = items[0]; const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus?.();
    };
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    if (enviando || enviado || !disponible) return;
    setEnviando(true); setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/reservaciones`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: form.nombre.trim(), email: form.email.trim(), telefono: form.telefono.trim(), tipoSesion: campania.paquete?.nombre || campania.paqueteNombre, paqueteId: campania.paqueteId, campaniaId: campania.id, categoriaServicio: "SESION", mensaje: form.mensaje.trim() }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.error || "No se pudo enviar la solicitud. Inténtalo nuevamente.");
      setEnviado(true);
    } catch (reason) {
      setError(reason instanceof TypeError ? "No se pudo contactar con el servidor. Inténtalo nuevamente más tarde." : reason.message);
    } finally { setEnviando(false); }
  };

  return <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/65 p-3 sm:p-6" onMouseDown={(event) => { if (event.target === event.currentTarget && !enviando) onClose(); }}>
    <section ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="reserva-campania-titulo" className="my-auto max-h-[94dvh] w-full max-w-xl overflow-y-auto border border-[#3c3936] bg-[#f8f7f4] p-5 shadow-2xl sm:p-8">
      <header className="mb-5 flex items-start justify-between gap-4 border-b border-black/10 pb-4"><div><p className="mb-1 font-['Inter'] text-[10px] tracking-[.22em] text-[#a51c1c] uppercase">Reserva de campaña</p><h2 id="reserva-campania-titulo" className="m-0 font-[Fraunces,Georgia,serif] text-2xl font-light text-[#1a1818]">{campania.titulo}</h2><p className="mb-0 mt-2 font-['Inter'] text-xs text-[#77716b]">Paquete: {campania.paquete?.nombre || campania.paqueteNombre}</p></div><button ref={closeRef} type="button" aria-label="Cerrar formulario" onClick={onClose} className="border border-black/20 bg-transparent px-3 py-2 text-xl leading-none text-[#1a1818] hover:border-[#a51c1c] hover:text-[#a51c1c]">×</button></header>
      {!disponible && <p className="mb-4 border border-amber-300 bg-amber-50 p-3 font-['Inter'] text-sm leading-6 text-amber-900" role="status">Esta campaña ya no está disponible. Conservamos tus datos, pero no se puede enviar una reserva para ella.</p>}
      {enviado ? <div className="py-8 text-center" role="status"><h3 className="mb-3 font-[Fraunces,Georgia,serif] text-3xl font-light text-[#1a1818]">¡Listo!</h3><p className="mx-auto mb-6 max-w-sm font-['Inter'] text-sm leading-6 text-[#66615c]">Recibimos tu solicitud para {campania.titulo}. Te contactaremos para coordinar los detalles.</p><button type="button" onClick={onClose} className="border border-[#a51c1c] bg-[#a51c1c] px-5 py-3 font-['Inter'] text-xs tracking-wider text-white">Cerrar</button></div> : <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        {[{ key: "nombre", label: "Nombre", type: "text", placeholder: "Tu nombre completo" }, { key: "email", label: "Correo electrónico", type: "email", placeholder: "ejemplo@gmail.com" }, { key: "telefono", label: "Teléfono / WhatsApp", type: "tel", placeholder: "+506 0000-0000" }].map((field) => <label key={field.key} className="grid gap-1.5 font-['Inter'] text-[10px] tracking-wider text-[#716b65] uppercase">{field.label}<input required type={field.type} value={form[field.key]} onChange={(event) => setForm((current) => ({ ...current, [field.key]: event.target.value }))} placeholder={field.placeholder} className="w-full border-0 border-b border-black/20 bg-transparent px-0 py-2.5 text-sm normal-case tracking-normal text-[#1a1818] outline-none focus:border-[#a51c1c]" /></label>)}
        <label className="grid gap-1.5 font-['Inter'] text-[10px] tracking-wider text-[#716b65] uppercase sm:col-span-2">Campaña y paquete<input readOnly value={`${campania.titulo} · ${campania.paquete?.nombre || campania.paqueteNombre}`} className="w-full border-0 border-b border-black/20 bg-transparent px-0 py-2.5 text-sm normal-case tracking-normal text-[#1a1818]" /></label>
        <label className="grid gap-1.5 font-['Inter'] text-[10px] tracking-wider text-[#716b65] uppercase sm:col-span-2">Mensaje (opcional)<textarea rows={3} value={form.mensaje} onChange={(event) => setForm((current) => ({ ...current, mensaje: event.target.value }))} placeholder="Cuéntanos algún detalle de tu reserva" className="w-full resize-y border border-black/15 bg-white px-3 py-2.5 font-['Inter'] text-sm normal-case tracking-normal text-[#1a1818] outline-none focus:border-[#a51c1c]" /></label>
        {error && <p className="m-0 text-sm text-[#a51c1c] sm:col-span-2" role="alert">{error}</p>}
        <div className="flex flex-wrap justify-end gap-3 pt-2 sm:col-span-2"><button type="button" disabled={enviando} onClick={onClose} className="border border-black/20 bg-transparent px-5 py-3 font-['Inter'] text-xs text-[#1a1818] disabled:opacity-50">Cancelar</button><button type="submit" disabled={enviando || !disponible} className="border border-[#a51c1c] bg-[#a51c1c] px-5 py-3 font-['Inter'] text-xs tracking-wider text-white disabled:cursor-wait disabled:opacity-60">{enviando ? "Enviando…" : "Enviar solicitud"}</button></div>
      </form>}
    </section>
  </div>;
}
