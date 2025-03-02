import uuid
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from datetime import datetime

# Initialize SQLAlchemy and Bcrypt
db = SQLAlchemy()
bcrypt = Bcrypt()

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
        self.full_name = full_name
        self.email = email
        self.phone = phone
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)

    def __repr__(self):
        return f"<User {self.full_name} - {self.email}>"

class Bill(db.Model):
    __tablename__ = "bills"

    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    user_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False)
    bill_type = db.Column(db.String(50), nullable=False)  # Electricity, Rent, Water, etc.
    amount = db.Column(db.Float, nullable=False)
    payment_method = db.Column(db.String(50), nullable=False)  # Paybill, Till, Send Money
    account_number = db.Column(db.String(50), nullable=False)
    due_date = db.Column(db.Date, nullable=False)
    status = db.Column(db.String(20), default="Pending")  # Pending, Paid
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship("User", backref="bills")

    def __repr__(self):
        return f"<Bill {self.bill_type} - {self.amount} KES - {self.status}>"

class Payment(db.Model):
    __tablename__ = "payments"

    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    bill_id = db.Column(db.String(36), db.ForeignKey("bills.id"), nullable=False)
    user_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False)
    amount_paid = db.Column(db.Float, nullable=False)
    payment_reference = db.Column(db.String(100), unique=True, nullable=False)
    status = db.Column(db.String(20), default="Completed")  # Completed, Failed
    paid_at = db.Column(db.DateTime, default=datetime.utcnow)

    bill = db.relationship("Bill", backref="payments")
    user = db.relationship("User", backref="payments")

    def __repr__(self):
        return f"<Payment {self.payment_reference} - {self.amount_paid} KES - {self.status}>"
