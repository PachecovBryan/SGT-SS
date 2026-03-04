import React, { useState, useEffect, useMemo } from 'react';
import { AppShell, Autocomplete, Stack, Paper, Button, Burger, Group, ThemeIcon, TextInput, Modal, Kbd, Text, NavLink, Avatar, Menu, ScrollArea, ActionIcon, useMantineColorScheme, useMantineTheme, Tooltip, rem, Loader, Badge 
} from '@mantine/core';
import { useDisclosure, useDebouncedValue } from '@mantine/hooks';
import { modals } from '@mantine/modals'; 
import { IconHome, IconSchool, IconLogout, IconUsers, IconUserCode, IconSettings, IconShieldLock, IconSun, IconMoon, IconUser, 
  IconChevronLeft, IconMenu2, IconSearch, IconHelp, IconFileTypePdf, IconAlertCircle, IconArrowRight, IconChartBar, IconActivity, IconCalendarEvent
} from '@tabler/icons-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import clienteAxios from './api';

const NavItem = ({ path, label, icon, onClick, desktopOpened }) => {
  const location = useLocation();
  const [hovered, setHovered] = React.useState(false); 
  
  const isActive = location.pathname === path || (path !== '/' && location.pathname.startsWith(path));

  let backgroundColor = 'transparent';
  if (isActive && hovered) {
    backgroundColor = 'rgba(255, 255, 255, 0.36)'; 
  } else if (isActive) {
    backgroundColor = 'rgba(255, 255, 255, 0.35)'; 
  } else if (hovered) {
    backgroundColor = 'rgba(255, 255, 255, 0.08)'; 
  }

  const linkComponent = (
    <NavLink
      label={desktopOpened ? label : null} 
      leftSection={icon}
      onClick={onClick}
      active={false} 
      
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      
      style={{
        backgroundColor: backgroundColor,
        color: 'white',
        borderRadius: '8px',
        marginBottom: '4px',
        fontWeight: isActive ? 600 : 400,
        transition: 'background-color 0.2s ease, color 0.2s ease',
      }}
      
      styles={{
        label: { 
            fontSize: '0.95rem', 
            marginLeft: desktopOpened ? '10px' : 0,
            color: 'white' 
        },
        section: { 
            marginRight: desktopOpened ? '10px' : 0, 
            opacity: isActive || hovered ? 1 : 0.8, 
            color: 'white'
        },
        root: {
            '&:hover': { textDecoration: 'none' } 
        }
      }}
      
      py={rem(10)} 
      px={desktopOpened ? rem(12) : rem(10)} 
      justify={desktopOpened ? 'flex-start' : 'center'}
      variant="filled" 
    />
  );

  return !desktopOpened ? (
    <Tooltip label={label} position="right" withArrow transitionProps={{ duration: 200 }} color="dark">
      {linkComponent}
    </Tooltip>
  ) : (
    linkComponent
  );
};

// layout pricipal
function Layout({ children }) {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);
  const [helpOpened, { open: openHelp, close: closeHelp }] = useDisclosure(false);

  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  
  const confirmarLogout = () => {
      modals.openConfirmModal({
          title: <Text fw={700} c="brand.9">Cerrar Sesión</Text>,
          children: <Text size="sm">¿Estás seguro que deseas salir del sistema?</Text>,
          labels: { confirm: 'Sí, salir', cancel: 'Cancelar' },
          confirmProps: { color: 'red' }, 
          centered: true,
          styles: { content: { borderTop: '4px solid var(--mantine-color-red-6)' } },
          onConfirm: logout, 
      });
  };

  const handleNavigate = (path) => {
    navigate(path);
    if (window.innerWidth < 768) toggleMobile();
  };
