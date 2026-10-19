import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  pagina: number
  totalPaginas: number
  total: number
  tamano: number
  onCambiar: (pagina: number) => void
}

export default function Paginacion({ pagina, totalPaginas, total, tamano, onCambiar }: Props) {
  if (totalPaginas <= 1) return null

  const desde = (pagina - 1) * tamano + 1
  const hasta = Math.min(pagina * tamano, total)

  return (
    <nav className="paginacion" aria-label="Paginación">
      <p className="paginacion__info">
        Mostrando {desde}–{hasta} de {total}
      </p>

      <div className="paginacion__botones">
        <button
          type="button"
          className="boton boton--secundario"
          disabled={pagina === 1}
          onClick={() => onCambiar(pagina - 1)}
        >
          <ChevronLeft size={20} aria-hidden />
          Anterior
        </button>

        <span className="paginacion__pagina" aria-live="polite">
          Página {pagina} de {totalPaginas}
        </span>

        <button
          type="button"
          className="boton boton--secundario"
          disabled={pagina === totalPaginas}
          onClick={() => onCambiar(pagina + 1)}
        >
          Siguiente
          <ChevronRight size={20} aria-hidden />
        </button>
      </div>
    </nav>
  )
}
