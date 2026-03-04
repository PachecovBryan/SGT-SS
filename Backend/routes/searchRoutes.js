const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { verPermiso } = require('../middlewares/auth');

router.get('/', verPermiso(), async (req, res) => {
    const { q } = req.query;
    const esAdmin = req.user.rol === 'Administrador';

    if (!q || q.length < 2) return res.json([]);

    try {
        const promises = [
            // ALUMNOS
            prisma.alumnos.findMany({
                where: {
                    OR: [
                        { nombre_completo: { contains: q, mode: 'insensitive' } },
                        { no_cuenta: { contains: q } }
                    ]
                },
                take: 3,
                select: { nombre_completo: true, no_cuenta: true, carrera: true }
            }),
            // PERSONAL
            prisma.personal_Academico.findMany({
                where: { nombre_completo: { contains: q, mode: 'insensitive' } },
                take: 3
            }),
            // CARRERAS 
            prisma.carrera.findMany({
                where: { nombre: { contains: q, mode: 'insensitive' } },
                take: 3
            })
        ];

        // USUARIOS solo el admin
        if (esAdmin) {
            promises.push(
                prisma.usuarios.findMany({
                    where: {
                        OR: [
                            { nombre_completo: { contains: q, mode: 'insensitive' } },
                            { correo: { contains: q, mode: 'insensitive' } }
                        ]
                    },
                    take: 3,
                    include: { rol: true }
                })
            );
        }

        const resultadosRaw = await Promise.all(promises);

        //solo la opcion seleccinada
        const alumnos = resultadosRaw[0] || [];
        const personal = resultadosRaw[1] || [];
        const carreras = resultadosRaw[2] || [];
        const usuarios = esAdmin ? (resultadosRaw[3] || []) : [];

        // Formatear resultados 
        const resultados = [
            ...alumnos.map(a => ({
                group: 'Alumnos',
                value: a.nombre_completo,
                label: a.nombre_completo,
                description: a.no_cuenta,
                link: `/expediente/${a.no_cuenta}` 
            })),
            ...personal.map(p => ({
                group: 'Personal Académico',
                value: p.nombre_completo,
                label: p.nombre_completo,
                description: p.nombramiento || 'Docente',
                link: `/admin/personal?q=${encodeURIComponent(p.nombre_completo)}` 
            })),
            ...carreras.map(c => ({
                group: 'Carreras',
                value: c.nombre,
                label: c.nombre,
                description: 'Licenciatura / Ingeniería',
                link: `/admin/carreras?q=${encodeURIComponent(c.nombre)}` 
            })),
            ...usuarios.map(u => ({
                group: 'Usuarios Sistema',
                value: u.nombre_completo,
                label: u.nombre_completo,
                description: u.rol.nombre,
                link: `/admin/usuarios?q=${encodeURIComponent(u.nombre_completo)}` 
            }))
        ];

        res.json(resultados);

    } catch (error) {
        res.status(500).json([]);
    }
});

module.exports = router;