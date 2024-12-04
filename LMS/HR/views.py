from django.shortcuts import render, redirect
from .const import *
from django.contrib.auth import login, logout, authenticate
from django.contrib import messages
from django.core.mail import EmailMultiAlternatives
from django.core.files.storage import FileSystemStorage
from django.conf import settings
from django.contrib.auth.models import User
from .models import Applicant, HR_User, Interview
import os
import json
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.http import FileResponse, Http404, JsonResponse, HttpResponseBadRequest
from datetime import datetime

# Create your views here.
def home(request):
    if (not user_auth(request)):
        return redirect('logout')
    
    current_user = HR_User.objects.get(user=request.user)
    if current_user.user_type == 'HR':
        applicants = list(Applicant.objects.all()
                          .order_by('-appl_date') # Order by appl_date in descending order
                          .values('last_name', 'first_name', 'patronim', 'position', 'iin', 'status'))
        # Create a dictionary where the key is the applicant's iin and the value is the date_time
        interviews = {
            interview['applicant__iin']: interview['date_time'].strftime('%d of %b, %H:%M') 
            for interview in Interview.objects.values('applicant__iin', 'date_time')
        }
        applicants_json = json.dumps(applicants)
        interviews_json = json.dumps(interviews)
        context = {
            'applicants': applicants_json,
            'interviews': interviews_json,
            'positions': ['Все позиции'] + Positions[:len(Positions)-1], #Remove Другое
        }
        return render(request, 'HR/home.html', context)
    
    else:
        return redirect('logout')

def apply(request):
    if request.method == "POST":
        lastname = request.POST['lastname']
        firstname = request.POST['firstname']
        patronim = request.POST['patronim']
        iin = request.POST['iin']             
        phone = request.POST['phone']
        position = request.POST['position']
        lang = request.POST['lang']
        exp_salary = request.POST['salary'].replace(' ', '')
        appl_date = datetime.today()
        #Check if applicant already exists
        if applicant_exist(iin):
            return redirect('error', error_code='Кажется вы уже подали заявку, ждите нашего ответа')
        
        #Create an applicant
        applicant = Applicant(last_name = lastname, first_name = firstname, patronim = patronim,
                              phone = phone, lang=lang, exp_salary = exp_salary, position = position,
                              iin = iin, appl_date = appl_date)
        print(applicant)
        applicant.save()  

        #Save cv
        folder_path = os.path.join(settings.STATIC_ROOT, 'cvs', iin)
        os.makedirs(folder_path, exist_ok=True)
        file = request.FILES['cv']
        fs = FileSystemStorage(location=folder_path)
        fs.save('cv.pdf', file)

        #send email to the HR
        # send_email(applicant)
        return redirect('home')
    else:
        context = {
            'Positions': Positions
        }
        return render(request, 'HR/apply.html', context)
    
def send_email(request, iin):
    applicant = Applicant.objects.get(iin=iin)

    subject = "Новая Заяка| " + applicant.position
    from_email = 'aqbobek.bot@gmail.com'
    to = 'nishonor@gmail.com'
    # to = 'karen_dolmagambetov@akbobek.kz'

    # # Render the HTML content
    context = {
        "last_name": applicant.last_name,
        "first_name": applicant.first_name,
        "patronim": applicant.patronim,
        "position": applicant.position,
    }
    html_content = render_to_string('emails/applicant_card.html', context)
    text_content = strip_tags(html_content)  # Fallback text content if HTML is not supported

    # Create the email
    email = EmailMultiAlternatives(subject, text_content, from_email, [to])
    email.attach_alternative(html_content, "text/html")
    
    # Send the email
    email.send()
    return redirect('home')

def applicant_exist(iin):
    try:
        applicant = Applicant.objects.get(iin=iin)
        return True
    except Applicant.DoesNotExist:
        return False

def interview_exist(iin):
    if applicant_exist(iin):
        applicant = Applicant.objects.get(iin=iin)
        try:
            interview = Interview.objects.get(applicant=applicant)
            return True
        except:
            return False
    else:
        return False
    
def error(request, error_code):
    return render(request, 'HR/404.html', {'error_code': error_code})

def login_user(request):
    if request.user.is_authenticated:
        return redirect('home')
    else:
        if request.method == "POST":
            username = request.POST['username']
            password = request.POST['password']
            user = authenticate(request, username=username, password=password)
            if user is not None:
                login(request, user)
                messages.info(request, "Вы вошли в систему! Добро пожаловать!")
                return redirect('home')
            else:
                messages.error(request, "Login failed. Please check your username and password.")
                return redirect('login_user')
        else:
            return render(request, 'HR/login.html')

def logout_user(request):
    logout(request)
    messages.info(request, "Вы вышли из системы!")
    return redirect('login_user')

