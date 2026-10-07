import { ChevronRight, FolderOpen,Pencil } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Categoria } from '../types/categoria'
import type { Producto } from '../types/producto';
import { ucFirst } from '../utils/ucFirst'

type Props = { categoria: Categoria; indice: number; productos: Producto[] };

export default function CategoriaTarjeta( { categoria, indice, productos }: Props ) {
const categoriaProductos = productos.filter((p) => p.categoria_id === categoria.categoria_id).length;


  return (
    <div className="categoria" style={{ '--i': indice } as React.CSSProperties}>
      <Link
        to={`/categorias/editar/${categoria.categoria_id}`}
        className="categoria__editar"
        aria-label={`Editar ${categoria.categoria_nombre}`}
      >
        <Pencil size={18} aria-hidden />
      </Link>
      <Link to={`/categoria/${categoria.categoria_id}`} className="categoria__enlace">
        <span className="categoria__icono">
          <FolderOpen size={22} aria-hidden />
        </span>
        <span className="categoria__texto">
          <strong>{ucFirst(categoria.categoria_nombre)} </strong>
          <small>
            {categoriaProductos} {categoriaProductos === 1 ? 'producto' : 'productos'} · aviso {categoria.dias_aviso} días
          </small>
        </span>
        <ChevronRight size={20} aria-hidden className="categoria__flecha" />
      </Link>
    </div>
  )
}
