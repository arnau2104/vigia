import { useState } from 'react'
import { PackageCheck, PackageMinus, Pencil, Trash, Undo2 } from 'lucide-react'
import type { Producto, ProductoView } from '../types/producto'
import type { LoteView } from '../types/lote'
import InsigniaLote from './InsigniaLote'
import { tipoAviso } from '../utils/tipoAviso'
import { ucFirst } from '../utils/ucFirst'
import { Link } from 'react-router-dom'



interface Props {
  producto: Producto
  loteProducto: LoteView
  indice: number
  /** En Inicio el lote desaparece de los avisos al retirarlo. */
  ocultarAlRetirar?: boolean
  onRetirar? : (lote_id: number) => Promise<boolean>
  onDeshacerRetirar?: (lote_id: number) => Promise<boolean>
}

const formatearFecha = (iso: string) =>
  new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }).replace('.', '')

export default function LoteTarjeta({ producto,loteProducto, indice, ocultarAlRetirar = false, onRetirar,onDeshacerRetirar }: Props) {
  const [retirado, setRetirado] = useState(false)
  const [saliendo, setSaliendo] = useState(false)
  const [errorMsg , setErrorMsg] = useState('')

  // Solo maqueta: tras reponer, el lote muestra la nueva fecha y vuelve a estar en orden.
  

  


  
  return (
    <article
      className={`lote ${saliendo ? ' lote--sale' : ''}`}
      style={{ '--i': indice } as React.CSSProperties}
    >
      <div className="lote__cabecera">
        <h3>{ucFirst(producto.producto_nombre)}</h3>
       {loteProducto  ? <InsigniaLote lote={loteProducto}/> :   <InsigniaLote lote={loteProducto} retirado />}
      </div>
      {loteProducto && (
        <p className="lote__datos">
          Caduca el {formatearFecha(loteProducto.fecha_caducidad)}
        </p>
      )}

    
        <div className="lote__acciones producto__acciones">
            <Link to={`/productos/${producto.producto_id}/editar`} >
              <button type="button" className="boton boton--primario">
                <Pencil size={18} aria-hidden />
                Editar
              </button>
            </Link>
             <Link to={`/reponer/${producto.producto_id}`} >
              <button type="button" className="boton boton--secundario">
                <PackageCheck size={18} aria-hidden />
                Reponer
              </button>
            </Link>
             <Link to={`/productos/${producto.producto_id}/eliminar`} >
              <button type="button" className="boton boton--borrar">
                <Trash size={18} aria-hidden />
                Borrar
              </button>
            </Link>
            
        </div>

      
      {errorMsg && (
        <p className="errorMsg">{errorMsg}</p>
      )}
    </article>
  )
}
