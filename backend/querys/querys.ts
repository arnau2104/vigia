import {connection} from '../db_connections.ts';
import type { Request, Response } from 'express';


export class Querys {
  static async dashboard(req: Request, res: Response) {

    try {
        const [lotes] = await connection.query('SELECT * FROM lotes_view WHERE comercio_id = ? AND fecha_retirada IS NULL', 
          [req.comercio_id]);
        const [categorias] = await connection.query('SELECT * FROM categorias WHERE comercio_id = ?', 
          [req.comercio_id]);
        const [productos] = await connection.query('SELECT * FROM productos WHERE comercio_id = ?', 
          [req.comercio_id]);

        res.send({ lotes, categorias, productos });
        
    } catch (e : any) {
        console.error("error al solicitar datos en el dashboard", e);
        res.status(500).json({ error: e.message  });
    }
  }

  static async comercio(req: Request, res: Response) {
    try {
        const [comercio] = await connection.query('SELECT * FROM comercios WHERE comercio_id = ?', 
          [req.comercio_id]);

        if (!comercio) return res.status(404).send({ error: 'Comercio no encontrado' });

        res.send({ comercio});

        
    } catch (e : any) {
        console.error("error al solicitar datos del comercio", e);
        res.status(500).json({ error: e.message  });
    }
    
  }

  static async retirarLote(req: Request, res: Response) {
    const { lote_id } = req.body;

    if (!lote_id) {
        return res.status(400).json({ error: 'Falta el ID del lote' });
    }

    try {
        const [result] = await connection.query('UPDATE lotes SET fecha_retirada = NOW() WHERE lote_id = ? AND comercio_id = ?', 
          [lote_id, req.comercio_id]);

        if ((result as any).affectedRows === 0) {
            return res.status(404).json({ error: 'Lote no encontrado o ya retirado' });
        }

        res.json({ message: 'Lote retirado correctamente' });
        
    } catch (e : any) {
        console.error("error al retirar el lote", e);
        res.status(500).json({ error: e.message  });
    }
  }

}