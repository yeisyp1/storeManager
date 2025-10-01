const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

const usuarioR = require('./routes/usuarioR');
const productoR = require('./routes/productoR');
const authR = require('./routes/authR');
const reportesR = require('./routes/reportesR');
const cajaR = require('./routes/cajaR');

app.use('/api/usuarios', usuarioR);
app.use('/api/productos', productoR);
app.use('/api/auth', authR);
app.use('/api/reportes', reportesR);    // ← Ahora con /api
app.use('/api/caja', cajaR);

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
