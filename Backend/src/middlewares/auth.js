const jwt = require('jsonwebtoken');

const autenticar = (req, res, next) => 
    {    
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) 
        {
        return res.status(401).json({error: 'Acceso denegado. Token no proporcionado.'});
    }
    
    try 
    {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = decoded;
        next();
    }
    catch (error) 
    {
        res.status(400).json({error: 'Token inválido.'});
    }
};

const autorizar = (roles) => (req, res, next) =>
{
    if (!roles.includes(req.usuario.rol)) 
    {
        return res.status(403).json({error: 'Acceso denegado. No tienes permiso para realizar esta acción.'});
    }
    next();
};

module.exports = {autenticar, autorizar};
