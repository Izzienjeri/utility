# routes/bill_routes.py

from flask import Blueprint, request, jsonify
from flask_restful import Api, Resource
from models import db, Bill, bill_schema, bills_schema
from flask_jwt_extended import jwt_required, get_jwt_identity
import logging
from marshmallow import ValidationError

logging.basicConfig(level=logging.DEBUG)

bill_blueprint = Blueprint("bills", __name__)
api = Api(bill_blueprint)


class BillListResource(Resource):
    @jwt_required()
    def post(self):
        data = request.get_json()
        user_id = get_jwt_identity()
        logging.debug(f"Received bill data: {data}")

        # Check if the data is a list or a single dictionary
        if isinstance(data, list):
            bills_data = data
        else:
            bills_data = [data]  # Convert to a list if it's a single bill

        created_bills = []
        validation_errors = []

        for bill_data in bills_data:
            # Validate required fields at the start of the loop
            if not all(k in bill_data for k in ("bill_type", "amount", "paybill_number", "account_number", "due_date")):
                validation_errors.append({"message": "Missing required fields", "bill_data": bill_data})
                continue  # Skip to the next bill

            # Enforce paybill payment option, always
            bill_data["payment_option"] = "paybill"

            # Validation: Check if only paybill number and account number are provided
            paybill_number = bill_data.get("paybill_number")
            account_number = bill_data.get("account_number")

            if not paybill_number or not account_number:
                 validation_errors.append({"message": "Paybill requires both Paybill Number and Account Number", "bill_data": bill_data})
                 continue  # Skip to the next bill

            try:
                # Load data into the schema for validation
                bill = bill_schema.load(bill_data)  # load() returns a dictionary of validated fields
                new_bill = Bill(
                    user_id = user_id,
                    bill_type=bill['bill_type'],
                    amount=bill['amount'],
                    payment_option=bill['payment_option'],
                    paybill_number=bill['paybill_number'],
                    account_number=bill['account_number'],
                    due_date=bill['due_date']
                ) # Create a Bill object from the validated data
                db.session.add(new_bill)
                created_bills.append(bill_schema.dump(new_bill))  # Dump back to serialized form for the response


            except ValidationError as err:
                logging.debug(f"Validation errors: {err.messages}")
                validation_errors.append({"message": "Validation error", "errors": err.messages, "bill_data": bill_data})
                db.session.rollback() # Important: Rollback the session on error


        if validation_errors:
            return {"message": "Some bills failed validation", "errors": validation_errors}, 400

        try:
            db.session.commit()
            return {"message": "Bills added successfully", "bills": created_bills}, 201 # Return a dictionary!
        except Exception as e:
            db.session.rollback() # Rollback in case of error!
            logging.error(f"Database commit error: {e}")
            return {"message": "Database commit error", "error": str(e)}, 500 # Return a dictionary!

    @jwt_required()
    def get(self):
        user_id = get_jwt_identity()
        bills = Bill.query.filter_by(user_id=user_id).all()
        return jsonify(bills_schema.dump(bills))


class BillResource(Resource):
    @jwt_required()
    def get(self, bill_id):
        user_id = get_jwt_identity()
        bill = Bill.query.filter_by(id=bill_id, user_id=user_id).first()
        if not bill:
            return {"message": "Bill not found or unauthorized"}, 404
        return jsonify(bill_schema.dump(bill))

    @jwt_required()
    def delete(self, bill_id):
        user_id = get_jwt_identity()
        bill = Bill.query.filter_by(id=bill_id, user_id=user_id).first()
        if not bill:
            return {"message": "Bill not found or unauthorized"}, 404

        db.session.delete(bill)
        db.session.commit()
        return {"message": "Bill deleted successfully"}, 200

    @jwt_required()
    def put(self, bill_id):
        data = request.get_json()
        user_id = get_jwt_identity()

        bill = Bill.query.filter_by(id=bill_id, user_id=user_id).first()
        if not bill:
            return {"message": "Bill not found or unauthorized"}, 404

        # Validate required fields (bill_schema validation isn't sufficient)
        if not all(k in data for k in ("bill_type", "amount", "paybill_number", "account_number", "due_date")):
            return {"message": "Missing required fields"}, 400

        errors = bill_schema.validate(data)
        if errors:
            return {"errors": errors}, 400

         # Enforce paybill payment option, always
        data["payment_option"] = "paybill"

        paybill_number = data.get("paybill_number")
        account_number = data.get("account_number")

        if not paybill_number or not account_number:
            return {"message": "Paybill requires both Paybill Number and Account Number"}, 400


        bill.bill_type = data["bill_type"]
        bill.amount = data["amount"]
        bill.payment_option = "paybill"  # Enforce paybill
        bill.paybill_number = paybill_number
        bill.account_number = account_number
        bill.due_date = data["due_date"]

        db.session.commit()
        return {"message": "Bill updated successfully", "bill": bill_schema.dump(bill)}


api.add_resource(BillListResource, "/")
api.add_resource(BillResource, "/<string:bill_id>")