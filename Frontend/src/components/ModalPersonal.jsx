import React, { useEffect } from 'react';
import { Modal, Text, Grid, TextInput, Autocomplete, Group, Button, Tooltip } from '@mantine/core';
import { IconId, IconInfoCircle } from '@tabler/icons-react';

const ModalPersonal = ({ abierto, cerrar, esEdicion, form, alGuardar }) => {
  useEffect(() => {
    if (esEdicion && abierto && form.values.nombre_completo) {
        const partes = form.values.nombre_completo.split(' ');
        if (partes.length >= 3 && !form.values.paterno) {
            const mat = partes.pop();
            const pat = partes.pop();
            const nom = partes.join(' ');
            form.setValues({
                nombres: nom,
                paterno: pat,
                materno: mat,
                nombre_completo: undefined // Limpiamos 
            });
        } else if (partes.length === 2 && !form.values.paterno) {
             const pat = partes.pop();
             const nom = partes.pop();
             form.setValues({ nombres: nom, paterno: pat, materno: '' });
        }
    }
  }, [esEdicion, abierto]);

  return (
    <Modal 
      opened={abierto} 
      onClose={cerrar} 
      title={<Text fw={700} c="brand.9" size="lg">{esEdicion ? 'Editar Profesor' : 'Nuevo Profesor'}</Text>} 
      centered
      size="lg"
      overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
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
                    disabled={esEdicion}
                    value={form.values.no_empleado}
                    onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        if (val.length <= 6) form.setFieldValue('no_empleado', val);
                    }}
                    error={form.errors.no_empleado}
                    rightSection={esEdicion && (
                        <Tooltip label="ID único no editable.">
                             <IconInfoCircle size={16} color="gray" style={{cursor: 'help'}}/>
                        </Tooltip>
                    )}
                />
            </Grid.Col>
            
            <Grid.Col span={4}>
                <Autocomplete 
                    label="Título"
                    placeholder="Ej: Dr."
                    data={['Dr.', 'Dra.', 'M.C.', 'Ing.', 'Lic.', 'M.I.A']}
                    required
                    {...form.getInputProps('nombramiento')}
                />
            </Grid.Col>
        </Grid>

        <TextInput
            label="Nombre(s)"
            placeholder="Ej: Juan Carlos"
            required
            mt="md"
            data-autofocus
            {...form.getInputProps('nombres')}
        />

        <Grid mt="sm">
            <Grid.Col span={6}>
                <TextInput 
                    label="Apellido Paterno" 
                    placeholder="Ej: Pérez" 
                    required 
                    {...form.getInputProps('paterno')}
                />
            </Grid.Col>
            <Grid.Col span={6}>
                <TextInput 
                    label="Apellido Materno" 
                    placeholder="Ej: López" 
                    {...form.getInputProps('materno')}
                />
            </Grid.Col>
        </Grid>

        <Group justify="flex-end" mt="xl">
            <Button variant="default" onClick={cerrar}>Cancelar</Button>
            <Button type="submit" color="brand.6">
                {esEdicion ? 'Guardar Cambios' : 'Registrar'}
            </Button>
        </Group>
      </form>
    </Modal>
  );
};

export default ModalPersonal;