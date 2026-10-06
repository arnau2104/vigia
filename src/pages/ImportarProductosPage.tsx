import { Download, Info } from 'lucide-react'
import CabeceraPagina from '../components/CabeceraPagina'
import ZonaCsv from '../components/ZonaCsv'

const columnas = [
  { nombre: 'ean', obligatorio: true, descripcion: 'Código de barras de 8 a 13 dígitos', ejemplo: '8410000123456' },
  { nombre: 'nombre', obligatorio: true, descripcion: 'Nombre del producto', ejemplo: 'Yogur natural pack 4' },
  { nombre: 'categoria', obligatorio: true, descripcion: 'Categoría del producto; si no existe, se crea', ejemplo: 'Lácteos' },
]

const plantilla = `${columnas.map((c) => c.nombre).join(',')}\n${columnas.map((c) => c.ejemplo).join(',')}\n`

function descargarPlantilla() {
  const url = URL.createObjectURL(new Blob(['﻿' + plantilla], { type: 'text/csv;charset=utf-8' }))
  const enlace = document.createElement('a')
  enlace.href = url
  enlace.download = 'plantilla-productos.csv'
  enlace.click()
  URL.revokeObjectURL(url)
}

export default function ImportarProductosPage() {
  return (
    <div className="pagina">
      <CabeceraPagina titulo="Importar productos" descripcion="Añade muchos productos de una vez con un archivo CSV.">
        <button type="button" className="boton boton--suave" onClick={descargarPlantilla}>
          <Download size={20} aria-hidden />
          Descargar plantilla
        </button>
      </CabeceraPagina>

      <div className="importar">
        <section className="panel" aria-labelledby="como">
          <h2 id="como" className="subtitulo">Cómo hacerlo</h2>
          <ol className="pasos">
            <li>Descarga la plantilla y ábrela con Excel, Numbers o Google Sheets.</li>
            <li>Rellena una fila por producto, sin cambiar los nombres de las columnas.</li>
            <li>Guárdala como CSV (separado por comas o punto y coma).</li>
            <li>Súbela aquí y revisa el resultado antes de confirmar.</li>
          </ol>
          <p className="aviso">
            <Info size={18} aria-hidden />
            Si un EAN ya existe, se actualizarán sus datos. Los días de aviso se definen en cada categoría.
          </p>
        </section>

        <section className="panel" aria-labelledby="subir">
          <h2 id="subir" className="subtitulo">Sube tu archivo</h2>
          <ZonaCsv />
        </section>
      </div>

      <section className="panel" aria-labelledby="columnas">
        <h2 id="columnas" className="subtitulo">Columnas del archivo</h2>
        <div className="tabla-envoltorio tabla-envoltorio--siempre">
          <table className="tabla">
            <thead>
              <tr>
                <th>Columna</th>
                <th>Obligatoria</th>
                <th>Descripción</th>
                <th>Ejemplo</th>
              </tr>
            </thead>
            <tbody>
              {columnas.map((c, i) => (
                <tr key={c.nombre} style={{ '--i': i } as React.CSSProperties}>
                  <td><code>{c.nombre}</code></td>
                  <td>{c.obligatorio ? 'Sí' : 'No'}</td>
                  <td>{c.descripcion}</td>
                  <td>{c.ejemplo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
