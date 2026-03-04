import React, { useEffect, useState } from 'react';
import { Table, Badge, Text, Group, Paper, TextInput, LoadingOverlay, Container, Title, Breadcrumbs, Anchor, Stack, Box, ActionIcon } from '@mantine/core';
import { IconSearch, IconChevronRight, IconClock, IconUser } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import ClienteAxios from '../api'; 

const Bitacora = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setCargando] = useState(true);
    const [busqueda, setBusqueda] = useState('');

    const cargarLogs = async () => {
        setCargando(true);
        try {
            // Pedimos 100 registros para la auditoría
            const res = await ClienteAxios.get('/admin/bitacora?limit=100');
            setLogs(res.data);
        } catch (error) {
            console.error("Error cargando bitacora", error);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => { cargarLogs(); }, []);

    // Filtro para búsqueda rápida
    const datosFiltrados = logs.filter(item => 
        item.usuario.toLowerCase().includes(busqueda.toLowerCase()) ||
        item.detalle?.toLowerCase().includes(busqueda.toLowerCase()) ||
        item.accion.toLowerCase().includes(busqueda.toLowerCase())
    );

    const getBadgeColor = (accion) => {
        const act = accion.toLowerCase();
        if (act.includes('elimin') || act.includes('baja')) return 'red';
        if (act.includes('crear') || act.includes('nuevo') || act.includes('subida')) return 'green';
        if (act.includes('edit') || act.includes('actualiz')) return 'blue';
        return 'gray';
    };
    const CardMovil = ({ log }) => (
        <Paper withBorder p="md" radius="md" mb="sm" shadow="xs">
            <Group justify="space-between" mb="xs">
                <Badge color={getBadgeColor(log.accion)} variant="light">{log.accion}</Badge>
                <Text size="xs" c="dimmed">
                    {new Date(log.fecha).toLocaleDateString()}
                </Text>
            </Group>
            <Text size="sm" fw={600} mb={4} style={{lineHeight: 1.3}}>{log.detalle}</Text>
            
            <Group gap="xs" mt="sm">
                <IconUser size={14} color="gray"/>
                <Text size="xs" c="dimmed">{log.usuario}</Text>
                <div style={{flex:1}} />
                <IconClock size={14} color="gray"/>
                <Text size="xs" c="dimmed">{new Date(log.fecha).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</Text>
            </Group>
        </Paper>
    );

    return (
        <Container size="lg" py="xl">
            <Breadcrumbs separator={<IconChevronRight size={14} />} mb="md" mt="xs">
                <Anchor component={Link} to="/" size="sm" c="dimmed">Inicio</Anchor>
                <Text size="sm" c="brand.7">Historial</Text>
            </Breadcrumbs>

            <Paper p="xl" radius="md" withBorder pos="relative" style={{ borderTop: '4px solid var(--mantine-color-red-8)' }}>
                <LoadingOverlay visible={loading} overlayProps={{ blur: 2 }} />
                
                {/* CABECERA RESPONSIVA */}
                <Group justify="space-between" mb="lg">
                    <div>
                        <Title order={2} c="brand.9">Historial</Title>
                        <Text c="dimmed" size="sm">Movimientos y seguridad.</Text>
                    </div>
                    <TextInput 
                        placeholder="Buscar movimiento..." 
                        leftSection={<IconSearch size={16} />}
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        w={{ base: '100%', sm: 300 }}
                    />
                </Group>

                <Box visibleFrom="sm">
                    <Table striped highlightOnHover>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Fecha</Table.Th>
                                <Table.Th>Usuario</Table.Th>
                                <Table.Th>Acción</Table.Th>
                                <Table.Th>Detalle</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {datosFiltrados.length > 0 ? datosFiltrados.map((log) => (
                                <Table.Tr key={log.id}>
                                    <Table.Td width={150}>
                                        <Text size="sm" fw={500}>
                                            {new Date(log.fecha).toLocaleDateString()}
                                        </Text>
                                        <Text size="xs" c="dimmed">
                                            {new Date(log.fecha).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                                        </Text>
                                    </Table.Td>
                                    <Table.Td>
                                        <Text size="sm" fw={500}>{log.usuario}</Text>
                                    </Table.Td>
                                    <Table.Td>
                                        <Badge color={getBadgeColor(log.accion)} variant="light">
                                            {log.accion}
                                        </Badge>
                                    </Table.Td>
                                    <Table.Td>
                                        <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>{log.detalle}</Text>
                                        {log.entidad && (
                                            <Badge size="xs" variant="outline" color="gray" mt={4}>
                                                Ref: {log.entidad} #{log.ref_id}
                                            </Badge>
                                        )}
                                    </Table.Td>
                                </Table.Tr>
                            )) : (
                                <Table.Tr>
                                    <Table.Td colSpan={4}>
                                        <Text ta="center" c="dimmed" fs="italic">No se encontraron registros</Text>
                                    </Table.Td>
                                </Table.Tr>
                            )}
                        </Table.Tbody>
                    </Table>
                </Box>
                <Box hiddenFrom="sm">
                    {datosFiltrados.length > 0 ? (
                        <Stack gap="xs">
                            {datosFiltrados.map(log => (
                                <CardMovil key={log.id} log={log} />
                            ))}
                        </Stack>
                    ) : (
                        <Text ta="center" c="dimmed" fs="italic" py="lg">No se encontraron registros</Text>
                    )}
                </Box>

            </Paper>
        </Container>
    );
};

export default Bitacora;