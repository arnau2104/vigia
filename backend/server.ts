import express from 'express';
import cookieParser from 'cookie-parser';
import { Querys } from './querys/querys.ts';
import type { Request,Response } from 'express';
import path from 'path'
import { fileURLToPath } from 'url'
import webpush from 'web-push'
import cron from 'node-cron'
import { enviarAvisos } from './avisos.ts'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dist = path.resolve(__dirname, '../dist')



const app = express();

const port = 3000;

webpush.setVapidDetails(process.env.VAPID_SUBJECT!, process.env.VAPID_PUBLIC_KEY!, process.env.VAPID_PRIVATE_KEY!);

declare global {
  namespace Express {
    interface Request { comercio_id: number; }
  }
}

// Archivos del frontend compilado
app.use(express.static(dist, {
  setHeaders: (res, archivo) => {
    // 2. El service worker y el manifiesto se revalidan siempre
    if (archivo.endsWith('sw.js') || archivo.endsWith('manifest.webmanifest')) {
      res.setHeader('Cache-Control', 'no-cache')
    }
    // Los archivos con hash de Vite (carpeta assets) pueden cachearse un año
    else if (archivo.includes(`${path.sep}assets${path.sep}`)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
    }
  },
}))


const middleWareComercioId = (req: Request, res: Response, next: Function) => {
    // Middleware logic here
    req.comercio_id = 1; // Example: Set comercio_id to 1 for all requests
    next();
};

app.disable('x-powered-by');
app.set('trust proxy', 1); // necesario detrás de proxies como Vercel/Render para que express-rate-limit lea bien la IP

app.use(express.json()); // importante para leer req.body
app.use(cookieParser());

app.use(middleWareComercioId);

app.get('/api', (req, res) => {
    res.send({ message: '¡Hola, mundo!' });
    console.log("Hola mundo")
});

app.get('/api/dashboard', Querys.dashboard);
app.get('/api/comercio', Querys.comercio);
app.post('/api/retirarLote', Querys.retirarLote);
app.post('/api/deshacerRetirar', Querys.deshacerRetirar);
app.get('/api/getCategorias', Querys.getCategorias);
app.post('/api/crearCategoria', Querys.crearCategoria);
app.post('/api/editarCategoria', Querys.editarCategoria);
// app.post('/api/eliminarCategoria', Querys.eliminarCategoria);
app.post('/api/getCategoriaIndivPage', Querys.getCategoriaIndivPage);
app.get('/api/getProductosPage', Querys.getProductsPage);
app.post('/api/codigoBarrasExiste', Querys.codigoBarrasExiste);
app.get('/api/getProductosCodigos', Querys.getProductosCodigos);
app.post('/api/crearLote', Querys.crearLote);
app.post('/api/asociarLote', Querys.asociarLote);
app.post('/api/crearProducto', Querys.crearProducto);
app.post('/api/getProducto', Querys.getProducto);
app.post('/api/getProductoCodigos', Querys.getProductoCodigos);
app.post('/api/borrarCodigoBarras', Querys.borrarCodigoBarras);
app.post('/api/editarProducto', Querys.editarProducto);
app.post('/api/eliminarProducto', Querys.eliminarProducto);
app.post('/api/eliminarCategoria', Querys.eliminarCategoria);
app.post('/api/importarCategorias', Querys.importarCategorias);
app.post('/api/importarProductos', Querys.importarProductos);

//ENDPOINTS notificaciones push
app.get('/api/push/clave', Querys.pushClave);
app.post('/api/push/getPushSuscripcion', Querys.getPushSuscripcion);
app.post('/api/push/suscribir', Querys.suscripcionPush);

// 1. Cualquier otra ruta (/productos, /categorias/editar/3…) devuelve index.html
app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(dist, 'index.html'))
})

cron.schedule('* * * * *', async () => {
  try { await enviarAvisos() } catch (e: any) { console.error('Error en el cron de avisos', e.message) }
})

app.listen(port, () => {
    console.log(`Servidor escuchando en el puerto http://localhost:${port}`);
});