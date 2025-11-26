from django.shortcuts import render, redirect
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.models import User
from django.contrib import messages
from django.core.files.storage import FileSystemStorage
from django.conf import settings
from django.forms.models import model_to_dict
from django.http import FileResponse, Http404, HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Q
from .models import *
from .helpers import get_student_or_redirect
from django.db import IntegrityError
from datetime import datetime
import requests
from .dogovor import *
from .const import *
from .views_curator import get_curator_grades
from .decorators import role_required
import json
import os
import pandas as pd
from openpyxl import load_workbook
from openpyxl.styles import PatternFill, Font, Border, Side, Alignment
from io import BytesIO
import re
import random

@role_required(USER_TYPE_VNSV, USER_TYPE_CURATOR, USER_TYPE_HR)
def home(request):
    user_type = request.session.get('user_type')
    if user_type == USER_TYPE_VNSV:
        if (request.session['school'] == None):
            request.session['school'] = 'sch'
        students = list(Student.objects.filter(school=request.session['school'])
                        .order_by('Last_Name', 'First_Name', 'Patronim')
                        .values('Last_Name', 'First_Name', 'Patronim', 'IIN', 'phone', 'status', 'grade_num', 'grade_let'))
        students_json = json.dumps(students)

        if (request.session['school']=='sch'):
            Grades_Letters_json = json.dumps(Grades_Letters)
        else:
            Grades_Letters_json = json.dumps(Grades_Letters_Lyc)

        #Populating context
        context = {
            'Grades_Letters': Grades_Letters_json, 
            'students': students_json,
            'user_type': 'ВнСв',
            'school': request.session['school'],
        }

        return render(request, 'user_manager/home.html', context)
    
    elif user_type == USER_TYPE_CURATOR:
        curator_grades = request.session['curator_grades']

        #curator can only see status - 'active' students
        query = Q(status='Акт')
        grade_filter = Q()

        for grade_num in curator_grades:
            for grade_let in curator_grades[grade_num]:
                grade_filter |= Q(grade_num=grade_num, grade_let=grade_let)

        students = list(
            Student.objects
                .filter(query & grade_filter)
                .order_by('Last_Name', 'First_Name', 'Patronim')
                .values('Last_Name', 'First_Name', 'Patronim', 'IIN', 'phone', 'status', 'grade_num', 'grade_let')
        )
        students_json = json.dumps(students, ensure_ascii=False)
        
        #Populating context
        Grades_Letters_json = json.dumps(curator_grades)

        context = {
            'Grades_Letters': Grades_Letters_json, 
            'students': students_json,
            'user_type': 'Кур',
            'school': request.session['school'],
        }

        return render(request, 'user_manager/home.html', context)
    
    elif user_type == USER_TYPE_HR:
        print("REDIRECT")
        return redirect('hr_home')

#Fetch the name and the picture of the user for the index.html
def get_user_info(request):
    if request.user.is_authenticated:
        current_user = LMS_User.objects.get(user=request.user)
        user_info = {
            'name': current_user.name,  
            'picture': f"avatars/{current_user.picture}",
            'school': request.session['school']
        }
        return JsonResponse(user_info)
    else:
        user_info = {
            'name': 'Гость',  
            'picture': 'avatars/Avatar.png',
            'school': 'sch'
        }
        return JsonResponse(user_info)

#GET the static file
@role_required(USER_TYPE_VNSV, USER_TYPE_HR, USER_TYPE_CURATOR)
def serve_static(request, filename):
    file_path = os.path.join(settings.STATIC_ROOT, "user_manager", filename)
    if os.path.exists(file_path):
        return FileResponse(open(file_path, 'rb'))
    else:
        raise Http404("Avatar not found")
    
@role_required(USER_TYPE_VNSV, USER_TYPE_CURATOR)
def serve_pdf(request, filename):
    file_path = os.path.join(settings.STATIC_ROOT, "user_manager", filename)
    if os.path.exists(file_path):
        response = FileResponse(open(file_path, 'rb'), content_type='application/pdf')
        response['Content-Disposition'] = 'inline; filename="file.pdf"'
        return response
    else:
        raise Http404("File not found")

#Login and logout with prev_page 
def login_user(request, prev_page):
    if request.user.is_authenticated:
        return redirect(prev_page)
    else:
        if request.method == "POST":
            username = request.POST['username']
            password = request.POST['password']
            remember_me = request.POST.get('remember_me')
            user = authenticate(request, username=username, password=password)
            if user is not None:
                login(request, user)
                if remember_me:
                    request.session.set_expiry(1209600)  # 2 weeks in seconds
                else:
                    request.session.set_expiry(0)
                try: 
                    current_user = LMS_User.objects.get(user=request.user)
                    request.session['school'] = 'sch' #By default, the AIS is chosen
                    request.session['user_type'] = current_user.user_type
                    print(request.session['user_type'])
                    if (request.session['user_type'] == 'Кур'):
                        grades = get_curator_grades(current_user)
                        request.session['curator_grades'] = grades
                    return redirect(prev_page)
                
                except LMS_User.DoesNotExist:
                    messages.error("The user is not LMS_User")
                    return redirect('logout_user', prev_page)
            else:
                messages.error(request, "Login failed. Please check your username and password.")
                return redirect('login_user', prev_page)
        else:
            context={
                'prev_page': prev_page,
            }
            return render(request, 'user_manager/login.html', context)
        
def logout_user(request, prev_page):
    logout(request)
    messages.info(request, "You have been logged out!")
    return redirect('login_user', prev_page=prev_page)  


