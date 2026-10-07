import { AlarmClock, CircleCheck, Clock, Hourglass, OctagonAlert } from 'lucide-react'
import type { LoteView } from '../types/lote'
import { etiquetaAviso, tipoAviso } from '../utils/tipoAviso'

const iconos = {
  caducado: OctagonAlert,
  hoy: AlarmClock,
  proximo: Clock,
  correcto: CircleCheck,
  pendiente: Hourglass,
}

const formatearFecha = (iso: string) =>
  new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }).replace('.', '')

interface Props {
  lote: LoteView
  conFecha?: boolean
  retirado?: boolean
}

/** Un lote retirado deja de avisar y pasa a "Pendiente de reposición". */
export default function InsigniaLote({ lote, conFecha = false, retirado = lote.activo === 0 }: Props) {
  const nivel = retirado ? 'pendiente' : tipoAviso(lote)
  const Icono = iconos[nivel]
  const texto = retirado ? 'Pendiente de reposición' : etiquetaAviso(lote)

  return (
    <span className={`insignia insignia--${nivel}`}>
      <Icono size={16} aria-hidden />
      {conFecha ? `${formatearFecha(lote.fecha_caducidad)} · ${texto}` : texto}
    </span>
  )
}
