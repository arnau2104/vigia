import { useState } from 'react'
import { ScanBarcode, Search } from 'lucide-react'
import EscanerCodigo from './EscanerCodigo'

interface Props {
  busqueda: string
  onBusqueda: (texto: string) => void
}

export default function BuscadorEscaneo({ busqueda, onBusqueda }: Props) {
  const [escaneando, setEscaneando] = useState(false)

  // El código leído se usa como texto de búsqueda: el filtro de la página lo cruza con la tabla de códigos
  const alDetectar = (codigo: string) => {
    onBusqueda(codigo)
    console.log("codigo leido:", codigo)
    setEscaneando(false)
  }

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
            onChange={(e) => onBusqueda(e.target.value)}
          />
        </label>
        <button
          type="button"
          className="boton boton--secundario"
          aria-label="Escanear código de barras"
          onClick={() => setEscaneando(true)}
        >
          <ScanBarcode size={22} aria-hidden />
          <span className="buscador__texto">Escanear</span>
        </button>
      </div>

      {escaneando && <EscanerCodigo onDetectar={alDetectar} onCerrar={() => setEscaneando(false)} />}
    </div>
  )
}
