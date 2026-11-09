import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:3001").replace(/\/+$/, "");

export default function CampaniaTemporada() {
  const [campania, setCampania] = useState(null);

  useEffect(() => {
    let controller;
    let timerFin;
    const cargar = () => {
      controller?.abort();
      const request = new AbortController();
      controller = request;
      fetch(`${API_BASE_URL}/api/campanias/activa`, { signal: request.signal, cache: "no-store" })
        .then((response) => response.ok ? response.json() : null)
        .then((data) => {
          if (request.signal.aborted) return;
          setCampania(data);
          window.clearTimeout(timerFin);
          if (data?.fin) {
            const demora = new Date(data.fin).getTime() - Date.now();
            if (demora > 0) timerFin = window.setTimeout(() => { setCampania(null); cargar(); }, demora + 50);
          }
        })
        .catch(() => {});
    };

    cargar();
    const actualizacion = window.setInterval(cargar, 30000);
    return () => {
      controller?.abort();
      window.clearInterval(actualizacion);
      window.clearTimeout(timerFin);
    };
  }, []);

  if (!campania) return null;

  return (
    <section className="bg-[#111010] px-6 py-12 sm:px-12 sm:py-16" aria-labelledby="campania-temporada-titulo">
      <div className="mx-auto grid max-w-340 items-center gap-8 lg:grid-cols-2 lg:gap-16">
        <img src={campania.imagenUrl} alt={campania.titulo} className="aspect-[16/10] w-full object-cover" />
        <div className="text-left text-[#e8e6e2]">
          <p className="mb-4 font-['Inter'] text-[0.62rem] tracking-[0.32em] uppercase text-[#a9a5a0]">Temporada especial</p>
          <h2 id="campania-temporada-titulo" className="mb-5 font-[Fraunces,Georgia,serif] text-[clamp(2rem,4vw,3.5rem)] leading-tight font-light text-[#e8e6e2]">{campania.titulo}</h2>
          <p className="mb-8 whitespace-pre-line font-['Inter'] text-sm leading-7 text-[#b5b1ac]">{campania.descripcion}</p>
          <Link
            to={`/contacto?paqueteId=${encodeURIComponent(campania.paqueteId)}`}
            className="inline-flex min-h-11 items-center border border-[#a51c1c] bg-[#a51c1c] px-6 py-3 font-['Inter'] text-xs tracking-[0.14em] text-white no-underline transition-colors hover:border-white hover:bg-transparent"
          >
            Reservar sesión
          </Link>
        </div>
      </div>
    </section>
  );
}
