import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import IniciarSesion from './pages/Login.jsx';
import Inicio from './pages/Inicio.jsx';
import AdminLayout from './pages/Layout/AdminLayout.jsx';

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
        <Route path="/" element={<Navigate to="/iniciar-sesion" replace />} />
        <Route path="*" element={<Navigate to="/Inicio" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
