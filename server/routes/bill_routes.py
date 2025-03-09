# server/routes/bill_routes.py
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

        # Validation: Check if only one of till_number or paybill_number is provided
        payment_option = data.get("payment_option")
        paybill_number = data.get("paybill_number")
        till_number = data.get("till_number")
        account_number = data.get("account_number")  # Added Account Number

        if payment_option == "paybill":
            if not paybill_number or not account_number:
                return {"message": "Paybill requires both Paybill Number and Account Number"}, 400
            # Till number should not be present
            if till_number:
                return {"message": "Paybill should not have a Till Number"}, 400
        elif payment_option == "till":
            if not till_number:
                return {"message": "Till requires a Till Number"}, 400

            # Paybill details should not be present
            if paybill_number or account_number:
                return {"message": "Till should not have Paybill or Account Number"}, 400
        else:
            return {"message": "Invalid payment option"}, 400

        new_bill = Bill(
            user_id=user_id,
            bill_type=data["bill_type"],
            amount=data["amount"],
            payment_option=payment_option,
            paybill_number=paybill_number,
            till_number=till_number,
            account_number=account_number,
            due_date=data["due_date"],
            status="Pending",
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