from .models import Student, Candidate
from .const import *
from .decorators import role_required
from .helpers import get_student_or_redirect
from datetime import datetime
from django.contrib import messages
from django.core.files.storage import FileSystemStorage
from django.http import JsonResponse, HttpResponseRedirect
from django.shortcuts import render, redirect
from django.contrib.auth.models import User
from django.forms.models import model_to_dict
from .views_curator import *
import json
import os
from django.conf import settings

@role_required(USER_TYPE_VNSV)
def register_student(request):
    if request.method == "POST":
        lastname = request.POST['lastname']
        firstname = request.POST['firstname']
        patronim = request.POST['patronim']
        IIN = request.POST['IIN']
        grade_num = request.POST['grade']
        if request.session['school']=='sch':
            lang = request.POST['lang']
        else:
            lang = "Каз"
        prev_school = request.POST['prev_school']                
        phone = request.POST['phone']
        comment = request.POST['comment']
        date = datetime.today() #date of visit
        school = request.session['school']

        #Check if student already exists
        if Student.objects.filter(IIN=IIN).exists():
            return redirect("error", error_code="Ученик c таким ИИН уже добавлен в систему")

        new_user = User.objects.filter(username=IIN).first()
        if not new_user:
            new_user = User(username=IIN, first_name=firstname)
            new_user.set_password("AIS@100")
            new_user.save()

        new_student = Student(user=new_user, Last_Name=lastname, First_Name=firstname, Patronim=patronim, phone=phone,
                        IIN=IIN, prev_school=prev_school, grade_num=grade_num, lang=lang, comment=comment, date=date,
                        school=school)
        new_student.save()

        if grade_num == '1':
            candidate = Candidate(student=new_student, letter='?', status=False)
            candidate.save()

        messages.success(request, "Новый ученик добавлен в систему")
        return redirect('home')
    else:
        context = {
            'student': json.dumps(None), #Send empty student for JS 
        }
        return render(request, 'user_manager/temp_student.html', context)
    
@role_required(USER_TYPE_VNSV)
def temp_card_std(request, IIN):
    student = get_student_or_redirect(IIN)
    if isinstance(student, HttpResponseRedirect):  # If redirection is returned
        return student

    if student.status == "Акт":
        return redirect('card_student', IIN=IIN)
    
    if request.method == "POST":
        lastname = request.POST['lastname']
        firstname = request.POST['firstname']
        patronim = request.POST['patronim']
        grade_num = request.POST['grade']
        if request.session['school']=='sch':
            lang = request.POST['lang']
        else:
            lang = "Каз"
        prev_school = request.POST['prev_school']                
        phone = request.POST['phone']
        comment = request.POST['comment']

        student.Last_Name = lastname
        student.First_Name=firstname
        student.Patronim = patronim
        student.phone = phone
        student.prev_school = prev_school
        student.grade_num = grade_num
        student.lang = lang
        student.comment = comment

        student.save() 
        messages.success(request, "Данные ученика изменены")
        return redirect('temp_card_std', IIN=IIN)
    else:
        student_dict = model_to_dict(student)  # Convert the Student object to a dictionary
        student_json = json.dumps(student_dict, default=str)  # Using default=str for unsupported types)
        context = {
            'student': student_json,
        }
        return render(request, 'user_manager/temp_student.html', context)
    
@role_required(USER_TYPE_VNSV)
def accept_student(request, IIN):
    student = get_student_or_redirect(IIN)
    if isinstance(student, HttpResponseRedirect):  # If redirection is returned
        return student

    if request.method == "POST":
        nationality = request.POST['nationality']
        grade_num = request.POST['grade_num']
        grade_let = request.POST['grade_let']
        date = datetime.today()

        student.nationality = nationality
        student.grade_num = grade_num
        student.grade_let = grade_let
        student.status = "Акт"
        student.date = date

        student.save() #Accept the student permanently
        messages.success(request, "Ученик принят в школу")
        return redirect('card_student', IIN=IIN)
    else:
        student.status = "Int" #Neccessary for js
        student_dict = model_to_dict(student)  # Convert the Student object to a dictionary
        student_json = json.dumps(student_dict, default=str)  # Using default=str for unsupported types)
        if (request.session['school']=='sch'):
            Letters = Grades_Letters
        else:
            Letters = Grades_Letters_Lyc
        Letters_json = json.dumps(Letters) # Serialize it to JSON
        print(Letters)
        context = {
            'Letters': Letters_json,
            'student': student_json,
        }
        return render(request, 'user_manager/student.html', context)

