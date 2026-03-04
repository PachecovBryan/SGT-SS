const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();

app.use(cors({
  origin: ['https://sgt-sistema.vercel.app', 'http://localhost:5173'], 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Servir imágenes estáticas
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

// Módulos Principales
app.use('/api/alumnos', require('./routes/alumnosRoutes')); 
app.use('/api/reportes', require('./routes/reportesRoutes')); 
app.use('/api/eventos', require('./routes/eventosRoutes'));   

// Dashboard y Búsqueda
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/search', require('./routes/searchRoutes'));

// Catálogos y Personal
app.use('/api/catalogos/personal', require('./routes/personalRoutes')); 
app.use('/api/catalogos', require('./routes/catalogosRoutes')); 

// Administración y Usuarios
app.use('/api/admin/usuarios', require('./routes/usuarioRoutes')); 
app.use('/api/admin', require('./routes/adminRoutes')); 

//  Autenticación
app.use('/api', require('./routes/authRoutes')); 

const PORT = process.env.PORT || 4000; 

app.listen(PORT, () => {
  console.log(` Servidor SGT corriendo en puerto ${PORT}`);
});