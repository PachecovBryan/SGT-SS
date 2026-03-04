const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { verPermiso } = require('../middlewares/auth');

//Carreras
router.get('/carreras', verPermiso(), async (req, res) => { 
    try {
        const data = await prisma.carrera.findMany({ orderBy: { nombre: 'asc' } });
        res.json(data);
    } catch (e) { res.status(500).json({ error: 'Error al obtener carreras' }); }
});

router.post('/carreras', verPermiso(['Administrador']), async (req, res) => { 
    try {
        await prisma.carrera.create({ data: req.body }); 
        res.json({ ok: true });
    } catch (e) { res.status(500).json({ error: 'Error al crear carrera (¿Clave duplicada?)' }); }
});

router.put('/carreras/:clave', verPermiso(['Administrador']), async (req, res) => { 
    try {
        await prisma.carrera.update({ 
            where: { clave: req.params.clave }, 
            data: req.body 
        }); 
        res.json({ ok: true });
    } catch (e) { res.status(500).json({ error: 'Error al actualizar carrera' }); }
});

router.delete('/carreras/:clave', verPermiso(['Administrador']), async (req, res) => { 
    try { 
        await prisma.carrera.delete({ where: { clave: req.params.clave } }); 
        res.json({ ok: true }); 
    } catch (e) { res.status(400).json({ error: 'No se puede borrar, hay alumnos en esta carrera.' }); } 
});

// Personal
router.get('/personal', verPermiso(), async (req, res) => { 
    try {
        //Solo traemos los activos
        const data = await prisma.personal_Academico.findMany({ 
            where: { activo: true },
            orderBy: { nombre_completo: 'asc' } 
        });
        res.json(data);
    } catch (e) { res.status(500).json({ error: 'Error al obtener personal' }); }
});

router.post('/personal', verPermiso(['Administrador']), async (req, res) => { 
    try {
        await prisma.personal_Academico.create({ 
            data: { ...req.body, activo: true } 
        }); 
        res.json({ ok: true });
    } catch (e) { res.status(500).json({ error: 'Error al registrar personal' }); }
});

router.put('/personal/:no_empleado', verPermiso(['Administrador']), async (req, res) => { 
    try {
        const { activo, ...datos } = req.body; 
        await prisma.personal_Academico.update({ 
            where: { no_empleado: req.params.no_empleado }, 
            data: datos 
        }); 
        res.json({ ok: true });
    } catch (e) { res.status(500).json({ error: 'Error al actualizar personal' }); }
});

router.delete('/personal/:no_empleado', verPermiso(['Administrador']), async (req, res) => { 
    try { 
        await prisma.personal_Academico.update({ 
            where: { no_empleado: req.params.no_empleado },
            data: { activo: false }
        }); 
        res.json({ ok: true }); 
    } catch (e) { res.status(400).json({ error: 'Error al dar de baja.' }); } 
});

// Estatus
router.get('/estatus', verPermiso(), async (req, res) => { 
    try {
        const data = await prisma.estatus.findMany({ orderBy: { id: 'asc' } });
        res.json(data); 
    } catch (e) { res.status(500).json({ error: 'Error obteniendo estatus' }); }
});

router.post('/estatus', verPermiso(['Administrador']), async (req, res) => {
    try {
        const { nombre } = req.body;
        const nuevo = await prisma.estatus.create({ data: { nombre } });
        res.json(nuevo);
    } catch (e) {
        if (e.code === 'P2002') return res.status(409).json({ error: 'Ya existe ese nombre.' });
        res.status(500).json({ error: 'Error al crear.' });
    }
});

router.put('/estatus/:id', verPermiso(['Administrador']), async (req, res) => {
    try {
        await prisma.estatus.update({
            where: { id: parseInt(req.params.id) },
            data: { nombre: req.body.nombre }
        });
        res.json({ ok: true });
    } catch (e) { res.status(500).json({ error: 'Error al actualizar.' }); }
});

router.delete('/estatus/:id', verPermiso(['Administrador']), async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const uso = await prisma.alumnos.count({ where: { estatus_id: id } });
        if (uso > 0) return res.status(409).json({ error: `No se puede borrar: Hay ${uso} alumnos con este estatus.` });

        await prisma.estatus.delete({ where: { id } });
        res.json({ ok: true });
    } catch (e) { res.status(500).json({ error: 'Error al eliminar.' }); }
});

// Cargos
router.get('/cargos', verPermiso(), async (req, res) => {
    try {
        const cargos = await prisma.cargos.findMany({ orderBy: { nombre: 'asc' } });
        res.json(cargos);
    } catch (e) { res.status(500).json({ error: 'Error al obtener cargos' }); }
});

router.post('/cargos', verPermiso(['Administrador']), async (req, res) => {
    try {
        const { nombre } = req.body;
        const nuevo = await prisma.cargos.create({ data: { nombre } });
        res.json(nuevo);
    } catch (e) {
        if (e.code === 'P2002') return res.status(409).json({ error: 'Ya existe ese cargo.' });
        res.status(500).json({ error: 'Error al crear.' });
    }
});

router.put('/cargos/:id', verPermiso(['Administrador']), async (req, res) => {
    try {
        await prisma.cargos.update({
            where: { id: parseInt(req.params.id) },
            data: { nombre: req.body.nombre }
        });
        res.json({ ok: true });
    } catch (e) { res.status(500).json({ error: 'Error al actualizar.' }); }
});

router.delete('/cargos/:id', verPermiso(['Administrador']), async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const uso = await prisma.comite_Tesista.count({ where: { cargo_id: id } });
        if (uso > 0) return res.status(409).json({ error: `No se puede borrar: Hay ${uso} miembros de comité con este cargo.` });

        await prisma.cargos.delete({ where: { id } });
        res.json({ ok: true });
    } catch (e) { res.status(500).json({ error: 'Error al eliminar.' }); }
});

router.get('/roles', verPermiso(['Administrador']), async (req, res) => { 
    try { res.json(await prisma.roles.findMany()); } 
    catch (e) { res.status(500).json({ error: 'Error de roles' }); }
});

module.exports = router;