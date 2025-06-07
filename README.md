# Notatis

**Notatis** es un clon sencillo de Notion, construido de forma progresiva siguiendo seis fases de desarrollo. Este README detalla cada etapa, el estado actual de implementación y cómo ejecutar el proyecto localmente.

## https://notitas-39d7.onrender.com

## 📄 Descripción

Notitas permite gestionar páginas, bases de datos internas y compartir contenido de forma similar a Notion. Está dividido en las siguientes fases:

1. **Fase 0 – Preparación del entorno**
2. **Fase 1 – Autenticación y usuario**
3. **Fase 2 – Gestión de páginas y bloques básicos**
4. **Fase 3 – Organización y bases de datos internas**
5. **Fase 4 – Compartir y permisos**
6. **Fase 5 – Funcionalidades avanzadas y pulido final**
   - 5.1 Versionado de páginas
   - 5.2 Embebido de contenido multimedia
   - (Las fases 5.3 a 5.6 están previstas pero aún no implementadas)

A continuación se describen con detalle cada fase, el estado de implementación y las instrucciones para levantar el proyecto.

---

## 🚀 Funcionalidades por fase

### ✅ Fase 0 – Preparación del entorno

- **Objetivo:** Tener todas las herramientas, cuentas y repositorios listos.
- **Entregables y estado:**
  - Repositorio principal en GitHub/GitLab: `notitas-web`.
  - Branching model con `main` y ramas de _feature_.
  - Clúster en MongoDB Atlas configurado, usuario + IP whitelist, conexión probada (`test-db-connection.js`).
  - Estructura base del proyecto (React + TypeScript con CRA o Vite).
  - Linter y formateador: ESLint, Prettier, Husky + _pre-commit hooks_.
  - `README` inicial y `.env.example`.
- **Estado:** ✅ Completo

### ✅ Fase 1 – Módulo de autenticación y usuario

- **Objetivo:** Permitir registro, login y mantenimiento de sesión.
- **Frontend:**
  - `src/pages/Login.tsx` y `Register.tsx` con formularios y validación básica.
  - `AuthContext.tsx`: maneja `user`, `token`, `login()`, `logout()`.
  - `PrivateRoute.tsx`: protege rutas que requieren autenticación.
- **Backend:**
  - Rutas en `server/routes/auth.ts`:
    - `POST /register` – crea usuario (bcryptjs + mongoose).
    - `POST /login` – valida credenciales y genera JWT + refresh token.
    - `GET /refresh-token` – emite nuevo access token.
    - `POST /logout` – invalida refresh token (opcional).
  - Middleware `protect` verifica JWT en encabezado `Authorization`.
- **Estado:** ✅ Completo

### ✅ Fase 2 – Gestión de páginas y bloques básicos

- **Objetivo:** CRUD de páginas (modelo Page: `ownerId`, `title`, `content`).
- **Modelo Mongoose:**
  ```js
  // server/models/Page.js
  const PageSchema = new Schema({
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, default: "Untitled" },
    content: [
      {
        _id: false,
        id: { type: String },
        type: {
          type: String,
          enum: ["paragraph", "heading", "list"],
          default: "paragraph",
        },
        data: Schema.Types.Mixed,
        order: Number,
      },
    ],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  });
  ```
- **Rutas en `server/routes/pages.ts`:**
  - `GET /pages` – lista páginas del usuario autenticado.
  - `POST /pages` – crea nueva página.
  - `GET /pages/:id` – obtiene detalle.
  - `PATCH /pages/:id` – actualiza.
  - `DELETE /pages/:id` – borra.
- **API frontend (`src/api/pages.ts`):**
  - `getPages()`, `createPage()`, `getPageById()`, `updatePage()`, `deletePage()`.
- **Componentes React:**
  - `PagesList.tsx` – listado de páginas, botón “+ Nueva página”.
  - `PageDetail.tsx` – editor WYSIWYG simple para editar y guardar.
  - `Sidebar.tsx` – barra lateral con navegación rápida de páginas.
- **Estado:** ✅ Completo

### ✅ Fase 3 – Organización y bases de datos internas

