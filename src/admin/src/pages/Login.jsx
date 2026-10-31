import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/studio13_negro.PNG';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/+$/, '');
const loginPhoto = 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=2000&h=1300&fit=crop&auto=format&q=90';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'No se pudo iniciar sesión.');
      if (typeof data.token !== 'string' || !data.admin) {
        throw new Error('El servidor devolvió una respuesta de inicio de sesión no válida.');
      }
      sessionStorage.setItem('studio13AdminToken', data.token);
      sessionStorage.setItem('studio13Admin', JSON.stringify(data.admin));
      navigate('/Inicio', { replace: true });
    } catch (err) {
      setError(err instanceof TypeError
        ? 'No se pudo contactar con el servidor. Comprueba que el backend esté disponible.'
        : (err.message || 'Error al iniciar sesión'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-white p-4 sm:p-7">
      <div className="grid min-h-140 w-full max-w-245 grid-cols-1 overflow-hidden rounded-[22px] bg-white shadow-[0_20px_64px_rgba(10,10,10,0.14)] ring-1 ring-black/5 md:h-[min(620px,calc(100svh-56px))] md:min-h-135 md:grid-cols-2">
        <section className="flex items-center justify-center bg-white px-7 py-8 sm:px-10 sm:py-9 lg:px-12" aria-label="Inicio de sesión del panel administrativo">
          <div className="w-full max-w-85">
            <header className="mb-7 sm:mb-8">
              <img src={logo} alt="Studio13" className="mb-2.5 h-auto w-45 object-contain object-left" />
              <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
                Panel de administración
              </p>
            </header>

            <div className="mb-6">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#c8102e]">
                Acceso privado
              </p>
              <h1 className="m-0 font-(--font-display) text-[clamp(32px,3vw,42px)] leading-tight tracking-[-0.03em] text-[#0a0a0a]">
                Bienvenido de nuevo
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-zinc-500">
                Accede al panel de administración
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="mb-2 block text-xs font-semibold text-zinc-800">
                  Correo electrónico
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="correo@dominio.com"
                    autoComplete="username"
                    required
                    className="h-12.5 w-full rounded-lg border border-zinc-300 bg-zinc-50 pl-4 pr-4 text-sm text-[#0a0a0a] outline-none transition placeholder:text-zinc-400 hover:border-zinc-400 focus:border-[#c8102e] focus:bg-white focus:ring-4 focus:ring-[#c8102e]/10"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-xs font-semibold text-zinc-800">
                  Contraseña
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  required
                  className="h-12.5 w-full rounded-lg border border-zinc-300 bg-zinc-50 px-4 text-sm text-[#0a0a0a] outline-none transition placeholder:text-zinc-400 hover:border-zinc-400 focus:border-[#c8102e] focus:bg-white focus:ring-4 focus:ring-[#c8102e]/10"
                />
              </div>

              <div className="flex items-center justify-between gap-3">
                <label className="flex w-fit cursor-pointer select-none items-center gap-2.5 text-xs text-zinc-600">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="h-4 w-4 cursor-pointer rounded border-zinc-300 accent-[#c8102e]"
                  />
                  Recordarme
                </label>
                <a
                  href="#"
                  className="text-right text-xs font-semibold text-[#c8102e] underline-offset-4 transition hover:text-[#a50d27] hover:underline focus-visible:outline focus-visible:outline-offset-4 focus-visible:outline-[#c8102e]"
                >
                  ¿Olvidaste tu contraseña?
                </a>
              </div>

              {error && (
                <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs leading-relaxed text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex h-12.5 w-full items-center justify-between rounded-lg bg-linear-to-r from-[#c8102e] to-[#a50d27] px-5 text-xs font-bold uppercase tracking-[0.14em] text-white shadow-lg shadow-[#c8102e]/20 transition hover:-translate-y-0.5 hover:brightness-110 hover:shadow-[#c8102e]/30 focus-visible:outline focus-visible:outline-offset-4 focus-visible:outline-[#c8102e] active:translate-y-0 disabled:cursor-wait disabled:opacity-65 disabled:hover:translate-y-0"
              >
                <span>{loading ? 'Iniciando sesión…' : 'Iniciar sesión'}</span>
                {!loading && <span aria-hidden="true" className="text-lg font-normal">→</span>}
              </button>
            </form>

            <footer className="mt-6 border-t border-zinc-200 pt-4">
              <p className="m-0 text-center text-[11px] leading-relaxed text-zinc-500">
                Acceso exclusivo para personal autorizado
              </p>
            </footer>
          </div>
        </section>

        <section className="group relative min-h-65 overflow-hidden bg-[#0a0a0a] md:min-h-162.5" aria-label="Fotografía profesional de Studio13">
          <img
            src={loginPhoto}
            alt="Fotografía profesional de Studio13"
            fetchPriority="high"
            className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.025]"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/10 to-black/15" aria-hidden="true" />
          <div className="absolute bottom-0 left-0 right-0 p-7 text-white sm:p-10">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-red-200">
              Historias en cada encuadre
            </p>
            <p className="m-0 max-w-95 font-(--font-display) text-2xl leading-tight sm:text-3xl">
              Capturamos momentos que merecen quedarse.
            </p>
          </div>
          <span className="absolute right-7 top-7 rounded-full border border-white/35 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-white/85 sm:right-10 sm:top-10">
            Studio13 · Est. 2017
          </span>
        </section>
      </div>
    </main>
  );
}
