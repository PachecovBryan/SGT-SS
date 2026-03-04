const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET || 'secreto-desarrollo';

const verPermiso = (rolesPermitidos) => (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Acceso denegado. Falta token.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const usuario = jwt.verify(token, SECRET_KEY);
    req.user = usuario;

    if (rolesPermitidos && !rolesPermitidos.includes(usuario.rol)) {
      return res.status(403).json({ error: 'No tienes permisos suficientes.' });
    }

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Sesión caducada.' });
  }
};

module.exports = { verPermiso, SECRET_KEY };