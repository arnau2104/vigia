import { ChevronRight, FolderOpen } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Categoria } from '../types/categoria'
import type { Producto } from '../types/producto';

export default function CategoriaTarjeta({ categoria, indice, productos }: { categoria: Categoria; indice: number, productos: Producto[] }) {
const categoriaProductos = productos.filter((p) => p.categoria_id === categoria.categoria_id).length;
const ucFirst = (str: string): string =>
  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

  return (
    <Link
      to={`/categorias/${categoria.categoria_id}`}
      className="categoria"
      style={{ '--i': indice } as React.CSSProperties}
    >
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
  )
}
