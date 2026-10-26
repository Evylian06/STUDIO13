import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import IniciarSesion from './pages/Login.jsx';
import Inicio from './pages/Inicio.jsx';
import AdminLayout from './pages/Layout/AdminLayout.jsx';
import Clientes from './pages/Cliente.jsx';
import Reservaciones from './pages/Reservaciones.jsx';
import Paquetes from './pages/Paquetes.jsx';
import Membresias from './pages/Menbresias.jsx';
import Galeria from './pages/Configuracion.jsx';
import ConfiguracionPanel from './pages/ConfiguracionPanel.jsx';

function RutaAdministrativa({ children }) {
  const token = sessionStorage.getItem('studio13AdminToken');
  const admin = sessionStorage.getItem('studio13Admin');
  return token && admin ? children : <Navigate to="/iniciar-sesion" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/iniciar-sesion" element={<IniciarSesion />} />
        <Route path="/Inicio" element={<RutaAdministrativa><AdminLayout><Inicio /></AdminLayout></RutaAdministrativa>} />
        <Route path="/admin/Clientes" element={<RutaAdministrativa><AdminLayout><Clientes /></AdminLayout></RutaAdministrativa>} />
        <Route path="/admin/Reservaciones" element={<RutaAdministrativa><AdminLayout><Reservaciones /></AdminLayout></RutaAdministrativa>} />
        <Route path="/admin/Paquetes" element={<RutaAdministrativa><AdminLayout><Paquetes /></AdminLayout></RutaAdministrativa>} />
        <Route path="/admin/Membresias" element={<RutaAdministrativa><AdminLayout><Membresias /></AdminLayout></RutaAdministrativa>} />
        <Route path="/admin/Galeria" element={<RutaAdministrativa><AdminLayout><Galeria /></AdminLayout></RutaAdministrativa>} />
        <Route path="/admin/Configuracion" element={<RutaAdministrativa><AdminLayout><ConfiguracionPanel /></AdminLayout></RutaAdministrativa>} />
        <Route path="/" element={<Navigate to="/iniciar-sesion" replace />} />
        <Route path="*" element={<Navigate to="/Inicio" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
