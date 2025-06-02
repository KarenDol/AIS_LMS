import json
import requests
from .const import *
from .decorators import role_required
from django.shortcuts import render
import re
from django.http import FileResponse, Http404, HttpResponse, JsonResponse
from .models import *

@role_required(USER_TYPE_VNSV)
def whatsapp(request):
    if request.method == "POST":
        try:
            phone_numbers = json.loads(request.POST.get('phoneNumbers', '[]'))
            wa_text = request.POST.get('waText', '')
            file = request.FILES.get('file')

            if (file):
                return send_file(phone_numbers, wa_text, file)
            else:
                return send_text(phone_numbers, wa_text)
            
        except json.JSONDecodeError:
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON data'}, status=400)
    else:
        phone_numbers = request.session.get('phone_numbers')
        phone_numbers_json = json.dumps(phone_numbers)
        context = {
            'home_phones': phone_numbers_json, #Numbers that come from the home page
        }
        return render(request, 'user_manager/whatsapp.html', context)
    
def send_text(phone_numbers, wa_text):
    status_dict = []

    url = "https://7103.api.greenapi.com/waInstance7103163711/sendMessage/677efe89a87e474f93b6ca379ea32a364bf6be6020414505bd"

    for phone in phone_numbers:
        if phone['status'] == "not-exist":
            status_dict.append(phone)
            continue                 
                                                                                                                            
        phone = phone['number']
        payload = {
            "chatId": f"{phone}@c.us",
            "message": wa_text
        }
        headers = {
            'Content-Type': 'application/json'
        }

        try:
            response = requests.post(url, json=payload, headers=headers)
            response.raise_for_status()
            result = response.json()
            status_dict.append({'number': phone, 'status': 'sent'})
        except requests.RequestException as e:
            status_dict.append({'number': phone, 'status': 'error'})

    # Return a success response
    return JsonResponse({'status': 'success', 'status_dict': status_dict})

def send_file(phone_numbers, wa_text, file):
    status_dict = []

    url = "https://7103.media.greenapi.com/waInstance7103163711/sendFileByUpload/677efe89a87e474f93b6ca379ea32a364bf6be6020414505bd"

    file_content = file.read()

    for phone in phone_numbers:
        if phone['status'] == "not-exist":
            status_dict.append(phone)
            continue                 
                                                                                                                            
        phone = phone['number']
        payload = {
            'chatId': f'{phone}@c.us', 
            'fileName': file.name,
            'caption': wa_text
        }
        files = {
            'file': (file.name, file_content, file.content_type)
        }

        try:
            response = requests.post(url, data=payload, files=files)
            print(response.text)
            response.raise_for_status()
            status_dict.append({'number': phone, 'status': 'sent'})
        except requests.RequestException as e:
            status_dict.append({'number': phone, 'status': 'error'})

    # Return a success response
    return JsonResponse({'status': 'success', 'status_dict': status_dict})

def wa_exists(request, phone):
    try:
        # Remove +, parentheses, and dashes from the phone number
        phone = re.sub(r'[^\d]', '', phone)  # Keeps only digits

        url = "https://7103.api.greenapi.com/waInstance7103163711/checkWhatsapp/677efe89a87e474f93b6ca379ea32a364bf6be6020414505bd"

        payload = { 
            "phoneNumber": phone  
        }
        headers = {
            'Content-Type': 'application/json'
        }

        response = requests.post(url, json=payload, headers=headers)

        return JsonResponse(response.json(), status = 200)
    
    except json.JSONDecodeError:
        return JsonResponse({'status': 'error', 'message': 'Invalid JSON data'}, status=400)
    
def get_numbers(request):
    if request.method == 'POST':
        try:
            # Parse the JSON body
            data = json.loads(request.body)
            
            # Extract the required data
            checked_students = data.get('checkedStudents', [])
            phone_numbers = []

            for IIN in checked_students:
                student = Student.objects.get(IIN=IIN)
                parent = student.parent

                if parent:
                    phone = parent.Phone
                else:
                    phone = student.phone

                # Remove +, parentheses, and dashes from the phone number
                phone = re.sub(r'[^\d]', '', phone)  # Keeps only digits

                phone_numbers.append(phone)

            request.session['phone_numbers'] = phone_numbers   
            
            # Return a success response
            return JsonResponse({'status': 'success', 'message': 'Data received successfully'})
        
        except json.JSONDecodeError:
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON data'}, status=400)
    # Return an error for non-POST requests
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=400)

# def send_sms(phones, message):
#     # API endpoint URL
#     api_url = "https://smsc.kz/sys/send.php"

#     # Construct the parameters
#     params = {
#         'login': 'aqbobek',
#         'psw': 'kAREN_2001',
#         'phones': phones,
#         'mes': message,
#     }

#     try:
#          # Make the HTTP request
#         response = requests.get(api_url, params=params)
#          # Check the response status code
#         if response.status_code == 200:
#             # SMS sent successfully
#             return True
#         else:
#             # Handle any errors
#             return False

#     except requests.RequestException as e:
#         # Handle request exceptions
#         print(f"Request error: {e}")