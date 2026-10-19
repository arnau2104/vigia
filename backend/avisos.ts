import webpush from 'web-push'
import { connection } from './db_connections.ts'
import type { RowDataPacket } from 'mysql2'

export async function enviarAvisos() {
  const [suscripciones] = await connection.query<RowDataPacket[]>('SELECT * FROM push_suscripciones WHERE activa = 1 AND (ultimo_envio IS NULL OR DATE(ultimo_envio) < CURDATE())');

  for (const sub of suscripciones) {
    try {
      const ahora = new Date().toLocaleString('sv-SE', { timeZone: sub.zona_horaria })
      const fecha = ahora.slice(0, 10)
      const hora = ahora.slice(11, 16)

      if (sub.hora_aviso.slice(0, 5) > hora) continue

      const [[conteo]] = await connection.query<RowDataPacket[]>( //extrae la primera fila, que es la unica que hay, pero evita poner [0]
        `SELECT
           COALESCE(SUM(fecha_caducidad < ?), 0) AS caducados,
           COALESCE(SUM(fecha_caducidad = ?), 0) AS hoy,
           COALESCE(SUM(fecha_caducidad > ? AND fecha_caducidad <= DATE_ADD(?, INTERVAL dias_aviso DAY)), 0) AS proximos
         FROM lotes_view
         WHERE comercio_id = ? AND activo = 1 AND fecha_retirada IS NULL`,
        [fecha, fecha, fecha, fecha, sub.comercio_id]);
        if (conteo?.length === 0 || (conteo?.caducados === 0 && conteo.hoy === 0 && conteo.proximos === 0)) continue
     
        const caducados = sub.avisar_caducados ? Number(conteo?.caducados) : 0
        const hoy = sub.avisar_hoy ? Number(conteo?.hoy) : 0
        const proximos = sub.avisar_proximos ? Number(conteo?.proximos) : 0

      if (caducados + hoy + proximos === 0) continue

      const partes: string[] = []
      if (caducados) partes.push(`${caducados} caducado${caducados > 1 ? 's' : ''}`)
      if (hoy) partes.push(`${hoy} caduca${hoy > 1 ? 'n' : ''} hoy`)
      if (proximos) partes.push(`${proximos} a punto de caducar`)

      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify({ titulo: 'Vigía', cuerpo: partes.join(' · '), url: '/' })
      )

      await connection.query('UPDATE push_suscripciones SET ultimo_envio = NOW() WHERE endpoint = ?', 
        [sub.endpoint])
    } catch (e: any) {
      console.error('error al enviar el aviso', e.statusCode, e.message)
      if (e.statusCode === 404 || e.statusCode === 410) { //si da estos codigos de error es porque esa suscripción ya no existe, el usuario desinstaló la app, revocó el permiso o el navegador la renovó
        await connection.query('DELETE FROM push_suscripciones WHERE endpoint = ?', [sub.endpoint])
      }
    }
  }
}
