import { AdminLista } from "./Layout/AdminLayout.jsx";

export default function Membresias() {
  return <AdminLista titulo="Membresías" endpoint="/api/membresias" columnas={[
    { key: "cliente.nombre", label: "Cliente" },
    { key: "plan.nombre", label: "Plan" },
    { key: "fechaInicio", label: "Inicio", date: true },
    { key: "fechaFin", label: "Vencimiento", date: true },
    { key: "estado", label: "Estado" },
  ]} />;
}
