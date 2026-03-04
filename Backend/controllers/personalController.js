const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { esNumeroEmpleado, formatearNombre } = require('../utils/validators'); 

//OBTENER LISTA
const obtenerPersonal = async (req, res) => {
    try {
        const personal = await prisma.personal_Academico.findMany({
            where: { activo: true },
            orderBy: { nombre_completo: 'asc' }
        });
        res.json(personal);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener personal' });
    }
};

//OBTENER UNO 
const obtenerPersonalPorID = async (req, res) => {
    try {
        const { id } = req.params;
        const personal = await prisma.personal_Academico.findUnique({
            where: { no_empleado: id }
        });
        if (!personal) return res.status(404).json({ error: 'No encontrado' });
        res.json(personal);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener detalle' });
    }
};

const crearPersonal = async (req, res) => {
    try {
        // Recibimos nombres separados
        const { no_empleado, nombres, paterno, materno, nombramiento } = req.body;

        if (!esNumeroEmpleado(no_empleado)) {
            return res.status(400).json({ error: 'El No. de Empleado debe ser de 6 dígitos.' });
        }

        // Unimos y formateamos (Mayúsculas automáticas)
        const nombreRaw = `${nombres} ${paterno} ${materno || ''}`;
        const nombreFinal = formatearNombre(nombreRaw);

        const nuevo = await prisma.personal_Academico.create({
            data: {
                no_empleado,
                nombre_completo: nombreFinal, 
                nombramiento: nombramiento || '',
                activo: true
            }
        });

        res.status(201).json(nuevo);
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(409).json({ error: 'El número de empleado ya existe.' });
        }
        res.status(500).json({ error: 'Error al registrar profesor.' });
    }
};

// ACTUALIZAR 
const actualizarPersonal = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombres, paterno, materno, nombramiento } = req.body;

        const dataToUpdate = {};

        // Si envían nombres, reconstruimos el nombre completo
        if (nombres && paterno) {
            const nombreRaw = `${nombres} ${paterno} ${materno || ''}`;
            dataToUpdate.nombre_completo = formatearNombre(nombreRaw);
        }

        if (nombramiento) dataToUpdate.nombramiento = nombramiento;

        const actualizado = await prisma.personal_Academico.update({
            where: { no_empleado: id },
            data: dataToUpdate
        });

        res.json(actualizado);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar profesor.' });
    }
};

// ELIMINAR (SOFT DELETE) 
const eliminarPersonal = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Verificamos si es parte de un comité activo antes de borrar
        const enComite = await prisma.comite_Tesista.findFirst({
            where: { personal_no_emp: id }
        });

        if (enComite) {
            return res.status(400).json({ error: 'No se puede eliminar: El profesor es parte de un comité activo.' });
        }

        await prisma.personal_Academico.update({
            where: { no_empleado: id },
            data: { activo: false }
        });

        res.json({ ok: true });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar profesor.' });
    }
};

module.exports = {
    obtenerPersonal,
    obtenerPersonalPorID,
    crearPersonal,
    actualizarPersonal,
    eliminarPersonal
};