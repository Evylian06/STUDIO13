import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import IniciarSesion from './pages/auth/IniciarSesion.jsx';
import Inicio from './pages/Inicio.jsx';
import AdminLayout from './pages/Components/AdminLayout.jsx';
import Clientes from './pages/Cliente.jsx';

function RutaAdministrativa({ children }) {
  const token = sessionStorage.getItem('studio13AdminToken');

  if (!token) {
    return <Navigate to="/iniciar-sesion" replace />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<IniciarSesion />} />
        <Route path="/iniciar-sesion" element={<IniciarSesion />} />
        <Route path="/Inicio" element={<Inicio />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
