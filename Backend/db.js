const {Pool} = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'inventario_ventas',
    password: 'salemsalem',
    port: 5432,
});

module.exports = pool;