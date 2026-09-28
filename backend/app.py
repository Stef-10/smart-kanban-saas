from flask import Flask, jsonify
from flask_cors import CORS

# 1. Inicializar la aplicación Flask
app = Flask(__name__)

# 2. Permitir que el frontend (React) se comunique con el backend
CORS(app)

# 3. Tu primera ruta de prueba (Endpoint RESTful)
@app.route('/api/test', methods=['GET'])
def test_route():
    return jsonify({
        "status": "success",
        "message": "¡Servidor de Flask funcionando correctamente!"
    }), 200

# 4. Arrancar el servidor en modo desarrollo
if __name__ == '__main__':
    app.run(debug=True, port=5000)
