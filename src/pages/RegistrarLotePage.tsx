import { useState, useEffect } from 'react'
import { CircleCheck, CircleHelp, PackagePlus, Plus, ScanBarcode,CircleX } from 'lucide-react'
import CabeceraPagina from '../components/CabeceraPagina'
import type {Producto} from '../types/producto'
import EscanerCodigo from '../components/EscanerCodigo'
import type { CodigoBarrasView } from '../types/codigoBarras'
import type { Categoria } from '../types/categoria'
import { ucFirst } from '../utils/ucFirst'
import { useParams } from 'react-router-dom'




// Decisión del usuario cuando el código no está registrado:
// null = aún no ha decidido, asociar = añadirlo a un producto existente, crear = producto nuevo
type Eleccion = { tipo: 'asociar'; producto_id: number } | { tipo: 'crear' } | null

// Longitud mínima para considerar que el usuario ya ha escrito un código completo
const LONGITUD_MINIMA_EAN = 8

export default function RegistrarLotePage() {

  const productoId = Number(useParams().producto_id)

  const [ean, setEan] = useState('')
  const [escaneando, setEscaneando] = useState(false)
  const [fecha, setFecha] = useState('')
  const [cantidad, setCantidad] = useState(1)
  const [productos, setProductos] = useState<Producto[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [codigosBarras, setCodigosBarra] = useState<CodigoBarrasView[]>([])

  // Solo se usan cuando el código no se conoce
  const [busqueda, setBusqueda] = useState('')
  const [eleccion, setEleccion] = useState<Eleccion>(null)
  const [categoriaId, setCategoriaId] = useState('')
  const [nombreNuevo, setNombreNuevo] = useState('') // nombre editable del producto que se va a crear

  const [mensaje, setMensaje] = useState([ '','' ]) // [tipo, mensaje] tipo puede ser 'successMsg' o 'errorMsg


  useEffect(() => {
      getData();
        console.log("Producto id",productoId)
  },[])

  function getData() {
    fetch('/api/getProductosCodigos', {
      method: 'GET',
      credentials: 'include',
    }).then(res => res.json())
    .then(data => {
      console.log('Datos de productos:', data);
      if(data.error) return console.error('Error al obtener productos:', data.error);
      setProductos(data.productos);
      setCodigosBarra(data.codigosBarras);
      setCategorias(data.categorias);

      if(productoId) {
        //ordernamos por el codigo de barras, el ultimo en ser creado es el que escojemos
        let ultimoCodigo = data.codigosBarras.filter((c: CodigoBarrasView) => c.producto_id === productoId).sort((a: CodigoBarrasView, b: CodigoBarrasView) => b.producto_codigo_id - a.producto_codigo_id)[0]
        if(ultimoCodigo) {
          setEan(ultimoCodigo.codigo_barras)
         
        }
      }

    })
    .catch(error => {
      console.error('Error al obtener productos:', error);
    })
  }

  const cambiarEan = (codigoBarras: string) => {
    setEan(codigoBarras.trim())
    setEscaneando(false)
    // al cambiar de código se descarta lo que se había elegido para el anterior
    setBusqueda('')
    setEleccion(null)
    setCategoriaId('')
    setNombreNuevo('')
    setMensaje([])
  }

  const registrar = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!puedeRegistrar) return

    if (!codigoConocido && eleccion?.tipo === 'asociar') { // se crea el lote y se añade el codigo al producto existente
        asociar();
    } else if (!codigoConocido && eleccion?.tipo === 'crear') { // se crea el lote , y el producto y su codigo de barras
      crearProducto();
      
    } else { //solo hay que crear el lote, el codugo ya existe
      crearLote()
      
    }
    cambiarEan('') // limpia el formulario (y el mensaje anterior)
    setFecha('')
    setTimeout(() => setMensaje([]), 3000)
    // setMensaje(accion)
  }

  function crearLote() {
    fetch('/api/crearLote', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({producto_id: productoConocido?.producto_id,  fecha_caducidad: fecha, cantidad  }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log('Respuesta de crear lote:', data);
        if (data.error) return setMensaje(['error',data.error]), console.error('Error al crear lote:', data.error);
        setMensaje(['success',data.message]);
      })
      .catch((error) => {
        console.error('Error al crear lote:', error);
        setMensaje(['error','Error al crear lote']);
      });
  }

  function asociar() {
    if(!eleccion || eleccion?.tipo !== 'asociar' || !eleccion.producto_id ) return
    const productoId = eleccion.producto_id;
    fetch('/api/asociarLote', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ producto_id: productoId,  fecha_caducidad: fecha, cantidad, codigo_barras: ean }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log('Respuesta de asociar lote:', data);
        if (data.error) return setMensaje(['error',data.error]), console.error('Error al asociar lote:', data.error);
        setMensaje(['success',data.message]);
      })
      .catch((error) => {
        console.error('Error al asociar lote:', error);
        setMensaje(['error','Error al asociar lote']);
      });
  }

  function crearProducto() {
    fetch('/api/crearProducto', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ producto_nombre: nombreNuevo.toLowerCase(), codigo_barras: ean , categoria_id: categoriaId, fecha_caducidad: fecha, cantidad }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log('Respuesta de crear producto:', data);
        if (data.error) return setMensaje(['error',data.error]), console.error('Error al crear producto:', data.error);
        setMensaje(['success',data.message]);
        getData(); //refrescamos los datos, para que se vean los nuevos productos
      })
      .catch((error) => {
        console.error('Error al crear producto:', error);
        setMensaje(['error','Error al crear producto']);
      });
  }

  // ── Caso actual según el código escrito o escaneado ────────────────────────
 
  const codigoCompleto = ean.length >= LONGITUD_MINIMA_EAN
  const codigoConocido = codigosBarras.find((c) => c.codigo_barras === ean)
  const productoConocido = productos.find((p) => p.producto_id === codigoConocido?.producto_id)
  const codigoDesconocido = codigoCompleto && !codigoConocido

  const textoBusqueda = busqueda.trim()
  const coincidencias = productos.filter((p) =>
    p.producto_nombre.toLowerCase().includes(textoBusqueda.toLowerCase()),
  )
  const nombreCreado = nombreNuevo.trim()
  const productoElegido =
    eleccion?.tipo === 'asociar'
      ? productos.find((p) => p.producto_id === eleccion.producto_id)
      : undefined

  

  // ¿Se puede registrar? Depende de en qué caso estemos
  const productoListo = codigoConocido
    ? true
    : eleccion?.tipo === 'asociar' || (eleccion?.tipo === 'crear' && nombreCreado !== '' && categoriaId !== '')
  const puedeRegistrar = codigoCompleto && productoListo && fecha !== ''

  

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
              onInput={(e) => cambiarEan(e.currentTarget.value)}
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
              {ucFirst(productoConocido.producto_nombre)}
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
                        onClick={() => setEleccion({ tipo: 'asociar', producto_id: p.producto_id })}
                      >
                        {p.producto_nombre}
                      </button>
                    </li>
                  ))}
                  {textoBusqueda !== '' && (
                    <li>
                      <button type="button" className="opcion opcion--crear" onClick={() => {
                          setNombreNuevo(textoBusqueda) // parte de lo escrito, pero se podrá corregir
                          setEleccion({ tipo: 'crear' })
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
                {eleccion.tipo === 'asociar' && (
                  <p className="producto-detectado">
                    <CircleCheck size={18} aria-hidden />
                    Se añadirá este código a «{productoElegido?.producto_nombre}»
                  </p>
                )}

                {/* Caso 2: producto nuevo, hace falta la categoría */}
                {eleccion.tipo === 'crear' && (
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
                      {categorias.map((c) => (
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
            <input id="cantidad" type="number" min="1" inputMode="numeric" value={cantidad} onChange={(e)=> setCantidad(Number(e.target.value))} />
            <small className="ayuda">Si no lo indicas, se registra 1.</small>
          </div>
          
          {/* IMPLEMENTAR MAS ADELANTE */}
          {/* <div className="campo">
            <label htmlFor="ubicacion">Ubicación (opcional)</label>
            <input id="ubicacion" placeholder="Cámara 1" />
          </div> */}
        </div>

       {mensaje && (
           mensaje[0] =='success' ? (
            <p className="producto-detectado" role="status">
              <CircleCheck size={18} aria-hidden />
              {mensaje[1]}
            </p>
          ): mensaje[0] == 'error' && (
            <p className="producto-detectado error" role="status">
              <CircleX size={18} aria-hidden />
              {mensaje[1]}
            </p>
        )
      )}

        <button type="submit" className="boton boton--primario boton--grande" disabled={!puedeRegistrar}>
          <PackagePlus size={22} aria-hidden />
          {eleccion &&eleccion.tipo === 'crear' ? 'Registrar producto y lote' : "Registrar lote"}
        </button>
      </form>

      {escaneando && <EscanerCodigo onDetectar={cambiarEan} onCerrar={() => setEscaneando(false)} />}
      
    </div>
  )
}
