from django.shortcuts import render, redirect
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.models import User
from django.contrib import messages
from django.core.files.storage import FileSystemStorage
from django.conf import settings
from django.forms.models import model_to_dict
from django.http import FileResponse, Http404
from .models import Student, Parent, Contract, List_Of_Students, LMS_User
from django.db import IntegrityError
import datetime
import requests
from .dogovor import fill_doc
from .const import Grades, Grades_dict, Grades_home, User_type_dict
import json
import os
from django.http import JsonResponse
import pandas as pd
from openpyxl import load_workbook
from openpyxl.styles import PatternFill, Font, Border, Side, Alignment

# Create your views here.
def home(request):
    if (not user_auth(request)):
        return redirect('logout')
    students = list(Student.objects.all()
                    .order_by('Last_Name', 'First_Name', 'Patronim')
                    .values('Last_Name', 'First_Name', 'Patronim', 'IIN', 'phone', 'grade', 'status'))
    students_json = json.dumps(students)
    Grades_dict_json = json.dumps(Grades_dict)

    #Populating context
    context = {
        'Grades': Grades_home, 
        'Grades_dict': Grades_dict_json, 
        'students': students_json,
    }

    return render(request, 'user_manager/home.html', context)

#Check if student exists or not    
def student_exist(IIN):
    try:
        student = Student.objects.get(IIN=IIN)
        return True
    except Student.DoesNotExist:
        return False

def parent_exist(IIN):
    if student_exist(IIN):
        student = Student.objects.get(IIN=IIN)
        parent = student.parent_1
        if parent:
            return True
        else:
            return False
    else:
        return False

def contract_exist(IIN):
    if parent_exist(IIN):
        student = Student.objects.get(IIN=IIN)
        contract = student.contract
        if contract:
            return True
        else:
            return False
    else:
        return False
    
#If user exists
def user_parent_exists(ID_number):
    try:
        user = User.objects.get(username="parent_"+ID_number)
        return True
    except:
        return False

def user_student_exist(IIN):
    try:
        user = User.objects.get(username=IIN)
        return True
    except:
        return False

#Fetch the name and the picture of the user for the index.html
def get_user_info(request):
    current_user = LMS_User.objects.get(user=request.user)
    user_info = {
        'name': current_user.name,  
        'picture': current_user.picture,
    }
    return JsonResponse(user_info)

#GET the static file
def serve_static(request, filename):
    file_path = os.path.join(settings.STATIC_ROOT, "user_manager", filename)

    if os.path.exists(file_path):
        return FileResponse(open(file_path, 'rb'))
    else:
        raise Http404("Avatar not found.")

def login_user(request):
    if request.user.is_authenticated:
        return redirect('home')
    else:
        if request.method == "POST":
            username = request.POST['username']
            password = request.POST['password']
            remember_me = request.POST.get('remember_me')
            user = authenticate(request, username=username, password=password)
            if user is not None:
                if remember_me:
                    request.session.set_expiry(1209600)  # 2 weeks in seconds
                else:
                    request.session.set_expiry(0)
                return redirect('home')
            else:
                messages.error(request, "Login failed. Please check your username and password.")
                return redirect('login_user')
        else:
            return render(request, 'user_manager/login.html')

def logout_user(request):
    logout(request)
    messages.success(request, "You have been logged out!")
    return redirect('user_manager/login_user')

def register_student(request):
    if (not user_auth(request)):
        return redirect('logout')
    
    current_user = LMS_User.objects.get(user=request.user)
    if current_user.user_type == 'ВнСв':
        if request.method == "POST":
            lastname = request.POST['lastname']
            firstname = request.POST['firstname']
            patronim = request.POST['patronim']
            IIN = request.POST['IIN']
            grade = Grades_dict[request.POST['grade']]
            nationality = request.POST['nationality']
            prev_school = request.POST['prev_school']                
            phone = request.POST['phone']
            comment = request.POST['comment']

            #Check if student already exists
            if student_exist(IIN):
                return redirect('error', error_code='Ученик c таким ИИН уже добавлен в систему')

            if user_student_exist(IIN):
                new_user = User.objects.get(username=IIN)
            else:
                new_user = User(username=IIN, first_name=firstname)
                new_user.set_password("AIS@100")
                new_user.save()
            new_student = Student(user=new_user, Last_Name=lastname, First_Name=firstname, Patronim=patronim, phone=phone,
                            IIN=IIN, prev_school=prev_school, grade=grade, nationality=nationality,
                            comment=comment)
            new_student.save()
            messages.success(request, "Новый ученик был добавлен в систему")
            return redirect('register_parent', IIN=new_student.IIN)
        else:
            context = {
                'Grades': Grades,
                'student': json.dumps(None), #Send empty student for JS 
            }
            return render(request, 'user_manager/student.html', context)
    else:
        messages.success(request, "Only ВнСв can add new students")
        return redirect('home')

