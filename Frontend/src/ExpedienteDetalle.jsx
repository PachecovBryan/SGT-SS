import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Paper, Group, Avatar, Text, Title, Badge, SimpleGrid, Stack, Divider, Breadcrumbs, Anchor, Loader, Center, Alert, ThemeIcon, Button, Grid, TextInput, Accordion, ActionIcon, Table, FileInput, Tooltip } from '@mantine/core';
import { IconPencil, IconUsersGroup, IconFileTypePdf, IconTrash, IconChevronRight, IconSchool, IconCalendarEvent, IconFileDescription, IconAlertCircle, IconLink, IconPlus, IconUpload, IconInfoCircle, IconCheck, IconRefresh } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form'; 
import { pdf } from '@react-pdf/renderer';
import clienteAxios from './api';
import { supabase } from './api/supabaseClient';

import ModalAlumno from './components/ModalAlumno';
import ModalComite from './components/ModalComite';
import ModalPersonal from './components/ModalPersonal'; 
import DocumentoPDF from './DocumentoPDF';

const limpiarNombreString = (nombre) => nombre ? nombre.toLowerCase().trim().replace(/[\.\s]+/g, ' ') : '';
const dividirNombreCompleto = (nombreCompleto) => {
  if (!nombreCompleto) return { paterno: '', materno: '', nombres: '' };
  const limpio = limpiarNombreString(nombreCompleto);
  const partes = limpio.split(' ').filter(p => p.length > 0);
  if (partes.length >= 3) {
    const paterno = partes[0]; const materno = partes[1]; const nombres = partes.slice(2).join(' ');
    return { paterno, materno, nombres };
  } else if (partes.length === 2) {
    return { paterno: partes[0], materno: '', nombres: partes[1] };
  } else { return { paterno: '', materno: '', nombres: partes[0] || '' }; }
};

const formatearFecha = (fecha) => fecha ? new Date(fecha).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' }) : '---';
const getColorEstatus = (s) => {
    if (!s) return 'gray';
    if (s.toLowerCase().includes('activo')) return 'blue';
    if (s.toLowerCase().includes('titulado')) return 'green';
    return 'red';
};

