from flask import Flask
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_mail import Mail
from flask_cors import CORS  # Import CORS
from celery import Celery
from config import Config
from models import db, bcrypt
from routes.auth_routes import auth_blueprint
from routes.bill_routes import bill_blueprint
from routes.payment_routes import payment_blueprint
from flask_marshmallow import Marshmallow


def make_celery(app):
    celery = Celery(
        app.import_name,
        broker=app.config['CELERY_BROKER_URL'],
        backend=app.config['CELERY_RESULT_BACKEND']
    )
    celery.conf.update(app.config)
    return celery


app = Flask(__name__)
app.config.from_object(Config)


db.init_app(app)
bcrypt.init_app(app)
jwt = JWTManager(app)
mail = Mail(app)

CORS(app, supports_credentials=True, origins=["http://localhost:3000"])
ma = Marshmallow(app)


celery = make_celery(app)


migrate = Migrate(app, db)


app.register_blueprint(auth_blueprint, url_prefix="/auth")
app.register_blueprint(bill_blueprint, url_prefix="/bills")
app.register_blueprint(payment_blueprint, url_prefix="/payments")


def create_tables():
    with app.app_context():
        db.create_all()


with app.app_context():
    db.create_all()

if __name__ == "__main__":
    app.run(debug=True)