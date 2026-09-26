import { useState } from "react";
import Layout from "../pages/Layout/Layout.jsx";
import studio13Logo from "../assets/studio13.PNG";
import { Link } from "react-router-dom";

const Inicio = () => {
  const [activeT, setActiveT] = useState(0);
  const categories = [
    {
      label: "Parejas",
      img: "https://images.unsplash.com/photo-1529636798458-92182e662485?w=900&h=1100&fit=crop&auto=format&q=85",
    },
    {
      label: "Bodas",
      img: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=900&h=1100&fit=crop&auto=format&q=85",
    },
    {
      label: "Familia",
      img: "https://images.unsplash.com/photo-1609220136736-443140cffec6?w=900&h=700&fit=crop&auto=format&q=85",
    },
    {
      label: "Retrato",
      img: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=900&h=1100&fit=crop&auto=format&q=85",
    },
    {
      label: "Corporativa",
      img: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=900&h=700&fit=crop&auto=format&q=85",
    },
    {
      label: "Exteriores",
      img: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=900&h=1100&fit=crop&auto=format&q=85",
    },
  ];

  const testimonials = [
    {
      name: "Andrea Ramírez",
      role: "Boda — dic. 2024",
      text: "Las fotos de nuestra boda superaron todo lo que imaginamos. Studio13 capturó cada detalle con una sensibilidad que nos dejó sin palabras.",
    },
    {
      name: "Carlos Méndez",
      role: "Corporativa — oct. 2024",
      text: "Profesionalismo absoluto. Las imágenes reflejan exactamente la identidad de nuestra empresa y el equipo fue un placer en el set.",
    },
    {
      name: "Valeria Torres",
      role: "Sesión Familiar — ago. 2024",
      text: "Capturaron la esencia de mi familia de manera tan natural que cada foto parece un instante robado a la vida real.",
    },
  ];

  return (
    <Layout>
      <div className="bg-white">
        {/* ── HERO ── */}
        <section className="relative h-svh min-h-[600px] overflow-hidden bg-[#0c0b0b]">
          <img
            src="https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=2000&h=1300&fit=crop&auto=format&q=90"
            alt="Studio 13 — fotografía profesional"
            className="absolute inset-0 w-full h-full object-cover object-[center_30%] opacity-70"
          />
          <div className="absolute bottom-0 left-0 right-0 h-[55%] bg-gradient-to-t from-[rgba(12,11,11,0.88)] to-transparent" />

          <div className="absolute bottom-16 left-12 max-w-[560px]">
            <p className="font-['Inter'] font-normal text-[0.62rem] tracking-[0.32em] uppercase text-[rgba(244,243,240,0.5)] mb-[1.1rem]">
              Puerto Cito, Costa Rica — Est. 2017
            </p>
            <img
              src={studio13Logo}
              alt="Studio13"
              className="h-10 w-auto object-contain mb-8"
            />
            <p className="font-['Inter'] font-light text-[0.82rem] tracking-[0.12em] text-[rgba(244,243,240,0.6)] leading-[1.7] max-w-[340px] mb-8">
              Fotografía profesional que convierte momentos en imágenes que
              duran para siempre.
            </p>
            <div className="flex gap-8 items-center">
              <Link
                to="/portafolio"
                className="inline-block font-['Inter'] text-[0.7rem] tracking-[0.18em] uppercase text-[rgba(244,243,240,0.8)] border border-[rgba(244,243,240,0.25)] px-6 py-3 transition-all duration-300 hover:bg-[#f4f3f0] hover:text-[#0c0b0b] hover:border-[#f4f3f0]"
              >
                Ver portafolio
              </Link>
              <Link
                to="/paquetes"
                className="inline-block font-['Inter'] text-[0.7rem] tracking-[0.18em] uppercase text-[rgba(244,243,240,0.8)] border border-[rgba(244,243,240,0.25)] px-6 py-3 transition-all duration-300 hover:bg-[#f4f3f0] hover:text-[#0c0b0b] hover:border-[#f4f3f0]"
              >
                Paquetes
              </Link>
            </div>
          </div>

          <div className="absolute bottom-8 right-12 flex flex-col items-center gap-2">
            <div className="w-px h-12 bg-gradient-to-b from-transparent to-[rgba(244,243,240,0.35)]" />
            <p className="font-['Inter'] text-[0.58rem] tracking-[0.2em] uppercase text-[rgba(244,243,240,0.3)] [writing-mode:vertical-rl]">
              scroll
            </p>
          </div>
        </section>

        <section className="min-h-[720px] py-24 px-8 md:px-12 max-w-[1360px] mx-auto flex items-center">
          <div className="w-full grid grid-cols-1 xl:grid-cols-[1fr_1fr] gap-10 xl:gap-12 items-center">
            {/* Texto */}
            <div className="w-full flex flex-col justify-center items-center text-left">
              <div className="w-full">
                <p className="font-['Inter'] text-[0.62rem] tracking-[0.32em] uppercase text-[#4a4846] mb-8">
                  Nuestra especialidad
                </p>
              </div>

              <div className="w-full">
                <h2 className="font-['Fraunces',Georgia,serif] italic font-[200] text-[clamp(3.5rem,5vw,5.5rem)] leading-[0.95] tracking-[-0.02em] text-[#1a1818] mb-10">
                  Fotografías
                  <span className="block">que</span>
                  <span className="block">cuentan</span>
                  <span className="block">tu historia</span>
                </h2>
              </div>

              <div className="w-full">
                <span className="block w-10 h-px bg-[#a51c1c] mb-8" />
              </div>

              <div className="w-full">
                <p className="font-['Inter'] font-light text-[0.95rem] leading-[1.9] tracking-[0.01em] text-[#5a5856] max-w-[360px] mb-10">
                  Desde sesiones íntimas en nuestro estudio equipado hasta
                  exteriores y eventos. Cada encuadre, deliberado.
                </p>
              </div>

              <div className="w-full">
                <Link
                  to="/servicios"
                  className="inline-block font-['Inter'] text-[0.7rem] tracking-[0.18em] uppercase text-[#1a1818] border-b border-[#1a1818] pb-3 transition-all duration-300 hover:text-[#a51c1c] hover:border-[#a51c1c]"
                >
                  Conocer servicios
                </Link>
              </div>
            </div>

            {/* Imágenes */}
            <div className="grid grid-cols-[1.15fr_1fr] gap-3 w-full max-w-[780px] h-[520px]">
              {/* Imagen principal */}
              <div className="relative overflow-hidden h-[520px]">
                <img
                  src="https://images.unsplash.com/photo-1529636798458-92182e662485?w=900&h=1100&fit=crop&auto=format&q=85"
                  alt="Boda con ramo"
                  className="w-full h-full object-cover object-center"
                />
              </div>

              {/* Columna derecha */}
              <div className="grid grid-rows-2 gap-3 h-[520px]">
                <div className="relative overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=900&h=900&fit=crop&auto=format&q=85"
                    alt="Boda exterior"
                    className="w-full h-full object-cover object-center"
                  />
                </div>

                <div className="relative overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=900&h=1100&fit=crop&auto=format&q=85"
                    alt="Retrato"
                    className="w-full h-full object-cover object-[50%_30%]"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* ── CATEGORIES ── */}
        <section className="bg-[#111010]">
          <div className="px-12 pt-12 pb-6">
            <p className="font-['Inter'] text-[0.62rem] tracking-[0.32em] uppercase text-[#4a4846]">
              Categorías
            </p>
          </div>

          <div className="grid grid-cols-[1.6fr_1fr_1fr] grid-rows-[480px_340px] gap-0.5">
            {categories.map((cat, i) => (
              <Link
                key={cat.label}
                to="/portafolio"
                className={`relative overflow-hidden block no-underline bg-[#1a1818] group ${i === 0 ? "row-span-2" : ""}`}
              >
                <img
                  src={cat.img}
                  alt={cat.label}
                  className="w-full h-full object-cover block transition-all duration-700 ease-out opacity-75 group-hover:scale-105 group-hover:opacity-90"
                />
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[rgba(12,11,11,0.7)] to-transparent">
                  <p
                    className={`font-['Fraunces',Georgia,serif] italic font-[200] text-white tracking-[0.04em] ${i === 0 ? "text-[2.2rem]" : "text-[1.4rem]"}`}
                  >
                    {cat.label}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          <div className="px-12 py-8 flex justify-end">
            <Link
              to="/portafolio"
              className="inline-block font-['Inter'] text-[0.7rem] tracking-[0.18em] uppercase text-[rgba(244,243,240,0.8)] border border-[rgba(244,243,240,0.25)] px-6 py-3 transition-all duration-300 hover:bg-[#f4f3f0] hover:text-[#0c0b0b] hover:border-[#f4f3f0]"
            >
              Ver portafolio completo
            </Link>
          </div>
        </section>
        {/* ── STATEMENT ── */}
        <section className="py-32 px-12 max-w-[900px] mx-auto text-center">
          <p className="font-['Inter'] text-[0.62rem] tracking-[0.32em] uppercase text-[#4a4846] mb-10">
            Filosofía
          </p>
          <blockquote className="font-['Fraunces',Georgia,serif] italic font-[200] text-[clamp(1.8rem,3.5vw,3.2rem)] leading-[1.25] tracking-[0.02em] text-[#1a1818]">
            &ldquo;Cada fotografía es una forma de volver a vivir.&rdquo;
          </blockquote>
          <span className="block w-10 h-px bg-[#a51c1c] mx-auto my-8" />
          <p className="font-['Inter'] font-light text-[0.875rem] leading-relaxed tracking-wide text-[#5a5856] max-w-[420px] mx-auto">
            En Studio13 creamos imágenes que resisten el paso del tiempo. No
            poses forzadas — momentos auténticos, luz cuidada, historias
            verdaderas.
          </p>
        </section>
        {/* ── TESTIMONIALS ── */}
        <section className="py-20 px-12 pb-24 bg-[#111010]">
          <div className="max-w-[1360px] mx-auto">
            <p className="font-['Inter'] text-[0.62rem] tracking-[0.32em] uppercase text-[#4a4846] mb-12">
              Testimonios
            </p>

            <div className="grid grid-cols-[1fr_1.6fr] gap-20 items-start">
              <div>
                <p className="font-['Fraunces',Georgia,serif] italic font-[200] text-[clamp(1.4rem,2.5vw,2rem)] text-[#e8e6e2] leading-[1.45] tracking-[0.02em] mb-8">
                  &ldquo;{testimonials[activeT].text}&rdquo;
                </p>
                <p className="font-['Inter'] font-light text-[0.78rem] text-[#5a5856] tracking-[0.1em]">
                  — {testimonials[activeT].name}
                </p>
                <p className="font-['Inter'] font-light text-[0.7rem] text-[#3a3836] tracking-[0.08em] mt-1">
                  {testimonials[activeT].role}
                </p>
                <div className="flex gap-2 mt-10">
                  {testimonials.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveT(i)}
                      className={`h-px border-none cursor-pointer transition-all duration-300 ${
                        i === activeT
                          ? "w-6 bg-[#a51c1c]"
                          : "w-1.5 bg-[#3a3836]"
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-px">
                {testimonials.map((t, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveT(i)}
                    className={`border-none border-l-2 text-left cursor-pointer transition-all duration-200 py-5 px-6 ${
                      i === activeT
                        ? "bg-[rgba(244,243,240,0.04)] border-l-[#a51c1c]"
                        : "bg-transparent border-l-[#1e1c1c]"
                    }`}
                  >
                    <p
                      className={`font-['Inter'] font-normal text-[0.75rem] tracking-[0.05em] mb-0.5 transition-colors duration-200 ${
                        i === activeT ? "text-[#e8e6e2]" : "text-[#5a5856]"
                      }`}
                    >
                      {t.name}
                    </p>
                    <p className="font-['Inter'] font-light text-[0.65rem] text-[#3a3836] tracking-[0.08em]">
                      {t.role}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
        {/* ── CTA ── */}
        <section className="py-28 px-12 text-center">
          <p className="font-['Inter'] text-[0.62rem] tracking-[0.32em] uppercase text-[#4a4846] mb-8">
            ¿Listo para comenzar?
          </p>
          <h2 className="font-['Fraunces',Georgia,serif] italic font-[200] text-[clamp(2rem,4vw,3.8rem)] tracking-[0.03em] text-[#1a1818] mb-10 leading-[1.1]">
            Agenda tu sesión
          </h2>
          <Link
            to="/contacto"
            className="inline-block font-['Inter'] text-[0.7rem] tracking-[0.18em] uppercase text-[#1a1818] border border-[rgba(26,24,24,0.25)] px-6 py-3 transition-all duration-300 hover:bg-[#1a1818] hover:text-white hover:border-[#1a1818]"
          >
            Reservar ahora
          </Link>
        </section>
      </div>
    </Layout>
  );
};

export default Inicio;
