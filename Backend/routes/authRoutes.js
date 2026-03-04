const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');
const { verPermiso, SECRET_KEY } = require('../middlewares/auth');

router.post('/login', async (req, res) => {
  const { correo, password } = req.body;
  try {
    const usuario = await prisma.usuarios.findUnique({ where: { correo }, include: { rol: true } });
    
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado.' });
    if (!bcrypt.compareSync(password, usuario.password)) return res.status(401).json({ error: 'Contraseña incorrecta.' });

  const token = jwt.sign(
    { 
      userId: usuario.no_empleado, 
      rol: usuario.rol.nombre,
      nombre_completo: usuario.nombre_completo 
    },
    SECRET_KEY, 
    { expiresIn: '2h' }
  );

    res.json({ 
        token, 
        usuario: { 
            nombre: usuario.nombre_completo, 
            rol: usuario.rol.nombre,
            correo: usuario.correo,
            no_empleado: usuario.no_empleado
        } 
    });
  } catch (error) { res.status(500).json({ error: 'Error interno.' }); }
});
router.post('/profile/change-password', verPermiso(), async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    try {
        const user = await prisma.usuarios.findUnique({ where: { no_empleado: req.user.userId } });
        if (!bcrypt.compareSync(currentPassword, user.password)) return res.status(400).json({ error: 'Contraseña actual incorrecta.' });
        
        await prisma.usuarios.update({
            where: { no_empleado: req.user.userId },
            data: { password: bcrypt.hashSync(newPassword, 10) }
        });
        res.json({ message: 'Contraseña actualizada.' });
    } catch (error) { res.status(500).json({ error: 'Error al actualizar.' }); }
});

module.exports = router;