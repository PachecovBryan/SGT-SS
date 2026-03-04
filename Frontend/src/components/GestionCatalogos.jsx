import React, { useEffect, useState } from 'react';
import { Table, Button, Group, Text, Paper, Grid, ActionIcon, Modal, TextInput, LoadingOverlay } from '@mantine/core';
import { IconEdit, IconTrash, IconPlus, IconCheck } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import ClienteAxios from '../api'; 

const GestionCatalogos = () => {
    const [estatus, setEstatus] = useState([]);
    const [cargos, setCargos] = useState([]);
    const [loading, setLoading] = useState(true);

    const [modalAbierto, setModalAbierto] = useState(false);
    const [tipoEdicion, setTipoEdicion] = useState(null); 
    const [elementoSeleccionado, setElementoSeleccionado] = useState(null); 
    const [textoInput, setTextoInput] = useState('');

    const cargarCatalogos = async () => {
        try {
            setLoading(true);
            const [resEstatus, resCargos] = await Promise.all([
                ClienteAxios.get('/catalogos/estatus'),
                ClienteAxios.get('/catalogos/cargos')
            ]);
            setEstatus(resEstatus.data);
            setCargos(resCargos.data);
        } catch (error) {
            console.error(error);
            notifications.show({ title: 'Error', message: 'No se pudieron cargar los catálogos', color: 'red' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarCatalogos();
    }, []);

    // GUARDADO (Crear / Editar) 
    const guardarCambios = async (e) => {
        e.preventDefault();
        if (!textoInput.trim()) return;

        const esEstatus = tipoEdicion === 'estatus';
        const endpoint = esEstatus ? '/catalogos/estatus' : '/catalogos/cargos';
        
        try {
            if (elementoSeleccionado) {
                await ClienteAxios.put(`${endpoint}/${elementoSeleccionado.id}`, { nombre: textoInput });
                notifications.show({ title: 'Actualizado', message: 'Registro modificado con éxito', color: 'green' });
            } else {
                await ClienteAxios.post(endpoint, { nombre: textoInput });
                notifications.show({ title: 'Creado', message: 'Nuevo registro agregado', color: 'green' });
            }
            cerrarModal();
            cargarCatalogos();
        } catch (error) {
            notifications.show({ title: 'Error', message: error.response?.data?.error || 'Error al guardar', color: 'red' });
        }
    };

    // BORRADO
    const eliminarItem = async (id, tipo) => {
        if (!window.confirm('¿Seguro que deseas eliminar este elemento?')) return;
        
        const endpoint = tipo === 'estatus' ? `/catalogos/estatus/${id}` : `/catalogos/cargos/${id}`;
        try {
            await ClienteAxios.delete(endpoint);
            notifications.show({ title: 'Eliminado', message: 'Registro eliminado correctamente', color: 'blue' });
            cargarCatalogos();
        } catch (error) {
            notifications.show({ 
                title: 'No se puede eliminar', 
                message: error.response?.data?.error || 'El elemento está en uso actualmente.', 
                color: 'orange' 
            });
        }
    };

    const abrirModal = (tipo, item = null) => {
        setTipoEdicion(tipo);
        setElementoSeleccionado(item);
        setTextoInput(item ? item.nombre : '');
        setModalAbierto(true);
    };

    const cerrarModal = () => {
        setModalAbierto(false);
        setElementoSeleccionado(null);
        setTextoInput('');
    };

    const TablaSimple = ({ titulo, datos, tipo }) => (
        <Paper withBorder p="md" radius="md" shadow="sm">
            <Group justify="space-between" mb="md">
                <Text fw={700} size="lg" c="brand.8">{titulo}</Text>
                <Button 
                    leftSection={<IconPlus size={16}/>} 
                    size="xs" 
                    variant="light" 
                    color="brand"
                    onClick={() => abrirModal(tipo)}
                >
                    Agregar
                </Button>
            </Group>
            
            {datos.length === 0 ? (
                <Text c="dimmed" size="sm" fs="italic">No hay registros.</Text>
            ) : (
                <Table striped highlightOnHover>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>ID</Table.Th>
                            <Table.Th>Nombre</Table.Th>
                            <Table.Th style={{textAlign: 'right'}}>Acciones</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {datos.map((item) => (
                            <Table.Tr key={item.id}>
                                <Table.Td width={60}><Text size="xs" c="dimmed">#{item.id}</Text></Table.Td>
                                <Table.Td><Text fw={500}>{item.nombre}</Text></Table.Td>
                                <Table.Td align="right">
                                    <Group gap={4} justify="flex-end">
                                        <ActionIcon variant="subtle" color="blue" onClick={() => abrirModal(tipo, item)}>
                                            <IconEdit size={16} />
                                        </ActionIcon>
                                        <ActionIcon variant="subtle" color="red" onClick={() => eliminarItem(item.id, tipo)}>
                                            <IconTrash size={16} />
                                        </ActionIcon>
                                    </Group>
                                </Table.Td>
                            </Table.Tr>
                        ))}
                    </Table.Tbody>
                </Table>
            )}
        </Paper>
    );

    return (
        <div style={{ position: 'relative' }}>
            <LoadingOverlay visible={loading} overlayProps={{ blur: 2 }} />
            
            <Grid>
                <Grid.Col span={{ base: 12, md: 6 }}>
                    <TablaSimple titulo="Estatus de Alumnos" datos={estatus} tipo="estatus" />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                    <TablaSimple titulo="Cargos de Comité" datos={cargos} tipo="cargos" />
                </Grid.Col>
            </Grid>
            <Modal 
                opened={modalAbierto} 
                onClose={cerrarModal} 
                title={
                    <Text fw={700}>
                        {elementoSeleccionado ? 'Editar' : 'Agregar nuevo'} {tipoEdicion === 'estatus' ? 'Estatus' : 'Cargo'}
                    </Text>
                } 
                centered
            >
                <form onSubmit={guardarCambios}>
                    <TextInput
                        label="Nombre / Descripción"
                        placeholder={tipoEdicion === 'estatus' ? "Ej: Baja Temporal" : "Ej: Co-Director"}
                        value={textoInput}
                        onChange={(e) => setTextoInput(e.target.value)}
                        data-autofocus
                        required
                        mb="lg"
                    />
                    <Group justify="flex-end">
                        <Button variant="default" onClick={cerrarModal}>Cancelar</Button>
                        <Button type="submit" leftSection={<IconCheck size={16}/>} color="brand.6">Guardar</Button>
                    </Group>
                </form>
            </Modal>
        </div>
    );
};

export default GestionCatalogos;