def card_student(request, IIN):
    if (not user_auth(request)):
        return redirect('logout')
    if student_exist(IIN):
        student = Student.objects.get(IIN=IIN)
    else:
        return redirect('error', error_code='Ученика с таким ИИН нет в системе')
    current_user = LMS_User.objects.get(user=request.user)
    if current_user.user_type == 'ВнСв':
        if request.method == "POST":
            lastname = request.POST['lastname']
            firstname = request.POST['firstname']
            patronim = request.POST['patronim']
            grade = Grades_dict[request.POST['grade']]
            nationality = request.POST['nationality']
            prev_school = request.POST['prev_school']                
            phone = request.POST['phone']
            comment = request.POST['comment']

            student.Last_Name = lastname
            student.First_Name=firstname
            student.Patronim = patronim
            student.phone = phone
            student.prev_school = prev_school
            student.grade = grade
            student.nationality = nationality
            student.comment = comment

            student.save() 
            messages.success(request, "Данные ученика изменены")
            return redirect('card_student', IIN=IIN)
        else:
            student_dict = model_to_dict(student)  # Convert the Student object to a dictionary
            student_json = json.dumps(student_dict) # Serialize it to JSON
            context = {
                'Grades': Grades,
                'student': student_json,
            }
            return render(request, 'user_manager/student.html', context)
    else:
        messages.success(request, "Только зам по ВСиРШ можем менять карточку студента")
        return redirect('home')


def register_parent(request, IIN):
    if (not user_auth(request)):
        return redirect('logout')
    if student_exist(IIN):
        new_student = Student.objects.get(IIN=IIN)
    else:
        return redirect('error', error_code='Ученика с таким ИИН нет в системе')
    if parent_exist(IIN): #If parent already exists
        return redirect('error', error_code='Родитель данного ученика уже добавлен в систему')
    current_user = LMS_User.objects.get(user=request.user)
    if current_user.user_type == 'ВнСв':
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

            if user_parent_exists(ID_number):
                new_user = User.objects.get(username="parent_" + ID_number)
            else:
                new_user = User(username="parent_" + ID_number, first_name=First_Name)
                new_user.set_password("AIS@100")
                new_user.save()

            new_parent = Parent(user=new_user, First_Name=First_Name, Last_Name=Last_Name, Patronim=Patronim,
                        Phone=Phone, ID_number=ID_number, ID_org=ID_org, ID_date=ID_date,
                        Working_Place=Place, Position=Position, Address=address)
            new_parent.save()
            
            new_student.parent_1 = new_parent
            new_student.save()
            return redirect('register_contract', IIN=IIN)            
        else:
            context = {
                'IIN': IIN,
            }
            return render(request, 'user_manager/parent.html', context)
    else:
        messages.success(request, "Only ВнСв can add new students")
        return redirect('home')

def register_contract(request, IIN):
    if (not user_auth(request)):
        return redirect('logout')
    if student_exist(IIN):
        student = Student.objects.get(IIN=IIN)
    else:
        return redirect('error', error_code='Ученика с таким ИИН нет в системе')
    if not parent_exist(IIN):
        return redirect('error', "Сначала убедитесь, что студент и родитель добавлены в систему")
    current_user = LMS_User.objects.get(user=request.user)
    if contract_exist(IIN): #If contract already exists
        return redirect('error', error_code='Договор для данного ученика уже составлен')
    if current_user.user_type == 'ВнСв':
        if request.method == 'POST':
            date = str(datetime.datetime.now())
            numb = date[2:4] + date[5:7] + date[8:10] + date[11:13] + date[14:16] + date[17:19]
            sign_date = request.POST['sign_date']
            first_date = request.POST['first_date']
            last_date = request.POST['last_date']
            total = request.POST['total']
            discount = request.POST['discount']
            monthly = request.POST['monthly']
            join_fee = request.POST['join_fee']
            new_contract = Contract(numb=numb, sign_date=sign_date, first_date=first_date, last_date=last_date,
                                    total=total, discount=discount, monthly=monthly, join_fee=join_fee)
            new_contract.save()
            student.contract = new_contract
            student.status = 'Акт'
            student.save()
            # fill_doc(IIN) // Do not create the document unless required
            return redirect('home')
        else:
            context = {
                'IIN': IIN, 
                'today': str(datetime.date.today()),
            }
            return render(request, 'user_manager/contract.html', context)
    else:
        messages.success(request, "Only ВнСв can add new students")
        return redirect('home')       

