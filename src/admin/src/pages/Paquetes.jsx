import { AdminLista } from "./Layout/AdminLayout.jsx";

export default function Paquetes() {
  return <AdminLista titulo="Paquetes" endpoint="/api/paquetes" columnas={[
    { key: "nombre", label: "Paquete" },
    { key: "descripcion", label: "Descripción" },
    { key: "precio", label: "Precio" },
    { key: "activo", label: "Estado" },
  ]} />;
}
