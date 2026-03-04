import React, { useEffect, useState } from 'react';
import { Container, Grid, Paper, Text, Title, Group, RingProgress, Table, Badge, Loader, Center, ThemeIcon, Button, ScrollArea } from '@mantine/core';
import { IconChartBar, IconAlertTriangle, IconTrophy, IconUsers, IconPrinter, IconChartPie } from '@tabler/icons-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { pdf } from '@react-pdf/renderer'; 
import { notifications } from '@mantine/notifications';
import clienteAxios from './api';
import ReporteGeneralPDF from './components/ReporteGeneralPDF';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const Reportes = () => {
    const [data, setData] = useState(null);
    const [config, setConfig] = useState({});
    const [cargando, setCargando] = useState(true);
    const [generandoPdf, setGenerandoPdf] = useState(false);

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                // Hacemos las dos peticiones en paralelo 
                const [resData, resConfig] = await Promise.all([
                    clienteAxios.get('/reportes/dashboard'),
                    clienteAxios.get('/admin/config')
                ]);
                setData(resData.data);
                setConfig(resConfig.data);
            } catch (error) {
                console.error(error);
                notifications.show({ title: 'Error', message: 'No se pudieron cargar las estadísticas', color: 'red' });
            } finally {
                setCargando(false);
            }
        };
        cargarDatos();
    }, []);

    // Función para descargar el PDF
    const descargarPDF = async () => {
        setGenerandoPdf(true);
        try {
            const blob = await pdf(<ReporteGeneralPDF data={data} config={config} />).toBlob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Reporte_Ejecutivo_${new Date().toISOString().split('T')[0]}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            notifications.show({ title: 'Informe Generado', message: 'Descarga iniciada.', color: 'green' });
        } catch (error) {
            console.error(error);
            notifications.show({ title: 'Error', message: 'Fallo al generar PDF', color: 'red' });
        } finally {
            setGenerandoPdf(false);
        }
    };

    if (cargando) return <Center h="80vh"><Loader size="xl" /></Center>;
    if (!data) return <Center h="80vh"><Text>No hay datos disponibles.</Text></Center>;

    // Calcular porcentaje de titulación 
    const porcentajeTitulacion = data.kpis.total > 0 
        ? Math.round((data.kpis.titulados / data.kpis.total) * 100) 
        : 0;

    return (
        <Container size="xl" py="md">
            
            {/* HEADER DE LA PÁGINA */}
            <Group justify="space-between" mb="xl" align="flex-end">
                <div>
                    <Title order={2} c="brand.9">Reporte de Datos</Title>
                    <Text c="dimmed">Análisis estratégico y rendimiento académico.</Text>
                </div>
                <Button 
                    leftSection={<IconPrinter size={18}/>} 
                    color="brand.7" 
                    onClick={descargarPDF}
                    loading={generandoPdf}
                >
                    Descargar Reporte
                </Button>
            </Group>

            {/* KPIs TARJETAS SUPERIORES */}
            <Grid mb="xl">
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <Paper shadow="sm" p="md" radius="md" withBorder>
                        <Group>
                            <ThemeIcon size={50} radius="md" variant="light" color="blue"><IconUsers size={30} /></ThemeIcon>
                            <div>
                                <Text c="dimmed" size="xs" tt="uppercase" fw={700}>Matrícula Activa</Text>
                                <Text fw={700} size="2rem" style={{ lineHeight: 1 }}>{data.kpis.total}</Text>
                                <Text size="xs" c="dimmed">Tesistas registrados</Text>
                            </div>
                        </Group>
                    </Paper>
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <Paper shadow="sm" p="md" radius="md" withBorder>
                        <Group>
                            <ThemeIcon size={50} radius="md" variant="light" color="green"><IconTrophy size={30} /></ThemeIcon>
                            <div>
                                <Text c="dimmed" size="xs" tt="uppercase" fw={700}>Titulados</Text>
                                <Text fw={700} size="2rem" style={{ lineHeight: 1 }}>{data.kpis.titulados}</Text>
                                <Text size="xs" c="dimmed">Procesos concluidos</Text>
                            </div>
                        </Group>
                    </Paper>
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <Paper shadow="sm" p="md" radius="md" withBorder>
                        <Group justify="space-between">
                            <div>
                                <Text c="dimmed" size="xs" tt="uppercase" fw={700}>Eficiencia</Text>
                                <Text fw={700} size="2rem" style={{ lineHeight: 1 }}>{porcentajeTitulacion}%</Text>
                                <Text size="xs" c="dimmed">Tasa de finalización</Text>
                            </div>
                            <RingProgress 
                                size={70} 
                                roundCaps 
                                thickness={6} 
                                sections={[{ value: porcentajeTitulacion, color: 'brand' }]} 
                                label={<Center><IconChartBar size={18} /></Center>}
                            />
                        </Group>
                    </Paper>
                </Grid.Col>
            </Grid>

            {/* GRÁFICAS PRINCIPALES */}
            <Grid mb="xl">
                <Grid.Col span={{ base: 12, md: 8 }}>
                    <Paper shadow="sm" p="md" radius="md" withBorder h={420}>
                        <Group justify="space-between" mb="md">
                            <Title order={5}>Tesistas por Carrera</Title>
                            <Badge variant="light" color="gray">Distribución</Badge>
                        </Group>
                        <ResponsiveContainer width="100%" height="85%">
                            <BarChart data={data.graficas.porCarrera} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="nombre" fontSize={11} tickLine={false} interval={0} />
                                <YAxis allowDecimals={false} fontSize={12} />
                                <RechartsTooltip 
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}
                                    formatter={(value, name, props) => [value, props.payload.nombreCompleto]}
                                />
                                <Bar dataKey="cantidad" fill="var(--mantine-color-brand-6)" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 4 }}>
                    <Paper shadow="sm" p="md" radius="md" withBorder h={420}>
                        <Group justify="space-between" mb="md">
                            <Title order={5}>Estatus de Trámites</Title>
                            <IconChartPie size={20} color="gray" />
                        </Group>
                        <ResponsiveContainer width="100%" height="85%">
                            <PieChart>
                                <Pie 
                                    data={data.graficas.porEstatus} 
                                    cx="50%" cy="50%" 
                                    innerRadius={60} outerRadius={80} 
                                    paddingAngle={5} 
                                    dataKey="value"
                                >
                                    {data.graficas.porEstatus.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip />
                                <Legend verticalAlign="bottom" height={36} iconType="circle"/>
                            </PieChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid.Col>
            </Grid>

            {/* TABLAS DE ANÁLISIS */}
            <Grid>
                {/* CARGA DE PROFESORES */}
                <Grid.Col span={{ base: 12, md: 6 }}>
                    <Paper shadow="sm" p="md" radius="md" withBorder h="100%">
                        <Group mb="md" justify="space-between">
                            <Title order={5}>Directores con Alta Carga</Title>
                            <Badge color="blue" variant="light">Top 5</Badge>
                        </Group>
                        <Table striped highlightOnHover>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>Profesor</Table.Th>
                                    <Table.Th style={{textAlign:'right'}}>Alumnos Activos</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {data.tablas.topDirectores.length > 0 ? data.tablas.topDirectores.map((d, i) => (
                                    <Table.Tr key={i}>
                                        <Table.Td style={{ fontSize: '0.9rem' }}>{d.nombre}</Table.Td>
                                        <Table.Td style={{textAlign:'right'}}><Badge size="sm" variant="outline">{d.alumnos}</Badge></Table.Td>
                                    </Table.Tr>
                                )) : (
                                    <Table.Tr><Table.Td colSpan={2} align="center"><Text c="dimmed" size="sm">Sin datos</Text></Table.Td></Table.Tr>
                                )}
                            </Table.Tbody>
                        </Table>
                    </Paper>
                </Grid.Col>

                {/* ALERTA DE REZAGOS */}
                <Grid.Col span={{ base: 12, md: 6 }}>
                    <Paper shadow="sm" p="md" radius="md" withBorder h="100%" style={{ borderColor: 'var(--mantine-color-red-3)', borderLeftWidth: 4 }}>
                        <Group mb="md" justify="space-between">
                            <Group gap="xs">
                                <IconAlertTriangle color="var(--mantine-color-red-6)" size={20} />
                                <Title order={5} c="red.8">Alerta de Rezago ({'>'} 2 años)</Title>
                            </Group>
                            <Badge color="red" variant="filled">{data.tablas.rezagados.length}</Badge>
                        </Group>
                        
                        <ScrollArea h={250} offsetScrollbars>
                            <Table>
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th>Alumno</Table.Th>
                                        <Table.Th>Fecha Ingreso</Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {data.tablas.rezagados.length > 0 ? data.tablas.rezagados.map((al) => (
                                        <Table.Tr key={al.no_cuenta}>
                                            <Table.Td>
                                                <Text size="sm" fw={600}>{al.nombre_completo}</Text>
                                                <Text size="xs" c="dimmed">{al.no_cuenta}</Text>
                                            </Table.Td>
                                            <Table.Td style={{ fontSize: '0.9rem' }}>
                                                {new Date(al.fecha_aceptacion).toLocaleDateString()}
                                            </Table.Td>
                                        </Table.Tr>
                                    )) : (
                                        <Table.Tr>
                                            <Table.Td colSpan={2} style={{ textAlign: 'center', padding: 20 }}>
                                                <Text c="dimmed" size="sm">¡Excelente! No hay alumnos en rezago crítico.</Text>
                                            </Table.Td>
                                        </Table.Tr>
                                    )}
                                </Table.Tbody>
                            </Table>
                        </ScrollArea>
                    </Paper>
                </Grid.Col>
            </Grid>

        </Container>
    );
};

export default Reportes;