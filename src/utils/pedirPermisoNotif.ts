export async function pedirPermisoNotif(): Promise<boolean> {
  if (!('Notification' in window) || !('serviceWorker' in navigator)) {
    alert('Este navegador no admite notificaciones')
    return false
  }

  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false

  const resultado = await Notification.requestPermission()
  return resultado === 'granted'
}