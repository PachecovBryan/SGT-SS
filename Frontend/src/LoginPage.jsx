import React, { useState } from 'react'; 
import clienteAxios from './api';
import { useForm } from '@mantine/form';
import { useAuth } from './AuthContext';
import { TextInput, Button, Container, Title, Text, Stack, Alert, PasswordInput, Paper, Center, useMantineTheme, useMantineColorScheme
} from '@mantine/core';
import { IconAlertCircle, IconLock, IconMail } from '@tabler/icons-react';

function LoginPage() {
  const [error, setError] = useState(null);
  const [loading, setCargando] = useState(false); 
  const { login } = useAuth();
  
  const { colorScheme } = useMantineColorScheme(); 
  const theme = useMantineTheme();
  
  const isDark = colorScheme === 'dark';
  const bgColor = isDark ? theme.colors.dark[8] : theme.colors.gray[1];
  const cardBg = isDark ? theme.colors.dark[6] : 'white';

  const form = useForm({
    initialValues: { correo: '', password: '' },
    validate: {
      correo: (value) => (/^\S+@\S+$/.test(value) ? null : 'Correo inválido'),
      password: (value) => (value.length < 1 ? 'Ingresa tu contraseña' : null),
    },
  });

  const handleLogin = async (values) => {
    setError(null);
    setCargando(true);
    try {
      const res = await clienteAxios.post('/login', values);
      
      const { usuario, token } = res.data;
      login(usuario, token); 

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Credenciales incorrectas o error de servidor.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{ 
        minHeight: '100vh', 
        backgroundColor: bgColor, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        transition: 'background-color 0.3s ease' 
    }}>
      <Container size={420} style={{ width: '100%' }}>
        
        <Stack align="center" mb={30} gap="xs">
            <img src="/logo.png" alt="Logo" style={{ width: 120, height: 'auto', marginBottom: 10 }} />
            <Title order={2} c="brand.9" style={{ fontWeight: 950 }}>SGT</Title>
            <Text c="dimmed" size="sm" fw={700}>Sistema Gestor de Titulación</Text>
        </Stack>

        <Paper 
            withBorder shadow="xl" p={40} radius="md" 
            style={{ 
                backgroundColor: cardBg, 
                borderTop: '5px solid var(--mantine-color-brand-9)' 
            }}
        >
          <form onSubmit={form.onSubmit(handleLogin)}>
            <Stack gap="md">
              <TextInput
                label="Correo" 
                leftSection={<IconMail size={18} stroke={1.5}/>} 
                radius="md" 
                required 
                placeholder="ejemplo@uas.edu.mx"
                {...form.getInputProps('correo')} 
              />
              
              <PasswordInput 
                label="Contraseña" 
                leftSection={<IconLock size={18} stroke={1.5}/>} 
                radius="md" 
                required 
                placeholder="......."
                {...form.getInputProps('password')} 
              />
              
              {error && (
                <Alert icon={<IconAlertCircle size="1rem"/>} title="Error" color="red" variant="light">
                    {error}
                </Alert>
              )}
              
              <Button 
                type="submit" 
                fullWidth 
                size="md" 
                mt="md" 
                color="brand.9"
                loading={loading} 
              >
                Iniciar Sesión
              </Button>
            </Stack>
          </form>
          
          <Center mt={30}>
            <Text size="xs" c="dimmed">
              ¿Olvidaste tu contraseña? Contacte a la Administración
            </Text>
          </Center>
        </Paper>
        
        <Text align="center" size="xs" c="dimmed" mt={20}>
          © 2025 Universidad Autónoma de Sinaloa
        </Text>
      </Container>
    </div>
  );
}

export default LoginPage;