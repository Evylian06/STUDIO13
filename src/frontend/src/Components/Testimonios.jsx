import { useEffect } from "react";

const ELFSIGHT_SCRIPT_ID = "elfsight-platform-script";
const ELFSIGHT_SCRIPT_URL = "https://elfsightcdn.com/platform.js";

function loadElfsightPlatform() {
  if (document.getElementById(ELFSIGHT_SCRIPT_ID)) return;

  const script = document.createElement("script");
  script.id = ELFSIGHT_SCRIPT_ID;
  script.src = ELFSIGHT_SCRIPT_URL;
  script.async = true;
  document.head.appendChild(script);
}

export default function Testimonios() {
  useEffect(() => {
    loadElfsightPlatform();
  }, []);

  return (
    <section className="overflow-x-clip bg-[#111010] px-6 py-20 pb-24 sm:px-12" aria-labelledby="testimonios-title">
      <div className="mx-auto grid max-w-340 min-w-0 grid-cols-1 items-center gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.35fr)] lg:gap-16">
        <div className="min-w-0 text-left">
          <p className="mb-5 font-['Inter'] text-[0.62rem] tracking-[0.32em] uppercase text-[#a51c1c]">
            TESTIMONIOS
          </p>
          <h2 id="testimonios-title" className="mb-5 font-[Fraunces,Georgia,serif] text-[clamp(2rem,4vw,3.25rem)] leading-[1.12] font-light text-[#e8e6e2]">
            Lo que dicen nuestros clientes
          </h2>
          <p className="mb-8 max-w-xl font-['Inter'] text-sm leading-7 text-[#a8a5a1]">
            Conoce la experiencia de quienes eligieron nuestro servicio para sus sesiones de fotos y eventos. Estas reseñas fueron publicadas en nuestra ficha de Google.
          </p>
          <p className="mb-4 font-['Inter'] text-sm leading-6 text-[#e8e6e2]">
            ¿Ya tuviste una sesión con nosotros? Cuéntanos cómo fue tu experiencia.
          </p>
          <a
            href="https://www.google.com/maps/place/Studio+13+by+Maria+Meza/@-8.3679045,-74.5471052,18.54z/data=!4m6!3m5!1s0x91a3bd71b180b59d:0x6da26e28a71e8669!8m2!3d-8.369563!4d-74.5484012!16s%2Fg%2F11qmnfq8gw"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center border border-[#a51c1c] px-5 py-3 font-['Inter'] text-xs tracking-[0.12em] text-[#e8e6e2] transition-colors hover:bg-[#a51c1c]"
          >
            Ver nuestra ficha en Google Maps
          </a>
        </div>

        <div className="min-w-0 w-full">
          <div
            className="elfsight-app-e5983bb1-6cd2-4759-9bd9-75dede141b79 w-full min-w-0"
            data-elfsight-app-lazy
          />
        </div>
      </div>
    </section>
  );
}
