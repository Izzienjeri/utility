# utils/mpesa.py
import requests
import os
import base64
from datetime import datetime
import logging

logging.basicConfig(level=logging.DEBUG)

MPESA_API_URL = "https://sandbox.safaricom.co.ke"

def get_mpesa_access_token():
    consumer_key = os.getenv("MPESA_CONSUMER_KEY")
    consumer_secret = os.getenv("MPESA_CONSUMER_SECRET")
    api_url = f"{MPESA_API_URL}/oauth/v1/generate?grant_type=client_credentials"
    encoded_credentials = base64.b64encode(f"{consumer_key}:{consumer_secret}".encode()).decode()

    try:
        response = requests.get(api_url, headers={"Authorization": f"Basic {encoded_credentials}"})
        response.raise_for_status()  # Raise HTTPError for bad responses (4xx or 5xx)
        return response.json().get("access_token")
    except requests.exceptions.RequestException as e:
        logging.error(f"M-Pesa Access Token Error: {e}")
        return None

def initiate_mpesa_payment(amount, phone_number):
    access_token = get_mpesa_access_token()
    if not access_token:
        return {"status": "failed", "message": "Failed to obtain M-Pesa access token."}

    business_shortcode = os.getenv("MPESA_BUSINESS_SHORTCODE")
    passkey = os.getenv("MPESA_PASSKEY")
    callback_url = os.getenv("MPESA_CALLBACK_URL")
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    password = base64.b64encode(f"{business_shortcode}{passkey}{timestamp}".encode()).decode()

    payload = {
        "BusinessShortCode": business_shortcode,
        "Password": password,
        "Timestamp": timestamp,
        "TransactionType": "CustomerPayBillOnline",
        "Amount": int(amount),
        "PartyA": phone_number,
        "PartyB": business_shortcode,
        "PhoneNumber": phone_number,
        "CallBackURL": callback_url,
        "AccountReference": "Bill Payment",
        "TransactionDesc": "Payment of Utility Bill"
    }

    headers = {"Authorization": f"Bearer {access_token}", "Content-Type": "application/json"}
    try:
        response = requests.post(f"{MPESA_API_URL}/mpesa/stkpush/v1/processrequest", json=payload, headers=headers)
        response.raise_for_status()  # Raise HTTPError for bad responses
        json_response = response.json()
        logging.debug(f"M-Pesa STK Push Payload: {payload}")
        return {
            "status": "success" if json_response.get("ResponseCode") == "0" else "failed",
            "message": json_response.get("CustomerMessage", json_response.get("ResponseDescription")),
            "CheckoutRequestID": json_response.get("CheckoutRequestID")
        }
    except requests.exceptions.RequestException as e:
        logging.error(f"M-Pesa STK Push Error: {e}")
        return {"status": "failed", "message": str(e)}