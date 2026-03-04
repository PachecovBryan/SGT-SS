import React, { useEffect } from 'react';
import { Modal, Text, Grid, TextInput, Select, PasswordInput, Group, Button, Divider, Tooltip } from '@mantine/core';
import { IconId, IconMail, IconShieldLock, IconLock, IconInfoCircle } from '@tabler/icons-react';

const ModalUsuario = ({ 
  abierto, 
  cerrar, 
  esEdicion, 
  form, 
  alGuardar, 
  catalogoRoles 
}) => {
    
  const passwordsCoinciden = form.values.password === form.values.confirmPassword;
  const mostrarErrorPass = form.values.confirmPassword && !passwordsCoinciden;

  useEffect(() => {
    if (esEdicion && abierto && form.values.nombre_completo) {
        const partes = form.values.nombre_completo.split(' ');
        if (partes.length >= 2 && !form.values.paterno) {
            let mat = '';
            let pat = '';
            let nom = '';

            if (partes.length >= 3) {
                mat = partes.pop();
                pat = partes.pop();
                nom = partes.join(' ');
            } else {
                pat = partes.pop();
                nom = partes.pop();
            }

            form.setValues({
                nombres: nom,
                paterno: pat,
                materno: mat,
                nombre_completo: undefined 
            });
        }
    }
  }, [esEdicion, abierto]);

  return (
    <Modal 
      opened={abierto} 
      onClose={cerrar} 
      title={<Text fw={700} c="brand.9" size="lg">{esEdicion ? 'Editar Acceso' : 'Nuevo Usuario'}</Text>} 
      size="lg" 
      centered
      overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
      styles={{ content: { borderTop: '5px solid var(--mantine-color-brand-6)' } }}
    >
      <form onSubmit={form.onSubmit(alGuardar)}>
          
          <Divider label="Información Personal" labelPosition="left" mb="md" />
          
          <Grid>
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
                      rightSection={esEdicion && (
                        <Tooltip label="ID único no editable.">
                            <IconInfoCircle size={16} color="gray" style={{cursor: 'help'}}/>
                        </Tooltip>
                      )}
                      error={form.errors.no_empleado}
                  />
              </Grid.Col>
              
              {/* NOMBRES SEPARADOS */}
              <Grid.Col span={8}>
                  <TextInput 
                      label="Nombre(s)" 
                      placeholder="Ej: María" 
                      required 
                      data-autofocus
                      {...form.getInputProps('nombres')} 
                  />
              </Grid.Col>
          </Grid>

          <Grid mt="sm">
              <Grid.Col span={6}>
                  <TextInput 
                      label="Apellido Paterno" 
                      placeholder="Ej: González" 
                      required 
                      {...form.getInputProps('paterno')} 
                  />
              </Grid.Col>
              <Grid.Col span={6}>
                  <TextInput 
                      label="Apellido Materno" 
                      placeholder="Ej: Ruiz" 
                      {...form.getInputProps('materno')} 
                  />
              </Grid.Col>
          </Grid>

          <Divider label="Credenciales de Acceso" labelPosition="left" my="md" />
          
          <Grid>
              <Grid.Col span={6}>
                  <TextInput 
                      label="Correo Electrónico" 
                      placeholder="usuario@uas.edu.mx" 
                      leftSection={<IconMail size={16}/>}
                      required 
                      {...form.getInputProps('correo')} 
                  />
              </Grid.Col>
              <Grid.Col span={6}>
                  <Select 
                      label="Rol de Acceso" 
                      placeholder="Selecciona..." 
                      data={catalogoRoles} 
                      leftSection={<IconShieldLock size={16}/>}
                      required
                      {...form.getInputProps('rol_id')}
                  />
              </Grid.Col>
              <Grid.Col span={6}>
                  <PasswordInput 
                      label={esEdicion ? "Nueva Contraseña (Opcional)" : "Contraseña"} 
                      placeholder={esEdicion ? "Dejar vacío para mantener" : "Mínimo 6 caracteres"} 
                      leftSection={<IconLock size={16}/>}
                      required={!esEdicion} 
                      {...form.getInputProps('password')} 
                  />
              </Grid.Col>
              <Grid.Col span={6}>
                  <PasswordInput 
                      label="Confirmar Contraseña" 
                      placeholder="Repetir contraseña" 
                      leftSection={<IconLock size={16}/>}
                      required={!esEdicion || form.values.password.length > 0} 
                      {...form.getInputProps('confirmPassword')} 
                      error={mostrarErrorPass ? "Las contraseñas no coinciden" : null}
                      styles={{
                        input: {
                            borderColor: mostrarErrorPass ? 'red' : undefined
                        }
                      }}
                  />
              </Grid.Col>
          </Grid>

          <Group justify="flex-end" mt="xl">
              <Button variant="default" onClick={cerrar}>Cancelar</Button>
              <Button type="submit" color="brand.6" disabled={mostrarErrorPass}>
                  {esEdicion ? 'Guardar Cambios' : 'Crear Cuenta'}
              </Button>
          </Group>
      </form>
    </Modal>
  );
};

export default ModalUsuario;