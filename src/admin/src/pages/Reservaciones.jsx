import { AdminLista } from "./Layout/AdminLayout.jsx";

export default function Reservaciones() {
  return <AdminLista titulo="Reservaciones" endpoint="/api/reservaciones" columnas={[
    { key: "nombre", label: "Cliente" },
    { key: "tipoSesion", label: "Sesión" },
    { key: "fecha", label: "Fecha", date: true },
    { key: "hora", label: "Hora" },
    { key: "estado", label: "Estado" },
  ]} />;
}
