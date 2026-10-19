import { useState } from 'react'
import { PackageCheck, PackageMinus, Undo2 } from 'lucide-react'
import type { LoteView } from '../types/lote'
import InsigniaLote from './InsigniaLote'
import { tipoAviso } from '../utils/tipoAviso'
import { ucFirst } from '../utils/ucFirst'
import { Link } from 'react-router-dom'



interface Props {
  lote: LoteView
  indice: number
  /** En Inicio el lote desaparece de los avisos al retirarlo. */
  ocultarAlRetirar?: boolean
  onRetirar? : (lote_id: number) => Promise<boolean>
  onDeshacerRetirar?: (lote_id: number) => Promise<boolean>
}

const formatearFecha = (iso: string) =>
  new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }).replace('.', '')

export default function LoteTarjeta({ lote, indice, ocultarAlRetirar = false, onRetirar,onDeshacerRetirar }: Props) {
  const [retirado, setRetirado] = useState(false)
  const [saliendo, setSaliendo] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [reponiendo, setReponiendo] = useState(false)
  const [nuevaFecha, setNuevaFecha] = useState('')
  const [repuesto, setRepuesto] = useState<string | null>(null)
  const [errorMsg , setErrorMsg] = useState('')

  

  const retirar = async () => {
    if(!onRetirar) return
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

  const deshacerRetirar = async () => {
    if(!onDeshacerRetirar) return
    setErrorMsg('')
    const ok = await onDeshacerRetirar(lote.lote_id)
    console.log("ok deshacer", ok)

    if (!ok) {
      setErrorMsg('Error al deshacer el retiro del lote')
      return
    }
    setRetirado(false)
    setSaliendo(false)
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
      className={`lote lote--${retirado ? 'retirado' : tipoAviso(lote)}${saliendo ? ' lote--sale' : ''}`}
      style={{ '--i': indice } as React.CSSProperties}
    >
      <div className="lote__cabecera">
        <h3>{ucFirst(lote.producto_nombre)}</h3>
        <InsigniaLote lote={lote} retirado={retirado} />
      </div>
      <p className="lote__datos">
        Caduca el {formatearFecha(lote.fecha_caducidad)}
      </p>

      
        <div className="lote__acciones">
          {retirado ? (
            <>
            <Link to={`/reponer/${lote.producto_id}`} >
              <button type="button" className="boton boton--primario" >
                <PackageCheck size={18} aria-hidden />
                Reponer
              </button>
            </Link>
              <button type="button" className="boton boton--suave" onClick={ deshacerRetirar}>
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

      
      {errorMsg && (
        <p className="errorMsg">{errorMsg}</p>
      )}
    </article>
  )
}
