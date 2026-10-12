import { AdminLista } from "./Layout/AdminLayout.jsx";

export default function Servicios() {
  return <AdminLista titulo="Servicios" endpoint="/api/servicios" columnas={[
    { key: "nombre", label: "Servicio" },
    { key: "descripcion", label: "Descripción" },
    { key: "precio", label: "Precio" },
    { key: "activo", label: "Estado" },
  ]} />;
}
