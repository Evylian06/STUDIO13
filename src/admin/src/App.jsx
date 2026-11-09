import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import IniciarSesion from './pages/Login.jsx';
import Inicio from './pages/Inicio.jsx';
import AdminLayout from './pages/Layout/AdminLayout.jsx';
import Clientes from './pages/Cliente.jsx';
import Reservaciones from './pages/Reservaciones.jsx';
import Paquetes from './pages/Paquetes.jsx';
import Membresias from './pages/Menbresias.jsx';
import Galeria from './pages/Galeria.jsx';
import ConfiguracionPanel from './pages/ConfiguracionPanel.jsx';
import GestionPublicidad from './pages/GestionPublicidad.jsx';
import DiagnosticoTecnico from './pages/DiagnosticoTecnico.jsx';
import Campanas from './pages/Campanas.jsx';
import { ADMIN_ROLES } from './auth/adminRoles.js';

function leerAdmin() {
  try {
    return JSON.parse(sessionStorage.getItem('studio13Admin') || 'null');
  } catch {
    return null;
  }
}

function RutaAdministrativa({ children, roles }) {
  const token = sessionStorage.getItem('studio13AdminToken');
  const admin = leerAdmin();
  if (!token || !Object.values(ADMIN_ROLES).includes(admin?.role)) {
    return <Navigate to="/iniciar-sesion" replace />;
  }
  if (roles && !roles.includes(admin.role)) {
    return <Navigate to={admin.role === ADMIN_ROLES.DEVELOPER ? '/admin/Diagnostico' : '/Inicio'} replace />;
  }
  return children;
}

const soloDuena = [ADMIN_ROLES.OWNER];
const soloDesarrollador = [ADMIN_ROLES.DEVELOPER];

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/iniciar-sesion" element={<IniciarSesion />} />
        <Route path="/Inicio" element={<RutaAdministrativa roles={soloDuena}><AdminLayout><Inicio /></AdminLayout></RutaAdministrativa>} />
        <Route path="/admin/Clientes" element={<RutaAdministrativa roles={soloDuena}><AdminLayout><Clientes /></AdminLayout></RutaAdministrativa>} />
        <Route path="/admin/Reservaciones" element={<RutaAdministrativa roles={soloDuena}><AdminLayout><Reservaciones /></AdminLayout></RutaAdministrativa>} />
        <Route path="/admin/Paquetes" element={<RutaAdministrativa roles={soloDuena}><AdminLayout><Paquetes /></AdminLayout></RutaAdministrativa>} />
        <Route path="/admin/Membresias" element={<RutaAdministrativa roles={soloDuena}><AdminLayout><Membresias /></AdminLayout></RutaAdministrativa>} />
        <Route path="/admin/Galeria" element={<RutaAdministrativa roles={soloDuena}><AdminLayout><Galeria /></AdminLayout></RutaAdministrativa>} />
        <Route path="/admin/Configuracion" element={<RutaAdministrativa roles={soloDuena}><AdminLayout><ConfiguracionPanel /></AdminLayout></RutaAdministrativa>} />
        <Route path="/admin/GestionPublicidad" element={<RutaAdministrativa roles={soloDuena}><AdminLayout><GestionPublicidad /></AdminLayout></RutaAdministrativa>} />
        <Route path="/admin/Campanas" element={<RutaAdministrativa roles={soloDuena}><AdminLayout><Campanas /></AdminLayout></RutaAdministrativa>} />
        <Route path="/admin/Diagnostico" element={<RutaAdministrativa roles={soloDesarrollador}><AdminLayout><DiagnosticoTecnico /></AdminLayout></RutaAdministrativa>} />
        <Route path="/" element={<Navigate to="/iniciar-sesion" replace />} />
        <Route path="*" element={<Navigate to="/Inicio" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
