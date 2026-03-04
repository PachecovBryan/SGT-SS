import React, { useState, useEffect } from 'react';
import clienteAxios from './api';
import { useForm } from '@mantine/form';
import { Button, Title, Text, Table, Loader, Paper, Group, Badge, Breadcrumbs, Anchor, Center, Avatar, ThemeIcon, Pagination } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { IconPlus, IconChevronRight, IconCheck, IconX, IconDatabaseOff, IconAlertTriangle } from '@tabler/icons-react';
import { useAuth } from './AuthContext';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import ModalAlumno from './components/ModalAlumno';
import ModalComite from './components/ModalComite';
import ModalDirectorRapido from './components/ModalDirectorRapido';

function Alumnos() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const isAdmin = user?.rol === 'Administrador';
    const canEdit = isAdmin || user?.rol === 'Usuario';
    
    const [cargosBD, setCargosBD] = useState([]);
    const [listaAlumnos, setListaAlumnos] = useState([]);
    const [filtrados, setFiltrados] = useState([]); 
    const [paginaActual, setPaginaActual] = useState(1);
    const itemsPorPagina = 8;

    const [carreras, setCarreras] = useState([]);
    const [estatus, setEstatus] = useState([]);
    const [profesores, setProfesores] = useState([]);
    
    const [comiteEdicion, setComiteEdicion] = useState([]); 
    
    const [cargando, setCargando] = useState(true);
    const [modoEdicion, setModoEdicion] = useState(false); 
    const [alumnoSeleccionado, setAlumnoSeleccionado] = useState(null); 
    
    const [searchParams] = useSearchParams();

    const [modalMain, { open: abrirMain, close: cerrarMain }] = useDisclosure(false); 
    const [modalProfe, { open: abrirProfe, close: cerrarProfe }] = useDisclosure(false);
    const [modalComite, { open: abrirComite, close: cerrarComite }] = useDisclosure(false);

    const limpiarNombreString = (nombre) => {
        if (!nombre) return '';
        return nombre.replace(/[\.\_]+/g, '').replace(/\s+/g, ' ').trim();
    };
    const dividirNombreCompleto = (nombreCompleto) => {
      if (!nombreCompleto) return { paterno: '', materno: '', nombres: '' };
      const limpio = limpiarNombreString(nombreCompleto.toLowerCase());
      const partes = limpio.split(' ').filter(p => p.length > 0);

      if (partes.length >= 3) {
        const paterno = partes[0];
        const materno = partes[1];
        const nombres = partes.slice(2).join(' ');
        return { paterno, materno, nombres };
      } else if (partes.length === 2) {
        return { paterno: partes[0], materno: '', nombres: partes[1] };
      } else {
        return { paterno: '', materno: '', nombres: partes[0] || '' };
      }
    };

    // Formularios
    const formExpediente = useForm({
        initialValues: {
            no_cuenta: '', paterno: '', materno: '', nombres: '',
            tema_tesis: '', carrera_clave: null, estatus_id: null, director_id: null, 
            fecha_aceptacion: null, observaciones: '',
        },
        validate: {
            no_cuenta: (val) => {
                if (!val || val.length === 0) return 'Requerido';
                if (val.length !== 8) return 'Debe ser de 8 dígitos';
                return null;
            },
            paterno: (val) => (val.length < 2 ? 'Requerido' : null),
            materno: (val) => (val.length < 2 ? 'Requerido' : null),
            nombres: (val) => (val.length < 2 ? 'Requerido' : null),
            carrera_clave: (val) => (!val ? 'Requerido' : null), 
            estatus_id: (val) => (!val ? 'Requerido' : null),
        },
    });

    const formProfe = useForm({
        initialValues: { nombramiento: '', no_empleado: '', nombres: '', paterno: '', materno: '' }, 
        validate: {
            nombres: (val) => (val.length < 2 ? 'Requerido' : null),
            paterno: (val) => (val.length < 2 ? 'Requerido' : null),
            no_empleado: (val) => (/^\d{6}$/.test(val) ? null : 'Debe tener 6 dígitos'),
            nombramiento: (val) => (val.length < 1 ? 'Requerido' : null),
        }
    });

    const cargarTodo = async () => {
        setCargando(true);
        try {
            const [resAlumnos, resCarreras, resEstatus, resPersonal, resCargos] = await Promise.all([
                clienteAxios.get('/alumnos'),
                clienteAxios.get('/catalogos/carreras'),
                clienteAxios.get('/catalogos/estatus'),  
                clienteAxios.get('/catalogos/personal'),
                clienteAxios.get('/catalogos/cargos')    
            ]);

            setListaAlumnos(resAlumnos.data);
            
            setCarreras(resCarreras.data.map(c => ({ value: String(c.clave), label: c.nombre })));
            setEstatus(resEstatus.data.map(e => ({ value: String(e.id), label: e.nombre })));
            setProfesores(resPersonal.data.map(p => ({ 
                value: String(p.no_empleado), 
                label: p.nombre_completo 
            })));
            setCargosBD(resCargos.data.map(c => ({ value: String(c.id), label: c.nombre })));

        } catch (error) {
            console.error("Error cargando datos:", error);
            notifications.show({ title: 'Error', message: 'No se pudieron cargar los datos.', color: 'red' });
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => { cargarTodo(); }, []);

    useEffect(() => {
        setPaginaActual(1);
        const qGlobal = searchParams.get('q'); 

        if (qGlobal) {
            const termino = qGlobal.toLowerCase();
            const resultados = listaAlumnos.filter(item => 
                item.nombre_completo.toLowerCase().includes(termino) || 
                item.no_cuenta.toLowerCase().includes(termino) ||
                item.carrera?.nombre?.toLowerCase().includes(termino)
            );
            setFiltrados(resultados);
        } else {
            setFiltrados(listaAlumnos);
        }
    }, [searchParams, listaAlumnos]);

    const getColorEstatus = (status) => {
        if (!status) return 'gray';
        const s = status.toLowerCase();
        if (s.includes('activo')) return 'blue';
        if (s.includes('titulado')) return 'green';
        return 'gray';
    };

    const prepararCreacion = () => { 
        setModoEdicion(false); 
        formExpediente.reset(); 
        formExpediente.setFieldValue('fecha_aceptacion', new Date());
        abrirMain(); 
    };

    const prepararEdicion = (alumno) => {
        setModoEdicion(true);
        setAlumnoSeleccionado(alumno);
        const { paterno, materno, nombres } = dividirNombreCompleto(alumno.nombre_completo || '');

        const directorValue = String(alumno.director_id || alumno.director?.no_empleado || '');
        const carreraValue = String(alumno.carrera_clave || alumno.carrera?.clave || '');
        const estatusValue = String(alumno.estatus_id || alumno.estatus?.id || '');

        formExpediente.setValues({
            no_cuenta: alumno.no_cuenta,
            
            paterno: (alumno.paterno || paterno).trim(), 
            materno: (alumno.materno || materno).trim(), 
            nombres: (alumno.nombres || nombres).trim(), 
            
            tema_tesis: alumno.tema_tesis,
            
            carrera_clave: carreraValue,
            director_id: directorValue,
            estatus_id: estatusValue,
            
            fecha_aceptacion: alumno.fecha_aceptacion ? new Date(alumno.fecha_aceptacion) : new Date(),
            observaciones: alumno.observaciones || ''
        });
        abrirMain();
    };
    
    const guardarExpediente = async (datos) => {
        try {
            const p = datos.paterno || '';
            const m = datos.materno || '';
            const n = datos.nombres || '';
            
            const nombreCuerpo = `${p} ${m} ${n}`;
            const nombreFinal = (typeof limpiarNombreString === 'function') 
                ? limpiarNombreString(nombreCuerpo).toUpperCase() 
                : nombreCuerpo.toUpperCase();
            
            const payload = {
                no_cuenta: datos.no_cuenta, 
                nombre_completo: nombreFinal,
                tema_tesis: datos.tema_tesis,
                carrera_clave: datos.carrera_clave, 
                estatus_id: parseInt(datos.estatus_id), 
                director_id: datos.director_id, 
                fecha_aceptacion: datos.fecha_aceptacion,
                observaciones: datos.observaciones,
                paterno: p,
                materno: m,
                nombres: n
            };

            if (modoEdicion) { 
                if (!alumnoSeleccionado?.no_cuenta) throw new Error("Error de referencia");
                await clienteAxios.put(`/alumnos/${alumnoSeleccionado.no_cuenta}`, payload); 
                notifications.show({ title: 'Actualizado', message: 'Expediente modificado.', color: 'green', icon: <IconCheck size={18}/> });

            } else { 
                await clienteAxios.post('/alumnos', payload); 
                notifications.show({ title: 'Registrado', message: 'Nuevo expediente creado.', color: 'green', icon: <IconCheck size={18}/> });
            }
            
            cerrarMain(); 
            formExpediente.reset(); 
            cargarTodo(); 

        } catch (err) {
            console.error("Error al guardar:", err);
            const status = err.response?.status;
            let msg = err.response?.data?.error || 'Error al conectar con el servidor.';
            if (status === 409) msg = "Error: El No. de Cuenta ya existe.";
            
            notifications.show({ title: 'Error', message: msg, color: 'red' }); 
        }
    };

    const guardarProfeRapido = async (datos) => {
        try {
            await clienteAxios.post('/catalogos/personal', { ...datos, activo: true });
            
            const resProfes = await clienteAxios.get('/catalogos/personal');
            setProfesores(resProfes.data.map(p => ({ value: String(p.no_empleado), label: p.nombre_completo }))); 
            
            const idNuevo = String(datos.no_empleado); 
            formExpediente.setFieldValue('director_id', idNuevo);
            
            cerrarProfe();
            formProfe.reset();
            notifications.show({ title: 'Listo', message: 'Profesor agregado y seleccionado.', color: 'green' });
        } catch (err) {
            const msg = err.response?.data?.error || 'No se pudo registrar.';
            notifications.show({ title: 'Error', message: msg, color: 'red' });
        }
    };

    const guardarJurado = async (listaMiembros) => {
        try {
            await clienteAxios.post(`/alumnos/comite/${alumnoSeleccionado.no_cuenta}`, { comite: listaMiembros });
            cerrarComite(); 
            cargarTodo();
            notifications.show({ title: 'Comité Asignado', message: 'Jurado actualizado correctamente.', color: 'green', icon: <IconCheck size={18}/> });
        } catch (err) { 
            notifications.show({ title: 'Error', message: 'Fallo al asignar.', color: 'red' }); 
        }
    };

    if (cargando) return <Loader style={{ display: 'block', margin: '50px auto' }} />;

    const totalPaginas = Math.ceil(filtrados.length / itemsPorPagina);
    const datosPagina = filtrados.slice((paginaActual - 1) * itemsPorPagina, paginaActual * itemsPorPagina);
    const inicioReg = filtrados.length === 0 ? 0 : (paginaActual - 1) * itemsPorPagina + 1;
    const finReg = Math.min(paginaActual * itemsPorPagina, filtrados.length);

    const filasTabla = datosPagina.map((alumno) => {
        const inicial = alumno.nombre_completo ? alumno.nombre_completo.charAt(0) : '?';
        const nombreLimpio = limpiarNombreString(alumno.nombre_completo);

        const irAExpediente = () => {
            navigate(`/expediente/${alumno.no_cuenta}`);
        };

        return (
            <Table.Tr 
                key={alumno.no_cuenta}
                onClick={irAExpediente} 
                style={{ cursor: 'pointer', transition: 'background-color 0.2s ease' }}
            >
                <Table.Td style={{ paddingLeft: 20, width: 120 }} py="md">
                    <Badge variant="light" color="gray" c="dimmed" size="sm" radius="sm">
                        {alumno.no_cuenta}
                    </Badge>
                </Table.Td>
                
                <Table.Td py="md">
                    <Group gap="sm">
                        <Avatar size={40} radius="xl" color="brand" variant="filled">
                            {inicial}
                        </Avatar>
                        <Text fw={600} size="sm" tt="capitalize" c="bright">
                            {nombreLimpio}
                        </Text>
                    </Group>
                </Table.Td>
                
                <Table.Td py="md">
                    <Text size="sm" fw={500} c="dimmed">
                        {alumno.carrera?.nombre || 'Sin carrera'}
                    </Text>
                </Table.Td>
                
                <Table.Td py="md">
                    <Badge 
                        size="md" 
                        variant="light" 
                        color={getColorEstatus(alumno.estatus?.nombre)}
                        style={{ textTransform: 'capitalize', fontWeight: 600 }}
                    >
                        {alumno.estatus?.nombre?.toLowerCase()}
                    </Badge>
                </Table.Td>
                
                <Table.Td style={{ textAlign: 'right', paddingRight: 20, width: 50 }} py="md">
                    <ThemeIcon variant="transparent" color="gray" style={{ opacity: 0.5 }}>
                        <IconChevronRight size={20} />
                    </ThemeIcon>
                </Table.Td>
            </Table.Tr>
        );
    });

    const migasPan = [ { title: 'Inicio', href: '/' }, { title: 'Alumnos', href: '/alumnos' } ].map((item, index) => (
        <Anchor component={Link} to={item.href} key={index} size="sm" c={index === 1 ? 'brand.7' : 'dimmed'} style={{ lineHeight: 1 }}>{item.title}</Anchor>
    ));

    return (
        <div style={{ maxWidth: 1300, margin: '0 auto', paddingBottom: 40 }}>
            <div style={{ marginBottom: 25 }}>
                <Breadcrumbs separator={<IconChevronRight size={14} />} mb="xs">{migasPan}</Breadcrumbs>
                <Group justify="space-between">
                    <div><Title order={2} c="brand.9">Expedientes de Titulación</Title><Text c="dimmed" size="sm">Base de datos general de alumnos.</Text></div>
                    {canEdit && <Button leftSection={<IconPlus size={18} />} onClick={prepararCreacion} color="brand.6">Nuevo Expediente</Button>}
                </Group>
            </div>

            <Paper shadow="sm" radius="md" p="0" withBorder style={{ borderTop: '4px solid var(--mantine-color-brand-6)', overflow: 'hidden' }}>
                {filtrados.length === 0 ? (
                    <Center style={{ padding: '80px 0', flexDirection: 'column' }}>
                        <div style={{ backgroundColor: 'var(--mantine-color-gray-0)', borderRadius: '50%', padding: 25, marginBottom: 20 }}>
                            <IconDatabaseOff size={48} style={{ opacity: 0.4 }} color="gray" />
                        </div>
                        <Text size="lg" fw={600} c="dark.3">{listaAlumnos.length > 0 ? 'No se encontraron resultados' : 'Base de datos vacía'}</Text>
                        {searchParams.get('q') && (
                            <Button variant="subtle" size="xs" mt="sm" component={Link} to="/alumnos">
                                Mostrar todos
                            </Button>
                        )}
                    </Center>
                ) : (
                    <>
                        <Table.ScrollContainer minWidth={800}>
                            <Table verticalSpacing="md" highlightOnHover>
                                <Table.Thead style={{ borderBottom: '1px solid var(--mantine-color-dark-4)' }}>
                                    <Table.Tr>
                                        <Table.Th style={{ paddingLeft: 20, paddingTop: 15, paddingBottom: 15, width: 120 }}>
                                            <Text c="dimmed" size="xs" fw={700} tt="uppercase">No. Cuenta</Text>
                                        </Table.Th>
                                        <Table.Th>
                                            <Text c="dimmed" size="xs" fw={700} tt="uppercase">Alumno</Text>
                                        </Table.Th>
                                        <Table.Th>
                                            <Text c="dimmed" size="xs" fw={700} tt="uppercase">Carrera</Text>
                                        </Table.Th>
                                        <Table.Th>
                                            <Text c="dimmed" size="xs" fw={700} tt="uppercase">Estatus</Text>
                                        </Table.Th>
                                        <Table.Th style={{ width: 50 }}></Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody style={{ backgroundColor: 'var(--mantine-color-body)' }}>{filasTabla}</Table.Tbody>
                            </Table>
                        </Table.ScrollContainer>
                        <div style={{ padding: '15px 20px', borderTop: '1px solid var(--mantine-color-dark-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--mantine-color-body)' }}>
                            <Text size="xs" c="dimmed" fw={500}>Mostrando {inicioReg} - {finReg} de {filtrados.length} registros</Text>
                            <Pagination total={totalPaginas} value={paginaActual} onChange={setPaginaActual} color="brand.6" size="sm" radius="md" />
                        </div>
                    </>
                )}
            </Paper>

            <ModalAlumno 
                opened={modalMain} close={cerrarMain} isEditing={modoEdicion} form={formExpediente} 
                guardarDatos={guardarExpediente} carrerasData={carreras} estatusData={estatus} personalData={profesores} abrirModalProfe={abrirProfe} 
            />
            
            <ModalComite 
                abierto={modalComite} cerrar={cerrarComite} alGuardar={guardarJurado} 
                listaProfesores={profesores} listaCargos={cargosBD} 
                alumnoNombre={alumnoSeleccionado?.nombre_completo} comiteActual={comiteEdicion}
            />
            <ModalDirectorRapido 
                abierto={modalProfe} cerrar={cerrarProfe} form={formProfe} alGuardar={guardarProfeRapido} 
            />
        </div>
    );
}

export default Alumnos;