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
        const [result] = await connection.query<ResultSetHeader>('UPDATE lotes SET fecha_retirada = CURDATE(), activo = 0 WHERE lote_id = ? AND comercio_id = ?', 
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

  static async crearLote(req: Request, res: Response) {
    const { producto_id, fecha_caducidad, cantidad } = req.body;

    if(!producto_id || !fecha_caducidad || !cantidad) return res.status(400).json({ error: 'Faltan datos para crear el lote' });

    try {
        const [result] = await connection.query<ResultSetHeader>('INSERT INTO lotes (comercio_id, producto_id, fecha_caducidad, fecha_entrada, cantidad) VALUES (?, ?, ?, CURDATE(), ?)', 
          [req.comercio_id, producto_id, fecha_caducidad, cantidad]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Lote no creado' });
        }

        res.json({ message: 'Lote creado correctamente' });
        
    } catch (e : any) {
        console.error("error al crear el lote", e);
        res.status(500).json({ error: e.message  });
    }
  }

  static async asociarLote (req: Request, res: Response) {

    const {producto_id,fecha_caducidad, cantidad, codigo_barras} = req.body;

    if(!producto_id || !fecha_caducidad || !cantidad || !codigo_barras) return res.status(400).json({ error: 'Faltan datos para crear el lote' });

    try {

      const [asociarCodigo] = await connection.query<ResultSetHeader>('INSERT INTO producto_codigo_barras (comercio_id, producto_id, codigo_barras) VALUES (?, ?, ?)', 
        [req.comercio_id, producto_id, codigo_barras]);

      if(asociarCodigo.affectedRows === 0) {
        return res.status(404).json({ error: 'Codigo de barras no asociado' });
      }

      const [result] = await connection.query<ResultSetHeader>('INSERT INTO lotes (comercio_id, producto_id, fecha_caducidad, fecha_entrada, cantidad) VALUES (?, ?, ?, CURDATE(), ?)', 
        [req.comercio_id, producto_id, fecha_caducidad, cantidad]);

      if (result.affectedRows === 0) {
          return res.status(404).json({ error: 'Error creando el lote' });
      }

      res.json({ message: 'Lote creado correctamente' });
      
    } catch (e: any) {
       console.error("error al crear el lote", e.message);
        res.status(500).json({ error: "Error al crear producto"  });
    }


  }

  static async crearProducto(req: Request, res: Response) {
    const { producto_nombre, codigo_barras, categoria_id, fecha_caducidad, cantidad } = req.body;

    if(!producto_nombre || !categoria_id || !codigo_barras || !fecha_caducidad || !cantidad) return res.status(400).json({ error: 'Faltan datos para crear el producto' });

    try {

      const [crearProducto] = await connection.query<ResultSetHeader>('INSERT INTO productos (comercio_id,categoria_id, producto_nombre) VALUES (?, ?, ?)', 
        [req.comercio_id,categoria_id,producto_nombre]);

      if(crearProducto.affectedRows === 0) {
        return res.status(404).json({ error: 'Error creando el producto' });
      }

      const [asociarCodigo] = await connection.query<ResultSetHeader>('INSERT INTO producto_codigo_barras (comercio_id, producto_id, codigo_barras) VALUES (?, ?, ?)', 
        [req.comercio_id, crearProducto.insertId, codigo_barras]);

      if(asociarCodigo.affectedRows === 0) {
        return res.status(404).json({ error: 'Codigo de barras no asociado' });
      }

      const [result] = await connection.query<ResultSetHeader>('INSERT INTO lotes (comercio_id, producto_id, fecha_caducidad, fecha_entrada, cantidad) VALUES (?, ?, ?, CURDATE(), ?)', 
        [req.comercio_id, crearProducto.insertId, fecha_caducidad, cantidad]);

      if (result.affectedRows === 0) {
          return res.status(404).json({ error: 'Error creando el lote' });
      }

      res.json({ message: 'Producto creado correctamente' });
      
    } catch (e:any) {
      console.log("error al crear producto")
      res.status(500).json({ error: e.message  });
    }
  }

  static async deshacerRetirar(req: Request, res: Response) {
    const { lote_id } = req.body;

    if (!lote_id) {
        return res.status(400).json({ error: 'Falta el ID del lote' });
    }

    try {
        const [result] = await connection.query<ResultSetHeader>('UPDATE lotes SET fecha_retirada = NULL, activo = 1 WHERE lote_id = ? AND comercio_id = ?', 
          [lote_id, req.comercio_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Lote no encontrado' });
        }

        const [lote] = await connection.query<RowDataPacket[]>('SELECT * FROM lotes_view WHERE lote_id = ? AND comercio_id = ?',
          [lote_id, req.comercio_id]);

        if (lote.length === 0) {
            return res.status(404).json({ error: 'Lote no encontrado después de deshacer el retiro' });
        }

        res.json({ message: 'Lote deshacer retirado correctamente', lote: lote[0] });
        
    } catch (e : any) {
        console.error("error al deshacer el lote", e.message);
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

        const [codigosBarras] = await connection.query<RowDataPacket[]>('SELECT * FROM producto_codigo_barras_view WHERE comercio_id = ?',
          [req.comercio_id]);
        
          res.send({ productos,lotes, categorias,codigosBarras });
        
    } catch (e : any) {
        console.error("error al obtener los datos", e);
        res.status(500).json({ error: "Ha ocurrido un error inesperado, intentelo de nuevo"  });
    }
  }

  static async getProductosCodigos(req: Request, res: Response) {
    try {
        const [productos] = await connection.query<RowDataPacket[]>('SELECT * FROM productos_view WHERE comercio_id = ?',
          [req.comercio_id]);

        const [codigosBarras] = await connection.query<RowDataPacket[]>('SELECT * FROM producto_codigo_barras_view WHERE comercio_id = ?',
          [req.comercio_id]);

        const [categorias] = await connection.query<RowDataPacket[]>('SELECT * FROM categorias WHERE comercio_id = ?',
          [req.comercio_id]);
        
          res.send({productos, codigosBarras, categorias});
        
    } catch (e : any) {
        console.error("error al obtener los datos", e);
        res.status(500).json({ error: "Ha ocurrido un error inesperado, intentelo de nuevo"  });
    }
  }

  static async codigoBarrasExiste(req: Request, res: Response) {
    const { codigoBarras } = req.body;

    if (!codigoBarras) {
        return res.status(400).json({ error: 'Faltan datos para obtener los productos de la categoría' });
    }

    try {
        const [codigo_barras] = await connection.query<RowDataPacket[]>('SELECT * FROM producto_codigo_barras WHERE comercio_id = ? AND codigo_barras = ?', 
          [req.comercio_id, codigoBarras]);

        res.send(codigo_barras);
        
    } catch (e : any) {
        console.error("error al obtener los datos", e);
        res.status(500).json({ error: "Ha ocurrido un error inesperado, intentelo de nuevo"  });
    }
  }

  static async getProducto(req: Request, res: Response) {
    const { producto_id } = req.body;

    if (!producto_id) {
        return res.status(400).json({ error: 'Faltan datos para obtener los productos de la categoría' });
    } 

    try {
        const [producto] = await connection.query<RowDataPacket[]>('SELECT * FROM productos WHERE comercio_id = ? AND producto_id = ?', 
          [req.comercio_id, producto_id]);

        res.send({producto: producto[0]});
        
    } catch (e : any) {
        console.error("error al obtener los datos", e);
        res.status(500).json({ error: "Ha ocurrido un error inesperado, intentelo de nuevo"  });
    }
  }

  static async getProductoCodigos(req: Request, res: Response) {
    const { producto_id } = req.body;

    if (!producto_id) {
        return res.status(400).json({ error: 'Faltan datos para obtener los productos de la categoría' });
    } 

    try {
        const [codigosBarras] = await connection.query<RowDataPacket[]>('SELECT * FROM producto_codigo_barras WHERE comercio_id = ? AND producto_id = ?',
          [req.comercio_id, producto_id]);
        
          res.send({codigosBarras});
        
    } catch (e : any) {
        console.error("error al obtener los datos", e);
        res.status(500).json({ error: "Ha ocurrido un error inesperado, intentelo de nuevo"  });
    }
  }

  static async borrarCodigoBarras(req: Request, res: Response) {
    const { codigoBarras } = req.body;

    if (!codigoBarras) {
        return res.status(400).json({ error: 'Faltan datos para obtener los productos de la categoría' });
    } 

    try {
        const [codigosBarras] = await connection.query<ResultSetHeader>('DELETE FROM producto_codigo_barras WHERE comercio_id = ? AND codigo_barras = ?',
          [req.comercio_id, codigoBarras]);

        if (codigosBarras.affectedRows === 0) {
            return res.status(404).json({ error: 'Codigo de barras no encontrado' });
        }
        
          res.send({codigosBarras});
        
    } catch (e : any) {
        console.error("error al obtener los datos", e);
        res.status(500).json({ error: "Ha ocurrido un error inesperado, intentelo de nuevo"  });
    }
  }

  static async editarProducto(req: Request, res: Response) {
    const { producto_id, producto_nombre, categoria_id, codigos_nuevos } = req.body;

    if(!producto_id || !producto_nombre || !categoria_id) {
      return res.status(400).json({ error: 'Faltan datos para editar el producto' });
    }

    try {
      const [producto] = await connection.query<ResultSetHeader>('UPDATE productos SET producto_nombre = ?, categoria_id = ? WHERE comercio_id = ? AND producto_id = ?',
        [producto_nombre, categoria_id, req.comercio_id, producto_id]);

      if (producto.affectedRows === 0) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }

      if(codigos_nuevos) {
        for(const codigo of codigos_nuevos) {
          const [asociarCodigo] = await connection.query<ResultSetHeader>('INSERT INTO producto_codigo_barras (comercio_id, producto_id, codigo_barras) VALUES (?, ?, ?)', 
            [req.comercio_id, producto_id, codigo]);
        }
      }

      res.send({message: 'Producto editado correctamente'});
      
    } catch (e : any) {
        console.error("error al obtener los datos", e);
        res.status(500).json({ error: "Ha ocurrido un error inesperado, intentelo de nuevo"  });
    }

  }

  static async eliminarProducto(req: Request, res: Response) {
    const { producto_id } = req.body;

    if (!producto_id) {
        return res.status(400).json({ error: 'Faltan datos para obtener los productos de la categoría' });
    } 

    try {

       const [eliminarCodigos] = await connection.query<ResultSetHeader>('DELETE FROM producto_codigo_barras WHERE comercio_id = ? AND producto_id = ?',
          [req.comercio_id, producto_id]);

        const [eliminarLotes] = await connection.query<ResultSetHeader>('DELETE FROM lotes WHERE comercio_id = ? AND producto_id = ?',
          [req.comercio_id, producto_id]);

        const [eliminarProducto] = await connection.query<ResultSetHeader>('DELETE FROM productos WHERE comercio_id = ? AND producto_id = ?',
          [req.comercio_id, producto_id]);

        if (eliminarProducto.affectedRows === 0 ) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        
          res.send({message: 'Producto eliminado correctamente'});
        
    } catch (e : any) {
        console.error("error al obtener los datos", e);
        res.status(500).json({ error: "Ha ocurrido un error inesperado, intentelo de nuevo"  });
    }
  }

  static async eliminarCategoria(req: Request, res: Response) {
    const { categoria_id } = req.body;

    if (!categoria_id) {
        return res.status(400).json({ error: 'Faltan datos para obtener los productos de la categoría' });
    } 

    try {

        const [eliminarCodigos] = await connection.query<ResultSetHeader>('DELETE FROM producto_codigo_barras WHERE comercio_id = ? AND producto_id IN (SELECT producto_id FROM productos WHERE categoria_id = ?)',
          [req.comercio_id, categoria_id]);

        const [eliminarLotes] = await connection.query<ResultSetHeader>('DELETE FROM lotes WHERE comercio_id = ? AND producto_id IN (SELECT producto_id FROM productos WHERE categoria_id = ?)',
          [req.comercio_id, categoria_id]);

        const [eliminarProductos] = await connection.query<ResultSetHeader>('DELETE FROM productos WHERE comercio_id = ? AND categoria_id = ?',
          [req.comercio_id, categoria_id]);

        const [eliminarCategoria] = await connection.query<ResultSetHeader>('DELETE FROM categorias WHERE comercio_id = ? AND categoria_id = ?',
          [req.comercio_id, categoria_id]);

          if(eliminarCategoria.affectedRows === 0) {
            return res.status(404).json({ error: 'Categoria no encontrada' });
          }
        
          res.send({message: 'Categoria eliminada correctamente'});

    } catch (e : any) {
        console.error("error al obtener los datos", e.message);
        res.status(500).json({ error: "Ha ocurrido un error inesperado, intentelo de nuevo"  });
    }
  }

  // Importación masiva, paso 1: crea las categorías que no existan y devuelve sus ids
  static async importarCategorias(req: Request, res: Response) {
    const { categorias } = req.body;

    if (!Array.isArray(categorias) || categorias.length === 0 || categorias.length > 500) {
        return res.status(400).json({ error: 'Lista de categorías no válida' });
    }

    const nombres = [...new Set<string>(
      categorias.map((c) => String(c).trim().toLowerCase()).filter((c) => c !== '')
    )];

    if (nombres.length === 0) return res.status(400).json({ error: 'Lista de categorías vacía' });

    try {
        // INSERT IGNORE: si (comercio_id, categoria_nombre) ya existe, se salta esa fila
        await connection.query('INSERT IGNORE INTO categorias (comercio_id, categoria_nombre, dias_aviso) VALUES ?',
          [nombres.map((n) => [req.comercio_id, n, 3])]);

        const [filas] = await connection.query<RowDataPacket[]>('SELECT categoria_id, categoria_nombre FROM categorias WHERE comercio_id = ? AND categoria_nombre IN (?)',
          [req.comercio_id, nombres]);

        res.json({ categorias: filas });

    } catch (e : any) {
        console.error("error al importar categorías", e.message);
        res.status(500).json({ error: "Ha ocurrido un error inesperado, intentelo de nuevo"  });
    }
  }

  // Importación masiva, paso 2: un lote de productos (con su categoria_id) + sus códigos de barras
  static async importarProductos(req: Request, res: Response) {
    const { productos } = req.body;

    if (!Array.isArray(productos) || productos.length === 0 || productos.length > 500) {
        return res.status(400).json({ error: 'Lote de productos no válido' });
    }

    const esEan = (s: string) => /^\d+$/.test(s) && [8, 12, 13, 14].includes(s.length);

    // Validar y quitar nombres repetidos dentro del lote
    const vistos = new Set<string>();
    const lista: { nombre: string; categoria_id: number; codigo: string | null }[] = [];

    for (const p of productos) {
      const nombre = String(p?.producto_nombre ?? '').trim();
      const categoria_id = Number(p?.categoria_id);
      const codigo = p?.codigo_barras ? String(p.codigo_barras).trim() : null;

      if (nombre === '' || nombre.length > 255 || !Number.isInteger(categoria_id)) {
        return res.status(400).json({ error: 'Hay productos con datos no válidos' });
      }
      if (vistos.has(nombre)) continue;
      vistos.add(nombre);

      lista.push({ nombre, categoria_id, codigo: codigo && esEan(codigo) ? codigo : null });
    }

    const conn = await connection.getConnection();

    try {
        // Las categorías tienen que ser de este comercio
        const idsCategorias = [...new Set(lista.map((p) => p.categoria_id))];
        const [categoriasValidas] = await conn.query<RowDataPacket[]>('SELECT categoria_id FROM categorias WHERE comercio_id = ? AND categoria_id IN (?)',
          [req.comercio_id, idsCategorias]);

        if (categoriasValidas.length !== idsCategorias.length) {
          return res.status(400).json({ error: 'Alguna categoría no existe' });
        }

        await conn.beginTransaction();

        // INSERT IGNORE: affectedRows solo cuenta las filas realmente insertadas
        const [insertados] = await conn.query<ResultSetHeader>('INSERT IGNORE INTO productos (comercio_id, categoria_id, producto_nombre) VALUES ?',
          [lista.map((p) => [req.comercio_id, p.categoria_id, p.nombre])]);

        // Ids de todos los productos del lote (los nuevos y los que ya existían)
        const [filas] = await conn.query<RowDataPacket[]>('SELECT producto_id, producto_nombre FROM productos WHERE comercio_id = ? AND producto_nombre IN (?)',
          [req.comercio_id, lista.map((p) => p.nombre)]);

        const idPorNombre = new Map<string, number>(filas.map((f) => [String(f.producto_nombre).toLowerCase(), f.producto_id]));

        // Códigos de barras: un mismo código no puede ir a dos productos (el escáner buscaría por código)
        const candidatos = lista.filter((p) => p.codigo !== null);
        let codigosGuardados = 0;
        let codigosRepetidos = 0;

        if (candidatos.length > 0) {
          const [usados] = await conn.query<RowDataPacket[]>('SELECT codigo_barras FROM producto_codigo_barras WHERE comercio_id = ? AND codigo_barras IN (?)',
            [req.comercio_id, candidatos.map((p) => p.codigo)]);
          const codigosUsados = new Set<string>(usados.map((u) => String(u.codigo_barras)));

          const nuevos: (number | string)[][] = [];
          for (const p of candidatos) {
            const producto_id = idPorNombre.get(p.nombre.toLowerCase());
            if (!producto_id || codigosUsados.has(p.codigo!)) { codigosRepetidos++; continue; }
            codigosUsados.add(p.codigo!); // evita repetirlo dentro del propio lote
            nuevos.push([req.comercio_id, producto_id, p.codigo!]);
          }

          if (nuevos.length > 0) {
            const [rCodigos] = await conn.query<ResultSetHeader>('INSERT IGNORE INTO producto_codigo_barras (comercio_id, producto_id, codigo_barras) VALUES ?',
              [nuevos]);
            codigosGuardados = rCodigos.affectedRows;
          }
        }

        await conn.commit();

        res.json({
          insertados: insertados.affectedRows,
          existentes: lista.length - insertados.affectedRows,
          codigosGuardados,
          codigosRepetidos,
        });

    } catch (e : any) {
        await conn.rollback();
        console.error("error al importar productos", e.message);
        res.status(500).json({ error: "Ha ocurrido un error inesperado, intentelo de nuevo"  });
    } finally {
        conn.release();
    }
  }

}