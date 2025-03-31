from .models import Student, Parent, Contract
from django.http import FileResponse
from docxtpl import DocxTemplate
from django.conf import settings
import os
from datetime import datetime

def fill_doc(IIN):
    student = Student.objects.get(IIN=IIN)
    parent = student.parent_1
    contract = student.contract
    template_location = os.path.join(settings.STATIC_ROOT, 'user_manager', 'docs', 'template.docx')
    document = DocxTemplate(template_location)
    context = {
        'doc_number': contract.numb,
        'day': contract.sign_date.day,
        'month_ru': month_ru(contract.sign_date.month),
        'month_kz': month_kz(contract.sign_date.month),
        'year': contract.sign_date.year,
        'f_day': contract.first_date.day,
        'f_month_ru': month_ru(contract.first_date.month),
        'f_month_kz': month_kz(contract.first_date.month),
        'f_year': contract.first_date.year,
        'l_day': contract.last_date.day,
        'l_month_ru': month_ru(contract.last_date.month),
        'l_month_kz': month_kz(contract.last_date.month),
        'l_year': contract.last_date.year,
        'birthdate': IIN[4:6] + '/' + IIN[2:4] + '/' + "20" + IIN[:2],
        'grade': student.grade_num,
        'IIN': student.IIN,
        'parent_name': parent.First_Name + ' ' + parent.Last_Name,
        'child_name': student.First_Name + ' ' + student.Last_Name,
        'total_payment': contract.total,
        'discount_payment': contract.discount,
        'monthly_payment': contract.monthly,
        'join_fee': contract.join_fee,
        'address': parent.Address,
        'phone_num': parent.Phone,
        'work_place': parent.Working_Place,
        'position': parent.Position,
        'ID_num': parent.ID_number,
        }
    document.render(context)
    docs_location = os.path.join(settings.STATIC_ROOT, 'user_manager', 'docs', 'dogovor' + str(contract.numb) + '.docx')
    document.save(docs_location)

def fill_join(IIN):
    student = Student.objects.get(IIN=IIN)
    template_location = os.path.join(settings.STATIC_ROOT, 'user_manager', 'docs', 'Прикрепительный талон.docx')
    document = DocxTemplate(template_location)
    context = {
        "Last_Name": student.Last_Name,
        "First_Name": student.First_Name,
        "Patronim": student.Patronim,
        "birthdate": IIN[4:6] + '/' + IIN[2:4] + '/' + "20" + IIN[:2],
        "grade": student.grade_num,
        "lang": lang(student.lang),
        "prev_school": student.prev_school,
        "today": datetime.today().strftime("%d/%m/%Y"),
    }
    document.render(context)
    docs_location = os.path.join(settings.STATIC_ROOT, 'user_manager', 'docs', 'join' + IIN + '.docx')
    document.save(docs_location)

def fill_leave(IIN):
    student = Student.objects.get(IIN=IIN)
    template_location = os.path.join(settings.STATIC_ROOT, 'user_manager', 'docs', 'Открепительный талон.docx')
    document = DocxTemplate(template_location)
    context = {
        "Last_Name": student.Last_Name,
        "First_Name": student.First_Name,
        "Patronim": student.Patronim,
        "birthdate": "20" + IIN[:2] + '/' + IIN[2:4] + '/' + IIN[4:6],
        "grade": student.grade_num,
        "lang": lang(student.lang),
        "today": datetime.today().strftime("%d/%m/%Y"),
    }
    document.render(context)
    docs_location = os.path.join(settings.STATIC_ROOT, 'user_manager', 'docs', 'leave' + IIN + '.docx')
    document.save(docs_location)

def fill_spravka(IIN, id):
    student = Student.objects.get(IIN=IIN)
    template_location = os.path.join(settings.STATIC_ROOT, 'user_manager', 'docs', 'Справка.docx')
    document = DocxTemplate(template_location)
    context = {
        "doc_id": f"c{id}-25",
        "dd": datetime.today().strftime("%d"),
        "mm": month_ru(int(datetime.today().strftime("%m"))),
        "yyyy": datetime.today().strftime("%Y"),
        "student_name": f"{student.Last_Name} {student.First_Name} {student.Patronim}",
        "student_year": "20" + student.IIN[:2],
        "gr_num": student.grade_num,
        "gr_let": student.grade_let,
    }
    document.render(context)
    docs_location = os.path.join(settings.STATIC_ROOT, 'user_manager', 'docs', 'spravka' + IIN + '.docx')
    document.save(docs_location)
    

def month_ru(month):
    if month<7:
        if month<4:
            if month==1:
                return 'января'
            elif month==2:
                return 'февраля'
            else:
                return "марта"
        else:
            if month==4:
                return "апреля"
            elif month==5:
                return "мая"
            else:
                return "июня"
    else:
        if month<10:
            if month==7:
                return "июля"
            elif month==8:
                return "августа"
            else:
                return "сентября"
        else:
            if month==10:
                return "октября"
            elif month==11:
                return "ноября"
            else:
                return "декабря"

def month_kz(month):
    if month<7:
        if month<4:
            if month==1:
                return 'қантар'
            elif month==2:
                return 'ақпан'
            else:
                return "наурыз"
        else:
            if month==4:
                return "сәуір"
            elif month==5:
                return "мамыр"
            else:
                return "маусым"
    else:
        if month<10:
            if month==7:
                return "шілде"
            elif month==8:
                return "тамыз"
            else:
                return "қыркүйек"
        else:
            if month==10:
                return "қазан"
            elif month==11:
                return "қараша"
            else:
                return "желтоқсан"

def lang(language):
    if language == 'Рус':
        return "Орыс"
    else:
        return "Қазақ"