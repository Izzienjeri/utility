from flask import Blueprint, request, jsonify
from flask_restful import Api, Resource
from models import db, Payment, Bill, User, payment_schema, payments_schema, PaymentWithBillSchema
from flask_jwt_extended import jwt_required, get_jwt_identity
from utils.mpesa import initiate_mpesa_payment
import logging

payment_blueprint = Blueprint("payments", __name__)
api = Api(payment_blueprint)
logging.basicConfig(level=logging.DEBUG)


class PaymentResource(Resource):
    @jwt_required()
    def post(self):
        data = request.get_json()
        user_id = get_jwt_identity()
        bill_id = data.get("bill_id")

        bill = Bill.query.filter_by(id=bill_id, user_id=user_id).first()
        if not bill:
            return {"message": "Bill not found"}, 404

        user = User.query.get(user_id)
        if not user:
            return {"message": "User not found"}, 404

        phone_number = user.phone
        logging.debug(f"Raw Phone Number from DB: {phone_number}")

        if phone_number.startswith("+254"):
            phone_number = phone_number[1:]
        elif phone_number.startswith("0"):
            phone_number = "254" + phone_number[1:]
        elif phone_number.startswith("7"):
            phone_number = "254" + phone_number

        logging.debug(f"Formatted Phone Number: {phone_number}")
        response = initiate_mpesa_payment(bill.amount, phone_number)

        if response.get("status") == "success":
            new_payment = Payment(
                user_id=user_id,
                bill_id=bill_id,
                amount_paid=bill.amount,
                payment_reference=response.get("CheckoutRequestID"),
                status="Pending"
            )
            db.session.add(new_payment)
            db.session.commit()

            return jsonify({"message": "Payment initiated successfully", "CheckoutRequestID": response.get("CheckoutRequestID")})
        else:
            return {"message": "Payment failed", "error": response.get("message")}, 400


class PaymentHistoryResource(Resource):
    @jwt_required()
    def get(self):
        user_id = get_jwt_identity()
        payments = Payment.query.filter_by(user_id=user_id).order_by(Payment.paid_at.desc()).limit(5).all()

        return PaymentWithBillSchema(many=True).dump(payments)


class MpesaCallbackResource(Resource):
    def post(self):
        """
        Handles the callback from M-Pesa after a transaction.
        """
        callback_data = request.get_json()
        logging.info("M-Pesa Callback Data Received: %s", callback_data)  # Log the full callback

        try:
            checkout_request_id = callback_data['Body']['stkCallback']['CheckoutRequestID']
            result_code = callback_data['Body']['stkCallback']['ResultCode']
            result_desc = callback_data['Body']['stkCallback']['ResultDesc']

            mpesa_receipt_number = None
            try:
                for item in callback_data['Body']['stkCallback']['CallbackMetadata']['Item']:
                    if item['Name'] == 'MpesaReceiptNumber':
                        mpesa_receipt_number = item['Value']
                        break

            except (KeyError, TypeError) as e:
                logging.warning(f"MpesaReceiptNumber not found in callback data: {e}. Callback data: {callback_data}")

            payment = Payment.query.filter_by(payment_reference=checkout_request_id).first()

            if not payment:
                logging.error(f"Payment with CheckoutRequestID {checkout_request_id} not found.")
                return {"message": "Payment not found"}, 404

            if result_code == 0:
                payment.status = "Completed"

                if mpesa_receipt_number:
                    payment.mpesa_receipt_number = mpesa_receipt_number
                    payment.payment_reference = mpesa_receipt_number
                else:
                    logging.info("MpesaReceiptNumber not found in callback data.  Keeping CheckoutRequestID.")

                bill = Bill.query.filter_by(id=payment.bill_id).first()
                if bill:
                    bill.status = "Paid"
                else:
                    logging.error(f"Bill with ID {payment.bill_id} not found.")
                    return {"message": f"Bill with ID {payment.bill_id} not found"}, 404

                try:
                    db.session.commit()
                    logging.info(
                        f"Payment {payment.id} and Bill {bill.id if bill else 'N/A'} updated successfully."
                    )

                    return jsonify({"message": "Payment successful", "bill_id": bill.id}), 200
                except Exception as e:
                    logging.error(f"Database commit error: {e}")
                    db.session.rollback()
                    return {"message": "Database commit error", "error": str(e)}, 500

            else:

                payment.status = "Failed"
                try:
                    db.session.commit()
                    logging.info(f"Payment {payment.id} marked as Failed.")
                except Exception as e:
                    logging.error(f"Database commit error: {e}")
                    db.session.rollback()
                    return {"message": "Database commit error", "error": str(e)}, 500

                logging.error(f"Payment failed: {result_desc}")
                return {"message": f"Payment failed: {result_desc}"}, 400

        except (KeyError, TypeError) as e:
            logging.error(f"Error processing M-Pesa callback: {e}")
            return {"message": "Invalid callback data"}, 400


api.add_resource(PaymentResource, "/pay")
api.add_resource(PaymentHistoryResource, "/history")
api.add_resource(MpesaCallbackResource, "/callback")