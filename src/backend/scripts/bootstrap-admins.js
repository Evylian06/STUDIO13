import readline from "node:readline/promises";
import { stdin, stdout } from "node:process";
import bcrypt from "bcrypt";
import prisma from "../config/databases.js";

class BootstrapError extends Error {}

const askSecret = (label) => new Promise((resolve, reject) => {
  if (!stdin.isTTY || typeof stdin.setRawMode !== "function") {
    reject(new BootstrapError("Ejecuta este proceso desde una terminal interactiva para ocultar las contraseñas."));
    return;
  }

  stdout.write(label);
  stdin.setEncoding("utf8");
  stdin.setRawMode(true);
  stdin.resume();
  let value = "";
  const finish = (error) => {
    stdin.off("data", onData);
    stdin.setRawMode(false);
    stdout.write("\n");
    if (error) reject(error);
    else resolve(value);
  };
  const onData = (chunk) => {
    for (const character of chunk) {
      if (character === "\u0003") return finish(new BootstrapError("Proceso cancelado."));
      if (character === "\r" || character === "\n") return finish();
      if (character === "\u007f" || character === "\b") value = value.slice(0, -1);
      else if (character >= " ") value += character;
    }
  };
  stdin.on("data", onData);
});

const askAccount = async (label) => {
  const rl = readline.createInterface({ input: stdin, output: stdout });
  try {
    const name = (await rl.question(`Nombre de ${label}: `)).trim();
    const email = (await rl.question(`Correo de ${label}: `)).trim().toLowerCase();
    rl.close();

    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new BootstrapError(`Nombre o correo inválido para ${label}.`);
    }

    const password = await askSecret(`Contraseña nueva para ${label} (no se mostrará): `);
    const confirmation = await askSecret(`Repite la contraseña para ${label}: `);
    if (password !== confirmation) throw new BootstrapError(`Las contraseñas de ${label} no coinciden.`);
    if (Buffer.byteLength(password, "utf8") < 12 || Buffer.byteLength(password, "utf8") > 72) {
      throw new BootstrapError("Cada contraseña debe tener entre 12 y 72 bytes para bcrypt.");
    }
    return { name, email, password };
  } finally {
    rl.close();
  }
};

const main = async () => {
  let owner;
  let developer;
  try {
    owner = await askAccount("la dueña (DUEÑA)");
    developer = await askAccount("el desarrollador (DESARROLLADOR)");
    if (owner.email === developer.email) {
      throw new BootstrapError("Las dos cuentas deben usar correos distintos.");
    }

    const [ownerHash, developerHash] = await Promise.all([
      bcrypt.hash(owner.password, 12),
      bcrypt.hash(developer.password, 12),
    ]);
    owner.password = "";
    developer.password = "";

    await prisma.$transaction(async (tx) => {
      const existingAccounts = await tx.adminUser.count();
      if (existingAccounts !== 0) {
        throw new BootstrapError("El bootstrap solo se permite cuando AdminUser está vacío; no se creó ninguna cuenta.");
      }
      await tx.adminUser.create({
        data: { name: owner.name, email: owner.email, passwordHash: ownerHash, role: "OWNER" },
      });
      await tx.adminUser.create({
        data: { name: developer.name, email: developer.email, passwordHash: developerHash, role: "DEVELOPER" },
      });
    }, { isolationLevel: "Serializable" });

    console.log("Se crearon las dos cuentas administrativas. No se imprimieron contraseñas ni hashes.");
  } finally {
    if (owner) owner.password = "";
    if (developer) developer.password = "";
    await prisma.$disconnect();
  }
};

main().catch((error) => {
  console.error(error instanceof BootstrapError ? error.message : "No se pudo completar el bootstrap administrativo. No se registraron credenciales.");
  process.exitCode = 1;
});
