import { FileUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState,useEffect, useMemo } from 'react'
import BuscadorEscaneo from '../components/BuscadorEscaneo'
import CabeceraPagina from '../components/CabeceraPagina'
import InsigniaLote from '../components/InsigniaLote'
import LoteTarjeta from '../components/LoteTarjeta'
import type { ProductoView } from '../types/producto'
import type { LoteView } from '../types/lote'
import type { Categoria } from '../types/categoria'
import { ucFirst } from '../utils/ucFirst'
import { tipoAviso } from '../utils/tipoAviso'

interface ProductoConLote {
  p: ProductoView
  lote: LoteView | undefined   // un producto puede no tener lotes
}

export default function ProductosPage() {

  const [productos, setProductos] = useState<ProductoView[]>([])
  const [lotes, setLotes] = useState<LoteView[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])

  const [filtroEstado, setFiltroEstado] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('')
  const [filtroUrgencia, setFiltroUrgencia] = useState('')
  

  useEffect(() => {
    getProductosPageData()
  }, [])

  function getProductosPageData() {
    fetch('/api/getProductosPage',{
      method: 'GET',
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => {
        if(data.error) return console.error('Error al obtener productos:', data.error)
        setProductos(data.productos)
        setLotes(data.lotes)
        setCategorias(data.categorias)
      })
      .catch((error) => {
        console.error('Error al obtener productos:', error);
      });
  }

  const productosFiltrados = useMemo<ProductoConLote[]>(() => {
  return productos
    .map((p) : ProductoConLote => {
      // lote que antes caduca (el que muestra la tabla)
      const lote = lotes
        .filter((l) => l.producto_id === p.producto_id)
        .sort((a, b) => a.fecha_caducidad.localeCompare(b.fecha_caducidad))[0]
      return { p, lote }
    })
    .filter(({ p, lote }) => {
      if (filtroCategoria && String(p.categoria_id) !== filtroCategoria) return false

      if (filtroEstado === 'pendiente' && lote?.activo !== 0) return false
      if (filtroEstado === 'aviso' && (!lote || lote.activo === 0)) return false

      // un lote retirado no tiene urgencia (la insignia muestra "pendiente")
      if (filtroUrgencia && (!lote || lote.activo === 0 || tipoAviso(lote) !== filtroUrgencia)) return false

      return true
    })
}, [productos, lotes, filtroCategoria, filtroEstado, filtroUrgencia])


  return (
    <div className="pagina">
      <CabeceraPagina titulo="Productos" descripcion="Todos los productos con sus fechas de caducidad.">
        <Link to="/importar" className="boton boton--suave">
          <FileUp size={20} aria-hidden />
          Importar CSV
        </Link>
      </CabeceraPagina>
      <BuscadorEscaneo />
      <div className="filtros">
        <label className="campo campo--corto">
          <span className="solo-lectores">Estado</span>
          <select defaultValue="" onChange={(e)=> setFiltroEstado(e.target.value)}>
            <option value="">Todos los estados</option>
            <option value="aviso">Con aviso</option>
            <option value="proximo">Pendiente de reposición</option>
          </select>
        </label>
        <label className="campo campo--corto">
          <span className="solo-lectores">Categoría</span>
          <select defaultValue="" onChange={(e)=> setFiltroCategoria(e.target.value)}>
            <option value="">Todas las categorías</option>
            {categorias.map((categoria) => (
              <option key={categoria.categoria_id} value={categoria.categoria_id}>{ucFirst(categoria.categoria_nombre)}</option>
            ))}
          </select>
        </label>
        <label className="campo campo--corto">
          <span className="solo-lectores">Urgencia</span>
          <select defaultValue="" onChange={(e)=> setFiltroUrgencia(e.target.value)}>
            <option value="">Cualquier urgencia</option>
            <option value="caducado">Caducado</option>
            <option value="hoy">Hoy</option>
            <option value="proximo">Próximo</option>
            <option value="correcto">Correcto</option>
          </select>
        </label>
      </div>

      <div className="lista-lotes lista-lotes--movil">
        {lotes.map((lote, i) => (
          <LoteTarjeta key={lote.lote_id} lote={lote} indice={i} />
        ))}
      </div>

      <div className="tabla-envoltorio">
        <table className="tabla">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Categoría</th>
              {/* IMPLEMENTAR MAS ADELANTE */}
              {/* <th>Ubicación</th> */}
              <th>Caducidad</th>
              <th>Aviso</th>
            </tr>
          </thead>
          <tbody>
            {productosFiltrados.map(({p, lote}, i) => {
              //Ordenamos los lotes por fecha de caducidad y cogmemos el primero(el que antes caduca)
              const lotesProducto = lotes.filter((l) => l.producto_id === p.producto_id).sort((a, b) => a.fecha_caducidad.localeCompare(b.fecha_caducidad))[0]
              
              return (
                <tr key={p.producto_id} style={{ '--i': i } as React.CSSProperties}>
                  <td>
                    <strong>{ucFirst(p.producto_nombre)}</strong>
                    {/* <small>{l.ean}</small> */}
                  </td>
                  <td>{ucFirst(p.categoria_nombre)}</td>
                  {lote && (
                    <>
                    {/* IMPLEMENTAR MAS ADELANTE */}
                    {/* <td>{lotesProducto.ubicacion}</td> */} 
                    <td>{lotesProducto.fecha_caducidad}</td>
                    <td><InsigniaLote lote={lotesProducto} /></td>
                  </>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