@role_required(USER_TYPE_VNSV, USER_TYPE_CURATOR)
def card_student(request, IIN):
    student = get_student_or_redirect(IIN)
    if isinstance(student, HttpResponseRedirect):
        return student
    
    if student.status != "Акт":
        return redirect('temp_card_std', IIN=IIN)
    
    user_type = request.session.get('user_type')
    curator_grades = request.session.get('curator_grades')

    if user_type == USER_TYPE_CURATOR:
        if (not curator_can_access_student(student, curator_grades)):
            messages.error("Данный ученик не обучается в вашем классе")
            return redirect('home')

    if request.method == "POST":
        lastname = request.POST['lastname']
        firstname = request.POST['firstname']
        patronim = request.POST['patronim']
        grade_num = request.POST['grade_num']
        grade_let = request.POST['grade_let']
        nationality = request.POST['nationality']
        prev_school = request.POST['prev_school']                
        phone = request.POST['phone']
        comment = request.POST['comment']

        student.Last_Name = lastname
        student.First_Name=firstname
        student.Patronim = patronim
        student.phone = phone
        student.prev_school = prev_school
        student.grade_num = grade_num
        student.grade_let = grade_let
        student.nationality = nationality
        student.comment = comment

        uploaded_file = request.FILES.get('picture')
        if uploaded_file:
            folder_path = os.path.join(settings.STATIC_ROOT, 'user_manager', 'std_pictures')

            # Set the file_name
            extension = os.path.splitext(uploaded_file.name)[1]  # e.g., '.jpg'

            # Delete the file if it exists (only 1 image per user)
            if student.picture:
                old_picture = os.path.join(folder_path, student.picture) 
                if os.path.isfile(old_picture):
                    os.remove(old_picture)

            fs = FileSystemStorage(folder_path)
            fs.save(f"{IIN}{extension}", uploaded_file)

            student.picture = f"{IIN}{extension}"
                
        student.save() 
        messages.success(request, "Данные ученика изменены")
        return redirect('card_student', IIN=IIN)
    else:
        student_dict = model_to_dict(student)  # Convert the Student object to a dictionary
        student_json = json.dumps(student_dict, default=str)  # Using default=str for unsupported type

        if (request.session['school']=='sch'):
            Letters = Grades_Letters
        else:
            Letters = Grades_Letters_Lyc

        Letters_json = json.dumps(Letters) # Serialize it to JSON

        context = {
            'Letters': Letters_json,
            'student': student_json,
        }
        return render(request, 'user_manager/student.html', context)

@role_required(USER_TYPE_VNSV)
def archive(request, IIN):
    student = get_student_or_redirect(IIN)
    if isinstance(student, HttpResponseRedirect):
        return student
    
    if request.method == 'POST':
        student.comment = request.POST['comment']
        student.date = datetime.today()
        student.status = 'Арх'
        student.date = datetime.today()

        student.save()
        return redirect('temp_card_std', IIN=IIN)
    else:
        student.status = "Int_leave" #Neccessary for js
        student_dict = model_to_dict(student)  # Convert the Student object to a dictionary
        student_json = json.dumps(student_dict, default=str) # Use default=str for unsupported data types
        context = {
            'student': student_json,
        }
        return render(request, 'user_manager/temp_student.html', context)
    
@role_required(USER_TYPE_VNSV)
def std_change_school(request, IIN):
    student = get_student_or_redirect(IIN)
    if isinstance(student, HttpResponseRedirect):
        return student
    
    if request.session['school'] == 'sch':
        #Only 7+ grade students can switch to lyceum
        if student.grade_num > 6:
            request.session['school'] = 'lyc'
            student.school = 'lyc'
        else:
            return JsonResponse({'status': 'error', 'message': 'Only students in grade 7 or higher can join the lyceum.'}, status=400)
    else:
        request.session['school'] = 'sch'
        student.school = 'sch'
    
    #Обнулить литтер при переходе
    student.grade_let = None
    student.save()
    
    return JsonResponse({'status': 'success', 'message': 'Successfully updated'}, status=200)
    
#Return student back from archive
@role_required(USER_TYPE_VNSV)
def arch_back(request, IIN):
    student = get_student_or_redirect(IIN)
    if isinstance(student, HttpResponseRedirect):
        return student
    
    if student.contract:
        student.contract.delete()  # This will delete the related contract
        student.contract = None  # Remove the reference to the contract from the studen

    student.status = 'Лид'
    student.grade_let = None
    student.date = datetime.today()
    student.comment = None
    student.save()
    messages.success(request, "Статус ученика успешно изменен")
    return redirect('temp_card_std', IIN=IIN)