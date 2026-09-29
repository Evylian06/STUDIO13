import { useState } from "react";
import Layout from "../pages/Layout/Layout";

export default function Contacto() {
  const [form, setForm] = useState({
    nombre: "",
    telefono: "",
    paquete: "",
    mensaje: "",
  });

  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <Layout>
      <div className="bg-white">
        {/* ── HERO ── */}
        <section className="relative h-[60vh] min-h-[400px] overflow-hidden bg-[#1a1818]">
          <img
            src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1800&h=900&fit=crop&auto=format&q=85"
            alt="Estudio fotográfico Studio13"
            className="absolute inset-0 w-full h-full object-cover object-[center_40%] opacity-[0.55]"
          />

          <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(12,11,11,0.8)_0%,transparent_65%)]" />

          <div className="absolute bottom-12 left-12 max-w-[31.25rem]">
            <p className="t-label mb-4 !text-[rgba(244,243,240,0.4)]">
              Contacto
            </p>

            <h1 className="font-[Fraunces,Georgia,serif] italic font-[200] text-[clamp(2.5rem,5vw,4.5rem)] text-white tracking-[0.04em] leading-none">
              Agenda tu sesión
            </h1>
          </div>
        </section>

        {/* ── MAIN CONTENT ── */}
        <section className="py-20 px-12 max-w-[85rem] mx-auto">
          <div className="grid grid-cols-[1fr_1.2fr] gap-20 items-start">
            {/* ── LEFT: info ── */}
            <div>
              <p className="t-label mb-8">Contáctanos</p>

              <div className="mb-12">
                {[
                  {
                    label: "WhatsApp",
                    value: "+506 8886-2187",
                    href: "https://wa.me/50688862187",
                  },
                  {
                    label: "Correo",
                    value: "studio13@gmail.com",
                    href: "mailto:studio13@gmail.com",
                  },
                  {
                    label: "Ubicación",
                    value: "Puerto Cito, Costa Rica",
                    href: "#",
                  },
                ].map((c) => (
                  <div
                    key={c.label}
                    className="border-b border-[rgba(26,24,24,0.08)] py-5"
                  >
                    <p className="t-label mb-[0.35rem]">{c.label}</p>

                    <a
                      href={c.href}
                      className="font-[Fraunces,Georgia,serif] font-light text-[1.05rem] text-[#1a1818] no-underline tracking-[0.03em] transition-colors duration-200 hover:text-[#a51c1c]"
                    >
                      {c.value}
                    </a>
                  </div>
                ))}
              </div>

              {/* Hours */}
              <p className="t-label mb-5">Horario</p>

              {[
                ["Lunes – Viernes", "8:00 – 18:00"],
                ["Sábados", "8:00 – 16:00"],
                ["Domingos", "Con cita previa"],
              ].map(([day, time]) => (
                <div
                  key={day}
                  className="flex justify-between py-[0.6rem] border-b border-[rgba(26,24,24,0.06)]"
                >
                  <span className="t-body !text-[0.8rem]">{day}</span>

                  <span className="font-['Inter'] font-normal text-[0.8rem] text-[#1a1818]">
                    {time}
                  </span>
                </div>
              ))}

              {/* Studio photos */}
              <div className="mt-12 grid grid-cols-2 gap-3">
                {[
                  "https://images.unsplash.com/photo-1471341971476-ae15ff5dd4ea?w=400&h=320&fit=crop&auto=format&q=80",
                  "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=320&fit=crop&auto=format&q=80",
                  "https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?w=400&h=260&fit=crop&auto=format&q=80",
                  "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=400&h=260&fit=crop&auto=format&q=80",
                ].map((src, i) => (
                  <div
                    key={i}
                    className={`overflow-hidden bg-[#dedad4] ${
                      i < 2 ? "aspect-[5/4]" : "aspect-[4/3]"
                    }`}
                  >
                    <img
                      src={src}
                      alt="Studio13"
                      className="w-full h-full object-cover block opacity-[0.88] transition-transform duration-[600ms] ease-out hover:scale-[1.05]"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* ── RIGHT: form ── */}
            <div>
              {sent ? (
                <div className="py-16 text-center">
                  <span className="accent-rule mx-auto mb-8" />

                  <h2 className="font-[Fraunces,Georgia,serif] italic font-[200] text-[2.5rem] text-[#1a1818] mb-4">
                    ¡Listo!
                  </h2>

                  <p className="t-body max-w-[20rem] mx-auto mb-10">
                    Recibimos tu solicitud. Te contactaremos en menos de 24
                    horas para coordinar los detalles.
                  </p>

                  <button onClick={() => setSent(false)} className="btn-ghost">
                    Enviar otra solicitud
                  </button>
                </div>
              ) : (
                <>
                  <p className="t-label mb-10">Formulario de reserva</p>

                  <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                    <div>
                      <label className="t-label block mb-2">Nombre</label>

                      <input
                        type="text"
                        required
                        value={form.nombre}
                        onChange={(e) =>
                          setForm({ ...form, nombre: e.target.value })
                        }
                        placeholder="Tu nombre completo"
                        className="w-full bg-transparent border-0 border-b border-[rgba(26,24,24,0.2)] py-3 font-['Inter'] font-light text-sm text-[#1a1818] outline-none transition-colors duration-200 focus:border-[#1a1818]"
                      />
                    </div>

                    <div>
                      <label className="t-label block mb-2">
                        Teléfono / WhatsApp
                      </label>

                      <input
                        type="tel"
                        required
                        value={form.telefono}
                        onChange={(e) =>
                          setForm({ ...form, telefono: e.target.value })
                        }
                        placeholder="+506 0000-0000"
                        className="w-full bg-transparent border-0 border-b border-[rgba(26,24,24,0.2)] py-3 font-['Inter'] font-light text-sm text-[#1a1818] outline-none transition-colors duration-200 focus:border-[#1a1818]"
                      />
                    </div>

                    <div>
                      <label className="t-label block mb-2">
                        Paquete de interés
                      </label>

                      <select
                        value={form.paquete}
                        onChange={(e) =>
                          setForm({ ...form, paquete: e.target.value })
                        }
                        className={`w-full bg-transparent border-0 border-b border-[rgba(26,24,24,0.2)] py-3 font-['Inter'] font-light text-sm outline-none transition-colors duration-200 cursor-pointer appearance-none focus:border-[#1a1818] ${
                          form.paquete ? "text-[#1a1818]" : "text-[#9a9490]"
                        }`}
                      >
                        <option value="" disabled>
                          Seleccionar...
                        </option>
                        <option value="basico">Básico — ₡45,000</option>
                        <option value="estandar">Estándar — ₡90,000</option>
                        <option value="premium">Premium — ₡165,000</option>
                        <option value="elite">Elite — ₡300,000</option>
                        <option value="alquiler-hora">
                          Alquiler por hora — ₡15,000
                        </option>
                        <option value="alquiler-medio">
                          Alquiler medio día — ₡50,000
                        </option>
                        <option value="alquiler-dia">
                          Alquiler día completo — ₡85,000
                        </option>
                        <option value="personalizado">
                          Cotización personalizada
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="t-label block mb-2">
                        Cuéntanos tu idea
                      </label>

                      <textarea
                        rows={5}
                        value={form.mensaje}
                        onChange={(e) =>
                          setForm({ ...form, mensaje: e.target.value })
                        }
                        placeholder="Tipo de sesión, fecha aproximada, número de personas, locación preferida..."
                        className="w-full bg-transparent resize-none border border-[rgba(26,24,24,0.15)] p-3 font-['Inter'] font-light text-sm text-[#1a1818] outline-none transition-colors duration-200 focus:border-[#1a1818]"
                      />
                    </div>

                    <div className="pt-2">
                      <button type="submit" className="btn-ghost">
                        Enviar solicitud
                      </button>

                      <p className="t-body !text-[0.7rem] mt-4 !text-[#aaa8a4]">
                        Respondemos en menos de 24 horas.
                      </p>
                    </div>
                  </form>
                </>
              )}

              {/* Why Studio13 */}
              <div className="mt-16 pt-12 border-t border-[rgba(26,24,24,0.08)]">
                <p className="t-label mb-6">¿Por qué Studio13?</p>

                {[
                  [
                    "8+ años de experiencia",
                    "Más de 1,200 sesiones realizadas en Costa Rica.",
                  ],
                  [
                    "Equipo profesional certificado",
                    "Iluminación, composición y edición de nivel editorial.",
                  ],
                  [
                    "Galería digital privada",
                    "Entrega segura en alta resolución, lista para imprimir.",
                  ],
                  [
                    "Estudio disponible para alquiler",
                    "Equipamiento completo. Fotógrafos y marcas bienvenidos.",
                  ],
                ].map(([title, desc]) => (
                  <div key={title} className="flex gap-4 mb-5">
                    <span className="w-px bg-[#a51c1c] shrink-0 mt-[3px]" />

                    <div>
                      <p className="font-['Inter'] font-normal text-[0.78rem] text-[#1a1818] mb-[0.2rem]">
                        {title}
                      </p>

                      <p className="t-body !text-[0.75rem]">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
