const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API corriendo ");
});

// Ruta de productos
app.get('/productos', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM productos');     
        res.json(result.rows);
    } catch (err) {
        console.error('Error', err.message);
        res.status(500).send('Error en el servidor');
    }
});

app.listen (3000, () => {
    console.log('Servidor iniciado');
});
