# Vigia

Aplicación web para el **control de caducidades en comercios**, pensada para reducir las mermas en un supermercado real. Se instala como PWA en el móvil y avisa de los lotes que están a punto de caducar.

**Demo:** https://vigia.arnaumarques.dev

## Funcionalidades

- **Escáner de códigos de barras** con la cámara del móvil para localizar o dar de alta productos.
- **Registro de productos y lotes** con su fecha de caducidad.
- **Panel de inicio** con los lotes caducados, de hoy y próximos a caducar, ordenados por urgencia, y opción de retirarlos (con deshacer).
- **Categorías** de productos, con días de aviso configurables.
- **Importación de productos y categorías** desde CSV, compatible con el programa de gestión Hipos.
- **Notificaciones push** diarias con el resumen de caducidades, con hora y tipos de aviso configurables por dispositivo.
- **PWA instalable**: funciona a pantalla completa y se puede añadir a la pantalla de inicio sin pasar por una tienda de aplicaciones.

## Stack

| Capa | Tecnologías |
| --- | --- |
| Frontend | React 19, TypeScript, Vite, React Router, Lucide, PapaParse, barcode-detector |
| Backend | Node.js, Express 5, TypeScript (tsx), node-cron, web-push |
| Base de datos | MariaDB / MySQL (mysql2) |
| PWA | Service worker y `manifest.webmanifest` en `public/` |

## Estructura

```
vigia/
├── src/              # Frontend (páginas, componentes, utilidades)
├── public/           # Service worker, manifest e iconos de la PWA
├── backend/
│   ├── server.ts     # API Express y servidor de archivos estáticos
│   ├── querys/       # Lógica de los endpoints
│   ├── avisos.ts     # Envío de notificaciones push (cron cada minuto)
│   └── db_connections.ts
└── dist/             # Build del frontend (generado, no se versiona)
```

## Puesta en marcha

### Requisitos

- Node.js 20 o superior
- MariaDB / MySQL
- Un par de claves VAPID para las notificaciones push

### 1. Instalar dependencias

```bash
npm install
cd backend && npm install
```

### 2. Configurar el entorno

Crea `backend/.env`:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=usuario
DB_PASSWORD=contraseña
DB_NAME=vigia

VAPID_SUBJECT=mailto:tu@email.com
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
```

Genera las claves VAPID con:

```bash
npx web-push generate-vapid-keys
```

### 3. Desarrollo

En dos terminales:

```bash
# Backend (puerto 3000)
cd backend && npm start

# Frontend (Vite, con proxy de /api hacia el backend)
npm run dev
```

### 4. Producción

```bash
npm run build          # genera dist/
cd backend && npm start
```

El backend sirve `dist/` y la API desde el mismo puerto (3000). Se recomienda ponerlo detrás de Nginx con HTTPS, que es obligatorio para la PWA y las notificaciones push, y mantenerlo en marcha con PM2 o systemd.

## Scripts

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Servidor de desarrollo de Vite |
| `npm run build` | Comprobación de tipos y build de producción |
| `npm run lint` | ESLint |
| `npm run preview` | Previsualiza el build |
| `cd backend && npm start` | Arranca la API y el cron de avisos |

## API

Todos los endpoints cuelgan de `/api`:

- **Panel y comercio:** `dashboard`, `comercio`
- **Lotes:** `crearLote`, `asociarLote`, `retirarLote`, `deshacerRetirar`
- **Productos:** `getProductosPage`, `getProducto`, `crearProducto`, `editarProducto`, `eliminarProducto`, `codigoBarrasExiste`, `getProductosCodigos`, `getProductoCodigos`, `borrarCodigoBarras`
- **Categorías:** `getCategorias`, `getCategoriaIndivPage`, `crearCategoria`, `editarCategoria`, `eliminarCategoria`
- **Importación:** `importarProductos`, `importarCategorias`
- **Push:** `push/clave`, `push/getPushSuscripcion`, `push/suscribir`

## Estado del proyecto

En uso real en un supermercado. Pendiente:

- Autenticación y multicomercio (ahora el `comercio_id` está fijado en un middleware).
- Script SQL con el esquema de la base de datos.
- Modo demo con datos de prueba.

## Autor

Arnau Marqués · [arnaumarques.dev](https://arnaumarques.dev)
