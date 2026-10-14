import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:3001").replace(/\/+$/, "");

export function adminHeaders(json = false) {
  const token = sessionStorage.getItem("studio13AdminToken");
  return { ...(json ? { "Content-Type": "application/json" } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) };
}

export function useAdminCollection(endpoint) {
  const navigate = useNavigate();
  const [filas, setFilas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [actualizacion, setActualizacion] = useState(0);
  const recargar = useCallback(() => {
    setCargando(true);
    setActualizacion((valor) => valor + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API_BASE_URL}${endpoint}`, { signal: controller.signal, headers: adminHeaders() })
      .then(async (response) => {
        const body = await response.json();
        if (response.status === 401) {
          sessionStorage.removeItem("studio13AdminToken");
          sessionStorage.removeItem("studio13Admin");
          navigate("/iniciar-sesion", { replace: true });
          throw new Error("La sesión expiró. Inicia sesión nuevamente.");
        }
        if (!response.ok) throw new Error(body.error || "No se pudieron cargar los datos.");
        if (!Array.isArray(body)) throw new Error("El servidor devolvió un formato de datos no válido.");
        return body;
      })
      .then((body) => {
        if (!controller.signal.aborted) {
          setFilas(body);
          setError("");
          setCargando(false);
        }
      })
      .catch((reason) => {
        if (!controller.signal.aborted) {
          setError(reason instanceof TypeError ? "No se pudo contactar con el servidor." : reason.message);
          setCargando(false);
        }
      });
    return () => controller.abort();
  }, [endpoint, navigate, actualizacion]);

  return { filas, setFilas, cargando, error, recargar };
}

export function mensajeError(reason) {
  return reason instanceof TypeError ? "No se pudo contactar con el servidor." : reason.message;
}

export function redirigirSiNoAutorizado(response, navigate) {
  if (response.status !== 401) return;
  sessionStorage.removeItem("studio13AdminToken");
  sessionStorage.removeItem("studio13Admin");
  navigate("/iniciar-sesion", { replace: true });
}
