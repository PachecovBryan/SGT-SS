import React from 'react';
import { Modal, Text, Grid, TextInput, Group, Select, Button, Tooltip, ActionIcon, Textarea, Divider, LoadingOverlay } from '@mantine/core';
import { IconSchool, IconUserPlus, IconCalendarEvent, IconId, IconBook, IconFileDescription, IconInfoCircle } from '@tabler/icons-react';

const ModalAlumno = ({ opened, close, isEditing, form, guardarDatos, carrerasData, estatusData, personalData, abrirModalProfe }) => {
  
  // Validar Solo Números (Para No. Cuenta)
  const handleNumericChange = (e, field) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    form.setFieldValue(field, val);
  };

  // Validar Solo Letras (Nombres y Apellidos)
  const handleTextChange = (e, field) => {
    const val = e.target.value;
    if (/^[a-zA-ZñÑáéíóúÁÉÍÓÚüÜ\s]*$/.test(val)) {
        form.setFieldValue(field, val);
    }
  };

  return (
    <Modal 
      opened={opened} 
      onClose={close} 
      title={<Text fw={700} c="brand.9" size="lg">{isEditing ? 'Editar Expediente' : 'Nuevo Expediente'}</Text>} 
      size="xl" 
      centered 
      overlayProps={{ backgroundOpacity: 0.55, blur: 3 }} 
      styles={{ content: { borderTop: '5px solid var(--mantine-color-brand-6)' } }}
    >
      <LoadingOverlay visible={false} overlayProps={{ radius: "sm", blur: 2 }} />
      
      <form onSubmit={form.onSubmit(guardarDatos)}>
        
        <Group mb="xs" gap="xs">
            <IconId size={16} color="gray" />
            <Text size="xs" fw={700} c="dimmed" tt="uppercase">Identificación</Text>
        </Group>
        
        <Grid>
            <Grid.Col span={{ base: 12, sm: 4 }}>
                <TextInput 
                    label="No. Cuenta" 
                    placeholder="8 Dígitos" 
                    required 
                    {...form.getInputProps('no_cuenta')}
                    onChange={(e) => handleNumericChange(e, 'no_cuenta')}
                    maxLength={8}
                    rightSection={isEditing && (
                        <Tooltip label="El ID es único y no se recomienda cambiarlo.">
                            <IconInfoCircle size={16} color="orange" style={{ cursor: 'help' }}/>
                        </Tooltip>
                    )}
                />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 4 }}>
                <TextInput 
                    label="Apellido Paterno" 
                    required 
                    {...form.getInputProps('paterno')}
                    value={form.values.paterno || ''} 
                    onChange={(e) => handleTextChange(e, 'paterno')}
                />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 4 }}>
                <TextInput 
                    label="Apellido Materno" 
                    required 
                    {...form.getInputProps('materno')}
                    value={form.values.materno || ''}
                    onChange={(e) => handleTextChange(e, 'materno')}
                />
            </Grid.Col>
            <Grid.Col span={12}>
                <TextInput 
                    label="Nombre(s)" 
                    required 
                    {...form.getInputProps('nombres')}
                    value={form.values.nombres || ''} 
                    onChange={(e) => handleTextChange(e, 'nombres')}
                />
            </Grid.Col>
        </Grid>
        
        <Divider my="md" variant="dashed" />

        <Grid>
            <Grid.Col span={{ base: 12, sm: 6 }}>
                <Select 
                    label="Carrera" 
                    placeholder="Seleccione..." 
                    data={carrerasData} 
                    searchable 
                    required 
                    {...form.getInputProps('carrera_clave')} 
                />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 3 }}>
                <Select 
                    label="Estatus" 
                    placeholder="Seleccione..." 
                    data={estatusData} 
                    required 
                    {...form.getInputProps('estatus_id')} 
                />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 3 }}>
                <TextInput 
                    label="Fecha Aceptación" 
                    type="date"
                    required
                    leftSection={<IconCalendarEvent size={16} />}
                    max={new Date().toISOString().split('T')[0]} 
                    {...form.getInputProps('fecha_aceptacion')}
                    value={form.values.fecha_aceptacion ? new Date(form.values.fecha_aceptacion).toISOString().split('T')[0] : ''}
                    onChange={(e) => {
                        const date = e.target.value ? new Date(e.target.value + 'T12:00:00') : null;
                        form.setFieldValue('fecha_aceptacion', date);
                    }}
                />
            </Grid.Col>
        </Grid>
        
        <Divider my="md" variant="dashed" />

        <Group mb="xs" gap="xs">
            <IconBook size={16} color="gray" />
            <Text size="xs" fw={700} c="dimmed" tt="uppercase">Proyecto de Tesis</Text>
        </Group>

        <Group align="flex-end" mb="sm" grow>
            <div style={{ flexGrow: 10 }}>
                <Select 
                    label="Director de Tesis" 
                    placeholder="Buscar profesor..." 
                    data={personalData} 
                    searchable 
                    clearable 
                    leftSection={<IconSchool size={16} />} 
                    nothingFoundMessage="No encontrado." 
                    {...form.getInputProps('director_id')} 
                />
            </div>
            <Tooltip label="Registrar nuevo profesor">
                <ActionIcon size={36} variant="light" color="brand" onClick={abrirModalProfe} mb={1}><IconUserPlus size={20} /></ActionIcon>
            </Tooltip>
        </Group>

        <Grid align="flex-start">
            <Grid.Col span={{ base: 12, sm: 4 }}>
                <TextInput
                    label="Folio de Tesis"
                    placeholder={!isEditing ? "(Automático)" : ""}
                    {...form.getInputProps('folio_tesis')}
                    readOnly={isEditing}
                    disabled={!isEditing}
                    variant={!isEditing ? 'filled' : 'default'}
                />
                {!isEditing && (
                    <Text c="dimmed" size="xs" mt={4} lh={1.2}>* Se generará al guardar.</Text>
                )}
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 8 }}>
                <TextInput 
                    label="Tema de Tesis" 
                    placeholder="Título completo" 
                    {...form.getInputProps('tema_tesis')} 
                />
            </Grid.Col>
        </Grid>

        <Textarea 
            mt="md"
            label="Observaciones" 
            placeholder="Notas internas" 
            autosize minRows={2} maxRows={4} 
            leftSection={<IconFileDescription size={16} style={{ marginTop: 6 }} />} 
            {...form.getInputProps('observaciones')} 
        />
        <Group justify="flex-end" mt="xl">
            <Button variant="default" onClick={close}>Cancelar</Button>
            <Button type="submit" color="brand.6">Guardar Expediente</Button>
        </Group>
      </form>
    </Modal>
  );
};

export default ModalAlumno;