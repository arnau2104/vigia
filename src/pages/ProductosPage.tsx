import { FileUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import BuscadorEscaneo from '../components/BuscadorEscaneo'
import CabeceraPagina from '../components/CabeceraPagina'
import InsigniaLote from '../components/InsigniaLote'
import LoteTarjeta from '../components/LoteTarjeta'
import { categoriasMuestra, lotesMuestra } from '../data/muestra'

export default function ProductosPage() {
  return (
    <div className="pagina">
      <CabeceraPagina titulo="Productos" descripcion="Todos los productos con sus fechas de caducidad.">
        <Link to="/importar" className="boton boton--suave">
          <FileUp size={20} aria-hidden />
          Importar CSV
        </Link>
      </CabeceraPagina>
      <BuscadorEscaneo />
      <div className="filtros">
        <label className="campo campo--corto">
          <span className="solo-lectores">Estado</span>
          <select defaultValue="">
            <option value="">Todos los estados</option>
            <option>Con aviso</option>
            <option>Pendiente de reposición</option>
          </select>
        </label>
        <label className="campo campo--corto">
          <span className="solo-lectores">Categoría</span>
          <select defaultValue="">
            <option value="">Todas las categorías</option>
            {categoriasMuestra.map((c) => (
              <option key={c.id}>{c.nombre}</option>
            ))}
          </select>
        </label>
        <label className="campo campo--corto">
          <span className="solo-lectores">Urgencia</span>
          <select defaultValue="">
            <option value="">Cualquier urgencia</option>
            <option>Caducado</option>
            <option>Hoy</option>
            <option>Próximo</option>
            <option>Correcto</option>
          </select>
        </label>
      </div>

      <div className="lista-lotes lista-lotes--movil">
        {lotesMuestra.map((lote, i) => (
          <LoteTarjeta key={lote.id} lote={lote} indice={i} />
        ))}
      </div>

      <div className="tabla-envoltorio">
        <table className="tabla">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Categoría</th>
              <th>Ubicación</th>
              <th>Caducidad</th>
              <th>Aviso</th>
            </tr>
          </thead>
          <tbody>
            {lotesMuestra.map((l, i) => (
              <tr key={l.id} style={{ '--i': i } as React.CSSProperties}>
                <td>
                  <strong>{l.producto}</strong>
                  <small>{l.ean}</small>
                </td>
                <td>{l.categoria}</td>
                <td>{l.ubicacion}</td>
                <td>{l.fecha}</td>
                <td><InsigniaLote lote={l} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
