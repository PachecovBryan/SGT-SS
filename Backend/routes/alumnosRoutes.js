const express = require('express');
const router = express.Router();
const { verPermiso } = require('../middlewares/auth');
const alumnoController = require('../controllers/alumnoController');

// Rutas Públicas 
router.get('/', verPermiso(), alumnoController.obtenerAlumnos);
router.get('/:no_cuenta', verPermiso(), alumnoController.obtenerAlumnoPorCuenta);

// Rutas Administrativas
router.post('/', verPermiso(['Administrador', 'Usuario']), alumnoController.registrarAlumno);
router.put('/:no_cuenta', verPermiso(['Administrador', 'Usuario']), alumnoController.actualizarExpediente);
router.delete('/:no_cuenta', verPermiso(['Administrador']), alumnoController.eliminarAlumno);

// Rutas Específicas
router.post('/comite/:no_cuenta', verPermiso(['Administrador', 'Usuario']), alumnoController.asignarComite);

// Rutas evidencias
router.post('/:no_cuenta/evidencia', verPermiso(['Administrador', 'Usuario']), alumnoController.agregarEvidencia);
router.delete('/evidencia/:id', verPermiso(['Administrador', 'Usuario']), alumnoController.eliminarEvidencia);

module.exports = router;