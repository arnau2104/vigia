import { AlarmClock, Bell, Clock, OctagonAlert } from 'lucide-react'
import CabeceraPagina from '../components/CabeceraPagina'
import { useEffect, useState } from 'react'
import { pedirPermisoNotif } from '../utils/pedirPermisoNotif'
import { base64ToUint8Array } from '../utils/base64ToUint8Array'


export default function AjustesPage() {

  const [enabledNotifications, setEnabledNotifications] = useState(false)
  const [notificationTime, setNotificationTime] = useState('09:00')
  const [enabledCaducado, setEnabledCaducado] = useState(false)
  const [enabledHoy, setEnabledHoy] = useState(false)
  const [enabledProximo, setEnabledProximo] = useState(false)
  const [message, setMessage] = useState<[string, string]>(['', ''])
  const zonaHoraria = Intl.DateTimeFormat().resolvedOptions().timeZone // → "Europe/Madrid"

  useEffect(() => {
    cargar()
  }, [])

  async function alternarNotificaciones(e: React.ChangeEvent<HTMLInputElement>) {
  const quiere = e.target.checked

  if (quiere) {
    const ok = await pedirPermisoNotif()
    if (!ok) return              // no cambia el interruptor
    // aquí: subscribe() y llamada a /api/push/suscribir
  }
  setEnabledNotifications(quiere)
}

 async function cargar() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return

    const registro = await navigator.serviceWorker.ready
    const sub = await registro.pushManager.getSubscription()
    if (!sub) return                       // sin suscripción: valores por defecto

    const res = await fetch('/api/push/getPushSuscripcion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ endpoint: sub.endpoint }),
    })

    const data = await res.json()
    if (data.error) return console.error('Error al obtener la suscripción:', data.error)

    // console.log("data", data.suscripcion)
    
    if (!data) return               // hay suscripción pero no fila

    setEnabledNotifications(data.suscripcion.activa === 1 && Notification.permission === 'granted')
    setNotificationTime(data.suscripcion.hora_aviso.slice(0, 5))      // '09:00:00' → '09:00'
    setEnabledCaducado(data.suscripcion.avisar_caducados === 1)
    setEnabledHoy(data.suscripcion.avisar_hoy === 1)
    setEnabledProximo(data.suscripcion.avisar_proximos === 1)
  }

  const enviarForm = async (e: React.FormEvent) => {
  e.preventDefault()

  try {
    const registro = await navigator.serviceWorker.ready
    let suscripcion = await registro.pushManager.getSubscription()

    if (!suscripcion) {
      if (!enabledNotifications) return        // nada que guardar ni desactivar

      const { clave } = await fetch('/api/push/clave').then(r => r.json())
      suscripcion = await registro.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: base64ToUint8Array(clave),
      })
    }

    const suscripcionJson = suscripcion.toJSON()
    console.log("keys", suscripcionJson)

    await fetch('/api/push/suscribir', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        endpoint: suscripcionJson.endpoint,
        keys: suscripcionJson.keys,
        activa: enabledNotifications ? 1 : 0,
        hora_aviso: notificationTime,
        zona_horaria: zonaHoraria,
        avisar_caducados: enabledCaducado ? 1 : 0,
        avisar_hoy: enabledHoy ? 1 : 0,
        avisar_proximos: enabledProximo ? 1 : 0,
      }),
    }).then(r => r.json())
    .then( data => {
      if( data.error) return console.error('Error al guardar los ajustes', data.error), setMessage(['errorMsg', data.error])
      setMessage(['successMsg', 'Ajustes guardados'])
      setTimeout(() => setMessage(['', '']), 3000)
    })
    .catch(error => {
      console.error('Error al guardar los ajustes', error)
      setMessage(['errorMsg', 'Error al guardar los ajustes'])
    })

  } catch (err) {
    console.error('Error al guardar los ajustes', err)
    setMessage(['errorMsg', 'Error al guardar los ajustes'])
  }
}

  return (
    <div className="pagina" id="pagina-ajustes">
      <CabeceraPagina titulo="Notificaciones" descripcion="Elige cómo y cuándo quieres recibir los avisos." />
      <form  className="formularioNotificaion" onSubmit={(e)=> enviarForm(e)}>
        <section className="panel ajustes" aria-labelledby="ajustes-notificaciones">
          <h2 id="ajustes-notificaciones" className="subtitulo">Notificaciones</h2>
          <div className="ajuste">
            <span className="ajuste__icono"><Bell size={20} aria-hidden /></span>
            <div className="ajuste__texto">
              <label htmlFor="notif-activas">Recibir notificaciones</label>
              <p>Un resumen al día en este dispositivo.</p>
            </div>
            <input id="notif-activas" className="interruptor" type="checkbox" role="switch" checked={enabledNotifications} onChange={(e)=> alternarNotificaciones(e)}  />
          </div>

          <div className="ajuste">
            <span className="ajuste__icono"><Clock size={20} aria-hidden /></span>
            <div className="ajuste__texto">
              <label htmlFor="notif-hora">Hora del aviso</label>
              <p>Recibirás una notificación diaria a esta hora.</p>
            </div>
            <input id="notif-hora" className="ajuste__hora" type="time" value={notificationTime} onChange={(e)=> setNotificationTime(e.target.value)} />
          </div>
        </section>

        <section className="panel ajustes" aria-labelledby="ajustes-tipos">
          <h2 id="ajustes-tipos" className="subtitulo">Qué avisos recibir</h2>

        
            <div className="ajuste">
              <span className={`ajuste__icono ajuste__icono--caducado`}><OctagonAlert size={20} aria-hidden /></span>
              <div className="ajuste__texto">
                <label htmlFor={`notif-caducado`}>Lotes caducados</label>
                <p>Avisar de los lotes que ya han caducado.</p>
              </div>
              <input id={`notif-caducado`} className="interruptor" type="checkbox" role="switch" checked={enabledCaducado}  onChange={(e) => setEnabledCaducado(e.target.checked)} />
            </div>

            <div className="ajuste">
              <span className={`ajuste__icono ajuste__icono--hoy`}><AlarmClock size={20} aria-hidden /></span>
              <div className="ajuste__texto">
                <label htmlFor={`notif-hoy`}>Caducan hoy</label>
                <p>Avisar de los lotes cuyo último día es hoy</p>
              </div>
              <input id={`notif-hoy`} className="interruptor" type="checkbox" role="switch" checked={enabledHoy}  onChange={(e) => setEnabledHoy(e.target.checked)} />
            </div>

            <div className="ajuste">
              <span className={`ajuste__icono ajuste__icono--proximo`}><Clock size={20} aria-hidden /></span>
              <div className="ajuste__texto">
                <label htmlFor={`notif-proximo`}>A punto de caducar</label>
                <p>Avisar según los días de aviso de cada categoría.</p>
              </div>
              <input id={`notif-proximo`} className="interruptor" type="checkbox" role="switch" checked={enabledProximo}  onChange={(e) => setEnabledProximo(e.target.checked)} />
            </div>
          
        </section>

        <button type="submit" className="boton boton--primario boton--grande ajustes__guardar">
          Guardar cambios
        </button>
        {message && <p className={`${message[0]}`}>{message[1]}</p>}
    </form>
    </div>
  )
}
