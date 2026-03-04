const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { esCuentaAlumno, generarFolio, formatearNombre, validarComite } = require('../utils/validators'); 

// OBTENER TODOS
const obtenerAlumnos = async (req, res) => {
    try {
        const lista = await prisma.alumnos.findMany({
            where: { activo: true },
            include: { carrera: true, estatus: true, comite: { include: { personal: true, cargo: true } } },
            orderBy: { fecha_aceptacion: 'desc' }
        });
        res.json(lista);
    } catch (e) { res.status(500).json({ error: 'Error cargando alumnos.' }); }
};

// OBTENER UNO
const obtenerAlumnoPorCuenta = async (req, res) => {
    try {
        const alumno = await prisma.alumnos.findUnique({
            where: { no_cuenta: req.params.no_cuenta, activo: true },
            include: { 
                carrera: true, 
                estatus: true, 
                evidencias: true, 
                comite: { 
                    include: { personal: true, cargo: true },
                    orderBy: { cargo_id: 'asc' }
                } 
            }
        });
        if (!alumno) return res.status(404).json({ error: 'Alumno no encontrado.' });
        res.json(alumno);
    } catch (e) { res.status(500).json({ error: 'Error cargando detalle.' }); }
};

const registrarAlumno = async (req, res) => {
    try {
        const { no_cuenta, paterno, materno, nombres, tema_tesis, carrera_clave, estatus_id, director_id, fecha_aceptacion, observaciones } = req.body;
        
        if (!esCuentaAlumno(no_cuenta)) return res.status(400).json({ error: 'El No. de Cuenta debe ser de 8 dígitos.' });

        const p = paterno || ''; const m = materno || ''; const n = nombres || '';
        const nombreRaw = `${n} ${p} ${m}`.trim(); 
        const nombreFinal = formatearNombre(nombreRaw); 
        const temaFinal = tema_tesis && tema_tesis.trim() !== '' ? formatearNombre(tema_tesis) : 'Tema por definir';

        await prisma.$transaction(async (tx) => {
            const ultimo = await tx.alumnos.findFirst({ where: { carrera_clave }, orderBy: { folio_tesis: 'desc' } });
            const nuevoFolio = generarFolio(carrera_clave, ultimo?.folio_tesis);

            const nuevo = await tx.alumnos.create({
                data: {
                    no_cuenta, 
                    nombre_completo: nombreFinal,
                    folio_tesis: nuevoFolio,
                    tema_tesis: temaFinal,
                    carrera_clave, 
                    estatus_id: parseInt(estatus_id),
                    director_id: director_id || null,
                    fecha_aceptacion: fecha_aceptacion ? new Date(fecha_aceptacion) : new Date(),
                    observaciones: observaciones || '',
                    activo: true 
                }
            });

            if (director_id) {
                const cargo = await tx.cargos.findFirst({ where: { nombre: { contains: 'Director', mode: 'insensitive' } } });
                if (cargo) {
                    await tx.comite_Tesista.create({ 
                        data: { alumno_no_cuenta: nuevo.no_cuenta, personal_no_emp: director_id, cargo_id: cargo.id } 
                    });
                }
            }
            
            await tx.bitacora.create({
                data: {
                    accion: 'Nuevo Ingreso', usuario: req.user?.nombre_completo || 'Sistema', 
                    detalle: `Registro de ${nombreFinal} (${no_cuenta})`, entidad: 'Alumnos', ref_id: no_cuenta
                }
            });
        });

        res.status(201).json({ ok: true });
    } catch (error) {
        if (error.code === 'P2002') return res.status(409).json({ error: 'El alumno o folio ya existen.' });
        res.status(500).json({ error: 'Error al registrar.' }); 
    }
};

