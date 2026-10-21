import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../pages/Layout/Layout";

const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:3001").replace(/\/+$/, "");

const mostrarPrecio = (valor) => valor == null || valor === ""? "Precio por definir": new Intl.NumberFormat("es-PE", {
      style: "currency", currency: "PEN", minimumFractionDigits: 2, maximumFractionDigits: 2}).format(Number(valor));

const faqs = [
  {
    q: "¿Cómo reservo?",
    a: "Un abono del 50% confirma la fecha. El saldo se cancela el día de la sesión.",
  },
  {
    q: "¿Puedo cambiar la fecha?",
    a: "Sí, con 48 horas mínimo de anticipación sin costo adicional.",
  },
  {
    q: "¿En qué formato entregan las fotos?",
    a: "Alta resolución vía galería digital privada. Aptas para cualquier tamaño de impresión.",
  },
  {
    q: "¿Puedo agregar fotos al paquete?",
    a: "Sí — ₡2,000 por foto editada adicional, pagada el mismo día.",
  },
  {
    q: "¿Cuánto tarda la entrega?",
    a: "Básico 5–7 días · Estándar 7 · Premium 10 · Elite 15 días hábiles.",
  },
];

export default function Paquetes() {
  const [tab, setTab] = useState("session");
  const [openFaq, setOpenFaq] = useState(null);
  const [paquetes, setPaquetes] = useState([]);
  const [alquileres, setAlquileres] = useState([]);
  const [tarifas, setTarifas] = useState([]);
  const [membresias, setMembresias] = useState([]);
  const [cargandoPaquetes, setCargandoPaquetes] = useState(true);
  const [errorPaquetes, setErrorPaquetes] = useState("");
  const [cargandoCatalogo, setCargandoCatalogo] = useState(true);
  const [errorCatalogo, setErrorCatalogo] = useState("");
  const [cargandoMembresias, setCargandoMembresias] = useState(true);
  const [errorMembresias, setErrorMembresias] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API_BASE_URL}/api/paquetes`, { signal: controller.signal })
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error || "No se pudieron cargar los paquetes.");
        return body;
      })
      .then((body) => { if (!controller.signal.aborted) setPaquetes(body); })
      .catch((error) => { if (!controller.signal.aborted) setErrorPaquetes(error.message); })
      .finally(() => { if (!controller.signal.aborted) setCargandoPaquetes(false); });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    Promise.all(["ALQUILER", "TARIFA"].map(async (seccion) => {
      const response = await fetch(`${API_BASE_URL}/api/paquetes?seccion=${seccion}`, { signal: controller.signal });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || `No se pudieron cargar ${seccion.toLowerCase()}.`);
      return [seccion, body];
    }))
      .then((resultados) => {
        if (controller.signal.aborted) return;
        setAlquileres(resultados.find(([seccion]) => seccion === "ALQUILER")?.[1] || []);
        setTarifas(resultados.find(([seccion]) => seccion === "TARIFA")?.[1] || []);
      })
      .catch((error) => { if (!controller.signal.aborted) setErrorCatalogo(error.message); })
      .finally(() => { if (!controller.signal.aborted) setCargandoCatalogo(false); });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API_BASE_URL}/api/planes-membresia`, { signal: controller.signal })
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error || "No se pudieron cargar las membresías.");
        return body;
      })
      .then((body) => { if (!controller.signal.aborted) setMembresias(body); })
      .catch((error) => { if (!controller.signal.aborted) setErrorMembresias(error.message); })
      .finally(() => { if (!controller.signal.aborted) setCargandoMembresias(false); });
    return () => controller.abort();
  }, []);

  return (
    <Layout>
      <div className="bg-white">
        {/* HEADER */}
        <header className="px-8 md:px-12 pt-20 pb-12 border-b border-[rgba(26,24,24,0.08)]">
          <p className="t-label mb-6">Tarifas</p>

          <h1 className="font-[Fraunces,Georgia,serif] italic font-extralight text-[clamp(3rem,6vw,5.5rem)] tracking-[0.02em] leading-none text-[#1a1818] max-w-150">
            Encuentra tu
            <br />
            paquete
          </h1>
        </header>

        {/* TABS */}
        <div className="border-b border-[rgba(26,24,24,0.08)] px-8 md:px-12 flex">
          {["session", "rental", "rates", "memberships"].map((type) => (
            <button
              key={type}
              onClick={() => setTab(type)}
              className={`font-['Inter'] font-normal text-[0.65rem] tracking-[0.22em] uppercase bg-transparent border-0 border-b pt-[1.1rem] pb-[1.1rem] pr-6 mr-6 cursor-pointer transition-colors duration-200
              ${
                tab === type
                  ? "text-[#1a1818] border-[#a51c1c]"
                  : "text-[#aaa8a4] border-transparent"
              }
            `}
            >
              {type === "session"
                ? "Sesiones"
                : type === "rental"
                  ? "Alquiler"
                  : type === "rates"
                    ? "Tarifas"
                    : "Membresías"}
            </button>
          ))}
        </div>

        {/* SESSION PACKAGES */}
        {tab === "session" && (
          <section className="px-8 md:px-12 py-12 max-w-340 mx-auto">

            {/* PACKAGES GRID */}
            {cargandoPaquetes && <p className="t-body py-8">Cargando paquetes...</p>}
            {errorPaquetes && <p className="py-8 text-sm text-[#a51c1c]" role="alert">{errorPaquetes}</p>}
            {!cargandoPaquetes && !errorPaquetes && paquetes.length === 0 && <p className="t-body py-8">Pronto publicaremos nuestros paquetes.</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 items-stretch border-t border-[rgba(26,24,24,0.1)]">
              {paquetes.map((pkg, index) => (
                <div
                  key={pkg.id}
                  className={`
                  p-8 relative flex flex-col
                  border-b border-[rgba(26,24,24,0.1)]
                  ${
                    index < paquetes.length - 1
                      ? "xl:border-r border-[rgba(26,24,24,0.1)]"
                      : ""
                  }
                `}
                >
                  {pkg.imagenUrl && <img src={pkg.imagenUrl} alt={pkg.nombre} className="-mx-8 -mt-8 mb-6 h-40 w-[calc(100%+4rem)] object-cover" />}
                  {pkg.featured && (
                    <span className="absolute top-5 right-5 font-['Inter'] font-normal text-[0.58rem] tracking-[0.2em] uppercase text-[#a51c1c] border-b border-[#a51c1c] pb-px">
                      Popular
                    </span>
                  )}

                  <p className="font-[Fraunces,Georgia,serif] font-light text-base tracking-widest uppercase text-[#8a8880] mb-6">
                    {pkg.nombre}
                  </p>

                  <p className="font-[Fraunces,Georgia,serif] italic font-extralight text-[2.4rem] text-[#1a1818] leading-none mb-1">
                    {mostrarPrecio(pkg.precio)}
                  </p>

                  <div className="border-t border-[rgba(26,24,24,0.08)] pt-6 mb-6">
                    {(pkg.caracteristicas || []).map((item) => (
                      <div
                        key={item.id}
                        className="flex gap-[0.6rem] items-baseline mb-[0.55rem]"
                      >
                        <span className="w-1 h-1 rounded-full bg-[#a51c1c] shrink-0 mt-1.25" />

                        <span className="font-['Inter'] font-light text-[0.78rem] text-[#5a5856] leading-[1.4]">
                          {item.nombre}
                        </span>
                      </div>
                    ))}
                  </div>

                  <p className="t-body text-[0.7rem] text-[#aaa8a4] italic mb-8">
                    {pkg.descripcion}
                  </p>

                  <Link to="/contacto" className="btn-ghost mt-auto text-[0.62rem]">
                    Reservar
                  </Link>
                </div>
              ))}
            </div>

            {/* ADD-ONS */}
            <div className="mt-12 py-8 border-t border-[rgba(26,24,24,0.08)]">
              <p className="t-label mb-6">Servicios adicionales</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0">
                {[
                  ["Foto editada adicional", "₡2,000"],
                  ["Hora adicional", "₡15,000"],
                  ["Maquillaje profesional", "₡20,000"],
                  ["Reel 30 seg adicional", "₡25,000"],
                  ["Entrega urgente 24–48 h", "+50%"],
                  ['Impresión 8×10"', "₡3,500"],
                ].map(([item, price]) => (
                  <div
                    key={item}
                    className="flex justify-between items-baseline py-3 border-b border-[rgba(26,24,24,0.06)]"
                  >
                    <span className="t-body text-[0.8rem]">{item}</span>

                    <span className="font-[Fraunces,Georgia,serif] font-light text-[0.9rem] text-[#1a1818]">
                      {price}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* RENTAL PACKAGES */}
        {tab === "rental" && (
          <section className="px-8 md:px-12 py-12 max-w-340 mx-auto">
            {/* STUDIO PHOTO */}
            <div className="relative h-105 overflow-hidden bg-[#dedad4] mb-12">
              <img
                src="https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?w=1600&h=700&fit=crop&auto=format&q=85"
                alt="Estudio Studio13"
                className="w-full h-full object-cover block opacity-[0.85]"
              />

              <div className="absolute bottom-8 left-8">
                <p className="font-[Fraunces,Georgia,serif] italic font-extralight text-[2rem] text-white tracking-[0.04em]">
                  Estudio profesional disponible
                  <br />
                  para fotógrafos y marcas
                </p>
              </div>
            </div>

            {/* RENTAL GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 items-stretch border-t border-[rgba(26,24,24,0.1)]">
              {cargandoCatalogo && <p className="t-body py-8">Cargando servicios de alquiler...</p>}
              {errorCatalogo && <p className="py-8 text-sm text-[#a51c1c]" role="alert">{errorCatalogo}</p>}
              {!cargandoCatalogo && !errorCatalogo && alquileres.length === 0 && <p className="t-body py-8">Pronto publicaremos servicios de alquiler.</p>}
              {alquileres.map((pkg, index) => (
                <div
                  key={pkg.id} className={` p-8 border-b border-[rgba(26,24,24,0.1)] relative flex h-full flex-col
                  ${
                    index < alquileres.length - 1
                      ? "md:border-r border-[rgba(26,24,24,0.1)]"
                      : ""
                  }
                `}
                >
                  {pkg.imagenUrl && <img src={pkg.imagenUrl} alt={pkg.nombre} className="-mx-8 -mt-8 mb-6 h-40 w-[calc(100%+4rem)] object-cover" />}

                  <p className="font-[Fraunces,Georgia,serif] font-light text-base tracking-widest uppercase text-[#8a8880] mb-6">
                    {pkg.nombre}
                  </p>

                  <p className="font-[Fraunces,Georgia,serif] italic font-extralight text-[2.4rem] text-[#1a1818] leading-none mb-1">
                    {mostrarPrecio(pkg.precio)}
                  </p>

                  {pkg.descripcion && <p className="t-body mb-5 whitespace-pre-wrap">{pkg.descripcion}</p>}

                  <div className="border-t border-[rgba(26,24,24,0.08)] pt-6 mb-8">
                    {(pkg.caracteristicas || []).map((item) => (
                      <div
                        key={item.id}
                        className="flex gap-[0.6rem] items-baseline mb-[0.55rem]"
                      >
                        <span className="w-1 h-1 rounded-full bg-[#a51c1c] shrink-0 mt-1.25" />

                        <span className="font-['Inter'] font-light text-[0.78rem] text-[#5a5856] leading-[1.4]">
                          {item.nombre}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Link to="/contacto" className="btn-ghost mt-auto text-[0.62rem]">
                    Reservar
                  </Link>
                </div>
              ))}
            </div>

            {/* EQUIPMENT */}
            <div className="mt-12 py-8 border-t border-[rgba(26,24,24,0.08)]">
              <p className="t-label mb-6">Equipamiento incluido</p>

              <div className="columns-[200px] gap-8">
                {[
                  "2× Estrobos Godox AD600 Pro",
                  "3× Softboxes 60×90 cm",
                  "Paraguas plateado 130 cm",
                  "Reflectores B/N",
                  "Fondos: blanco · negro · gris",
                  "Fondo texturizado vintage",
                  "Sistema de rieles 10×12 ft",
                  "Mesa de producto con curva",
                  "Disparador inalámbrico",
                  "Aire acondicionado",
                  "Cortinas black-out",
                  "Espejo de cuerpo completo",
                ].map((equipment) => (
                  <p
                    key={equipment}
                    className="t-body text-[0.78rem] mb-2 break-inside-avoid"
                  >
                    — {equipment}
                  </p>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* TARIFAS */}
        {tab === "rates" && <section className="px-8 md:px-12 py-16 border-t border-[rgba(26,24,24,0.08)]">
          <div className="max-w-340 mx-auto">
            <p className="t-label mb-8">Tarifas</p>

            <p className="t-body max-w-120 mb-10">
              Rangos de precio por tipo de servicio. Las tarifas exactas
              dependen de la duración, la locación y los requerimientos
              específicos de cada sesión.
            </p>

            {cargandoCatalogo && <p className="t-body py-8">Cargando tarifas...</p>}
            {errorCatalogo && <p className="py-8 text-sm text-[#a51c1c]" role="alert">{errorCatalogo}</p>}
            {!cargandoCatalogo && !errorCatalogo && tarifas.length === 0 && <p className="t-body py-8">Pronto publicaremos nuestras tarifas.</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 border-t border-[rgba(26,24,24,0.1)]">
              {tarifas.map((tarifa) => (
                <article key={tarifa.id} className="border-b border-[rgba(26,24,24,0.1)] p-6">
                  {tarifa.imagenUrl && <img src={tarifa.imagenUrl} alt={tarifa.nombre} className="-mx-6 -mt-6 mb-5 h-40 w-[calc(100%+3rem)] object-cover" />}
                  <h2 className="mb-3 font-[Fraunces,Georgia,serif] text-base font-light tracking-widest uppercase text-[#8a8880]">{tarifa.nombre}</h2>
                  <p className="mb-4 font-[Fraunces,Georgia,serif] text-2xl font-light text-[#1a1818]">{mostrarPrecio(tarifa.precio)}</p>
                  {tarifa.descripcion && <p className="t-body mb-5 whitespace-pre-wrap">{tarifa.descripcion}</p>}
                  {(tarifa.caracteristicas || []).length > 0 && <ul className="grid gap-2 border-t border-[rgba(26,24,24,0.08)] pt-4 text-sm text-[#5a5856]">{tarifa.caracteristicas.map((item) => <li key={item.id} className="flex gap-2"><span className="text-[#a51c1c]">•</span><span>{item.nombre}</span></li>)}</ul>}
                </article>
              ))}
            </div>

            <p className="t-body text-[0.72rem] mt-5 text-[#aaa8a4] italic">
              * Precios en colones costarricenses. Sujetos a cambio. Contáctanos
              para una cotización exacta.
            </p>
          </div>
        </section>}

        {tab === "memberships" && <section className="px-8 md:px-12 py-16 border-t border-[rgba(26,24,24,0.08)]">
          <div className="max-w-340 mx-auto">
            <p className="t-label mb-8">Membresías</p>
            <p className="t-body max-w-120 mb-10">Planes para acompañar tus proyectos con beneficios exclusivos.</p>
            {cargandoMembresias && <p className="t-body py-8">Cargando membresías...</p>}
            {errorMembresias && <p className="py-8 text-sm text-[#a51c1c]" role="alert">{errorMembresias}</p>}
            {!cargandoMembresias && !errorMembresias && membresias.length === 0 && <p className="t-body py-8">Pronto publicaremos nuestras membresías.</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 border-t border-[rgba(26,24,24,0.1)]">
              {membresias.map((membresia) => (
                <article key={membresia.id} className="border-b border-[rgba(26,24,24,0.1)] p-6">
                  {membresia.imagenUrl && <img src={membresia.imagenUrl} alt={membresia.nombre} className="-mx-6 -mt-6 mb-5 h-40 w-[calc(100%+3rem)] object-cover" />}
                  <h2 className="mb-3 font-[Fraunces,Georgia,serif] text-base font-light tracking-widest uppercase text-[#8a8880]">{membresia.nombre}</h2>
                  <p className="mb-2 font-[Fraunces,Georgia,serif] text-2xl font-light text-[#1a1818]">{mostrarPrecio(membresia.precio)}</p>
                  <p className="t-body mb-4 text-[0.75rem]">{({ MENSUAL: "Mensual", TRIMESTRAL: "Trimestral", ANUAL: "Anual" })[membresia.periodo] || `${membresia.duracionDias} días`}</p>
                  {membresia.descripcion && <p className="t-body mb-5 whitespace-pre-wrap">{membresia.descripcion}</p>}
                  {(membresia.beneficiosItems || []).length > 0 && <ul className="grid gap-2 border-t border-[rgba(26,24,24,0.08)] pt-4 text-sm text-[#5a5856]">{membresia.beneficiosItems.map((item) => <li key={item.id} className="flex gap-2"><span className="text-[#a51c1c]">•</span><span>{item.nombre}</span></li>)}</ul>}
                  {membresia.limiteSesiones != null && <p className="t-body mt-4 text-[0.75rem]">Hasta {membresia.limiteSesiones} sesiones</p>}
                  <Link to="/contacto" className="btn-ghost mt-6 text-[0.62rem]">Consultar membresía</Link>
                </article>
              ))}
            </div>
          </div>
        </section>}

        {/* FAQ */}
        <section className="px-8 md:px-12 pt-16 pb-24 border-t border-[rgba(26,24,24,0.08)]">
          <div className="max-w-170 mx-auto">
            <p className="t-label mb-10">Preguntas frecuentes</p>

            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border-b border-[rgba(26,24,24,0.08)]"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="
                  w-full
                  bg-transparent
                  border-0
                  cursor-pointer
                  flex
                  justify-between
                  items-center
                  py-5
                  text-left
                  gap-4
                "
                >
                  <span className="font-[Fraunces,Georgia,serif] font-light text-base tracking-[0.03em] text-[#1a1818]">
                    {faq.q}
                  </span>

                  <span
                    className={`
                    font-['Inter']
                    font-light
                    text-base
                    shrink-0
                    transition-all
                    duration-200
                    ${
                      openFaq === index
                        ? "text-[#a51c1c] rotate-45"
                        : "text-[#8a8880] rotate-0"
                    }
                  `}
                  >
                    +
                  </span>
                </button>

                {openFaq === index && <p className="t-body pb-5">{faq.a}</p>}
              </div>
            ))}

            <div className="mt-14 text-center">
              <p className="t-body mb-6">¿Tienes una necesidad específica?</p>

              <Link to="/contacto" className="btn-ghost">
                Solicitar cotización personalizada
              </Link>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
