import { AdminLista } from "./Layout/AdminLayout.jsx";

export default function Clientes() {
  return <AdminLista titulo="Clientes" endpoint="/api/clientes" columnas={[
    { key: "nombre", label: "Nombre" },
    { key: "email", label: "Correo" },
    { key: "telefono", label: "Teléfono" },
    { key: "createdAt", label: "Registro", date: true },
  ]} />;
}
