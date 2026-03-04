const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient(); 
const { verPermiso } = require('../middlewares/auth');

// ESTADÍSTICAS 
router.get('/stats', verPermiso(), async (req, res) => {
    try {
        const [totalAlumnos, totalCarreras, totalPersonal] = await prisma.$transaction([ 
            prisma.alumnos.count(), 
            prisma.carrera.count(), 
            prisma.personal_Academico.count()
        ]);

        // Gráfica estatus
        const porEstatus = await prisma.alumnos.groupBy({ 
            by: ['estatus_id'], 
            _count: { estatus_id: true } 
        });
        const estatusNombres = await prisma.estatus.findMany();
        const desglose = porEstatus.map(i => ({ 
            label: estatusNombres.find(e => e.id === i.estatus_id)?.nombre || 'Desconocido', 
            count: i._count.estatus_id 
        }));

        // Gráfica Alumnos por Carrera
        const porCarrera = await prisma.alumnos.groupBy({
            by: ['carrera_clave'],
            _count: { carrera_clave: true }
        });

        const carrerasNombres = await prisma.carrera.findMany();
        const desgloseCarreras = porCarrera.map(i => ({
            nombre: carrerasNombres.find(c => c.clave === i.carrera_clave)?.nombre || i.carrera_clave,
            cantidad: i._count.carrera_clave
        })).sort((a, b) => b.cantidad - a.cantidad); 

        res.json({ totalAlumnos, totalCarreras, totalPersonal, desglose, desgloseCarreras });

    } catch (e) { 
        console.error("ERROR /STATS:", e); 
        res.status(500).json({ error: 'Error obteniendo estadísticas' }); 
    }
});

// OPERATIVO 
router.get('/operativo', verPermiso(), async (req, res) => {
    try {
        const { userId, rol } = req.user;

        // BITÁCORA
        let whereLog = {};
        if (rol !== 'Administrador') {
            const usuarioActual = await prisma.usuarios.findUnique({ where: { no_empleado: userId } });
            whereLog = usuarioActual ? { usuario: usuarioActual.nombre_completo } : { id: -1 };
        }

        const recientes = await prisma.bitacora.findMany({
            where: whereLog,
            take: 5,
            orderBy: { fecha: 'desc' },
            select: { id: true, accion: true, usuario: true, fecha: true, detalle: true } 
        });

        // LISTA ATENCIÓN
        const condicionesAtencion = { 
            activo: true, 
            OR: [ 
                { tema_tesis: 'Sin tema registrado' }, 
                { folio_tesis: { startsWith: 'S/F' } },
                { comite: { none: {} } },
                {
                    AND: [
                        { folio_solicitud_examen: { not: null } },
                        { folio_solicitud_examen: { not: '' } }, 
                        { fecha_examen_replica: null }
                    ]
                }
            ] 
        };

        const pendientesCount = await prisma.alumnos.count({ where: condicionesAtencion });
        
        const listaAtencionRaw = await prisma.alumnos.findMany({
            where: condicionesAtencion,
            take: 5, 
            select: { 
                no_cuenta: true, 
                nombre_completo: true, 
                tema_tesis: true, 
                folio_tesis: true, 
                folio_solicitud_examen: true,
                fecha_examen_replica: true,
                comite: { select: { id: true } } 
            }
        });

        const listaAtencion = listaAtencionRaw.map(a => {
            let motivo = 'Revisar Expediente';
            
            if (a.folio_solicitud_examen && !a.fecha_examen_replica) motivo = 'Solicitud Examen Pendiente'; 
            else if (!a.comite || a.comite.length === 0) motivo = 'Sin Comité Asignado';
            else if (!a.tema_tesis || a.tema_tesis === 'Sin tema registrado') motivo = 'Falta Tema Tesis';
            else if (a.folio_tesis && a.folio_tesis.startsWith('S/F')) motivo = 'Folio Provisional';
            
            return { no_cuenta: a.no_cuenta, nombre_completo: a.nombre_completo, motivo };
        });

        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0); 
        
        const siguienteSemana = new Date();
        siguienteSemana.setDate(hoy.getDate() + 15); 
        
        const eventosManuales = await prisma.eventoCalendario.findMany({
            where: {
                fecha_evento: {
                    gte: hoy,
                    lte: siguienteSemana
                }
            }
        });

        const examenes = await prisma.alumnos.findMany({
            where: {
                fecha_examen_replica: {
                    gte: hoy,
                    lte: siguienteSemana
                },
                activo: true
            },
            select: {
                no_cuenta: true,
                nombre_completo: true,
                fecha_examen_replica: true
            }
        });

    const agendaMapeada = [
        ...eventosManuales
            .filter(e => {
                const fechaManual = new Date(e.fecha_evento).getTime();
                
                const esDuplicado = examenes.some(ex => {
                    const fechaExamen = new Date(ex.fecha_examen_replica).getTime();
                    const diff = Math.abs(fechaManual - fechaExamen);
                    const tituloLower = e.titulo.toLowerCase();
                    
                    return diff < 120000 && (tituloLower.includes('examen') || tituloLower.includes('réplica') || tituloLower.includes('replica'));
                });

                return !esDuplicado;
            })
            .map(e => ({
                id: e.id,
                titulo: e.titulo,
                fecha_evento: e.fecha_evento
            })),
        
        ...examenes.map(e => ({
            id: `examen-${e.no_cuenta}`, 
            titulo: `Examen: ${e.nombre_completo}`,
            fecha_evento: e.fecha_examen_replica
        }))
    ];

        const agendaFinal = agendaMapeada
            .sort((a, b) => new Date(a.fecha_evento) - new Date(b.fecha_evento))
            .slice(0, 5);

        res.json({ recientes, pendientes: pendientesCount, listaAtencion, agenda: agendaFinal });

    } catch (e) { 
        console.error("ERROR /OPERATIVO:", e);
        res.status(500).json({ error: 'Error operativo' }); 
    }
});

module.exports = router;