import type { Categoria } from '../types/categoria'
import type { Lote } from '../types/lote'
import type { Producto } from '../types/producto'

export const categoriasMuestra: Categoria[] = [
  { categoria_id: 1, comercio_id: 1, categoria_nombre: 'Lácteos', dias_aviso: 5 },
  { categoria_id: 2, comercio_id: 1, categoria_nombre: 'Frescos', dias_aviso: 2 },
  { categoria_id: 3, comercio_id: 1, categoria_nombre: 'Carnicería', dias_aviso: 2 },
  { categoria_id: 4, comercio_id: 1, categoria_nombre: 'Charcutería', dias_aviso: 4 },
  { categoria_id: 5, comercio_id: 1, categoria_nombre: 'Panadería', dias_aviso: 3 },
  { categoria_id: 6, comercio_id: 1, categoria_nombre: 'Bebidas', dias_aviso: 10 },
  { categoria_id: 7, comercio_id: 1, categoria_nombre: 'Congelados', dias_aviso: 15 },
]

export const productosMuestra: Producto[] = [
  { producto_id: 1, comercio_id: 1, categoria_id: 1, producto_nombre: 'Yogur natural pack 4' },
  { producto_id: 2, comercio_id: 1, categoria_id: 3, producto_nombre: 'Pechuga de pollo 500 g' },
  { producto_id: 3, comercio_id: 1, categoria_id: 1, producto_nombre: 'Leche entera 1 L' },
  { producto_id: 4, comercio_id: 1, categoria_id: 2, producto_nombre: 'Ensalada mezcla 250 g' },
  { producto_id: 5, comercio_id: 1, categoria_id: 4, producto_nombre: 'Jamón cocido lonchas' },
  { producto_id: 6, comercio_id: 1, categoria_id: 5, producto_nombre: 'Pan de molde integral' },
  { producto_id: 7, comercio_id: 1, categoria_id: 6, producto_nombre: 'Zumo de naranja 1 L' },
  { producto_id: 8, comercio_id: 1, categoria_id: 1, producto_nombre: 'Queso curado cuña' },
]

// estado: 1 = activo, 0 = retirado
export const lotesMuestra: Lote[] = [
  { lote_id: 1, comercio_id: 1, producto_id: 1, producto_nombre: 'Yogur natural pack 4', fecha_caducidad: '2026-10-03', fecha_entrada: '2026-09-20', cantidad: 1, estado: 1, fecha_retirada: null },
  { lote_id: 2, comercio_id: 1, producto_id: 2, producto_nombre: 'Pechuga de pollo 500 g', fecha_caducidad: '2026-10-04', fecha_entrada: '2026-09-28', cantidad: 1, estado: 0, fecha_retirada: '2026-10-05' },
  { lote_id: 3, comercio_id: 1, producto_id: 3, producto_nombre: 'Leche entera 1 L', fecha_caducidad: '2026-10-05', fecha_entrada: '2026-09-22', cantidad: 1, estado: 1, fecha_retirada: null },
  { lote_id: 4, comercio_id: 1, producto_id: 4, producto_nombre: 'Ensalada mezcla 250 g', fecha_caducidad: '2026-10-05', fecha_entrada: '2026-09-30', cantidad: 1, estado: 1, fecha_retirada: null },
  { lote_id: 5, comercio_id: 1, producto_id: 5, producto_nombre: 'Jamón cocido lonchas', fecha_caducidad: '2026-10-07', fecha_entrada: '2026-09-29', cantidad: 1, estado: 1, fecha_retirada: null },
  { lote_id: 6, comercio_id: 1, producto_id: 6, producto_nombre: 'Pan de molde integral', fecha_caducidad: '2026-10-09', fecha_entrada: '2026-10-01', cantidad: 1, estado: 1, fecha_retirada: null },
  { lote_id: 7, comercio_id: 1, producto_id: 7, producto_nombre: 'Zumo de naranja 1 L', fecha_caducidad: '2026-10-24', fecha_entrada: '2026-09-25', cantidad: 1, estado: 1, fecha_retirada: null },
  { lote_id: 8, comercio_id: 1, producto_id: 8, producto_nombre: 'Queso curado cuña', fecha_caducidad: '2026-11-18', fecha_entrada: '2026-09-26', cantidad: 1, estado: 1, fecha_retirada: null },
  { lote_id: 9, comercio_id: 1, producto_id: 1, producto_nombre: 'Yogur natural pack 4', fecha_caducidad: '2026-10-19', fecha_entrada: '2026-10-02', cantidad: 1, estado: 1, fecha_retirada: null },
  { lote_id: 10, comercio_id: 1, producto_id: 3, producto_nombre: 'Leche entera 1 L', fecha_caducidad: '2026-10-30', fecha_entrada: '2026-10-03', cantidad: 1, estado: 1, fecha_retirada: null },
]