//logica del buscador
  const [query, setQuery] = useState('');
  const [debouncedQuery] = useDebouncedValue(query, 300);
  const [rawData, setRawData] = useState([]); 
  const [searchLoading, setSearchLoading] = useState(false);

  // Atajos Locales en el buscador
  const opcionesEstaticas = useMemo(() => [
    { value: 'Ir a Inicio', label: 'Inicio', description: 'Dashboard principal', group: 'Atajos', link: '/' },
    { value: 'Ir a Calendario', label: 'Calendario', description: 'Agenda de exámenes', group: 'Atajos', link: '/calendario' },
    { value: 'Ir a Reportes', label: 'Reportes', description: 'Estadísticas y gráficas', group: 'Atajos', link: '/reportes' },
    { value: 'Ir a Alumnos', label: 'Alumnos Tesistas', description: 'Listado de expedientes', group: 'Atajos', link: '/alumnos' },
    { value: 'Ir a Mi Perfil', label: 'Mi Perfil', description: 'Datos de cuenta', group: 'Atajos', link: '/perfil' },
    { value: 'Ir a Configuración', label: 'Configuración', description: 'Ajustes del sistema', group: 'Atajos', link: '/admin/config' },
    { value: 'Cerrar Sesión', label: 'Salir', description: 'Cerrar sesión actual', group: 'Atajos', link: 'logout_action' }, // Atajo especial
    ...(user?.rol === 'Administrador' ? [
        { value: 'Ir a Usuarios', label: 'Gestión de Usuarios', description: 'Admin del sistema', group: 'Atajos', link: '/admin/usuarios' },
        { value: 'Ir a Carreras', label: 'Gestión de Carreras', description: 'Catálogo', group: 'Atajos', link: '/admin/carreras' },
        { value: 'Ir a Personal', label: 'Personal Académico', description: 'Catálogo', group: 'Atajos', link: '/admin/personal' },
    ] : [])
  ], [user]);

  useEffect(() => {
    const ejecutarBusqueda = async () => {
        const busquedaNormalizada = debouncedQuery.toLowerCase();
        
        // filtro de atajos
        const atajosFiltrados = opcionesEstaticas.filter(op => 
            op.label.toLowerCase().includes(busquedaNormalizada) || 
            op.description.toLowerCase().includes(busquedaNormalizada)
        );

        if (!debouncedQuery || debouncedQuery.trim().length < 2) {
            setRawData(atajosFiltrados); 
            return;
        }

        // Busqueda en backend
        setSearchLoading(true);
        try {
            const res = await clienteAxios.get(`/search?q=${debouncedQuery}`);
            const datosRemotos = Array.isArray(res.data) ? res.data : [];
            
            setRawData([...atajosFiltrados, ...datosRemotos]); 

        } catch (error) {
            console.error("Error en búsqueda:", error);
            setRawData(atajosFiltrados);
        } finally {
            setSearchLoading(false);
        }
    };
    ejecutarBusqueda();
  }, [debouncedQuery, opcionesEstaticas]);

  const parsedData = useMemo(() => {
      const grupos = {};
      rawData.forEach(item => {
          const g = item.group || 'Resultados';
          if (!grupos[g]) grupos[g] = [];
          
          const { group, ...cleanItem } = item; 
          grupos[g].push(cleanItem);
      });
      return Object.keys(grupos).sort((a, b) => a === 'Atajos' ? -1 : 1).map(key => ({
          group: key,
          items: grupos[key]
      }));
  }, [rawData]);

  const handleSelectOption = (valorSeleccionado) => {
      const item = rawData.find(i => i.value === valorSeleccionado);
      if (item) {
          if (item.link === 'logout_action') {
             confirmarLogout();
          } else if (item.link) {
             navigate(item.link);
          }
          setQuery(''); 
          setRawData([]);
      }
  };

  const renderAutocompleteOption = ({ option }) => {
    const item = rawData.find(i => i.value === option.value);
    if (!item) return null;

    return (
        <Group gap="sm" wrap="nowrap">
            {item.group === 'Atajos' ? (
                <ThemeIcon variant="light" color="gray" size="md" radius="xl"><IconArrowRight size={14}/></ThemeIcon>
            ) : (
                <Avatar color="brand" size={36} radius="xl">{item.label?.charAt(0)}</Avatar>
            )}
            <div style={{ flex: 1 }}>
                <Text size="sm" fw={500}>{item.label}</Text>
                <Text size="xs" c="dimmed">{item.description}</Text>
            </div>
        </Group>
    );
  };

  const navItems = [
    { path: '/', label: 'Inicio', icon: <IconHome size="1.3rem" stroke={1.5} />, group: 'PRINCIPAL' },
    { path: '/calendario', label: 'Calendario', icon: <IconCalendarEvent size="1.3rem" stroke={1.5} />, group: 'PRINCIPAL' },
    { path: '/reportes', label: 'Reportes', icon: <IconChartBar size="1.3rem" stroke={1.5} />, group: 'PRINCIPAL' },
    { path: '/alumnos', label: 'Alumnos Tesistas', icon: <IconUsers size="1.3rem" stroke={1.5} />, group: 'PRINCIPAL' },
    { path: '/admin/config', label: 'Configuración', icon: <IconSettings size="1.3rem" stroke={1.5} />, group: 'SISTEMA' },
    { path: '/perfil', label: 'Mi Perfil', icon: <IconUser size="1.3rem" stroke={1.5} />, group: 'SISTEMA' },
  ];

  const adminItems = [
    { path: '/admin/carreras', label: 'Gestión de Carreras', icon: <IconSchool size="1.3rem" stroke={1.5} />, group: 'ADMINISTRACIÓN' },
    { path: '/admin/personal', label: 'Personal Académico', icon: <IconUserCode size="1.3rem" stroke={1.5} />, group: 'ADMINISTRACIÓN' },
    { path: '/admin/usuarios', label: 'Usuarios del Sistema', icon: <IconShieldLock size="1.3rem" stroke={1.5} />, group: 'ADMINISTRACIÓN' },
    { path: '/admin/auditoria', label: 'Historial del sistema', icon: <IconActivity size="1.3rem" stroke={1.5} />, group: 'SEGURIDAD' },
  ];
  
  const renderNavGroup = (items) => {
    let lastGroup = null;
    return items.map((item) => {
      const showHeader = item.group !== lastGroup && desktopOpened;
      lastGroup = item.group;
      
      return (
        <React.Fragment key={item.path}>
          {showHeader && (
            <Text size="xs" fw={700} c="rgba(255,255,255,0.5)" mt="xl" mb="sm" style={{ paddingLeft: 12, letterSpacing: 1, textTransform: 'uppercase', fontSize: 11 }}>
              {item.group}
            </Text>
          )}
          <NavItem 
            {...item} 
            onClick={() => handleNavigate(item.path)} 
            desktopOpened={desktopOpened}
          />
        </React.Fragment>
      );
    });
  };

  const customStyles = `
      .mi-opcion-personalizada[data-combobox-option]:hover {
          background-color: var(--mantine-color-brand-6) !important;
          color: white !important;
      }
      .mi-opcion-personalizada[data-combobox-option]:hover .mantine-Text-root {
          color: white !important;
      }
      .mi-opcion-personalizada[data-combobox-selected] {
          background-color: var(--mantine-color-brand-6) !important;
          color: white !important;
      }
      .mi-opcion-personalizada {
          transition: all 0.2s ease;
          padding: 8px !important;
      }
  `;
    
  return (
    <AppShell
      layout="alt"
      header={{ height: 60 }}
      navbar={{
        width: desktopOpened ? 280 : 80, 
        breakpoint: 'sm',
        collapsed: { mobile: !mobileOpened },
      }}
      padding="md"
      bg={colorScheme === 'dark' ? 'dark.8' : 'gray.1'}
      transitionDuration={300} 
      transitionTimingFunction="ease"
    >
      <AppShell.Header style={{ borderBottom: 'none', backgroundColor: 'transparent', zIndex: 101 }}>
        <Group h="100%" px="md" justify="space-between" align="center">
          <Group>
            <Burger opened={mobileOpened} onClick={toggleMobile} hiddenFrom="sm" size="sm" />
          </Group>
          
          {/* BUSCADOR GLOBAL */}
          <Group visibleFrom="sm" style={{ flex: 1, maxWidth: 600, paddingLeft: 20, paddingRight: 20 }}>
            <style>{customStyles}</style>

            <Autocomplete
                placeholder="Buscar alumno, cuenta, profesor..."
                leftSection={searchLoading ? <Loader size="xs" color="brand" /> : <IconSearch size={16} color="var(--mantine-color-dimmed)" />}
                
                data={parsedData}
                
                radius="xl"
                size="sm"
                style={{ width: '100%' }}
                
                value={query}
                onChange={setQuery}
                onOptionSubmit={handleSelectOption}
                
                filter={({ options }) => options}

                renderOption={renderAutocompleteOption}
                maxDropdownHeight={400}
                limit={10}
                
                comboboxProps={{ 
                    transitionProps: { transition: 'pop', duration: 200 },
                    shadow: 'md',
                    radius: 'md',
                    offset: 5,
                    classNames: { option: 'mi-opcion-personalizada' } 
                }}
                
                styles={{ 
                    input: { 
                        backgroundColor: colorScheme === 'dark' ? 'rgba(0,0,0,0.3)' : 'white', 
                        border: '1px solid transparent', 
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                        color: 'var(--mantine-color-text)', 
                        fontWeight: 500,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                            backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : '#f1f3f5',
                            borderColor: '#94a8d0', 
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)', 
                        },
                        '&:focus': { borderColor: '#5474b4' }
                    },
                    dropdown: {
                        backgroundColor: colorScheme === 'dark' ? 'var(--mantine-color-dark-7)' : 'white',
                        border: '1px solid var(--mantine-color-gray-2)',
                        padding: 6, 
                        borderRadius: 12
                    },
                }}
            />
          </Group>

          <Group gap="sm">
             <Tooltip label="Ayuda">
                <ActionIcon variant="default" radius="xl" size="lg" onClick={openHelp} style={{ border: 'none', backgroundColor: 'transparent' }}>
                    <IconHelp size={22} stroke={1.5} color="gray" />
                </ActionIcon>
             </Tooltip>

             <Group gap="xs" style={{ 
                backgroundColor: colorScheme === 'dark' ? 'var(--mantine-color-dark-6)' : 'white', 
                padding: '4px 6px 4px 16px', 
                borderRadius: 50, 
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                border: `1px solid ${colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'transparent'}`
             }}>
                  <ActionIcon 
                      onClick={toggleColorScheme} 
                      variant="subtle" color={colorScheme === 'dark' ? 'yellow' : 'gray'} radius="xl" size="md">
                     {colorScheme === 'dark' ? <IconSun size={18} /> : <IconMoon size={18} />}
                  </ActionIcon>
                  
                  <Menu shadow="lg" width={220} position="bottom-end" withArrow radius="md">
                     <Menu.Target>
                        <Group gap="xs" style={{ cursor: 'pointer', paddingRight: 4 }}>
                          <div style={{ textAlign: 'right', lineHeight: 1.2 }} className="mantine-visible-from-sm">
                             <Text size="sm" fw={700} c="dimmed">{user?.nombre}</Text>
                             <Text size="xs" c="dimmed" fw={500}>{user?.rol}</Text>
                          </div>
                          <Avatar color="brand" radius="xl" size="md" name={user?.nombre} gradient={{ from: 'brand', to: 'blue', deg: 45 }} variant="gradient">
                             {user?.nombre?.charAt(0)}
                          </Avatar>
                        </Group>
                     </Menu.Target>
                     <Menu.Dropdown>
                       <Menu.Label>Mi Cuenta</Menu.Label>
                       <Menu.Item leftSection={<IconUser size={16} />} component={Link} to="/perfil">Ver Perfil</Menu.Item>
                       <Menu.Divider />
                       <Menu.Item leftSection={<IconLogout size={16} />} color="red" onClick={confirmarLogout} style={{ fontWeight: 600 }}>Cerrar Sesión</Menu.Item>
                     </Menu.Dropdown>
                  </Menu>
             </Group>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md" bg="brand.9" style={{ borderRight: 'none', boxShadow: '4px 0 25px rgba(0,0,0,0.1)', zIndex: 102 }}>
        
        <div style={{ 
              marginBottom: 30, 
              height: 60,
              display: 'flex',
              alignItems: 'center',
              justifyContent: desktopOpened ? 'space-between' : 'center',
              paddingBottom: 20,
              borderBottom: '1px solid rgba(255,255,255,0.1)'
            }}
        >
            {desktopOpened ? (
              <Group gap="xs" wrap="nowrap">
                  <img src="/logo.png" alt="Logo" style={{ width: 60, height: 60, objectFit: 'contain' }} />
                  <div style={{ lineHeight: 1.1 }}>
                      <Text fw={1000} size="lg" c="white" style={{ letterSpacing: 1.2 }}>SGT</Text>
                      <Text size="m" c="white" style={{ opacity: 1.2 }}>Gestor de Titulación</Text>
                  </div>
              </Group>
            ) : (
               <img src="/logo.png" alt="Logo" style={{ width: 35, height: 35, objectFit: 'contain' }} />
            )}

            <ActionIcon 
                variant="subtle"
                c="white"
                onClick={toggleDesktop} 
                visibleFrom="sm" 
                size="lg"
                style={{ opacity: 0.8 }}
            >
                {desktopOpened ? <IconChevronLeft size="1.5rem" /> : <IconMenu2 size="1.5rem" />}
            </ActionIcon>
        </div>

        <ScrollArea style={{ flex: 1, marginLeft: -10, marginRight: -10, paddingLeft: 10, paddingRight: 10 }}>
            {renderNavGroup(navItems)}
            {user?.rol === 'Administrador' && renderNavGroup(adminItems)}
        </ScrollArea>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 15, marginTop: 'auto' }}>
            <NavItem 
                label="Cerrar Sesión"
                icon={<IconLogout size="1.3rem" />}
                onClick={confirmarLogout}
                desktopOpened={desktopOpened}
                path="logout"
            />
        </div>
      </AppShell.Navbar>

      <AppShell.Main bg={colorScheme === 'dark' ? 'dark.8' : 'gray.0'}>
         <div style={{ maxWidth: 1200, margin: '0 auto', paddingTop: 0 }}>
            {children}
         </div>

      <Modal 
        opened={helpOpened} 
        onClose={closeHelp}
        withCloseButton={false}
        title={
            <Group gap="xs">
                <ThemeIcon size="lg" radius="md" variant="light" color="blue">
                    <IconHelp size={20} />
                </ThemeIcon>
                <Text fw={700} size="lg" c="brand.9">Centro de Ayuda SGT</Text>
                <Text size="xs" mb="lg" c="dimmed">
                  <b>Sistema Gestor de Titulación (SGT)</b>. Es un sistema enfocado en el control y gestión de alumnos que buscan obtener
                         su titulacion por Tesis.
                  </Text>
            </Group>
        } 
        centered
        size="lg"
        radius="md"
        overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
        styles={{ content: { borderTop: '5px solid var(--mantine-color-brand-5)' } }}
      >
        <div style={{ padding: 10 }}>
            <Text size="sm" mb="lg" c="dimmed">
              Bienvenido al <b>Sistema Gestor de Titulación (SGT)</b>. Aquí tienes algunos tips y guia rapida para las tareas más comunes:
            </Text>
            <ScrollArea h={320} type="auto" offsetScrollbars>
                <Stack gap="lg">
                    <Paper withBorder p="md" radius="md" bg="var(--mantine-color-body)">
                        <Group mb="xs">
                            <IconSearch size={18} color="var(--mantine-color-blue-6)" />
                            <Text size="sm" fw={700}>Búsqueda Rápida</Text>
                        </Group>
                        <Text size="xs" c="dimmed" lh={1.6}>
                            Utiliza la barra superior para encontrar alumnos por nombre o folio desde cualquier pantalla. 
                            También puedes filtrar por carrera o estatus en el módulo de <Text span fw={600} c="blue">Alumnos</Text>.
                        </Text>
                    </Paper>

                    <Paper withBorder p="md" radius="md" bg="var(--mantine-color-body)">
                        <Group mb="xs">
                            <IconFileTypePdf size={18} color="var(--mantine-color-red-6)" />
                            <Text size="sm" fw={700}>Generar Documentos</Text>
                        </Group>
                        <Text size="xs" c="dimmed" lh={1.6}>
                            Para imprimir la <b>Solicitud de Revisión</b>, ve a la tabla de alumnos y haz clic en el icono rojo de PDF.
                            Asegúrate de que los datos del Coordinador estén actualizados en <Text span fw={600} c="blue">Configuración</Text>.
                        </Text>
                    </Paper>
                    <Paper withBorder p="md" radius="md" bg="var(--mantine-color-orange-0)" style={{ borderColor: 'var(--mantine-color-orange-2)' }}>
                        <Group mb="xs">
                            <IconAlertCircle size={18} color="var(--mantine-color-orange-7)" />
                            <Text size="sm" fw={700} c="orange.9">Soporte Técnico</Text>
                        </Group>
                        <Text size="xs" c="orange.8" lh={1.6}>
                            Si experimentas errores o necesitas ayuda con el sistema, contacta a la administracion
                        </Text>
                    </Paper>

                </Stack>
            </ScrollArea>
            <Group justify="flex-end" mt="md">
                <Button variant="default" onClick={closeHelp}>Entendido</Button>
            </Group>
        </div>
      </Modal>
      </AppShell.Main>
    </AppShell>
  );
}

export default Layout;