- **Objetivo:** Implementar “databases” (modelo Database: `ownerId`, `name`, `schema`, `entries`).
- **Modelo Mongoose:**
  ```js
  // server/models/Database.js
  const DatabaseSchema = new Schema({
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, default: "Nueva base de datos" },
    schema: [
      {
        key: String,
        label: String,
        type: {
          type: String,
          enum: ["text", "number", "select", "date"],
          default: "text",
        },
      },
    ],
    entries: [
      {
        _id: false,
        id: { type: String },
        data: Schema.Types.Mixed,
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
      },
    ],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  });
  ```
- **Rutas en `server/routes/databases.ts`:**
  - `GET /databases` – lista bases del usuario.
  - `POST /databases` – crea nueva base.
  - `GET /databases/:id` – detalle de base.
  - `PATCH /databases/:id` – actualiza `name` o `schema`.
  - `DELETE /databases/:id` – borra base.
  - CRUD de entradas anidadas (`entries`):
    - `POST /databases/:id/entries` – crea entrada.
    - `PATCH /databases/:id/entries/:entryId` – actualiza entrada.
    - `DELETE /databases/:id/entries/:entryId` – borra entrada.
    - `GET /databases/:id/entries` – lista entradas (con filtros/orden en query).
- **API frontend (`src/api/databases.ts`):**
  - `getDatabases()`, `createDatabase()`, `getDatabaseById()`, `updateDatabase()`, `deleteDatabase()`,  
    `createEntry()`, `updateEntry()`, `deleteEntry()`.
- **Componentes React:**
  - `DatabasesList.tsx` – lista bases, botón “+ Nuevo proyecto”.
  - `DatabaseDetail.tsx` – vistas:
    - `TableView.tsx` – tabla con columnas dinámicas según `schema`.
    - `KanbanView.tsx` – columnas dinámicas según campo status.
    - `CalendarView.tsx` – FullCalendar con entradas de fecha.
- **Estado:** ✅ Completo

### ✅ Fase 4 – Compartir y permisos

- **Objetivo:** Permitir compartir recursos (páginas o bases) con otros usuarios, definiendo roles (`view`, `edit`).
- **Modelo Mongoose:**
  ```js
  // server/models/Permission.js
  const PermissionSchema = new Schema({
    resourceType: { type: String, enum: ["page", "database"], required: true },
    resourceId: { type: Schema.Types.ObjectId, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: ["owner", "edit", "view"], default: "view" },
  });
  ```
- **Rutas en `server/routes/permissions.ts`:**
  - `GET /permissions?resourceType=page&resourceId=<id>` – lista permisos.
  - `POST /permissions` – asigna permiso a un usuario (email → userId + role).
  - `DELETE /permissions/:id` – revoca permiso.
- **API frontend (`src/api/permissions.ts`):**
  - `getPermissions(resourceType, resourceId)`, `createPermission(...)`, `deletePermission(id)`.
- **Componentes React:**
  - `ShareModal.tsx` – modal para invitar usuarios por email y asignar rol (`view` o `edit`).
  - `PermissionList.tsx` – lista de colaboradores con botón para revocar.
  - Integración en `PageDetail.tsx` y `DatabaseDetail.tsx` con botón “Compartir”.
- **Estado:** ✅ Completo

---

## 🔶 Estado actual de Fase 5 (Funciones avanzadas)

- **5.1 Versionado de páginas**

  - `VersionHistory.tsx` existe, pero no hay lógica de backend para almacenar versiones.
  - Estado: ⚠ Semi-implementado (solo UI).

- **5.2 Embebido de contenido multimedia**

  - `MediaEmbed.tsx` existe, pero no hay lógica de backend para persistir.
  - Estado: ⚠ Semi-implementado (solo UI).

- **5.3 Modo oscuro y tematización**
- **5.4 Optimización de rendimiento (Lazy loading, virtualización de listas)**
- **5.5 Diseño responsive (mobile-first)**
- **5.6 Tests (Unitarios e Integración)**

> Fases 5.3 a 5.6 pendiente de implementación. El MVP es funcional sin ellas, pero recomiendo completarlas en el futuro.

