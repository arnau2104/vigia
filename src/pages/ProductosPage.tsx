import { FileUp,Pencil,Trash,Plus,PackagePlus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { createPortal } from 'react-dom'
import { useState,useEffect, useMemo } from 'react'
import BuscadorEscaneo from '../components/BuscadorEscaneo'
import CabeceraPagina from '../components/CabeceraPagina'
import InsigniaLote from '../components/InsigniaLote'
import ProductoTarjeta from '../components/ProductoTarjeta'
import type { ProductoView } from '../types/producto'
import type { LoteView } from '../types/lote'
import type { Categoria } from '../types/categoria'
import type { CodigoBarrasView } from '../types/codigoBarras'
import { ucFirst } from '../utils/ucFirst'
import { tipoAviso } from '../utils/tipoAviso'
import Modal from '../components/Modal'
import Paginacion from '../components/Paginacion'
import { useDebounce } from '../utils/useDebounce'

const TAMANO_PAGINA = 50

interface ProductoConLote {
  p: ProductoView
  lote: LoteView | undefined   // un producto puede no tener lotes
}

export default function ProductosPage() {

  const [productos, setProductos] = useState<ProductoView[]>([])
  const [lotes, setLotes] = useState<LoteView[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [codigosBarras, setCodigosBarras] = useState<CodigoBarrasView[]>([])

  const [loading, setLoading] = useState(true)

  const [filtroEstado, setFiltroEstado] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('')
  const [filtroUrgencia, setFiltroUrgencia] = useState('')
  const [filtroTexto, setFiltroTexto] = useState('')
  const textoDebounce = useDebounce(filtroTexto, 300)
  const [pagina, setPagina] = useState(1)
  const [productoAEliminar, setProductoAEliminar] = useState<ProductoView | null>(null)
  const [mensaje, setMensaje] = useState<[string,string]>(['','']) // [tipo, mensaje] tipo puede ser 'successMsg' o 'errorMsg('')

  useEffect(() => {
    getProductosPageData()
  }, [])

  function getProductosPageData() {
    setLoading(true)
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
        setCodigosBarras(data.codigosBarras)
      })
      .catch((error) => {
        console.error('Error al obtener productos:', error);
      })
      // Se quita el loading también si falla la petición, para que no se quede cargando para siempre
      .finally(() => setLoading(false));
  }

  const eliminarProducto = (p: ProductoView) => {
    fetch('/api/eliminarProducto', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ producto_id: p.producto_id }),
    }).then((res) => res.json())
      .then((data) => {
        if (data.error) return setMensaje(['error',data.error]), console.error('Error al eliminar producto:', data.error);
        setMensaje(['success',data.message]);
        setTimeout(() => {
          setMensaje(['',''])
          setProductoAEliminar(null)
          getProductosPageData()
        }, 2000);
      })
      .catch((error) => {
        console.error('Error al eliminar producto:', error);
        setMensaje(['errorMsg','Error al eliminar producto']);
      })
  }
  

  // Índices que se calculan UNA vez al cargar los datos, en vez de recorrer todas las listas por cada producto

  // Lote que antes caduca de cada producto (el que muestra la tabla)
  const lotePorProducto = useMemo(() => {
    const mapa = new Map<number, LoteView>()
    for (const l of lotes) {
      const actual = mapa.get(l.producto_id)
      if (!actual || l.fecha_caducidad < actual.fecha_caducidad) mapa.set(l.producto_id, l)
    }
    return mapa
  }, [lotes])

  // Productos que tienen algún lote activo
  const productosConLoteActivo = useMemo(
    () => new Set(lotes.filter((l) => l.activo !== 0).map((l) => l.producto_id)),
    [lotes]
  )

  // Códigos de barras (en minúsculas) de cada producto
  const codigosPorProducto = useMemo(() => {
    const mapa = new Map<number, string[]>()
    for (const cb of codigosBarras) {
      const codigo = cb.codigo_barras.toLowerCase()
      const lista = mapa.get(cb.producto_id)
      if (lista) lista.push(codigo)
      else mapa.set(cb.producto_id, [codigo])
    }
    return mapa
  }, [codigosBarras])

  const productosFiltrados = useMemo<ProductoConLote[]>(() => {
  const texto = textoDebounce.toLowerCase()

  return productos
    .map((p) : ProductoConLote => ({ p, lote: lotePorProducto.get(p.producto_id) }))
    .filter(({ p, lote }) => {

      //filtro de texto, mira si el nombre del producto o el codigo de barrras coinciden con el texto
      if (texto) {
        const coincideNombreProducto = p.producto_nombre.toLowerCase().includes(texto)
        const coincideCodigoBarras = (codigosPorProducto.get(p.producto_id) ?? []).some((codigo) => codigo.includes(texto))
        if (!coincideNombreProducto && !coincideCodigoBarras) return false
      }

      if (filtroCategoria && String(p.categoria_id) !== filtroCategoria) return false

      // pendiente de reposición: ningún lote activo del producto
      const sinLoteActivo = !productosConLoteActivo.has(p.producto_id)
      if (filtroEstado === 'pendiente' && !sinLoteActivo) return false
      if (filtroEstado === 'aviso' && (!lote || lote.activo === 0)) return false

      // un lote retirado no tiene urgencia (la insignia muestra "pendiente")
      if (filtroUrgencia && (!lote || lote.activo === 0 || tipoAviso(lote) !== filtroUrgencia)) return false

      return true
    })
}, [productos, lotePorProducto, productosConLoteActivo, codigosPorProducto, filtroCategoria, filtroEstado, filtroUrgencia, textoDebounce])

  // Al cambiar cualquier filtro se vuelve a la primera página
  useEffect(() => {
    setPagina(1)
  }, [filtroCategoria, filtroEstado, filtroUrgencia, textoDebounce])

  // Solo se pintan los productos de la página actual
  const totalPaginas = Math.max(1, Math.ceil(productosFiltrados.length / TAMANO_PAGINA))
  const paginaActual = Math.min(pagina, totalPaginas) // por si al borrar quedan menos páginas
  const productosPagina = productosFiltrados.slice((paginaActual - 1) * TAMANO_PAGINA, paginaActual * TAMANO_PAGINA)

  const cambiarPagina = (nueva: number) => {
    setPagina(nueva)
    document.getElementById('pagina-productos')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }


  return (
    <div className="pagina" id='pagina-productos'>
      <CabeceraPagina titulo="Productos" descripcion="Todos los productos con sus fechas de caducidad.">
        <div className='contenedor-botones'>
          <Link to="/producto/registrar" className='boton boton--secundario' >
              <Plus size={22} aria-hidden />
              Añadir
          </Link>
        <Link to="/importar" className="boton boton--suave">
          <FileUp size={20} aria-hidden />
          Importar CSV
        </Link>
        </div>
         
      </CabeceraPagina>
      {productos && <p>{productos.length} productos</p>}
      <BuscadorEscaneo busqueda={filtroTexto} onBusqueda={setFiltroTexto} />
      <div className="filtros">
        <label className="campo campo--corto">
          <span className="solo-lectores">Estado</span>
          <select defaultValue="" onChange={(e)=> setFiltroEstado(e.target.value)}>
            <option value="">Todos los estados</option>
            <option value="aviso">Con aviso</option>
            <option value="pendiente">Pendiente de reposición</option>
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

      {loading && <p role="status" className="solo-lectores">Cargando productos…</p>}

      <div className="lista-lotes lista-lotes--movil" aria-busy={loading}>
        {loading
          ? Array.from({ length: 6 }, (_, i) => (
              <article key={i} className="lote lote--esqueleto" style={{ '--i': i } as React.CSSProperties} aria-hidden="true">
                <div className="lote__cabecera">
                  <span className="esqueleto esqueleto--titulo" />
                  <span className="esqueleto esqueleto--insignia" />
                </div>
                <span className="esqueleto esqueleto--linea" />
                <div className="lote__acciones producto__acciones">
                  <span className="esqueleto esqueleto--boton" />
                  <span className="esqueleto esqueleto--boton" />
                  <span className="esqueleto esqueleto--boton" />
                </div>
              </article>
            ))
          : productosPagina.map(({p, lote}, i) => (
              // lote puede ser undefined (sin lotes): ProductoTarjeta ya lo contempla
              <ProductoTarjeta key={p.producto_id} producto={p} loteProducto={lote as LoteView} indice={Math.min(i, 10)} />
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
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody aria-busy={loading}>
            {loading && Array.from({ length: 8 }, (_, i) => (
              <tr key={i} className="fila-esqueleto" style={{ '--i': i } as React.CSSProperties} aria-hidden="true">
                <td><span className="esqueleto esqueleto--texto" style={{ width: '70%' }} /></td>
                <td><span className="esqueleto esqueleto--texto" style={{ width: '50%' }} /></td>
                <td><span className="esqueleto esqueleto--texto" style={{ width: '60%' }} /></td>
                <td><span className="esqueleto esqueleto--insignia" /></td>
                <td>
                  <div className="acciones">
                    <span className="esqueleto esqueleto--icono" />
                    <span className="esqueleto esqueleto--icono" />
                    <span className="esqueleto esqueleto--icono" />
                  </div>
                </td>
              </tr>
            ))}
            {!loading && productosPagina.map(({p, lote}, i) => {
              // lote que antes caduca (puede ser undefined si el producto no tiene lotes)
              const lotesProducto = lote as LoteView

              return (
                <tr key={p.producto_id} style={{ '--i': Math.min(i, 10) } as React.CSSProperties}>
                  <td>
                    <strong>{ucFirst(p.producto_nombre)}</strong>
                    {/* <small>{l.ean}</small> */}
                  </td>
                  <td>{ucFirst(p.categoria_nombre)}</td>
                  
                    
                    {/* IMPLEMENTAR MAS ADELANTE */}
                    {/* <td>{lotesProducto.ubicacion}</td> */} 
                    <td>{lotesProducto ? lotesProducto.fecha_caducidad : ''}</td>
                    <td>{lotesProducto ? <InsigniaLote lote={lotesProducto} />  : <InsigniaLote lote={lotesProducto} retirado /> }</td>
                    <td>
                      <div className='acciones'>
                          <Link to={`/productos/${p.producto_id}/editar`} className='edit'><Pencil className='edit' size={20} aria-hidden /> </Link>
                         <button type='button' className='delete' aria-label='Eliminar producto' title='Eliminar' onClick={() => setProductoAEliminar(p)}>
                           <Trash className='delete' size={20} aria-hidden />
                         </button>
                         <Link to={`/reponer/${p.producto_id}`} > <PackagePlus  className='replenish' size={20} aria-hidden /> </Link>

                      </div>
                    </td>
                  
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {!loading && (
        <Paginacion
          pagina={paginaActual}
          totalPaginas={totalPaginas}
          total={productosFiltrados.length}
          tamano={TAMANO_PAGINA}
          onCambiar={cambiarPagina}
        />
      )}

      {productoAEliminar && createPortal(
        <Modal show={setProductoAEliminar} text="¿Estás seguro que quieres eliminar el producto?" nombre={productoAEliminar.producto_nombre} mensaje={mensaje} objectDelete={productoAEliminar} funcionEliminar={eliminarProducto} />,
        document.body
      )}
    </div>
  )
}
