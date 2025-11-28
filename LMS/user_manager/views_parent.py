from .models import Student, Parent
from .const import *
from .decorators import role_required
from .helpers import get_student_or_redirect
from datetime import datetime
from django.contrib import messages
from django.shortcuts import render, redirect
from django.contrib.auth.models import User
from django.forms.models import model_to_dict
from .views_curator import *
import json

@role_required(USER_TYPE_VNSV)
def register_parent(request, std_id):
    student = get_student_or_redirect(std_id)
    if isinstance(student, redirect.__class__):
        return student
    if student.parent: #If parent already exists
        return redirect('error', prev_page='home', error_code='Родитель данного ученика уже добавлен в систему')
    
    if request.method == 'POST':
        First_Name = request.POST['firstname']
        Last_Name = request.POST['lastname']                
        Patronim = request.POST['patronim']
        Phone = request.POST['phone']
        ID_number = request.POST['ID_number']
        ID_org = request.POST['ID_org']
        ID_date = request.POST['ID_date']
        Place = request.POST['workplace']
        Position = request.POST['position']
        address = request.POST['address']

        new_user = User.objects.filter(username="parent_" + ID_number).first()
        if not new_user:
            new_user = User(username="parent_" + ID_number, first_name=First_Name)
            new_user.set_password("AIS@100")
            new_user.save()

        new_parent = Parent(user=new_user, First_Name=First_Name, Last_Name=Last_Name, Patronim=Patronim,
                    Phone=Phone, ID_number=ID_number, ID_org=ID_org, ID_date=ID_date,
                    Working_Place=Place, Position=Position, Address=address)
        new_parent.save()
        
        student.parent = new_parent
        student.save()
        return redirect('register_contract', std_id=std_id)            
    else:
        context = {
            'std_id': std_id,
        }
        return render(request, 'user_manager/parent.html', context)
   
@role_required(USER_TYPE_VNSV, USER_TYPE_CURATOR)
def card_parent(request, std_id):
    student = get_student_or_redirect(std_id)
    if (student.parent == None):
        messages.error(request, "Родителя нет в системе")
        return redirect('register_parent', std_id=std_id)
    parent = student.parent
    
    user_type = request.session.get('user_type')
    curator_grades = request.session.get('curator_grades')

    if user_type == USER_TYPE_CURATOR:
        if (not curator_can_access_student(student, curator_grades)):
            messages.error("Данный ученик не обучается в вашем классе")
            return redirect('home')
        
    if request.method == "POST":
        First_Name = request.POST['firstname']
        Last_Name = request.POST['lastname']                
        Patronim = request.POST['patronim']
        Phone = request.POST['phone']
        ID_number = request.POST['ID_number']
        ID_org = request.POST['ID_org']
        ID_date = request.POST['ID_date']
        Place = request.POST['workplace']
        Position = request.POST['position']
        address = request.POST['address']

        parent.First_Name = First_Name
        parent.Last_Name = Last_Name
        parent.Patronim = Patronim
        parent.Phone = Phone
        parent.ID_number = ID_number
        parent.ID_org = ID_org
        parent.ID_date = ID_date
        parent.Working_Place = Place
        parent.Position = Position
        parent.Address = address
        
        parent.save()

        messages.success(request, "Данные родителя изменены")
        return redirect('card_parent', std_id=std_id)
    else:
        parent_dict = model_to_dict(parent)  # Convert the Parent object to a dictionary
        parent_dict['ID_date'] = parent_dict['ID_date'].isoformat() #serialize date
        parent_json = json.dumps(parent_dict) # Serialize it to JSON
        context = {
            'parent': parent_json,
            'std_id': std_id,
        }
        return render(request, 'user_manager/parent.html', context)