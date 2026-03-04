import React, { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import clienteAxios from './api'; 
import { Title, Text, Paper, Group, Loader, Container, Badge, Grid, Stack, ScrollArea, Timeline, Center, ActionIcon, Box, SimpleGrid, ThemeIcon, useMantineColorScheme } from '@mantine/core';
import { IconAlertCircle, IconChevronRight, IconPencil, IconUserPlus, IconFileText, IconTrash, IconCalendarEvent, IconClock } from '@tabler/icons-react';
import { Link, useNavigate } from 'react-router-dom';

function Dashboard() {
  const { user } = useAuth();
  const [cargando, setCargando] = useState(true);
  const { colorScheme } = useMantineColorScheme(); 
  const navigate = useNavigate(); 

  const [datosOperativos, setDatosOperativos] = useState({ pendientes: 0, recientes: [], listaAtencion: [], agenda: [] });

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const resOp = await clienteAxios.get('/dashboard/operativo');
        
        const rawAgenda = resOp.data.agenda || [];

        const examenes = rawAgenda.filter(ev => String(ev.id).startsWith('examen-'));
        
        const manuales = rawAgenda.filter(ev => !String(ev.id).startsWith('examen-'));

        const manualesUnicos = manuales.filter(manual => {
            const fechaManual = new Date(manual.fecha_evento).getTime();
            
            const esDuplicado = examenes.some(examen => {
                const fechaExamen = new Date(examen.fecha_evento).getTime();
                const diff = Math.abs(fechaManual - fechaExamen);
                const tituloLower = (manual.titulo || '').toLowerCase();
                
                return diff < 120000 && (tituloLower.includes('examen') || tituloLower.includes('réplica') || tituloLower.includes('replica'));
            });

            return !esDuplicado; 
        });
        const agendaLimpia = [...manualesUnicos, ...examenes].sort((a, b) => new Date(a.fecha_evento) - new Date(b.fecha_evento));
        setDatosOperativos({ ...resOp.data, agenda: agendaLimpia });

      } catch (error) { console.error(error); } 
      finally { setCargando(false); }
    };
    cargarDatos();
  }, []); 

  const getIconoLog = (titulo) => {
      const t = (titulo || '').toLowerCase();
      if (t.includes('nuevo')) return <IconUserPlus size={14}/>;
      if (t.includes('edición')) return <IconPencil size={14}/>;
      if (t.includes('baja')) return <IconTrash size={14}/>;
      return <IconFileText size={14}/>;
  };

  // Ir al calendario y abrir el evento
  const verEnCalendario = (evento) => {
      navigate('/calendario', { state: { eventoId: evento.id } });
  };

  if (cargando) return <Center h="80vh"><Loader size="xl" /></Center>;

  const fechaHoy = new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' });

  //Hover en eventos
  const customStyles = `
    .agenda-item {
        transition: background-color 0.2s ease, transform 0.1s;
        cursor: pointer;
    }
    /* Efecto muy sutil para no saturar (4% de oscuridad) */
    .agenda-item:hover {
        background-color: rgba(0, 0, 0, 0.04) !important;
    }
    /* Ajuste automático para modo oscuro */
    [data-mantine-color-scheme="dark"] .agenda-item:hover {
        background-color: rgba(255, 255, 255, 0.05) !important;
    }
    .agenda-item:active {
        transform: scale(0.99);
    }
  `;

  return (
    <Container size="xl" py="md">
        <style>{customStyles}</style>
        
        <div style={{ marginBottom: 30 }}>
            <Text c="dimmed" tt="capitalize" size="sm">{fechaHoy}</Text>
            <Title order={2} c="brand.8">Hola, {user?.nombre?.split(' ')[0]}</Title>
            <Text c="dimmed" size="sm">Bienvenido a tu panel operativo.</Text>
        </div>

        <Grid gutter="lg">
            
            {/* COLUMNA IZQUIERDA AGENDA  */}
            <Grid.Col span={{ base: 12, md: 8 }}>
                <Paper withBorder p="md" radius="md" h="100%">
                    <Group justify="space-between" mb="md">
                        <Group gap="xs">
                            <IconCalendarEvent size={20} color="var(--mantine-color-violet-6)" />
                            <Title order={5}>Agenda Próxima</Title>
                        </Group>
                        <Badge variant="light" color="violet">Próx. 15 días</Badge>
                    </Group>
                    
                    {datosOperativos.agenda?.length > 0 ? (
                        <SimpleGrid cols={1} spacing="xs">
                            {datosOperativos.agenda.map(ev => (
                                <Paper 
                                    key={ev.id} 
                                    p="sm" 
                                    bg="var(--mantine-color-default)" 
                                    withBorder 
                                    radius="sm"
                                    onClick={() => verEnCalendario(ev)} 
                                    className="agenda-item" 
                                >
                                    <Group justify="space-between" align="center">
                                        <Group gap="sm">
                                            <ThemeIcon variant="light" color="violet" size="md"><IconClock size={16}/></ThemeIcon>
                                            <div>
                                                <Text size="sm" fw={600}>{ev.titulo}</Text>
                                                <Text size="xs" c="dimmed">{new Date(ev.fecha_evento).toLocaleDateString()} - {new Date(ev.fecha_evento).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Text>
                                            </div>
                                        </Group>
                                        <Badge size="xs" color="gray">Ir a Calendario</Badge>
                                    </Group>
                                </Paper>
                            ))}
                        </SimpleGrid>
                    ) : (
                        <Center h={150} bg="var(--mantine-color-default)" style={{borderRadius:8, border: '1px dashed var(--mantine-color-gray-4)'}}>
                            <Stack align="center" gap={5}>
                                <IconCalendarEvent size={30} color="gray" style={{opacity:0.5}}/>
                                <Text c="dimmed" size="sm">No hay eventos programados pronto.</Text>
                            </Stack>
                        </Center>
                    )}
                </Paper>
            </Grid.Col>

            {/* COLUMNA DERECHA ALERTAS Y BITACORA */}
            <Grid.Col span={{ base: 12, md: 4 }}>
                <Stack>
                    <Paper withBorder p="md" radius="md" style={{ borderLeft: '4px solid var(--mantine-color-orange-5)' }}>
                        <Group justify="space-between" mb="md">
                            <Group gap="xs"><IconAlertCircle color="orange" size={20} /><Text fw={700}>Atención Requerida</Text></Group>
                            <Badge color="orange" variant="filled">{datosOperativos.pendientes}</Badge>
                        </Group>
                        
                        {datosOperativos.listaAtencion?.length > 0 ? (
                            <Stack gap="xs">
                                {datosOperativos.listaAtencion.map((alumno) => (
                                    <Paper key={alumno.no_cuenta} withBorder p="xs" radius="sm">
                                        <Group justify="space-between" wrap="nowrap">
                                            <Box style={{flex: 1}}>
                                                <Text size="sm" fw={600} lineClamp={1}>{alumno.nombre_completo}</Text>
                                                <Text size="xs" c="red.7" fw={600}>• {alumno.motivo}</Text> 
                                            </Box>
                                            <ActionIcon variant="subtle" color="gray" component={Link} to={`/expediente/${alumno.no_cuenta}`}>
                                                <IconChevronRight size={16}/>
                                            </ActionIcon>
                                        </Group>
                                    </Paper>
                                ))}
                            </Stack>
                        ) : <Center h={80}><Text size="xs" c="dimmed">¡Todo al día!</Text></Center>}
                    </Paper>

                    {/* TIMELINE */}
                    <Paper withBorder p="md" radius="md">
                        <Title order={5} mb="lg">Actividad Reciente</Title>
                        <ScrollArea h={300} type="hover" offsetScrollbars>
                            {datosOperativos.recientes?.length > 0 ? (
                                <Timeline active={1} bulletSize={20} lineWidth={2}>
                                    {datosOperativos.recientes.map((log) => (
                                        <Timeline.Item key={log.id} bullet={getIconoLog(log.titulo)} title={<Text size="xs" fw={600}>{log.titulo}</Text>}>
                                            <Text c="dimmed" size="xs" style={{lineHeight:1.2}} mb={2}>
                                                {new Date(log.fecha).toLocaleString()}
                                            </Text>
                                            <Text size="xs" c="dimmed">{log.detalle}</Text>
                                        </Timeline.Item>
                                    ))}
                                </Timeline>
                            ) : <Text c="dimmed" size="xs">Sin actividad.</Text>}
                        </ScrollArea>
                    </Paper>
                </Stack>
            </Grid.Col>

        </Grid>
    </Container>
  );
}

export default Dashboard;