# routes/payment_routes.py

from flask import Blueprint, request, jsonify
from flask_restful import Api, Resource
from models import db, Payment, Bill, User, payment_schema, payments_schema  # Import payments_schema and User
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

        user = User.query.get(user_id)  # Get the user object to access phone number
        if not user:
            return {"message": "User not found"}, 404

        phone_number = user.phone  # Get the user's phone number

        response = initiate_mpesa_payment(bill.amount, phone_number)
        if response.get("status") == "success":
            new_payment = Payment(
                user_id=user_id,
                bill_id=bill_id,
                amount_paid=bill.amount,
                payment_reference=response.get("CheckoutRequestID"), #Use CheckoutRequestID here
                status="Pending"  # Set status to "Pending" initially
            )
            db.session.add(new_payment)
            db.session.commit()

            #Bill status does not change on payment, it is updated in the callback

            return jsonify({"message": "Payment initiated successfully", "CheckoutRequestID": response.get("CheckoutRequestID")}) #return checkout request ID
        return {"message": "Payment failed", "error": response.get("message")}, 400


class PaymentHistoryResource(Resource):  # NEW RESOURCE
    @jwt_required()
    def get(self):
        user_id = get_jwt_identity()
        payments = Payment.query.filter_by(user_id=user_id).order_by(Payment.paid_at.desc()).limit(5).all() # get the last 5 payments

        return jsonify(payments_schema.dump(payments)) #Use payments_schema to handle multiple payments

# NEW CALLBACK ROUTE
class MpesaCallbackResource(Resource):
    def post(self):
        """
        Handles the callback from M-Pesa after a transaction.
        """
        callback_data = request.get_json()
        print("M-Pesa Callback Data:", callback_data)  # Log the callback data

        # Extract relevant information from the callback
        try:
            checkout_request_id = callback_data['Body']['stkCallback']['CheckoutRequestID']
            result_code = callback_data['Body']['stkCallback']['ResultCode']
            result_desc = callback_data['Body']['stkCallback']['ResultDesc']

            # Find the payment by CheckoutRequestID
            payment = Payment.query.filter_by(payment_reference=checkout_request_id).first()

            if not payment:
                print(f"Payment with CheckoutRequestID {checkout_request_id} not found.")
                return {"message": "Payment not found"}, 404

            if result_code == 0:
                # Payment was successful
                payment.status = "Completed"

                #Update the bill
                bill = Bill.query.filter_by(id=payment.bill_id).first()
                bill.status = "Paid"


                db.session.commit()
                return {"message": "Payment successful"}, 200
            else:
                # Payment failed or was cancelled
                payment.status = "Failed"
                db.session.commit()
                print(f"Payment failed: {result_desc}")
                return {"message": f"Payment failed: {result_desc}"}, 400

        except (KeyError, TypeError) as e:
            print(f"Error processing M-Pesa callback: {e}")
            return {"message": "Invalid callback data"}, 400

api.add_resource(PaymentResource, "/pay")
api.add_resource(PaymentHistoryResource, "/history")  # NEW ROUTE
api.add_resource(MpesaCallbackResource, "/callback") #This is the callback URL