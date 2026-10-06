import { NavLink, Outlet } from 'react-router-dom'
import { FileUp, House, Layers, PackagePlus, Store, Tag } from 'lucide-react'
import { useEffect,useState } from 'react'
import type { Comercio } from '../types/comercio'

export default function AppLayout() {
  const [comercio, setComercio] = useState<Comercio | null>(null)
  useEffect(() => {
  getComerciodata()
}, [])

const enlaces = [
  { to: '/', etiqueta: 'Inicio', icono: House },
  { to: '/registrar', etiqueta: 'Registrar', icono: PackagePlus },
  { to: '/categorias', etiqueta: 'Categorías', icono: Layers },
  { to: '/productos', etiqueta: 'Productos', icono: Tag },
  { to: '/importar', etiqueta: 'Importar', icono: FileUp, soloEscritorio: true },
]

function getComerciodata() {
  fetch('/api/comercio', {
    method: 'GET',
    credentials: 'include',
  }).then(res => res.json())
  .then(data => {
     console.log('Comercio data',data.comercio[0])
     if(data.error) return;
    setComercio(data.comercio[0]);
   
  })
  .catch(err => {
    console.error('Error al obtener los datos del comercio:', err)
  })
}

function Marca() {
  return (
    <div className="marca">
      <span className="marca__logo">
        <Store size={20} aria-hidden />
      </span>
      <span className="marca__texto">
        {comercio?.comercio_nombre}
        <small>Control de caducidades</small>
      </span>
    </div>
  )
}

function Enlaces() {
  return enlaces.map(({ to, etiqueta, icono: Icono, soloEscritorio }) => (
    <NavLink
      key={to}
      to={to}
      end={to === '/'}
      className={({ isActive }) => `enlace-nav${isActive ? ' activo' : ''}${soloEscritorio ? ' enlace-nav--escritorio' : ''}`}
    >
      <Icono size={22} aria-hidden />
      {etiqueta}
    </NavLink>
  ))
}

  return (
    <div className="app">
      <aside className="barra-lateral">
        <Marca />
        <nav aria-label="Principal">
          <Enlaces />
        </nav>
      </aside>
      <header className="cabecera-movil">
        <Marca />
      </header>
      <main className="principal">
        <Outlet />
      </main>
      <nav className="nav-inferior" aria-label="Principal">
        <Enlaces />
      </nav>
    </div>
  )
}
