const {PrismaClient} = require('@prisma/client');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = new PrismaClient();

const login = async (req, res) => {

    const {username, password} = req.body;

    const usuario = await prisma.usuario.findUnique({where: {username}});
    if (!usuario) 
    {
        return res.status(400).json({error: 'Usuario no encontrado'});
    }

    const esPassdValido = bcrypt.compareSync(password, usuario.password);
    if (!esPassdValido) 
    {
        return res.status(400).json({error: 'Contraseña incorrecta'});
    }

    const token = jwt.sign(
        {id: usuario.id, username: usuario.username, rol: usuario.rol}, 
        process.env.JWT_SECRET, 
        {expiresIn: '1h'}
    );

    res.json({token});
};

module.exports = {login};