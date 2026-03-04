const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { verPermiso } = require('../middlewares/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

//SUBIDA DE IMÁGENES
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'logo-' + unique + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

router.post('/upload', verPermiso(['Administrador']), upload.single('imagen'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'Falta imagen.' });
    res.json({ url: `/uploads/${req.file.filename}` });
});

//CONFIGURACIÓN DEL SISTEMA 
router.get('/config', verPermiso(), async (req, res) => {
    try {
        const configs = await prisma.configuracion.findMany();
        const obj = {}; 
        configs.forEach(c => { obj[c.clave] = c.valor });
        res.json(obj);
    } catch (e) { res.status(500).json({ error: 'Error de config' }); }
});

router.post('/config', verPermiso(['Administrador', 'Usuario']), async (req, res) => {
    try {
        const ops = Object.keys(req.body).map(k => 
            prisma.configuracion.upsert({ 
                where: { clave: k }, 
                update: { valor: req.body[k] || '' }, 
                create: { clave: k, valor: req.body[k] || '' } 
            })
        );
        await prisma.$transaction(ops);
        res.json({ ok: true });
    } catch (e) { res.status(500).json({ error: 'Error guardando configuración' }); }
});

// HISTORIAL DE BITÁCORA 
router.get('/bitacora', verPermiso(['Administrador', 'Usuario']), async (req, res) => {
    try {
        const { userId, rol } = req.user;
        const limit = req.query.limit ? parseInt(req.query.limit) : 50;
        let whereClause = {};

        if (rol !== 'Administrador') {
            const usuarioActual = await prisma.usuarios.findUnique({
                where: { no_empleado: userId }
            });
            if (usuarioActual) {
                whereClause = { usuario: usuarioActual.nombre_completo };
            } else {
                return res.json([]); 
            }
        }

        const logs = await prisma.bitacora.findMany({
            where: whereClause,
            orderBy: { fecha: 'desc' },
            take: limit
        });
        res.json(logs);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Error al obtener bitácora' });
    }
});

module.exports = router;