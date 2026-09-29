import { Link } from "react-router-dom";
import Layout from "../pages/Layout/Layout";

const milestones = [
  {
    year: "2017",
    desc: "Primeras sesiones en exteriores. Una cámara, una visión.",
  },
  {
    year: "2019",
    desc: "Apertura del primer estudio. La comunidad respondió.",
  },
  {
    year: "2021",
    desc: "Equipo de tres. Espacio ampliado. Alquiler habilitado.",
  },
  {
    year: "Hoy",
    desc: "1,200+ sesiones. Cientos de familias felices.",
  },
];

const studioPhotos = [
  {
    src: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=1000&h=700&fit=crop&auto=format&q=85",
    alt: "Fotógrafa trabajando en sesión",
    caption: "Detrás del lente",
  },
  {
    src: "https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?w=800&h=1000&fit=crop&auto=format&q=85",
    alt: "Interior del estudio",
    caption: "El estudio",
  },
  {
    src: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&h=600&fit=crop&auto=format&q=85",
    alt: "Equipo fotográfico",
    caption: "Herramientas de trabajo",
  },
  {
    src: "https://images.unsplash.com/photo-1471341971476-ae15ff5dd4ea?w=800&h=600&fit=crop&auto=format&q=85",
    alt: "Preparación de sesión",
    caption: "Cada detalle importa",
  },
];

export default function Nosotros() {
  return (
    <Layout>
      <div className="bg-white">
        {/* HERO */}
        <section className="relative h-[80vh] min-h-125 overflow-hidden bg-[#1a1818]">
          <img
            src="https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=1800&h=1000&fit=crop&auto=format&q=90"
            alt="Fotógrafo en acción — Studio13"
            className="
            absolute
            inset-0
            w-full
            h-full
            object-cover
            object-[center_25%]
            opacity-[0.62]
          "
          />

          <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(12,11,11,0.85)_0%,transparent_60%)]" />

          <div className="absolute bottom-14 left-8 md:left-12 max-w-130">
            <p className="t-label text-[rgba(244,243,240,0.4)] mb-4">
              Nosotros
            </p>

            <h1 className="font-['Fraunces',Georgia,serif] italic font-extralight text-[clamp(2.5rem,5.5vw,5rem)] text-white tracking-[0.04em] leading-none">
              Somos Studio13
            </h1>
          </div>
        </section>

        {/* INTRO */}
        <section className="px-8 md:px-12 py-24 max-w-340 mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 xl:gap-20 items-start">
            <div>
              <p className="t-label mb-8">La historia</p>

              <h2 className="font-['Fraunces',Georgia,serif] italic font-extralight text-[clamp(2rem,3.5vw,3.2rem)] text-[#1a1818] leading-[1.1] mb-8">
                Una historia de
                <br />
                pasión y arte
              </h2>

              <span className="accent-rule" />

              <p className="t-body max-w-100 mb-5">
                Studio13 nació en 2017 de la convicción de que cada familia,
                cada pareja y cada momento merecen ser inmortalizados con arte y
                dedicación real.
              </p>

              <p className="t-body max-w-100 mb-5">
                Lo que comenzó como sesiones en parques y playas se convirtió en
                un estudio fotográfico profesional completo — equipado con
                iluminación de primer nivel y disponible también para alquiler.
              </p>

              <p className="t-body max-w-100">
                Hoy somos tres fotógrafos especializados con un espacio que
                produce desde retratos íntimos hasta campañas comerciales.
              </p>
            </div>

            {/* MILESTONES */}
            <div className="pt-4">
              {milestones.map((milestone, index) => (
                <div
                  key={milestone.year}
                  className={`
                  grid
                  grid-cols-[80px_1fr]
                  gap-6
                  items-start
                  pb-8
                  ${index > 0 ? "pt-8" : ""}
                  ${
                    index < milestones.length - 1
                      ? "border-b border-[rgba(26,24,24,0.08)]"
                      : ""
                  }
                `}
                >
                  <p
                    className={`
                    font-['Fraunces',Georgia,serif]
                    italic
                    font-extralight
                    text-[1.5rem]
                    leading-none
                    ${
                      milestone.year === "Hoy"
                        ? "text-[#a51c1c]"
                        : "text-[#c8c5c0]"
                    }
                  `}
                  >
                    {milestone.year}
                  </p>

                  <p className="t-body pt-[0.15rem]">{milestone.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* BTS PHOTO GRID */}
        <section className="bg-[#111010] px-8 md:px-12 py-12">
          <p className="t-label text-[#4a4846] mb-8">
            El estudio · Detrás de cámaras
          </p>

          <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr] md:grid-rows-[400px_280px] gap-0.5">
            {/* MAIN PHOTO */}
            <div className="md:row-span-2 overflow-hidden bg-[#2a2826]">
              <img
                src={studioPhotos[0].src}
                alt={studioPhotos[0].alt}
                className="
                w-full
                h-full
                object-cover
                block
                opacity-[0.85]
                transition-transform
                duration-800
                ease-out
                hover:scale-[1.04]
              "
              />
            </div>

            {/* OTHER PHOTOS */}
            {studioPhotos.slice(1).map((photo) => (
              <div
                key={photo.src}
                className="overflow-hidden bg-[#2a2826] relative"
              >
                <img
                  src={photo.src}
                  alt={photo.alt}
                  className="
                  w-full
                  h-full
                  object-cover
                  block
                  opacity-[0.8]
                  transition-transform
                  duration-800
                  ease-out
                  hover:scale-[1.05]
                "
                />

                <div className="absolute bottom-3 left-3">
                  <p className="font-['Inter',sans-serif] font-light text-[0.6rem] tracking-[0.18em] uppercase text-[rgba(244,243,240,0.4)]">
                    {photo.caption}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="px-8 md:px-12 py-20 border-t border-[rgba(26,24,24,0.08)] text-center">
          <p className="t-label mb-8">¿Trabajamos juntos?</p>

          <h2 className="font-['Fraunces',Georgia,serif] italic font-extralight text-[clamp(2rem,4vw,3.5rem)] text-[#1a1818] mb-10 tracking-[0.03em]">
            Tu historia merece
            <br />
            ser contada bien
          </h2>

          <Link to="/contacto" className="btn-ghost">
            Agendar sesión
          </Link>
        </section>
      </div>
    </Layout>
  );
}