// ACTUALIZAR EXPEDIENTE
const actualizarExpediente = async (req, res) => {
    try {
        const { no_cuenta } = req.params;
        const datos = req.body;
        const dataToUpdate = {};
        
        if (datos.tema_tesis) dataToUpdate.tema_tesis = formatearNombre(datos.tema_tesis);
        if (datos.estatus_id) dataToUpdate.estatus_id = parseInt(datos.estatus_id);
        if (datos.observaciones !== undefined) dataToUpdate.observaciones = datos.observaciones;
        if (datos.carrera_clave) dataToUpdate.carrera_clave = datos.carrera_clave; 
        
        if (datos.director_id !== undefined) {
             dataToUpdate.director_id = datos.director_id;
        }
        
        if (datos.fecha_solicitud_examen !== undefined) {
            dataToUpdate.fecha_solicitud_examen = datos.fecha_solicitud_examen ? new Date(datos.fecha_solicitud_examen) : null;
        }
        
        if (datos.fecha_examen_replica !== undefined) {
            if (datos.fecha_examen_replica === null) {
                dataToUpdate.fecha_examen_replica = null;
                dataToUpdate.folio_examen_replica = null; 
                try {
                    await prisma.eventoCalendario.deleteMany({
                        where: { descripcion: { contains: no_cuenta } } 
                    });
                } catch (e) { /* Nada que borrar */ }

            } else {
                // AGENDAR
                const fechaExamen = new Date(datos.fecha_examen_replica);
                dataToUpdate.fecha_examen_replica = fechaExamen;

                const alumnoActual = await prisma.alumnos.findUnique({ where: { no_cuenta } });

                if (!alumnoActual.folio_examen_replica && !datos.folio_examen_replica) {
                    const year = fechaExamen.getFullYear();
                    const count = await prisma.alumnos.count({
                        where: { folio_examen_replica: { startsWith: `ACTA-${year}` } }
                    });
                    const consecutivo = (count + 1).toString().padStart(3, '0');
                    dataToUpdate.folio_examen_replica = `ACTA-${year}-${consecutivo}`;
                }

                // Sincronizar Calendario 
                try {
                    const eventoExistente = await prisma.eventoCalendario.findFirst({ where: { descripcion: { contains: no_cuenta } } });
                    
                    const datosEvento = {
                        titulo: `Examen: ${alumnoActual.nombre_completo}`,
                        fecha_evento: fechaExamen,
                        descripcion: `Examen de grado para la cuenta ${no_cuenta}. Folio: ${dataToUpdate.folio_examen_replica || alumnoActual.folio_examen_replica || 'S/N'}`,
                    };

                    if (eventoExistente) {
                        await prisma.eventoCalendario.update({ where: { id: eventoExistente.id }, data: datosEvento });
                    } else {
                        await prisma.eventoCalendario.create({ data: datosEvento });
                    }
                } catch (errorCalendario) { console.log("Error sync calendario:", errorCalendario.message); }
            }
        }
        
        if (datos.folio_solicitud_examen !== undefined) dataToUpdate.folio_solicitud_examen = datos.folio_solicitud_examen;
        if (datos.folio_examen_replica !== undefined && datos.folio_examen_replica !== null) dataToUpdate.folio_examen_replica = datos.folio_examen_replica;

        const actualizado = await prisma.alumnos.update({
            where: { no_cuenta },
            data: dataToUpdate
        });

        res.json({ ok: true, alumno: actualizado });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Error actualizando expediente.' });
    }
};

const agregarEvidencia = async (req, res) => {
    try {
        const { no_cuenta } = req.params;
        const { descripcion, url_archivo, tipo } = req.body;
        if(!descripcion || !url_archivo) return res.status(400).json({error: 'Faltan datos'});
        const evidencia = await prisma.evidencia.create({
            data: { descripcion, url_archivo, tipo: tipo || 'Documento', alumno_no_cuenta: no_cuenta }
        });
        await prisma.bitacora.create({
            data: { accion: 'Subida Evidencia', usuario: req.user?.nombre_completo || 'Sistema', detalle: `Evidencia para ${no_cuenta}: ${descripcion}`, entidad: 'Evidencia', ref_id: no_cuenta }
        });
        res.json(evidencia);
    } catch (e) { res.status(500).json({ error: 'Error guardando evidencia' }); }
};

const eliminarEvidencia = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.evidencia.delete({ where: { id: parseInt(id) } });
        res.json({ ok: true });
    } catch (e) { res.status(500).json({ error: 'Error borrando evidencia' }); }
};

const eliminarAlumno = async (req, res) => {
    try {
        await prisma.alumnos.update({ where: { no_cuenta: req.params.no_cuenta }, data: { activo: false } });
        res.json({ ok: true });
    } catch (e) { res.status(500).json({ error: 'Error al eliminar.' }); }
};

const asignarComite = async (req, res) => {
    const { comite } = req.body; 
    const validacion = validarComite(comite);
    if (!validacion.valido) return res.status(400).json({ error: validacion.errores[0] });
    try {
        await prisma.$transaction(async (tx) => {
            await tx.comite_Tesista.deleteMany({ where: { alumno_no_cuenta: req.params.no_cuenta } });
            for (const m of comite) {
                if (m.cargo_id && m.personal_id) {
                    await tx.comite_Tesista.create({ 
                        data: { alumno_no_cuenta: req.params.no_cuenta, personal_no_emp: m.personal_id, cargo_id: parseInt(m.cargo_id) } 
                    });
                }
            }
        });
        res.json({ ok: true });
    } catch (e) { 
        console.error(e);
        res.status(500).json({ error: 'Error asignando comité.' }); 
    }
};

module.exports = {
    obtenerAlumnos,
    obtenerAlumnoPorCuenta,
    registrarAlumno,
    actualizarExpediente,
    eliminarAlumno,
    asignarComite,
    agregarEvidencia,
    eliminarEvidencia
};