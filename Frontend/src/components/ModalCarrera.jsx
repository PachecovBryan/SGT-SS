import React from 'react';
import { Modal, Text, TextInput, Group, Button } from '@mantine/core';
import { IconId } from '@tabler/icons-react'; 

const ModalCarrera = ({ abierto, cerrar, esEdicion, form, alGuardar }) => {
  return (
    <Modal 
      opened={abierto} 
      onClose={cerrar} 
      title={<Text fw={700} c="brand.9" size="lg">{esEdicion ? 'Editar Carrera' : 'Nueva Carrera'}</Text>} 
      centered
      overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
      styles={{ content: { borderTop: '5px solid var(--mantine-color-brand-6)' } }}
    >
      <form onSubmit={form.onSubmit(alGuardar)}>
        <TextInput
            label="Clave de Carrera"
            placeholder="Ej: ISO"
            description="Identificador único (Siglas)"
            mb="md"
            leftSection={<IconId size={16}/>}
            required
            disabled={esEdicion} 
            {...form.getInputProps('clave')}
        />

        <TextInput
            label="Nombre Oficial"
            placeholder="Ej: Ingeniería en Sistemas Computacionales"
            data-autofocus
            mb="xl"
            required
            {...form.getInputProps('nombre')}
        />
        
        <Group justify="flex-end">
            <Button variant="default" onClick={cerrar}>Cancelar</Button>
            <Button type="submit" color="brand.6">
                {esEdicion ? 'Guardar Cambios' : 'Crear Carrera'}
            </Button>
        </Group>
      </form>
    </Modal>
  );
};

export default ModalCarrera;