---

## ⚙️ Tecnologías

- **Backend**

  - Node.js LTS (≥16)
  - Express.js
  - MongoDB Atlas + Mongoose
  - bcryptjs
  - JSON Web Tokens (JWT)
  - dotenv
  - nodemon

- **Frontend**
  - React 18 + TypeScript (Vite o CRA)
  - React Router DOM
  - Axios
  - Context API (AuthContext, DatabaseContext)
  - ESLint + Prettier + Husky
  - FullCalendar, react-icons

---

## 🛠️ Prerrequisitos

- Node.js ≥ 16
- npm o yarn
- Cuenta y cluster MongoDB Atlas

---

## 📥 Instalación y ejecución local

### 1. Clonar repositorio

```bash
git clone <tu-repo-url> notitas-web
cd notitas-web
```

### 2. Configurar variables de entorno

En cada carpeta (`server/` y `notitas-web/`), copiar `.env.example` a `.env`:

- **Backend (`server/.env`):**
  ```
  MONGODB_URI=<tu_URI_Atlas>
  JWT_SECRET=<secreto_JWT>
  PORT=5000
  ```
- **Frontend (`notitas-web/.env`):**
  ```
  REACT_APP_API_URL=http://localhost:5000
  ```

### 3. Instalar dependencias

```bash
cd server
npm install

cd ../notitas-web
npm install
```

### 4. Ejecutar en modo desarrollo

```bash
# Backend
cd server
npm run dev  # http://localhost:5000

# Frontend (en otra terminal)
cd notitas-web
npm start    # http://localhost:3000
```

- Regístrate en `http://localhost:3000/register`.
- Inicia sesión en `http://localhost:3000/login`.
- Explora Páginas, Bases y Compartir.

---

## 📁 Estructura del proyecto

```
notitas-web/
├─ server/
│   ├─ models/
│   │   ├─ User.js
│   │   ├─ Page.js
│   │   ├─ Database.js
│   │   └─ Permission.js
│   ├─ routes/
│   │   ├─ auth.ts
│   │   ├─ pages.ts
│   │   ├─ databases.ts
│   │   ├─ permissions.ts
│   │   └─ ...
│   ├─ middleware/
│   │   └─ protect.ts
│   ├─ test-db-connection.js
│   ├─ server.ts / index.ts
│   ├─ .env.example
│   └─ package.json
├─ notitas-web/
│   ├─ public/
│   │   └─ index.html
│   ├─ src/
│   │   ├─ api/
│   │   │   ├─ auth.ts
│   │   │   ├─ pages.ts
│   │   │   ├─ databases.ts
│   │   │   └─ permissions.ts
│   │   ├─ components/
│   │   │   ├─ Sidebar.tsx
│   │   │   ├─ TableView.tsx
│   │   │   ├─ KanbanView.tsx
│   │   │   ├─ CalendarView.tsx
│   │   │   ├─ ShareModal.tsx
│   │   │   └─ VersionHistory.tsx
│   │   ├─ context/
│   │   │   ├─ AuthContext.tsx
│   │   │   └─ DatabaseContext.tsx
│   │   ├─ pages/
│   │   │   ├─ Login.tsx
│   │   │   ├─ Register.tsx
│   │   │   ├─ PagesList.tsx
│   │   │   ├─ PageDetail.tsx
│   │   │   ├─ DatabasesList.tsx
│   │   │   ├─ DatabaseDetail.tsx
│   │   │   └─ PermissionList.tsx
│   │   ├─ styles/
│   │   │   └─ index.css
│   │   ├─ App.tsx
│   │   ├─ index.tsx
│   │   └─ react-app-env.d.ts
│   ├─ .env.example
│   └─ package.json
└─ README.md
```

---

## 🤝 Contribuciones

¡Las contribuciones son bienvenidas!

1. Haz fork del repo y clona.
2. Crea rama `feature/descripcion`.
3. Implementa cambios y tests.
4. Abre Pull Request.

---

## 📄 Licencia

Proyecto bajo licencia MIT. Revisa el archivo [LICENSE](./LICENSE).

---
