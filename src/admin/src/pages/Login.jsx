import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/Studio13_blanco.png';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/+$/, '');

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
        : (err.message || 'Error al iniciar sesión'));    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Fondos decorativos */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_50%,rgba(200,16,46,0.15)_0%,transparent_50%),radial-gradient(ellipse_at_80%_20%,rgba(200,16,46,0.08)_0%,transparent_40%)]" />
      
      <div className="relative z-10 w-full max-w-105">
        <div className="bg-[rgba(20,20,20,0.85)] border border-white/10 rounded-2xl p-10 backdrop-blur-xl shadow-2xl shadow-black/50">
          
          {/* Logo */}
          <div className="text-center mb-9">
           <img src={logo} alt="Studio13 Logo" className="mx-auto mb-2 w-50 h-auto" />
            <p className="text-xs text-zinc-400 mt-1.5 tracking-[2px] uppercase">
              Panel de Administración
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-2">
                Correo
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="correo@dominio.com"
                  required
                  className="w-full pl-11 pr-4 py-3.5 bg-[#161616] border border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#c8102e] focus:ring-2 focus:ring-[#c8102e]/20 transition-all"
                />
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                </svg>
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-zinc-300 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                  required
                  className="w-full pl-11 pr-4 py-3.5 bg-[#161616] border border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#c8102e] focus:ring-2 focus:ring-[#c8102e]/20 transition-all"
                />
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z" />
                </svg>
              </div>
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-zinc-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 rounded accent-[#c8102e] cursor-pointer"
                />
                Recordarme
              </label>
              <a href="#" className="text-[#c8102e] font-medium hover:text-[#ff2a4a] transition-colors">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            {/* Error */}
            {error && (
              <div className="text-sm text-red-400 bg-red-950/40 border border-red-900/50 rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            {/* Botón */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-semibold text-white bg-linear-to-r from-[#c8102e] to-[#9b0a22] hover:from-[#e01235] hover:to-[#b00c26] shadow-lg shadow-[#c8102e]/40 hover:shadow-[#c8102e]/50 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>

          {/* Nota admin */}
          <div className="mt-8 pt-6 border-t border-zinc-800">
            <p className="text-center text-xs text-zinc-500 leading-relaxed">
              Solo personal autorizado.<br />
              <span className="text-[#c8102e] font-medium">No hay registro público.</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
