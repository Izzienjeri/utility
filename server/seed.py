from app import app, db
from models import User, Bill, Payment

def seed_data():
    with app.app_context():
        # Create a sample user
        user = User(
            full_name="John Doe",
            email="john@example.com",
            phone="0712345678",
            password="password123"
        )
        db.session.add(user)
        db.session.commit()

        # Create a sample bill
        bill = Bill(
            user_id=user.id,
            bill_type="Electricity",
            amount=5000,
            payment_method="Paybill",
            account_number="123456",
            due_date="2025-03-30",
            status="Pending"
        )
        db.session.add(bill)
        db.session.commit()

        # Create a sample payment
        payment = Payment(
            bill_id=bill.id,
            user_id=user.id,
            amount_paid=5000,
            payment_reference="MPESA123456",
            status="Completed"
        )
        db.session.add(payment)
        db.session.commit()

        print("✅ Database seeded successfully!")

if __name__ == "__main__":
    seed_data()
