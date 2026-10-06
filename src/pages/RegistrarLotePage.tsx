import { useState } from 'react'
import { Camera, CircleCheck, PackagePlus, ScanBarcode } from 'lucide-react'
import CabeceraPagina from '../components/CabeceraPagina'

export default function RegistrarLotePage() {
  const [escaneando, setEscaneando] = useState(false)

  const simularEscaneo = () => {
    setEscaneando(true)
    setTimeout(() => setEscaneando(false), 1800)
  }

  return (
    <div className="pagina">
      <CabeceraPagina titulo="Registrar lote" descripcion="Añade mercancía recién recibida." />
      <form className="formulario" onSubmit={(e) => e.preventDefault()}>
        <div className="campo">
          <label htmlFor="ean">Código EAN</label>
          <div className="fila-ean">
            <input id="ean" inputMode="numeric" placeholder="8410000123456" />
            <button
              type="button"
              className={`boton boton--secundario${escaneando ? ' escaneando' : ''}`}
              onClick={simularEscaneo}
            >
              <ScanBarcode size={22} aria-hidden />
              {escaneando ? 'Escaneando…' : 'Escanear'}
            </button>
          </div>
          <p className="producto-detectado">
            <CircleCheck size={18} aria-hidden />
            Yogur natural pack 4
          </p>
        </div>

        <div className="campo">
          <label htmlFor="fecha">Fecha de caducidad</label>
          <input id="fecha" type="date" />
          <button type="button" className="boton boton--suave boton--ancho">
            <Camera size={20} aria-hidden />
            Leer fecha con foto
          </button>
        </div>

        <div className="formulario__dos">
          <div className="campo">
            <label htmlFor="cantidad">Unidades (opcional)</label>
            <input id="cantidad" type="number" min="1" inputMode="numeric" defaultValue={1} />
            <small className="ayuda">Si no lo indicas, se registra 1.</small>
          </div>
          <div className="campo">
            <label htmlFor="ubicacion">Ubicación (opcional)</label>
            <input id="ubicacion" placeholder="Cámara 1" />
          </div>
        </div>

        <button type="submit" className="boton boton--primario boton--grande">
          <PackagePlus size={22} aria-hidden />
          Registrar lote
        </button>
      </form>
    </div>
  )
}
