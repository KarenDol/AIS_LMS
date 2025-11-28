from django.shortcuts import redirect
from .models import Student, Journal

def get_student_or_redirect(std_id):
    try:
        return Student.objects.get(id=std_id)
    except Student.DoesNotExist:
        return redirect('error', prev_page='home', error_code='Данного ученика нет в системе')
    
def get_journal_or_redirect(id):
    try:
        return Journal.objects.get(id=id)
    except Journal.DoesNotExist:
        return redirect('error', prev_page='home', error_code='Данной записи нет в системе')