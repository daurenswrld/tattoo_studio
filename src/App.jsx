import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Admin/Login';
import Dashboard from './pages/Admin/Dashboard';

function App() {
  return (
    <div className="app">
      <Routes>
        {/* Клиентская часть */}
        <Route path="/" element={<Home />} />
        
        {/* Админка */}
        <Route path="/admin" element={<Login />} />
        <Route path="/admin/dashboard" element={<Dashboard />} />
        
        {/* Заглушка для неизвестных страниц */}
        <Route path="*" element={<Home />} />
      </Routes>
    </div>
  );
}

export default App;
