import type { ReactNode } from 'react'

interface Props {
  titulo: string
  descripcion: string
  children?: ReactNode
}

export default function CabeceraPagina({ titulo, descripcion, children }: Props) {
  return (
    <div className="cabecera-pagina">
      <div>
        <h1>{titulo}</h1>
        <p>{descripcion}</p>
      </div>
      {children}
    </div>
  )
}
