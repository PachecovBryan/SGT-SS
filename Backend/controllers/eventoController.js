const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Obtener todos los eventos
const obtenerEventos = async (req, res) => {
    try {
        const eventos = await prisma.eventoCalendario.findMany({
            include: {
                alumno: {
                    select: { nombre_completo: true, carrera: true }
                }
            },
            orderBy: { fecha_evento: 'asc' }
        });
        res.json(eventos);
    } catch (error) {
        res.status(500).json({ error: 'Error al cargar eventos' });
    }
};

// Crear evento
const crearEvento = async (req, res) => {
    try {
        const { titulo, fecha_evento, descripcion, alumno_no_cuenta } = req.body;

        if (!titulo || !fecha_evento) {
            return res.status(400).json({ error: 'Título y fecha son obligatorios' });
        }

        const nuevoEvento = await prisma.eventoCalendario.create({
            data: {
                titulo,
                fecha_evento: new Date(fecha_evento), 
                descripcion,
                alumno_no_cuenta: alumno_no_cuenta || null 
            }
        });

        res.json(nuevoEvento);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear evento' });
    }
};

// Eliminar evento
const eliminarEvento = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.eventoCalendario.delete({
            where: { id: parseInt(id) }
        });
        res.json({ ok: true });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar evento' });
    }
};

module.exports = {
    obtenerEventos,
    crearEvento,
    eliminarEvento
};