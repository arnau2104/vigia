import {connection} from '../db_connections.ts';
import type { Request, Response } from 'express';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';


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
        const [result] = await connection.query<ResultSetHeader>('UPDATE lotes SET fecha_retirada = NOW() AND activo = 0 WHERE lote_id = ? AND comercio_id = ?', 
          [lote_id, req.comercio_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Lote no encontrado o ya retirado' });
        }

        res.json({ message: 'Lote retirado correctamente' });
        
    } catch (e : any) {
        console.error("error al retirar el lote", e);
        res.status(500).json({ error: e.message  });
    }
  }

  static async deshacerRetirar(req: Request, res: Response) {
    const { lote_id } = req.body;

    if (!lote_id) {
        return res.status(400).json({ error: 'Falta el ID del lote' });
    }

    try {
        const [result] = await connection.query<ResultSetHeader>('UPDATE lotes SET fecha_retirada = NULL WHERE lote_id = ? AND comercio_id = ?', 
          [lote_id, req.comercio_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Lote no encontrado o ya retirado' });
        }

        const [lote] = await connection.query('SELECT * FROM lotes_view WHERE lote_id = ? AND comercio_id = ?',
          [lote_id, req.comercio_id]);

        if (!lote) {
            return res.status(404).json({ error: 'Lote no encontrado después de deshacer el retiro' });
        }

        res.json({ message: 'Lote deshacer retirado correctamente', lote});
        
    } catch (e : any) {
        console.error("error al deshacer el lote", e);
        res.status(500).json({ error: e.message  });
    }
  }

  static async getCategorias(req: Request, res: Response) {
    try {
        const [categorias] = await connection.query('SELECT * FROM categorias WHERE comercio_id = ?', 
          [req.comercio_id]);

        res.send({ categorias });
        
    } catch (e : any) {
        console.error("error al solicitar categorias", e);
        res.status(500).json({ error: e.message  });
    }
  }

  static async crearCategoria(req: Request, res: Response) {
    const { categoriaNombre, diasAviso } = req.body;

    if (!categoriaNombre || !diasAviso) {
        return res.status(400).json({ error: 'Faltan datos para crear la categoría' });
    }

    try {

        const [existe] = await connection.query<RowDataPacket[]>('SELECT * FROM categorias WHERE comercio_id = ? AND categoria_nombre = ?', 
          [req.comercio_id, categoriaNombre]);

        if (existe.length > 0) {
            return res.status(400).json({ error: 'Ya existe una categoría con ese nombre' });
        }

        const [result] = await connection.query<ResultSetHeader>('INSERT INTO categorias (comercio_id, categoria_nombre, dias_aviso) VALUES (?, ?, ?)', 
          [req.comercio_id, categoriaNombre, diasAviso]);

        const categoriaId = result.insertId;

        const [categoria] = await connection.query<RowDataPacket[]>('SELECT * FROM categorias WHERE categoria_id = ? AND comercio_id = ?', 
          [categoriaId, req.comercio_id]);

        res.json({ message: 'Categoría creada correctamente', categoria: categoria[0] });
        
    } catch (e : any) {
        console.error("error al crear la categoría", e.message);
        res.status(500).json({ error: "Ha ocurrido un error insesperado, intenta nuevamente"  });
    }
  }

  static async editarCategoria(req: Request, res: Response) {
    const { categoria_id, categoriaNombre, diasAviso } = req.body;

    if (!categoria_id || !categoriaNombre || !diasAviso) {
        return res.status(400).json({ error: 'Faltan datos para editar la categoría' });
    }

    try {
        const [result] = await connection.query<ResultSetHeader>('UPDATE categorias SET categoria_nombre = ?, dias_aviso = ? WHERE categoria_id = ? AND comercio_id = ?', 
          [categoriaNombre, diasAviso, categoria_id, req.comercio_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Categoría no encontrada' });
        }

        const [categoria] = await connection.query<RowDataPacket[]>('SELECT * FROM categorias WHERE categoria_id = ? AND comercio_id = ?', 
          [categoria_id, req.comercio_id]);

        res.json({ message: 'Categoría editada correctamente', categoria: categoria[0] });
        
    } catch (e : any) {
        console.error("error al editar la categoría", e);
        res.status(500).json({ error: e.message  });
    }
  }

  static async getCategoriaIndivPage(req: Request, res: Response) {
    const { categoria_id } = req.body;

    if (!categoria_id) {
        return res.status(400).json({ error: 'Faltan datos para obtener los productos de la categoría' });
    }

    try {

        const [categoria] = await connection.query<RowDataPacket[]>('SELECT * FROM categorias WHERE comercio_id = ? AND categoria_id = ?', 
          [req.comercio_id, categoria_id]);

        if (categoria.length === 0) {
            return res.status(404).json({ error: 'Categoría no encontrada' });
        }

        const [productos] = await connection.query<RowDataPacket[]>('SELECT * FROM productos WHERE comercio_id = ? AND categoria_id = ?', 
          [req.comercio_id, categoria_id]);

        const [lotes] = await connection.query<RowDataPacket[]>('SELECT * FROM lotes_view WHERE comercio_id = ? AND categoria_id = ? AND activo = 1 AND fecha_retirada IS NULL',
          [req.comercio_id, categoria_id]);

        const [codigosBarras] = await connection.query<RowDataPacket[]>('SELECT * FROM producto_codigo_barras WHERE comercio_id = ?',
          [req.comercio_id]);

        res.send({ productos, categoria: categoria[0], lotes, codigosBarras});
        
    } catch (e : any) {
        console.error("error al obtener los datos", e.message);
        res.status(500).json({ error: "Ha ocurrido un error inesperado, intentelo de nuevo"  });
    }
  }

  static async getProductsPage(req: Request, res: Response) {
    try {
        const [productos] = await connection.query<RowDataPacket[]>('SELECT * FROM productos_view WHERE comercio_id = ?', 
          [req.comercio_id]);

        const [lotes] = await connection.query<RowDataPacket[]>('SELECT * FROM lotes_view WHERE comercio_id = ? AND activo = 1 AND fecha_retirada IS NULL',
          [req.comercio_id]);

        const [categorias] = await connection.query<RowDataPacket[]>('SELECT * FROM categorias WHERE comercio_id = ?',
          [req.comercio_id]);
        
          res.send({ productos,lotes, categorias });
        
    } catch (e : any) {
        console.error("error al obtener los datos", e);
        res.status(500).json({ error: "Ha ocurrido un error inesperado, intentelo de nuevo"  });
    }
  }

}