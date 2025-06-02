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
from django.http import FileResponse, Http404, JsonResponse, HttpResponseBadRequest, HttpResponse
from datetime import datetime
from .decorators import role_required

# Create your views here.
@role_required(USER_TYPE_HR)
def home(request):
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
        applicant = get_applicant(iin)
        if isinstance(applicant, Applicant):
            messages.error(request, 'Кажется вы уже подали заявку, ждите нашего ответа')
            return redirect('jobs')
        
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
            title = None   
        else:
            position = get_position(pos_id)
            if isinstance(position, HttpResponse): 
                messages.error(request, 'Данной позиции нет в системе')
                return position
             
            title = position.title

        context = {
            'Positions': Positions,
            'pos_title': title,
            'pos_id': pos_id
        }
        return render(request, 'HR/apply.html', context)
    
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

#Fetch all user info
@role_required(USER_TYPE_HR)
def applicant_card(request, iin):
    applicant = get_applicant(iin)

    if isinstance(applicant, HttpResponse):
        messages.error(request, "Кандидата с таким ИИН нет в системе")
        return applicant
        
    applicant_dict = model_to_dict(applicant)  
    applicant_json = json.dumps(applicant_dict, default=str)  # Using default=str for unsupported type

    context = {
        'applicant': applicant_json,
        'iin': iin,
        'TimeOptions': TimeOptions,
    }

    return render(request, 'HR/applicant_card.html', context)
    
@role_required(USER_TYPE_HR)
def cv(request, iin):
    file_path = os.path.join(settings.STATIC_ROOT, 'cvs', f"{iin}.pdf")

    if os.path.exists(file_path):
        return FileResponse(open(file_path, 'rb'))
    else:
        raise Http404("CV not found.")

@role_required(USER_TYPE_HR)
def appoint_int(request, iin):    
    applicant = get_applicant(iin)

    if isinstance(applicant, HttpResponse):
        messages.error(request, "Кандидата с таким ИИН нет в системе")
        return applicant
   
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

@role_required(USER_TYPE_HR)
def report_int(request, iin):
    interview = get_interview(iin)
    if isinstance(interview, HttpResponse):
        messages.error(request, "Что-то пошло не так")
        return interview
    
    applicant = get_applicant(iin)

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

#Changing Applicant status: 
# 1) Акт -> Арх, 2) Акт -> Инт, 3) Арх/Отк -> Акт
@role_required(USER_TYPE_HR)
def card_review(request, iin):
    applicant = get_applicant(iin)

    if isinstance(applicant, HttpResponse):
        messages.error(request, "Кандидата с таким ИИН нет в системе")
        return applicant

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

def error(request, error_code):
    return render(request, 'HR/404.html', {'error_code': error_code})

def jobs(request):
    positions = list(Position.objects.all()
                    .order_by('date')
                    .values('id', 'title', 'salary_status', 'salary', 'experience', 'date', 'status'))
    positions_json = json.dumps(positions, default=str)
    context = {
        'positions': positions_json,
        'page': 'jobs', #Necessary for the index
        'user_type': request.session.get('user_type')
    }
    return render(request, 'HR/jobs.html', context)

@role_required(USER_TYPE_HR)
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
        messages.success(request, "Вакансия успешно опубликована")
        return redirect('jobs')
    else:
        return render(request, 'HR/new_position.html')
    
def position(request, pos_id):
    position = get_position(pos_id)

    if isinstance(position, HttpResponse): 
        messages.error(request, 'Данной позиции нет в системе')
        return position
    
    if request.method == "POST":
        title = request.POST['title']
        if request.POST.get('salary_status') == 'on':
            salary_status = True
            salary = 0
        else:
            salary_status = False
            salary = int(request.POST.get('salary', '0').replace(' ', ''))
        experience = request.POST['experience']
        description = request.POST['description']
        requirements = request.POST['requirements']

        position.title=title
        position.salary_status=salary_status
        position.salary=salary
        position.experience=experience
        position.description=description
        position.requirements=requirements

        position.save()

    position_dict = model_to_dict(position)  
    position_json = json.dumps(position_dict, default=str)  # Using default=str for unsupported types
    context = {
        'user_type': request.session.get('user_type'),
        'position': position_json,
        'pos_id': pos_id,
    }
    messages.success(request, "Изменения успешно сохранены")
    return render(request, 'HR/position.html', context)

#Helpers
def get_position(pos_id):
    try:
        return Position.objects.get(pk=pos_id)
    except Position.DoesNotExist:
        return redirect('jobs')
    
def get_applicant(iin):
    try:
        return Applicant.objects.get(iin=iin)
    except Applicant.DoesNotExist:
        return redirect('hr_home')
    
def get_interview(iin):
    applicant = get_applicant(iin)
    if isinstance(applicant, HttpResponse):
        return applicant
        
    try:
        return Interview.objects.get(applicant=applicant)
    except:
        return redirect('hr_home')

@role_required(USER_TYPE_HR)
def change_status(request, id):
    position = get_position(id)
    if isinstance(position, HttpResponse): 
        messages.error(request, 'Данной позиции нет в системе')
        return position
    
    if (position.status == "act"):
        position.status = "arc"
    else:
        position.status = "act"

    position.save()
    messages.success(request, "Статус был успешно изменен")

    return redirect('jobs')