def card_parent(request, IIN):
    if (not user_auth(request)):
        return redirect('logout')
    if parent_exist(IIN):
        student = Student.objects.get(IIN=IIN)
        parent = student.parent_1
    else:
        return redirect('error', error_code='Родителя нет в системе')
    current_user = LMS_User.objects.get(user=request.user)
    if current_user.user_type == 'ВнСв':
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
            return redirect('card_parent', IIN=IIN)
        else:
            parent_dict = model_to_dict(parent)  # Convert the Parent object to a dictionary
            parent_dict['ID_date'] = parent_dict['ID_date'].isoformat() #serialize date
            parent_json = json.dumps(parent_dict) # Serialize it to JSON
            context = {
                'parent': parent_json,
                'IIN': IIN,
            }
            return render(request, 'user_manager/parent.html', context)
    else:
        messages.success(request, "Только зам по ВСиРШ можем менять карточку студента")
        return redirect('home')

def card_contract(request, IIN):
    if (not user_auth(request)):
        return redirect('logout')
    if contract_exist(IIN):
        student = Student.objects.get(IIN=IIN)
        contract = student.contract
    else:
        return redirect('error', "Сначала убедитесь, что студент, родитель и договор добавлены в систему")
    current_user = LMS_User.objects.get(user=request.user)
    if current_user.user_type == 'ВнСв':
        if request.method == 'POST':
            sign_date = request.POST['sign_date']
            first_date = request.POST['first_date']
            last_date = request.POST['last_date']
            total = request.POST['total']
            discount = request.POST['discount']
            monthly = request.POST['monthly']
            join_fee = request.POST['join_fee']
            
            contract.sign_date = sign_date
            contract.first_date = first_date
            contract.last_date = last_date
            contract.total = total
            contract.discount = discount
            contract.monthly = monthly
            contract.join_fee = join_fee

            contract.save()
            return redirect('card_contract', IIN=IIN)
        else:
            contract_dict = model_to_dict(contract)  # Convert the Contract object to a dictionary
            print(contract_dict)
            #serialize dates
            contract_dict['sign_date'] = contract_dict['sign_date'].isoformat()
            contract_dict['first_date'] = contract_dict['first_date'].isoformat()
            contract_dict['last_date'] = contract_dict['last_date'].isoformat()
            contract_json = json.dumps(contract_dict) # Serialize it to JSON
            context = {
                'contract': contract_json,
                'IIN': IIN,
            }
            return render(request, 'user_manager/contract.html', context)
    else:
        messages.success(request, "Only ВнСв can add new students")
        return redirect('home')

def join_fee(request, IIN):
    if (not user_auth(request)):
        return redirect('logout')
    if contract_exist(IIN):
        student = Student.objects.get(IIN=IIN)
        contract = student.contract
    else:
        return redirect('error', "Сначала убедитесь, что студент, родитель и договор добавлены в систему")
    current_user = LMS_User.objects.get(user=request.user)
    if current_user.user_type == 'ВнСв':
        if (contract.join_fee_status):
            contract.join_fee_status = False
        else:
            contract.join_fee_status = True
        contract.save()
        return redirect('edit_contract', IIN=IIN)
    else:
        messages.success(request, "Only ВнСв can add new students")
        return redirect('home')   
    
