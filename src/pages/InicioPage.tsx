import { useState, useEffect,useRef } from 'react'
import { AlarmClock, Clock, OctagonAlert } from 'lucide-react'
import CabeceraPagina from '../components/CabeceraPagina'
import LoteTarjeta from '../components/LoteTarjeta'
import CategoriaTarjeta from '../components/CategoriaTarjeta'
import type { LoteView } from '../types/lote'
import type { Categoria } from '../types/categoria'
import type { Producto } from '../types/producto'
import { tipoAviso } from '../utils/tipoAviso'
import { retirarLote } from '../utils/retirarLote'
import { deshacerRetirar } from '../utils/deshacerRetirar'


// import { lotesMuestra } from '../data/muestra'
const contadores = [
  { nivel: 'caducado', etiqueta: 'Caducados', icono: OctagonAlert },
  { nivel: 'hoy', etiqueta: 'Caducan hoy', icono: AlarmClock },
  { nivel: 'proximo', etiqueta: 'Próximos días', icono: Clock },
] as const

export default function InicioPage() {
  // const [retirados, setRetirados] = useState<string[]>([])
  // const [urgentes, setUrgentes] = useState<LoteView[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [lotes, setLotes] = useState<LoteView[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);

  const temporizadores = useRef<Record<number, ReturnType<typeof setTimeout>>>({})
  // const [avisos, setAvisos] = useState<LoteView[]>([]);

  // Datos derivados: se recalculan solos cada vez que cambia `lotes`
  const avisos = lotes.filter(l => l.activo === 1 && tipoAviso(l) !== 'correcto')
  const urgentes = avisos.filter(l => ['caducado', 'hoy'].includes(tipoAviso(l)))

  useEffect(() => {
    getDashboardData();
  }, []);

//  useEffect(() => {
//   const conAviso = lotes.filter(l => l.activo === 1 && tipoAviso(l) !== 'correcto')
//   const urgentesLotes = conAviso.filter(l => ['caducado', 'hoy'].includes(tipoAviso(l)))
//   setAvisos(conAviso)
//   setUrgentes(urgentesLotes)
// }, [lotes])


  function getDashboardData() {
      fetch('/api/dashboard',{
            method: 'GET',
            credentials: 'include',
          })
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        console.log('Datos del dashboard:', data);
        setCategorias(data.categorias);
        setLotes(data.lotes);
        setProductos(data.productos);
      })
      .catch((error) => {
        console.error('Error al solicitar datos en el dashboard:', error);
      });
  }

  const retirarLoteHandler = async (lote_id: number) => {
    const retiradoOk = await retirarLote(lote_id);
    if (retiradoOk) {
      temporizadores.current[lote_id] = setTimeout(() => {
        setLotes(ls => ls.filter(lote => lote.lote_id !== lote_id));
      }, 2600);
    } else {
      console.error('Error al retirar el lote con ID:', lote_id);
    }
    return retiradoOk;
  };

  const deshacerRetirarHandler = async (lote_id: number) => {
      clearTimeout(temporizadores.current[lote_id]);   // la tarjeta ya no se borrará
      const deshacerOk = await deshacerRetirar(lote_id);
      const loterestaurado = deshacerOk?.lote;

      if (deshacerOk.ok && loterestaurado) {
        // Aquí puedes actualizar el estado de los lotes si es necesario
        console.log('Se ha deshecho el retiro del lote con ID:', lote_id);
        setTimeout(() => {
          setLotes(ls =>[...ls, loterestaurado]);
        }, 2600);
      } else {
        console.error('Error al deshacer el retiro del lote con ID:', lote_id);
      }
      return deshacerOk.ok;
  };

  return (
    <div className="pagina">
      <CabeceraPagina titulo="Avisos" descripcion="Lo que necesita tu atención ahora mismo." />
      <section className="contadores" aria-label="Resumen">
        {contadores.map(({ nivel, etiqueta, icono: Icono }, i) => (
          <div key={nivel} className={`contador contador--${nivel}`} style={{ '--i': i } as React.CSSProperties}>
            <Icono size={26} aria-hidden />
            <strong>{avisos.filter((l) => tipoAviso(l) === nivel).length}</strong>
            <span>{etiqueta}</span>
          </div>
        ))}
      </section>
      <section aria-labelledby="urgentes">
        <h2 id="urgentes" className="subtitulo">Lotes urgentes</h2>
        <div className="lista-lotes">
          {urgentes.map((lote, i) => (
            <LoteTarjeta
              key={lote.lote_id}
              lote={lote}
              indice={i}
              ocultarAlRetirar
              onRetirar={retirarLoteHandler}
              onDeshacerRetirar={deshacerRetirarHandler}
            />
          ))}
        </div>
      </section>
      <section aria-labelledby="categorias">
        <h2 id="categorias" className="subtitulo">Categorías</h2>
        <div className="categorias-grid">
          {categorias.map((categoria) => (
            <CategoriaTarjeta key={categoria.categoria_id} categoria={categoria} indice={categoria.categoria_id} productos={productos} />
          ))}
        </div>
      </section>
    </div>
  )
}
