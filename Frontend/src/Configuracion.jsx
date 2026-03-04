import React, { useEffect, useState } from 'react';
import { Container, Tabs, Text, Button, Paper, Title, Group, LoadingOverlay, Breadcrumbs, Anchor, Grid, Divider, Badge } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconDeviceFloppy, IconChevronRight, IconBuildingArch, IconFileText, IconDatabase, IconSettings 
} from '@tabler/icons-react';
import { Link } from 'react-router-dom'; 

import clienteAxios, { IMAGEN_URL } from './api';
import ConfigDatos from './components/ConfigDatos'; 
import ConfigPlantillas from './components/ConfigPlantillas'; 
import GestionCatalogos from './components/GestionCatalogos'; 

function Configuracion() {
  const [cargando, setCargando] = useState(false);
  const [activeTab, setActiveTab] = useState('catalogos');
  
  const [fileIzq, setFileIzq] = useState(null);
  const [logoIzqPreview, setLogoIzqPreview] = useState(null);
  const [fileDer, setFileDer] = useState(null);
  const [logoDerPreview, setLogoDerPreview] = useState(null);

  const form = useForm({
    initialValues: {
      nombre_institucion: '', nombre_facultad: '',
      nombre_coordinador: '', cargo_coordinador: '',
      direccion_facultad: '', telefonos_contacto: '', pagina_web: '',
      texto_asunto: '', lugar_expedicion: '',
      texto_parrafo_1: '', texto_parrafo_2: '', texto_despedida: '',
      lema_universitario: '', ccp_1: '', ccp_2: '',
      logo_izq_url: '', logo_der_url: '' 
    },
  });

  useEffect(() => {
    const cargarConfig = async () => {
        setCargando(true);
        try {
            const res = await clienteAxios.get('/admin/config');
            if (res.data) {
                form.setValues(res.data);
                if (res.data.logo_izq_url) setLogoIzqPreview(`${IMAGEN_URL}${res.data.logo_izq_url}`);
                if (res.data.logo_der_url) setLogoDerPreview(`${IMAGEN_URL}${res.data.logo_der_url}`);
            }
        } catch (error) { console.error(error); } 
        finally { setCargando(false); }
    };
    cargarConfig();
  }, []);

  const handleFileChange = (file, setFileState, setPreviewState) => {
    setFileState(file);
    if (file) {
        const objectUrl = URL.createObjectURL(file);
        setPreviewState(objectUrl);
    } else {
        setPreviewState(null);
    }
  };

  const guardarTodo = async (values) => {
    setCargando(true);
    try {
        let nuevosValores = { ...values };

        if (fileIzq) {
            const formData = new FormData();
            formData.append('imagen', fileIzq);
            const res = await clienteAxios.post('/admin/upload', formData);
            nuevosValores.logo_izq_url = res.data.url;
        }
        if (fileDer) {
            const formData = new FormData();
            formData.append('imagen', fileDer);
            const res = await clienteAxios.post('/admin/upload', formData);
            nuevosValores.logo_der_url = res.data.url;
        }

        await clienteAxios.post('/admin/config', nuevosValores);
        form.setValues(nuevosValores);
        notifications.show({ title: 'Guardado', message: 'Configuración actualizada', color: 'green' });

    } catch (error) {
        notifications.show({ title: 'Error', message: 'No se pudo guardar', color: 'red' });
    } finally {
        setCargando(false);
    }
  };

  const getTituloSeccion = () => {
      if (activeTab === 'catalogos') return 'Catálogos del Sistema';
      if (activeTab === 'datos') return 'Datos Institucionales';
      if (activeTab === 'plantillas') return 'Plantillas de Oficios'; 
      return 'Configuración';
  };

  return (
    <Container size="xl" py="xl">
        <Breadcrumbs separator={<IconChevronRight size={14} />} mb="md" mt="xs">
            <Anchor component={Link} to="/" size="sm" c="dimmed">Inicio</Anchor>
            <Text size="sm" c="brand.7">Panel de Control</Text>
        </Breadcrumbs>
        
        <Grid gutter="xl">
            <Grid.Col span={{ base: 12, md: 3 }}>
                <Paper p="md" radius="md" withBorder>
                    <Group mb="md">
                        <IconSettings size={22} color="var(--mantine-color-brand-6)" />
                        <Text fw={700} size="lg">Panel</Text>
                    </Group>
                    
                    <Tabs value={activeTab} onChange={setActiveTab} orientation="vertical" variant="pills" color="brand">
                        <Tabs.List style={{ width: '100%' }}>
                            <Text size="xs" fw={700} c="dimmed" mb={5} tt="uppercase">Sistema</Text>
                            <Tabs.Tab value="catalogos" leftSection={<IconDatabase size={18}/>} mb="lg">
                                Catálogos Globales
                            </Tabs.Tab>

                            <Divider mb="sm" />

                            <Text size="xs" fw={700} c="dimmed" mt="xs" mb={5} tt="uppercase">Documentación</Text>
                            <Tabs.Tab value="datos" leftSection={<IconBuildingArch size={18}/>} mb={5}>
                                Datos Institucionales
                            </Tabs.Tab>
                            {/* CAMBIO DE NOMBRE DE LA PESTAÑA */}
                            <Tabs.Tab value="plantillas" leftSection={<IconFileText size={18}/>}>
                                Plantillas de Oficios
                            </Tabs.Tab>
                        </Tabs.List>
                    </Tabs>
                </Paper>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 9 }}>
                <Paper p="xl" radius="md" withBorder pos="relative" style={{ borderTop: '4px solid var(--mantine-color-brand-6)', minHeight: 500 }}>
                    <LoadingOverlay visible={cargando} overlayProps={{ blur: 2 }} />
                    
                    <Group justify="space-between" mb="xl" align="flex-start">
                        <div>
                            <Title order={2} c="brand.9">{getTituloSeccion()}</Title>
                            {activeTab === 'plantillas' && <Badge variant="light" color="blue" mt={5}>Selección de Formato</Badge>}
                        </div>
                        
                        {activeTab !== 'catalogos' && (
                            <Button 
                                leftSection={<IconDeviceFloppy size={20}/>} 
                                color="brand.6" 
                                size="md"
                                onClick={form.onSubmit(guardarTodo)}
                                style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            >
                                Guardar Cambios
                            </Button>
                        )}
                    </Group>

                    <Divider mb="xl" />

                    <div style={{ animation: 'fade-in 0.3s ease' }}>
                        {activeTab === 'catalogos' && <GestionCatalogos />}
                        
                        {activeTab === 'datos' && (
                            <ConfigDatos 
                                form={form} 
                                logoIzqPreview={logoIzqPreview} 
                                logoDerPreview={logoDerPreview}
                                handleFileChange={handleFileChange}
                                setFileIzq={setFileIzq}
                                setLogoIzqPreview={setLogoIzqPreview}
                                setFileDer={setFileDer}
                                setLogoDerPreview={setLogoDerPreview}
                            />
                        )}

                        {activeTab === 'plantillas' && (
                            <ConfigPlantillas form={form} />
                        )}
                    </div>
                </Paper>
            </Grid.Col>
        </Grid>
    </Container>
  );
}

export default Configuracion;