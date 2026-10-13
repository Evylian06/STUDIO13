import { AdminLista } from "./Layout/AdminLayout.jsx";

export default function Clientes() {
  return <AdminLista titulo="Clientes" endpoint="/api/clientes" busquedaPorNombre edicionLocal columnas={[
    { key: "nombre", label: "Nombre" },
    { key: "email", label: "Correo electrónico" },
    { key: "telefono", label: "Teléfono" },
    { key: "createdAt", label: "Fecha de registro", date: true },
    { key: "acciones", label: "Acciones" },
  ]} />;
}
