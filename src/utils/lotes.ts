import type { LoteMuestra, NivelUrgencia } from '../types/lote'

const orden: Record<NivelUrgencia, number> = { caducado: 0, hoy: 1, proximo: 2, correcto: 3 }

/** Lote activo de un producto que caduca antes (los retirados no cuentan). */
export function loteMasUrgente(ean: string, lotes: LoteMuestra[]): LoteMuestra | undefined {
  return lotes
    .filter((l) => l.ean === ean && l.estado === 'activo')
    .sort((a, b) => orden[a.urgencia] - orden[b.urgencia])[0]
}
