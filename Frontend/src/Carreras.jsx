import React, { useState, useEffect } from 'react';
import clienteAxios from './api'; 
import { useForm } from '@mantine/form';
import { Button, Title, Text, Table, Paper, Group, Badge, Breadcrumbs, Anchor, ActionIcon, Tooltip, Loader, Pagination, Center } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { IconPlus, IconPencil, IconTrash, IconChevronRight, IconCheck, IconX, IconAlertTriangle, IconDatabaseOff } from '@tabler/icons-react';
import { useAuth } from './AuthContext'; 
import { Link, useSearchParams } from 'react-router-dom';
import ModalCarrera from './components/ModalCarrera'; 

function Carreras() {
  const { user } = useAuth();
  const esAdmin = user?.rol === 'Administrador';
  
  const [listaCarreras, setListaCarreras] = useState([]);
  const [carrerasFiltradas, setCarrerasFiltradas] = useState([]);
  const [cargando, setCargando] = useState(true);
  
  const [searchParams] = useSearchParams(); 

  const [modoEdicion, setModoEdicion] = useState(false);
  const [idEdicion, setIdEdicion] = useState(null);

  const [paginaActual, setPaginaActual] = useState(1);
  const elementosPorPagina = 8;

  const [modalAbierto, { open: abrirModal, close: cerrarModal }] = useDisclosure(false);

  const formulario = useForm({
    initialValues: { clave: '', nombre: '' }, 
    validate: {
      clave: (valor) => (valor.length < 2 ? 'Clave requerida' : null),
      nombre: (valor) => (valor.length < 3 ? 'El nombre es muy corto' : null),
    },
  });

  const cargarCarreras = async () => {
    setCargando(true);
    try {
      const respuesta = await clienteAxios.get('/catalogos/carreras');
      setListaCarreras(respuesta.data);
      setCarrerasFiltradas(respuesta.data);
    } catch (error) {
      notifications.show({ title: 'Error de Conexión', message: 'No se pudo cargar la lista.', color: 'red', icon: <IconX size={18} /> });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargarCarreras(); }, []);

  useEffect(() => {
    setPaginaActual(1);
    const qGlobal = searchParams.get('q'); 

    if (qGlobal) {
        const termino = qGlobal.toLowerCase();
        const resultados = listaCarreras.filter((c) => 
            c.nombre.toLowerCase().includes(termino) || 
            c.clave.toLowerCase().includes(termino)
        );
        setCarrerasFiltradas(resultados);
    } else {
        setCarrerasFiltradas(listaCarreras);
    }
  }, [searchParams, listaCarreras]);

  const prepararCreacion = () => {
    setModoEdicion(false);
    setIdEdicion(null);
    formulario.reset();
    abrirModal();
  };

  const prepararEdicion = (carrera) => {
    setModoEdicion(true);
    setIdEdicion(carrera.clave); 
    formulario.setValues({ clave: carrera.clave, nombre: carrera.nombre });
    abrirModal();
  };

  const guardarCarrera = async (datos) => {
    try {
      if (modoEdicion) {
        await clienteAxios.put(`/catalogos/carreras/${idEdicion}`, datos);
        notifications.show({ title: 'Actualizado', message: 'Nombre de carrera modificado.', color: 'green', icon: <IconCheck size={18} /> });
      } else {
        await clienteAxios.post('/catalogos/carreras', datos);
        notifications.show({ title: 'Registrado', message: 'Nueva carrera agregada.', color: 'green', icon: <IconCheck size={18} /> });
      }
      cerrarModal();
      formulario.reset();
      cargarCarreras();
    } catch (error) {
      console.error(error);
      notifications.show({ title: 'Error', message: error.response?.data?.error || 'No se pudo guardar.', color: 'red', icon: <IconX size={18} /> });
    }
  };

  const confirmarEliminacion = (carrera) => {
    modals.openConfirmModal({
      title: <Text fw={700} size="lg" c="brand.9">Eliminar Carrera</Text>,
      centered: true,
      overlayProps: { backgroundOpacity: 0.55, blur: 3 },
      styles: { content: { borderTop: '5px solid var(--mantine-color-brand-6)' } },
      children: (
        <Text size="sm">
          ¿Estás seguro de eliminar <b>{carrera.nombre}</b>?
          <br />
          <span style={{ color: 'gray', fontSize: '0.85em' }}>Verifica que no tenga alumnos asignados antes de borrar.</span>
        </Text>
      ),
      labels: { confirm: 'Eliminar', cancel: 'Cancelar' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
            await clienteAxios.delete(`/catalogos/carreras/${carrera.clave}`); 
            cargarCarreras();
            notifications.show({ title: 'Eliminado', message: 'Registro borrado exitosamente.', color: 'blue', icon: <IconCheck size={18} /> });
        } catch (error) {
            notifications.show({ 
                title: 'Acción Bloqueada', 
                message: error.response?.data?.error || 'No se puede eliminar este registro.', 
                color: 'red', 
                icon: <IconAlertTriangle size={18} />,
                autoClose: 6000
            });
        }
      }
    });
  };

  if (cargando) return <Loader style={{ display: 'block', margin: '50px auto' }} />;

  const totalPaginas = Math.ceil(carrerasFiltradas.length / elementosPorPagina);
  const datosPaginados = carrerasFiltradas.slice((paginaActual - 1) * elementosPorPagina, paginaActual * elementosPorPagina);
  const inicioConteo = carrerasFiltradas.length === 0 ? 0 : (paginaActual - 1) * elementosPorPagina + 1;
  const finConteo = Math.min(paginaActual * elementosPorPagina, carrerasFiltradas.length);

  const filasTabla = datosPaginados.map((carrera) => (
    <Table.Tr key={carrera.clave}>
      <Table.Td style={{ width: 120, paddingLeft: 20 }}>
        <Badge variant="light" color="gray" radius="sm" size="sm">{carrera.clave}</Badge>
      </Table.Td>
      
      <Table.Td>
          <Text fw={600} size="sm" c="bright">{carrera.nombre}</Text>
      </Table.Td>
      
      <Table.Td style={{ textAlign: 'right', paddingRight: 20 }}>
        {esAdmin && (
            <Group gap="xs" justify="flex-end">
                <Tooltip label="Editar Nombre">
                    <ActionIcon variant="subtle" color="blue" onClick={() => prepararEdicion(carrera)}>
                        <IconPencil size={18} />
                    </ActionIcon>
                </Tooltip>
                <Tooltip label="Eliminar Carrera">
                    <ActionIcon variant="subtle" color="red" onClick={() => confirmarEliminacion(carrera)}>
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
    { title: 'Carreras', href: '/admin/carreras' },
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
                <Title order={2} c="brand.9">Gestión de Carreras</Title>
                <Text c="dimmed" size="sm">Administra el catálogo oficial de ofertas educativas.</Text>
            </div>
            {esAdmin && (
                <Button leftSection={<IconPlus size={18} />} onClick={prepararCreacion} color="brand.6">
                    Nueva Carrera
                </Button>
            )}
        </Group>
      </div>

      <Paper shadow="sm" radius="md" p="0" withBorder style={{ borderTop: '4px solid var(--mantine-color-brand-6)', overflow: 'hidden' }}>
        
        {carrerasFiltradas.length === 0 ? (
          <Center style={{ padding: '60px 0', flexDirection: 'column' }}>
            <div style={{ backgroundColor: 'var(--mantine-color-gray-0)', borderRadius: '50%', padding: 20, marginBottom: 15 }}>
                <IconDatabaseOff size={40} style={{ opacity: 0.4 }} color="gray" />
            </div>
            <Text size="lg" fw={500} c="dimmed">No se encontraron resultados</Text>
            {searchParams.get('q') && (
                <Button variant="subtle" size="xs" mt="sm" component={Link} to="/admin/carreras">
                    Mostrar todas
                </Button>
            )}
          </Center>
        ) : (
          <>
            <Table.ScrollContainer minWidth={500}>
                <Table verticalSpacing="md" highlightOnHover>
                    <Table.Thead style={{ borderBottom: '1px solid var(--mantine-color-dark-4)' }}>
                    <Table.Tr>
                        <Table.Th style={{ width: 120, paddingLeft: 20, paddingTop: 15, paddingBottom: 15 }}>
                            <Text c="dimmed" size="xs" fw={700} tt="uppercase">Clave</Text>
                        </Table.Th>
                        <Table.Th>
                            <Text c="dimmed" size="xs" fw={700} tt="uppercase">Nombre Oficial</Text>
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
                <Text size="xs" c="dimmed" fw={500}>Mostrando {inicioConteo} - {finConteo} de {carrerasFiltradas.length} registros</Text>
                <Pagination total={totalPaginas} value={paginaActual} onChange={setPaginaActual} color="brand.6" size="sm" radius="md" />
            </div>
          </>
        )}
      </Paper>

      <ModalCarrera 
        abierto={modalAbierto}
        cerrar={cerrarModal}
        esEdicion={modoEdicion}
        form={formulario}
        alGuardar={guardarCarrera}
      />
    </div>
  );
}

export default Carreras;