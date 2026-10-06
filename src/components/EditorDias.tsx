import { useState } from 'react'
import { Minus, Plus } from 'lucide-react'

interface Props {
  inicial: number
  onChange?: (dias: number) => void
}

export default function EditorDias({ inicial, onChange }: Props) {
  const [dias, setDias] = useState(inicial)

  const cambiar = (nuevo: number) => {
    const valor = Math.max(1, nuevo)
    setDias(valor)
    onChange?.(valor)
  }

  return (
    <div className="stepper" role="group" aria-label="Días de aviso">
      <button type="button" aria-label="Restar un día" onClick={() => cambiar(dias - 1)}>
        <Minus size={18} aria-hidden />
      </button>
      <output key={dias}>{dias} días</output>
      <button type="button" aria-label="Sumar un día" onClick={() => cambiar(dias + 1)}>
        <Plus size={18} aria-hidden />
      </button>
    </div>
  )
}
