const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

const app = express();
app.use(express.json());

const db = mysql.createPool({
    host: 'junction.proxy.rlwy.net',
    user: 'root',
    password: 'rOiOtBQSjUGojZXQVcAukkFPBApVOUuu',
    database: 'Proyecto_BaseD',
    port: 21172,
});

// Registro de usuario
app.post('/registrarUsuario', async (req, res) => {
    const { nombre, apellido, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const [result] = await db.query(`
            INSERT INTO Buscador (Nombre, Apellido, TipoDoc, NumDoc, FechaNac, Email, Password)
            VALUES (?, ?, 'N/A', 'N/A', '1900-01-01', ?, ?)
        `, [nombre, apellido, email, hashedPassword]);

        res.status(200).send('Usuario registrado');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al registrar usuario');
    }
});

// Inicio de sesión
app.post('/iniciarSesion', async (req, res) => {
    const { email, password } = req.body;

    try {
        const [rows] = await db.query('SELECT * FROM Buscador WHERE Email = ?', [email]);

        if (rows.length === 0) {
            return res.status(404).send('Usuario no encontrado');
        }

        const usuario = rows[0];
        const validPassword = await bcrypt.compare(password, usuario.Password);

        if (!validPassword) {
            return res.status(401).send('Contraseña incorrecta');
        }

        res.status(200).send('Inicio de sesión exitoso');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al iniciar sesión');
    }
});

app.listen(3000, () => {
    console.log('Servidor ejecutándose en el puerto 3000');
});
