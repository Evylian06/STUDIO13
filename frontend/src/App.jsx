import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Inicio from './pages/Inicio';
import Servicios from './pages/Servicios';
import Portafolio from './pages/Portafolio';
import Paquetes from './pages/Paquetes';
import Nosotros from './pages/Nosotros';
import Contacto from './pages/Contacto';

function App() {
  return (
    <BrowserRouter>
      <Routes>
       <Route path="/" element={<Inicio />} />
       <Route path="/servicios" element={<Servicios />} />
       <Route path="/portafolio" element={<Portafolio />} />
       <Route path="/paquetes" element={<Paquetes />} />
       <Route path="/nosotros" element={<Nosotros />} />
       <Route path="/contacto" element={<Contacto />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
