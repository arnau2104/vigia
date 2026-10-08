import { useState } from 'react'
import { Camera, CircleCheck, CircleHelp, PackagePlus, Plus, ScanBarcode } from 'lucide-react'
import CabeceraPagina from '../components/CabeceraPagina'
import EscanerCodigo from '../components/EscanerCodigo'

// ── Datos de ejemplo (estáticos) ─────────────────────────────────────────────
// Cuando haya backend se sustituirán por la respuesta de la API.
const CATEGORIAS_EJEMPLO = [
  { categoria_id: 1, categoria_nombre: 'lácteos' },
  { categoria_id: 2, categoria_nombre: 'carnes' },
  { categoria_id: 3, categoria_nombre: 'bebidas' },
]

const PRODUCTOS_EJEMPLO = [
  { producto_id: 1, producto_nombre: 'Yogur natural pack 4', categoria_id: 1 },
  { producto_id: 2, producto_nombre: 'Leche entera 1L', categoria_id: 1 },
  { producto_id: 3, producto_nombre: 'Queso fresco 250g', categoria_id: 1 },
  { producto_id: 4, producto_nombre: 'Zumo de naranja 1L', categoria_id: 3 },
]

// Un producto puede tener varios códigos de barras
const CODIGOS_EJEMPLO = [
  { codigo_barras: '8410000123456', producto_id: 1 },
  { codigo_barras: '8410000654321', producto_id: 2 },
]

// Longitud mínima para considerar que el usuario ya ha escrito un código completo
const LONGITUD_MINIMA_EAN = 8

type Eleccion = { tipo: 'existente'; producto_id: number } | { tipo: 'nuevo' } | null

