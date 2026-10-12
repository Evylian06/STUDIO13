import { AdminLista } from "./Layout/AdminLayout.jsx";

export default function Galeria() {
  return <AdminLista titulo="Galería" endpoint="/api/galerias" columnas={[
    { key: "nombre", label: "Galería" },
    { key: "slug", label: "Identificador" },
    { key: "imagenes.length", label: "Imágenes" },
    { key: "activo", label: "Estado" },
  ]} />;
}
