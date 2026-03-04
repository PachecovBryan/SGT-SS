import React, { useState, useEffect } from 'react';
import clienteAxios from './api'; 
import { useForm } from '@mantine/form';
import { Button, Title, Text, Table, Paper, Group, Badge, Breadcrumbs, Anchor, ActionIcon, Tooltip, Loader, Pagination, Center, Avatar } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { IconPlus, IconPencil, IconTrash, IconChevronRight, IconCheck, IconX, IconAlertTriangle, IconDatabaseOff } from '@tabler/icons-react';
import { useAuth } from './AuthContext';
import { Link, useSearchParams } from 'react-router-dom';
import ModalPersonal from './components/ModalPersonal';

function Personal() {
  const { user } = useAuth();
  const esAdmin = user?.rol === 'Administrador';
  
  const [listaPersonal, setListaPersonal] = useState([]);
  const [filtrados, setFiltrados] = useState([]);
  const [cargando, setCargando] = useState(true);
  
  const [searchParams] = useSearchParams();

  const [modoEdicion, setModoEdicion] = useState(false);
  const [idEdicion, setIdEdicion] = useState(null);

  const [paginaActual, setPaginaActual] = useState(1);
  const elementosPorPagina = 8;

  const [modalAbierto, { open: abrirModal, close: cerrarModal }] = useDisclosure(false);

  // --- FORMULARIO ACTUALIZADO (Campos Separados) ---
  const formulario = useForm({
    initialValues: { 
        no_empleado: '', 
        nombramiento: '', 
        nombres: '', 
        paterno: '', 
        materno: '',
        nombre_completo: '' // Auxiliar para la edición
    }, 
    validate: {
      nombres: (val) => (val.length < 2 ? 'Requerido' : null),
      paterno: (val) => (val.length < 2 ? 'Requerido' : null),
      nombramiento: (val) => (val.length < 1 ? 'Requerido' : null),
      no_empleado: (val) => (val.length < 6 ? 'Debe ser de 6 dígitos' : null),
    },
  });

  const cargarPersonal = async () => {
    setCargando(true);
    try {
      const respuesta = await clienteAxios.get('/catalogos/personal');
      setListaPersonal(respuesta.data);
      setFiltrados(respuesta.data);
    } catch (error) {
      notifications.show({ title: 'Error', message: 'No se pudo cargar la lista.', color: 'red', icon: <IconX size={18} /> });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargarPersonal(); }, []);

  useEffect(() => {
    setPaginaActual(1);
    const qGlobal = searchParams.get('q');

    if (qGlobal) {
        const termino = qGlobal.toLowerCase();
        const resultados = listaPersonal.filter((p) => 
            p.nombre_completo.toLowerCase().includes(termino) || 
            p.no_empleado.toLowerCase().includes(termino)
        );
        setFiltrados(resultados);
    } else {
        setFiltrados(listaPersonal);
    }
  }, [searchParams, listaPersonal]);

  const prepararCreacion = () => {
    setModoEdicion(false);
    setIdEdicion(null);
    formulario.reset();
    abrirModal();
  };

  const prepararEdicion = (persona) => {
    setModoEdicion(true);
    setIdEdicion(persona.no_empleado);
    
    formulario.setValues({
        no_empleado: persona.no_empleado,
        nombramiento: persona.nombramiento,
        nombre_completo: persona.nombre_completo, 
        nombres: '', 
        paterno: '',
        materno: ''
    });
    abrirModal();
  };

  const guardarPersonal = async (datos) => {
    try {
      if (modoEdicion) {
        await clienteAxios.put(`/catalogos/personal/${idEdicion}`, datos);
        notifications.show({ title: 'Actualizado', message: 'Datos guardados correctamente.', color: 'green', icon: <IconCheck size={18} /> });
      } else {
        await clienteAxios.post('/catalogos/personal', datos);
        notifications.show({ title: 'Registrado', message: 'Nuevo profesor agregado.', color: 'green', icon: <IconCheck size={18} /> });
      }
      cerrarModal();
      formulario.reset();
      cargarPersonal();
    } catch (error) {
      const msg = error.response?.data?.error || 'Error al guardar.';
      notifications.show({ title: 'Error', message: msg, color: 'red', icon: <IconX size={18} /> });
    }
  };

  const confirmarEliminacion = (persona) => {
    modals.openConfirmModal({
      title: <Text fw={700} size="lg" c="brand.9">Eliminar Personal</Text>,
      centered: true,
      overlayProps: { backgroundOpacity: 0.55, blur: 3 },
      children: (
        <Text size="sm">
          ¿Seguro de eliminar a <b>{persona.nombramiento} {persona.nombre_completo}</b>?
        </Text>
      ),
      labels: { confirm: 'Eliminar', cancel: 'Cancelar' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
            await clienteAxios.delete(`/catalogos/personal/${persona.no_empleado}`); 
            cargarPersonal();
            notifications.show({ title: 'Eliminado', message: 'Registro borrado.', color: 'blue', icon: <IconCheck size={18} /> });
        } catch (error) {
            notifications.show({ 
                title: 'Acción Bloqueada', 
                message: error.response?.data?.error || 'No se pudo eliminar.', 
                color: 'red', 
                icon: <IconAlertTriangle size={18} />
            });
        }
      }
    });
  };

  if (cargando) return <Loader style={{ display: 'block', margin: '50px auto' }} />;

  const totalPaginas = Math.ceil(filtrados.length / elementosPorPagina);
  const datosPaginados = filtrados.slice((paginaActual - 1) * elementosPorPagina, paginaActual * elementosPorPagina);
  const inicio = filtrados.length === 0 ? 0 : (paginaActual - 1) * elementosPorPagina + 1;
  const fin = Math.min(paginaActual * elementosPorPagina, filtrados.length);

  const filasTabla = datosPaginados.map((persona) => (
    <Table.Tr key={persona.no_empleado}>
      <Table.Td style={{ width: 100, paddingLeft: 20 }}>
        <Badge variant="light" color="gray" radius="sm">{persona.no_empleado}</Badge>
      </Table.Td>
      
      <Table.Td>
        <Group gap="md">
             <Avatar color="violet" radius="xl" size={40} variant="filled">
                {persona.nombre_completo.charAt(0)}
             </Avatar>
             <div>
                <Text fw={600} size="sm" tt="capitalize" c="bright">
                    {persona.nombre_completo.toLowerCase()}
                </Text>
                <Text size="xs" c="dimmed">{persona.nombramiento || 'Docente'}</Text>
             </div>
        </Group>
      </Table.Td>

      <Table.Td style={{ textAlign: 'right', paddingRight: 20 }}>
        {esAdmin && (
            <Group gap="xs" justify="flex-end">
                <Tooltip label="Editar">
                    <ActionIcon variant="subtle" color="blue" onClick={() => prepararEdicion(persona)}>
                        <IconPencil size={18} />
                    </ActionIcon>
                </Tooltip>
                <Tooltip label="Eliminar">
                    <ActionIcon variant="subtle" color="red" onClick={() => confirmarEliminacion(persona)}>
                        <IconTrash size={18} />
                    </ActionIcon>
                </Tooltip>
            </Group>
        )}
      </Table.Td>
    </Table.Tr>
  ));

  const migasPan = [
    { title: 'Inicio', href: '/' },
    { title: 'Administración', href: null },
    { title: 'Personal Académico', href: '/admin/personal' },
  ].map((item, index) => (
    <Anchor component={Link} to={item.href} key={index} size="sm" c={index === 2 ? 'brand.7' : 'dimmed'} style={{ lineHeight: 1 }}>
      {item.title}
    </Anchor>
  ));

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', paddingBottom: 40 }}>
      
      <div style={{ marginBottom: 25 }}>
        <Breadcrumbs separator={<IconChevronRight size={14} />} mb="xs">{migasPan}</Breadcrumbs>
        <Group justify="space-between">
            <div>
                <Title order={2} c="brand.9">Personal Académico</Title>
                <Text c="dimmed" size="sm">Directorio de docentes y directivos.</Text>
            </div>
            {esAdmin && (
                <Button leftSection={<IconPlus size={18} />} onClick={prepararCreacion} color="brand.6">
                    Nuevo Docente
                </Button>
            )}
        </Group>
      </div>

      <Paper shadow="sm" radius="md" p="0" withBorder style={{ borderTop: '4px solid var(--mantine-color-brand-6)', overflow: 'hidden' }}>
        {filtrados.length === 0 ? (
          <Center style={{ padding: '60px 0', flexDirection: 'column' }}>
            <div style={{ backgroundColor: 'var(--mantine-color-gray-0)', borderRadius: '50%', padding: 20, marginBottom: 15 }}>
                <IconDatabaseOff size={40} style={{ opacity: 0.4 }} color="gray" />
            </div>
            <Text size="lg" fw={500} c="dimmed">No se encontraron resultados</Text>
            {searchParams.get('q') && <Button variant="subtle" size="xs" mt="sm" component={Link} to="/admin/personal">Mostrar todos</Button>}
          </Center>
        ) : (
          <>
            <Table.ScrollContainer minWidth={600}>
                <Table verticalSpacing="md" highlightOnHover>
                    <Table.Thead style={{ borderBottom: '1px solid var(--mantine-color-dark-4)' }}>
                    <Table.Tr>
                        <Table.Th style={{ width: 100, paddingLeft: 20, paddingTop: 15, paddingBottom: 15 }}>
                            <Text c="dimmed" size="xs" fw={700} tt="uppercase">No. Empleado</Text>
                        </Table.Th>
                        <Table.Th>
                            <Text c="dimmed" size="xs" fw={700} tt="uppercase">Docente</Text>
                        </Table.Th>
                        <Table.Th style={{ textAlign: 'right', paddingRight: 20 }}>
                            <Text c="dimmed" size="xs" fw={700} tt="uppercase">Acciones</Text>
                        </Table.Th>
                    </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody style={{ backgroundColor: 'var(--mantine-color-body)' }}>{filasTabla}</Table.Tbody>
                </Table>
            </Table.ScrollContainer>

            <div style={{ padding: '15px 20px', borderTop: '1px solid var(--mantine-color-dark-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--mantine-color-body)' }}>
                <Text size="xs" c="dimmed" fw={500}>Mostrando {inicio} - {fin} de {filtrados.length} registros</Text>
                <Pagination total={totalPaginas} value={paginaActual} onChange={setPaginaActual} color="brand.6" size="sm" radius="md" />
            </div>
          </>
        )}
      </Paper>

      <ModalPersonal 
        abierto={modalAbierto}
        cerrar={cerrarModal}
        esEdicion={modoEdicion}
        form={formulario}
        alGuardar={guardarPersonal}
      />
    </div>
  );
}

export default Personal;