@role_required(USER_TYPE_ADMIN, USER_TYPE_CURATOR, USER_TYPE_HR, USER_TYPE_VNSV)
def user_settings(request):
    current_user = LMS_User.objects.get(user=request.user)
    if request.method == "POST":
        try:
            new_username = request.POST['username']
            if new_username and new_username != current_user.user.username:
                current_user.user.username = new_username
                current_user.user.save()
            
            oldPassword = request.POST['oldPassword']
            newPassword = request.POST['newPassword']
            if oldPassword:
                user = authenticate(username = request.user.username, password = oldPassword)
                print(request.user.username, oldPassword)
                if user is not None:
                    user.set_password(newPassword)
                    user.save()
                else:
                    print("WrongPassword")
            
            new_email = request.POST['email']
            if new_email and new_email != current_user.email:
                current_user.email = new_email
            
            new_phone = request.POST['phone']
            if new_phone and new_phone != current_user.phone:
                current_user.phone = new_phone

            if 'avatar' in request.FILES:
                new_avatar = request.FILES['avatar']
                folder_path = os.path.join(settings.STATIC_ROOT, 'user_manager', 'avatars')

                # Set the file_name
                file_name = current_user.user.username
                extension = os.path.splitext(new_avatar.name)[1]  # e.g., '.jpg'

                # Delete the file if it exists (only 1 image per user)
                if current_user.picture != "Avatar.png":
                    old_avatar = os.path.join(folder_path, current_user.picture) 
                    if os.path.isfile(old_avatar):
                        os.remove(old_avatar)

                fs = FileSystemStorage(folder_path)
                fs.save(f"{file_name}{extension}", new_avatar)

                current_user.picture = f"{file_name}{extension}"

            current_user.save()
            # Send success response
            return JsonResponse({'status': 'success', 'message': 'Settings updated successfully'}, status=200)
        except Exception as e:
            # Handle exceptions and return an error response
            print(f"Error occurred: {e}")
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
    else:
        user_dict = model_to_dict(current_user, fields=['name', 'phone', 'email', 'picture'])
        user_dict['position'] = User_type_dict[current_user.user_type]
        user_dict['username'] = current_user.user.username
        user_dict['picture'] = f"avatars/{user_dict['picture']}"

        context = {
            'user_dict': user_dict,
        }
        return render(request, 'user_manager/user_settings.html', context)
    
def error(request, prev_page, error_code):
    context = {
        'prev_page': prev_page,
        'error_code': error_code,
    }
    return render(request, 'user_manager/404.html', context)
    
def change_school(request):
    if request.session['school'] == 'sch':
        request.session['school'] = 'lyc'
        messages.success(request, "Вы поменяли школу, теперь вы находитесь в Aqbobek Lyceum")
    else:
        request.session['school'] = 'sch'
        messages.success(request, "Вы поменяли школу, теперь вы находитесь в Aqbobek International School")
    
    return JsonResponse({'status': 'success', 'message': 'Successfully updated'}, status=200)

@csrf_exempt
def student_exists(request):
    request.session.set_expiry(300) #Session expires in 5 mintues
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    
    try:
        data = json.loads(request.body)
        IIN = data.get('IIN')
    except (json.JSONDecodeError, KeyError, TypeError):
        return JsonResponse({'error': 'Invalid request'}, status=400)
        
    student = get_student_or_redirect(IIN)
    if isinstance(student, HttpResponse): 
        return JsonResponse({'status': 'fail'})
    
    std_name = f"{student.Last_Name} {student.First_Name}"
    request.session['IIN'] = IIN
        
    if request.user.is_authenticated:
        return JsonResponse({'status': 'success', 'std_name': std_name, 'logged_in': True})
    
    if student.parent:
        phone = student.parent.Phone
    else:
        phone = student.phone

    if not wa_PIN(request, phone):
        return JsonResponse({'status': 'fail', 'message': 'Не удалось отправить PIN-код'})

    phone_last_digits = phone[-5:]
    return JsonResponse({'status': 'success', 'std_name': std_name, 'phone': phone_last_digits, 'logged_in': False})

@csrf_exempt
def verify_phone(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    
    try:
        data = json.loads(request.body)
        PIN_received = data.get('PIN')
    except (json.JSONDecodeError, KeyError, TypeError):
        return JsonResponse({'error': 'Invalid request'}, status=400)
    
    PIN_stored = request.session['PIN']

    if PIN_received == PIN_stored:
        request.session['PIN_status'] = True
        return JsonResponse({'status': 'success'})
    else:
        return JsonResponse({'status': 'fail'})
    
def wa_PIN(request, phone):
    # В целях безопасности: обнулить сессию, 
    # так как можно будет получить справку за второго ученика,
    # после подтверждения для первого
    request.session['PIN_status'] = False

    # Remove +, parentheses, and dashes from the phone number
    phone = re.sub(r'[^\d]', '', phone)  # Keeps only digits

    PIN = random.randint(1000, 9999)
    text = f"Ваш PIN код для получения справки со школы: *{PIN}*"

    url = "https://7103.api.greenapi.com/waInstance7103163711/sendMessage/677efe89a87e474f93b6ca379ea32a364bf6be6020414505bd"
    payload = {
        "chatId": f"{phone}@c.us",
        "message": text,
    }

    headers = {
        'Content-Type': 'application/json'
    }

    response = requests.post(url, json=payload, headers=headers)

    if response.status_code == 200:
        request.session["PIN"] = str(PIN)
        return True
    else:
        return False