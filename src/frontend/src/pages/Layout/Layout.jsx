import { useState, useEffect } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import studio13Logo from "../../assets/studio13.PNG";

const navLinks = [
  { to: "/", label: "Inicio" },
  { to: "/servicios", label: "Servicios" },
  { to: "/portafolio", label: "Portafolio" },
  { to: "/paquetes", label: "Paquetes" },
  { to: "/nosotros", label: "Nosotros" },
  { to: "/contacto", label: "Contacto" },
];

export default function Layout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";
  const onLight = !isHome;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* ── NAV ── */}
      <nav
        className={[
          "fixed top-0 left-0 right-0 z-[100] border-b transition-all duration-400",
          isHome
            ? scrolled
              ? "bg-[rgba(12,11,11,0.97)] border-white/5 backdrop-blur-md"
              : "bg-transparent border-transparent"
            : "bg-white border-black/[0.08]",
        ].join(" ")}
      >
        <div className="max-w-[1360px] mx-auto px-10 h-[58px] flex items-center justify-between">
          {/* Logo */}
          <NavLink to="/" className="no-underline flex items-baseline">
            <img
              src={studio13Logo}
              alt="Studio13"
              className="h-10 w-auto object-contain"
            />
          </NavLink>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) =>
                  [
                    "font-['Inter'] text-[0.65rem] tracking-[0.22em] uppercase no-underline transition-all duration-200",
                    isActive
                      ? "text-[#a51c1c] opacity-100"
                      : onLight
                        ? "text-[#1a1818] opacity-75 hover:opacity-100"
                        : "text-white opacity-75 hover:opacity-100",
                  ].join(" ")
                }
              >
                {link.label}
              </NavLink>
            ))}

            <NavLink
              to="/contacto"
              className={[
                "font-['Inter'] text-[0.65rem] tracking-[0.22em] uppercase no-underline pb-0.5 border-b border-[#a51c1c] transition-colors duration-200",
                onLight ? "text-[#1a1818]" : "text-white",
              ].join(" ")}
            >
              Reservar
            </NavLink>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden flex flex-col gap-[5px] p-1 bg-transparent border-0 cursor-pointer"
            aria-label="Menú"
          >
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className={[
                  "block w-[22px] h-px transition-all duration-250",
                  onLight ? "bg-[#1a1818]" : "bg-white",
                  i === 1 && menuOpen ? "opacity-0" : "",
                  i === 0 && menuOpen ? "rotate-45 translate-y-[6px]" : "",
                  i === 2 && menuOpen ? "-rotate-45 -translate-y-[6px]" : "",
                ].join(" ")}
              />
            ))}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-black/[0.08] px-10 pt-6 pb-8">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) =>
                  [
                    "block font-['Inter'] text-[0.7rem] tracking-[0.22em] uppercase no-underline py-3 border-b border-black/[0.06]",
                    isActive ? "text-[#a51c1c]" : "text-[#1a1818]",
                  ].join(" ")
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        )}
      </nav>

      {/* ── PAGE ── */}
      <main className={`flex-1 ${isHome ? "pt-0" : "pt-[58px]"}`}>
        {children ?? <Outlet />}
      </main>

      {/* ── FOOTER ── */}
      <footer className="bg-[#111010] text-white mt-auto">
        <div className="max-w-[1360px] mx-auto px-10 pt-16 pb-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] gap-12">
          <div>
            <div className="font-['Fraunces',Georgia,serif] italic font-[200] text-[1.8rem] mb-5 tracking-[0.04em]">
              <img src={studio13Logo} alt="Studio13" className="h-10 w-auto object-contain" />
            </div>
            <p className="font-['Inter'] font-light text-[0.875rem] leading-[1.8] tracking-wide text-[#5a5856] max-w-[260px]">
              Cada imagen es una forma de volver a vivir. Puerto Cito, Costa
              Rica.
            </p>
          </div>

          {[
            {
              label: "Páginas",
              links: navLinks.map((l) => ({ href: l.to, text: l.label })),
            },
            {
              label: "Contacto",
              links: [
                { href: "https://wa.me/50688862187", text: "+506 8886‑2187" },
                {
                  href: "mailto:studio13@gmail.com",
                  text: "studio13@gmail.com",
                },
                { href: "#", text: "Puerto Cito, CR" },
              ],
            },
            {
              label: "Horario",
              links: [
                { href: "#", text: "L–V  8–18 h" },
                { href: "#", text: "Sáb  8–16 h" },
                { href: "#", text: "Dom  con cita" },
              ],
            },
          ].map((col) => (
            <div key={col.label}>
              <p className="font-['Inter'] text-[0.62rem] tracking-[0.32em] uppercase text-[#4a4846] mb-5">
                {col.label}
              </p>
              <div className="flex flex-col gap-2.5">
                {col.links.map((l) => (
                  <a
                    key={l.text}
                    href={l.href}
                    className="font-['Inter'] font-light text-[0.8rem] text-[#7a7875] no-underline transition-colors duration-200 hover:text-white"
                  >
                    {l.text}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-white/[0.06] px-10 py-5 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="font-['Inter'] font-light text-[0.7rem] text-[#3a3836] tracking-[0.05em]">
            © 2025 Studio13
          </p>
          <p className="font-['Inter'] font-light text-[0.7rem] text-[#3a3836] tracking-[0.05em]">
            Fotografía Profesional · Costa Rica
          </p>
        </div>
      </footer>
    </div>
  );
}
