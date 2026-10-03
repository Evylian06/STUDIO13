import { BrowserRouter, Routes, Route } from 'react-router-dom';
import IniciarSesion from './pages/auth/IniciarSesion.jsx';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<IniciarSesion />} />
        <Route path="/iniciar-sesion" element={<IniciarSesion />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

