from django.shortcuts import render, redirect
from .const import *
from django.contrib.auth import login, logout, authenticate
from django.contrib import messages
from django.core.mail import EmailMultiAlternatives
from django.core.files.storage import FileSystemStorage
from django.conf import settings
from django.contrib.auth.models import User
from django.forms.models import model_to_dict
from .models import *
import os
import json
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.http import FileResponse, Http404, JsonResponse, HttpResponseBadRequest
from datetime import datetime

# Create your views here.
def home(request):
    if (not user_auth(request)):
        return redirect('logout_user', prev_page='hr_home')
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
            'page': 'home', #Necessary for the index
        }
        return render(request, 'HR/home.html', context)
    else:
        return redirect('logout_user', prev_page='hr_home')

def apply(request, pos_id):
    if request.method == "POST":
        lastname = request.POST['lastname']
        firstname = request.POST['firstname']
        patronim = request.POST['patronim']
        iin = request.POST['iin']             
        phone = request.POST['phone']
        if (pos_id==0):
            position = request.POST['position']
        else:
            position = Position.objects.get(id=pos_id)
            position = position.title
        lang = request.POST['lang']
        exp_salary = request.POST['salary'].replace(' ', '')
        appl_date = datetime.today()
        #Check if applicant already exists
        if applicant_exist(iin):
            return redirect('error', prev_page='hr_home', error_code='Кажется вы уже подали заявку, ждите нашего ответа')
        
        #Create an applicant
        applicant = Applicant(last_name = lastname, first_name = firstname, patronim = patronim,
                              phone = phone, lang=lang, exp_salary = exp_salary, position = position,
                              iin = iin, appl_date = appl_date)
        applicant.save()  

        #Save cv
        folder_path = os.path.join(settings.STATIC_ROOT, 'cvs')
        os.makedirs(folder_path, exist_ok=True)
        file = request.FILES['cv']
        fs = FileSystemStorage(location=folder_path)
        fs.save(f"{iin}.pdf", file)

        #send email to the HR
        send_email(iin)
        return redirect('hr_home')
    else:
        if (pos_id == 0):
            context = {
                'Positions': Positions,
            }
            return render(request, 'HR/apply.html', context)
        else:
            position = Position.objects.get(id=pos_id)
            context = {
                'pos_title': position.title,
                'pos_id': pos_id,
            }
            return render(request, 'HR/apply_pos.html', context)
    
def send_email(iin):
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
        "iin": iin,
    }
    html_content = render_to_string('HR/emails/applicant_card.html', context)
    text_content = strip_tags(html_content)  # Fallback text content if HTML is not supported

    # Create the email
    email = EmailMultiAlternatives(subject, text_content, from_email, [to])
    email.attach_alternative(html_content, "text/html")
    
    # Send the email
    email.send()
    print("Email sent!")

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
        return redirect('logout_user', prev_page='hr_home')

    if (not applicant_exist(iin)):
        return redirect('error', prev_page='hr_home', error_code = "Кандидата с таким ИИН нет в системе")
        
    current_user = HR_User.objects.get(user=request.user)
    if current_user.user_type == 'HR':
        applicant = Applicant.objects.get(iin = iin)
        applicant_dict = model_to_dict(applicant)  
        applicant_json = json.dumps(applicant_dict, default=str)  # Using default=str for unsupported type

        context = {
            'applicant': applicant_json,
            'iin': iin,
            'TimeOptions': TimeOptions,
        }

        return render(request, 'HR/applicant_card.html', context)
    
def cv(request, iin):
    file_path = os.path.join(settings.STATIC_ROOT, 'cvs', f"{iin}.pdf")

    if os.path.exists(file_path):
        return FileResponse(open(file_path, 'rb'))
    else:
        raise Http404("CV not found.")

