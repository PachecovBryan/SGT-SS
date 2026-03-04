import React, { useState, useEffect } from 'react';
import { Modal, Select, Button, Text, Group, ActionIcon, Table, ScrollArea, Avatar, Paper, SimpleGrid, ThemeIcon } from '@mantine/core';
import { IconGavel, IconPlus, IconTrash, IconUser, IconCertificate, IconUsers } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';

const ModalComite = ({ abierto, cerrar, alGuardar, listaProfesores, listaCargos = [], alumnoNombre, comiteActual = [] }) => {
  const [miembros, setMiembros] = useState([]);
  const [profeSeleccionado, setProfeSeleccionado] = useState(null);
  const [cargoSeleccionado, setCargoSeleccionado] = useState(null);

  useEffect(() => {
    if (abierto) {
        setMiembros(comiteActual ? [...comiteActual] : []);
        setProfeSeleccionado(null);
        setCargoSeleccionado(null);
    }
  }, [abierto, comiteActual]); 

  const agregarMiembro = () => {
    // Validar que se hayan seleccionado ambas opciones
    if (!profeSeleccionado || !cargoSeleccionado) {
        notifications.show({ message: 'Seleccione profesor y cargo.', color: 'orange' });
        return;
    }

    //  NO REPETIR PROFESOR
    const profeYaExiste = miembros.some(m => String(m.personal_id) === String(profeSeleccionado));
    
    if (profeYaExiste) {
        notifications.show({ 
            title: 'Profesor Duplicado',
            message: 'Este docente ya forma parte del comité.', 
            color: 'red' 
        });
        return;
    }

    // NO REPETIR CARGO
    const cargoYaOcupado = miembros.some(m => String(m.cargo_id) === String(cargoSeleccionado));

    if (cargoYaOcupado) {
        const cargoObj = listaCargos.find(c => String(c.value) === String(cargoSeleccionado));
        notifications.show({ 
            title: 'Cargo Ocupado',
            message: `El cargo de "${cargoObj?.label}" ya ha sido asignado. No se pueden repetir cargos.`, 
            color: 'red' 
        });
        return;
    }
    const profeObj = listaProfesores.find(p => String(p.value) === String(profeSeleccionado));
    const cargoObj = listaCargos.find(c => String(c.value) === String(cargoSeleccionado));

    const nuevoMiembro = {
        personal_id: profeSeleccionado, 
        nombre: profeObj.label,
        cargo_id: parseInt(cargoSeleccionado), 
        cargo_nombre: cargoObj.label
    };

    setMiembros([...miembros, nuevoMiembro]);
    
    setProfeSeleccionado(null);
    setCargoSeleccionado(null);
  };

  const quitarMiembro = (personalId) => {
    setMiembros(miembros.filter(m => String(m.personal_id) !== String(personalId)));
  };

  const manejarGuardado = () => {
    if (miembros.length === 0) {
        notifications.show({ message: 'El comité está vacío.', color: 'orange' });
        return;
    }
    alGuardar(miembros);
  };

  return (
      <Modal 
            opened={abierto} 
            onClose={cerrar} 
            title={<Group><ThemeIcon variant="light" color="brand"><IconGavel size={18}/></ThemeIcon><Text fw={700} c="brand.9" size="lg">Asignar Jurado</Text></Group>} 
            centered 
            size="lg"
            overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
            styles={{ content: { borderTop: '5px solid var(--mantine-color-brand-6)' } }} 
          >
        <Text size="sm" c="dimmed" mb="md">
            Configure el comité para: <Text span fw={700} c="brand.5">{alumnoNombre}</Text>
        </Text>
        
        {/* FORMULARIO DE AGREGAR */}
        <Paper withBorder p="md" radius="md" mb="md" bg="var(--mantine-color-body)">
            <SimpleGrid cols={{ base: 1, sm: 12 }} align="flex-end">
                <div style={{ gridColumn: 'span 6' }}>
                    <Select 
                        label="Profesor" 
                        placeholder="Buscar docente..." 
                        data={listaProfesores} 
                        value={profeSeleccionado}
                        onChange={setProfeSeleccionado}
                        searchable 
                        clearable
                        nothingFoundMessage="No encontrado"
                        leftSection={<IconUser size={16}/>}
                    />
                </div>
                <div style={{ gridColumn: 'span 5' }}>
                    <Select 
                        label="Cargo" 
                        placeholder="Seleccione cargo" 
                        data={listaCargos} 
                        value={cargoSeleccionado}
                        onChange={setCargoSeleccionado}
                        searchable
                        nothingFoundMessage="Sin cargos"
                        leftSection={<IconCertificate size={16}/>}
                    />
                </div>
                <div style={{ gridColumn: 'span 1' }}>
                    <ActionIcon variant="filled" color="brand" size={36} onClick={agregarMiembro} aria-label="Agregar">
                        <IconPlus size={20} />
                    </ActionIcon>
                </div>
            </SimpleGrid>
        </Paper>

        {/* LISTA DE MIEMBROS */}
        <Group justify="space-between" mb="xs">
            <Text size="xs" fw={700} c="dimmed" tt="uppercase">Miembros Asignados ({miembros.length})</Text>
            {miembros.length === 0 && <IconUsers size={16} color="gray" style={{ opacity: 0.5 }} />}
        </Group>
        
        <Paper withBorder radius="md" style={{ overflow: 'hidden' }}>
            <ScrollArea h={200} type="auto" offsetScrollbars>
                {miembros.length === 0 ? (
                    <div style={{ padding: 40, textAlign: 'center', opacity: 0.5 }}>
                        <Text size="sm">No hay miembros asignados.</Text>
                        <Text size="xs">Utilice los controles de arriba para agregar.</Text>
                    </div>
                ) : (
                    <Table striped highlightOnHover>
                        <Table.Tbody>
                            {miembros.map((m) => (
                                <Table.Tr key={m.personal_id}>
                                    <Table.Td w={50}>
                                        <Avatar color="violet" radius="xl" size="sm">
                                            {m.nombre ? m.nombre.charAt(0) : '?'}
                                        </Avatar>
                                    </Table.Td>
                                    <Table.Td>
                                        <Text size="sm" fw={500}>{m.nombre}</Text>
                                        <Text size="xs" c="dimmed">ID: {m.personal_id}</Text>
                                    </Table.Td>
                                    <Table.Td>
                                        <Text size="sm" fw={600} c="brand.6">{m.cargo_nombre}</Text>
                                    </Table.Td>
                                    <Table.Td align="right">
                                        <ActionIcon color="red" variant="subtle" onClick={() => quitarMiembro(m.personal_id)}>
                                            <IconTrash size={16} />
                                        </ActionIcon>
                                    </Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                )}
            </ScrollArea>
        </Paper>

        <Group justify="flex-end" mt="xl">
            <Button variant="default" onClick={cerrar}>Cancelar</Button>
            <Button onClick={manejarGuardado} color="brand" leftSection={<IconGavel size={18} />}>
                Guardar Comité
            </Button>
        </Group>
    </Modal>
  );
};

export default ModalComite;