import { useEffect, useRef, useState } from 'react'
import { CameraOff, Flashlight, FlashlightOff, X } from 'lucide-react'
import { escanearCodigo } from '../utils/escanear'

interface Props {
  onDetectar: (codigo: string) => void
  onCerrar: () => void
}

type Estado = 'iniciando' | 'activo' | 'detectado' | 'error'

export default function EscanerCodigo({ onDetectar, onCerrar }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const pistaRef = useRef<MediaStreamTrack | null>(null)
  const [estado, setEstado] = useState<Estado>('iniciando')
  const [error, setError] = useState('')
  const [linterna, setLinterna] = useState(false)
  const [linternaDisponible, setLinternaDisponible] = useState(false)

  useEffect(() => {
    const control = new AbortController()
    let temporizador = 0

    escanearCodigo(videoRef.current!, control.signal, {
      onListo: (stream) => {
        const pista = stream.getVideoTracks()[0]
        pistaRef.current = pista
        // La linterna solo existe en algunos móviles (en iOS Safari no)
        const capacidades = pista.getCapabilities?.() as { torch?: boolean } | undefined
        setLinternaDisponible(Boolean(capacidades?.torch))
        setEstado('activo')
      },
    })
      .then((codigo) => {
        setEstado('detectado')
        navigator.vibrate?.(60)
        // Pausa corta para que se vea el acierto antes de cerrar
        temporizador = window.setTimeout(() => onDetectar(codigo), 450)
      })
      .catch((e) => {
        if (e.name === 'AbortError') return
        setError(
          e.name === 'NotAllowedError'
            ? 'No hay permiso para usar la cámara. Actívalo en los ajustes del navegador.'
            : 'No se ha podido abrir la cámara de este dispositivo.',
        )
        setEstado('error')
      })

    return () => {
      control.abort()
      clearTimeout(temporizador)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const alternarLinterna = async () => {
    const siguiente = !linterna
    try {
      await pistaRef.current?.applyConstraints({
        advanced: [{ torch: siguiente } as MediaTrackConstraintSet],
      })
      setLinterna(siguiente)
    } catch {
      setLinternaDisponible(false)
    }
  }

  return (
    <div className="escaner" role="dialog" aria-modal="true" aria-label="Escanear código de barras">
      {/* playsInline + muted + autoPlay: necesarios para que el vídeo arranque en iOS */}
      <video ref={videoRef} className="escaner__video" playsInline muted autoPlay />

      <header className="escaner__barra">
        <button type="button" className="escaner__icono" aria-label="Cerrar escáner" onClick={onCerrar}>
          <X size={22} aria-hidden />
        </button>
        {linternaDisponible && (
          <button
            type="button"
            className={`escaner__icono${linterna ? ' escaner__icono--activo' : ''}`}
            aria-label={linterna ? 'Apagar linterna' : 'Encender linterna'}
            aria-pressed={linterna}
            onClick={alternarLinterna}
          >
            {linterna ? <Flashlight size={22} aria-hidden /> : <FlashlightOff size={22} aria-hidden />}
          </button>
        )}
      </header>

      {estado !== 'error' ? (
        <>
          <div className={`escaner__visor${estado === 'detectado' ? ' escaner__visor--ok' : ''}`} aria-hidden>
            <span className="escaner__esquina escaner__esquina--sup-izq" />
            <span className="escaner__esquina escaner__esquina--sup-der" />
            <span className="escaner__esquina escaner__esquina--inf-izq" />
            <span className="escaner__esquina escaner__esquina--inf-der" />
            {estado === 'activo' && <span className="escaner__linea" />}
          </div>

          <p className="escaner__ayuda" role="status">
            {estado === 'iniciando' && 'Abriendo cámara…'}
            {estado === 'activo' && 'Centra el código de barras dentro del marco'}
            {estado === 'detectado' && 'Código detectado'}
          </p>
        </>
      ) : (
        <div className="escaner__error" role="alert">
          <CameraOff size={40} aria-hidden />
          <p>{error}</p>
          <button type="button" className="boton boton--suave" onClick={onCerrar}>
            Volver
          </button>
        </div>
      )}
    </div>
  )
}
