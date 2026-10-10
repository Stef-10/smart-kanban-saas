import os
from datetime import timedelta

from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash

from models import db, User, Board
from security import init_security

load_dotenv()

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///kanban.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=2)

CORS(app)
db.init_app(app)
init_security(app)

with app.app_context():
    db.create_all()


@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()

    if not data or not data.get('name') or not data.get('email') or not data.get('password'):
        return jsonify({"message": "Faltan campos obligatorios"}), 400

    if User.query.filter_by(email=data['email']).first():
        return jsonify({"message": "El correo electrónico ya está registrado"}), 400

    hashed_password = generate_password_hash(data['password'], method='scrypt')

    new_user = User(
        name=data['name'],
        email=data['email'],
        password=hashed_password
    )

    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "Usuario registrado exitosamente"}), 201


@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()

    if not data or not data.get('email') or not data.get('password'):
        return jsonify({"message": "Email y contraseña son obligatorios"}), 400

    user = User.query.filter_by(email=data['email']).first()

    if not user or not check_password_hash(user.password, data['password']):
        return jsonify({"message": "Credenciales incorrectas"}), 401

    token = create_access_token(identity=str(user.id))

    return jsonify({
        "token": token,
        "user": {"id": user.id, "name": user.name, "email": user.email}
    }), 200


@app.route('/api/me', methods=['GET'])
@jwt_required()
def me():
    return jsonify(user_id=get_jwt_identity()), 200
def get_owned_board(board_id):
    return Board.query.filter_by(id=board_id, owner_id=int(get_jwt_identity())).first()


@app.route('/api/boards', methods=['GET'])
@jwt_required()
def list_boards():
    user_id = int(get_jwt_identity())
    boards = Board.query.filter_by(owner_id=user_id).order_by(Board.created_at.desc()).all()
    return jsonify([b.to_dict() for b in boards]), 200


@app.route('/api/boards', methods=['POST'])
@jwt_required()
def create_board():
    data = request.get_json(silent=True) or {}
    name = (data.get('name') or '').strip()

    if not name:
        return jsonify({"message": "El nombre del tablero es obligatorio"}), 400

    board = Board(
        name=name,
        description=(data.get('description') or '').strip(),
        owner_id=int(get_jwt_identity()),
    )
    db.session.add(board)
    db.session.commit()

    return jsonify(board.to_dict()), 201

@app.route('/api/boards/<int:board_id>', methods=['PUT'])
@jwt_required()
def update_board(board_id):
    board = get_owned_board(board_id)
    if not board:
        return jsonify({"message": "Tablero no encontrado"}), 404

    data = request.get_json(silent=True) or {}

    if 'name' in data:
        name = (data.get('name') or '').strip()
        if not name:
            return jsonify({"message": "El nombre del tablero es obligatorio"}), 400
        board.name = name

    if 'description' in data:
        board.description = (data.get('description') or '').strip()

    db.session.commit()
    return jsonify(board.to_dict()), 200


@app.route('/api/boards/<int:board_id>', methods=['DELETE'])
@jwt_required()
def delete_board(board_id):
    board = get_owned_board(board_id)
    if not board:
        return jsonify({"message": "Tablero no encontrado"}), 404

    db.session.delete(board)
    db.session.commit()
    return jsonify({"message": "Tablero eliminado"}), 200


if __name__ == '__main__':
    app.run(debug=True, port=5000)