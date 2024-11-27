from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import mysql.connector

app = Flask(__name__)
CORS(app)

# Configuración de conexión a la base de datos MySQL
db_config = {
    'host': 'junction.proxy.rlwy.net',
    'user': 'root',
    'password': 'qNtopVZkklHjkFSGsXMPELvfYFYTJOMm',
    'database': 'Proyecto_BaseD',
    'port': 37887
}

def connect_db():
    """Establece la conexión con la base de datos."""
    return mysql.connector.connect(**db_config)

# Ruta para el buscador
@app.route('/buscador', methods=['GET'])
def buscador():
    """Renderiza la página del buscador."""
    return render_template('buscador.html')

# Ruta principal
@app.route('/')
def index():
    """Renderiza la página principal."""
    return render_template('index.html')

# Ruta para el formulario
@app.route('/formulario', methods=['GET'])
def formulario():
    return render_template('formulario.html')


# API: Registro de Dueño y Mascota
@app.route('/api/register', methods=['POST'])
def register_pet():
    # Código de registro


    try:
        # Validar "Condición Médica"
        condicion_medica = data['CondicionMedica'].upper()  # Convierte a mayúsculas
        if condicion_medica not in ['SI', 'NO']:
            return jsonify({'error': 'Condición Médica debe ser SI o NO'}), 400

        # Configura el valor de "Especificación" automáticamente
        especificacion = "No aplica" if condicion_medica == 'NO' else data.get('Especificacion', '')

        # Insertar dueño en la tabla Dueño
        dueño_query = """
        INSERT INTO Dueño (TipoDoc, NumDoc, Nombre, Apellido, FechaNac) 
        VALUES (%s, %s, %s, %s, %s)
        """
        dueño_values = (data['TipoDoc'], data['NumDoc'], data['Nombre'], data['Apellido'], data['FechaNac'])
        cursor.execute(dueño_query, dueño_values)
        dueño_id = cursor.lastrowid  # Obtener el ID del dueño

        # Insertar mascota en la tabla Mascota
        mascota_query = """
        INSERT INTO Mascota (Nombre, Animal, Raza, FechaNac, CondicionMedica, Especificacion)
        VALUES (%s, %s, %s, %s, %s, %s)
        """
        mascota_values = (
            data['NombreMascota'], data['Animal'], data['Raza'], data['FechaNacMascota'],
            condicion_medica, especificacion
        )
        cursor.execute(mascota_query, mascota_values)
        mascota_id = cursor.lastrowid  # Obtener el ID de la mascota

        # Relacionar dueño con mascota en Dueño_has_Mascota
        relacion_query = """
        INSERT INTO Dueño_has_Mascota (idDueño, idMascota) VALUES (%s, %s)
        """
        cursor.execute(relacion_query, (dueño_id, mascota_id))

        # Confirmar los cambios
        conn.commit()
        return jsonify({'message': 'Registro exitoso'}), 201
    except Exception as e:
        # En caso de error, revertir los cambios
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# API: Obtener todas las mascotas registradas
@app.route('/api/mascotas', methods=['GET'])
def get_mascotas():
    """Obtiene todas las mascotas registradas."""
    conn = connect_db()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT idMascota, Nombre, Animal, Raza, CondicionMedica
            FROM Mascota
        """)
        mascotas = cursor.fetchall()
        return jsonify(mascotas)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# API: Eliminar mascota
@app.route('/api/mascota/<int:id>', methods=['DELETE'])
def delete_mascota(id):
    """Elimina una mascota específica."""
    conn = connect_db()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM Mascota WHERE idMascota = %s", (id,))
        conn.commit()
        return jsonify({'message': 'Mascota eliminada'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# API: Actualizar mascota
@app.route('/api/mascota/<int:id>', methods=['PUT'])
def update_mascota(id):
    """Actualiza los datos de una mascota específica."""
    data = request.json
    conn = connect_db()
    cursor = conn.cursor()
    try:
        query = """
        UPDATE Mascota 
        SET Nombre = %s, Animal = %s, Raza = %s, FechaNac = %s, CondicionMedica = %s, Especificacion = %s
        WHERE idMascota = %s
        """
        values = (
            data['Nombre'], data['Animal'], data['Raza'], data['FechaNac'],
            data.get('CondicionMedica', ''), data.get('Especificacion', ''), id
        )
        cursor.execute(query, values)
        conn.commit()
        return jsonify({'message': 'Mascota actualizada'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

if __name__ == '__main__':
    app.run(debug=True)
