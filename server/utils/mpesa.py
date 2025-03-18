# utils/mpesa.py
import requests
import os
import base64
from datetime import datetime

def get_mpesa_access_token():
    """
    Retrieves a fresh access token from the M-Pesa API.
    """
    consumer_key = os.getenv("MPESA_CONSUMER_KEY")
    consumer_secret = os.getenv("MPESA_CONSUMER_SECRET")

    api_URL = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"

    # Safaricom expects the credentials to be base64 encoded
    encoded_string = base64.b64encode(f"{consumer_key}:{consumer_secret}".encode('utf-8')).decode('utf-8')

    headers = {"Authorization": f"Basic {encoded_string}"}

    try:
        r = requests.get(api_URL, headers=headers)
        r.raise_for_status()  # Raise HTTPError for bad responses (4xx or 5xx)
        json_response = r.json()
        print("M-Pesa API Response:", json_response)  # Debugging
        return json_response.get("access_token")
    except requests.exceptions.RequestException as e:
        print(f"M-Pesa Access Token Error: {e}")
        return None


def initiate_mpesa_payment(amount, phone_number, payment_option):
    """
    Initiates an STK Push payment request to M-Pesa.
    Now uses same shortcode for Paybill and Till Number, differentiating by TransactionType.
    """
    access_token = get_mpesa_access_token()
    if not access_token:
        return {"status": "failed", "message": "Failed to obtain M-Pesa access token."}

    mpesa_url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest"
    business_shortcode = os.getenv("MPESA_BUSINESS_SHORTCODE") # Same for Paybill and Till
    passkey = os.getenv("MPESA_PASSKEY")
    callback_url = os.getenv("MPESA_CALLBACK_URL")

    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    password = base64.b64encode(str(business_shortcode + passkey + timestamp).encode()).decode()

    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
    }

    payload = {
        "BusinessShortCode": business_shortcode,
        "Password": password,
        "Timestamp": timestamp,
        "Amount": int(amount),  # Amount must be an integer
        "PartyA": phone_number,  # Customer phone number
        "PartyB": business_shortcode,  # Your paybill number, same as BusinessShortCode in sandbox
        "PhoneNumber": phone_number,  # Customer phone number
        "CallBackURL": callback_url,  # Your callback URL
        "TransactionDesc": "Payment of Utility Bill"
    }

    if payment_option == "paybill":
        payload["TransactionType"] = "CustomerPayBillOnline"
        payload["AccountReference"] = "Bill Payment"  # Required for Paybill
    elif payment_option == "till":
        payload["TransactionType"] = "CustomerBuyGoodsOnline"
        #No AccountReference here!
    else:
        return {"status": "failed", "message": "Invalid payment option"}

    try:
        response = requests.post(mpesa_url, json=payload, headers=headers)
        response.raise_for_status()  # Raise HTTPError for bad responses
        json_response = response.json()
        print("M-Pesa STK Push Response:", json_response)  # Debugging

        if json_response.get("ResponseCode") == "0":
            return {"status": "success", "CheckoutRequestID": json_response.get("CheckoutRequestID"), "CustomerMessage": json_response.get("CustomerMessage")}
        else:
            return {"status": "failed", "message": json_response.get("ResponseDescription")}

    except requests.exceptions.RequestException as e:
        print(f"M-Pesa STK Push Error: {e}")
        return {"status": "failed", "message": str(e)}