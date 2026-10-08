export interface CodigoBarras {
    producto_codigo_id: number
    comercio_id: number
    producto_id: number
    codigo_barras: string
    tipo_codigo: string
}

export interface CodigoBarrasView {
    producto_codigo_id: number
    codigo_barras: string
    tipo_codigo: string
    comercio_id: number
    comercio_nombre: string
    logo?: string
    producto_id: number
    producto_nombre: string
    categoria_id: number
    categoria_nombre: string
    
}