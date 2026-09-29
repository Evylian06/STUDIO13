import { useState } from "react";
import Layout from "../pages/Layout/Layout";

const filters = [
  "Todos",
  "Corporativas",
  "Quinceañero",
  "Fotos Familiares",
  "Embarazo",
  "Parejas",
  "Snacks Queik",
  "Eventos",
  "Exteriores",
  "Talleres",
];

const photos = [
  {
    id: 1,
    cat: "Corporativas",
    img: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&fit=crop&auto=format&q=85",
    h: 400,
  },
  {
    id: 2,
    cat: "Quinceañero",
    img: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&fit=crop&auto=format&q=85",
    h: 520,
  },
  {
    id: 3,
    cat: "Fotos Familiares",
    img: "https://images.unsplash.com/photo-1609220136736-443140cffec6?w=800&fit=crop&auto=format&q=85",
    h: 380,
  },
  {
    id: 4,
    cat: "Embarazo",
    img: "https://images.unsplash.com/photo-1535183454426-54b9f38bf69a?w=800&fit=crop&auto=format&q=85",
    h: 560,
  },
  {
    id: 5,
    cat: "Parejas",
    img: "https://images.unsplash.com/photo-1529636798458-92182e662485?w=800&fit=crop&auto=format&q=85",
    h: 600,
  },
  {
    id: 6,
    cat: "Snacks Queik",
    img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&fit=crop&auto=format&q=85",
    h: 380,
  },
  {
    id: 7,
    cat: "Eventos",
    img: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&fit=crop&auto=format&q=85",
    h: 360,
  },
  {
    id: 8,
    cat: "Exteriores",
    img: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&fit=crop&auto=format&q=85",
    h: 520,
  },
  {
    id: 9,
    cat: "Talleres",
    img: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&fit=crop&auto=format&q=85",
    h: 420,
  },
  {
    id: 10,
    cat: "Corporativas",
    img: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&fit=crop&auto=format&q=85",
    h: 380,
  },
  {
    id: 11,
    cat: "Quinceañero",
    img: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&fit=crop&auto=format&q=85",
    h: 560,
  },
  {
    id: 12,
    cat: "Fotos Familiares",
    img: "https://images.unsplash.com/photo-1581952976147-5a2d15560349?w=800&fit=crop&auto=format&q=85",
    h: 360,
  },
  {
    id: 13,
    cat: "Embarazo",
    img: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=800&fit=crop&auto=format&q=85",
    h: 500,
  },
  {
    id: 14,
    cat: "Parejas",
    img: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800&fit=crop&auto=format&q=85",
    h: 580,
  },
  {
    id: 15,
    cat: "Snacks Queik",
    img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&fit=crop&auto=format&q=85",
    h: 360,
  },
  {
    id: 16,
    cat: "Eventos",
    img: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&fit=crop&auto=format&q=85",
    h: 380,
  },
  {
    id: 17,
    cat: "Exteriores",
    img: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&fit=crop&auto=format&q=85",
    h: 400,
  },
  {
    id: 18,
    cat: "Talleres",
    img: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&fit=crop&auto=format&q=85",
    h: 440,
  },
];

export default function Portafolio() {
  const [active, setActive] = useState("Todos");
  const [lightbox, setLightbox] = useState(null);

  const filtered =
    active === "Todos"
      ? photos
      : photos.filter((photo) => photo.cat === active);

  return (
    <Layout>
      <div className="bg-white">
        {/* HEADER */}
        <header className="px-8 md:px-12 pt-20 pb-10 border-b border-[rgba(26,24,24,0.08)]">
          <p className="t-label mb-6">Portafolio</p>

          <h1 className="font-[Fraunces,Georgia,serif] italic font-extralight text-[clamp(3rem,6vw,5.5rem)] tracking-[0.02em] leading-none text-[#1a1818]">
            Galería
          </h1>
        </header>

        {/* FILTERS */}
        <div className="sticky top-14.5 z-50 bg-white border-b border-[rgba(26,24,24,0.08)] px-8 md:px-12 flex gap-0 overflow-x-auto">
          {filters.map((filter) => (
            <button key={filter} onClick={() => setActive(filter)}
              className={`shrink-0 font-['Inter'] font-normal text-[0.65rem] tracking-[0.22em] uppercase bg-transparent border-0 border-b px-5 py-[1.1rem] cursor-pointer whitespace-nowrap transition-colors duration-200
              ${
                active === filter
                  ? "text-[#1a1818] border-[#a51c1c]"
                  : "text-[#aaa8a4] border-transparent"
              }
            `}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* MASONRY */}
        <div className="px-8 md:px-12 pt-10 pb-16">
          <div className="columns-[280px] gap-6">
            {filtered.map((photo) => (
              <div key={photo.id} onClick={() => setLightbox(photo.img)} className=" break-inside-avoid mb-6 overflow-hidden cursor-zoom-in bg-[#dedad4] relative"
              >
                <img src={photo.img} alt={photo.cat} loading="lazy"style={{ height: `${photo.h}px` }}
                  className="w-full object-cover block opacity-[0.92] transition-all duration-700 ease-out hover:scale-[1.03] hover:opacity-100"
                />

                {/* CATEGORY LABEL */}
                <div className="absolute bottom-0 left-0 right-0 px-4 pt-10 pb-3 bg-[linear-gradient(to_top,rgba(12,11,11,0.45)_0%,transparent_100%)] opacity-0 transition-opacity duration-300 hover:opacity-100"
                >
                  <p className="font-['Inter'] font-normal text-[0.6rem] tracking-[0.2em] uppercase text-[rgba(244,243,240,0.7)]">
                    {photo.cat}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <p className="t-body text-center py-20">
              No hay imágenes en esta categoría.
            </p>
          )}
        </div>

        {/* LIGHTBOX */}
        {lightbox && (
          <div onClick={() => setLightbox(null)} className=" fixed inset-0 z-200 bg-[rgba(12,11,11,0.97)] flex items-center justify-center cursor-zoom-out"
          >
            <button
              onClick={() => setLightbox(null)}
              className="absolute top-7 right-8 bg-transparent border-0 font-['Inter'] text-[0.65rem] tracking-[0.2em] uppercase text-[rgba(244,243,240,0.4)] cursor-pointer"
            >
              cerrar ×
            </button>

            <img src={lightbox.replace("w=800", "w=1400")} alt="Fotografía ampliada" onClick={(event) => event.stopPropagation()} className=" max-w-[90vw] max-h-[90vh] object-contain block"
            />
          </div>
        )}
      </div>
    </Layout>
  );
}
