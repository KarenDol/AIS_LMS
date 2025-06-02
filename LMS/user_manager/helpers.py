from django.shortcuts import redirect
from .models import Student, Journal

def get_student_or_redirect(IIN):
    try:
        return Student.objects.get(IIN=IIN)
    except Student.DoesNotExist:
        return redirect('error', prev_page='home', error_code='Ученика с таким ИИН нет в системе')
    
def get_journal_or_redirect(id):
    try:
        return Journal.objects.get(id=id)
    except Journal.DoesNotExist:
        return redirect('error', prev_page='home', error_code='Данного достижения нет в системе')