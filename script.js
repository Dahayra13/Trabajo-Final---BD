const carousel = document.querySelector('.carousel');
let isDragging = false;
let startX, scrollLeft;

// Eventos para dispositivos con mouse
carousel.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.pageX - carousel.offsetLeft;
    scrollLeft = carousel.scrollLeft;
    carousel.classList.add('active');
});

carousel.addEventListener('mouseleave', () => {
    isDragging = false;
    carousel.classList.remove('active');
});

carousel.addEventListener('mouseup', () => {
    isDragging = false;
    carousel.classList.remove('active');
});

carousel.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - carousel.offsetLeft;
    const walk = (x - startX) * 2; // Ajusta la velocidad del desplazamiento
    carousel.scrollLeft = scrollLeft - walk;
});

// Eventos para dispositivos táctiles
carousel.addEventListener('touchstart', (e) => {
    isDragging = true;
    startX = e.touches[0].pageX - carousel.offsetLeft;
    scrollLeft = carousel.scrollLeft;
});

carousel.addEventListener('touchend', () => {
    isDragging = false;
});

carousel.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    const x = e.touches[0].pageX - carousel.offsetLeft;
    const walk = (x - startX) * 2;
    carousel.scrollLeft = scrollLeft - walk;
});



/* -----------------------------------------------------------------------*/


/* CODIGO SCRIPT RELACIONADO EN MYSQL */
document.getElementById('formMascotaPerdida').addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);

    const data = Object.fromEntries(formData.entries());

    try {
        const response = await fetch('https://your-backend-url/registrarMascotaPerdida', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (response.ok) {
            alert('Registro exitoso');
        } else {
            alert('Error al registrar');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Hubo un problema con el registro.');
    }
});





/* SEGUNDA PARTE RELACIONADO MYSQL */ 
const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
app.use(express.json());

const db = mysql.createPool({
    host: 'junction.proxy.rlwy.net',
    user: 'root',
    password: 'rOiOtBQSjUGojZXQVcAukkFPBApVOUuu',
    database: 'Proyecto_BaseD',
    port: 21172,
});

app.post('/registrarMascotaPerdida', async (req, res) => {
    const {
        tipoDoc, numDoc, nombreDueño, apellidoDueño, fechaNacDueño,
        nombreMascota, animal, raza, direccionPerdida, distrito, provincia,
    } = req.body;

    try {
        const connection = await db.getConnection();
        await connection.beginTransaction();

        const [dueñoResult] = await connection.query(`
            INSERT INTO Dueño (TipoDoc, NumDoc, Nombre, Apellido, FechaNac)
            VALUES (?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE idDueño = LAST_INSERT_ID(idDueño)
        `, [tipoDoc, numDoc, nombreDueño, apellidoDueño, fechaNacDueño]);

        const idDueño = dueñoResult.insertId;

        const [mascotaResult] = await connection.query(`
            INSERT INTO Mascota (Nombre, Animal, Raza)
            VALUES (?, ?, ?)
        `, [nombreMascota, animal, raza]);

        const idMascota = mascotaResult.insertId;

        await connection.query(`
            INSERT INTO Dueño_has_Mascota (idDueño, idMascota)
            VALUES (?, ?)
        `, [idDueño, idMascota]);

        await connection.query(`
            INSERT INTO MePerdi (Direccion, Distrito, Provincia, Fecha, Mascota_idMascota)
            VALUES (?, ?, ?, NOW(), ?)
        `, [direccionPerdida, distrito, provincia, idMascota]);

        await connection.commit();
        res.status(200).send('Registro exitoso');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al registrar los datos');
    }
});

app.listen(3000, () => {
    console.log('Servidor ejecutándose en el puerto 3000');
});






/* BUSCADORES */


document.getElementById('toggleRegister').addEventListener('click', () => {
    const formTitle = document.getElementById('form-title');
    const authForm = document.getElementById('authForm');
    const toggleRegister = document.getElementById('toggleRegister');

    if (formTitle.textContent === 'Iniciar Sesión') {
        formTitle.textContent = 'Registrarse';
        toggleRegister.textContent = '¿Ya tienes cuenta? Inicia sesión aquí';

        authForm.innerHTML = `
            <label for="nombre">Nombre</label>
            <input type="text" id="nombre" name="nombre" required>

            <label for="apellido">Apellido</label>
            <input type="text" id="apellido" name="apellido" required>

            <label for="email">Correo Electrónico</label>
            <input type="email" id="email" name="email" required>

            <label for="password">Contraseña</label>
            <input type="password" id="password" name="password" required>

            <button type="submit">Registrarse</button>
        `;
    } else {
        formTitle.textContent = 'Iniciar Sesión';
        toggleRegister.textContent = '¿No tienes cuenta? Regístrate aquí';

        authForm.innerHTML = `
            <label for="email">Correo Electrónico</label>
            <input type="email" id="email" name="email" required>

            <label for="password">Contraseña</label>
            <input type="password" id="password" name="password" required>

            <button type="submit">Iniciar Sesión</button>
        `;
    }
});

document.getElementById('authForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
    const isRegister = document.getElementById('form-title').textContent === 'Registrarse';

    try {
        const response = await fetch(isRegister ? '/registrarUsuario' : '/iniciarSesion', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (response.ok) {
            alert(isRegister ? 'Registro exitoso' : 'Inicio de sesión exitoso');
        } else {
            alert('Error al procesar la solicitud');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Hubo un problema con la solicitud.');
    }
});
