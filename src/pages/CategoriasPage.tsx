import React, { useState,useEffect, use } from 'react'
import { useParams, useNavigate } from 'react-router-dom';
import { Plus,Pencil } from 'lucide-react'
import CabeceraPagina from '../components/CabeceraPagina'
import CategoriaTarjeta from '../components/CategoriaTarjeta'
import EditorDias from '../components/EditorDias'
import type { Categoria } from '../types/categoria'
import type { Producto } from '../types/producto'
import { ucFirst } from '../utils/ucFirst';

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const { categoria_id } = useParams<{ categoria_id: string }>();
  const [productos, setProductos] = useState<Producto[]>([])
  const [nombreCategoria, setNombreCategoria] = useState('')
  const [dias, setDias] = useState(3)
  const [message, setMessage] = useState<[string,string]>(['',''])
  const [accionInsert, setAccionInsert] = useState(true) // Sirev para saber que accion hacer en el form, un insert o un update

  const navigate = useNavigate()


  useEffect(() => {
    getCategorias();
    
  }, []);

  useEffect(() => {
    if (categoria_id) {
      setAccionInsert(false) // Si hay categoria_id, es un update
      setNombreCategoria(categorias.find(categoria => categoria.categoria_id == Number(categoria_id))?.categoria_nombre || '')
      setDias(categorias.find(categoria => categoria.categoria_id == Number(categoria_id))?.dias_aviso || 3)
    }
  }, [categorias,categoria_id]);


  const crear = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    setMessage(['','']) // Limpiar mensaje de error antes de crear la categoría
    if (!nombreCategoria.trim()) return

    fetch('/api/crearCategoria', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ categoriaNombre: nombreCategoria.trim().toLowerCase(), diasAviso: dias }),
    })
    .then(res => res.json())
    .then(data => {
      if(data.error) {
        setMessage(['errorMsg', data.error]);
        return console.error('Error al crear categoría:', data.error);
      }
      console.log('Categoría creada:', data.categoria);
      setCategorias((actuales) => [...actuales, data.categoria]);
      setMessage(['successMsg',data.message])
      setTimeout(() => {
         setMessage(['',''])
         setNombreCategoria('')
    setDias(3)
      }, 2000); // Limpiar mensaje después de 3 segundos
    })
    .catch(error => {
      console.error('Error al crear categoría:', error);
    });
    
  }

  const editar = (e : React.SubmitEvent<HTMLFormElement>)=> {
      e.preventDefault()
      setMessage(['','']) // Limpiar mensaje de error antes de editar la categoría
      if (!nombreCategoria.trim()) return

      fetch('/api/editarCategoria', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ categoria_id, categoriaNombre: nombreCategoria.trim().toLowerCase(), diasAviso: dias }),
      })
      .then(res => res.json())
      .then(data => {
        if(data.error) {
          setMessage(['errorMsg', data.error]);
          return console.error('Error al editar categoría:', data.error);
        }
        console.log('Categoría editada:', data.categoria);
        setCategorias((actuales) => actuales.map(cat => cat.categoria_id === data.categoria.categoria_id ? data.categoria : cat));
        setMessage(['successMsg',data.message])
        setTimeout(() => {
          setMessage(['','']);
          setAccionInsert(true)
          setNombreCategoria('')
          setDias(3)  
          navigate('/categorias')
        }, 2000); // Limpiar mensaje después de 3 segundos

      })
      .catch(error => {
        console.error('Error al editar categoría:', error);
      });
      setNombreCategoria('')
      setDias(3)
  }

  
  function getCategorias() {
    fetch('/api/dashboard',{
          method: 'GET',
          credentials: 'include',
        })
    .then(res => res.json())
    .then(data => {
      console.log('Datos de categorías:', data);
      if(data.error) return console.error('Error al obtener categorías:', data.error);
      setCategorias(data.categorias);
      setProductos(data.productos);
    })
    .catch(error => {
      console.error('Error al obtener categorías:', error);
    });
  }

  

  return (
    <div className="pagina">
      <CabeceraPagina titulo="Categorías" descripcion="Agrupa tus productos y define cuándo quieres el aviso." />

      <form className="formulario formulario--ancho" onSubmit={accionInsert ? crear : editar}>
        <h2 className="subtitulo">Nueva categoría</h2>
        <div className="formulario__dos">
          <div className="campo">
            <label htmlFor="nombre-categoria">Nombre</label>
            <input
              id="nombre-categoria"
              placeholder="Ej. Pescadería"
              value={ucFirst(nombreCategoria)}
              onChange={(e) => setNombreCategoria(e.target.value)}
              required
            />
          </div>
          <div className="campo">
            <span className="campo__etiqueta">Avisar con antelación de</span>
            <EditorDias inicial={3} onChange={setDias} />
          </div>
        </div>
        <button type="submit" className="boton boton--primario boton--grande">
          {accionInsert ? (
            <>
            <Plus size={22} aria-hidden />
            <p>Crear categoría</p>
           </>
          ) : (
            <>
              <Pencil size={22} aria-hidden />
              <p>Editar categoría</p>
            </>
          )}
        </button>
        {message && <p className={`${message[0]}`}>{message[1]}</p>}
      </form>

      <section aria-labelledby="todas">
        <h2 id="todas" className="subtitulo">Todas las categorías ({categorias.length})</h2>
        <div className="categorias-grid">
          {categorias.map((categoria, i) => (
            <CategoriaTarjeta key={categoria.categoria_id} categoria={categoria} indice={i} productos={productos} />
          ))}
        </div>
      </section>
    </div>
  )
}
