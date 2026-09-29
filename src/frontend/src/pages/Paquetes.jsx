import { useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../pages/Layout/Layout";

const sessions = [
  {
    id: "basico",
    name: "Básico",
    price: "₡45,000",
    usd: "≈ $85",
    duration: "1 h",
    photos: "20 fotos",
    bullets: [
      "1 hora · estudio",
      "20 fotos editadas",
      "1 look / fondo",
      "Galería digital",
    ],
    note: "Retrato · contenido personal",
  },
  {
    id: "estandar",
    name: "Estándar",
    price: "₡90,000",
    usd: "≈ $165",
    duration: "2 h",
    photos: "50 fotos",
    bullets: [
      "2 horas · estudio",
      "50 fotos editadas",
      "3 looks / fondos",
      "Reel 30 seg incluido",
    ],
    note: "Parejas · familia · quinceañera",
    featured: true,
  },
  {
    id: "premium",
    name: "Premium",
    price: "₡165,000",
    usd: "≈ $305",
    duration: "4 h",
    photos: "100 fotos",
    bullets: [
      "4 h · estudio + exteriores",
      "100 fotos editadas",
      "Looks ilimitados",
      "3 Reels + 5 impresiones",
    ],
    note: "Bodas civiles · marca personal",
  },
  {
    id: "elite",
    name: "Elite",
    price: "₡300,000",
    usd: "≈ $555",
    duration: "Día completo",
    photos: "Ilimitadas",
    bullets: [
      "8 h · estudio + locaciones",
      "Fotos ilimitadas editadas",
      "Reels ilimitados",
      "Uso comercial incluido",
    ],
    note: "Bodas · campañas · producción",
  },
];

const rental = [
  {
    name: "Por hora",
    price: "₡15,000",
    usd: "≈ $28",
    bullets: ["Estudio completo", "Iluminación básica", "Fondo blanco / negro"],
  },
  {
    name: "Medio día",
    price: "₡50,000",
    usd: "≈ $92",
    bullets: [
      "4 horas",
      "Toda la iluminación",
      "Todos los fondos · área maquillaje",
    ],
    featured: true,
  },
  {
    name: "Día completo",
    price: "₡85,000",
    usd: "≈ $157",
    bullets: ["8 horas", "Equipo completo", "Asistencia técnica incluida"],
  },
];

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
          {["session", "rental"].map((type) => (
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
                ? "Sesiones fotográficas"
                : "Alquiler de estudio"}
            </button>
          ))}
        </div>

        {/* SESSION PACKAGES */}
        {tab === "session" && (
          <section className="px-8 md:px-12 py-12 max-w-340 mx-auto">
            <p className="t-body max-w-135 mb-12">
              Todos los paquetes incluyen uso del estudio, iluminación
              profesional y galería digital privada.
            </p>

            {/* PACKAGES GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 border-t border-[rgba(26,24,24,0.1)]">
              {sessions.map((pkg, index) => (
                <div
                  key={pkg.id}
                  className={`
                  p-8 relative
                  border-b border-[rgba(26,24,24,0.1)]
                  ${
                    index < sessions.length - 1
                      ? "xl:border-r border-[rgba(26,24,24,0.1)]"
                      : ""
                  }
                `}
                >
                  {pkg.featured && (
                    <span className="absolute top-5 right-5 font-['Inter'] font-normal text-[0.58rem] tracking-[0.2em] uppercase text-[#a51c1c] border-b border-[#a51c1c] pb-px">
                      Popular
                    </span>
                  )}

                  <p className="font-[Fraunces,Georgia,serif] font-light text-base tracking-widest uppercase text-[#8a8880] mb-6">
                    {pkg.name}
                  </p>

                  <p className="font-[Fraunces,Georgia,serif] italic font-extralight text-[2.4rem] text-[#1a1818] leading-none mb-1">
                    {pkg.price}
                  </p>

                  <p className="t-body text-[0.72rem] mb-3">{pkg.usd}</p>

                  <div className="flex gap-5 mb-8">
                    <span className="font-['Inter'] font-light text-[0.75rem] text-[#8a8880]">
                      {pkg.duration}
                    </span>

                    <span className="font-['Inter'] font-light text-[0.75rem] text-[#8a8880]">
                      {pkg.photos}
                    </span>
                  </div>

                  <div className="border-t border-[rgba(26,24,24,0.08)] pt-6 mb-6">
                    {pkg.bullets.map((bullet) => (
                      <div
                        key={bullet}
                        className="flex gap-[0.6rem] items-baseline mb-[0.55rem]"
                      >
                        <span className="w-1 h-1 rounded-full bg-[#a51c1c] shrink-0 mt-1.25" />

                        <span className="font-['Inter'] font-light text-[0.78rem] text-[#5a5856] leading-[1.4]">
                          {bullet}
                        </span>
                      </div>
                    ))}
                  </div>

                  <p className="t-body text-[0.7rem] text-[#aaa8a4] italic mb-8">
                    {pkg.note}
                  </p>

                  <Link to="/contacto" className="btn-ghost text-[0.62rem]">
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
            <div className="grid grid-cols-1 md:grid-cols-3 border-t border-[rgba(26,24,24,0.1)]">
              {rental.map((pkg, index) => (
                <div
                  key={pkg.name} className={` p-8 border-b border-[rgba(26,24,24,0.1)] relative
                  ${
                    index < rental.length - 1
                      ? "md:border-r border-[rgba(26,24,24,0.1)]"
                      : ""
                  }
                `}
                >
                  {pkg.featured && (
                    <span className="absolute top-5 right-5 font-['Inter'] font-normal text-[0.58rem] tracking-[0.2em] uppercase text-[#a51c1c] border-b border-[#a51c1c] pb-px">
                      Popular
                    </span>
                  )}

                  <p className="font-[Fraunces,Georgia,serif] font-light text-base tracking-widest uppercase text-[#8a8880] mb-6">
                    {pkg.name}
                  </p>

                  <p className="font-[Fraunces,Georgia,serif] italic font-extralight text-[2.4rem] text-[#1a1818] leading-none mb-1">
                    {pkg.price}
                  </p>

                  <p className="t-body text-[0.72rem] mb-8">{pkg.usd}</p>

                  <div className="border-t border-[rgba(26,24,24,0.08)] pt-6 mb-8">
                    {pkg.bullets.map((bullet) => (
                      <div
                        key={bullet}
                        className="flex gap-[0.6rem] items-baseline mb-[0.55rem]"
                      >
                        <span className="w-1 h-1 rounded-full bg-[#a51c1c] shrink-0 mt-1.25" />

                        <span className="font-['Inter'] font-light text-[0.78rem] text-[#5a5856] leading-[1.4]">
                          {bullet}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Link to="/contacto" className="btn-ghost text-[0.62rem]">
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
        <section className="px-8 md:px-12 py-16 border-t border-[rgba(26,24,24,0.08)]">
          <div className="max-w-340 mx-auto">
            <p className="t-label mb-8">Tarifas</p>

            <p className="t-body max-w-120 mb-10">
              Rangos de precio por tipo de servicio. Las tarifas exactas
              dependen de la duración, la locación y los requerimientos
              específicos de cada sesión.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 border-t border-[rgba(26,24,24,0.1)]">
              {[
                {
                  servicio: "Fotografía corporativa",
                  rango: "₡60,000 – ₡120,000",
                },
                {
                  servicio: "Quinceañero",
                  rango: "₡80,000 – ₡150,000",
                },
                {
                  servicio: "Fotos familiares",
                  rango: "₡45,000 – ₡90,000",
                },
                {
                  servicio: "Sesión de embarazo",
                  rango: "₡55,000 – ₡100,000",
                },
                {
                  servicio: "Parejas",
                  rango: "₡45,000 – ₡90,000",
                },
                {
                  servicio: "Fotografía de producto (Snacks Queik)",
                  rango: "₡40,000 – ₡80,000",
                },
                {
                  servicio: "Cobertura de eventos",
                  rango: "₡90,000 – ₡200,000",
                },
                {
                  servicio: "Sesión en exteriores",
                  rango: "₡55,000 – ₡110,000",
                },
                {
                  servicio: "Talleres fotográficos",
                  rango: "₡25,000 – ₡60,000 / persona",
                },
                {
                  servicio: "Alquiler de estudio (hora)",
                  rango: "₡15,000",
                },
              ].map((row) => (
                <div
                  key={row.servicio}
                  className="flex justify-between items-baseline py-4 border-b border-[rgba(26,24,24,0.08)] gap-6"
                >
                  <span className="t-body text-[0.82rem] text-[#3a3836]">
                    {row.servicio}
                  </span>

                  <span className="font-[Fraunces,Georgia,serif] font-light text-[0.95rem] text-[#1a1818] whitespace-nowrap shrink-0">
                    {row.rango}
                  </span>
                </div>
              ))}
            </div>

            <p className="t-body text-[0.72rem] mt-5 text-[#aaa8a4] italic">
              * Precios en colones costarricenses. Sujetos a cambio. Contáctanos
              para una cotización exacta.
            </p>
          </div>
        </section>

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
