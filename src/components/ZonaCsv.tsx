import { useRef, useState } from 'react'
import { CircleCheck, FileSpreadsheet, UploadCloud, X } from 'lucide-react'

type Fase = 'vacio' | 'listo' | 'subiendo' | 'hecho'

export default function ZonaCsv() {
  const entrada = useRef<HTMLInputElement>(null)
  const [archivo, setArchivo] = useState<File | null>(null)
  const [arrastrando, setArrastrando] = useState(false)
  const [fase, setFase] = useState<Fase>('vacio')

  const elegir = (f: File | undefined) => {
    if (!f) return
    setArchivo(f)
    setFase('listo')
  }

  const quitar = () => {
    setArchivo(null)
    setFase('vacio')
    if (entrada.current) entrada.current.value = ''
  }

  // Solo maqueta: la subida real se conectará al backend.
  const simularSubida = () => {
    setFase('subiendo')
    setTimeout(() => setFase('hecho'), 1800)
  }

  return (
    <div className="zona-csv">
      <label
        className={`zona-csv__caja${arrastrando ? ' zona-csv__caja--activa' : ''}`}
        onDragOver={(e) => {
          e.preventDefault()
          setArrastrando(true)
        }}
        onDragLeave={() => setArrastrando(false)}
        onDrop={(e) => {
          e.preventDefault()
          setArrastrando(false)
          elegir(e.dataTransfer.files[0])
        }}
      >
        <input
          ref={entrada}
          type="file"
          accept=".csv,text/csv"
          className="solo-lectores"
          onChange={(e) => elegir(e.target.files?.[0])}
        />
        <UploadCloud size={36} aria-hidden />
        <strong>Arrastra tu archivo CSV aquí</strong>
        <span>o pulsa para elegirlo desde el dispositivo</span>
      </label>

      {archivo && (
        <div className="zona-csv__archivo">
          <FileSpreadsheet size={24} aria-hidden />
          <div>
            <strong>{archivo.name}</strong>
            <small>{(archivo.size / 1024).toFixed(1)} KB</small>
          </div>
          <button type="button" className="zona-csv__quitar" aria-label="Quitar archivo" onClick={quitar}>
            <X size={18} aria-hidden />
          </button>
        </div>
      )}

      {fase === 'subiendo' && (
        <div className="progreso" role="progressbar" aria-label="Importando">
          <span />
        </div>
      )}

      {fase === 'hecho' && (
        <p className="producto-detectado">
          <CircleCheck size={20} aria-hidden />
          Archivo recibido. La importación real se conectará al servidor.
        </p>
      )}

      <button
        type="button"
        className="boton boton--primario boton--grande"
        disabled={fase === 'vacio' || fase === 'subiendo'}
        onClick={simularSubida}
      >
        <UploadCloud size={22} aria-hidden />
        {fase === 'subiendo' ? 'Importando…' : 'Importar productos'}
      </button>
    </div>
  )
}
