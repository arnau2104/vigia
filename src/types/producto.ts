export interface Producto {
  producto_id: number
  comercio_id: number
  categoria_id: number
  producto_nombre: string
}

export interface ProductoView {
  producto_id: number
  producto_nombre: string
  comercio_id: number
  comercio_nombre: string
  categoria_id: number
  categoria_nombre: string
  dias_aviso: number
}