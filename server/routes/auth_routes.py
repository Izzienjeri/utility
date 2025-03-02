from flask import Blueprint, request, jsonify
from flask_restful import Api, Resource
from models import db, User, user_schema
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
import datetime

auth_blueprint = Blueprint("auth", __name__)
api = Api(auth_blueprint)

class Register(Resource):
    def post(self):
        data = request.get_json()
        
        errors = user_schema.validate(data)
        if errors:
            return {"errors": errors}, 400
        
        if User.query.filter_by(email=data["email"]).first():
            return {"message": "Email already exists"}, 400
        
        new_user = User(
            full_name=data["full_name"],
            email=data["email"],
            phone=data["phone"],
            password=data["password"]
        )
        db.session.add(new_user)
        db.session.commit()

        return jsonify({"message": "User registered successfully", "user": user_schema.dump(new_user)})

class Login(Resource):
    def post(self):
        data = request.get_json()
        email = data.get("email")
        password = data.get("password")

        user = User.query.filter_by(email=email).first()
        if not user or not user.check_password(password):
            return {"message": "Invalid credentials"}, 401
        
        access_token = create_access_token(identity=user.id, expires_delta=datetime.timedelta(days=1))
        return jsonify({"access_token": access_token})

api.add_resource(Register, "/register")
api.add_resource(Login, "/login")
