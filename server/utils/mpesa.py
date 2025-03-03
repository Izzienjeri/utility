import requests
import os

def initiate_mpesa_payment(amount, paybill):
    mpesa_url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest"
    headers = {
        "Authorization": f"Bearer {os.getenv('MPESA_ACCESS_TOKEN')}",
        "Content-Type": "application/json",
    }
    payload = {
        "BusinessShortCode": paybill,
        "Amount": amount,
        "PartyA": os.getenv("MPESA_PHONE_NUMBER"),
        "PartyB": paybill,
        "PhoneNumber": os.getenv("MPESA_PHONE_NUMBER"),
        "CallBackURL": os.getenv("MPESA_CALLBACK_URL"),
        "TransactionDesc": "Utility Bill Payment"
    }
    response = requests.post(mpesa_url, json=payload, headers=headers)
    return response.json()