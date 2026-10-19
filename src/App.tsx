import { Route, Routes } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import CategoriaDetallePage from './pages/CategoriaDetallePage'
import CategoriasPage from './pages/CategoriasPage'
import ImportarProductosPage from './pages/ImportarProductosPage'
import InicioPage from './pages/InicioPage'
import ProductosPage from './pages/ProductosPage'
import RegistrarLotePage from './pages/RegistrarLotePage'
import EditarProducto from './pages/EditarProducto'

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<InicioPage />} />
        <Route path="registrar" element={<RegistrarLotePage />} />
        <Route path="reponer/:producto_id" element={<RegistrarLotePage />} />
         <Route path="/producto/registrar" element={<RegistrarLotePage />} />
        <Route path="categorias" element={<CategoriasPage />} />
        <Route path="categorias/editar/:categoria_id" element={<CategoriasPage />} />
        <Route path="categoria/:categoria_id" element={<CategoriaDetallePage />} />
        <Route path="productos" element={<ProductosPage />} />
        <Route path="productos/:producto_id/editar" element={<EditarProducto />} />
        <Route path="importar" element={<ImportarProductosPage />} />
      </Route>
    </Routes>
  )
}
