require('dotenv').config();


const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require("cors");

const app = express();


app.use(cors({
    origin: 'http://localhost:5174',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());


const usuarioR = require('./routes/usuarioR');
const productoR = require('./routes/productoR');
const authR = require('./routes/authR');
const reportesR = require('./routes/reportesR');
const cajaR = require('./routes/cajaR');

app.use('/api/usuarios', usuarioR);
app.use('/api/productos', productoR);
app.use('/api/auth', authR);
app.use('/api/reportes', reportesR);    
app.use('/api/caja', cajaR);
app.use(cors());

app.post('/api/test', (req, res) => {
    res.json({ message: 'API funcionando correctamente' });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

