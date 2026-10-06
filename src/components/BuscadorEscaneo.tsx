import { useState } from 'react'
import { ScanBarcode, Search, X } from 'lucide-react'
import { lotesMuestra, productosMuestra } from '../data/muestra'
import type { ProductoMuestra } from '../types/lote'
import { loteMasUrgente } from '../utils/lotes'
import InsigniaLote from './InsigniaLote'

export default function BuscadorEscaneo() {
  const [busqueda, setBusqueda] = useState('')
  const [escaneando, setEscaneando] = useState(false)
  const [encontrado, setEncontrado] = useState<ProductoMuestra | null>(null)

  // Solo maqueta: simula leer un código y consultar sus fechas.
  const escanear = () => {
    setEncontrado(null)
    setEscaneando(true)
    setTimeout(() => {
      setEscaneando(false)
      setEncontrado(productosMuestra[0])
      setBusqueda(productosMuestra[0].ean)
    }, 1800)
  }

  const principal = encontrado ? loteMasUrgente(encontrado.ean, lotesMuestra) : undefined
  const lotes = encontrado ? lotesMuestra.filter((l) => l.ean === encontrado.ean) : []

  return (
    <div className="buscador">
      <div className="buscador__fila">
        <label className="busqueda">
          <span className="solo-lectores">Buscar producto</span>
          <Search size={20} aria-hidden />
          <input
            type="search"
            placeholder="Buscar por nombre o EAN"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </label>
        <button
          type="button"
          className={`boton boton--secundario${escaneando ? ' escaneando' : ''}`}
          aria-label="Escanear código de barras"
          onClick={escanear}
        >
          <ScanBarcode size={22} aria-hidden />
          <span className="buscador__texto">{escaneando ? 'Escaneando…' : 'Escanear'}</span>
        </button>
      </div>

      {encontrado && (
        <section className="panel resultado" aria-label="Resultado del escaneo">
          <div className="resultado__cabecera">
            <div>
              <h2>{encontrado.nombre}</h2>
              <p className="resultado__ean">
                EAN {encontrado.ean}
                {principal && <InsigniaLote lote={principal} conFecha />}
              </p>
            </div>
            <button
              type="button"
              className="zona-csv__quitar"
              aria-label="Cerrar resultado"
              onClick={() => setEncontrado(null)}
            >
              <X size={18} aria-hidden />
            </button>
          </div>
          <div className="fechas">
            {lotes.length === 0 ? (
              <small>Sin lotes registrados</small>
            ) : (
              lotes.map((l) => <InsigniaLote key={l.id} lote={l} conFecha />)
            )}
          </div>
        </section>
      )}
    </div>
  )
}
