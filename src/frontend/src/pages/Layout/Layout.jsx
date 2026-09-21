
import { useState, useEffect } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router'

const navLinks = [
  { to: '/', label: 'Inicio' },
  { to: '/servicios', label: 'Servicios' },
  { to: '/portafolio', label: 'Portafolio' },
  { to: '/paquetes', label: 'Paquetes' },
  { to: '/nosotros', label: 'Nosotros' },
  { to: '/contacto', label: 'Contacto' },
]

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const isHome = location.pathname === '/'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMenuOpen(false) }, [location.pathname])

  // On home: nav is transparent over the hero until scrolled, then opaque dark.
  // On other pages: nav is always white with dark text.
  const onLight = !isHome
  const navBg = isHome
    ? scrolled ? 'rgba(12,11,11,0.97)' : 'transparent'
    : '#ffffff'
  const textColor = onLight ? '#1a1818' : '#ffffff'
  const borderColor = onLight ? 'rgba(26,24,24,0.08)' : scrolled ? 'rgba(255,255,255,0.06)' : 'transparent'

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff' }}>

      {/* ── NAV ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: navBg,
        borderBottom: `1px solid ${borderColor}`,
        backdropFilter: (isHome && scrolled) ? 'blur(12px)' : 'none',
        transition: 'background 0.4s, border-color 0.4s',
      }}>
        <div style={{
          maxWidth: 1360, margin: '0 auto',
          padding: '0 2.5rem',
          height: 58,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>

          {/* Logo */}
          <NavLink to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
             <img src="/src/assets/studio13.png" alt="Studio13" className="w-25 h-25 object-cover"/>
          </NavLink>

          {/* Desktop links */}
          <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }} className="hide-sm">
            {navLinks.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                style={({ isActive }) => ({
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400,
                  fontSize: '0.65rem',
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  color: isActive ? '#a51c1c' : textColor,
                  textDecoration: 'none',
                  opacity: isActive ? 1 : 0.75,
                  transition: 'color 0.2s, opacity 0.2s',
                })}
                onMouseEnter={e => { e.currentTarget.style.opacity = '1' }}
                onMouseLeave={e => {}}
              >
                {link.label}
              </NavLink>
            ))}
            <NavLink
              to="/contacto"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                fontSize: '0.65rem',
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: textColor,
                textDecoration: 'none',
                paddingBottom: '2px',
                borderBottom: '1px solid #a51c1c',
                transition: 'color 0.2s',
              }}
            >
              Reservar
            </NavLink>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="show-sm"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              display: 'none', flexDirection: 'column', gap: 5, padding: 4,
            }}
            aria-label="Menú"
          >
            {[0, 1, 2].map(i => (
              <span key={i} style={{
                display: 'block', width: 22, height: 1,
                background: textColor,
                transition: 'all 0.25s',
                opacity: i === 1 && menuOpen ? 0 : 1,
                transform: i === 0 && menuOpen ? 'rotate(45deg) translate(4px, 4px)'
                  : i === 2 && menuOpen ? 'rotate(-45deg) translate(4px, -4px)' : 'none',
              }} />
            ))}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div style={{
            background: '#ffffff',
            borderTop: '1px solid rgba(26,24,24,0.08)',
            padding: '1.5rem 2.5rem 2rem',
          }}>
            {navLinks.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                style={({ isActive }) => ({
                  display: 'block',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400,
                  fontSize: '0.7rem',
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  color: isActive ? '#a51c1c' : '#1a1818',
                  textDecoration: 'none',
                  padding: '0.75rem 0',
                  borderBottom: '1px solid rgba(26,24,24,0.06)',
                })}
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        )}
      </nav>

      <style>{`
        @media (max-width: 768px) {
          .hide-sm { display: none !important; }
          .show-sm { display: flex !important; }
        }
        @media (min-width: 769px) {
          .hide-sm { display: flex !important; }
          .show-sm { display: none !important; }
        }
      `}</style>

      {/* ── PAGE ── */}
      <div style={{ paddingTop: isHome ? 0 : 58 }}>
        <Outlet />
      </div>

      {/* ── FOOTER ── */}
      <footer style={{
        background: '#111010',
        color: '#ffffff',
      }}>
        <div style={{
          maxWidth: 1360, margin: '0 auto',
          padding: '4rem 2.5rem 2.5rem',
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr 1fr',
          gap: '3rem',
        }}>
          <div>
            <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontStyle: 'italic', fontWeight: 200, fontSize: '1.8rem', marginBottom: '1.25rem', letterSpacing: '0.04em' }}>
              <span style={{ color: '#ffffff' }}>Studio</span>
              <span style={{ color: '#a51c1c' }}>13</span>
            </div>
            <p className="t-body" style={{ color: '#5a5856', maxWidth: 260, lineHeight: 1.8 }}>
              Cada imagen es una forma de volver a vivir. Puerto Cito, Costa Rica.
            </p>
          </div>

          {[
            {
              label: 'Páginas',
              links: navLinks.map(l => ({ href: l.to, text: l.label })),
            },
            {
              label: 'Contacto',
              links: [
                { href: 'https://wa.me/50688862187', text: '+506 8886‑2187' },
                { href: 'mailto:studio13@gmail.com', text: 'studio13@gmail.com' },
                { href: '#', text: 'Puerto Cito, CR' },
              ],
            },
            {
              label: 'Horario',
              links: [
                { href: '#', text: 'L–V  8–18 h' },
                { href: '#', text: 'Sáb  8–16 h' },
                { href: '#', text: 'Dom  con cita' },
              ],
            },
          ].map(col => (
            <div key={col.label}>
              <p className="t-label" style={{ color: '#4a4846', marginBottom: '1.25rem' }}>{col.label}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {col.links.map(l => (
                  <a key={l.text} href={l.href} style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 300,
                    fontSize: '0.8rem',
                    color: '#7a7875',
                    textDecoration: 'none',
                    transition: 'color 0.2s',
                  }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#ffffff')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#7a7875')}
                  >{l.text}</a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{
          borderTop: '1px solid rgba(244,243,240,0.06)',
          padding: '1.25rem 2.5rem',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <p style={{ fontFamily: 'Inter', fontWeight: 300, fontSize: '0.7rem', color: '#3a3836', letterSpacing: '0.05em' }}>
            © 2025 Studio13
          </p>
          <p style={{ fontFamily: 'Inter', fontWeight: 300, fontSize: '0.7rem', color: '#3a3836', letterSpacing: '0.05em' }}>
            Fotografía Profesional · Costa Rica
          </p>
        </div>
      </footer>
    </div>
  )
}
