const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = new PrismaClient();

const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const usuario = await prisma.usuario.findUnique({ where: { username } });

    if (!usuario) 
      {
      return res.status(400).json({ error: 'Credenciales inválidas' });
    }

    const esValido = bcrypt.compareSync(password, usuario.password);
    if (!esValido) 
      {
      return res.status(400).json({ error: 'Credenciales inválidas' });
    }

    const accessToken = jwt.sign(
      { id: usuario.id, username: usuario.username, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const refreshToken = jwt.sign(
      { id: usuario.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    await prisma.usuario.update({
      where: { id: usuario.id },
      data: { refreshToken }
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 
    });

    return res.json({
      token: accessToken,
      user: { id: usuario.id, username: usuario.username, rol: usuario.rol }
    });
  } 
  catch (error) 
  {
    console.error('Error en login:', error);
    res.status(500).json({ error: error.message  });
  }
};

const refresh = async (req, res) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) return res.status(401).json({ error: 'No autorizado' });

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const usuario = await prisma.usuario.findUnique({ where: { id: decoded.id } });

    if (!usuario || usuario.refreshToken !== refreshToken) 
      {
      return res.status(401).json({ error: 'Token inválido' });
    }

    const newAccessToken = jwt.sign(
      { id: usuario.id, username: usuario.username, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token: newAccessToken });
  } 
  catch (err) 
  {
    return res.status(401).json({ error: 'Token inválido' });
  }
};

const logout = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (refreshToken) {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      await prisma.usuario.update({
        where: { id: decoded.id },
        data: { refreshToken: null }
      });
    }
  } 
  catch (err) 
  {
    console.error(err);
  }

  res.clearCookie('refreshToken');
  res.json({ message: 'Logout exitoso' });
  
};

module.exports = { login, refresh, logout };
