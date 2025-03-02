from flask import Blueprint, request, jsonify
from flask_restful import Api, Resource
from models import db, Bill, bill_schema, bills_schema
from flask_jwt_extended import jwt_required, get_jwt_identity

bill_blueprint = Blueprint("bills", __name__)
api = Api(bill_blueprint)

class BillResource(Resource):
    @jwt_required()
    def post(self):
        data = request.get_json()
        user_id = get_jwt_identity()
        
        errors = bill_schema.validate(data)
        if errors:
            return {"errors": errors}, 400
        
        new_bill = Bill(
            user_id=user_id,
            bill_type=data["bill_type"],
            amount=data["amount"],
            payment_method=data["payment_method"],
            account_number=data["account_number"],
            due_date=data["due_date"],
            status="Pending"
        )

        db.session.add(new_bill)
        db.session.commit()
        return jsonify({"message": "Bill added successfully", "bill": bill_schema.dump(new_bill)})

    @jwt_required()
    def get(self):
        user_id = get_jwt_identity()
        bills = Bill.query.filter_by(user_id=user_id).all()
        return jsonify(bills_schema.dump(bills))

api.add_resource(BillResource, "/")
