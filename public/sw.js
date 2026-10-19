self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()))

// Llega un push del servidor: mostrar la notificación
self.addEventListener('push', (event) => {
  const datos = event.data ? event.data.json() : {}
  const titulo = datos.titulo || 'Vigía'

  event.waitUntil(
    self.registration.showNotification(titulo, {
      body: datos.cuerpo || '',
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      data: { url: datos.url || '/' },
    })
  )
})

// El usuario pulsa la notificación: abrir (o enfocar) la app
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url || '/'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((ventanas) => {
      for (const ventana of ventanas) {
        if ('focus' in ventana) {
          ventana.navigate(url)
          return ventana.focus()
        }
      }
      return self.clients.openWindow(url)
    })
  )
})