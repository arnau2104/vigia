import express from 'express';
import cookieParser from 'cookie-parser';
import { Querys } from './querys/querys.ts';
import type { Request,Response } from 'express';


const app = express();

const port = 3000;

declare global {
  namespace Express {
    interface Request { comercio_id: number; }
  }
}
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


app.listen(port, () => {
    console.log(`Servidor escuchando en el puerto http://localhost:${port}`);
});