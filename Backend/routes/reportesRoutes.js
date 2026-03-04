const express = require('express');
const router = express.Router();
const { verPermiso } = require('../middlewares/auth');

const reportesController = require('../controllers/reportesController');

if (!reportesController || !reportesController.obtenerDashboard) {
    reportesController.obtenerDashboard = (req, res) => res.status(500).json({error: 'Error interno de configuración'});
}
router.get('/dashboard', verPermiso(['Administrador', 'Usuario']), reportesController.obtenerDashboard);

module.exports = router;