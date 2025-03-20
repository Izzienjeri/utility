import os

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY')
    SQLALCHEMY_DATABASE_URI = os.getenv('SQLALCHEMY_DATABASE_URI')
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY')

    MAIL_SERVER = os.getenv('MAIL_SERVER')
    MAIL_PORT = int(os.getenv('MAIL_PORT', '587'))
    MAIL_USERNAME = os.getenv('MAIL_USERNAME')
    MAIL_PASSWORD = os.getenv('MAIL_PASSWORD')
    MAIL_USE_TLS = True
    MAIL_USE_SSL = False

    CELERY_BROKER_URL = 'redis://localhost:6379/0'
    CELERY_RESULT_BACKEND = 'redis://localhost:6379/0'

    # M-PESA Credentials
    MPESA_CONSUMER_KEY = os.getenv('MPESA_CONSUMER_KEY')
    MPESA_CONSUMER_SECRET = os.getenv('MPESA_CONSUMER_SECRET')
    MPESA_BUSINESS_SHORTCODE = os.getenv('MPESA_BUSINESS_SHORTCODE')  # Paybill 174379 (Test)
    MPESA_CALLBACK_URL = os.getenv('MPESA_CALLBACK_URL')
    MPESA_PASSKEY = os.getenv('MPESA_PASSKEY')  # STK Passkey