import type { LoteView, NivelUrgencia } from '../types/lote'

const MS_POR_DIA = 1000 * 60 * 60 * 24
// const DIAS_PROXIMO = 3

/** Días desde hoy hasta la caducidad (negativo = ya caducado), en hora local. */
export function diasHastaCaducidad(fechaCaducidad: string): number {
  const hoy = new Date().setHours(0, 0, 0, 0)
  const caduca = new Date(fechaCaducidad).setHours(0, 0, 0, 0)
  return Math.round((caduca - hoy) / MS_POR_DIA)
}

export function tipoAviso(lote: LoteView): NivelUrgencia {
  const dias = diasHastaCaducidad(lote.fecha_caducidad)

  if (dias < 0) return 'caducado'
  if (dias === 0) return 'hoy'
  if (dias <= lote.dias_aviso) return 'proximo' //cambiar por dias aviso en un futuro
  return 'correcto'
}

/** Texto para la insignia: "Caducó ayer", "Caduca hoy", "Caduca en 4 días"... */
export function etiquetaAviso(lote: LoteView): string {
  const dias = diasHastaCaducidad(lote.fecha_caducidad)

  if (dias === -1) return 'Caducó ayer'
  if (dias < 0) return `Caducó hace ${-dias} días`
  if (dias === 0) return 'Caduca hoy'
  if (dias === 1) return 'Caduca mañana'
  return `Caduca en ${dias} días`
}
