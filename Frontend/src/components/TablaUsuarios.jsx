import React from 'react';
import { Table, Badge, Group, Avatar, Text, ActionIcon, Tooltip } from '@mantine/core';
import { IconPencil, IconTrash } from '@tabler/icons-react';

const TablaUsuarios = ({ usuarios, onEditar, onEliminar }) => {
  const filas = usuarios.map((u) => (
    <Table.Tr key={u.no_empleado}>
      <Table.Td>
        <Badge variant="light" color="gray" size="md">{u.no_empleado}</Badge>
      </Table.Td>
      <Table.Td>
        <Group gap="sm">
          <Avatar color="brand" radius="xl" size="sm" name={u.nombre_completo}>
            {u.nombre_completo.charAt(0)}
          </Avatar>
          <Text fw={500} size="sm">{u.nombre_completo}</Text>
        </Group>
      </Table.Td>
      <Table.Td><Text size="sm">{u.correo}</Text></Table.Td>
      <Table.Td>
        <Badge 
          variant={u.rol.nombre === 'Administrador' ? 'filled' : 'outline'} 
          color={u.rol.nombre === 'Administrador' ? 'brand.9' : 'blue'}
        >
          {u.rol.nombre}
        </Badge>
      </Table.Td>
      <Table.Td style={{ textAlign: 'right' }}>
        <Group gap={0} justify="flex-end">
          <Tooltip label="Editar">
            <ActionIcon variant="subtle" color="blue" onClick={() => onEditar(u)}>
              <IconPencil size={16} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Eliminar">
            <ActionIcon variant="subtle" color="red" onClick={() => onEliminar(u)}>
              <IconTrash size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Table verticalSpacing="sm" striped highlightOnHover>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>ID</Table.Th>
          <Table.Th>Usuario</Table.Th>
          <Table.Th>Correo</Table.Th>
          <Table.Th>Rol</Table.Th>
          <Table.Th style={{ textAlign: 'right' }}>Acciones</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>{filas}</Table.Tbody>
    </Table>
  );
};

export default TablaUsuarios;