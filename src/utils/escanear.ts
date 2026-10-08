import { BarcodeDetector } from 'barcode-detector/ponyfill'

interface Opciones {
  // Se llama cuando la cámara ya está en marcha (para poder, por ejemplo, ofrecer la linterna)
  onListo?: (stream: MediaStream) => void
}

// Abre la cámara, lee fotogramas del vídeo hasta encontrar un código de barras y lo devuelve.
// Para cancelarlo (y apagar la cámara) hay que abortar la señal.
export function escanearCodigo(
  video: HTMLVideoElement,
  signal: AbortSignal,
  { onListo }: Opciones = {},
): Promise<string> {
  return new Promise((resolve, reject) => {
    let stream: MediaStream | null = null
    let frame = 0

    // Solo formatos de producto: más rápido y con menos falsos positivos
    const detector = new BarcodeDetector({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e'] })

    // Limpieza común: se ejecuta al acertar y al cancelar
    const parar = () => {
      cancelAnimationFrame(frame)
      stream?.getTracks().forEach((t) => t.stop())
    }

    signal.addEventListener('abort', () => {
      parar()
      reject(new DOMException('Escaneo cancelado', 'AbortError'))
    })

    // Analiza un fotograma; si no hay código, lo vuelve a intentar en el siguiente
    const leer = async () => {
      if (signal.aborted) return
      // iOS: detect() falla si el vídeo todavía no tiene imagen
      if (video.readyState >= 2) {
        try {
          const codigos = await detector.detect(video)
          if (codigos.length > 0) {
            parar()
            resolve(codigos[0].rawValue)
            return
          }
        } catch {
          // un fotograma fallido no es grave
        }
      }
      frame = requestAnimationFrame(leer)
    }

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: { ideal: 'environment' } , width: { ideal: 1920 }, height: { ideal: 1080 }}, audio: false })
      .then(async (s) => {
        // Si se cerró mientras esperaba el permiso, apaga la cámara y sal
        if (signal.aborted) return s.getTracks().forEach((t) => t.stop())
        stream = s
        video.srcObject = s
        await video.play()
        onListo?.(s)
        leer()
      })
      .catch(reject)
  })
}
