import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import clienteAxios from './api';
import { Paper, Text, Avatar, Group, Button, Stack, Title, Grid, PasswordInput, Container, ThemeIcon, TextInput, useMantineColorScheme, Anchor, Breadcrumbs
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { Link } from 'react-router-dom';
import { IconUser, IconCheck, IconId, IconDeviceFloppy, IconX, IconChevronRight } from '@tabler/icons-react';

function Perfil() {
  const { user, actualizarUsuario } = useAuth(); 
  const { colorScheme } = useMantineColorScheme();

  const formularioPassword = useForm({
    initialValues: { actualPassword: '', nuevaPassword: '', confirmarPassword: '' },
    validate: {
        actualPassword: (valor) => (valor.length < 1 ? 'Requerido' : null),
        nuevaPassword: (valor) => (valor.length < 6 ? 'Mínimo 6 caracteres' : null),
        confirmarPassword: (valor, valores) => (valor !== valores.nuevaPassword ? 'No coinciden' : null),
    }
  });

  const formularioDatos = useForm({
    initialValues: { nombre_completo: user?.nombre || '', correo: user?.correo || '' },
    validate: {
        correo: (valor) => (/^\S+@\S+$/.test(valor) ? null : 'Correo inválido'),
        nombre_completo: (valor) => (valor.length < 3 ? 'Nombre muy corto' : null),
    }
  });

  useEffect(() => {
    if (user) {
        formularioDatos.setValues({
            nombre_completo: user.nombre || '',
            correo: user.correo || ''
        });
    }
  }, [user]); 

  const actualizarContrasena = async (datos) => {
    try {
        const payload = {
            currentPassword: datos.actualPassword,
            newPassword: datos.nuevaPassword
        };
        await clienteAxios.post('/profile/change-password', payload);
        notifications.show({ title: 'Seguridad', message: 'Tu contraseña ha sido actualizada.', color: 'green', icon: <IconCheck size={18}/> });
        formularioPassword.reset();
    } catch (error) {
        notifications.show({ title: 'Error', message: error.response?.data?.error || 'No se pudo actualizar.', color: 'red', icon: <IconX size={18}/> });
    }
  };

  const guardarInformacion = async (datos) => {
    try {
        const payload = {
            nombre_completo: datos.nombre_completo,
            correo: datos.correo,
            rol_id: user.rol_id, 
        };
        await clienteAxios.put(`/usuarios/${user.no_empleado}`, payload);

        actualizarUsuario({
            nombre: datos.nombre_completo,
            correo: datos.correo
        });
        notifications.show({ title: 'Actualizado', message: 'Tus datos se actualizaron correctamente.', color: 'green', icon: <IconCheck size={18}/> });
    } catch (error) {
        notifications.show({ title: 'Error', message: error.response?.data?.error || 'Hubo un problema al actualizar.', color: 'red', icon: <IconX size={18}/> });
    }
  };

  if (!user) return null;

  return (
    <Container size="lg" py="xl">
      <Breadcrumbs separator={<IconChevronRight size={14} />} mb="md" mt="xs">
          <Anchor component={Link} to="/" size="sm" c="dimmed">Inicio</Anchor>
          <Text size="sm" c="brand.7">Mi Perfil</Text>
      </Breadcrumbs>

      <Paper shadow="sm" radius="md" p="xl" withBorder style={{ borderTop: '4px solid var(--mantine-color-brand-6)' }}>
          <Grid gutter="xl">
            {/* COLUMNA IZQUIERDA*/}
            <Grid.Col span={{ base: 12, md: 4 }}>
                <Paper withBorder p="xl" radius="md" bg="var(--mantine-color-body)" style={{ textAlign: 'center' }}>
                    <Avatar size={120} radius={120} mx="auto" color="brand" variant="filled">
                        <Text size="xl" fz={40}>{user.nombre?.charAt(0)}</Text>
                    </Avatar>
                    <Text ta="center" fz="lg" fw={700} mt="md">{user.nombre}</Text>
                    <Text ta="center" c="dimmed" fz="sm">{user.rol}</Text>

                    <Group mt="md" justify="center" gap={30}>
                        <Stack gap={0} align="center">
                            <ThemeIcon variant="light" size="lg" radius="xl" color="blue"><IconId /></ThemeIcon>
                            <Text size="xs" c="dimmed" mt={5}>NO. EMPLEADO</Text>
                            <Text fw={600}>{user.no_empleado || user.userId || 'N/A'}</Text>
                        </Stack>
                    </Group>
                </Paper>
            </Grid.Col>

            {/* COLUMNA DERECHA */}
            <Grid.Col span={{ base: 12, md: 8 }}>
                <Stack gap="lg">
                    <Paper withBorder p="lg" radius="md" bg="var(--mantine-color-body)">
                        <Group mb="md">
                            <ThemeIcon variant="light" color="brand"><IconUser size={20}/></ThemeIcon>
                            <Text size="lg" fw={700}>Datos Personales</Text>
                        </Group>

                        <form onSubmit={formularioDatos.onSubmit(guardarInformacion)}>
                            <Grid>
                                <Grid.Col span={6}>
                                    <TextInput label="Nombre Completo" required {...formularioDatos.getInputProps('nombre_completo')} />
                                </Grid.Col>
                                <Grid.Col span={6}>
                                    <TextInput label="Correo Electrónico" required {...formularioDatos.getInputProps('correo')} />
                                </Grid.Col>
                            </Grid>
                            
                            <Group justify="flex-end" mt="md">
                                <Button type="submit" leftSection={<IconDeviceFloppy size={18}/>} color="brand.6">Guardar Información</Button>
                            </Group>
                        </form>
                    </Paper>
                    
                    {/* SEGURIDAD */}
                    <Paper withBorder p="lg" radius="md" bg="var(--mantine-color-body)">
                        <Text size="lg" fw={700} mb="md">Seguridad</Text>
                        <form onSubmit={formularioPassword.onSubmit(actualizarContrasena)}>
                            <Stack>
                                <PasswordInput label="Contraseña Actual" description="Necesaria para confirmar cambios" required {...formularioPassword.getInputProps('actualPassword')} />
                                <Group grow>
                                    <PasswordInput label="Nueva Contraseña" placeholder="Mínimo 6 caracteres" required {...formularioPassword.getInputProps('nuevaPassword')} />
                                    <PasswordInput label="Confirmar Nueva" placeholder="Repetir contraseña" required {...formularioPassword.getInputProps('confirmarPassword')} />
                                </Group>
                                <Group justify="flex-end" mt="md">
                                    <Button type="submit" variant="outline" color="brand.6">Actualizar Contraseña</Button>
                                </Group>
                            </Stack>
                        </form>
                    </Paper>
                </Stack>
            </Grid.Col>
          </Grid>
      </Paper>
    </Container>
  );
}

export default Perfil;