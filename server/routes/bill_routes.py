# routes/bill_routes.py

from flask import Blueprint, request, jsonify
from flask_restful import Api, Resource
from models import db, Bill, bill_schema, bills_schema
from flask_jwt_extended import jwt_required, get_jwt_identity
import logging  # Import the logging module

# Configure logging
logging.basicConfig(level=logging.DEBUG)  # Set the logging level to DEBUG

bill_blueprint = Blueprint("bills", __name__)
api = Api(bill_blueprint)


class BillListResource(Resource):  # Handles the / endpoint (list of bills)
    @jwt_required()
    def post(self):
        data = request.get_json()
        user_id = get_jwt_identity()
        logging.debug(f"Received bill data: {data}")

        errors = bill_schema.validate(data)
        if errors:
            logging.debug(f"Validation errors: {errors}")  # Log the errors
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

        new_bill = Bill()  # Create an empty Bill object
        new_bill.user_id = user_id
        new_bill.bill_type = data["bill_type"]
        new_bill.amount = data["amount"]
        new_bill.payment_option = payment_option
        new_bill.due_date = data["due_date"]
        new_bill.status = "Pending"  # Default Status

        # Conditionally add paybill or till number
        if payment_option == "paybill":
            new_bill.paybill_number = paybill_number
            new_bill.account_number = account_number
        elif payment_option == "till":
            new_bill.till_number = till_number

        db.session.add(new_bill)
        db.session.commit()
        return jsonify({"message": "Bill added successfully", "bill": bill_schema.dump(new_bill)})

    @jwt_required()
    def get(self):
        user_id = get_jwt_identity()
        bills = Bill.query.filter_by(user_id=user_id).all()
        return jsonify(bills_schema.dump(bills))

class BillResource(Resource):  # Handles the /<string:bill_id> endpoint (single bill)
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

      # Validate data before updating
      errors = bill_schema.validate(data)
      if errors:
          return {"errors": errors}, 400

      # Validate payment option and associated data
      payment_option = data.get("payment_option")
      paybill_number = data.get("paybill_number")
      till_number = data.get("till_number")
      account_number = data.get("account_number")

      if payment_option == "paybill":
          if not paybill_number or not account_number:
              return {"message": "Paybill requires both Paybill Number and Account Number"}, 400
          if till_number:
              return {"message": "Paybill should not have a Till Number"}, 400
      elif payment_option == "till":
          if not till_number:
              return {"message": "Till requires a Till Number"}, 400
          if paybill_number or account_number:
              return {"message": "Till should not have Paybill or Account Number"}, 400
      else:
          return {"message": "Invalid payment option"}, 400

      # Update bill attributes
      bill.bill_type = data["bill_type"]
      bill.amount = data["amount"]
      bill.payment_option = payment_option
      bill.paybill_number = paybill_number
      bill.till_number = till_number
      bill.account_number = account_number
      bill.due_date = data["due_date"]
      # Do not change status in edit, keep the existing one
      # bill.status = "Pending"  # Consider not changing the status during edit

      db.session.commit()
      return jsonify({"message": "Bill updated successfully", "bill": bill_schema.dump(bill)})

api.add_resource(BillListResource, "/") #route to get multiple bills
api.add_resource(BillResource, "/<string:bill_id>") #route to get a single bill with edits, deletes and gets