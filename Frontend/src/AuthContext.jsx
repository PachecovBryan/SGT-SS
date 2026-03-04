import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);

  useEffect(() => {
    const tokenGuardado = localStorage.getItem('token');
    const usuarioGuardado = localStorage.getItem('user');
    
    if (tokenGuardado && usuarioGuardado) {
      try {
        setToken(tokenGuardado);
        setUsuario(JSON.parse(usuarioGuardado));
      } catch (e) {
        localStorage.clear();
      }
    }
    setCargandoSesion(false); 
  }, []);

  const iniciarSesion = (datosUsuario, tokenAcceso) => {
    setUsuario(datosUsuario);
    setToken(tokenAcceso);
    localStorage.setItem('user', JSON.stringify(datosUsuario));
    localStorage.setItem('token', tokenAcceso);
  };

const cerrarSesion = () => {
    const colorSchemeGuardado = localStorage.getItem('sgt-color-scheme');
    localStorage.clear(); 
    if (colorSchemeGuardado) {
      localStorage.setItem('sgt-color-scheme', colorSchemeGuardado);
    }
    setUsuario(null);
    setToken(null);
    window.location.href = '/login';
  };

  const actualizarDatosUsuario = (nuevosDatos) => {
    const usuarioActualizado = { ...usuario, ...nuevosDatos };
    setUsuario(usuarioActualizado);
    localStorage.setItem('user', JSON.stringify(usuarioActualizado));
  };

  const values = {
    user: usuario,
    token,
    login: iniciarSesion,
    logout: cerrarSesion,
    actualizarUsuario: actualizarDatosUsuario,
    isAuthenticated: !!token,
  };

  if (cargandoSesion) return null;

  return (
    <AuthContext.Provider value={values}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}