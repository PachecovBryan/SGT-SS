const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const obtenerDashboard = async (req, res) => {
    try {
        // TOTALES
        const totalAlumnos = await prisma.alumnos.count({ where: { activo: true } });
        const titulados = await prisma.alumnos.count({ 
            where: { activo: true, estatus: { nombre: { contains: 'Titulado', mode: 'insensitive' } } } 
        });
        const enProceso = totalAlumnos - titulados;

        // POR CARRERA
        const porCarreraRaw = await prisma.alumnos.groupBy({
            by: ['carrera_clave'],
            _count: { no_cuenta: true },
            where: { activo: true }
        });
        const carreras = await prisma.carrera.findMany();
        const porCarrera = porCarreraRaw.map(item => {
            const carrera = carreras.find(c => c.clave === item.carrera_clave);
            return {
                nombre: item.carrera_clave,
                nombreCompleto: carrera ? carrera.nombre : 'Desc.',
                cantidad: item._count.no_cuenta
            };
        });

        // POR ESTATUS
        const porEstatusRaw = await prisma.alumnos.groupBy({
            by: ['estatus_id'],
            _count: { no_cuenta: true },
            where: { activo: true }
        });
        const estatusList = await prisma.estatus.findMany();
        const porEstatus = porEstatusRaw.map(item => {
            const est = estatusList.find(e => e.id === item.estatus_id);
            return {
                name: est ? est.nombre : 'Desconocido',
                value: item._count.no_cuenta
            };
        });

        //  DIRECTORES
        const topDirectoresRaw = await prisma.comite_Tesista.groupBy({
            by: ['personal_no_emp'],
            _count: { alumno_no_cuenta: true },
            where: {
                cargo: { nombre: { contains: 'Director', mode: 'insensitive' } },
                alumno: { activo: true, NOT: { estatus: { nombre: { contains: 'Titulado', mode: 'insensitive' } } } }
            },
            orderBy: { _count: { alumno_no_cuenta: 'desc' } },
            take: 5
        });
        const personal = await prisma.personal_Academico.findMany({
            where: { no_empleado: { in: topDirectoresRaw.map(d => d.personal_no_emp) } }
        });
        const topDirectores = topDirectoresRaw.map(item => {
            const p = personal.find(pers => pers.no_empleado === item.personal_no_emp);
            return {
                nombre: p ? p.nombre_completo : 'Desconocido',
                alumnos: item._count.alumno_no_cuenta
            };
        });

        //  REZAGADOS
        const dosAniosAtras = new Date();
        dosAniosAtras.setFullYear(dosAniosAtras.getFullYear() - 2);
        const rezagados = await prisma.alumnos.findMany({
            where: {
                activo: true,
                fecha_aceptacion: { lt: dosAniosAtras },
                NOT: { estatus: { nombre: { contains: 'Titulado', mode: 'insensitive' } } }
            },
            select: { no_cuenta: true, nombre_completo: true, fecha_aceptacion: true },
            take: 10
        });

        res.json({
            kpis: { total: totalAlumnos, titulados, enProceso },
            graficas: { porCarrera, porEstatus },
            tablas: { topDirectores, rezagados }
        });

    } catch (error) {
        console.error("Error en dashboard:", error);
        res.status(500).json({ error: 'Error generando reportes' });
    }
};

module.exports = {
    obtenerDashboard
};