export default function RegistrarLotePage() {
  const [ean, setEan] = useState('')
  const [escaneando, setEscaneando] = useState(false)
  const [fecha, setFecha] = useState('')

  // Solo se usan cuando el código no se conoce
  const [busqueda, setBusqueda] = useState('')
  const [eleccion, setEleccion] = useState<Eleccion>(null)
  const [categoriaId, setCategoriaId] = useState('')
  const [nombreNuevo, setNombreNuevo] = useState('') // nombre editable del producto que se va a crear

  const [mensaje, setMensaje] = useState('')

  // ── Caso actual según el código escrito o escaneado ────────────────────────
  const codigo = ean.trim()
  const codigoCompleto = codigo.length >= LONGITUD_MINIMA_EAN
  const codigoConocido = CODIGOS_EJEMPLO.find((c) => c.codigo_barras === codigo)
  const productoConocido = PRODUCTOS_EJEMPLO.find((p) => p.producto_id === codigoConocido?.producto_id)
  const codigoDesconocido = codigoCompleto && !codigoConocido

  const textoBusqueda = busqueda.trim()
  const coincidencias = PRODUCTOS_EJEMPLO.filter((p) =>
    p.producto_nombre.toLowerCase().includes(textoBusqueda.toLowerCase()),
  )
  const nombreCreado = nombreNuevo.trim()
  const productoElegido =
    eleccion?.tipo === 'existente'
      ? PRODUCTOS_EJEMPLO.find((p) => p.producto_id === eleccion.producto_id)
      : undefined

  const cambiarEan = (valor: string) => {
    setEan(valor)
    // al cambiar de código se descarta lo que se había elegido para el anterior
    if(ean.length < LONGITUD_MINIMA_EAN) return;

    

    setBusqueda('')
    setEleccion(null)
    setCategoriaId('')
    setNombreNuevo('')
    setMensaje('')
  }

  // ¿Se puede registrar? Depende de en qué caso estemos
  const productoListo = codigoConocido
    ? true
    : eleccion?.tipo === 'existente' || (eleccion?.tipo === 'nuevo' && nombreCreado !== '' && categoriaId !== '')
  const puedeRegistrar = codigoCompleto && productoListo && fecha !== ''

  const registrar = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!puedeRegistrar) return

    // Solo maqueta: describe qué haría el backend en cada caso
    let accion = 'Lote registrado.'
    if (!codigoConocido && eleccion?.tipo === 'existente') {
      accion = `Código añadido a «${productoElegido?.producto_nombre}» y lote registrado.`
    } else if (!codigoConocido && eleccion?.tipo === 'nuevo') {
      accion = `Producto «${nombreCreado}» creado con el código ${codigo} y lote registrado.`
    }
    cambiarEan('') // limpia el formulario (y el mensaje anterior)
    setFecha('')
    setMensaje(accion)
  }

  return (
    <div className="pagina">
      <CabeceraPagina titulo="Registra un lote o crea un producto" descripcion="Añade mercancía recién recibida." />
      <form className="formulario" onSubmit={registrar}>
        <div className="campo">
          <label htmlFor="ean">Código de Barras</label>
          <div className="fila-ean">
            <input
              id="ean"
              inputMode="numeric"
              placeholder="8410000123456"
              value={ean}
              onChange={(e) => cambiarEan(e.target.value)}
            />
            <button type="button" className="boton boton--secundario" onClick={() => setEscaneando(true)}>
              <ScanBarcode size={22} aria-hidden />
              Escanear
            </button>
          </div>
          <small className="ayuda">
            Escriba o escanee el codigo de barras de un producto, si este codigo no esta registrado podra añadirlo a un producto o crear uno nuevo
          </small>

          {/* Caso 1: el código ya existe */}
          {productoConocido && (
            <p className="producto-detectado">
              <CircleCheck size={18} aria-hidden />
              {productoConocido.producto_nombre}
            </p>
          )}
        </div>

        {/* Casos 2 y 3: el código no existe */}
        {codigoDesconocido && (
          <div className="campo bloque-nuevo">
            <p className="producto-nuevo">
              <CircleHelp size={18} aria-hidden />
              No conocemos este código
            </p>

            {eleccion === null ? (
              <>
                <label htmlFor="producto-busqueda">¿A qué producto pertenece?</label>
                <input
                  id="producto-busqueda"
                  placeholder="Busca por nombre…"
                  autoComplete="off"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
                <small className="ayuda">
                  {textoBusqueda === ''
                    ? 'Escribe el nombre del producto. Si no aparece en la lista, podrás crearlo como producto nuevo.'
                    : coincidencias.length === 0
                      ? 'No hay ningún producto con ese nombre. Pulsa «Crear producto nuevo» para añadirlo.'
                      : '¿No es ninguno de estos? Pulsa «Crear producto nuevo» al final de la lista.'}
                </small>
                <ul className="opciones">
                  {coincidencias.map((p) => (
                    <li key={p.producto_id}>
                      <button
                        type="button"
                        className="opcion"
                        onClick={() => setEleccion({ tipo: 'existente', producto_id: p.producto_id })}
                      >
                        {p.producto_nombre}
                      </button>
                    </li>
                  ))}
                  {textoBusqueda !== '' && (
                    <li>
                      <button type="button" className="opcion opcion--crear" onClick={() => {
                          setNombreNuevo(textoBusqueda) // parte de lo escrito, pero se podrá corregir
                          setEleccion({ tipo: 'nuevo' })
                        }}
                      >
                        <Plus size={18} aria-hidden />
                        Crear producto nuevo «{textoBusqueda}»
                      </button>
                    </li>
                  )}
                </ul>
              </>
            ) : (
              <>
                {/* Caso 3: se añade el código a un producto que ya existe */}
                {eleccion.tipo === 'existente' && (
                  <p className="producto-detectado">
                    <CircleCheck size={18} aria-hidden />
                    Se añadirá este código a «{productoElegido?.producto_nombre}»
                  </p>
                )}

                {/* Caso 2: producto nuevo, hace falta la categoría */}
                {eleccion.tipo === 'nuevo' && (
                  <>
                    <label htmlFor="nombre-nuevo">Nombre del producto nuevo</label>
                    <input
                      id="nombre-nuevo"
                      autoComplete="off"
                      value={nombreNuevo}
                      onChange={(e) => setNombreNuevo(e.target.value)}
                    />
                    <label htmlFor="categoria">Categoría</label>
                    <select id="categoria" value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)}>
                      <option value="">Elige una categoría</option>
                      {CATEGORIAS_EJEMPLO.map((c) => (
                        <option key={c.categoria_id} value={c.categoria_id}>
                          {c.categoria_nombre}
                        </option>
                      ))}
                    </select>
                  </>
                )}

                <button
                  type="button"
                  className="boton boton--suave"
                  onClick={() => {
                    setBusqueda(nombreNuevo) // conserva lo escrito al volver a buscar
                    setEleccion(null)
                    setCategoriaId('')
                  }}
                >
                  Cambiar
                </button>
              </>
            )}
          </div>
        )}

        <div className="campo">
          <label htmlFor="fecha">Fecha de caducidad</label>
          <input id="fecha" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
          {/* <button type="button" className="boton boton--suave boton--ancho">
            <Camera size={20} aria-hidden />
            Leer fecha con foto
          </button> */}
        </div>

        <div className="formulario__dos">
          <div className="campo">
            <label htmlFor="cantidad">Unidades (opcional)</label>
            <input id="cantidad" type="number" min="1" inputMode="numeric" defaultValue={1} />
            <small className="ayuda">Si no lo indicas, se registra 1.</small>
          </div>
          
          {/* IMPLEMENTAR MAS ADELANTE */}
          {/* <div className="campo">
            <label htmlFor="ubicacion">Ubicación (opcional)</label>
            <input id="ubicacion" placeholder="Cámara 1" />
          </div> */}
        </div>

        {mensaje && (
          <p className="producto-detectado" role="status">
            <CircleCheck size={18} aria-hidden />
            {mensaje}
          </p>
        )}

        <button type="submit" className="boton boton--primario boton--grande" disabled={!puedeRegistrar}>
          <PackagePlus size={22} aria-hidden />
          Registrar lote
        </button>
      </form>

      {escaneando && (
        <EscanerCodigo
          onDetectar={(c) => {
            cambiarEan(c)
            setEscaneando(false)
          }}
          onCerrar={() => setEscaneando(false)}
        />
      )}
    </div>
  )
}
