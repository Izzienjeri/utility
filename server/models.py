# models.py
# server/models.py

import uuid
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_marshmallow import Marshmallow
from datetime import datetime
from marshmallow import fields, validate


db = SQLAlchemy()
bcrypt = Bcrypt()
ma = Marshmallow()


def generate_uuid():
    """Generate a UUID for primary keys"""
    return str(uuid.uuid4())


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    full_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(15), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __init__(self, full_name, email, phone, password):
        self.id = generate_uuid()
        self.full_name = full_name
        self.email = email
        self.phone = phone
        self.password_hash = bcrypt.generate_password_hash(password).decode("utf-8")

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)


class Bill(db.Model):
    __tablename__ = "bills"

    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    user_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False)
    bill_type = db.Column(db.String(50), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    payment_option = db.Column(db.String(50), nullable=False, default="paybill")  #'paybill' enforced
    paybill_number = db.Column(db.String(50), nullable=False) #Paybill Number enforce not null
    account_number = db.Column(db.String(50), nullable=False)  # Account Number (for Paybill) enforce not null
    due_date = db.Column(db.Date, nullable=False)
    status = db.Column(db.String(20), default="Pending")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship("User", backref="bills")



class Payment(db.Model):
    __tablename__ = "payments"

    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    bill_id = db.Column(db.String(36), db.ForeignKey("bills.id"), nullable=False)
    user_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False)
    amount_paid = db.Column(db.Float, nullable=False)
    payment_reference = db.Column(db.String(100), nullable=False) # Changed unique=True to unique=False
    mpesa_receipt_number = db.Column(db.String(100), nullable=True) #  NEW: M-Pesa transaction code
    status = db.Column(db.String(20), default="Completed")
    paid_at = db.Column(db.DateTime, default=datetime.utcnow)

    bill = db.relationship("Bill", backref="payments")
    user = db.relationship("User", backref="payments")


class UserSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = User
        load_instance = True
        exclude = ("password_hash",)

    full_name = fields.String(required=True, validate=validate.Length(min=2, max=100))
    email = fields.Email(required=True)
    phone = fields.String(required=True, validate=validate.Length(min=10, max=15))
    password = fields.String(required=True, validate=validate.Length(min=8), load_only=True)


class BillSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Bill
        load_instance = True

class PaymentSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Payment
        load_instance = True
        datetimeformat = "%Y-%m-%dT%H:%M:%S" # ISO FORMAT

class PaymentWithBillSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Payment
        load_instance = True
        datetimeformat = "%Y-%m-%dT%H:%M:%S"

    bill = fields.Nested(BillSchema) # Nest the bill schema to serialize the bill object



user_schema = UserSchema()
users_schema = UserSchema(many=True)
bill_schema = BillSchema()
bills_schema = BillSchema(many=True)
payment_schema = PaymentSchema()
payments_schema = PaymentSchema(many=True)
payment_with_bill_schema = PaymentWithBillSchema() #This may be unused but can keep if needed in the future