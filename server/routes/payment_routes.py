from flask import Blueprint, request, jsonify
from flask_restful import Api, Resource
from models import db, Payment, Bill, payment_schema
from flask_jwt_extended import jwt_required, get_jwt_identity
from utils.mpesa import initiate_mpesa_payment

payment_blueprint = Blueprint("payments", __name__)
api = Api(payment_blueprint)

class PaymentResource(Resource):
    @jwt_required()
    def post(self):
        data = request.get_json()
        user_id = get_jwt_identity()
        bill_id = data.get("bill_id")

        bill = Bill.query.filter_by(id=bill_id, user_id=user_id).first()
        if not bill:
            return {"message": "Bill not found"}, 404
        
        response = initiate_mpesa_payment(bill.amount, bill.payment_method)
        if response.get("status") == "success":
            new_payment = Payment(
                user_id=user_id,
                bill_id=bill_id,
                amount_paid=bill.amount,
                payment_reference=response.get("transaction_id"),
                status="Completed"
            )
            db.session.add(new_payment)
            db.session.commit()

            bill.status = "Paid"
            db.session.commit()

            return jsonify({"message": "Payment successful", "transaction_id": response.get("transaction_id")})
        return {"message": "Payment failed"}, 400

api.add_resource(PaymentResource, "/pay")
