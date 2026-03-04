import React from 'react';
import { Modal, Text, Autocomplete, TextInput, Button, Grid } from '@mantine/core';
import { IconId } from '@tabler/icons-react';

const ModalDirectorRapido = ({ abierto, cerrar, form, alGuardar }) => {
  
  // Solo Números y Max 6 caracteres
  const handleNumericChange = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    if (val.length <= 6) form.setFieldValue('no_empleado', val);
  };

  //  Solo Texto (Nombres y Apellidos)
  const handleTextChange = (e, field) => {
    const val = e.target.value;
    if (/^[a-zA-ZñÑáéíóúÁÉÍÓÚüÜ\s]*$/.test(val)) {
        form.setFieldValue(field, val);
    }
  };

  return (
    <Modal 
      opened={abierto} 
      onClose={cerrar} 
      title={<Text fw={700} c="brand.9" size="lg">Registrar Director</Text>} 
      centered 
      zIndex={201} 
      size="lg"
      styles={{ content: { borderTop: '5px solid var(--mantine-color-brand-6)' } }}
    >
      <form onSubmit={form.onSubmit(alGuardar)}>
        <Grid align="flex-end">
            <Grid.Col span={4}>
                <TextInput 
                    label="No. Empleado" 
                    placeholder="6 Dígitos"
                    leftSection={<IconId size={16}/>} 
                    required 
                    {...form.getInputProps('no_empleado')} 
                    onChange={handleNumericChange}
                />
            </Grid.Col>
            
            <Grid.Col span={8}>
                <Autocomplete 
                    label="Título" 
                    placeholder="Ej: Dr." 
                    data={['Dr.', 'Dra.', 'M.C.', 'Ing.', 'Lic.']} 
                    required 
                    {...form.getInputProps('nombramiento')} 
                />
            </Grid.Col>
            
            <Grid.Col span={12}>
                <TextInput 
                    label="Nombre(s)" 
                    placeholder="Ej: Juan Carlos" 
                    required 
                    mt="xs"
                    {...form.getInputProps('nombres')} 
                    onChange={(e) => handleTextChange(e, 'nombres')}
                />
            </Grid.Col>

            <Grid.Col span={6}>
                <TextInput 
                    label="Apellido Paterno" 
                    placeholder="Ej: Pérez" 
                    required 
                    {...form.getInputProps('paterno')} 
                    onChange={(e) => handleTextChange(e, 'paterno')}
                />
            </Grid.Col>
            <Grid.Col span={6}>
                <TextInput 
                    label="Apellido Materno" 
                    placeholder="Ej: López" 
                    {...form.getInputProps('materno')} 
                    onChange={(e) => handleTextChange(e, 'materno')}
                />
            </Grid.Col>
        </Grid>

        <Button fullWidth mt="xl" type="submit" color="brand.6">Guardar y Seleccionar</Button>
      </form>
    </Modal>
  );
};

export default ModalDirectorRapido;