const{PrismaClient}=require('@prisma/client');
const prisma = new PrismaClient();

const getUsuarios = async(req,res) => {

    try
    {
        const usuarios = await prisma.usuario.findMany();
        res.json(usuarios);
    }
    catch(error)
    {
        res.status(500).json({error: error.message});
    }
};

const crearUsuario = async(req,res) => {
   const {username, password, rol} = req.body;
   
   try
   {
    const nuevoUsuario = await prisma.usuario.create({
        data: {
            username, password, rol}
    });
    res.status(201).json(nuevoUsuario);
    }

    catch(error)
    {
        res.status(500).json({error: error.message});
    }



   } 

       module.exports = {getUsuarios, crearUsuario};
