const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getUsuarios = async (req, res) => {
  try {
    const usuarios = await prisma.usuario.findMany({
      select: { id: true, username: true, rol: true }
    });
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUsuarioById = async (req, res) => {
  const { id } = req.params;
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: parseInt(id) },
      select: { id: true, username: true, rol: true }
    });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(usuario);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const crearUsuario = async (req, res) => {
  const { username, password, rol } = req.body;
  const hassedPassword = bcrypt.hashSync(password, 10);

  try {
    const nuevoUsuario = await prisma.usuario.create({
      data: { username, password: hassedPassword, rol }
    });
    res.status(201).json(nuevoUsuario);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const actualizarUsuario = async (req, res) => {
  const { id } = req.params;
  const { username, password, rol } = req.body;

  try {
    const data = { username, rol };

    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }

    const usuarioActualizado = await prisma.usuario.update({
      where: { id: parseInt(id) },
      data
    });

    res.json(usuarioActualizado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const eliminarUsuario = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.usuario.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { 
  getUsuarios, 
  getUsuarioById, 
  crearUsuario, 
  actualizarUsuario, 
  eliminarUsuario 
};
