import { ArrowLeft, PackageOpen } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import CabeceraPagina from '../components/CabeceraPagina'
import EditorDias from '../components/EditorDias'
import InsigniaLote from '../components/InsigniaLote'
import { useEffect,useState} from 'react'
import type { Producto } from '../types/producto'
import type { Categoria } from '../types/categoria'
import type { LoteView } from '../types/lote'
import type { CodigoBarras } from '../types/codigoBarras'
import { ucFirst } from '../utils/ucFirst'
export default function CategoriaDetallePage() {
  const { categoria_id } = useParams()
  const [categoria,setCategoria] = useState<Categoria | null>(null)
  const [productos, setProductos] = useState<Producto[]>([])
  const [lotes, setLotes] = useState<LoteView[]>([])
  const [codigosBarras, setCodigosBarras] = useState<CodigoBarras[]>([])

  useEffect(()=> {
    if(!categoria_id) return 
    getProductosCategoria()
  },[categoria_id])

  function getProductosCategoria() {
    fetch('/api/getCategoriaIndivPage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ categoria_id }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
         return console.error('Error al obtener los productos de la categoría:', data.error);
        } 
          setProductos(data.productos);
          setCategoria(data.categoria);
          setLotes(data.lotes);
          setLotes(data.lotes);
          setCodigosBarras(data.codigosBarras);
        
      })
      .catch((error) => {
        console.error('Error al obtener los productos de la categoría:', error);
      })
    }
  

  if (!categoria) {
    return (
      <div className="pagina">
        <Link to="/categorias" className="volver"><ArrowLeft size={18} aria-hidden />Categorías</Link>
        <div className="vacio">
          <PackageOpen size={32} aria-hidden />
          <p>No encontramos esta categoría.</p>
        </div>
      </div>
    )
  }


  return (
    <div className="pagina">
      <Link to="/categorias" className="volver"><ArrowLeft size={18} aria-hidden />Categorías</Link>
      <CabeceraPagina
        titulo={ucFirst(categoria.categoria_nombre)}
        descripcion={`${productos.length} ${productos.length === 1 ? 'producto' : 'productos'} en esta categoría.`}
      />

      <section className="panel panel--aviso">
        <div>
          <h2 className="subtitulo">Días de aviso</h2>
          <p>Te avisamos con esta antelación para todos los productos de {categoria.categoria_nombre}.</p>
        </div>
        <EditorDias inicial={categoria.dias_aviso} />
      </section>

      <section aria-labelledby="productos-cat">
        <h2 id="productos-cat" className="subtitulo">Productos y fechas</h2>
        {productos.length === 0 ? (
          <div className="vacio">
            <PackageOpen size={32} aria-hidden />
            <p>Aún no hay productos en esta categoría.</p>
          </div>
        ) : (
          <div className="lista-lotes">
            {productos.map((p, i) => {
              const codigoBarrasProducto = codigosBarras.filter((cb) => cb.producto_id === p.producto_id)
              // const lotes = lotesMuestra.filter((l) => l.ean === p.ean)
              return (
                <article key={p.producto_id} className="producto-fila" style={{ '--i': i } as React.CSSProperties}>
                  <div>
                    <h3>{ucFirst(p.producto_nombre)}</h3>
                    {codigoBarrasProducto.map((cb) => {
                       return  <p key={cb.producto_codigo_id}><span className='tipo_codigo'>{cb?.tipo_codigo}</span> {cb?.codigo_barras}</p>

                    })}
                  </div>
                  <div className="fechas">
                    {lotes.length === 0 ? (
                      <small>Sin lotes registrados</small>
                    ) : (
                      lotes.filter((l) => l.producto_id === p.producto_id).map((l) => (
                        <InsigniaLote key={l.lote_id} lote={l} conFecha />
                      ))
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
