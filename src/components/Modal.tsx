import React from 'react'
import { ucFirst } from '../utils/ucFirst'
import { Trash, X } from 'lucide-react'


interface Props {
    show: any,
    text: string,
    nombre: string,
    objectDelete: any,
    funcionEliminar: any,
    mensaje?: [string,string]
}


function Modal({show,text,nombre,objectDelete,funcionEliminar,mensaje} : Props) {
  return (
    <>
        <div className="modal-fondo" onClick={() => show(null)}>
          <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-eliminar-titulo" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="modal__cerrar" aria-label="Cerrar" onClick={() => show(null)}>
              <X size={20} aria-hidden />
            </button>
            <h2 id="modal-eliminar-titulo">{text}</h2>
            <p>{ucFirst(nombre)}</p>
            <button type="button" className="boton boton--borrar boton--ancho" onClick={()=>funcionEliminar(objectDelete)}>
              <Trash size={18} aria-hidden />
              Eliminar
            </button>
            {mensaje && <p className={`${mensaje[0]}`}>{mensaje[1]}</p>}
          </div>
        </div>
      
    </>
  )
}

export default Modal
