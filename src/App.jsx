import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import ProtectedRoute from './components/common/ProtectedRoute';


import ProductListPage from './pages/ProductListPage';
import CreateProductPage from './pages/CreateProductPage';
import ProductDetailPage from './pages/ProductDetailPage';
import EditProductPage from './pages/EditProductPage';


import ServiceListPage from './pages/ServiceListPage';
import CreateServicePage from './pages/CreateServicePage';
import ServiceDetailPage from './pages/ServiceDetailPage';
import EditServicePage from './pages/EditServicePage';


import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import UserManagementPage from './pages/UserManagementPage';
import CategoryManagementPage from './pages/CategoryManagementPage';


import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import './App.css';

function App() {
  return (
    <div className="App">
      <Navbar />
      <main>
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/" element={<ProductListPage />} />
          <Route path="/producto/:id" element={<ProductDetailPage />} />
          <Route path="/registro" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />

          <Route path="/servicios" element={<ServiceListPage />} />
          <Route path="/servicio/:id" element={<ServiceDetailPage />} /> {/* <-- ESTA ES LA RUTA QUE FALTABA O ESTABA INCORRECTA */}

          {/* Rutas Protegidas para usuarios logueados (USER o ADMIN) */}
          <Route element={<ProtectedRoute />}> {/* Protege a sus hijos si no está logueado */}
            <Route path="/crear-producto" element={<CreateProductPage />} />
            <Route path="/producto/:id/editar" element={<EditProductPage />} />
            
            <Route path="/crear-servicio" element={<CreateServicePage />} />
            <Route path="/servicio/:id/editar" element={<EditServicePage />} />
          </Route>

          {/* Rutas Protegidas SOLO para ADMIN */}
          <Route element={<ProtectedRoute allowedRoles={['ROLE_ADMIN']} />}> {/* Protege a sus hijos si no es ADMIN */}
            <Route path="/admin/usuarios" element={<UserManagementPage />} />
            <Route path="/admin/categorias" element={<CategoryManagementPage />} />
          </Route>
          
          {/* Podrías añadir una ruta para "Página no encontrada" (404) al final */}
          {/* <Route path="*" element={<div>Página no encontrada</div>} /> */}
        </Routes>
      </main>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}

export default App;