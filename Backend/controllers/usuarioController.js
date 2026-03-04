const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');
const { formatearNombre, esNumeroEmpleado } = require('../utils/validators'); 

// OBTENER TODOS
const obtenerUsuarios = async (req, res) => {
    try {
        const usuarios = await prisma.usuarios.findMany({ 
            where: { activo: true },
            include: { rol: true } 
        });
        res.json(usuarios);
    } catch (e) {
        res.status(500).json({ error: 'Error al obtener usuarios' });
    }
};

// CREAR USUARIO 
const crearUsuario = async (req, res) => {
    try {
        const { no_empleado, nombres, paterno, materno, correo, rol_id, password } = req.body;

        // Validaciones básicas
        if (!esNumeroEmpleado(no_empleado)) {
            return res.status(400).json({ error: 'El No. de Empleado debe ser de 6 dígitos.' });
        }

        // Formateo de Nombre
        const nombreRaw = `${nombres} ${paterno} ${materno || ''}`;
        let nombreFinal = formatearNombre(nombreRaw);

        const personalExiste = await prisma.personal_Academico.findUnique({
            where: { no_empleado }
        });
        if (personalExiste) {
            nombreFinal = personalExiste.nombre_completo;
        }

        const hash = bcrypt.hashSync(password, 10);

        await prisma.usuarios.create({ 
            data: { 
                no_empleado,
                nombre_completo: nombreFinal,
                correo: correo.toLowerCase(), 
                rol_id: parseInt(rol_id),
                password: hash, 
                activo: true 
            } 
        });

        // Bitácora
        await prisma.bitacora.create({
            data: {
                accion: 'Crear Usuario',
                usuario: req.user.nombre_completo, 
                detalle: `Se creó el usuario ${nombreFinal} (${no_empleado})`,
                entidad: 'Usuarios',
                ref_id: no_empleado
            }
        });

        res.status(201).json({ ok: true });
    } catch (e) { 
        if (e.code === 'P2002') return res.status(409).json({ error: 'El usuario o correo ya existen.' });
        res.status(500).json({ error: 'Error creando usuario.' }); 
    }
};

// ACTUALIZAR USUARIO
const actualizarUsuario = async (req, res) => {
    const { id } = req.params; 
    const idLogueado = req.user.userId;
    const esAdmin = req.user.rol === 'Administrador';
    
    // Seguridad: Solo admin o el mismo usuario pueden editar
    if (!esAdmin && id !== idLogueado) return res.status(403).json({ error: 'No autorizado.' });

    try {
        const { password, nombres, paterno, materno, correo, rol_id } = req.body; 
        
        const data = {};
        
        if (nombres && paterno) {
            const nombreRaw = `${nombres} ${paterno} ${materno || ''}`;
            data.nombre_completo = formatearNombre(nombreRaw);
        }

        if (correo) data.correo = correo.toLowerCase();
        
        if (esAdmin && rol_id) data.rol_id = parseInt(rol_id);
        
        if (password && password.trim() !== '') {
            data.password = bcrypt.hashSync(password, 10);
        }
        
        await prisma.usuarios.update({ where: { no_empleado: id }, data });
        
        await prisma.bitacora.create({
            data: {
                accion: 'Editar Usuario',
                usuario: req.user.nombre_completo,
                detalle: `Se actualizaron datos del usuario ${id}`,
                entidad: 'Usuarios',
                ref_id: id
            }
        });

        res.json({ ok: true });
    } catch (e) { res.status(500).json({ error: 'Error al actualizar.' }); }
};

// ELIMINAR USUARIO 
const eliminarUsuario = async (req, res) => {
    try {
        await prisma.usuarios.update({ 
            where: { no_empleado: req.params.id },
            data: { activo: false } 
        });
        
        await prisma.bitacora.create({
            data: {
                accion: 'Eliminar Usuario',
                usuario: req.user.nombre_completo,
                detalle: `Se desactivó el acceso al usuario ${req.params.id}`,
                entidad: 'Usuarios',
                ref_id: req.params.id
            }
        });

        res.json({ ok: true });
    } catch (e) { res.status(500).json({ error: 'No se puede borrar el usuario.' }); }
};

module.exports = {
    obtenerUsuarios,
    crearUsuario,
    actualizarUsuario,
    eliminarUsuario
};