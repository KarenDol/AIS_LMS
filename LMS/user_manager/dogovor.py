from .models import Student, Parent, Contract
from docxtpl import DocxTemplate
import subprocess
from django.conf import settings
import os

def fill_doc(IIN):
    student = Student.objects.get(IIN=IIN)
    parent = student.parent_1
    contract = student.contract
    template_location = os.path.join(settings.STATIC_ROOT, 'docs', 'template.docx')
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
        'birthdate': student.birthdate,
        'grade': student.grade,
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
    docs_location = os.path.join(settings.STATIC_ROOT, 'docs', 'dogovor' + str(contract.numb) + '.docx')
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
