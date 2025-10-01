const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

// Rutas
const usuarioR = require('./routes/usuarioR');
const productoR = require('./routes/productoR');

app.use('/usuarios', usuarioR);
app.use('/productos', productoR);

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
