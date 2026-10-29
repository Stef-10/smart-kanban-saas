from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

board_members = db.Table('board_members',
    db.Column('user_id', db.Integer, db.ForeignKey('users.id', ondelete="CASCADE"), primary_key=True),
    db.Column('board_id', db.Integer, db.ForeignKey('boards.id', ondelete="CASCADE"), primary_key=True)
)


class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class Board(db.Model):
    __tablename__ = 'boards'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(255), default='')
    owner_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    owner = db.relationship('User', backref='boards')

    members = db.relationship('User', secondary=board_members, lazy='subquery', backref=db.backref('collaborating_boards', lazy=True))

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "owner_id": self.owner_id,
            "created_at": self.created_at.isoformat(),
            "members": [user.id for user in self.members]
        }

class Task(db.Model):
    __tablename__ = 'tasks'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(50), default='todo', nullable=False)
    priority = db.Column(db.String(30), default='medium', nullable=False)
    
    due_date = db.Column(db.DateTime, nullable=True)
    assigned_to_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    board_id = db.Column(db.Integer, db.ForeignKey('boards.id', ondelete="CASCADE"), nullable=False)
    
    board = db.relationship('Board', backref=db.backref('tasks', lazy=True, cascade="all, delete-orphan"))

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "status": self.status,
            "priority": self.priority,
            "due_date": self.due_date.isoformat() if self.due_date else None,
            "assigned_to_id": self.assigned_to_id,
            "board_id": self.board_id,
            "created_at": self.created_at.isoformat()
        }


class Comment(db.Model):
    __tablename__ = 'comments'

    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    task_id = db.Column(db.Integer, db.ForeignKey('tasks.id', ondelete="CASCADE"), nullable=False)
    author_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    task = db.relationship('Task', backref=db.backref('comments', lazy=True, cascade="all, delete-orphan"))
    author = db.relationship('User')

    def to_dict(self):
        return {
            "id": self.id,
            "task_id": self.task_id,
            "content": self.content,
            "created_at": self.created_at.isoformat() + "Z",
            "author": {"id": self.author.id, "name": self.author.name},
        }