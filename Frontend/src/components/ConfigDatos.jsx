import React from 'react';
import { Group, Text, SimpleGrid, Paper, FileInput, Divider, Grid, TextInput, useMantineColorScheme, Image, ThemeIcon } from '@mantine/core';
import { IconPhoto, IconBuilding, IconUser, IconMapPin, IconPhone, IconWorld, IconUpload } from '@tabler/icons-react';

const ConfigDatos = ({ 
    form, 
    logoIzqPreview, 
    logoDerPreview, 
    handleFileChange, 
    setFileIzq, 
    setLogoIzqPreview, 
    setFileDer, 
    setLogoDerPreview 
}) => {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  const paperStyle = {
      backgroundColor: isDark ? 'var(--mantine-color-dark-6)' : 'var(--mantine-color-gray-0)',
      borderColor: isDark ? 'var(--mantine-color-dark-4)' : 'var(--mantine-color-gray-3)',
      transition: 'all 0.2s ease'
  };

  const imageBoxStyle = {
    width: 80, 
    height: 80, 
    border: `1px dashed ${isDark ? '#555' : '#ccc'}`, 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : 'white',
    borderRadius: 8,
    overflow: 'hidden'
  };

  return (
    <>
        {/* SECCIÓN LOGOTIPOS */}
        <Group mb="md">
            <ThemeIcon variant="light" color="blue" size="md" radius="md">
                <IconPhoto size={18} />
            </ThemeIcon>
            <Text fw={700} size="sm" tt="uppercase" c="dimmed">Identidad Visual</Text>
        </Group>

        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg" mb="xl">
            {/* LOGO IZQUIERDO */}
            <Paper withBorder p="md" radius="md" style={paperStyle}>
                <Text size="xs" fw={700} mb="xs" c={isDark ? 'white' : 'dark'}>LOGO IZQUIERDO</Text>
                <Group>
                    <div style={imageBoxStyle}>
                        {logoIzqPreview ? (
                            <Image src={logoIzqPreview} w="100%" h="100%" fit="contain" />
                        ) : (
                            <IconPhoto size={24} color="gray" style={{ opacity: 0.5 }} />
                        )}
                    </div>
                    <FileInput 
                        placeholder="Cambiar imagen..." 
                        accept="image/png,image/jpeg" 
                        style={{ flex: 1 }} 
                        size="xs"
                        leftSection={<IconUpload size={14}/>}
                        onChange={(file) => handleFileChange(file, setFileIzq, setLogoIzqPreview)} 
                    />
                </Group>
            </Paper>

            {/* LOGO DERECHO */}
            <Paper withBorder p="md" radius="md" style={paperStyle}>
                <Text size="xs" fw={700} mb="xs" c={isDark ? 'white' : 'dark'}>LOGO DERECHO</Text>
                <Group>
                    <div style={imageBoxStyle}>
                        {logoDerPreview ? (
                            <Image src={logoDerPreview} w="100%" h="100%" fit="contain" />
                        ) : (
                            <IconPhoto size={24} color="gray" style={{ opacity: 0.5 }} />
                        )}
                    </div>
                    <FileInput 
                        placeholder="Cambiar imagen..." 
                        accept="image/png,image/jpeg" 
                        style={{ flex: 1 }} 
                        size="xs"
                        leftSection={<IconUpload size={14}/>}
                        onChange={(file) => handleFileChange(file, setFileDer, setLogoDerPreview)} 
                    />
                </Group>
            </Paper>
        </SimpleGrid>

        <Divider my="xl" />

        {/* SECCIÓN DATOS DE TEXTO */}
        <Group mb="md">
            <ThemeIcon variant="light" color="orange" size="md" radius="md">
                <IconBuilding size={18} />
            </ThemeIcon>
            <Text fw={700} size="sm" tt="uppercase" c="dimmed">Encabezado del Documento</Text>
        </Group>
        
        <Grid gutter="md">
            <Grid.Col span={12}>
                <TextInput 
                    label="Nombre de la Institución" 
                    placeholder="Ej: UNIVERSIDAD AUTÓNOMA DE SINALOA" 
                    {...form.getInputProps('nombre_institucion')} 
                />
            </Grid.Col>
            <Grid.Col span={12}>
                <TextInput 
                    label="Nombre de la Facultad / Escuela" 
                    placeholder="Ej: FACULTAD DE INGENIERÍA" 
                    {...form.getInputProps('nombre_facultad')} 
                />
            </Grid.Col>
        </Grid>

        <Divider my="xl" variant="dashed" />

        <Group mb="md">
            <ThemeIcon variant="light" color="teal" size="md" radius="md">
                <IconUser size={18} />
            </ThemeIcon>
            <Text fw={700} size="sm" tt="uppercase" c="dimmed">Firma del Responsable</Text>
        </Group>

        <Grid gutter="md">
            <Grid.Col span={6}>
                <TextInput 
                    label="Nombre del responsable" 
                    placeholder="Nombre completo con grado" 
                    {...form.getInputProps('nombre_coordinador')} 
                />
            </Grid.Col>
            <Grid.Col span={6}>
                <TextInput 
                    label="Cargo Oficial" 
                    placeholder="Ej: Coordinador de Carrera" 
                    {...form.getInputProps('cargo_coordinador')} 
                />
            </Grid.Col>
        </Grid>

        <Divider my="xl" variant="dashed" />

        <Group mb="md">
            <ThemeIcon variant="light" color="grape" size="md" radius="md">
                <IconMapPin size={18} />
            </ThemeIcon>
            <Text fw={700} size="sm" tt="uppercase" c="dimmed">Pie de Página</Text>
        </Group>

        <Grid gutter="md">
            <Grid.Col span={12}>
                <TextInput 
                    label="Dirección Completa" 
                    placeholder="Calle, Número, Colonia, CP, Ciudad" 
                    {...form.getInputProps('direccion_facultad')} 
                />
            </Grid.Col>
            <Grid.Col span={6}>
                <TextInput 
                    label="Teléfonos de Contacto" 
                    leftSection={<IconPhone size={16} />} 
                    {...form.getInputProps('telefonos_contacto')} 
                />
            </Grid.Col>
            <Grid.Col span={6}>
                <TextInput 
                    label="Sitio Web / Correo" 
                    leftSection={<IconWorld size={16} />} 
                    {...form.getInputProps('pagina_web')} 
                />
            </Grid.Col>
        </Grid>
    </>
  );
};

export default ConfigDatos;