import { useState } from 'react'
import { Plus } from 'lucide-react'
import CabeceraPagina from '../components/CabeceraPagina'
import CategoriaTarjeta from '../components/CategoriaTarjeta'
import EditorDias from '../components/EditorDias'
import { categoriasMuestra } from '../data/muestra'

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState(categoriasMuestra)
  const [nombre, setNombre] = useState('')
  const [dias, setDias] = useState(3)

  // Solo maqueta: la categoría se añade en memoria hasta que exista el backend.
  const crear = (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombre.trim()) return
    setCategorias((actuales) => [...actuales, { id: crypto.randomUUID(), nombre: nombre.trim(), diasAviso: dias }])
    setNombre('')
  }

  return (
    <div className="pagina">
      <CabeceraPagina titulo="Categorías" descripcion="Agrupa tus productos y define cuándo quieres el aviso." />

      <form className="formulario formulario--ancho" onSubmit={crear}>
        <h2 className="subtitulo">Nueva categoría</h2>
        <div className="formulario__dos">
          <div className="campo">
            <label htmlFor="nombre-categoria">Nombre</label>
            <input
              id="nombre-categoria"
              placeholder="Ej. Pescadería"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>
          <div className="campo">
            <span className="campo__etiqueta">Avisar con antelación de</span>
            <EditorDias inicial={3} onChange={setDias} />
          </div>
        </div>
        <button type="submit" className="boton boton--primario boton--grande">
          <Plus size={22} aria-hidden />
          Crear categoría
        </button>
      </form>

      <section aria-labelledby="todas">
        <h2 id="todas" className="subtitulo">Todas las categorías ({categorias.length})</h2>
        <div className="categorias-grid">
          {categorias.map((c, i) => (
            <CategoriaTarjeta key={c.id} categoria={c} indice={i} />
          ))}
        </div>
      </section>
    </div>
  )
}