def appoint_int(request, iin):
    if (not user_auth(request)):
        return redirect('logout_user', prev_page='hr_home')
    
    if applicant_exist(iin):
        applicant = Applicant.objects.get(iin=iin)
    else:
        return redirect('error', prev_page='hr_home', error_code='Ученика с таким ИИН нет в системе')
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
        return redirect('logout_user', prev_page='hr_home')
    
    if interview_exist(iin):
        applicant = Applicant.objects.get(iin=iin)
        interview = Interview.objects.get(applicant=applicant)
    else:
        return redirect('error', prev_page='hr_home', error_code='Данного интерью нет в системе')
    
    current_user = HR_User.objects.get(user=request.user)
    if current_user.user_type == 'HR':
        if request.method == "POST":
            if interview.status == None:
                interviewers = request.POST['interviewers']
                comment = request.POST['comment']
                

                interview.interviewers = interviewers 
                interview.comment = comment 

            status = request.POST['status']
            interview.status = status
                
            if (status=='pos'):
                salary=request.POST['salary'].replace(' ', '')
                conditions = request.POST['conditions']
                interview.salary=salary 
                interview.conditions=conditions
                applicant.status = "При"
            elif (status=='neg'):
                applicant.status = "Отк"

            applicant.save()
            interview.save()
            messages.success(request, "Отчет о собеседовании добавлен в систему!")
            return redirect('hr_home')
        else:
            interview_dict = model_to_dict(interview)
            interview_json = json.dumps(interview_dict, default=str)

            context = {
                "date_time": interview.date_time.strftime('%d of %b, %H:%M'),
                'applicant_name': f"{applicant.last_name} {applicant.first_name} {applicant.patronim}",
                "position": applicant.position,
                'iin': iin,
                "interview": interview_json,
            }
            return render(request, 'HR/interview.html', context)
    else:
        return redirect('error', prev_page='hr_home', error_code='Войдите в систему как HR')


#Changing Applicant status: 
# 1) Акт -> Арх, 2) Акт -> Инт, 3) Арх/Отк -> Акт
def card_review(request, iin):
    if (not user_auth(request)):
        return redirect('logout_user', prev_page='hr_home')
    
    if applicant_exist(iin):
        applicant = Applicant.objects.get(iin=iin)
    else:
        return redirect('error', prev_page='hr_home', error_code='Кандидата с таким ИИН нет в системе')

    current_user = HR_User.objects.get(user=request.user)
    if current_user.user_type == 'HR':
        if request.method == "POST":
            try:
                data = json.loads(request.body)
                decision = data.get('decision') # Use .get() to avoid KeyError
                if decision==1:
                    applicant.status = 'Арх'
                elif decision==2:
                    applicant.status = 'Инт'
                else:
                    applicant.status = 'Акт'
                applicant.save()
                return JsonResponse({'status': 'success', 'message': 'Decision updated successfully'})
            except json.JSONDecodeError:
                return HttpResponseBadRequest('Invalid JSON format')
    else:
        return HttpResponseBadRequest('Login as HR Manager')

def error(request, error_code):
    return render(request, 'HR/404.html', {'error_code': error_code})

def jobs(request):
    positions = list(Position.objects.all()
                    .order_by('date')
                    .values('id', 'title', 'salary_status', 'salary', 'experience', 'date'))
    positions_json = json.dumps(positions, default=str)
    context = {
        'positions': positions_json,
        'page': 'jobs', #Necessary for the index
    }
    return render(request, 'HR/jobs.html', context)

def new_position(request):
    if request.method == "POST":
        title = request.POST['title']
        salary_status = request.POST.get('salary_status', False)  # Default to False if not checked
        salary_status = True if salary_status == 'on' else False  # Convert 'on' to True
        if salary_status:
            salary = 0
        else:
            salary = request.POST.get('salary', '0').replace(' ', '')  # Remove spaces
            salary = int(salary)  # Convert to integer
        experience = request.POST['experience']
        description = request.POST['description']
        requirements = request.POST['requirements']

        position = Position(title=title, salary_status=salary_status, salary=salary,
                            experience=experience, description=description, requirements=requirements)
        position.save()
        return render(request, 'HR/new_position.html')
    else:
        return render(request, 'HR/new_position.html')
    
def position(request, id):
    if (id=='0'):
        return redirect('new_position')
    else:
        position = Position.objects.get(id=id)
        position_dict = model_to_dict(position)  
        position_json = json.dumps(position_dict, default=str)  # Using default=str for unsupported types
        context = {
            'position': position_json,
        }
        return render(request, 'HR/position.html', context)