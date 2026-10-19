import { useMemo, useRef, useState } from 'react'
import { CircleCheck, FileSpreadsheet, UploadCloud, X } from 'lucide-react'
import Papa from 'papaparse'

type Fase = 'vacio' | 'listo' | 'subiendo' | 'hecho'
type FilaCsv = Record<string, string>

type Producto = {
  producto_nombre: string
  codigo_barras: string | null
  categoria: string
}

// EAN válido: solo dígitos, con 8, 12, 13 o 14 de largo
const esEan = (s: string) => /^\d+$/.test(s) && [8, 12, 13, 14].includes(s.length)

const limpiarFila = (f: FilaCsv): Producto => {
  const barras = (f.barcode ?? '').trim()
  return {
    producto_nombre: (f.productname ?? '').trim().toLowerCase(),
    codigo_barras: esEan(barras) ? barras : null,
    categoria: (f.family ?? '').trim().toLowerCase(),
  }
}

const TAMANO_LOTE = 250

type Resumen = {
  insertados: number
  existentes: number
  codigosGuardados: number
  codigosRepetidos: number
}

// POST con JSON; lanza un error si el servidor responde mal
async function enviar<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  if (!res.ok || data.error) throw new Error(data.error ?? 'Error del servidor')
  return data as T
}

export default function ZonaCsv() {
  const entrada = useRef<HTMLInputElement>(null)
  const [archivo, setArchivo] = useState<File | null>(null)
  const [arrastrando, setArrastrando] = useState(false)
  const [fase, setFase] = useState<Fase>('vacio')
  const [error, setError] = useState('')
  const [progreso, setProgreso] = useState(0) // 0-100
  const [resumen, setResumen] = useState<Resumen | null>(null)
  // Categorías del CSV que ya existían en la base de datos y se han quitado de la lista
  const [categoriasOmitidas, setCategoriasOmitidas] = useState<string[]>([])

  // Todo lo que trae el CSV, ya limpio
  const [productos, setProductos] = useState<Producto[]>([])
  // Categorías que siguen marcadas
  const [categoriasActivas, setCategoriasActivas] = useState<Set<string>>(new Set())
  // Lo que realmente se va a importar: productos de las categorías marcadas
  const [productosFinales, setProductosFinales] = useState<Producto[]>([])

  // Lista de categorías con cuántos productos tiene cada una
  const categorias = useMemo(() => {
    const cuenta = new Map<string, number>()
    for (const p of productos) cuenta.set(p.categoria, (cuenta.get(p.categoria) ?? 0) + 1)
    return [...cuenta.entries()].sort(([a], [b]) => a.localeCompare(b))
  }, [productos])

  const reiniciarProductos = () => {
    setProductos([])
    setCategoriasActivas(new Set())
    setProductosFinales([])
    setError('')
    setResumen(null)
    setCategoriasOmitidas([])
  }

  const leerArchivo = async (f: File) => {
    reiniciarProductos()

    const texto = (await f.text()).replace(/^﻿/, '')
    const { data, errors, meta } = Papa.parse<FilaCsv>(texto, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim().toLowerCase(),
    })

    if (!meta.fields?.includes('productname')) {
      setError('El archivo no tiene la columna ProductName.')
      return
    }
    if (errors.length) console.warn('Filas con problemas:', errors)

    // Categorías que ya están en la base de datos: no se vuelven a ofrecer
    let yaExisten: Set<string>
    try {
      const res = await fetch('/api/getCategorias')
      const { categorias: existentes } = await res.json()
      if (!res.ok || !Array.isArray(existentes)) throw new Error()
      yaExisten = new Set(existentes.map((c: { categoria_nombre: string }) => String(c.categoria_nombre).toLowerCase()))
    } catch {
      setError('No se pudieron consultar las categorías existentes. Inténtalo de nuevo.')
      return
    }

    const todos = data
      .map(limpiarFila)
      .filter((p) => p.producto_nombre !== '' && p.categoria !== '')

    const lista = todos.filter((p) => !yaExisten.has(p.categoria))
    setCategoriasOmitidas([...new Set(todos.filter((p) => yaExisten.has(p.categoria)).map((p) => p.categoria))].sort())

    setProductos(lista)
    setCategoriasActivas(new Set(lista.map((p) => p.categoria)))
    setProductosFinales(lista)
  }

  const elegir = (f: File | undefined) => {
    if (!f) return
    setArchivo(f)
    setFase('listo')
    leerArchivo(f)
  }

  const quitar = () => {
    setArchivo(null)
    setFase('vacio')
    reiniciarProductos()
    if (entrada.current) entrada.current.value = ''
  }

  // Marcar / desmarcar una categoría y recalcular los productos finales
  const alternarCategoria = (categoria: string) => {
    const nuevas = new Set(categoriasActivas)
    if (nuevas.has(categoria)) nuevas.delete(categoria)
    else nuevas.add(categoria)

    setCategoriasActivas(nuevas)
    setProductosFinales(productos.filter((p) => nuevas.has(p.categoria)))
  }

  const importar = async () => {
    if (!archivo || productosFinales.length === 0) return

    setFase('subiendo')
    setError('')
    setProgreso(0)
    setResumen(null)

    try {
      // 1. Crear las categorías y obtener su id
      const nombres = [...new Set(productosFinales.map((p) => p.categoria))] //las categorias que hay en el csv
      const { categorias: filasCategorias } = await enviar<{
        categorias: { categoria_id: number; categoria_nombre: string }[]
      }>('/api/importarCategorias', { categorias: nombres })

      const idPorCategoria = new Map(filasCategorias.map((c) => [c.categoria_nombre, c.categoria_id]))

      // 2. Productos sin nombres repetidos, ya con su categoria_id.
      //    Si una categoría no se pudo crear, se saltan sus productos y se sigue con el resto.
      const vistos = new Set<string>()
      const sinCategoria = new Set<string>()
      const filas: { producto_nombre: string; codigo_barras: string | null; categoria_id: number }[] = []

      for (const p of productosFinales) {
        const categoria_id = idPorCategoria.get(p.categoria)
        if (!categoria_id) {
          sinCategoria.add(p.categoria)
          continue
        }

        if (vistos.has(p.producto_nombre)) continue
        vistos.add(p.producto_nombre)

        filas.push({ producto_nombre: p.producto_nombre, codigo_barras: p.codigo_barras, categoria_id })
      }

      if (filas.length === 0) throw new Error('No se pudo crear ninguna de las categorías')

      // 3. Enviar por lotes, uno detrás de otro, y subir la barra con cada respuesta
      const total: Resumen = { insertados: 0, existentes: 0, codigosGuardados: 0, codigosRepetidos: 0 }

      for (let i = 0; i < filas.length; i += TAMANO_LOTE) {
        const lote = filas.slice(i, i + TAMANO_LOTE)
        const r = await enviar<Resumen>('/api/importarProductos', { productos: lote })

        total.insertados += r.insertados
        total.existentes += r.existentes
        total.codigosGuardados += r.codigosGuardados
        total.codigosRepetidos += r.codigosRepetidos

        setProgreso(Math.round(((i + lote.length) / filas.length) * 100))
      }

      // Lo importado ya está en la base de datos: fuera de la lista.
      // Las categorías que fallaron se quedan marcadas para poder reintentarlas.
      const importadas = new Set(nombres.filter((n) => !sinCategoria.has(n)))
      const restantes = productos.filter((p) => !importadas.has(p.categoria))
      setProductos(restantes)
      setCategoriasActivas(new Set(sinCategoria))
      setProductosFinales(restantes.filter((p) => sinCategoria.has(p.categoria)))

      if (sinCategoria.size > 0) {
        setError(`No se pudieron crear estas categorías, así que sus productos no se importaron: ${[...sinCategoria].join(', ')}.`)
      }

      setResumen(total)
      setFase('hecho')
    } catch (e) {
      // Reintentar es seguro: lo que ya se guardó se salta por los índices únicos
      setError(e instanceof Error ? e.message : 'Ha ocurrido un error al importar')
      setFase('listo')
    }
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

      {error && <p className="producto-detectado error">{error}</p>}

      {categoriasOmitidas.length > 0 && (
        <p className="zona-csv__aviso">
          {categoriasOmitidas.length === 1 ? 'Ya existía la categoría' : `Ya existían ${categoriasOmitidas.length} categorías`}{' '}
          y se {categoriasOmitidas.length === 1 ? 'ha quitado' : 'han quitado'} de la lista: {categoriasOmitidas.join(', ')}.
        </p>
      )}

      {categorias.length > 0 && (
        <div className="zona-csv__categorias">
          <p className="zona-csv__resumen">
            {productosFinales.length} de {productos.length} productos seleccionados
          </p>
          <ul>
            {categorias.map(([categoria, total]) => (
              <li key={categoria}>
                <label className="zona-csv__categoria">
                  <input
                    type="checkbox"
                    checked={categoriasActivas.has(categoria)}
                    disabled={fase === 'subiendo'}
                    onChange={() => alternarCategoria(categoria)}
                  />
                  <span>{categoria}</span>
                  <small>{total}</small>
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}

      {fase === 'subiendo' && (
        <div
          className="progreso progreso--real"
          role="progressbar"
          aria-label="Importando"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progreso}
        >
          <span style={{ width: `${progreso}%` }} />
        </div>
      )}

      {fase === 'hecho' && resumen && (
        <p className="producto-detectado">
          <CircleCheck size={20} aria-hidden />
          {resumen.insertados} productos nuevos, {resumen.existentes} ya existían y{' '}
          {resumen.codigosGuardados} códigos de barras guardados
          {resumen.codigosRepetidos > 0 && ` (${resumen.codigosRepetidos} repetidos, omitidos)`}.
        </p>
      )}

      <button
        type="button"
        className="boton boton--primario boton--grande"
        disabled={fase === 'vacio' || fase === 'subiendo' || productosFinales.length === 0}
        onClick={importar}
      >
        <UploadCloud size={22} aria-hidden />
        {fase === 'subiendo' ? 'Importando…' : 'Importar productos'}
      </button>
    </div>
  )
}
