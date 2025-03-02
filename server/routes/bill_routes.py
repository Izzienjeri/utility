from flask import Blueprint, request, jsonify
from flask_restful import Api, Resource
from models import db, Bill
from flask_jwt_extended import jwt_required, get_jwt_identity

bill_blueprint = Blueprint("bills", __name__)
api = Api(bill_blueprint)

class BillResource(Resource):
    @jwt_required()
    def post(self):
        data = request.get_json()
        user_id = get_jwt_identity()
        
        new_bill = Bill(
            user_id=user_id,
            name=data.get("name"),
            amount=data.get("amount"),
            due_date=data.get("due_date"),
            payment_details=data.get("payment_details"),
            status="pending"
        )

        db.session.add(new_bill)
        db.session.commit()
        return {"message": "Bill added successfully"}, 201

    @jwt_required()
    def get(self):
        user_id = get_jwt_identity()
        bills = Bill.query.filter_by(user_id=user_id).all()
        return [bill.to_dict() for bill in bills], 200

api.add_resource(BillResource, "/")
