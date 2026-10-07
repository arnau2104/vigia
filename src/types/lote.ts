export type NivelUrgencia = 'caducado' | 'hoy' | 'proximo' | 'correcto'

/** `retirado` = fuera de venta y pendiente de reposición: no genera avisos. */
export type EstadoLote = 'activo' | 'retirado'

/** Datos de muestra solo para maquetar: la lógica real llegará con el backend. */
export interface Lote {
  lote_id: number
  comercio_id: number
  producto_id: number
  producto_nombre: string
  fecha_caducidad: string   // llega como string ISO por JSON
  fecha_entrada: string
  cantidad: number | null
  activo: number            // tinyint: 0 / 1
  fecha_retirada: string | null
}

export interface LoteView {
  lote_id: number
  comercio_id: number
  comercio_nombre: string
  producto_id: number
  producto_nombre: string
  categoria_id: number
  categoria_nombre: string
  dias_aviso: number
  fecha_caducidad: string   // llega como string ISO por JSON
  fecha_entrada: string
  cantidad: number | null
  activo: number            // tinyint: 0 / 1
  fecha_retirada: string | null
}


