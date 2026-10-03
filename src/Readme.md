# 🎨 Colorimetría Amazónica

## Descripción
Studio13 es un sitio web desarrollado para una empresa de fotografía, diseñado para presentar de manera profesional sus servicios, trabajos y diferentes tipos de sesiones fotográficas.

El sitio cuenta con una interfaz moderna y elegante, enfocada en destacar el contenido visual de la empresa y facilitar la navegación de los usuarios. Incluye secciones como **Inicio, Servicios, Portafolio, Paquetes,Nosotros y Contacto(Reserva)**, además de categorías fotografícas como **Corporativas,Quinceañero,Fotos Familiares,Embarazo,Parejas,Snacks Queik,Eventos,Exteriores**.

El proyecto busca fortalecer la presencia digital de Studio13 y ofrecer a sus clientes una experiencia visual clara, atractiva y profesional.

---
## Características Principales
* Visualización de portafolio y trabajos fotográficos.
* Exploración de galerías y categorías fotografícas.
* Presentación de servicios y paquetes fotográficos.
* Interfaz moderna, elegante y adaptable a diferentes dispositivos.
* Navegación intuitiva entre las diferentes secciones del sitio.
* Sección de contacto para facilitar la comunicación con los clientes.
* Organización del contenido fotográfico por categorías como Corporativas,Quinceañero,Fotos Familiares,Embarazo,Parejas,Snacks Queik,Eventos,Exteriores.
* Identidad visual basada en la paleta de colores de Studio13.
---

## Tecnologías Utilizadas

### Frontend

- React
- Vite
- JavaScript
- CSS
- Tailwind CSS

### Panel Administrativo

- React
- Vite
- JavaScript
- CSS
- Tailwind CSS

### Backend

- Node.js
- Express.js
- Prisma ORM
- PostgreSQL

### Herramientas de Desarrollo

- Git
- GitHub
- Visual Studio Code
- Postman

---

## Arquitectura del Proyecto

```text
STUDIO13/
src/
│
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   ├── vite.config.js
│   └── ...
│
├── admin/
│   ├── public/
│   ├── src/
│   ├── package.json
│   ├── vite.config.js
│   └── ...
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── prisma/
│   ├── routes/
│   ├── .env
│   ├── .gitignore
│   ├── index.js
│   ├── swagger.js
│   ├── package.json
│   └── package-lock.json
│
├── .gitignore
├── CONTRIBUTING.md
└── README.md
```

---

## Requisitos Previos

Antes de ejecutar el proyecto, asegúrese de tener instalado:

- Node.js (versión 20 o superior)
- PostgreSQL
- Git
- npm

---

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/Evylian06/STUDIO13.git
```

### 2. Instalar dependencias

Frontend:

```bash
cd frontend
npm install
```

Panel Administrativo:

```bash
cd admin
npm install
```

Backend:

```bash
cd backend
npm install
```

---

## Configuración de Variables de Entorno

Crear un archivo `.env` dentro de la carpeta `backend`.

Ejemplo:

```env
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/colorimetria_amazonica"
PORT=4000
```

---

## Configuración de la Base de Datos

Ejecutar las migraciones:

```bash
npx prisma migrate dev
```

Generar el cliente Prisma:

```bash
npx prisma generate
```

---

## Ejecución del Proyecto

### Backend

```bash
npm run dev
```

### Frontend

```bash
npm run dev
```

### Panel Administrativo

```bash
npm run dev
```

---

# Funcionalidades Implementadas

### Visitantes

* Visualización del portafolio fotográfico.
* Exploración de galerías y categorías de fotografía.
* Consulta de servicios y paquetes disponibles.
* Navegación intuitiva entre las diferentes secciones.
* Diseño adaptable para dispositivos móviles y de escritorio.
* Acceso a información de contacto de Studio13.

### Administradores

* Gestión del contenido fotográfico.
* Administración de galerías y categorías.
* Registro y actualización de información de servicios.
* Administración del contenido mostrado a los visitantes.
* Gestión de la información mediante un panel administrativo.

---
## Base de Datos

El proyecto utiliza PostgreSQL como sistema de gestión de bases de datos y Prisma ORM para facilitar la comunicación entre el backend y la base de datos.

---




## Autor

**Daniel Rivera Berrospi**

Proyecto desarrollado como parte de la formación académica y práctica en desarrollo web full stack.

---

## Estado del Proyecto

✅ Versión funcional en desarrollo final.

