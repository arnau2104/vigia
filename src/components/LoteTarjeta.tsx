import { useState } from 'react'
import { PackageCheck, PackageMinus, Undo2 } from 'lucide-react'
import type { LoteView } from '../types/lote'
import InsigniaLote from './InsigniaLote'
import { tipoAviso } from '../utils/tipoAviso'


interface Props {
  lote: LoteView
  indice: number
  /** En Inicio el lote desaparece de los avisos al retirarlo. */
  ocultarAlRetirar?: boolean
  onRetirar : (lote_id: number) => Promise<boolean>
}

const formatearFecha = (iso: string) =>
  new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }).replace('.', '')

export default function LoteTarjeta({ lote, indice, ocultarAlRetirar = false, onRetirar }: Props) {
  const [retirado, setRetirado] = useState(false)
  const [saliendo, setSaliendo] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [reponiendo, setReponiendo] = useState(false)
  const [nuevaFecha, setNuevaFecha] = useState('')
  const [repuesto, setRepuesto] = useState<string | null>(null)
  const [errorMsg , setErrorMsg] = useState('')

  // Solo maqueta: tras reponer, el lote muestra la nueva fecha y vuelve a estar en orden.
  const vista: LoteView = repuesto
    ? { ...lote, fecha_caducidad: repuesto }
    : lote

  const retirar = async () => {
    setErrorMsg('')
    setEnviando(true)
    const ok = await onRetirar(lote.lote_id)
    console.log("ok", ok)
    setEnviando(false)

    if (!ok) {
      setErrorMsg('Error al retirar el lote')
      return
    }
    setRetirado(true)
    if (ocultarAlRetirar) setSaliendo(true)   // el padre la quita al acabar la animación
  }


  const guardarReposicion = (e: React.FormEvent) => {
    e.preventDefault()
    setRepuesto(nuevaFecha)
    setRetirado(false)
    setReponiendo(false)
    setNuevaFecha('')
  }

  return (
    <article
      className={`lote lote--${retirado ? 'retirado' : tipoAviso(vista)}${saliendo ? ' lote--sale' : ''}`}
      style={{ '--i': indice } as React.CSSProperties}
    >
      <div className="lote__cabecera">
        <h3>{lote.producto_nombre}</h3>
        <InsigniaLote lote={vista} retirado={retirado} />
      </div>
      <p className="lote__datos">
        Caduca el {formatearFecha(vista.fecha_caducidad)}
      </p>

      {reponiendo ? (
        <form className="lote__reponer" onSubmit={guardarReposicion}>
          <div className="campo">
            <label htmlFor={`repo-${lote.lote_id}`}>Nueva fecha de caducidad</label>
            <input
              id={`repo-${lote.lote_id}`}
              type="date"
              value={nuevaFecha}
              onChange={(e) => setNuevaFecha(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="lote__acciones">
            <button type="submit" className="boton boton--primario">
              <PackageCheck size={18} aria-hidden />
              Guardar reposición
            </button>
            <button type="button" className="boton boton--suave" onClick={() => setReponiendo(false)}>
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <div className="lote__acciones">
          {retirado ? (
            <>
              <button type="button" className="boton boton--primario" onClick={() => setReponiendo(true)}>
                <PackageCheck size={18} aria-hidden />
                Reponer
              </button>
              <button type="button" className="boton boton--suave" onClick={() => setRetirado(false)}>
                <Undo2 size={18} aria-hidden />
                Deshacer
              </button>
            </>
          ) : (
            <button type="button" className="boton boton--suave" onClick={retirar}>
              <PackageMinus size={18} aria-hidden />
              {enviando ? 'Retirando…' : 'Retirar de la venta'}
            </button>
          )}
        </div>

      )}
      {errorMsg && (
        <p className="errorMsg">{errorMsg}</p>
      )}
    </article>
  )
}
