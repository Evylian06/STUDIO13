import { useState } from "react";

export default function Testimonios() {
  const [activeT, setActiveT] = useState(0);

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
    <section className="py-20 px-12 pb-24 bg-[#111010]">
      <div className="max-w-340 mx-auto">

        <p className="font-['Inter'] text-[0.62rem] tracking-[0.32em] uppercase text-[#4a4846] mb-12">
          Testimonios
        </p>

        <div className="grid grid-cols-[1fr_1.6fr] gap-20 items-start">

          <div>
            <p className="font-[Fraunces,Georgia,serif] italic font-extralight text-[clamp(1.4rem,2.5vw,2rem)] text-[#e8e6e2] leading-[1.45] tracking-[0.02em] mb-8">
              &ldquo;{testimonials[activeT].text}&rdquo;
            </p>

            <p className="font-['Inter'] font-light text-[0.78rem] text-[#5a5856] tracking-widest">
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
                  className={`font-['Inter'] font-normal text-[0.75rem] tracking-wider mb-0.5 transition-colors duration-200 ${
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
  );
}