def send_sms(phones, message):
    # API endpoint URL
    api_url = "https://smsc.kz/sys/send.php"

    # Construct the parameters
    params = {
        'login': 'aqbobek',
        'psw': 'kAREN_2001',
        'phones': phones,
        'mes': message,
    }

    try:
         # Make the HTTP request
        response = requests.get(api_url, params=params)
         # Check the response status code
        if response.status_code == 200:
            print(response.status_code)
            # SMS sent successfully
            print("SMS was sent succesfully")
            return True
        else:
            # Handle any errors
            print("SMS was not sent")
            return False

    except requests.RequestException as e:
        # Handle request exceptions
        print(f"Request error: {e}")

def sign_doc(request, IIN):
    if (not user_auth(request)):
        return redirect('logout')
    student = student_exist(IIN)
    contract = student.contract
    dogovor = os.path.join('docs', contract.template_location)
    folder_path = os.path.join(settings.STATIC_ROOT, 'docs')
    if request.method == "POST":
        for name, file in request.FILES.items():
            file = request.FILES.get(name)
            fs = FileSystemStorage(location=folder_path)
            fs.save(file.name, file)
            contract.signed_location = (file.name)
        contract.save()
        return redirect('home')
    else:
        context = {
            'contract': contract,
            'dogovor': dogovor,
            'IIN': IIN,
        }
        return render(request, 'user_manager/sign_doc.html', context)

def finance(request):
    if request.user.is_authenticated:
        try:
            admin = Admin.objects.get(user=request.user)
            my_list = Student.objects.order_by('Class', 'Last_Name', 'First_Name')
            my_list = list(my_list)
            n=int(datetime.datetime.now().strftime("%m"))
            return render(request, 'finance.html', {'role': 'curator', 'n': n, 'my_list': my_list})
        except Admin.DoesNotExist:
            student = Student.objects.get(user=request.user)
            return render(request, 'home.html', {'role': 'student', 'cur_user': student})
    else:
        messages.success(request, "Login in to access that page")
        return redirect('login_user')

def cash(request, entr_id):
    if request.user.is_authenticated:
        try:
            admin = Admin.objects.get(user=request.user)
            entry = List_Of_Students.objects.get(pk=entr_id)
            if request.method == 'POST':
                month = request.POST['month']
                payment = request.POST['payment']
                payment = int(payment)
                if month=='Сентябрь':
                    entry.Sep += payment
                elif month=='Октябрь':
                    entry.Oct += payment
                elif month == 'Ноябрь':
                    entry.Nov += payment
                elif month == 'Декабрь':
                    entry.Dec += payment
                elif month == 'Январь':
                    entry.Jan += payment
                elif month == 'Февраль':
                    entry.Feb += payment
                    entry.save()
                elif month == 'Март':
                    entry.Mar += payment
                    entry.save()
                elif month == 'Апрель':
                    entry.Apr += payment
                elif month == 'Май':
                    entry.May += payment
                entry.save()
                print(month, payment)
                return redirect('home')
            else:
                return render(request, 'cash.html', {'student': entry, 'entr_id':entr_id})
        except Admin.DoesNotExist:
            student = Student.objects.get(user=request.user)
            return render(request, 'home.html', {'role': 'student',
                                                 'cur_user': student})
    else:
        messages.success(request, "Login in to access that page")
        return redirect('login_user')

def user_settings(request):
    if request.user.is_authenticated:
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
                    folder_path = os.path.join(settings.STATIC_ROOT, 'avatars')

                    fs = FileSystemStorage(folder_path)
                    fs.save(new_avatar.name, new_avatar)


                    current_user.picture = os.path.join('avatars', new_avatar.name)
                
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
            user_dict['picture'] = 'user_manager/' + user_dict['picture']
            return render(request, 'user_manager/user_settings.html', {'user_dict': user_dict})
    else:
        return redirect('login')
    
def error(request, error_code):
    return render(request, 'user_manager/404.html', {'error_code': error_code})

def user_auth(request):
    if request.user.is_authenticated:
        try:
            current_user = LMS_User.objects.get(user=request.user)
            return True
        except LMS_User.DoesNotExist:
            messages.error(request, "User is not LMS User")
            return False
    else:
        messages.error(request, "Login to access that page")
        return False
    
