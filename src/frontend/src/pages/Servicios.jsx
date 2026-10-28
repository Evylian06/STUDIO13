import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../pages/Layout/Layout";

const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:3001").replace(/\/+$/, "");
const normalizarNombre = (value) => value.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase();

function ImagenRotativa({ imagenes, etiqueta, objectPosition }) {
  const [indice, setIndice] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setIndice(0);
    setVisible(true);
    if (imagenes.length < 2) return undefined;

    let intervalo;
    let cambio;
    const cambiar = () => {
      setVisible(false);
      cambio = window.setTimeout(() => {
        setIndice((actual) => (actual + 1) % imagenes.length);
        setVisible(true);
      }, 300);
    };
    const inicio = window.setTimeout(() => {
      cambiar();
      intervalo = window.setInterval(cambiar, 4000);
    }, 500 + Math.random() * 3000);

    return () => {
      window.clearTimeout(inicio);
      window.clearInterval(intervalo);
      window.clearTimeout(cambio);
    };
  }, [imagenes]);

  const imagen = imagenes[indice];
  return imagen
    ? <img src={imagen} alt={etiqueta} className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${visible ? "opacity-[0.68] hover:opacity-[0.82]" : "opacity-0"}`} style={{ objectPosition }} />
    : <div className="absolute inset-0 bg-linear-to-br from-[#302b29] to-[#111010]" aria-hidden="true" />;
}

const specialties = [
  {
    label: "Bodas",
    align: "center 40%",
    desc: "Cobertura completa del día. Desde la preparación hasta el último baile.",
  },
  {
    label: "Parejas",
    align: "center 30%",
    desc: "Sesiones íntimas en estudio o exteriores. Aniversarios, compromisos, amor.",
  },
  {
    label: "Familia",
    align: "center center",
    desc: "Momentos espontáneos, vínculos reales. Un ambiente cómodo para todos.",
  },
  {
    label: "Retrato",
    align: "center 20%",
    desc: "Luz pensada, pose natural, identidad auténtica.",
  },
  {
    label: "Corporativa",
    align: "center 30%",
    desc: "Headshots, equipos, eventos. Imagen que proyecta profesionalismo.",
  },
  {
    label: "Eventos",
    align: "center center",
    desc: "Cobertura dinámica. La energía de cada celebración, capturada.",
  },
  {
    label: "Exteriores",
    align: "center 50%",
    desc: "Luz natural, locaciones auténticas. El mundo como telón de fondo.",
  },
];

const steps = [
  { n: "01", title: "Planificación", note: "Concepto · locación · looks" },
  {
    n: "02",
    title: "Producción",
    note: "Iluminación · composición · dirección",
  },
  { n: "03", title: "Edición", note: "Selección · retoque · color" },
  { n: "04", title: "Entrega", note: "Galería privada · alta resolución" },
];

export default function Servicios() {
  const [galerias, setGalerias] = useState([]);

  useEffect(() => {
    let controller;
    const cargarGalerias = () => {
      if (document.visibilityState !== "visible") return;
      controller?.abort();
      controller = new AbortController();
      fetch(`${API_BASE_URL}/api/galerias`, { signal: controller.signal })
        .then((response) => response.ok ? response.json() : [])
        .then((data) => { if (!controller.signal.aborted && Array.isArray(data)) setGalerias(data); })
        .catch(() => {});
    };
    cargarGalerias();
    window.addEventListener("focus", cargarGalerias);
    document.addEventListener("visibilitychange", cargarGalerias);
    return () => {
      controller?.abort();
      window.removeEventListener("focus", cargarGalerias);
      document.removeEventListener("visibilitychange", cargarGalerias);
    };
  }, []);

  const imagenesPorServicio = useMemo(() => {
    const normalizarUrl = (url) => typeof url === "string" && url.startsWith("/uploads/") ? `${API_BASE_URL}${url}` : url;
    return Object.fromEntries(specialties.map(({ label }) => {
      const galeria = galerias.find((item) => item.activo !== false && item.servicio?.activo !== false && normalizarNombre(item.servicio?.nombre || "") === normalizarNombre(label));
      const imagenes = (galeria?.imagenes || [])
        .filter((item) => item.activo !== false && typeof item.url === "string" && item.url.trim())
        .map((item) => normalizarUrl(item.url));
      return [label, imagenes];
    }));
  }, [galerias]);

  return (
    <Layout>
      <div className="bg-white">
        {/* ── PAGE HEADER ── */}
        <header className="py-20 px-12 pb-12 border-b border-[rgba(26,24,24,0.08)]">
          <p className="t-label mb-6">Servicios</p>

          <h1 className="font-[Fraunces,Georgia,serif] italic font-extralight text-[clamp(3rem,6vw,5.5rem)] tracking-[0.02em] leading-none text-[#1a1818] max-w-175">
            Lo que
            <br />
            fotografiamos
          </h1>
        </header>

        {/* ── SPECIALTIES ── */}
        {specialties.map((s, i) => (
          <section
            key={s.label}
            className="relative h-[clamp(380px,55vw,680px)] overflow-hidden bg-[#1a1818]"
          >
            <ImagenRotativa imagenes={imagenesPorServicio[s.label]} etiqueta={s.label} objectPosition={s.align} />

            {/* Gradient */}
            <div
              className={`absolute inset-0 ${
                i % 2 === 0
                  ? "bg-linear-to-r from-[rgba(12,11,11,0.7)] to-transparent"
                  : "bg-linear-to-l from-[rgba(12,11,11,0.7)] to-transparent"
              }`}
            />

            {/* Text overlay */}
            <div
              className={`absolute top-1/2 -translate-y-1/2 max-w-95 ${
                i % 2 === 0 ? "left-16" : "right-16"
              }`}
            >
              <p className="font-['Inter'] font-normal text-[0.6rem] tracking-[0.28em] uppercase text-[rgba(244,243,240,0.4)] mb-3">
                {String(i + 1).padStart(2, "0")} /{" "}
                {String(specialties.length).padStart(2, "0")}
              </p>

              <h2 className="font-[Fraunces,Georgia,serif] italic font-extralight text-[clamp(2.5rem,5vw,4.5rem)] tracking-[0.04em] text-white leading-none mb-5">
                {s.label}
              </h2>

              <span className="block w-6 h-px bg-[#a51c1c] mb-4" />

              <p className="font-['Inter'] font-light text-[0.8rem] text-[rgba(244,243,240,0.6)] leading-[1.65] tracking-[0.04em]">
                {s.desc}
              </p>
            </div>
          </section>
        ))}

        {/* ── PROCESS ── */}
        <section className="py-24 px-12 bg-white">
          <div className="max-w-340 mx-auto">
            <div className="flex items-baseline justify-between mb-16 flex-wrap gap-4">
              <p className="t-label">¿Cómo trabajamos?</p>

              <Link to="/contacto" className="btn-ghost">
                Agendar sesión
              </Link>
            </div>

            <div className="grid grid-cols-4 border-l border-[rgba(26,24,24,0.1)]">
              {steps.map((s) => (
                <div
                  key={s.n}
                  className="p-8 pr-8 pl-10 border-r border-[rgba(26,24,24,0.1)]"
                >
                  <p className="font-[Fraunces,Georgia,serif] italic font-extralight text-[3rem] text-[rgba(26,24,24,0.08)] leading-none mb-4">
                    {s.n}
                  </p>

                  <h3 className="font-[Fraunces,Georgia,serif] font-light text-[1.2rem] tracking-[0.06em] text-[#1a1818] mb-2">
                    {s.title}
                  </h3>

                  <p className="t-body text-[0.78rem]">{s.note}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── STUDIO RENTAL ── */}
        <section className="relative h-[clamp(400px,55vw,650px)] overflow-hidden bg-[#1a1818]">
          <img
            src="https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?w=1800&h=900&fit=crop&auto=format&q=85"
            alt="Estudio fotográfico profesional Studio13"
            className="absolute inset-0 w-full h-full object-cover opacity-[0.55]"
          />

          <div className="absolute inset-0 bg-linear-to-r from-[rgba(12,11,11,0.85)] from-35% to-transparent to-75%" />

          <div className="absolute top-1/2 -translate-y-1/2 left-16 max-w-110">
            <p className="font-['Inter'] font-normal text-[0.6rem] tracking-[0.28em] uppercase text-[rgba(244,243,240,0.4)] mb-4">
              También disponible
            </p>

            <h2 className="font-[Fraunces,Georgia,serif] italic font-extralight text-[clamp(2rem,4vw,3.8rem)] text-white leading-[1.05] mb-6 tracking-[0.03em]">
              Alquiler de
              <br />
              estudio
            </h2>

            <p className="font-['Inter'] font-light text-[0.82rem] text-[rgba(244,243,240,0.55)] leading-[1.7] mb-8">
              Iluminación profesional, fondos múltiples, área de maquillaje.
              Disponible por hora o día completo para fotógrafos independientes
              y marcas.
            </p>

            <Link to="/paquetes" className="btn-ghost-white">
              Ver tarifas
            </Link>
          </div>
        </section>
      </div>
    </Layout>
  );
}
