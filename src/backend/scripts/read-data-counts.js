import prisma from "../config/databases.js";

try {
  const counts = await prisma.$transaction([
    prisma.adminUser.count(),
    prisma.cliente.count(),
    prisma.reservacion.count(),
    prisma.servicio.count(),
    prisma.paquete.count(),
    prisma.planMembresia.count(),
    prisma.membresia.count(),
    prisma.imagen.count(),
    prisma.galeria.count(),
  ]);
  const [admins, clients, reservations, services, packages, plans, memberships, images, galleries] = counts;
  console.log(JSON.stringify({ admins, clients, reservations, services, packages, plans, memberships, images, galleries }));
} catch (error) {
  console.error("No se pudieron consultar los conteos.", error?.code || error?.name || "Error interno.");
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
