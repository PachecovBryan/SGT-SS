import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import es from 'date-fns/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';

import { Container, Title, Paper, Button, Modal, TextInput, Textarea, Group, Loader, Text, useMantineColorScheme, Badge, Alert } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import { IconTrash, IconPlus, IconClock, IconInfoCircle } from '@tabler/icons-react';
import { useNavigate, useLocation } from 'react-router-dom';

import clienteAxios from './api';

const locales = { 'es': es };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const Calendario = () => {
  const [eventos, setEventos] = useState([]);
  const [cargando, setCargando] = useState(true);
  
  const [opened, { open, close }] = useDisclosure(false); 
  const [detalleOpened, { open: openDetalle, close: closeDetalle }] = useDisclosure(false); 
  
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null);
  const { colorScheme } = useMantineColorScheme(); 
  
  const [fechaCalendario, setFechaCalendario] = useState(new Date());
  const navigate = useNavigate();
  const location = useLocation();

  const form = useForm({
    initialValues: { titulo: '', fecha_hora: '', descripcion: '' },
    validate: {
      titulo: (value) => (value.length < 3 ? 'Requerido' : null),
      fecha_hora: (value) => (!value ? 'Requerido' : null),
    },
  });

  const cargarDatos = async () => {
      try {
        const [resEventos, resAlumnos] = await Promise.all([
            clienteAxios.get('/eventos'),
            clienteAxios.get('/alumnos') 
        ]);

        const examenesReplica = resAlumnos.data
          .filter(a => a.fecha_examen_replica) 
          .map(a => ({
              id: `rep-${a.no_cuenta}`, 
              originalId: a.no_cuenta,
              title: `Examen: ${a.nombre_completo}`,
              start: new Date(a.fecha_examen_replica),
              end: new Date(new Date(a.fecha_examen_replica).getTime() + 2 * 60 * 60 * 1000), 
              desc: `Folio: ${a.folio_examen_replica || 'En trámite'}`,
              allDay: false,
              tipo: 'examen',
              color: 'green' 
          }));

          const eventosManuales = resEventos.data
          .filter(ev => {
              const fechaManual = new Date(ev.fecha_evento).getTime();
              
              const esDuplicado = examenesReplica.some(ex => {
                  const fechaExamen = ex.start.getTime();
                  const diff = Math.abs(fechaManual - fechaExamen);
                  const tituloLower = ev.titulo.toLowerCase();
                  
                  return diff < 120000 && (tituloLower.includes('examen') || tituloLower.includes('réplica') || tituloLower.includes('replica'));
              });

              return !esDuplicado;
          })
          .map(ev => ({
          id: ev.id,
          title: ev.titulo,
          start: new Date(ev.fecha_evento),
          end: new Date(new Date(ev.fecha_evento).getTime() + 60 * 60 * 1000), 
          desc: ev.descripcion,
          allDay: false, 
          tipo: 'manual',
          resource: ev 
        }));

        const todosLosEventos = [...eventosManuales, ...examenesReplica];
        setEventos(todosLosEventos);
        return todosLosEventos;

      } catch (error) {
        console.error(error);
        notifications.show({ title: 'Error', message: 'No se pudo actualizar la agenda.', color: 'red' });
        return [];
      } finally {
        setCargando(false);
      }
  };

  useEffect(() => {
    const init = async () => {
        const loadedEvents = await cargarDatos();
        
        if (location.state?.eventoId) {
            const targetId = location.state.eventoId;
            const eventoEncontrado = loadedEvents.find(e => String(e.id) === String(targetId) || String(e.resource?.id) === String(targetId));
            
            if (eventoEncontrado) {
                setFechaCalendario(eventoEncontrado.start);
                setEventoSeleccionado(eventoEncontrado);
                openDetalle();
                window.history.replaceState({}, document.title);
            }
        }
    };
    init();
  }, []);

  const guardarEvento = async (values) => {
    try {
      const fechaEnvio = new Date(values.fecha_hora); 
      await clienteAxios.post('/eventos', {
        titulo: values.titulo,
        fecha_evento: fechaEnvio,
        descripcion: values.descripcion
      });
      notifications.show({ title: 'Agenda Actualizada', message: 'Evento guardado.', color: 'green' });
      close();
      form.reset();
      cargarDatos();
    } catch (error) {
      notifications.show({ title: 'Error', message: 'No se pudo guardar.', color: 'red' });
    }
  };

  const alSeleccionarSlot = ({ start }) => {
    const fechaISO = new Date(start.getTime() - (start.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
    form.setValues({ titulo: '', descripcion: '', fecha_hora: fechaISO });
    open();
  };

  const alSeleccionarEvento = (evento) => {
    setEventoSeleccionado(evento);
    openDetalle(); 
  };

  const irAExpediente = () => {
    if (!eventoSeleccionado) return;
    const idStr = String(eventoSeleccionado.id);
    if (idStr.startsWith('rep-')) {
        const partes = idStr.split('-');
        if (partes.length > 1 && partes[1]) {
            navigate(`/expediente/${partes[1]}`); 
            closeDetalle();
        }
    }
  };

  const borrarEventoActual = async () => {
    if (!eventoSeleccionado) return;
    
    const esExamen = eventoSeleccionado.tipo === 'examen';
    
    const tituloModal = esExamen ? 'Cancelar Examen de Réplica' : 'Eliminar Evento';
    const mensajeModal = esExamen 
        ? "Se liberará la fecha en la agenda y se anulará el folio en el expediente del alumno." 
        : "¿Confirma que desea eliminar este evento de la agenda?";

    modals.openConfirmModal({
        title: <Text fw={700} c="red.7">{tituloModal}</Text>,
        children: <Text size="sm">{mensajeModal}</Text>,
        labels: { confirm: 'Confirmar', cancel: 'Cancelar' },
        confirmProps: { color: 'red' },
        centered: true,
        styles: { content: { borderTop: '4px solid var(--mantine-color-red-6)' } }, 
        onConfirm: async () => {
            try {
                setEventos(prev => prev.filter(e => e.id !== eventoSeleccionado.id));
                closeDetalle();

                if (esExamen) {
                    const noCuenta = eventoSeleccionado.id.split('-')[1];
                    await clienteAxios.put(`/alumnos/${noCuenta}`, {
                        fecha_examen_replica: null,
                        folio_examen_replica: null 
                    });
                } else {
                    await clienteAxios.delete(`/eventos/${eventoSeleccionado.id}`);
                }

                notifications.show({ title: 'Cancelación Exitosa', message: 'Agenda actualizada correctamente.', color: 'blue' });
                setTimeout(() => cargarDatos(), 500); 
            } catch (error) {
                try {
                      if(eventoSeleccionado.id && !String(eventoSeleccionado.id).includes('rep-')) {
                        await clienteAxios.delete(`/eventos/${eventoSeleccionado.id}`);
                        notifications.show({ title: 'Limpieza', message: 'Evento residual eliminado.', color: 'orange' });
                        cargarDatos();
                      } else {
                        throw error;
                      }
                } catch(e2) {
                    console.error(error);
                    notifications.show({ title: 'Error', message: 'No se pudo completar la solicitud.', color: 'red' });
                    cargarDatos();
                }
            }
        }
    });
  };

  const customCalendarStyles = `
    .rbc-calendar { font-family: var(--mantine-font-family); color: var(--mantine-color-text); }
    .rbc-off-range-bg { background-color: ${colorScheme === 'dark' ? 'var(--mantine-color-dark-8)' : 'var(--mantine-color-gray-1)'}; }
    .rbc-header { padding: 10px; font-weight: 700; color: var(--mantine-color-dimmed); text-transform: uppercase; font-size: 0.85rem; }
    .rbc-event { border: none; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .rbc-today { background-color: ${colorScheme === 'dark' ? 'rgba(var(--mantine-color-brand-9-rgb), 0.15)' : 'var(--mantine-color-brand-0)'}; }
  `;

  const eventPropGetter = (event) => {
      const backgroundColor = event.tipo === 'examen' ? 'var(--mantine-color-green-7)' : 'var(--mantine-color-brand-6)';
      return { style: { backgroundColor } };
  };

  return (
    <Container size="xl" py="md">
      <style>{customCalendarStyles}</style>

      <Group mb="lg" justify="space-between" align="center">
        <div>
          <Title order={2} c="brand.9">Calendario Institucional</Title>
          <Text c="dimmed" size="sm">Gestión de agenda y actos académicos.</Text>
        </div>
        <Button leftSection={<IconPlus size={18} />} onClick={() => { form.reset(); open(); }} color="brand.6">
          Agendar
        </Button>
      </Group>

      <Paper shadow="sm" radius="md" p="md" withBorder style={{ height: 650, backgroundColor: 'var(--mantine-color-body)', borderTop: '4px solid var(--mantine-color-brand-6)' }}>
        {cargando ? (
          <Group h="100%" justify="center"><Loader size="lg" type="dots" /></Group>
        ) : (
          <Calendar
            localizer={localizer}
            events={eventos}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            culture="es"
            eventPropGetter={eventPropGetter}
            messages={{ next: "Sig", previous: "Ant", today: "Hoy", month: "Mes", week: "Semana", day: "Día", agenda: "Agenda" }}
            selectable
            onSelectSlot={alSeleccionarSlot}
            onSelectEvent={alSeleccionarEvento}
            date={fechaCalendario}
            onNavigate={date => setFechaCalendario(date)}
          />
        )}
      </Paper>

      {/* MODAL CREAR EVENTO */}
      <Modal 
        opened={opened} 
        onClose={close} 
        title={<Text fw={700} c="brand.8">Nuevo Evento</Text>} 
        centered 
        radius="md"
        styles={{ content: { borderTop: '4px solid var(--mantine-color-brand-6)' } }}
      >
        <form onSubmit={form.onSubmit(guardarEvento)}>
          <TextInput label="Título" placeholder="Ej: Reunión de Consejo" data-autofocus required mb="sm" {...form.getInputProps('titulo')} />
          <TextInput type="datetime-local" label="Fecha y Hora" required mb="sm" {...form.getInputProps('fecha_hora')} />
          <Textarea label="Descripción" placeholder="Detalles opcionales..." mb="lg" minRows={3} {...form.getInputProps('descripcion')} />
          <Group justify="flex-end">
            <Button variant="default" onClick={close}>Cancelar</Button>
            <Button type="submit" color="brand.6">Guardar</Button>
          </Group>
        </form>
      </Modal>

      {/* MODAL DETALLE DE EVENTO */}
      <Modal 
        opened={detalleOpened} 
        onClose={closeDetalle} 
        title={<Badge size="lg" variant="light" color={eventoSeleccionado?.tipo === 'examen' ? 'green' : 'blue'}>{eventoSeleccionado?.tipo === 'examen' ? 'Examen de Réplica' : 'Evento General'}</Badge>} 
        centered
        styles={{ content: { borderTop: `4px solid ${eventoSeleccionado?.tipo === 'examen' ? 'var(--mantine-color-green-6)' : 'var(--mantine-color-brand-6)'}` } }}
      >
            {eventoSeleccionado && (
                <div>
                    <Title order={3} mb={5} style={{lineHeight: 1.2}}>{eventoSeleccionado.title}</Title>
                    <Group mb="md" c="dimmed" gap="xs">
                        <IconClock size={18} />
                        <Text size="sm" fw={500} tt="capitalize">
                            {format(eventoSeleccionado.start, 'EEEE d MMMM, h:mm a', { locale: es })}
                        </Text>
                    </Group>
                    <Text size="xs" fw={700} mb={5} c="dimmed" tt="uppercase">Detalles</Text>
                    <Paper withBorder p="sm" mb="lg" radius="sm">
                        <Text size="sm">{eventoSeleccionado.desc || "Sin descripción."}</Text>
                    </Paper>
                    {eventoSeleccionado.tipo === 'examen' && (
                        <Alert icon={<IconInfoCircle size={16}/>} title="Expediente Vinculado" color="blue" mb="md" variant="light">
                            Evento sincronizado con proceso de titulación.
                        </Alert>
                    )}
                    <Group justify="flex-end">
                        <Button variant="subtle" color="gray" onClick={closeDetalle}>Cerrar</Button>
                        <Button color="red" variant="light" leftSection={<IconTrash size={16}/>} onClick={borrarEventoActual}>Eliminar</Button>
                        {eventoSeleccionado.tipo === 'examen' && (
                            <Button color="blue" onClick={irAExpediente}>Ver Expediente</Button>
                        )}
                    </Group>
                </div>
            )}
      </Modal>
    </Container>
  );
};

export default Calendario;