import os
from datetime import timedelta

from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy import or_

from models import db, User, Board, Task, Comment
from security import init_security

load_dotenv()

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///kanban.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY') or 'admin-user-ks'
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
    boards = (Board.query
          .filter(or_(Board.owner_id == user_id, Board.members.any(User.id == user_id)))
          .order_by(Board.created_at.desc()).all())
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


@app.route('/api/boards/<int:board_id>/members', methods=['POST'])
@jwt_required()
def add_board_member(board_id):
    try:
        board = get_owned_board(board_id)
        if not board:
            return jsonify({"message": "Tablero no encontrado o no tienes permisos"}), 404

        data = request.get_json(silent=True) or {}
        email_to_invite = (data.get('email') or '').strip()

        if not email_to_invite:
            return jsonify({"message": "El correo electrónico es obligatorio"}), 400

        user_to_invite = User.query.filter_by(email=email_to_invite).first()
        if not user_to_invite:
            return jsonify({"message": "El usuario con este correo no está registrado en la plataforma"}), 404

        if user_to_invite.id == board.owner_id:
            return jsonify({"message": "Eres el dueño de este tablero, ya formas parte de él"}), 400

        if not hasattr(board, 'members') or board.members is None:
            board.members = []

        if user_to_invite in board.members:
            return jsonify({"message": "Este usuario ya es colaborador de este tablero"}), 400

        board.members.append(user_to_invite)
        db.session.commit()

        return jsonify({
            "status": "success",
            "message": f"¡{user_to_invite.name} ha sido añadido como colaborador exitosamente!"
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error interno del servidor", "error": str(e)}), 500

@app.route('/api/boards/<int:board_id>/tasks', methods=['GET'])
@jwt_required()
def list_board_tasks(board_id):
    user_id = int(get_jwt_identity())
    
    board = Board.query.get(board_id)
    if not board:
        return jsonify({"message": "Tablero no encontrado"}), 404
        
    if board.owner_id != user_id and user_id not in [member.id for member in board.members]:
        return jsonify({"message": "No tienes permisos para ver este tablero"}), 403
        
    tasks = Task.query.filter_by(board_id=board_id).all()
    return jsonify([t.to_dict() for t in tasks]), 200


@app.route('/api/boards/<int:board_id>/tasks', methods=['POST'])
@jwt_required()
def create_task(board_id):
    user_id = int(get_jwt_identity())
    
    board = Board.query.get(board_id)
    if not board:
        return jsonify({"message": "Tablero no encontrado"}), 404

    if board.owner_id != user_id and user_id not in [member.id for member in board.members]:
        return jsonify({"message": "No tienes permisos para editar este tablero"}), 403

    data = request.get_json(silent=True) or {}
    title = (data.get('title') or '').strip()

    if not title:
        return jsonify({"message": "El título de la tarea es obligatorio"}), 400

    new_task = Task(
        title=title,
        description=(data.get('description') or '').strip(),
        status=(data.get('status') or 'todo').strip(),
        priority=(data.get('priority') or 'medium').strip(),
        board_id=board_id
    )
    
    db.session.add(new_task)
    db.session.commit()

    return jsonify(new_task.to_dict()), 201

@app.route('/api/boards/<int:board_id>/tasks/<int:task_id>', methods=['PUT'])
@jwt_required()
def update_task(board_id, task_id):
    user_id = int(get_jwt_identity())
    
    board = Board.query.get(board_id)
    if not board:
        return jsonify({"message": "Tablero no encontrado"}), 404

    if board.owner_id != user_id and user_id not in [member.id for member in board.members]:
        return jsonify({"message": "No tienes permisos para editar este tablero"}), 403

    task = Task.query.filter_by(id=task_id, board_id=board_id).first()
    if not task:
        return jsonify({"message": "Tarea no encontrada"}), 404

    data = request.get_json(silent=True) or {}
    
    if 'title' in data:
        title = (data.get('title') or '').strip()
        if not title:
            return jsonify({"message": "El título de la tarea no puede estar vacío"}), 400
        task.title = title

    if 'description' in data:
        task.description = (data.get('description') or '').strip()

    if 'status' in data:
        status = (data.get('status') or '').strip()
        if status not in ['todo', 'in_progress', 'done']:
            return jsonify({"message": "Estado no válido"}), 400
        task.status = status

    if 'priority' in data:
        priority = (data.get('priority') or '').strip()
        if priority not in ['low', 'medium', 'high']:
            return jsonify({"message": "Prioridad no válida"}), 400
        task.priority = priority

    db.session.commit()
    return jsonify(task.to_dict()), 200


MAX_COMMENT_LENGTH = 1000


def get_task_for_member(board_id, task_id):
    """Valida tablero, permisos (dueño o miembro) y tarea.
    Devuelve (task, None) si todo va bien, o (None, respuesta_de_error)."""
    user_id = int(get_jwt_identity())

    board = db.session.get(Board, board_id)
    if not board:
        return None, (jsonify({"message": "Tablero no encontrado"}), 404)

    if board.owner_id != user_id and user_id not in [m.id for m in board.members]:
        return None, (jsonify({"message": "No tienes permisos para este tablero"}), 403)

    task = Task.query.filter_by(id=task_id, board_id=board_id).first()
    if not task:
        return None, (jsonify({"message": "Tarea no encontrada"}), 404)

    return task, None


@app.route('/api/boards/<int:board_id>/tasks/<int:task_id>/comments', methods=['GET'])
@jwt_required()
def list_comments(board_id, task_id):
    task, error = get_task_for_member(board_id, task_id)
    if error:
        return error

    comments = (Comment.query.filter_by(task_id=task.id)
                .order_by(Comment.created_at.asc(), Comment.id.asc()).all())
    return jsonify([c.to_dict() for c in comments]), 200


@app.route('/api/boards/<int:board_id>/tasks/<int:task_id>/comments', methods=['POST'])
@jwt_required()
def create_comment(board_id, task_id):
    task, error = get_task_for_member(board_id, task_id)
    if error:
        return error

    data = request.get_json(silent=True) or {}
    content = (data.get('content') or '').strip()

    if not content:
        return jsonify({"message": "El comentario no puede estar vacío"}), 400
    if len(content) > MAX_COMMENT_LENGTH:
        return jsonify({"message": f"Máximo {MAX_COMMENT_LENGTH} caracteres"}), 400

    comment = Comment(task_id=task.id, author_id=int(get_jwt_identity()), content=content)
    db.session.add(comment)
    db.session.commit()

    return jsonify(comment.to_dict()), 201

if __name__ == '__main__':
    app.run(debug=True, port=5000)