const ExpedienteDetalle = () => {
    const { no_cuenta } = useParams();
    const navigate = useNavigate();
    
    // ESTADOS
    const [alumno, setAlumno] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [subiendoArchivo, setSubiendoArchivo] = useState(false);
    const [config, setConfig] = useState({});
    const [accordionValue, setAccordionValue] = useState('solicitud'); 
    const [reagendando, setReagendando] = useState(false); 

    // Catalogos
    const [carreras, setCarreras] = useState([]);
    const [estatus, setEstatus] = useState([]);
    const [profesores, setProfesores] = useState([]);
    const [cargosBD, setCargosBD] = useState([]);

    // Modales
    const [modalEditar, { open: abrirEditar, close: cerrarEditar }] = useDisclosure(false);
    const [modalComite, { open: abrirComite, close: cerrarComite }] = useDisclosure(false);
    const [modalProfe, { open: abrirModalProfe, close: cerrarModalProfe }] = useDisclosure(false); 
    const [comiteEdicion, setComiteEdicion] = useState([]);

    // FORMULARIOS
    const formTramite = useForm({
        initialValues: { fecha_solicitud_examen: null, folio_solicitud_examen: '', fecha_examen_replica: null, folio_examen_replica: '' }
    });
    const examenProgramado = !!alumno?.fecha_examen_replica;

    const formEvidencia = useForm({ initialValues: { descripcion: '', archivo: null } });
    const formExpediente = useForm({ initialValues: { no_cuenta: '', paterno: '', materno: '', nombres: '', tema_tesis: '', folio_tesis: '', carrera_clave: null, estatus_id: null, director_id: null, fecha_aceptacion: null, observaciones: '' } });
    const formProfe = useForm({
        initialValues: { no_empleado: '', nombramiento: '', nombres: '', paterno: '', materno: '' },
        validate: {
            no_empleado: (value) => (/^\d{6}$/.test(value) ? null : 'Debe tener 6 dígitos'),
            nombres: (value) => (value.length < 2 ? 'Requerido' : null),
            paterno: (value) => (value.length < 2 ? 'Requerido' : null),
            nombramiento: (value) => (!value ? 'Requerido' : null),
        },
    });

    const cargarTodo = async () => {
        setCargando(true);
        try {
            const [resAlumno, resCarreras, resEstatus, resPersonal, resCargos, resConfig] = await Promise.all([
                clienteAxios.get(`/alumnos/${no_cuenta}`),
                clienteAxios.get('/catalogos/carreras'),
                clienteAxios.get('/catalogos/estatus'),
                clienteAxios.get('/catalogos/personal'),
                clienteAxios.get('/catalogos/cargos'),
                clienteAxios.get('/admin/config') 
            ]);

            setAlumno(resAlumno.data);
            setConfig(resConfig.data);
            
            const tramiteData = {
                fecha_solicitud_examen: resAlumno.data.fecha_solicitud_examen ? new Date(resAlumno.data.fecha_solicitud_examen) : null,
                folio_solicitud_examen: resAlumno.data.folio_solicitud_examen || '',
                fecha_examen_replica: resAlumno.data.fecha_examen_replica ? new Date(resAlumno.data.fecha_examen_replica) : null,
                folio_examen_replica: resAlumno.data.folio_examen_replica || ''
            };
            formTramite.setValues(tramiteData);

            if (resAlumno.data.fecha_examen_replica) {
                setAccordionValue(null); 
            } else if (resAlumno.data.folio_solicitud_examen) {
                setAccordionValue('replica'); 
            } else {
                setAccordionValue('solicitud');
            }

            if(resCarreras.data) setCarreras(resCarreras.data.map(c => ({ value: String(c.clave), label: c.nombre })));
            if(resEstatus.data) setEstatus(resEstatus.data.map(e => ({ value: String(e.id), label: e.nombre })));
            if(resPersonal.data) setProfesores(resPersonal.data.map(p => ({ value: String(p.no_empleado), label: `${p.nombramiento || ''} ${p.nombre_completo}`.trim() })));
            if(resCargos.data) setCargosBD(resCargos.data.map(c => ({ value: String(c.id), label: c.nombre })));

        } catch (err) { 
            console.error(err);
            notifications.show({ title: 'Error', message: 'No se pudo cargar el expediente.', color: 'red' }); 
        } finally { setCargando(false); }
    };

    const recargarProfesores = async () => {
        try {
            const res = await clienteAxios.get('/catalogos/personal');
            if(res.data) setProfesores(res.data.map(p => ({ value: String(p.no_empleado), label: `${p.nombramiento || ''} ${p.nombre_completo}`.trim() })));
        } catch(e) { console.error("Error recargando profes"); }
    };

    useEffect(() => { if(no_cuenta) cargarTodo(); }, [no_cuenta]);

    const guardarCambiosTramite = async (payload, mensaje) => {
        try {
            await clienteAxios.put(`/alumnos/${no_cuenta}`, payload);
            notifications.show({ title: 'Actualizado', message: mensaje, color: 'green' });
            setReagendando(false); 
            cargarTodo();
        } catch(e) { notifications.show({ title: 'Error', message: 'No se pudieron guardar los cambios.', color: 'red' }); }
    };

    const solicitarExamen = async () => {
        const year = new Date().getFullYear();
        const randomId = Math.floor(Math.random() * 1000).toString().padStart(3,'0');
        const nuevoFolio = `SOL-${year}-${randomId}`; 
        
        formTramite.setFieldValue('fecha_solicitud_examen', new Date());
        formTramite.setFieldValue('folio_solicitud_examen', nuevoFolio);

        await guardarCambiosTramite({
            fecha_solicitud_examen: new Date(),
            folio_solicitud_examen: nuevoFolio
        }, 'Solicitud generada exitosamente');
        
        setAccordionValue('replica');
    };

    const revertirSolicitud = async () => {
        modals.openConfirmModal({
            title: 'Revertir Solicitud',
            children: <Text size="sm">¿Estás seguro? Se borrará la solicitud.</Text>,
            labels: { confirm: 'Sí, revertir', cancel: 'Cancelar' },
            confirmProps: { color: 'red' },
            onConfirm: async () => {
                formTramite.setFieldValue('fecha_solicitud_examen', null);
                formTramite.setFieldValue('folio_solicitud_examen', '');
                await guardarCambiosTramite({ fecha_solicitud_examen: null, folio_solicitud_examen: null }, 'Solicitud revertida');
                setAccordionValue('solicitud');
            }
        });
    };

    const cambiarFechaExamen = (fecha) => {
        formTramite.setFieldValue('fecha_examen_replica', fecha);
        if (fecha && !formTramite.values.folio_examen_replica) {
            const year = fecha.getFullYear();
            formTramite.setFieldValue('folio_examen_replica', `ACTA-${year}-XXX`);
        }
    };

    const manejarSubidaEvidencia = async (values) => {
        if (!values.descripcion || values.descripcion.length < 3) return formEvidencia.setFieldError('descripcion', 'Min 3 letras');
        if (!values.archivo) return formEvidencia.setFieldError('archivo', 'Seleccione archivo');
        setSubiendoArchivo(true);
        try {
            const archivo = values.archivo;
            const fileExt = archivo.name.split('.').pop();
            const fileName = `${no_cuenta}-${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;
            const bucketName = 'evidencias';
            const { data, error: uploadError } = await supabase.storage.from(bucketName).upload(filePath, archivo, { cacheControl: '3600', upsert: false, contentType: archivo.type });
            if (uploadError) throw uploadError;
            const { data: publicData, error: publicError } = supabase.storage.from(bucketName).getPublicUrl(filePath);
            if (publicError) throw publicError;
            await clienteAxios.post(`/alumnos/${no_cuenta}/evidencia`, { descripcion: values.descripcion, url_archivo: publicData.publicUrl, tipo: fileExt });
            formEvidencia.reset(); cargarTodo(); notifications.show({ title: 'Éxito', message: 'Archivo subido.', color: 'green' });
        } catch(e) { notifications.show({ title: 'Error', message: 'Fallo al subir archivo. ' + (e.message || ''), color: 'red' }); } finally { setSubiendoArchivo(false); }
    };
    
    const borrarEvidencia = async (id) => {
        try { await clienteAxios.delete(`/alumnos/evidencia/${id}`); cargarTodo(); notifications.show({ title: 'Eliminado', message: 'Evidencia borrada.', color: 'blue' }); } catch(e) { notifications.show({ title: 'Error', message: 'Fallo al borrar.', color: 'red' }); }
    };

    const prepararEdicion = () => {
            const nombreCompleto = alumno.nombre_completo || '';
            const { paterno: p, materno: m, nombres: n } = dividirNombreCompleto(nombreCompleto);
            let paterno = alumno.paterno || p; let materno = alumno.materno || m; let nombres = alumno.nombres || n;
            
            let temaLimpio = alumno.tema_tesis || ''; 
            const lowerTema = temaLimpio.toLowerCase();
            if (lowerTema.includes('sin tema') || lowerTema.includes('tema por definir')) {
                temaLimpio = '';
            }

            let directorId = alumno.director_id || (alumno.director && alumno.director.no_empleado) || alumno.asesor_id;
            let carreraClave = alumno.carrera_clave || (alumno.carrera && alumno.carrera.clave);
            let estatusId = alumno.estatus_id;

            formExpediente.setValues({
                no_cuenta: alumno.no_cuenta, paterno: paterno || '', materno: materno || '', nombres: nombres || '', 
                tema_tesis: temaLimpio, 
                folio_tesis: alumno.folio_tesis || '', 
                carrera_clave: carreraClave ? String(carreraClave) : null, estatus_id: estatusId ? String(estatusId) : null, director_id: directorId ? String(directorId) : null, 
                fecha_aceptacion: alumno.fecha_aceptacion ? new Date(alumno.fecha_aceptacion) : new Date(), observaciones: alumno.observaciones || ''
            });
            abrirEditar();
    };

    const guardarEdicionGeneral = async (datos) => {
        try {
             const payload = { ...datos, estatus_id: parseInt(datos.estatus_id), director_id: datos.director_id ? datos.director_id : null, carrera_clave: datos.carrera_clave };
             await clienteAxios.put(`/alumnos/${alumno.no_cuenta}`, payload);
             cerrarEditar(); cargarTodo();
             notifications.show({ title: 'Actualizado', message: 'Datos guardados.', color: 'green' });
        } catch(e) { notifications.show({ title: 'Error', message: 'Error al actualizar.', color: 'red' }); }
    };

    const prepararComite = () => {
        const datosComite = alumno.comite?.map(c => ({ personal_id: String(c.personal.no_empleado), nombre: c.personal.nombre_completo, cargo_id: String(c.cargo.id), cargo_nombre: c.cargo.nombre })) || [];
        setComiteEdicion(datosComite); abrirComite();
    };
    const guardarComite = async (lista) => {
        try { await clienteAxios.post(`/alumnos/comite/${alumno.no_cuenta}`, { comite: lista }); cerrarComite(); cargarTodo(); notifications.show({ title: 'Comité', message: 'Jurado actualizado.', color: 'green' }); } catch (e) { notifications.show({ title: 'Error', message: 'Fallo al asignar.', color: 'red' }); }
    };
    
    const guardarNuevoProfe = async (datosProfe) => {
        try {
            await clienteAxios.post('/catalogos/personal', datosProfe); 
            notifications.show({ title: 'Éxito', message: 'Docente registrado.', color: 'green' });
            cerrarModalProfe();
            recargarProfesores(); 
        } catch (error) {
            const msg = error.response?.data?.error || 'Error al guardar profesor.';
            notifications.show({ title: 'Error', message: msg, color: 'red' });
        }
    };
    const abrirModalCrearProfe = () => { formProfe.reset(); abrirModalProfe(); };

    const generarPDF = async () => {
        try { const blob = await pdf(<DocumentoPDF alumno={alumno} config={config} />).toBlob(); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `Expediente_${alumno.no_cuenta}.pdf`; link.click(); URL.revokeObjectURL(url); } catch (e) { notifications.show({ title: 'Error PDF', message: 'Error generando documento.', color: 'red' }); }
    };
    const confirmarEliminar = () => {
        modals.openConfirmModal({ title: 'Eliminar Expediente', children: ( <Text size="sm">¿Borrar a <b>{alumno.nombre_completo}</b>?</Text> ), labels: { confirm: 'Eliminar', cancel: 'Cancelar' }, confirmProps: { color: 'red' }, onConfirm: async () => { try { await clienteAxios.delete(`/alumnos/${alumno.no_cuenta}`); navigate('/alumnos'); } catch (e) { notifications.show({ title: 'Error', message: 'No se pudo eliminar.', color: 'red' }); } } });
    };

    if (cargando) return <Center h={400}><Loader size="lg" /></Center>;
    if (!alumno) return <Container><Alert color="red">No encontrado</Alert></Container>;

    const inicial = alumno.nombre_completo ? alumno.nombre_completo.charAt(0).toUpperCase() : '?';
    const colorEstatus = getColorEstatus(alumno.estatus?.nombre);

    return (
        <Container size="xl" py="md">
            <Breadcrumbs separator={<IconChevronRight size={14} />} mb="md" mt={0}>
                <Anchor component={Link} to="/" size="sm" c="dimmed">Inicio</Anchor>
                <Anchor component={Link} to="/alumnos" size="sm" c="dimmed">Alumnos</Anchor>
                <Text size="sm" c="brand.7">{alumno.no_cuenta}</Text>
            </Breadcrumbs>

            <Paper shadow="sm" radius="md" p="xl" withBorder mb="lg" style={{ borderTop: `4px solid var(--mantine-color-${colorEstatus}-6)` }}>
                 <Grid align="center" gutter="xl">
                    <Grid.Col span={{ base: 12, md: 8 }}>
                        <Group wrap="nowrap">
                            <Avatar size={90} radius="xl" color={colorEstatus} variant="filled"><Text fz={30} fw={700}>{inicial}</Text></Avatar>
                            <div>
                                <Title order={2} tt="capitalize">{alumno.nombre_completo ? alumno.nombre_completo.toLowerCase() : ''}</Title>
                                <Group gap="xs" mt={5}>
                                    <Badge size="lg" color={colorEstatus}>{alumno.estatus?.nombre}</Badge>
                                    <Text size="sm" c="dimmed">{alumno.carrera?.nombre}</Text>
                                </Group>
                            </div>
                        </Group>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 4 }}>
                        <SimpleGrid cols={2}>
                            <Button variant="light" leftSection={<IconPencil size={18}/>} onClick={prepararEdicion}>Editar</Button>
                            <Button variant="light" color="violet" leftSection={<IconUsersGroup size={18}/>} onClick={prepararComite}>Comité</Button>
                            <Button variant="light" color="red" leftSection={<IconFileTypePdf size={18}/>} onClick={generarPDF}>PDF</Button>
                            <Button variant="subtle" color="gray" leftSection={<IconTrash size={18}/>} onClick={confirmarEliminar}>Eliminar</Button>
                        </SimpleGrid>
                    </Grid.Col>
                </Grid>
            </Paper>

            <Grid gutter="lg">
                <Grid.Col span={{ base: 12, md: 6 }}>
                    <Stack>
                        <Paper shadow="sm" radius="md" p="md" withBorder>
                            <Title order={4} mb="md"><IconSchool size={20} style={{marginRight:8}}/>Proyecto de Tesis</Title>
                            <Stack gap="xs">
                                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Título</Text>
                                <Text fw={600}>{alumno.tema_tesis}</Text>
                                <Divider my="xs" />
                                <Group grow>
                                    <div><Text size="xs" c="dimmed" tt="uppercase" fw={700}>Folio Tesis</Text><Text>{alumno.folio_tesis}</Text></div>
                                    <div><Text size="xs" c="dimmed" tt="uppercase" fw={700}>Aceptación</Text><Text>{formatearFecha(alumno.fecha_aceptacion)}</Text></div>
                                </Group>
                                <Divider my="xs" />
                                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Observaciones</Text>
                                <Text size="sm" c="dimmed">{alumno.observaciones || 'Ninguna'}</Text>
                            </Stack>
                        </Paper>

                         <Paper shadow="sm" radius="md" p="md" withBorder>
                            <Title order={4} mb="md"><IconLink size={20} style={{marginRight:8}}/>Evidencias Digitales</Title>
                            <form onSubmit={formEvidencia.onSubmit(manejarSubidaEvidencia)}>
                                <Stack gap="sm" mb="md">
                                    <TextInput placeholder="Descripción (Ej: Acta de Examen)" {...formEvidencia.getInputProps('descripcion')} />
                                    <Group align="flex-start">
                                        <FileInput placeholder="Seleccionar PDF/Imagen" leftSection={<IconUpload size={16}/>} accept="application/pdf,image/png,image/jpeg" style={{flex:1}} value={formEvidencia.values.archivo} onChange={(file) => formEvidencia.setFieldValue('archivo', file)} />
                                        <ActionIcon type="submit" variant="filled" color="brand" size="lg" loading={subiendoArchivo}><IconPlus size={20}/></ActionIcon>
                                    </Group>
                                </Stack>
                            </form>
                            {alumno.evidencias && alumno.evidencias.length > 0 ? (
                                <Table striped highlightOnHover>
                                    <Table.Tbody>
                                        {alumno.evidencias.map(ev => (
                                            <Table.Tr key={ev.id}>
                                                <Table.Td>
                                                    <Text size="sm" fw={500}>{ev.descripcion}</Text>
                                                    <Text size="xs" c="dimmed">{formatearFecha(ev.fecha_subida)}</Text>
                                                </Table.Td>
                                                <Table.Td style={{textAlign:'right'}}>
                                                    <Group gap="xs" justify="flex-end">
                                                        <ActionIcon component="a" href={ev.url_archivo} target="_blank" variant="light" color="blue"><IconLink size={16}/></ActionIcon>
                                                        <ActionIcon onClick={() => borrarEvidencia(ev.id)} variant="subtle" color="red"><IconTrash size={16}/></ActionIcon>
                                                    </Group>
                                                </Table.Td>
                                            </Table.Tr>
                                        ))}
                                    </Table.Tbody>
                                </Table>
                            ) : <Text c="dimmed" size="sm" ta="center" py="sm">Sin evidencias adjuntas.</Text>}
                        </Paper>
                    </Stack>
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 6 }}>
                    <Stack>
                        <Paper shadow="sm" radius="md" p="md" withBorder style={{ borderColor: 'var(--mantine-color-brand-3)' }}>
                            <Title order={4} mb="md" c="brand.8"><IconCalendarEvent size={20} style={{marginRight:8}}/>Seguimiento de Trámite</Title>
                            
                            <Accordion variant="contained" value={accordionValue} onChange={setAccordionValue}>
                                {/* SECCIÓN SOLICITUD */}
                                <Accordion.Item value="solicitud">
                                    <Accordion.Control icon={<IconFileDescription size={20}/>}>
                                        <Group justify="space-between">
                                            <Text>Solicitud de Examen</Text>
                                            {formTramite.values.folio_solicitud_examen && <Badge color="green">SOLICITADO</Badge>}
                                        </Group>
                                    </Accordion.Control>
                                    <Accordion.Panel>
                                        {!formTramite.values.folio_solicitud_examen ? (
                                            <Stack align="center" py="sm">
                                                <Text size="sm" c="dimmed">No se ha solicitado examen para este alumno.</Text>
                                                <Button onClick={solicitarExamen} leftSection={<IconPlus size={16}/>}>Generar Solicitud</Button>
                                            </Stack>
                                        ) : (
                                            <Stack>
                                                {examenProgramado && (
                                                    <Alert color="blue" title="Solicitud Procesada" icon={<IconInfoCircle/>} variant="light">
                                                        La solicitud ha procedido a etapa de examen.
                                                    </Alert>
                                                )}
                                                <SimpleGrid cols={2}>
                                                    <TextInput label="Folio Solicitud" readOnly variant="filled" {...formTramite.getInputProps('folio_solicitud_examen')} />
                                                    <TextInput type="date" label="Fecha Solicitud" readOnly={examenProgramado} {...formTramite.getInputProps('fecha_solicitud_examen')} value={formTramite.values.fecha_solicitud_examen ? new Date(formTramite.values.fecha_solicitud_examen).toISOString().split('T')[0] : ''} />
                                                </SimpleGrid>
                                                {!examenProgramado && (
                                                    <Group justify="flex-end">
                                                        <Button size="xs" color="red" variant="subtle" onClick={revertirSolicitud}>Revertir Solicitud</Button>
                                                        <Button size="xs" onClick={() => guardarCambiosTramite(formTramite.values, 'Fecha actualizada')}>Actualizar Fecha</Button>
                                                    </Group>
                                                )}
                                            </Stack>
                                        )}
                                    </Accordion.Panel>
                                </Accordion.Item>
                                <Accordion.Item value="replica">
                                    <Accordion.Control icon={<IconSchool size={20}/>} disabled={!formTramite.values.folio_solicitud_examen}>
                                        <Group justify="space-between">
                                            <Text>Examen de Réplica</Text>
                                            {examenProgramado && <Badge color="green" leftSection={<IconCheck size={12}/>}>PROGRAMADO</Badge>}
                                        </Group>
                                    </Accordion.Control>
                                    <Accordion.Panel>
                                        <Stack>
                                            {examenProgramado && !reagendando && (
                                                <Alert color="green" title="¡Examen Agendado!" icon={<IconCheck/>} variant="light">
                                                    El examen está programado correctamente en el calendario.
                                                </Alert>
                                            )}

                                            <SimpleGrid cols={2}>
                                                <TextInput 
                                                    label="Folio Examen" 
                                                    placeholder="Automático" 
                                                    readOnly 
                                                    variant="filled" 
                                                    {...formTramite.getInputProps('folio_examen_replica')} 
                                                />
                                                <TextInput 
                                                    type="date" 
                                                    label="Fecha Examen" 
                                                    {...formTramite.getInputProps('fecha_examen_replica')} 
                                                    disabled={examenProgramado && !reagendando} 
                                                    value={formTramite.values.fecha_examen_replica ? new Date(formTramite.values.fecha_examen_replica).toISOString().split('T')[0] : ''}
                                                    onChange={(e) => cambiarFechaExamen(e.target.value ? new Date(e.target.value + 'T12:00:00') : null)}
                                                />
                                            </SimpleGrid>

                                            <Group justify="flex-end" mt="md">
                                                {examenProgramado && !reagendando ? (
                                                    <Button color="orange" variant="light" leftSection={<IconRefresh size={16}/>} onClick={() => setReagendando(true)}>
                                                        Reagendar Fecha
                                                    </Button>
                                                ) : (
                                                    <>
                                                        {reagendando && <Button variant="default" onClick={() => setReagendando(false)}>Cancelar</Button>}
                                                        <Button onClick={() => guardarCambiosTramite(formTramite.values, 'Examen programado correctamente')}>
                                                            {reagendando ? 'Guardar Nueva Fecha' : 'Confirmar y Programar'}
                                                        </Button>
                                                    </>
                                                )}
                                            </Group>
                                        </Stack>
                                    </Accordion.Panel>
                                </Accordion.Item>
                            </Accordion>
                        </Paper>

                        <Paper shadow="sm" radius="md" p="md" withBorder>
                             <Title order={4} mb="md">Comité Asignado</Title>
                             {alumno.comite && alumno.comite.length > 0 ? (
                                <Stack gap="xs">
                                    {alumno.comite.map(m => ( <Paper key={m.cargo_id} withBorder p="xs" style={{ backgroundColor: 'var(--mantine-color-default)' }}><Text size="xs" fw={700} c="brand">{m.cargo.nombre}</Text><Text size="sm">{m.personal.nombre_completo}</Text></Paper> ))}
                                </Stack>
                             ) : <Text c="dimmed">Sin comité.</Text>}
                        </Paper>
                    </Stack>
                </Grid.Col>
            </Grid>
            
            <ModalAlumno opened={modalEditar} close={cerrarEditar} isEditing={true} form={formExpediente} guardarDatos={guardarEdicionGeneral} carrerasData={carreras} estatusData={estatus} personalData={profesores} abrirModalProfe={abrirModalCrearProfe} />
            <ModalComite abierto={modalComite} cerrar={cerrarComite} alGuardar={guardarComite} listaProfesores={profesores} listaCargos={cargosBD} alumnoNombre={alumno.nombre_completo} comiteActual={comiteEdicion} />
            {ModalPersonal && <ModalPersonal abierto={modalProfe} cerrar={cerrarModalProfe} esEdicion={false} form={formProfe} alGuardar={guardarNuevoProfe} />}
        </Container>
    );
};

export default ExpedienteDetalle;