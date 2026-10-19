import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { CircleCheck, PackagePlus, Plus, ScanBarcode,CircleX } from 'lucide-react'
import CabeceraPagina from '../components/CabeceraPagina'
import type {Producto} from '../types/producto'
import EscanerCodigo from '../components/EscanerCodigo'
import type { Categoria } from '../types/categoria'
import { ucFirst } from '../utils/ucFirst'
import type { CodigoBarras } from '../types/codigoBarras'


function EditarProducto() {
  const {producto_id} = useParams();
    

  const [productoNombre, setProductoNombre] = useState('')
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("")
  const [codigosBarras, setCodigosBarras] = useState<CodigoBarras[]>([])
  const [codigosNuevos, setCodigosNuevos] = useState<string []>([])
const [indiceEscaneado, setIndiceEscaneado] = useState<Number | null>(null)
  const [mensaje, setMensaje] = useState([ '','' ]) // [tipo, mensaje] tipo puede ser 'successMsg' o 'errorMsg

  useEffect(()=> {
    getProducto();
    getCategorias();
    getCodigosProducto();
  },[])

      


  function getProducto() {
    fetch('/api/getProducto', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json', 
      },
      body: JSON.stringify({ producto_id }),
      })
      .then(res => res.json())
      .then(data => {
        console.log("Producto:", data)
        if (data.error) return console.error('Error al obtener el producto:', data.error);
        setProductoNombre(data.producto.producto_nombre);
        setCategoriaSeleccionada(data.producto.categoria_id);
      })
      .catch(error => console.error('Error al obtener el producto:', error));
  }

  function getCategorias() {
    fetch('/api/getCategorias', {
      method: 'GET',
      credentials: 'include',
      })
    .then(res => res.json())
    .then(data => {
      console.log('Datos de categorías:', data);
      if(data.error) return console.error('Error al obtener categorías:', data.error);
      setCategorias(data.categorias);

    
    })
    .catch(error => {
      console.error('Error al obtener categorías:', error);
    });
  }

  function getCodigosProducto() {
    fetch('/api/getProductoCodigos', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json', 
      },
      body: JSON.stringify({ producto_id }),
      })
      .then(res => res.json())
      .then(data => {
        console.log("Codigo de Barras:", data)
        if (data.error) return console.error('Error al obtener los codigos de barras:', data.error);
        setCodigosBarras(data.codigosBarras);
      })
      .catch(error => console.error('Error al obtener los codigos de barras:', error));
  }

  const enviarformulario = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    console.log('enviando formulario...')
    setMensaje(['',''])
    console.log("codigosNuevos:", codigosNuevos)

    fetch('/api/editarProducto', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json', 
      },
      body: JSON.stringify({ producto_id, producto_nombre: productoNombre, categoria_id: categoriaSeleccionada, codigos_nuevos: codigosNuevos }),
      })
      .then(res => res.json())
      .then(data => {
        console.log("Producto:", data)
        if (data.error) return console.error('Error al obtener el producto:', data.error);
        setMensaje(['success', data.message]);
        setTimeout(() => setMensaje(['','']), 3000);
      })
      .catch(error =>  {
         console.error('Error al obtener el producto:', error);
         setMensaje(['error', 'Ha ocurrido un error insesperado, intentelo de nuevo']);
      })
  }

  const borrarCodigoBD = (codigo: string) => {
    fetch('/api/borrarCodigoBarras', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json', 
      },
      body: JSON.stringify({ codigoBarras: codigo }),
      })
      .then(res => res.json())
      .then(data => {
        console.log("Codigo de Barras:", data)
        if (data.error) return console.error('Error al obtener los codigos de barras:', data.error);
        getCodigosProducto();
      })
      .catch(error => console.error('Error al obtener los codigos de barras:', error));
    
  }
  


  return (
    <div className="pagina">
      <CabeceraPagina titulo="Edita un producto" descripcion="Cambia la información de un producto" />
      <form className="formulario" onSubmit={enviarformulario}>
        <div className="campo" id='contenedor-codigos'>
          <div className='title-add'>
            <label htmlFor="ean">Códigos de Barras</label>
            <button type='button' className='boton boton--secundario' onClick={()=> setCodigosNuevos(prev => [...prev,'']) }>
              <Plus size={22} aria-hidden />
              Añadir
            </button>
          </div>
          
          {codigosBarras && codigosBarras.map((c) => (
              <div key={c.producto_codigo_id} className="fila-ean">
                <input
                key={c.producto_codigo_id}
                inputMode="numeric"
                placeholder="8410000123456"
                value={c.codigo_barras}
                readOnly
                />
                <button type="button" className="boton boton--borrar" onClick={()=> borrarCodigoBD(c.codigo_barras)}>
                  <CircleX size={22} aria-hidden />
                </button>
              </div>
              
          ))}

          {codigosNuevos.map((c,index) => (
            <div key={index} className="fila-ean">
                <input
                key={index}
                inputMode="numeric"
                placeholder="8410000123456"
                value={c}
                onChange={(e)=>setCodigosNuevos(prev => prev.map((c, j) => (j === index ? e.target.value.trim() : c)))}  
                />
                {codigosNuevos[index].length < 1 ? (
                  <button type="button" className="boton boton--secundario" onClick={() => setIndiceEscaneado(index)}>
                    <ScanBarcode size={22} aria-hidden />
                    Escanear
                  </button> 
                ): (<button type="button" className="boton boton--borrar">
                  <CircleX size={22} aria-hidden  onClick={()=> setCodigosNuevos(prev => prev.filter((codigo, i) => i !== index))}/>
                </button>
                )
                }
               
              </div>
          ))}
   
             
            {/* <button type="button" className="boton boton--secundario" onClick={() => setEscaneando(true)}>
              <ScanBarcode size={22} aria-hidden />
              Escanear
            </button> */}
          
          
          
        </div> 
        <div className='campo'>
            <label htmlFor="nombre-nuevo">Nombre del producto </label>
            <input
                id="nombre-nuevo"
                autoComplete="off"
                value={ucFirst(productoNombre)}
                onChange={(e) => setProductoNombre(e.target.value)}
            />
        </div>
        <div className="campo">
            <label htmlFor="categoria">Categoría</label>
            <select id="categoria" value={categoriaSeleccionada} onChange={(e) => setCategoriaSeleccionada(e.target.value)}>
                <option value="">Elige una categoría</option>
                {categorias.map((c) => (
                    <option key={c.categoria_id} value={c.categoria_id} >
                        {ucFirst(c.categoria_nombre)}
                     </option>
                    
                ))}
            </select>   
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
      

        <button type="submit" className="boton boton--primario boton--grande" >
          <PackagePlus size={22} aria-hidden />
          Guardar cambios

        </button>
      </form>

     {indiceEscaneado !== null && (
  <EscanerCodigo
    onDetectar={(codigo) => {
      setCodigosNuevos(prev => prev.map((valor, i) => (i === indiceEscaneado ? codigo.trim() : valor)))
      setIndiceEscaneado(null)
    }}
    onCerrar={() => setIndiceEscaneado(null)}
  />
)}
      
    </div>
    )
}
export default EditarProducto
