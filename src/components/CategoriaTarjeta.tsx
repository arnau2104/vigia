import { ChevronRight, FolderOpen,Pencil, Trash } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Categoria } from '../types/categoria'
import type { Producto } from '../types/producto';
import { ucFirst } from '../utils/ucFirst'
import { useState } from 'react';
import Modal from './Modal';
import { createPortal } from 'react-dom';

type Props = { categoria: Categoria; indice: number; productos: Producto[], getCategorias?: () => void };

export default function CategoriaTarjeta( { categoria, indice, productos, getCategorias }: Props ) {
const categoriaProductos = productos.filter((p) => p.categoria_id === categoria.categoria_id).length;

const [mensaje, setMensaje] = useState<[string, string]>(['', '']);
const [categoriaAEliminar, setCategoriaAEliminar] = useState<Categoria | null>(null);

const eliminarCategoria = (categoria_id: number) => {
  fetch('/api/eliminarCategoria', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ categoria_id }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.error) return console.error('Error al eliminar la categoría:', data.error);
     
      setMensaje(['success',data.message]);
      setTimeout(() => {
        setMensaje(['',''])
        setCategoriaAEliminar(null)
        if (getCategorias) getCategorias()
      }, 2000);}
    )
    .catch((error) => {
      console.error('Error al eliminar la categoría:', error);
    })
}


  return (
    <>
      <div className="categoria" style={{ '--i': indice } as React.CSSProperties}>
        <div className="categoria__acciones">
          <Link
            to={`/categorias/editar/${categoria.categoria_id}`}
            className="categoria__accion"
            aria-label={`Editar ${categoria.categoria_nombre}`}
          >
            <Pencil size={18} aria-hidden />
          </Link>
          <button type="button" onClick={()=> setCategoriaAEliminar(categoria)}
            className="categoria__accion accion_eliminar"
            aria-label={`Eliminar ${categoria.categoria_nombre}`}
          >
            <Trash size={18} aria-hidden />
          </button>
        </div>
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

      {categoriaAEliminar && createPortal (
        <Modal
          show={setCategoriaAEliminar}
          text="¿Desea eliminar la categoría y todos sus productos?"
          nombre={categoriaAEliminar.categoria_nombre}
          objectDelete={categoriaAEliminar.categoria_id}
          funcionEliminar={eliminarCategoria}
          mensaje={mensaje}
        />,
        document.body
      )}

    </>
   
  )
}
