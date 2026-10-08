from flask import jsonify
from flask_jwt_extended import JWTManager

jwt = JWTManager()

def init_security(app):
    jwt.init_app(app)

    @jwt.unauthorized_loader          # no mandaron token
    def missing_token(reason):
        return jsonify(error="Token requerido"), 401

    @jwt.invalid_token_loader         # token mal formado o firma falsa
    def invalid_token(reason):
        return jsonify(error="Token inválido"), 401

    @jwt.expired_token_loader         # token vencido
    def expired_token(jwt_header, jwt_payload):
        return jsonify(error="Token expirado"), 401