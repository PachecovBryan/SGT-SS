import React, { useState } from 'react';
import { Grid, TextInput, Textarea, Divider, Text, Paper, NavLink, Group, ScrollArea, Alert, ThemeIcon, useMantineColorScheme } from '@mantine/core';
import { IconFileText, IconChevronRight, IconCheck, IconInfoCircle, IconClick } from '@tabler/icons-react';

// PLANTILLAS
const BIBLIOTECA = [
    {
        id: 'solicitud_revision',
        label: 'Solicitud de Revisión',
        description: 'Oficio inicial para asignar revisores.',
        badge: 'Estándar',
        datos: {
            texto_asunto: 'ASUNTO: SOLICITUD DE REVISIÓN DE TESIS',
            texto_parrafo_1: 'Por medio de la presente, me permito solicitarle la revisión del trabajo de tesis titulado:',
            texto_parrafo_2: 'Lo anterior con la finalidad de continuar con los trámites correspondientes para la obtención del grado.',
            texto_despedida: 'Sin otro particular por el momento, agradezco de antemano su atención.'
        }
    },
    {
        id: 'voto_aprobatorio',
        label: 'Voto Aprobatorio',
        description: 'Documento firmado por el director/asesor.',
        badge: 'Pro',
        datos: {
            texto_asunto: 'ASUNTO: EMISIÓN DE VOTO APROBATORIO',
            texto_parrafo_1: 'Habiendo revisado el trabajo de tesis presentado por el alumno, dictamino que cumple con los requisitos metodológicos y técnicos exigidos.',
            texto_parrafo_2: 'Por lo tanto, emito mi VOTO APROBATORIO para que el sustentante proceda a la defensa de su examen profesional.',
            texto_despedida: 'Atentamente,'
        }
    },
    {
        id: 'liberacion_tesis',
        label: 'Liberación de Tesis',
        description: 'Constancia final de correcciones.',
        badge: null,
        datos: {
            texto_asunto: 'ASUNTO: CONSTANCIA DE LIBERACIÓN DE TESIS',
            texto_parrafo_1: 'Se hace constar que el alumno ha concluido satisfactoriamente las correcciones sugeridas por el comité tutorial.',
            texto_parrafo_2: 'Se autoriza la impresión final del documento y el inicio de los trámites administrativos de titulación.',
            texto_despedida: 'Agradeciendo su apoyo institucional, quedo a sus órdenes.'
        }
    }
];

const ConfigPlantillas = ({ form }) => {
    // Estado visual para saber cuál plantilla está seleccionada
    const [seleccionado, setSeleccionado] = useState(null);
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';

    const panelStyle = {
        backgroundColor: isDark ? 'var(--mantine-color-dark-6)' : 'var(--mantine-color-gray-0)',
        borderColor: isDark ? 'var(--mantine-color-dark-4)' : 'var(--mantine-color-gray-2)'
    };

    const cargarPlantilla = (plantilla) => {
        setSeleccionado(plantilla.id);
        form.setValues({
            ...form.values,
            texto_asunto: plantilla.datos.texto_asunto,
            texto_parrafo_1: plantilla.datos.texto_parrafo_1,
            texto_parrafo_2: plantilla.datos.texto_parrafo_2,
            texto_despedida: plantilla.datos.texto_despedida
        });
    };

    return (
        <Grid gutter="lg">
            
            {/* LISTA DE DOCUMENTOS*/}
            <Grid.Col span={{ base: 12, md: 4 }}>
                <Text size="xs" fw={700} c="dimmed" mb="xs" tt="uppercase">Biblioteca de Formatos</Text>
                
                <Paper withBorder style={{ overflow: 'hidden', borderColor: panelStyle.borderColor }}>
                    <ScrollArea h={450}>
                        {BIBLIOTECA.map((item) => (
                            <NavLink
                                key={item.id}
                                label={<Text fw={500} c={isDark ? 'white' : 'dark'}>{item.label}</Text>}
                                description={<Text size="xs" c="dimmed">{item.description}</Text>}
                                leftSection={
                                    <ThemeIcon variant={seleccionado === item.id ? 'filled' : 'light'} color="brand">
                                        <IconFileText size={16} />
                                    </ThemeIcon>
                                }
                                rightSection={
                                    seleccionado === item.id ? <IconCheck size={16} color="green" /> : <IconChevronRight size={14} />
                                }
                                active={seleccionado === item.id}
                                onClick={() => cargarPlantilla(item)}
                                color="brand"
                                variant="subtle"
                                py="md"
                            />
                        ))}
                    </ScrollArea>
                </Paper>
                
                <Alert variant="light" color="blue" mt="md" icon={<IconInfoCircle size={16}/>}>
                    <Text size="xs" lh={1.4}>
                        <b>¿Cómo funciona?</b><br/>
                        1. Selecciona un formato de la lista.<br/>
                        2. Los textos se cargarán a la derecha.<br/>
                        3. Haz clic en <b>Guardar Cambios</b> (arriba) para establecer este formato como el activo para impresión.
                    </Text>
                </Alert>
            </Grid.Col>

            {/* COLUMNA EDITOR*/}
            <Grid.Col span={{ base: 12, md: 8 }}>
                <Text size="xs" fw={700} c="dimmed" mb="xs" tt="uppercase">Editor de Contenido</Text>
                <Paper p="lg" withBorder style={panelStyle}>
                    
                    {!seleccionado && (
                        <Group mb="lg" gap="xs">
                            <IconClick size={16} color="gray"/>
                            <Text size="xs" c="dimmed" fs="italic">
                                Editando configuración actual (o selecciona una plantilla para rellenar)
                            </Text>
                        </Group>
                    )}

                    <Grid>
                        <Grid.Col span={12}>
                            <TextInput 
                                label="Asunto del Oficio" 
                                placeholder="ASUNTO: ..." 
                                required
                                {...form.getInputProps('texto_asunto')} 
                            />
                        </Grid.Col>
                        
                        <Grid.Col span={12}><Divider label="Cuerpo del Texto" /></Grid.Col>

                        <Grid.Col span={12}>
                            <Textarea 
                                label="Párrafo 1 (Inicio)" 
                                placeholder="Escribe la introducción..." 
                                autosize 
                                minRows={4}
                                {...form.getInputProps('texto_parrafo_1')} 
                            />
                        </Grid.Col>
                        
                        <Grid.Col span={12}>
                            <Textarea 
                                label="Párrafo 2 (Conclusión)" 
                                placeholder="Escribe el cierre..." 
                                autosize 
                                minRows={4}
                                {...form.getInputProps('texto_parrafo_2')} 
                            />
                        </Grid.Col>

                        <Grid.Col span={12}>
                            <TextInput 
                                label="Despedida" 
                                placeholder="Ej: Atentamente," 
                                {...form.getInputProps('texto_despedida')} 
                            />
                        </Grid.Col>

                        <Grid.Col span={12}><Divider label="Pie de Página (Copias)" /></Grid.Col>

                        <Grid.Col span={6}>
                            <TextInput label="c.c.p. 1" {...form.getInputProps('ccp_1')} />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <TextInput label="c.c.p. 2" {...form.getInputProps('ccp_2')} />
                        </Grid.Col>
                        
                        <Grid.Col span={12}>
                            <TextInput 
                                label="Lugar de Expedición" 
                                description="Aparece en la fecha (Ej: Los Mochis, Sinaloa)"
                                {...form.getInputProps('lugar_expedicion')} 
                            />
                        </Grid.Col>
                    </Grid>
                </Paper>
            </Grid.Col>
        </Grid>
    );
};

export default ConfigPlantillas;