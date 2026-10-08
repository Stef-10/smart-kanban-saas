import os
from datetime import timedelta
from dotenv import load_dotenv
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import jwt_required, get_jwt_identity
from security import init_security

load_dotenv()

app = Flask(__name__)
CORS(app)

app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)
init_security(app)

@app.route('/api/test', methods=['GET'])
def test_route():
    return jsonify({
        "status": "success",
        "message": "¡Servidor de Flask funcionando correctamente!"
    }), 200

@app.route('/api/me', methods=['GET'])
@jwt_required()
def me():
    return jsonify(user_id=get_jwt_identity()), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)