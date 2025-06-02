from django.http import FileResponse, Http404, HttpResponse, JsonResponse
from django.shortcuts import render, redirect
from .models import Journal
from django.contrib import messages
from .decorators import role_required
from .const import *
from .helpers import get_student_or_redirect, get_journal_or_redirect
from .views_curator import *
from datetime import datetime
import json

# @role_required(USER_TYPE_VNSV, USER_TYPE_CURATOR)
# def journals(request, IIN):
#     student = get_student_or_redirect(IIN)
#     if isinstance(student, redirect.__class__):  # If redirection is returned
#         return student
        
#     user_type = request.session.get('user_type')
#     curator_grades = request.session.get('curator_grades')

#     if user_type == USER_TYPE_CURATOR:
#         if (not curator_can_access_student(student, curator_grades)):
#             messages.error("Данный ученик не обучается в вашем классе")
#             return redirect('home')

#     if request.method == "POST":
#         title = request.POST['title']
#         description = request.POST['description']
#         date = request.POST['date']
#         date = f"{date}-01"
#         date = datetime.strptime(date, "%Y-%m-%d").date()
#         journal = Journal(student=student, title=title, description=description, date=date)
#         journal.save()
#         return redirect('journals', IIN=IIN)
#     else:
#         journals = list(Journal.objects.filter(student=student)
#                     .order_by('date'))
#         # Convert each honor's date to the desired format (e.g., "YYYY-MM")
#        journals_serializable = [
#             {
#                 "id": journal.pk,
#                 "title": journal.title,
#                 "date": honor.date.strftime("%Y-%m"),  # Format the date
#                 "description": honor.description,
#             }
#             for honor in honors
#         ]
#         honors_json = json.dumps(honors_serializable)
#         context={
#             'IIN': IIN,
#             'honors': honors_json,
#         }
#         return render(request, 'user_manager/honors.html', context)
    
# @role_required(USER_TYPE_VNSV, USER_TYPE_CURATOR)
# def delete_honor(request, id):
#     honor = get_honor_or_redirect(id)
#     if isinstance(honor, redirect.__class__):
#         return honor
    
#     if request.method == "POST":
#         honor.delete()
#         return JsonResponse({"success": True, "message": "Journal entry deleted successfully."})
#     else:
#         return HttpResponse(status=405)  # Method Not Allowed for non-POST requests

# @role_required(USER_TYPE_VNSV, USER_TYPE_CURATOR)
# def edit_honor(request, id):
#     honor = get_honor_or_redirect(id)
#     if isinstance(honor, redirect.__class__):
#         return honor
    
#     if request.method == "POST":
#         title = request.POST['title']
#         description = request.POST['description']
#         date = request.POST['date']
#         date = f"{date}-01"
#         date = datetime.strptime(date, "%Y-%m-%d").date()

#         honor.title = title
#         honor.description = description
#         honor.date = date

#         honor.save()

#         IIN = honor.student.IIN
#         messages.success(request, "Изменения успешно сохранены")
#         return redirect('honors', IIN=IIN)
#     else:
#         return redirect('error', prev_page='home', error_code='Non Post is not required for this url')

@role_required(USER_TYPE_VNSV, USER_TYPE_CURATOR)
def journals(request, IIN):
    student = get_student_or_redirect(IIN)
    if isinstance(student, redirect.__class__):  # If redirection is returned
        return student

    user_type = request.session.get('user_type')
    curator_grades = request.session.get('curator_grades')

    if user_type == USER_TYPE_CURATOR:
        if not curator_can_access_student(student, curator_grades):
            messages.error(request, "Данный ученик не обучается в вашем классе")
            return redirect('home')

    if request.method == "POST":
        title = request.POST['title']
        description = request.POST['description']
        date = request.POST['date']
        date = f"{date}-01"
        date = datetime.strptime(date, "%Y-%m-%d").date()
        journal = Journal(student=student, title=title, description=description, date=date)
        journal.save()
        return redirect('journals', IIN=IIN)
    else:
        journals = list(Journal.objects.filter(student=student).order_by('date'))
        journals_serializable = [
            {
                "id": journal.pk,
                "title": journal.title,
                "date": journal.date.strftime("%Y-%m"),
                "description": journal.description,
            }
            for journal in journals
        ]
        journals_json = json.dumps(journals_serializable)
        context = {
            'IIN': IIN,
            'journals': journals_json,
        }
        return render(request, 'user_manager/journals.html', context)

@role_required(USER_TYPE_VNSV, USER_TYPE_CURATOR)
def delete_journal(request, IIN):
    journal = get_journal_or_redirect(IIN)
    if isinstance(journal, redirect.__class__):
        return journal

    if request.method == "POST":
        journal.delete()
        return JsonResponse({"success": True, "message": "Journal deleted successfully."})
    else:
        return HttpResponse(status=405)  # Method Not Allowed for non-POST requests

@role_required(USER_TYPE_VNSV, USER_TYPE_CURATOR)
def edit_journal(request, id):
    journal = get_journal_or_redirect(id)
    if isinstance(journal, redirect.__class__):
        return journal

    if request.method == "POST":
        title = request.POST['title']
        description = request.POST['description']
        date = request.POST['date']
        date = f"{date}-01"
        date = datetime.strptime(date, "%Y-%m-%d").date()

        journal.title = title
        journal.description = description
        journal.date = date

        journal.save()
        IIN = journal.student.IIN

        messages.success(request, "Изменения успешно сохранены")
        return redirect('journals', IIN=IIN)
    else:
        return redirect('error', prev_page='home', error_code='Non Post is not required for this url')