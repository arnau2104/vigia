import { ArrowLeft, PackageOpen } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import CabeceraPagina from '../components/CabeceraPagina'
import EditorDias from '../components/EditorDias'
import InsigniaLote from '../components/InsigniaLote'
import { categoriasMuestra, lotesMuestra, productosMuestra } from '../data/muestra'

export default function CategoriaDetallePage() {
  const { id } = useParams()
  const categoria = categoriasMuestra.find((c) => c.id === id)

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

  const productos = productosMuestra.filter((p) => p.categoriaId === categoria.id)

  return (
    <div className="pagina">
      <Link to="/categorias" className="volver"><ArrowLeft size={18} aria-hidden />Categorías</Link>
      <CabeceraPagina
        titulo={categoria.nombre}
        descripcion={`${productos.length} ${productos.length === 1 ? 'producto' : 'productos'} en esta categoría.`}
      />

      <section className="panel panel--aviso">
        <div>
          <h2 className="subtitulo">Días de aviso</h2>
          <p>Te avisamos con esta antelación para todos los productos de {categoria.nombre}.</p>
        </div>
        <EditorDias inicial={categoria.diasAviso} />
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
              const lotes = lotesMuestra.filter((l) => l.ean === p.ean)
              return (
                <article key={p.id} className="producto-fila" style={{ '--i': i } as React.CSSProperties}>
                  <div>
                    <h3>{p.nombre}</h3>
                    <p>EAN {p.ean}</p>
                  </div>
                  <div className="fechas">
                    {lotes.length === 0 ? (
                      <small>Sin lotes registrados</small>
                    ) : (
                      lotes.map((l) => (
                        <InsigniaLote key={l.id} lote={l} conFecha />
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
