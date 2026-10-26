const grupos = [
  { titulo: "Perfil del estudio", descripcion: "Información general de Studio13.", estado: "Próximamente" },
  { titulo: "Contenido del sitio", descripcion: "Preferencias de presentación para el sitio público.", estado: "Próximamente" },
  { titulo: "Acceso administrativo", descripcion: "Preferencias de acceso y seguridad del panel.", estado: "Próximamente" },
];

export default function ConfiguracionPanel() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-350 px-5 py-8 sm:px-7 md:px-10 md:py-10 xl:px-12">
      <div className="mb-7">
        <p className="mb-2 text-[10px] font-semibold! tracking-[.2em] text-neutral-500 uppercase sm:text-xs">Administración</p>
        <h1 className="m-0 font-[Georgia] text-3xl font-normal! text-neutral-900 sm:text-4xl">Configuración</h1>
        <p className="mb-0 mt-2 text-xs text-neutral-500 sm:text-sm">Preferencias generales del espacio administrativo.</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {grupos.map((grupo) => (
          <section key={grupo.titulo} className="border border-neutral-200 bg-white p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="m-0 font-[Georgia] text-xl font-normal! text-neutral-900">{grupo.titulo}</h2>
                <p className="mb-0 mt-2 text-sm leading-6 text-neutral-600">{grupo.descripcion}</p>
              </div>
              <span className="shrink-0 border border-neutral-300 px-2.5 py-1 text-[10px] font-semibold! text-neutral-500 uppercase">{grupo.estado}</span>
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