def export(request, grade):
    if (not user_auth(request)):
        return redirect('logout')
    
    current_user = LMS_User.objects.get(user=request.user)

    if current_user.user_type == 'ВнСв':
        if grade == "Все классы":
            students = list(Student.objects.select_related("parent_1", "contract")
                            .filter(status="Акт")
                            .order_by('grade', 'Last_Name', 'First_Name', 'Patronim')
                            .values('Last_Name', 'First_Name', 'Patronim', 'IIN', 'grade', 
                                    'parent_1__Last_Name', 'parent_1__First_Name', 'parent_1__Patronim',
                                    'parent_1__Phone', 'parent_1__Address', 'contract__monthly'))
        else:
            students = list(Student.objects.select_related("parent_1", "contract")
                            .filter(status="Акт", grade=Grades_dict[grade])
                            .order_by('Last_Name', 'First_Name', 'Patronim')
                            .values('Last_Name', 'First_Name', 'Patronim', 'IIN', 'grade', 
                                    'parent_1__Last_Name', 'parent_1__First_Name', 'parent_1__Patronim',
                                    'parent_1__Phone', 'parent_1__Address', 'contract__monthly'))
            
        # Convert the list of dictionaries to a DataFrame
        df = pd.DataFrame(students)

        df['ФИО Ученика'] = df['Last_Name'] + ' ' + df['First_Name'] + ' ' + df['Patronim']
        df['ФИО Родителя'] = df['parent_1__Last_Name'] + ' ' + df['parent_1__First_Name'] + ' ' + df['parent_1__Patronim']

        # Rename columns
        df = df.rename(columns={
            'IIN': 'ИИН',
            'parent_1__Phone': 'Номер',
            'parent_1__Address': 'Адрес',
            'contract__monthly': 'Оплата',
            'grade': 'Класс',
        })

        #Reorder the columns
        if grade == "Все классы":
            df = df[['ФИО Ученика', 'ИИН', 'ФИО Родителя', 'Номер', 'Адрес', 'Оплата', 'Класс']]
        else:
            df = df[['ФИО Ученика', 'ИИН', 'ФИО Родителя', 'Номер', 'Адрес', 'Оплата']]

        # Add index column
        df.insert(0, '#', range(1, len(df) + 1))
        # Ensure the index reflects this column visually
        df = df.set_index('#')

        # Save the DataFrame to an Excel file
        doc_location = os.path.join(settings.STATIC_ROOT, "user_manager", 'students.xlsx')
        df.to_excel(doc_location, index=True, sheet_name=grade)

        # Load the Excel file using openpyxl
        workbook = load_workbook(doc_location)
        sheet = workbook.active

        # Define a fill style for the header
        header_fill = PatternFill(start_color="59007A", end_color="59007A", fill_type="solid")  # Yellow color
        # Define a font style for the header (white text)
        header_font = Font(color="FFFFFF", bold=True)  # White color, bold
        # Define a border style
        thin_border = Border(
            left=Side(border_style="thin", color="000000"),
            right=Side(border_style="thin", color="000000"),
            top=Side(border_style="thin", color="000000"),
            bottom=Side(border_style="thin", color="000000")
        )

        # Apply the fill style to the header row
        for cell in sheet[1]:  # Header is the first row
            cell.fill = header_fill
            cell.font = header_font

        # Apply borders to all cells
        for row in sheet.iter_rows(min_row=1, max_row=sheet.max_row, min_col=1, max_col=sheet.max_column):
            for cell in row:
                cell.border = thin_border  # Apply border to every cell

        # Adjust the width of specific columns
        sheet.column_dimensions['A'].width = 3
        sheet.column_dimensions['B'].width = 40   
        sheet.column_dimensions['C'].width = 12  
        sheet.column_dimensions['D'].width = 40 
        sheet.column_dimensions['E'].width = 15
        sheet.column_dimensions['F'].width = 40
        sheet.column_dimensions['G'].width = 10
        sheet.column_dimensions['H'].width = 5    

        # Add info about the class
        sheet['F'+str(len(df)+4)] = grade + ' - ' + str(len(df)) + ' ' + 'учеников'
        sheet['F'+str(len(df)+4)].font = Font(bold=True)
        sheet['F'+str(len(df)+4)].alignment = Alignment(horizontal="right")

        # Save the styled Excel file
        workbook.save(doc_location)
        return FileResponse(open(doc_location, 'rb'))
    else:
        return redirect('error', "Войдите в систему как зам по ВСиРШ")