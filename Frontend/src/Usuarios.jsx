import React, { useState, useEffect } from 'react';
import clienteAxios from './api'; 
import { useForm } from '@mantine/form';
import { Button, Title, Text, Table, Loader, Paper, Group, Badge, Breadcrumbs, Anchor, ActionIcon, Tooltip, Pagination, Center, Avatar } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { modals } from '@mantine/modals'; 
import { notifications } from '@mantine/notifications'; 
import { IconShieldLock, IconPlus, IconPencil, IconTrash, IconChevronRight, IconCheck, IconX, IconDatabaseOff } from '@tabler/icons-react';
import { useAuth } from './AuthContext';
import { Link, useSearchParams } from 'react-router-dom';
import ModalUsuario from './components/ModalUsuario';

function Usuarios() {
  const { user } = useAuth();
  
  const [listaUsuarios, setListaUsuarios] = useState([]);
  const [usuariosFiltrados, setUsuariosFiltrados] = useState([]);
  const [rolesDisponibles, setRolesDisponibles] = useState([]);
  const [cargando, setCargando] = useState(true);
  
  const [searchParams] = useSearchParams();

  const [modoEdicion, setModoEdicion] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);
  const elementosPorPagina = 8;

  const [modalAbierto, { open: abrirModal, close: cerrarModal }] = useDisclosure(false);

  const formulario = useForm({
    initialValues: {
      no_empleado: '', 
      nombres: '', 
      paterno: '', 
      materno: '', 
      nombre_completo: '',
      correo: '', 
      rol_id: null, 
      password: '', 
      confirmPassword: ''
    },
    validate: {
      no_empleado: (val) => (val.length < 1 ? 'Falta el ID' : null),
      nombres: (val) => (val.length < 2 ? 'Muy corto' : null),
      paterno: (val) => (val.length < 2 ? 'Muy corto' : null),
      correo: (val) => (/^\S+@\S+$/.test(val) ? null : 'Correo inválido'),
      rol_id: (val) => (!val ? 'Selecciona rol' : null),
      password: (val) => {
        if (!modoEdicion && val.length < 6) return 'Mínimo 6 caracteres';
        if (modoEdicion && val.length > 0 && val.length < 6) return 'Mínimo 6 caracteres';
        return null;
      },
      confirmPassword: (val, values) => (val !== values.password ? 'No coinciden' : null),
    },
  });

  const cargarLista = async () => {
    setCargando(true);
    try {
        const [resUsers, resRoles] = await Promise.all([ 
            clienteAxios.get('/admin/usuarios'), 
            clienteAxios.get('/catalogos/roles') 
        ]);
        setListaUsuarios(resUsers.data);
        setUsuariosFiltrados(resUsers.data);
        setRolesDisponibles(resRoles.data.map(r => ({ value: r.id.toString(), label: r.nombre })));
    } catch (err) {
        console.error(err);
        notifications.show({ title: 'Error', message: 'No se pudo conectar.', color: 'red', icon: <IconX size={18}/> });
    } finally {
        setCargando(false);
    }
  };

  useEffect(() => { cargarLista(); }, []);

  useEffect(() => {
    setPaginaActual(1);
    const qGlobal = searchParams.get('q');

    if (qGlobal) {
        const termino = qGlobal.toLowerCase();
        const resultados = listaUsuarios.filter((u) => 
            u.nombre_completo.toLowerCase().includes(termino) || 
            u.correo.toLowerCase().includes(termino) ||
            u.no_empleado.toString().includes(termino)
        );
        setUsuariosFiltrados(resultados);
    } else {
        setUsuariosFiltrados(listaUsuarios);
    }
  }, [searchParams, listaUsuarios]);

  const prepararNuevo = () => { 
    setModoEdicion(false); 
    formulario.reset(); 
    abrirModal(); 
  };

  const prepararEdicion = (usuario) => {
    setModoEdicion(true);
    formulario.setValues({
        no_empleado: usuario.no_empleado,
        nombre_completo: usuario.nombre_completo,
        nombres: '',
        paterno: '',
        materno: '',
        correo: usuario.correo,
        rol_id: usuario.rol_id ? usuario.rol_id.toString() : null,
        password: '', 
        confirmPassword: ''
    });
    abrirModal();
  };

  const confirmarBorrado = (usuario) => {
    modals.openConfirmModal({
      title: <Text fw={700} size="lg" c="brand.9">Eliminar Usuario</Text>,
      centered: true,
      overlayProps: { backgroundOpacity: 0.55, blur: 3 },
      styles: { content: { borderTop: '5px solid var(--mantine-color-brand-6)' } },
      children: (
        <Text size="sm">
          ¿Eliminar acceso a <b>{usuario.nombre_completo}</b>? <br/>
          <span style={{ color: 'gray' }}>Esta acción es permanente.</span>
        </Text>
      ),
      labels: { confirm: 'Eliminar', cancel: 'Cancelar' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
            await clienteAxios.delete(`/admin/usuarios/${usuario.no_empleado}`); 
            cargarLista();
            notifications.show({ title: 'Eliminado', message: 'Usuario borrado.', color: 'blue', icon: <IconCheck size={18}/> });
        } catch (err) {
            notifications.show({ title: 'Error', message: 'No se pudo eliminar.', color: 'red' });
        }
      },
    });
  };

  const guardarUsuario = async (valores) => {
    try {
        const { confirmPassword, ...payload } = valores;
        
        if (payload.rol_id) payload.rol_id = parseInt(payload.rol_id);

        if (modoEdicion) {
            if (!payload.password) delete payload.password;
            await clienteAxios.put(`/admin/usuarios/${valores.no_empleado}`, payload); 
            notifications.show({ title: 'Actualizado', message: 'Datos guardados.', color: 'green', icon: <IconCheck size={18}/> });
        } else {
            await clienteAxios.post('/admin/usuarios', payload); 
            notifications.show({ title: 'Creado', message: 'Nuevo usuario registrado.', color: 'green', icon: <IconCheck size={18}/> });
        }
        
        cerrarModal(); 
        formulario.reset(); 
        cargarLista();

    } catch (err) {
        console.error(err);
        const msg = err.response?.data?.error || 'Ocurrió un error inesperado.';
        notifications.show({ title: 'Atención', message: msg, color: 'red' });
    }
  };

  if (cargando) return <Loader style={{ display: 'block', margin: '50px auto' }} />;

  const totalPaginas = Math.ceil(usuariosFiltrados.length / elementosPorPagina);
  const datosPaginados = usuariosFiltrados.slice((paginaActual - 1) * elementosPorPagina, paginaActual * elementosPorPagina);
  const inicio = usuariosFiltrados.length === 0 ? 0 : (paginaActual - 1) * elementosPorPagina + 1;
  const fin = Math.min(paginaActual * elementosPorPagina, usuariosFiltrados.length);

  const filasTabla = datosPaginados.map((u) => (
    <Table.Tr key={u.no_empleado}>
      <Table.Td style={{ paddingLeft: 20 }}>
        <Group gap="md">
            <Avatar color="blue" radius="xl" size={40} variant="filled">
                {u.nombre_completo.charAt(0)}
            </Avatar>
            <div>
                <Text fw={600} size="sm" tt="capitalize" c="bright">
                    {u.nombre_completo.toLowerCase()}
                </Text>
                <Text size="xs" c="dimmed">ID: {u.no_empleado}</Text>
            </div>
        </Group>
      </Table.Td>

      <Table.Td>
          <Text size="sm" c="dimmed">{u.correo}</Text>
      </Table.Td>

      <Table.Td>
          <Badge 
            color={u.rol?.nombre === 'Administrador' ? 'violet' : 'blue'} 
            variant="light"
            size="md"
          >
            {u.rol?.nombre}
          </Badge>
      </Table.Td>

      <Table.Td style={{ textAlign: 'right', paddingRight: 20 }}>
        <Group gap="xs" justify="flex-end">
            <Tooltip label="Editar">
                <ActionIcon variant="subtle" color="blue" onClick={() => prepararEdicion(u)}><IconPencil size={18} /></ActionIcon>
            </Tooltip>
            <Tooltip label="Eliminar">
                <ActionIcon variant="subtle" color="red" onClick={() => confirmarBorrado(u)}><IconTrash size={18} /></ActionIcon>
            </Tooltip>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  const breadcrumbs = [ 
    { title: 'Inicio', href: '/' }, 
    { title: 'Administración', href: null }, 
    { title: 'Usuarios', href: '/admin/usuarios' } 
  ].map((item, index) => (
    <Anchor component={Link} to={item.href} key={index} size="sm" c={index === 2 ? 'brand.7' : 'dimmed'} style={{ lineHeight: 1 }}>
        {item.title}
    </Anchor>
  ));

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', paddingBottom: 40 }}>
      <div style={{ marginBottom: 25 }}>
        <Breadcrumbs separator={<IconChevronRight size={14} />} mb="xs">{breadcrumbs}</Breadcrumbs>
        <Group justify="space-between">
            <div>
                <Title order={2} c="brand.9">Usuarios del Sistema</Title>
                <Text c="dimmed" size="sm">Administra los accesos y roles del personal.</Text>
            </div>
            <Button leftSection={<IconPlus size={18} />} onClick={prepararNuevo} color="brand.6">
                Nuevo Usuario
            </Button>
        </Group>
      </div>

      <Paper shadow="sm" radius="md" p="0" withBorder style={{ borderTop: '4px solid var(--mantine-color-brand-6)', overflow: 'hidden' }}>
        {usuariosFiltrados.length === 0 ? (
          <Center style={{ padding: '60px 0', flexDirection: 'column' }}>
            <div style={{ backgroundColor: 'var(--mantine-color-gray-0)', borderRadius: '50%', padding: 20, marginBottom: 15 }}>
                <IconDatabaseOff size={40} style={{ opacity: 0.4 }} color="gray" />
            </div>
            <Text size="lg" fw={500} c="dimmed">No se encontraron resultados</Text>
            {searchParams.get('q') && <Button variant="subtle" size="xs" mt="sm" component={Link} to="/admin/usuarios">Mostrar todos</Button>}
          </Center>
        ) : (
            <>
            <Table.ScrollContainer minWidth={600}>
                <Table verticalSpacing="md" highlightOnHover>
                    <Table.Thead style={{ borderBottom: '1px solid var(--mantine-color-dark-4)' }}>
                    <Table.Tr>
                        <Table.Th style={{ paddingLeft: 20, paddingTop: 15, paddingBottom: 15 }}><Text c="dimmed" size="xs" fw={700} tt="uppercase">Usuario</Text></Table.Th>
                        <Table.Th><Text c="dimmed" size="xs" fw={700} tt="uppercase">Correo</Text></Table.Th>
                        <Table.Th><Text c="dimmed" size="xs" fw={700} tt="uppercase">Rol</Text></Table.Th>
                        <Table.Th style={{ textAlign: 'right', paddingRight: 20 }}><Text c="dimmed" size="xs" fw={700} tt="uppercase">Acciones</Text></Table.Th>
                    </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody style={{ backgroundColor: 'var(--mantine-color-body)' }}>{filasTabla}</Table.Tbody>
                </Table>
            </Table.ScrollContainer>

            <div style={{ padding: '15px 20px', borderTop: '1px solid var(--mantine-color-dark-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--mantine-color-body)' }}>
                <Text size="xs" c="dimmed" fw={500}>Mostrando {inicio} - {fin} de {usuariosFiltrados.length} registros</Text>
                <Pagination total={totalPaginas} value={paginaActual} onChange={setPaginaActual} color="brand.6" size="sm" radius="md" />
            </div>
            </>
        )}
      </Paper>

      <ModalUsuario 
        abierto={modalAbierto}
        cerrar={cerrarModal}
        esEdicion={modoEdicion}
        form={formulario}
        alGuardar={guardarUsuario}
        catalogoRoles={rolesDisponibles}
      />
    </div>
  );
}

export default Usuarios;