#Fetch all user info
def user_auth(request):
    if request.user.is_authenticated:
        try:
            current_user = HR_User.objects.get(user=request.user)
            return True
        except HR_User.DoesNotExist:
            messages.error(request, "User is not LMS User")
            return False
    else:
        messages.error(request, "Login to access that page")
        return False
    
def applicant_card(request, iin):
    if (not user_auth(request)):
        return redirect('logout')

    if (not applicant_exist(iin)):
        return redirect('error', error_code = "Кандидата с таким ИИН нет в системе")
        
    current_user = HR_User.objects.get(user=request.user)
    if current_user.user_type == 'HR':
        applicant = Applicant.objects.get(iin = iin)

        context = {
            'last_name': applicant.last_name,
            'first_name': applicant.first_name,
            'patronim': applicant.patronim,
            'phone': applicant.phone,
            'lang': applicant.lang,
            'exp_salary': applicant.exp_salary,
            'position': applicant.position,
            'iin': iin,
            'TimeOptions': TimeOptions,
        }

        return render(request, 'HR/applicant_card.html', context)
    
def cv(request, iin):
    file_path = os.path.join(settings.STATIC_ROOT, 'cvs', iin, 'cv.pdf')

    if os.path.exists(file_path):
        return FileResponse(open(file_path, 'rb'))
    else:
        raise Http404("CV not found.")

def appoint_int(request, iin):
    if (not user_auth(request)):
        return redirect('logout')
    
    if applicant_exist(iin):
        applicant = Applicant.objects.get(iin=iin)
    else:
        return redirect('error', error_code='Ученика с таким ИИН нет в системе')
    current_user = HR_User.objects.get(user=request.user)
    if current_user.user_type == 'HR':
        try:
            data = json.loads(request.body)
            date_str = data.get('date')
            time_str = data.get('time')

            # Convert the `time` string to a `datetime.time` object
            date_obj = datetime.strptime(date_str, '%Y-%m-%d')
            time_obj = datetime.strptime(time_str, '%H:%M').time()

            # Combine `date` and `time` into a `datetime` object
            date_time = datetime.combine(date_obj, time_obj)

            interview = Interview(applicant=applicant, date_time=date_time)
            interview.save()
            return JsonResponse({'status': 'success', 'message': 'Decision updated successfully'})
        except json.JSONDecodeError:
                return HttpResponseBadRequest('Invalid JSON format')
    else:
        return HttpResponseBadRequest('Login as Зам по ВСиРШ')
    
def report_int(request, iin):
    if (not user_auth(request)):
        return redirect('logout')
    
    if interview_exist(iin):
        applicant = Applicant.objects.get(iin=iin)
        interview = Interview.objects.get(applicant=applicant)
    else:
        return redirect('error', error_code='Данного интерью нет в системе')
    
    current_user = HR_User.objects.get(user=request.user)
    if current_user.user_type == 'HR':
        if request.method == "POST":
            interviewers = request.POST['interviewers']
            comment = request.POST['comment']
            position = request.POST['position']
            decision = (request.POST['decision'] == "True")
            interview.interviewers=interviewers 
            interview.comment=comment 
            interview.position=position
            interview.decision=decision 
            if decision:
                salary=request.POST['salary'].replace(' ', '')
                conditions = request.POST['conditions']
                interview.salary=salary 
                interview.conditions=conditions
                applicant.status = "При"
            else:
                applicant.status = "Отк"
            applicant.save()
            interview.save()
            messages.success(request, "Отчет о собеседовании добавлен в систему!")
            return redirect('home')
        else:
            context = {
                "date_time": interview.date_time.strftime('%d of %b, %H:%M'),
                'applicant_name': f"{applicant.last_name} {applicant.first_name} {applicant.patronim}",
                "position": applicant.position,
                'iin': iin,
                "Positions": Positions,
            }
            return render(request, 'HR/interview.html', context)
    else:
        return redirect('error', error_code='Войдите в систему как HR')


def card_review(request, iin):
    if (not user_auth(request)):
        return redirect('logout')
    
    if applicant_exist(iin):
        applicant = Applicant.objects.get(iin=iin)
    else:
        return redirect('error', error_code='Ученика с таким ИИН нет в системе')

    current_user = HR_User.objects.get(user=request.user)
    if current_user.user_type == 'HR':
        if request.method == "POST":
            try:
                data = json.loads(request.body)
                decision = data.get('decision') # Use .get() to avoid KeyError
                if decision:
                    applicant.status = 'Инт'
                else:
                    applicant.status = 'Арх'
                applicant.save()
                return JsonResponse({'status': 'success', 'message': 'Decision updated successfully'})
            except json.JSONDecodeError:
                return HttpResponseBadRequest('Invalid JSON format')
    else:
        return HttpResponseBadRequest('Login as Зам по ВСиРШ')

def error(request, error_code):
    return render(request, 'HR/404.html', {'error_code': error_code})