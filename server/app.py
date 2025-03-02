from flask import Flask
from flask_migrate import Migrate # Import Flask-Migrate
from flask_jwt_extended import JWTManager
from flask_mail import Mail
from flask_cors import CORS
from celery import Celery
from config import Config
from models import db, bcrypt
from routes.auth_routes import auth_blueprint
from routes.bill_routes import bill_blueprint
from routes.payment_routes import payment_blueprint
from flask_marshmallow import Marshmallow


# Initialize Celery
def make_celery(app):
    celery = Celery(
        app.import_name,
        broker=app.config['CELERY_BROKER_URL'],
        backend=app.config['CELERY_RESULT_BACKEND']
    )
    celery.conf.update(app.config)
    return celery

# Initialize Flask App
app = Flask(__name__)
app.config.from_object(Config)

# Initialize Extensions
db.init_app(app)
bcrypt.init_app(app)
jwt = JWTManager(app)
mail = Mail(app)
CORS(app)
ma = Marshmallow(app)  # 🔥 Add this line

# Initialize Celery
celery = make_celery(app)

# Initialize Flask-Migrate
migrate = Migrate(app, db)  # Initialize Migrate

# Register Blueprints
app.register_blueprint(auth_blueprint, url_prefix="/auth")
app.register_blueprint(bill_blueprint, url_prefix="/bills")
app.register_blueprint(payment_blueprint, url_prefix="/payments")

# Database Creation
def create_tables():
    with app.app_context():
        db.create_all()

# Create tables when the app starts
with app.app_context():
    db.create_all()

if __name__ == "__main__":
    app.run(debug=True)